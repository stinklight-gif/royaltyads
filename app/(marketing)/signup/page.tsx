"use client";

import Link from "next/link";
import { SignUp } from "@clerk/nextjs";
import { Check } from "lucide-react";

function AvatarGroup() {
  const avatars = [
    { initials: "JM", bg: "bg-emerald-600" },
    { initials: "SK", bg: "bg-blue-600" },
    { initials: "AL", bg: "bg-purple-600" },
    { initials: "RD", bg: "bg-orange-600" },
    { initials: "TC", bg: "bg-rose-600" },
  ];

  return (
    <div className="flex items-center">
      {avatars.map((a, i) => (
        <div
          key={i}
          className={`flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#0D0D0F] text-[10px] font-semibold text-white ${a.bg}`}
          style={{ marginLeft: i > 0 ? -8 : 0 }}
        >
          {a.initials}
        </div>
      ))}
    </div>
  );
}

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen bg-[#0D0D0F]">
      {/* Left half — value reinforcement */}
      <div className="relative hidden w-1/2 flex-col justify-center border-r border-[#2A2A30] px-12 lg:flex xl:px-20">
        {/* Subtle background grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(212,168,75,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(212,168,75,0.3) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative">
          <Link
            href="/"
            className="font-mono text-[28px] font-semibold text-[#D4A84B]"
            style={{ textShadow: "0 0 20px rgba(212,168,75,0.2)" }}
          >
            RoyaltyAds
          </Link>
          <p className="mt-1 text-sm text-[#9CA3AF]">Amazon KDP automation</p>

          <ul className="mt-8 space-y-3">
            {[
              "Hourly bid optimization",
              "Budget guardrails",
              "Keyword harvesting",
              "Campaign analytics",
            ].map((feature) => (
              <li key={feature} className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-[#22C55E]" />
                <span className="text-[15px] text-[#9CA3AF]">{feature}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex items-center gap-3">
            <AvatarGroup />
            <span className="text-sm text-[#6B7280]">Join 200+ KDP publishers</span>
          </div>

          <div className="mt-10 border-t border-[#2A2A30] pt-8">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="font-mono text-4xl font-semibold text-[#22C55E]">
                  3.11x
                </p>
                <p className="mt-1 text-sm text-[#6B7280]">
                  Average ROAS across our publishers
                </p>
              </div>
              <div>
                <p className="font-mono text-4xl font-semibold text-[#22C55E]">
                  $2.1M+
                </p>
                <p className="mt-1 text-sm text-[#6B7280]">
                  Revenue tracked this month
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right half — Clerk sign-up */}
      <div className="flex w-full flex-col items-center justify-center px-6 lg:w-1/2">
        {/* Mobile brand */}
        <div className="mb-8 lg:hidden">
          <Link
            href="/"
            className="font-mono text-xl font-semibold text-[#D4A84B]"
            style={{ textShadow: "0 0 20px rgba(212,168,75,0.2)" }}
          >
            RoyaltyAds
          </Link>
        </div>

        <SignUp
          routing="hash"
          forceRedirectUrl="/dashboard"
          signInUrl="/login"
        />
      </div>
    </div>
  );
}
