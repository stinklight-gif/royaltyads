"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/campaigns", label: "Campaigns" },
  { href: "/optimizer", label: "Bid Optimizer" },
  { href: "/keywords", label: "Keywords" },
  { href: "/activity", label: "Activity Log" },
  { href: "/settings", label: "Settings" },
];

const isActivePath = (pathname: string, href: string) => {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname.startsWith(href);
};

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1 px-3 py-4">
      {navItems.map((item) => {
        const active = isActivePath(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-zinc-800 text-zinc-50"
                : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
