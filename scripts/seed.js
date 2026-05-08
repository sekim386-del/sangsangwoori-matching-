const { createClient } = require('@supabase/supabase-js');
const { config } = require('dotenv');
const { resolve } = require('path');

config({ path: resolve(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

function calculateScore(senior, job) {
  let score = 0;
  if (senior.region === job.region) score += 50;
  if (senior.desired_job === job.job_type) score += 40;
  if (senior.career_years >= job.required_career) score += 10;
  return score;
}

const seniorsData = [
  { name: '김영수',  region: '서울',      desired_job: '경비',   career_years: 10 },
  { name: '박미경',  region: '경기',      desired_job: '청소',   career_years: 5  },
  { name: '이정호',  region: '서울',      desired_job: '조리',   career_years: 15 },
  { name: '최순자',  region: '인천',      desired_job: '돌봄',   career_years: 8  },
  { name: '정대현',  region: '서울',      desired_job: '경비',   career_years: 3  },
  { name: '강옥분',  region: '경기',      desired_job: '돌봄',   career_years: 12 },
  { name: '윤기석',  region: '서울',      desired_job: '조리',   career_years: 7  },
  { name: '장미자',  region: '인천',      desired_job: '청소',   career_years: 4  },
  { name: '오상훈',  region: '기타',      desired_job: '기타',   career_years: 20 },
  { name: '임복순',  region: '서울특별시', desired_job: '경비직', career_years: 6  },
];

const jobsData = [
  { title: '아파트 경비원 A동',      region: '서울',      job_type: '경비', required_career: 5  },
  { title: '오피스 미화 주간반',     region: '경기',      job_type: '청소', required_career: 2  },
  { title: '어린이집 조리사',        region: '서울',      job_type: '조리', required_career: 10 },
  { title: '방문 요양보호사 서구',   region: '인천',      job_type: '돌봄', required_career: 5  },
  { title: '상가 야간 경비원',       region: '서울',      job_type: '경비', required_career: 3  },
  { title: '주간 돌봄 보조',         region: '경기',      job_type: '돌봄', required_career: 4  },
  { title: '단체급식 보조 조리',     region: '서울',      job_type: '조리', required_career: 3  },
  { title: '호텔 객실 미화',         region: '인천',      job_type: '청소', required_career: 2  },
  { title: '공원 환경 관리',         region: '서울',      job_type: '기타', required_career: 1  },
  { title: '동주민센터 안내 도우미', region: '경기',      job_type: '기타', required_career: 0  },
  { title: '학교 경비원',            region: '서울특별시', job_type: '경비', required_career: 2  },
  { title: '병원 청소',              region: '인천',      job_type: '청소', required_career: 3  },
  { title: '주간 조리 보조',         region: '서울',      job_type: '조리', required_career: 5  },
  { title: '방문 돌봄 도우미',       region: '경기',      job_type: '돌봄', required_career: 6  },
  { title: '주차 관리원',            region: '서울',      job_type: '경비', required_career: 1  },
];

async function main() {
  // 1. seniors INSERT
  const { data: insertedSeniors, error: seniorErr } = await supabase
    .from('seniors')
    .insert(seniorsData)
    .select();
  if (seniorErr) { console.error('seniors INSERT 실패:', seniorErr.message); process.exit(1); }
  console.log(`seniors ${insertedSeniors.length}건 INSERT 완료`);

  // 2. jobs INSERT
  const { data: insertedJobs, error: jobErr } = await supabase
    .from('jobs')
    .insert(jobsData)
    .select();
  if (jobErr) { console.error('jobs INSERT 실패:', jobErr.message); process.exit(1); }
  console.log(`jobs ${insertedJobs.length}건 INSERT 완료`);

  // 3. matches 재계산 — 새 시니어 × 전체 공고
  const { data: allJobs } = await supabase.from('jobs').select('*');

  const toInsert = [];
  for (const senior of insertedSeniors) {
    for (const job of allJobs) {
      const score = calculateScore(senior, job);
      if (score >= 50) {
        toInsert.push({ senior_id: senior.id, job_id: job.id, score, status: 'pending' });
      }
    }
  }

  if (toInsert.length > 0) {
    const { data: insertedMatches, error: matchErr } = await supabase
      .from('matches')
      .insert(toInsert)
      .select();
    if (matchErr) { console.error('matches INSERT 실패:', matchErr.message); process.exit(1); }
    console.log(`matches ${insertedMatches.length}건 INSERT 완료`);
  } else {
    console.log('matches: 조건 충족(≥50점) 건 없음');
  }

  // 4. 최종 레코드 수 출력
  const [
    { count: seniorCount },
    { count: jobCount },
    { count: matchCount },
  ] = await Promise.all([
    supabase.from('seniors').select('*', { count: 'exact', head: true }),
    supabase.from('jobs').select('*', { count: 'exact', head: true }),
    supabase.from('matches').select('*', { count: 'exact', head: true }),
  ]);

  console.log('\n=== 최종 레코드 수 ===');
  console.log(`seniors : ${seniorCount}건`);
  console.log(`jobs    : ${jobCount}건`);
  console.log(`matches : ${matchCount}건`);
}

main().catch(console.error);
