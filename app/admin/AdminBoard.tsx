'use client';

import { useTransition } from 'react';
import { updateMatchStatus } from '@/app/actions';
import type { MatchStatus } from '@/lib/types';

type MatchRow = {
  id: string;
  score: number;
  status: string;
  seniors: { name: string; region: string; desired_job: string };
  jobs: { title: string; region: string };
};

type SeniorRow = {
  id: string;
  name: string;
  region: string;
  desired_job: string;
};

export default function AdminBoard({
  unmatched,
  pending,
  assigned,
}: {
  unmatched: SeniorRow[];
  pending: MatchRow[];
  assigned: MatchRow[];
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Column
        label="미매칭"
        count={unmatched.length}
        border="border-red-300"
        header="bg-red-100 text-red-700"
        body="bg-red-50"
      >
        {unmatched.length === 0 ? (
          <Empty text="미매칭 시니어 없음" />
        ) : (
          unmatched.map((s) => (
            <div key={s.id} className="bg-white border border-red-200 rounded-xl px-4 py-3">
              <p className="text-xl font-bold text-gray-800">{s.name}</p>
              <p className="text-lg text-gray-500">{s.region} · {s.desired_job}</p>
            </div>
          ))
        )}
      </Column>

      <Column
        label="매칭 대기"
        count={pending.length}
        border="border-yellow-300"
        header="bg-yellow-100 text-yellow-700"
        body="bg-yellow-50"
      >
        {pending.length === 0 ? (
          <Empty text="대기 중인 매칭 없음" />
        ) : (
          pending.map((m) => (
            <MatchCard key={m.id} match={m} nextStatus="assigned" nextLabel="배정 확정 →" />
          ))
        )}
      </Column>

      <Column
        label="배정 완료"
        count={assigned.length}
        border="border-green-300"
        header="bg-green-100 text-green-700"
        body="bg-green-50"
      >
        {assigned.length === 0 ? (
          <Empty text="배정 완료된 매칭 없음" />
        ) : (
          assigned.map((m) => (
            <MatchCard key={m.id} match={m} nextStatus="pending" nextLabel="← 대기로" />
          ))
        )}
      </Column>
    </div>
  );
}

function Column({
  label, count, border, header, body, children,
}: {
  label: string; count: number; border: string; header: string; body: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`border-2 rounded-2xl overflow-hidden ${border}`}>
      <div className={`px-5 py-3 flex items-center justify-between font-bold text-xl ${header}`}>
        <span>{label}</span>
        <span className="text-lg font-semibold opacity-70">{count}건</span>
      </div>
      <div className={`flex flex-col gap-3 p-4 min-h-[160px] ${body}`}>
        {children}
      </div>
    </div>
  );
}

function MatchCard({
  match, nextStatus, nextLabel,
}: {
  match: MatchRow; nextStatus: MatchStatus; nextLabel: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
      <p className="text-xl font-bold text-gray-800">{match.seniors.name}</p>
      <p className="text-lg text-gray-500">{match.seniors.region} · {match.seniors.desired_job}</p>
      <p className="text-lg text-gray-700 mt-1">
        ↔ {match.jobs.title}
        <span className="text-gray-400 ml-1">({match.jobs.region})</span>
      </p>
      <div className="flex items-center justify-between mt-3">
        <span className="text-lg font-bold text-blue-700">{match.score}점</span>
        <button
          disabled={isPending}
          onClick={() => startTransition(() => updateMatchStatus(match.id, nextStatus))}
          className="text-base bg-gray-100 hover:bg-blue-600 hover:text-white px-3 py-1.5 rounded-lg text-gray-700 transition-colors disabled:opacity-40"
        >
          {isPending ? '처리 중…' : nextLabel}
        </button>
      </div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="text-lg text-gray-400 text-center py-4">{text}</p>;
}
