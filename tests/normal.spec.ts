import { test, expect } from '@playwright/test';
import { resetDb, getMatchesBySeniorId } from './helpers';

const SENIOR_NAME = 'pw_테스트시니어';

test.beforeEach(async () => {
  // DB 완전 리셋 후 서울/경비/요구경력3 공고 1건만 세팅
  await resetDb([
    { title: 'pw_서울_경비', region: '서울', job_type: '경비', required_career: 3 },
  ]);
});

test('시니어 등록 → 성공 메시지 → 추천 목록 100점 금색 배지', async ({ page }) => {
  await page.goto('/register');

  await page.fill('#name', SENIOR_NAME);
  await page.selectOption('#region', '서울');
  await page.selectOption('#desired_job', '경비');
  await page.fill('#career_years', '5');

  await page.click('button[type="submit"]');

  // "등록이 완료되었습니다" 초록 박스 확인
  const successBox = page.locator('[data-testid="success-box"]');
  await expect(successBox).toBeVisible({ timeout: 15_000 });
  await expect(successBox).toContainText('등록이 완료되었습니다');

  // 추천 목록 링크 href 추출 (senior_id 포함)
  const link = page.locator('[data-testid="success-link"]');
  const href = await link.getAttribute('href');
  expect(href).toMatch(/\/recommendations\?senior_id=.+/);

  // 추천 목록 페이지 이동
  await page.goto(href!);

  // 첫 번째 카드에 금색(gold) 배지 + 100점 확인
  const firstCard = page.locator('[data-testid="match-card"]').first();
  await expect(firstCard).toBeVisible({ timeout: 15_000 });

  const badge = firstCard.locator('[data-testid="score-badge"]');
  await expect(badge).toHaveAttribute('data-tier', 'gold');
  await expect(badge).toContainText('100');

  // DB: 100점 매칭 레코드 존재 확인
  const seniorId = new URL(href!, 'http://localhost:3000').searchParams.get('senior_id')!;
  const matches = await getMatchesBySeniorId(seniorId);
  expect(matches.some((m) => m.score === 100)).toBe(true);
});
