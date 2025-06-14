import { Loader } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useState, useEffect } from "react";
import { Experience } from "./components/Experience";
import { UI } from "./components/UI";
import { PDFUploader } from "./components/Pdf";

function App() {
  // デモPDFのURLを最初から設定
  const sampleUrl = "https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf";
  const [pdfUrl, setPdfUrl] = useState(sampleUrl);
  const [coverPdfUrl, setCoverPdfUrl] = useState(sampleUrl);
  const [showUploader, setShowUploader] = useState(false); // 最初はメニューを閉じておく
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // 初期ロード完了のタイマー
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 100); // 2秒後に初期ロード完了
    return () => clearTimeout(timer);
  }, []);

  const handlePDFLoad = (url) => {
    setPdfUrl(url);
    setCoverPdfUrl(url); // 表紙も同じURLに設定
    if (url) {
      setShowUploader(false); // PDFが読み込まれたらアップローダーを非表示
      setIsInitialLoad(false); // 初回読み込み完了
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
                coverPdfUrl={coverPdfUrl}
              />
            </Suspense>
          </group>
        </Canvas>

        {/* 初回読み込み中の表示 */}
        {isInitialLoad && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/70 pointer-events-none">
            <div className="text-white text-center pointer-events-auto max-w-md mx-4">
              <h1 className="text-4xl font-bold mb-4">PDF Book Viewer</h1>
              <p className="text-lg mb-4">デモPDFを読み込み中...</p>
              
              {/* デバッグ情報 */}
              <div className="text-sm text-gray-300 mb-6">
                <p>PDF URL: {pdfUrl ? '✅ 設定済み' : '❌ 未設定'}</p>
                <p>URL: {pdfUrl && pdfUrl.substring(0, 50)}...</p>
              </div>
              
              <div className="flex items-center justify-center">
                <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="ml-3 text-lg">しばらくお待ちください</span>
              </div>
              
              <p className="text-xs text-gray-400 mt-4">
                数秒後に3D本が表示されます
              </p>
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
            currentPdfUrl={pdfUrl}
            currentCoverPdfUrl={coverPdfUrl}
          />
        </div>

        {/* 追加情報エリア */}
        <div className="p-4 border-t border-gray-700">
          <div className="text-sm text-gray-400 space-y-2">
            <p>📖 3D本としてPDFを表示</p>
            <p>🎨 表紙PDFで装丁をカスタマイズ</p>
            <p>📱 モバイル/デスクトップ対応</p>
            {pdfUrl && !isInitialLoad && (
              <div className="mt-3 p-2 bg-green-900/30 rounded border border-green-700/30">
                <p className="text-green-300 text-xs">
                  ✨ 3D本が表示されました！マウスやタッチで操作できます
                </p>
              </div>
            )}
          </div>
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