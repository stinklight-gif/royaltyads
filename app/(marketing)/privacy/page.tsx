import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — RoyaltyAds",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#0D0D0F]">
      {/* Navbar */}
      <nav className="border-b border-[#2A2A30] bg-[#0D0D0F]">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-6">
          <Link
            href="/"
            className="font-mono text-xl font-semibold text-[#D4A84B]"
            style={{ textShadow: "0 0 20px rgba(212,168,75,0.2)" }}
          >
            RoyaltyAds
          </Link>
          <Link
            href="/"
            className="text-sm text-[#9CA3AF] transition-colors hover:text-[#F5F5F5]"
          >
            &larr; Back to home
          </Link>
        </div>
      </nav>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="text-3xl font-bold text-[#F5F5F5]">Privacy Policy</h1>
        <p className="mt-2 text-sm text-[#6B7280]">
          Effective Date: March 6, 2026 | ERESOURCE LLC
        </p>

        <div className="mt-10 space-y-10">
          <Section title="1. Introduction">
            <p>
              ERESOURCE LLC (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) operates RoyaltyAds, an
              advertising management platform for Amazon KDP publishers. This Privacy
              Policy explains how we collect, use, disclose, and safeguard your
              information when you use our service. By using RoyaltyAds, you agree to
              the terms of this policy.
            </p>
          </Section>

          <Section title="2. Information We Collect">
            <p className="mb-3 font-medium text-[#F5F5F5]">
              Information you provide directly:
            </p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>Account credentials and settings you configure within the platform</li>
              <li>
                Amazon Advertising API credentials (Client ID, Client Secret, Profile
                ID)
              </li>
              <li>
                Advertising preferences such as ACoS targets and budget rules
              </li>
            </ul>

            <p className="mb-3 mt-6 font-medium text-[#F5F5F5]">
              Information collected via Amazon Advertising API (upon your
              authorization):
            </p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>Campaign names, budgets, spend, impressions, clicks, and sales</li>
              <li>Keyword bids, match types, and performance metrics</li>
              <li>Ad group and portfolio data</li>
              <li>Account-level advertising performance data</li>
            </ul>

            <p className="mb-3 mt-6 font-medium text-[#F5F5F5]">
              Automatically collected information:
            </p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>Usage data (pages visited, features used, timestamps)</li>
              <li>Device and browser information</li>
              <li>IP address</li>
            </ul>
          </Section>

          <Section title="3. How We Use Your Information">
            <p className="mb-3">We use the information we collect to:</p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                Display your Amazon Advertising campaign and keyword performance
                within the RoyaltyAds dashboard
              </li>
              <li>
                Execute automated budget and bid adjustments based on rules you
                configure
              </li>
              <li>Present recommendations and optimization suggestions</li>
              <li>
                Maintain an activity log of all automated actions taken on your
                behalf
              </li>
              <li>Improve platform functionality and user experience</li>
              <li>Respond to support requests</li>
            </ul>
          </Section>

          <Section title="4. Legal Basis for Processing (where applicable)">
            <p className="mb-3">We process your data on the basis of:</p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                <strong>Contract performance</strong> — to provide the service you
                have requested
              </li>
              <li>
                <strong>Legitimate interests</strong> — to operate, maintain, and
                improve our platform
              </li>
              <li>
                <strong>Consent</strong> — where you have explicitly authorized
                access to third-party accounts (e.g. Amazon Ads)
              </li>
            </ul>
          </Section>

          <Section title="5. Data Sharing and Disclosure">
            <p className="mb-3">
              We do not sell, rent, or trade your personal information. We may share
              data only in the following limited circumstances:
            </p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                <strong>Service providers:</strong> Third-party infrastructure
                providers (e.g. Supabase for database hosting, Vercel for application
                hosting) who process data solely on our behalf under confidentiality
                obligations
              </li>
              <li>
                <strong>Legal requirements:</strong> If required to do so by law or
                in response to valid legal process
              </li>
              <li>
                <strong>Business transfers:</strong> In the event of a merger,
                acquisition, or sale of assets, with notice provided to you
              </li>
            </ul>
          </Section>

          <Section title="6. Amazon Advertising Data">
            <p>
              Data obtained through the Amazon Advertising API is used strictly in
              accordance with Amazon&apos;s API usage policies. We access your Amazon
              Advertising data only to provide features within RoyaltyAds that you
              have explicitly enabled. We do not use this data for advertising,
              profiling, or any purpose beyond operating the platform on your behalf.
            </p>
          </Section>

          <Section title="7. Data Retention">
            <p>
              We retain your data for as long as your account remains active. If you
              discontinue use of RoyaltyAds or request deletion, we will remove your
              stored data within 30 days. You may revoke RoyaltyAds&apos; access to
              your Amazon Advertising account at any time through Amazon&apos;s app
              authorization settings.
            </p>
          </Section>

          <Section title="8. Data Security">
            <p>
              We implement industry-standard security measures including encrypted
              data transmission (TLS), secure credential storage, and access
              controls. No method of electronic storage is 100% secure; however, we
              take reasonable steps to protect your information.
            </p>
          </Section>

          <Section title="9. Your Rights">
            <p className="mb-3">
              Depending on your jurisdiction, you may have the right to:
            </p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>
                Withdraw consent at any time (including revoking Amazon API access)
              </li>
              <li>Lodge a complaint with a supervisory authority</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, contact us at the address below.
            </p>
          </Section>

          <Section title="10. Children's Privacy">
            <p>
              RoyaltyAds is not directed at individuals under the age of 18. We do
              not knowingly collect personal information from minors.
            </p>
          </Section>

          <Section title="11. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. We will notify
              users of material changes by updating the effective date above.
              Continued use of the platform following any changes constitutes
              acceptance of the revised policy.
            </p>
          </Section>

          <Section title="12. Contact Us">
            <p>ERESOURCE LLC</p>
            <p>support@royaltyads.com</p>
          </Section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#2A2A30] bg-[#141418]">
        <div className="mx-auto max-w-4xl px-6 py-6">
          <p className="text-center text-sm text-[#6B7280]">
            &copy; 2025 RoyaltyAds. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold text-[#F5F5F5]">{title}</h2>
      <div className="text-[15px] leading-[1.7] text-[#9CA3AF]">{children}</div>
    </section>
  );
}
