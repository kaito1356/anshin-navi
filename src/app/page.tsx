/*
 * --------------------------------------------------------------------------
 * ファイル名: src/app/page.tsx
 * 役割: 【機能追加】画面2に、土地の潜在的リスクを表示する機能を追加
 * --------------------------------------------------------------------------
 */
"use client";

import React, { useState, useEffect } from 'react';
import Map, { Marker, MapLayerMouseEvent } from 'react-map-gl/maplibre';

// --------------------------------------------------------------------------
// 型定義とヘルパー関数
// --------------------------------------------------------------------------
type Coords = {
  longitude: number;
  latitude: number;
};

// APIから返ってくるハザード情報の「型（設計図）」を定義します。
interface HazardData {
  flood_l2: number;
  hightide: number;
  tsunami_newlegend: number;
  dosekiryukeikaikuiki: boolean;
  kyukeishakeikaikuiki: boolean;
  jisuberikeikaikuiki: boolean;
}

// 洪水用の浸水深コードを、分かりやすい日本語に変換する関数
const formatFloodDepth = (code: number): string => {
  const depthMap: { [key: number]: string } = {
    1: "< 0.5m", 2: "0.5m ~ 3.0m未満", 3: "3.0m ~ 5.0m未満",
    4: "5.0m ~ 10.0m未満", 5: "10.0m ~ 20.0m未満", 6: "20.0m以上",
  };
  return depthMap[code] || "情報なし";
};

// 高潮・津波用の浸水深コードを、分かりやすい日本語に変換する関数
const formatTsunamiHightideDepth = (code: number): string => {
    const depthMap: { [key: number]: string } = {
    1: "< 0.3m", 2: "0.3m ~ 0.5m未満", 3: "0.5m ~ 1.0m未満",
    4: "1.0m ~ 3.0m未満", 5: "3.0m ~ 5.0m未満", 6: "5.0m ~ 10.0m未満",
    7: "10.0m ~ 20.0m未満", 8: "20.0m以上",
  };
  return depthMap[code] || "情報なし";
};


// --------------------------------------------------------------------------
// 画面１：地図選択スクリーン
// --------------------------------------------------------------------------
const MapSelectionScreen = ({ onConfirmLocation }: { onConfirmLocation: (coords: Coords | null) => void }) => {
  const [marker, setMarker] = useState<Coords | null>(null);
  const maptilerApiKey = "viqRN0KD0xSshg3EeMB4"; // あなたのAPIキーに置き換えてください
  const mapStyle = `https://api.maptiler.com/maps/jp-mierune-streets/style.json?key=${maptilerApiKey}`;

  const handleMapClick = (event: MapLayerMouseEvent) => {
    const { lng, lat } = event.lngLat;
    setMarker({ longitude: lng, latitude: lat });
  };

  return (
    <div style={{ padding: '32px', backgroundColor: '#f3f4f6', minHeight: '100vh' }}>
      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '16px' }}>
          マップから場所を指定してください
        </h1>
        <div style={{ position: 'relative', height: '500px', width: '100%', borderRadius: '6px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
          <Map
            initialViewState={{ longitude: 139.49, latitude: 35.34, zoom: 12 }}
            style={{width: '100%', height: '100%'}} mapStyle={mapStyle}
            pitchWithRotate={false} touchPitch={false}
            onClick={handleMapClick}
          >
            {marker && <Marker longitude={marker.longitude} latitude={marker.latitude} anchor="bottom" />}
          </Map>
        </div>
        <div style={{ marginTop: '24px' }}>
          <button
            onClick={() => onConfirmLocation(marker)}
            disabled={!marker}
            style={{
              width: '100%',
              backgroundColor: marker ? '#2563eb' : '#9ca3af',
              color: 'white',
              fontWeight: 'bold',
              padding: '12px 16px',
              borderRadius: '8px',
              cursor: marker ? 'pointer' : 'not-allowed',
              transition: 'background-color 0.2s'
            }}
          >
            この地域のハザード情報を確認する
          </button>
        </div>
      </div>
    </div>
  );
};

