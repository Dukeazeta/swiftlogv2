import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Outfit, Geist_Mono } from "next/font/google";
import "./globals.css";

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SwiftLogNG — AI-powered SIWES logbook",
  description:
    "Drop a quick summary of your week and let AI write professional daily logbook entries — tailored to your role, company, and department.",
  keywords: ["SIWES", "IT", "logbook", "Nigeria", "students", "AI"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning
        className={`${jakartaSans.variable} ${outfit.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
