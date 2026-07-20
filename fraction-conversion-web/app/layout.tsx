import type { Metadata } from "next";
import "./globals.css";
import ArithmeticRaceController from "./components/arithmetic-race-controller";

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
      <body>{children}<ArithmeticRaceController /></body>
    </html>
  );
}
