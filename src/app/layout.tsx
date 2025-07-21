import type { Metadata } from "next";
import "./globals.css";
import 'maplibre-gl/dist/maplibre-gl.css';

export const metadata: Metadata = {
  title: "避難喚起アプリ",
  description: "遠隔地から家族への避難喚起アプリケーション",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}