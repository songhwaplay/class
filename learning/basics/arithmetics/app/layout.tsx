import type { Metadata } from "next";
import { headers } from "next/headers";
import "katex/dist/katex.min.css";
import "./globals.css";
import ArithmeticRaceController from "./components/arithmetic-race-controller";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host?.includes("localhost") ? "http" : "https");
  const socialImage = host ? `${protocol}://${host}/og-learning-paths.png` : undefined;

  return {
    title: "기초연산",
    description: "초·중·고부터 이공계 기초까지 필요한 수학 연산을 골라 연습하는 기초연산",
    openGraph: {
      title: "기초연산",
      description: "초·중·고부터 이공계 기초까지 필요한 수학 연산을 골라 연습하는 기초연산",
      type: "website",
      images: socialImage ? [{ url: socialImage, width: 1672, height: 941, alt: "초1부터 고2까지 한곳에서 고르는 연산 학습지" }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: "기초연산",
      description: "초·중·고부터 이공계 기초까지 필요한 수학 연산을 골라 연습하는 기초연산",
      images: socialImage ? [socialImage] : undefined,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}<ArithmeticRaceController /></body>
    </html>
  );
}
