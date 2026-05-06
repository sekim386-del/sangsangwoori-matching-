'use client';

import { useActionState } from 'react';
import { registerSenior } from '@/app/actions';
import type { RegisterState } from '@/app/actions';

const REGIONS = ['서울', '부산', '인천', '대구', '광주', '대전', '수원', '성남'];
const JOB_TYPES = ['경비', '청소', '배달', '주차관리', '사무보조', '판매도우미', '시설관리'];

const inputCls =
  'border-2 border-gray-300 rounded-xl px-5 py-4 text-2xl w-full focus:border-blue-600 focus:outline-none transition-colors';
const labelCls = 'text-2xl font-semibold text-gray-800';

export default function RegisterForm() {
  const [state, formAction, isPending] = useActionState<RegisterState, FormData>(
    registerSenior,
    {},
  );

  return (
    <form action={formAction} className="flex flex-col gap-8">
      {state?.error && (
        <div className="bg-red-50 border-2 border-red-400 text-red-700 rounded-xl px-5 py-4 text-xl font-semibold">
          {state.error}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label htmlFor="name" className={labelCls}>이름</label>
        <input
          id="name" name="name" type="text" required
          placeholder="홍길동"
          className={inputCls}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="region" className={labelCls}>지역</label>
        <select id="region" name="region" required className={inputCls}>
          <option value="">지역을 선택하세요</option>
          {REGIONS.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="desired_job" className={labelCls}>희망 직종</label>
        <select id="desired_job" name="desired_job" required className={inputCls}>
          <option value="">직종을 선택하세요</option>
          {JOB_TYPES.map((j) => (
            <option key={j} value={j}>{j}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="career_years" className={labelCls}>경력 (년)</label>
        <input
          id="career_years" name="career_years" type="number"
          min={0} defaultValue={0} required
          className={inputCls}
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="mt-4 bg-blue-700 text-white text-2xl font-bold py-5 rounded-2xl hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? '매칭 중…' : '등록하고 매칭받기'}
      </button>
    </form>
  );
}
