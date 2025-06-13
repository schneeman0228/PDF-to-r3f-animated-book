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

      <OrbitControls />
      <Environment preset="studio" />
      
      <directionalLight
        position={[5, 5, 10]}
        intensity={0.05}
      />
      
      <ambientLight intensity={0.2} />
    </>
  );
};