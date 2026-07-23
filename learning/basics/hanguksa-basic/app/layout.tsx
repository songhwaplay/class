import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

const title = "한능검 기본 단원별 기출문제";
const description = "한국사능력검정시험 기본 기출문제를 시대와 단원별로 분류해 출제하고 오답을 저장합니다.";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") || requestHeaders.get("host") || "localhost";
  const protocol = requestHeaders.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  const imageUrl = `${protocol}://${host}/og.png`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      locale: "ko_KR",
      images: [{ url: imageUrl, width: 1729, height: 909, alt: "한능검 기본 기출문제" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
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
      <body>{children}</body>
    </html>
  );
}
