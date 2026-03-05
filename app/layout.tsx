import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

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
        baseTheme: dark,
        variables: {
          colorPrimary: "#D4A84B",
          colorBackground: "#141418",
          colorInputBackground: "#1A1A1F",
          colorInputText: "#F5F5F5",
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
