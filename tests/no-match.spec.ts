import { test, expect } from '@playwright/test';
import { resetDb, getSeniorByName, getMatchesBySeniorId } from './helpers';

const SENIOR_NAME = 'pw_매칭없는시니어';

test.beforeEach(async () => {
  // "기타/기타/요구경력0" 공고 1건만 존재하는 상태로 리셋
  // 서울/경비 시니어와의 점수: 지역(0) + 직종(0) + 경력(+10) = 10점 → 50점 미달 → 매칭 미생성
  await resetDb([
    { title: 'pw_기타_기타', region: '기타', job_type: '기타', required_career: 0 },
  ]);
});

test('매칭 불가 공고만 있을 때 등록 → 추천 목록 빈 상태', async ({ page }) => {
  await page.goto('/register');

  // 서울/경비/3년으로 등록 (기타/기타/0 공고와 점수 10점 → 매칭 미삽입)
  await page.fill('#name', SENIOR_NAME);
  await page.selectOption('#region', '서울');
  await page.selectOption('#desired_job', '경비');
  await page.fill('#career_years', '3');

  await page.click('button[type="submit"]');

  // 등록 성공 확인
  await expect(page.locator('[data-testid="success-box"]')).toBeVisible({ timeout: 15_000 });
  await expect(page.locator('[data-testid="success-box"]')).toContainText('등록이 완료되었습니다');

  // 추천 목록 이동
  const href = await page.locator('[data-testid="success-link"]').getAttribute('href');
  expect(href).toMatch(/\/recommendations\?senior_id=.+/);
  await page.goto(href!);

  // "현재 매칭되는 일자리가 없습니다" 안내 박스 표시
  await expect(page.locator('[data-testid="no-match"]')).toBeVisible({ timeout: 15_000 });
  await expect(page.locator('[data-testid="no-match"]')).toContainText('현재 매칭되는 일자리가 없습니다');

  // 카드가 0개여야 함
  await expect(page.locator('[data-testid="match-card"]')).toHaveCount(0);

  // DB: 시니어는 등록됐으나 매칭 0건
  const seniorId = new URL(href!, 'http://localhost:3000').searchParams.get('senior_id')!;
  const senior = await getSeniorByName(SENIOR_NAME);
  expect(senior).not.toBeNull();
  expect(senior!.id).toBe(seniorId);

  const matches = await getMatchesBySeniorId(seniorId);
  expect(matches.length).toBe(0);
});
