import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";

import "./globals.css";

export const metadata: Metadata = {
  title: "RoyaltyAds",
  description: "Amazon KDP ads automation dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#D4A84B",
          colorBackground: "#FFFFFF",
          colorInputBackground: "#F5F5F5",
          colorInputText: "#1A1A1F",
          colorText: "#1A1A1F",
        },
      }}
    >
      <html lang="en" className="dark">
        <body className="bg-[#050608] text-zinc-100 antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
