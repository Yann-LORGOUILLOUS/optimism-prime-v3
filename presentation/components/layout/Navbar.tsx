"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { title: "Dashboard", href: "/" },
  { title: "$OPP", href: "/opp" },
  { title: "Earn", href: "/earn" },
  { title: "Autobribes", href: "/autobribes" },
  { title: "Roadmap", href: "/roadmap" },
  { title: "Backgrounds", href: "/backgrounds" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="hidden xl:flex gap-6 text-white font-transformers text-xl">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`hover:text-blue-400 transition ${
              isActive ? "text-blue-500 underline" : ""
            }`}
          >
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}