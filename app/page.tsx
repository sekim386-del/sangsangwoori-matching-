import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-10 text-center">
      <h1 className="text-5xl font-bold text-blue-700 leading-tight">
        상상우리 매칭
      </h1>
      <p className="text-2xl text-gray-600">
        시니어와 일자리를 연결하는 자동 매칭 서비스
      </p>
      <div className="flex flex-col sm:flex-row gap-6 mt-4">
        <Link
          href="/register"
          className="bg-blue-700 text-white text-2xl font-semibold py-5 px-10 rounded-2xl hover:bg-blue-800 transition-colors shadow"
        >
          프로필 등록
        </Link>
        <Link
          href="/recommendations"
          className="bg-white border-2 border-blue-700 text-blue-700 text-2xl font-semibold py-5 px-10 rounded-2xl hover:bg-blue-50 transition-colors shadow"
        >
          추천 목록 보기
        </Link>
        <Link
          href="/admin"
          className="bg-gray-700 text-white text-2xl font-semibold py-5 px-10 rounded-2xl hover:bg-gray-800 transition-colors shadow"
        >
          담당자 대시보드
        </Link>
      </div>
    </div>
  );
}
