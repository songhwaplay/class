import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "분수 변환 훈련실",
  description: "대분수와 가분수 변환을 직접 풀고 즉시 피드백을 받는 3학년 수학 연습장",
};

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
