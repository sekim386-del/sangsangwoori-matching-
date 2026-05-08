import { test, expect } from '@playwright/test';
import { resetDb, getSeniorByName } from './helpers';

test.beforeEach(async () => {
  // 유효성 검사 테스트는 공고 유무와 무관하므로 DB를 빈 상태로 리셋
  await resetDb([]);
});

test('이름 비움 제출 → 빨간 안내 박스 / seniors 테이블에 레코드 없음', async ({ page }) => {
  await page.goto('/register');

  // HTML required 속성을 제거해 브라우저 검증을 우회 → 서버 검증 테스트
  await page.evaluate(() => {
    const el = document.getElementById('name') as HTMLInputElement | null;
    if (el) el.removeAttribute('required');
  });

  // 이름 비운 채 나머지 입력
  await page.selectOption('#region', '서울');
  await page.selectOption('#desired_job', '경비');
  await page.fill('#career_years', '3');

  await page.click('button[type="submit"]');

  // 서버 응답: 빨간 안내 박스
  const errorBox = page.locator('[data-testid="error-box"]');
  await expect(errorBox).toBeVisible({ timeout: 15_000 });
  await expect(errorBox).toContainText('모든 항목을 입력해 주세요');

  // 성공 박스는 없어야 함
  await expect(page.locator('[data-testid="success-box"]')).not.toBeVisible();

  // DB: 빈 이름으로 시니어가 등록되지 않았음
  const senior = await getSeniorByName('');
  expect(senior).toBeNull();
});
