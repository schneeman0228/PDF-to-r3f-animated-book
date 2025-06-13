import { Environment, OrbitControls } from "@react-three/drei";
import { useState } from "react";
import { PDFBook } from "./Book_novel";

export const Experience = ({ pdfUrl, coverPdfUrl }) => {
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState(null);

  const handlePDFLoadStart = () => {
    console.log("Experience: PDF load start");
    setPdfLoading(true);
    setPdfError(null);
  };

  const handlePDFLoadComplete = () => {
    console.log("Experience: PDF load complete");
    setPdfLoading(false);
  };

  const handlePDFError = (error) => {
    console.log("Experience: PDF error", error);
    setPdfLoading(false);
    setPdfError(error?.message || 'PDFの読み込みに失敗しました');
  };

  return (
    <>
      {/* PDFブックの表示 */}
      {pdfUrl && (
        <PDFBook 
          pdfUrl={pdfUrl}
          coverPdfUrl={coverPdfUrl}
          position={[0, 0, 0]}
          scale={1}
          onLoadStart={handlePDFLoadStart}
          onLoadComplete={handlePDFLoadComplete}
          onError={handlePDFError}
        />
      )}

      {/* カメラコントロール（レスポンシブ対応） */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={2}
        maxDistance={10}
        minPolarAngle={0}
        maxPolarAngle={Math.PI}
        autoRotate={false}
        autoRotateSpeed={0.5}
        dampingFactor={0.05}
        enableDamping={true}
        touches={{
          ONE: 2, // ROTATE
          TWO: 1  // ZOOM (DOLLY)
        }}
      />
      
      {/* 環境設定 */}
      <Environment preset="studio" />
      
      {/* ライティング */}
      <directionalLight
        position={[5, 5, 10]}
        intensity={0.05}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      
      <ambientLight intensity={0.2} />

      {/* 追加のライト（本をより美しく照らすため） */}
      <pointLight
        position={[-2, 2, 2]}
        intensity={0.1}
        color="#ffffff"
      />
      
      <pointLight
        position={[2, 2, 2]}
        intensity={0.1}
        color="#ffffff"
      />

      {/* ローディング状態の表示 */}
      {pdfLoading && (
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.1, 0.1, 0.1]} />
          <meshStandardMaterial 
            color="#3B82F6" 
            emissive="#1E3A8A"
            emissiveIntensity={0.5}
          />
        </mesh>
      )}

      {/* エラー状態の表示 */}
      {pdfError && (
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.1, 0.1, 0.1]} />
          <meshStandardMaterial 
            color="#EF4444" 
            emissive="#7F1D1D"
            emissiveIntensity={0.5}
          />
        </mesh>
      )}
    </>
  );
};