import type React from 'react';
import { supabase } from '@/lib/supabase';
import AdminBoard from './AdminBoard';

export const dynamic = 'force-dynamic';

async function getAdminData() {
  const [{ data: allSeniors }, { data: matches }, { data: allMatchIds }] = await Promise.all([
    supabase.from('seniors').select('id, name, region, desired_job'),
    supabase
      .from('matches')
      .select('id, score, status, senior_id, seniors(name, region, desired_job), jobs(title, region)')
      .in('status', ['pending', 'assigned', 'rejected'])
      .order('score', { ascending: false }),
    supabase.from('matches').select('senior_id'),
  ]);

  const matchedIds = new Set((allMatchIds ?? []).map((m: { senior_id: string }) => m.senior_id));
  const unmatched = ((allSeniors ?? []) as unknown[]).filter((s) => !matchedIds.has((s as { id: string }).id));
  const pending  = ((matches ?? []) as unknown[]).filter((m) => (m as { status: string }).status === 'pending');
  const assigned = ((matches ?? []) as unknown[]).filter((m) => (m as { status: string }).status === 'assigned');
  const rejected = ((matches ?? []) as unknown[]).filter((m) => (m as { status: string }).status === 'rejected');

  return { unmatched, pending, assigned, rejected };
}

export default async function AdminPage() {
  const { unmatched, pending, assigned, rejected } = await getAdminData();

  return (
    <div>
      <h1 className="text-4xl font-bold text-gray-900 mb-2">담당자 대시보드</h1>
      <p className="text-xl text-gray-500 mb-10">매칭 현황을 확인하고 관리합니다.</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <SummaryCard label="미매칭"   count={unmatched.length} color="text-red-600"
          icon={<IconWarning />} />
        <SummaryCard label="매칭 대기" count={pending.length}  color="text-yellow-600"
          icon={<IconClock />} />
        <SummaryCard label="배정 완료" count={assigned.length} color="text-green-600"
          icon={<IconCheck />} />
        <SummaryCard label="거절됨"   count={rejected.length} color="text-gray-500"
          icon={<IconX />} />
      </div>

      <AdminBoard
        unmatched={unmatched as never}
        pending={pending as never}
        assigned={assigned as never}
        rejected={rejected as never}
      />
    </div>
  );
}

function SummaryCard({
  label, count, color, icon,
}: {
  label: string; count: number; color: string; icon: React.ReactNode;
}) {
  return (
    <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 text-center shadow-sm">
      <div className="flex justify-center mb-2">{icon}</div>
      <p className={`text-5xl font-extrabold ${color}`}>{count}</p>
      <p className="text-xl text-gray-500 mt-2">{label}</p>
    </div>
  );
}

function IconWarning() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  );
}

function IconClock() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ca8a04" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  );
}

function IconX() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
    </svg>
  );
}
