import { Loader } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useState, useEffect } from "react";
import { Experience } from "./components/Experience";
import { UI } from "./components/UI";

function App() {
  // サンプルPDFのURLを初期値として設定
  const [pdfUrl, setPdfUrl] = useState("https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf");
  const [CoverPdfUrl, setCoverPdfUrl] = useState("https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf");
  const [showUploader, setShowUploader] = useState(true);
  
  // PDF読み込み関連の状態（Pdf.jsxから統合）
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // デバッグ用のログ
  useEffect(() => {
    console.log('App state updated:', { pdfUrl, CoverPdfUrl, showUploader });
  }, [pdfUrl, CoverPdfUrl, showUploader]);

  // ファイルアップロード処理（Pdf.jsxから統合）
  const handleFileUpload = (event, iscover = false) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setLoading(true);
      const url = URL.createObjectURL(file);
      
      if (iscover) {
        setCoverPdfUrl(url);
      } else {
        setPdfUrl(url);
        if (url) {
          setShowUploader(false); // PDFが読み込まれたらアップローダーを非表示
        }
      }
      
      setError(null);
      setLoading(false);
    } else {
      setError('PDFファイルを選択してください');
    }
  };

  // サンプルPDF読み込み処理（Pdf.jsxから統合）
  const loadSamplePDF = () => {
    const sampleUrl = "https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf";
    setPdfUrl(sampleUrl);
    setCoverPdfUrl(sampleUrl);
    setError(null);
  };

  const toggleUploader = () => {
    setShowUploader(!showUploader);
  };

  return (
    <div className="h-screen w-screen flex flex-col lg:flex-row bg-gray-100">
      {/* メイン3D表示エリア */}
      <div className="h-[60vh] lg:h-full flex-1 relative mobile-layout lg:desktop-layout">
        {/* PDFが読み込まれている時のみUIを表示 */}
        {pdfUrl && <UI />}
        
        <Loader />
        
        <Canvas 
          shadows 
          camera={
            { position: [-0.5, 1, 4], fov: 45 }
            }
          style={{ width: '300px', height: '400px' }}
          gl={{
            antialias: false,  // アンチエイリアス無効化
            powerPreference: "high-performance",
            pixelRatio: Math.min(window.devicePixelRatio, 1) // ピクセル比制限
            }}
        >
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

      {/* サイド/ボトムメニューエリア*/}
      <div className={`
        bg-gray-900 text-white
        lg:w-80 lg:h-full lg:flex-shrink-0
        h-[40vh] lg:h-full w-full
        flex flex-col
        custom-scrollbar overflow-y-auto
        ${showUploader ? 'block' : 'hidden lg:block'}
      `}>

        {/* PDF読み込みエリア */}
        <div className="flex-1 p-4">
          <h3 className="text-lg font-semibold mb-4">PDFブックを読み込む</h3>
          
          {/* ローカルファイル読み込み */}
          <div className="mb-6">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">
                  メインPDF <span className="text-red-400">*</span>
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileUpload(e, false)}
                  className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  表紙PDF <span className="text-gray-400">(オプション)</span>
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileUpload(e, true)}
                  className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-green-600 file:text-white hover:file:bg-green-700 transition-colors"
                />
                <p className="text-xs text-gray-400 mt-1">
                  表紙を指定しない場合、メインPDFの最初のページが表紙として使用されます
                </p>
              </div>
            </div>
          </div>

          {/* サンプルPDF */}
          <div className="mb-6">
            <button
              onClick={loadSamplePDF}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded transition-colors"
            >
              サンプルPDFを読み込み
            </button>
          </div>

          {/* 状態表示 */}
          {error && (
            <div className="text-red-400 mb-4 p-3 bg-red-900/30 border border-red-700/50 rounded">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            </div>
          )}

          {(pdfUrl || CoverPdfUrl) && (
            <div className="mb-4 p-3 bg-green-900/30 border border-green-700/50 rounded">
              <div className="text-green-400 text-sm">
                {pdfUrl && <div>✓ メインPDF: 読み込み済み</div>}
                {CoverPdfUrl && <div>✓ 表紙PDF: 読み込み済み</div>}
              </div>
            </div>
          )}

          {loading && (
            <div className="text-blue-400 text-center p-3 bg-blue-900/30 border border-blue-700/50 rounded">
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                読み込み中...
              </div>
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
}

export default App;