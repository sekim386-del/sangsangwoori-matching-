'use server';

import { revalidatePath } from 'next/cache';
import { supabase } from '@/lib/supabase';
import { calculateScore } from '@/lib/matching';
import type { Senior, Job, MatchStatus } from '@/lib/types';

export type RegisterState = { error?: string; success?: boolean; seniorId?: string };

export async function registerSenior(
  _prev: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const name = (formData.get('name') as string)?.trim();
  const region = formData.get('region') as string;
  const desired_job = formData.get('desired_job') as string;
  const career_years = parseInt(formData.get('career_years') as string, 10);

  if (!name || !region || !desired_job || isNaN(career_years)) {
    return { error: '모든 항목을 입력해 주세요.' };
  }

  const { data: senior, error: seniorError } = await supabase
    .from('seniors')
    .insert({ name, region, desired_job, career_years })
    .select()
    .single();

  if (seniorError || !senior) {
    return { error: '등록 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.' };
  }

  const { data: jobs } = await supabase.from('jobs').select('*');

  if (jobs && jobs.length > 0) {
    const toInsert = (jobs as Job[])
      .map((job) => ({
        senior_id: senior.id,
        job_id: job.id,
        score: calculateScore(senior as Senior, job),
        status: 'pending' as MatchStatus,
      }))
      .filter((m) => m.score >= 50); // 지역 또는 직종 중 최소 하나 일치해야 의미 있는 추천

    if (toInsert.length > 0) {
      await supabase.from('matches').insert(toInsert);
    }
  }

  revalidatePath('/recommendations');
  return { success: true, seniorId: senior.id };
}

export async function updateMatchStatus(matchId: string, status: MatchStatus) {
  await supabase.from('matches').update({ status }).eq('id', matchId);
  revalidatePath('/admin');
}
