import { Loader } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useState } from "react";
import { Experience } from "./components/Experience";
import { UI } from "./components/UI";
import { PDFUploader } from "./components/Pdf";

function App() {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [CoverPdfUrl, setCoverPdfUrl] = useState(null);
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
    <div className="h-screen w-screen flex flex-col lg:flex-row bg-gray-100">
      {/* メイン3D表示エリア */}
      <div className="flex-1 relative mobile-layout lg:desktop-layout">
        {/* PDFが読み込まれている時のみUIを表示 */}
        {pdfUrl && <UI />}
        
        <Loader />
        
        <Canvas shadows camera={{ position: [-0.5, 1, 4], fov: 45 }}>
          <group position-y={0}>
            <Suspense fallback={null}>
              <Experience 
                pdfUrl={pdfUrl}
                CoverPdfUrl={CoverPdfUrl}
              />
            </Suspense>
          </group>
        </Canvas>

        {/* PDFが読み込まれていない時の案内（3D表示エリア上にオーバーレイ） */}
        {!pdfUrl && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/50 pointer-events-none">
            <div className="text-white text-center pointer-events-auto">    
            </div>
          </div>
        )}
      </div>

      {/* サイドメニュー/ボトムメニューエリア */}
      <div className={`
        bg-gray-900 text-white
        lg:w-80 lg:h-full lg:flex-shrink-0
        w-full mobile-menu lg:desktop-menu
        flex flex-col
        custom-scrollbar overflow-y-auto
        ${showUploader ? 'block' : 'hidden lg:block'}
      `}>
        {/* メニューヘッダー */}
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-bold">PDF Book Controls</h2>
          <button
            onClick={toggleUploader}
            className="lg:hidden bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg"
          >
            {showUploader ? '✕' : '☰'}
          </button>
        </div>

        {/* PDFアップローダー */}
        <div className="flex-1 p-4">
          <PDFUploader 
            onPDFLoad={handlePDFLoad}
            onCoverPDFLoad={handleCoverPDFLoad}
          />
        </div>

      </div>

      {/* モバイル用トグルボタン（PDFロード後） */}
      {pdfUrl && (
        <button
          onClick={toggleUploader}
          className="lg:hidden fixed bottom-4 right-4 z-50 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg touch-target"
        >
          {showUploader ? '✕' : '⚙️'}
        </button>
      )}
    </div>
  );
}

export default App;