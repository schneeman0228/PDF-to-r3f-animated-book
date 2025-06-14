import { Environment, Float, OrbitControls, Text } from "@react-three/drei";
import { useState, useEffect } from "react";
import { PDFBook } from "./Book_novel";

export const Experience = ({ pdfUrl, CoverPdfUrl }) => {

  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState(null);

  // デバッグ用のログ
  useEffect(() => {
    console.log('Experience received props:', { pdfUrl, CoverPdfUrl });
  }, [pdfUrl, CoverPdfUrl]);

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
      {/* PDFが読み込まれている場合はPDFBookを表示 */}
      {pdfUrl && !pdfError && (
        <>
          <PDFBook 
            pdfUrl={pdfUrl}
            CoverpdfUrl={CoverPdfUrl} // プロパティ名を統一
            position={[0, 0, 0]}
            scale={1}
            onLoadStart={handlePDFLoadStart}
            onLoadComplete={handlePDFLoadComplete}
            onError={handlePDFError}
          />
        </>
      )}

      {/* ローディング中の表示 */}
      {pdfLoading && (
        <group>
          <Float
            speed={3}
            rotationIntensity={0.2}
            floatIntensity={0.8}
          >
            <Text
              position={[0, 0, 0]}
              fontSize={0.4}
              color="#60A5FA"
              anchorX="center"
              anchorY="middle"
              fontWeight="bold"
            >
              PDFを読み込み中...
            </Text>
          </Float>
          
          {/* 回転するローディングインジケーター */}
          <mesh position={[0, -0.8, 0]} rotation={[0, 0, 0]}>
            <torusGeometry args={[0.3, 0.1, 8, 16]} />
            <meshStandardMaterial color="#60A5FA" />
          </mesh>
        </group>
      )}

      {/* エラー表示 */}
      {pdfError && (
        <group>
          <Float
            speed={1}
            rotationIntensity={0.05}
            floatIntensity={0.3}
          >
            <Text
              position={[0, 0.2, 0]}
              fontSize={0.3}
              color="#EF4444"
              anchorX="center"
              anchorY="middle"
              fontWeight="bold"
            >
              エラーが発生しました
            </Text>
            <Text
              position={[0, -0.3, 0]}
              fontSize={0.2}
              color="#FCA5A5"
              anchorX="center"
              anchorY="middle"
              maxWidth={4}
            >
              {pdfError}
            </Text>
          </Float>
        </group>
      )}

      {/* PDFが読み込まれていない場合のプレースホルダー */}
      {!pdfUrl && !pdfLoading && (
        <group>
          <Float
            speed={2}
            rotationIntensity={0.1}
            floatIntensity={0.5}
          >
            <Text
              position={[0, 0, 0]}
              fontSize={0.5}
              color="white"
              anchorX="center"
              anchorY="middle"
              fontWeight="bold"
            >
              PDFファイルを読み込んでください
            </Text>
          </Float>
          
          {/* サンプルの本の形状 */}
          <mesh position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <boxGeometry args={[1.28, 0.1, 1.71]} />
            <meshStandardMaterial color="#8B4513" opacity={0.3} transparent />
          </mesh>
        </group>
      )}

      <OrbitControls 
        enableDamping={false} // ダンピング無効化
       />
      <Environment preset="studio" />
      
      <directionalLight
        position={[5, 5, 10]}
        intensity={0.05}
      />
      
      {/* アンビエントライトを追加してシーン全体を明るく */}
      <ambientLight intensity={0.2} />
    </>
  );
};