import type { Metadata } from "next";
import "./globals.css";
// 地図ライブラリのスタイルシートの読み込み
import 'maplibre-gl/dist/maplibre-gl.css';

export const metadata: Metadata = {
  title: "あんしん避難ナビ",
  description: "遠隔地から家族の避難を支援するアプリケーション",
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