import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

async function getMatches(seniorId?: string) {
  let query = supabase
    .from('matches')
    .select(`
      id, score, status, senior_id,
      seniors ( name, region, desired_job ),
      jobs    ( title, region, job_type )
    `)
    .gt('score', 0)
    .order('score', { ascending: false });

  if (seniorId) {
    query = query.eq('senior_id', seniorId);
  }

  const { data, error } = await query;
  if (error) console.error(error);
  return (data ?? []) as unknown as MatchRow[];
}

type MatchRow = {
  id: string;
  score: number;
  status: string;
  senior_id: string;
  seniors: { name: string; region: string; desired_job: string };
  jobs: { title: string; region: string; job_type: string };
};

function scoreBadgeTier(score: number): 'gold' | 'blue' | 'gray' {
  if (score >= 90) return 'gold';
  if (score >= 60) return 'blue';
  return 'gray';
}

function scoreBadgeCls(tier: 'gold' | 'blue' | 'gray') {
  if (tier === 'gold') return 'text-amber-700 bg-amber-50 border-amber-400';
  if (tier === 'blue') return 'text-blue-700 bg-blue-100 border-blue-300';
  return 'text-gray-600 bg-gray-100 border-gray-300';
}

const STATUS_LABEL: Record<string, string> = {
  pending:  '매칭 대기',
  assigned: '배정 완료',
  rejected: '거절됨',
};

export default async function RecommendationsPage({
  searchParams,
}: {
  searchParams: Promise<{ senior_id?: string }>;
}) {
  const { senior_id } = await searchParams;
  const matches = await getMatches(senior_id);

  return (
    <div>
      <div className="flex items-end justify-between mb-2">
        <h1 className="text-4xl font-bold text-gray-900">자동 매칭 추천 목록</h1>
        <span className="text-xl text-gray-400">총 {matches.length}건</span>
      </div>
      <p className="text-xl text-gray-500 mb-10">매칭 점수 높은 순으로 표시됩니다.</p>

      {matches.length === 0 ? (
        <div data-testid="no-match" className="text-center py-20 flex flex-col items-center gap-6">
          <p className="text-2xl text-gray-400">현재 매칭되는 일자리가 없습니다</p>
          <Link
            href="/register"
            className="bg-blue-700 text-white text-2xl font-semibold py-4 px-10 rounded-2xl hover:bg-blue-800 transition-colors"
          >
            프로필 등록하러 가기
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-5">
          {matches.map((m) => {
            const tier = scoreBadgeTier(m.score);
            return (
              <li
                key={m.id}
                data-testid="match-card"
                className="bg-white border-2 border-gray-200 rounded-2xl p-6 flex items-center justify-between shadow-sm hover:border-blue-300 transition-colors"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-2xl font-bold text-gray-900">{m.seniors.name}</span>
                  <span className="text-xl text-gray-500">
                    {m.seniors.region} · {m.seniors.desired_job}
                  </span>
                  <span className="text-xl font-medium text-gray-700 mt-1">
                    ↔&nbsp;
                    <span className="text-blue-700">{m.jobs.title}</span>
                    <span className="text-gray-400 ml-2 text-lg">({m.jobs.region})</span>
                  </span>
                  <span className="text-base text-gray-400 mt-1">
                    상태: {STATUS_LABEL[m.status] ?? m.status}
                  </span>
                </div>

                <div
                  data-testid="score-badge"
                  data-tier={tier}
                  className={`flex flex-col items-center gap-1 min-w-[96px] border-2 rounded-xl px-4 py-2 ${scoreBadgeCls(tier)}`}
                >
                  <span className="text-4xl font-extrabold leading-none">{m.score}</span>
                  <span className="text-base font-normal">점</span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
