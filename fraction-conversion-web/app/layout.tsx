import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "수학 학습지",
  description: "연산과 분수 학습지",
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
