import { supabase } from '@/lib/supabase';
import AdminBoard from './AdminBoard';

export const dynamic = 'force-dynamic';

async function getAdminData() {
  const [{ data: allSeniors }, { data: matches }, { data: allMatchIds }] = await Promise.all([
    supabase.from('seniors').select('id, name, region, desired_job'),
    supabase
      .from('matches')
      .select('id, score, status, senior_id, seniors(name, region, desired_job), jobs(title, region)')
      .in('status', ['pending', 'assigned'])
      .order('score', { ascending: false }),
    supabase.from('matches').select('senior_id'),
  ]);

  const matchedIds = new Set((allMatchIds ?? []).map((m: { senior_id: string }) => m.senior_id));
  const unmatched = (allSeniors ?? []).filter((s: { id: string }) => !matchedIds.has(s.id));
  const pending  = (matches ?? []).filter((m: { status: string }) => m.status === 'pending');
  const assigned = (matches ?? []).filter((m: { status: string }) => m.status === 'assigned');

  return { unmatched, pending, assigned };
}

export default async function AdminPage() {
  const { unmatched, pending, assigned } = await getAdminData();

  return (
    <div>
      <h1 className="text-4xl font-bold text-gray-900 mb-2">담당자 대시보드</h1>
      <p className="text-xl text-gray-500 mb-10">매칭 현황을 확인하고 관리합니다.</p>

      <div className="grid grid-cols-3 gap-6 mb-10">
        <SummaryCard label="미매칭"   count={unmatched.length} color="text-red-600" />
        <SummaryCard label="매칭 대기" count={pending.length}  color="text-yellow-600" />
        <SummaryCard label="배정 완료" count={assigned.length} color="text-green-600" />
      </div>

      <AdminBoard
        unmatched={unmatched as never}
        pending={pending as never}
        assigned={assigned as never}
      />
    </div>
  );
}

function SummaryCard({
  label, count, color,
}: {
  label: string; count: number; color: string;
}) {
  return (
    <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 text-center shadow-sm">
      <p className={`text-5xl font-extrabold ${color}`}>{count}</p>
      <p className="text-xl text-gray-500 mt-2">{label}</p>
    </div>
  );
}