// --------------------------------------------------------------------------
// 画面２：ハザード情報表示スクリーン
// --------------------------------------------------------------------------
const HazardReportScreen = ({ coords, onBack }: { coords: Coords, onBack: () => void }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [hazardData, setHazardData] = useState<HazardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        const { longitude: lng, latitude: lat } = coords;

        const addressPromise = fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lon=${lng}&lat=${lat}&accept-language=ja`).then(res => res.json());
        // ★★★ ここで utsuken.net API を呼び出します ★★★
        const hazardPromise = fetch(`https://api.utsuken.net/hazards/${lng}/${lat}/12`).then(res => res.json());

        const [addressData, hazardApiData] = await Promise.all([addressPromise, hazardPromise]);

        // 住所情報の処理
        if (addressData && addressData.display_name) {
          const parts = addressData.display_name.split(', ');
          const filteredParts = parts.filter((part: string) => part !== '日本' && !/^\d{3}-\d{4}$/.test(part));
          setAddress(filteredParts.reverse().join(''));
        } else {
          setAddress("住所情報が見つかりませんでした。");
        }

        // ハザード情報の処理
        if (hazardApiData && hazardApiData.specified_location) {
          setHazardData(hazardApiData.specified_location);
        }

      } catch (error) {
        console.error("APIエラー:", error);
        setAddress("情報の取得中にエラーが発生しました。");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [coords]);

  return (
    <div style={{ padding: '32px', backgroundColor: '#f3f4f6', minHeight: '100vh' }}>
      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
        <button onClick={onBack} style={{ marginBottom: '16px', color: '#4b5563', background: 'none', border: 'none', cursor: 'pointer' }}>
          &larr; 場所の選択に戻る
        </button>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '16px' }}>
          ハザード情報の確認
        </h1>
        <div style={{ marginTop: '16px', minHeight: '150px', border: '1px solid #e5e7eb', padding: '16px', borderRadius: '8px' }}>
          {isLoading ? (
            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>情報を検索中...</p>
          ) : (
            <div style={{ fontSize: '0.875rem', color: '#374151', lineHeight: '1.7' }}>
              <p><span style={{ fontWeight: 'bold' }}>指定した場所:</span> {address || '---'}</p>

              {/* ★★★ ここからハザード情報の表示を追加しました ★★★ */}
              {hazardData ? (
                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f3f4f6' }}>
                  <h3 style={{ fontWeight: 'bold', marginBottom: '8px' }}>土地の潜在的リスク</h3>
                  <p><strong>洪水浸水:</strong> {hazardData.flood_l2 > 0 ? `想定最大浸水深 ${formatFloodDepth(hazardData.flood_l2)}` : "想定されるリスクはありません"}</p>
                  <p><strong>高潮浸水:</strong> {hazardData.hightide > 0 ? `想定最大浸水深 ${formatTsunamiHightideDepth(hazardData.hightide)}` : "想定されるリスクはありません"}</p>
                  <p><strong>津波浸水:</strong> {hazardData.tsunami_newlegend > 0 ? `想定最大浸水深 ${formatTsunamiHightideDepth(hazardData.tsunami_newlegend)}` : "想定されるリスクはありません"}</p>
                  <p><strong>がけ崩れ:</strong> {hazardData.kyukeishakeikaikuiki ? "警戒区域に含まれます" : "想定されるリスクはありません"}</p>
                  <p><strong>土石流:</strong> {hazardData.dosekiryukeikaikuiki ? "警戒区域に含まれます" : "想定されるリスクはありません"}</p>
                  <p><strong>地すべり:</strong> {hazardData.jisuberikeikaikuiki ? "警戒区域に含まれます" : "想定されるリスクはありません"}</p>
                </div>
              ) : <p>ハザード情報が取得できませんでした。</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --------------------------------------------------------------------------
// 親コンポーネント：画面全体の管理
// --------------------------------------------------------------------------
export default function App() {
  const [screen, setScreen] = useState('selection'); // 'selection' or 'report'
  const [selectedCoords, setSelectedCoords] = useState<Coords | null>(null);

  const handleConfirmLocation = (coords: Coords | null) => {
    if (coords) {
      setSelectedCoords(coords);
      setScreen('report');
    }
  };

  const handleBackToSelection = () => {
    setScreen('selection');
    setSelectedCoords(null);
  };

  if (screen === 'selection') {
    return <MapSelectionScreen onConfirmLocation={handleConfirmLocation} />;
  }

  if (screen === 'report' && selectedCoords) {
    return <HazardReportScreen coords={selectedCoords} onBack={handleBackToSelection} />;
  }

  // デフォルトは選択画面
  return <MapSelectionScreen onConfirmLocation={handleConfirmLocation} />;
}