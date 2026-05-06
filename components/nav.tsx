import Link from "next/link";

const links = [
  { href: "/register", label: "프로필 등록" },
  { href: "/recommendations", label: "추천 목록" },
  { href: "/admin", label: "담당자 대시보드" },
];

export default function Nav() {
  return (
    <nav className="bg-blue-700 text-white shadow-md">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-8">
        <Link href="/" className="text-2xl font-bold tracking-tight whitespace-nowrap">
          상상우리
        </Link>
        <ul className="flex gap-6">
          {links.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className="text-xl font-medium hover:underline hover:text-blue-200 transition-colors"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
