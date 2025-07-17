"use client"; // このファイルがブラウザ側で動作することを示すおまじないです。

import React, { useRef, useEffect } from 'react';
import maplibregl, { Map as MaplibreMap } from 'maplibre-gl';

// これがアプリケーションのメインページコンポーネントです
export default function HomePage() {
  // 地図を表示するHTML要素（div）を、プログラムから参照するための変数
  const mapContainer = useRef<HTMLDivElement>(null);
  // 作成した地図オブジェクトそのものを保持しておくための変数
  const map = useRef<MaplibreMap | null>(null);

  // このコンポーネントが最初に画面に表示されたときに一度だけ実行される処理
  useEffect(() => {
    // 地図がすでにある場合や、表示先のdiv要素がない場合は何もしない
    if (map.current || !mapContainer.current) return;

    // 地図オブジェクトを生成します
    map.current = new maplibregl.Map({
      container: mapContainer.current, // 地図を表示するDOM要素
      style: 'https://gsi-cyberjapan.github.io/gsivectortile-mapbox-gl-js/std.json', // 国土地理院の地図スタイル
      center: [138.25, 36.20], // 初期中心座標：日本のほぼ中央
      zoom: 4.5, // 初期ズームレベル：日本全体が見えるように
    });

    // 地図に拡大・縮小ボタンを追加します
    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

  }, []); // 空の配列を渡すことで、この処理は初回の一度だけ実行されます

  // 画面に表示する内容
  // 地図を表示するためのdiv要素を一つだけ返します
  return (
    <div
      ref={mapContainer}
      style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: '100%',
      }}
    />
  );
}