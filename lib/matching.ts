import type { Senior, Job } from './types';

/**
 * 규칙 기반 매칭 점수 계산 (최대 100점)
 * - 지역 일치  : +50점
 * - 직종 일치  : +40점
 * - 경력 충족  : +10점 (career_years >= required_career)
 */
export function calculateScore(senior: Senior, job: Job): number {
  let score = 0;
  if (senior.region === job.region) score += 50;
  if (senior.desired_job === job.job_type) score += 40;
  if (senior.career_years >= job.required_career) score += 10;
  return score;
}
