import { Loader } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useState } from "react";
import { Experience } from "./components/Experience";
import { UI } from "./components/UI";
import { PDFUploader } from "./components/Pdf";

function App() {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [coverPdfUrl, setCoverPdfUrl] = useState(null);
  const [showUploader, setShowUploader] = useState(true);

  const handlePDFLoad = (url) => {
    setPdfUrl(url);
    if (url) {
      setShowUploader(false); // PDFが読み込まれたらアップローダーを非表示
    }
  };

  const handleCoverPDFLoad = (url) => {
    setCoverPdfUrl(url);
  };

  const toggleUploader = () => {
    setShowUploader(!showUploader);
  };

  return (
    <>
      {/* PDFが読み込まれている時のみUIを表示 */}
      {pdfUrl && <UI />}
      
      {/* アップローダーの表示/非表示切り替えボタン */}
      <button
        onClick={toggleUploader}
        className="fixed top-4 right-4 z-50 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg"
      >
        {showUploader ? 'アップローダーを閉じる' : 'PDFを読み込む'}
      </button>

      {/* PDFアップローダー */}
      {showUploader && (
        <PDFUploader 
          onPDFLoad={handlePDFLoad}
          onCoverPDFLoad={handleCoverPDFLoad}
        />
      )}

      <Loader />
      
      <Canvas shadows camera={{ position: [-0.5, 1, 4], fov: 45 }}>
        <group position-y={0}>
          <Suspense fallback={null}>
            <Experience 
              pdfUrl={pdfUrl}
              coverPdfUrl={coverPdfUrl}
            />
          </Suspense>
        </group>
      </Canvas>

      {/* PDFが読み込まれていない時の案内 */}
      {!pdfUrl && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 pointer-events-none">
          <div className="text-white text-center pointer-events-auto">
            <h1 className="text-4xl font-bold mb-4">PDF Book Viewer</h1>
            <p className="text-lg mb-6">PDFファイルを読み込んで3D本として表示します</p>
            <button
              onClick={() => setShowUploader(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-lg"
            >
              PDFを選択
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default App;