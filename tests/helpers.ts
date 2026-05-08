import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export type JobSeed = {
  title: string;
  region: string;
  job_type: string;
  required_career: number;
};

/**
 * matches → seniors → jobs 순으로 전부 삭제 후 지정된 공고만 삽입.
 * FK 제약 순서에 맞게 삭제한다.
 */
export async function resetDb(jobs: JobSeed[] = []) {
  await supabase.from('matches').delete().not('id', 'is', null);
  await supabase.from('seniors').delete().not('id', 'is', null);
  await supabase.from('jobs').delete().not('id', 'is', null);

  if (jobs.length > 0) {
    const { error } = await supabase.from('jobs').insert(jobs);
    if (error) throw new Error(`resetDb insert 실패: ${error.message}`);
  }
}

export async function getSeniorByName(name: string) {
  const { data } = await supabase
    .from('seniors')
    .select('id')
    .eq('name', name)
    .maybeSingle();
  return data as { id: string } | null;
}

export async function getMatchesBySeniorId(seniorId: string) {
  const { data } = await supabase
    .from('matches')
    .select('id, score')
    .eq('senior_id', seniorId);
  return (data ?? []) as { id: string; score: number }[];
}
