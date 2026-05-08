import type { Senior, Job } from './types';

// 비교 시에만 사용 — 원본 데이터 수정 없음
const REGION_MAP: Record<string, string> = {
  '서울특별시': '서울',
  '경기도':     '경기',
  '인천광역시': '인천',
};

const JOB_MAP: Record<string, string> = {
  '경비직': '경비',
  '청소직': '청소',
  '조리직': '조리',
  '돌봄직': '돌봄',
};

export function normalizeRegion(r: string): string {
  return REGION_MAP[r] ?? r;
}

export function normalizeJob(j: string): string {
  return JOB_MAP[j] ?? j;
}

/**
 * 규칙 기반 매칭 점수 계산 (최대 100점)
 * - 지역 일치  : +50점  (정규화 후 비교)
 * - 직종 일치  : +40점  (정규화 후 비교)
 * - 경력 충족  : +10점  (career_years >= required_career)
 */
export function calculateScore(senior: Senior, job: Job): number {
  let score = 0;
  if (normalizeRegion(senior.region) === normalizeRegion(job.region)) score += 50;
  if (normalizeJob(senior.desired_job) === normalizeJob(job.job_type)) score += 40;
  if (senior.career_years >= job.required_career) score += 10;
  return score;
}
