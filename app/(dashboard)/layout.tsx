import { UserButton } from "@clerk/nextjs";

import { Sidebar } from "@/components/sidebar";
import { isDemoMode } from "@/lib/amazon-ads/client";
import { DEMO_BANNER_TEXT } from "@/lib/mock-data";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const demoMode = await isDemoMode();

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-20 flex w-64 flex-col border-r border-zinc-800 bg-[#0a0a0a]">
        <div className="border-b border-zinc-800 px-4 py-5">
          <h1 className="font-mono text-xl tracking-tight text-zinc-100">
            RoyaltyAds
          </h1>
          <p className="mt-1 text-xs text-zinc-500">Amazon KDP automation</p>
        </div>
        <div className="flex-1">
          <Sidebar />
        </div>
        <div className="border-t border-zinc-800 px-4 py-4">
          <UserButton />
        </div>
      </aside>

      <div className="ml-64 min-h-screen bg-[#050608]">
        {demoMode ? (
          <div className="border-b border-yellow-700/60 bg-yellow-900/30 px-6 py-2">
            <p className="text-xs font-medium text-yellow-300">{DEMO_BANNER_TEXT}</p>
          </div>
        ) : null}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
