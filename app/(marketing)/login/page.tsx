"use client";

import Link from "next/link";
import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0D0D0F] px-6">
      <div className="flex flex-col items-center">
        {/* Brand */}
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="font-mono text-xl font-semibold text-[#D4A84B]"
            style={{ textShadow: "0 0 20px rgba(212,168,75,0.2)" }}
          >
            RoyaltyAds
          </Link>
          <p className="mt-1 text-sm text-[#9CA3AF]">Amazon KDP automation</p>
        </div>

        <SignIn
          routing="hash"
          forceRedirectUrl="/dashboard"
          signUpUrl="/signup"
        />
      </div>
    </div>
  );
}
