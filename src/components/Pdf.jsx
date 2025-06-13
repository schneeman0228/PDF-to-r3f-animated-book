import React, { useState } from 'react';

export const PDFUploader = ({ onPDFLoad, onCoverPDFLoad }) => {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [coverPdfUrl, setCoverPdfUrl] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = (event, iscover = false) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setLoading(true);
      const url = URL.createObjectURL(file);
      
      if (iscover) {
        setCoverPdfUrl(url);
        onCoverPDFLoad(url);
      } else {
        setPdfUrl(url);
        onPDFLoad(url);
      }
      
      setError(null);
      setLoading(false);
    } else {
      setError('PDFファイルを選択してください');
    }
  };

  const handleUrlSubmit = (event) => {
    event.preventDefault();
    setLoading(true);
    const url = event.target.url.value.trim();
    const coverUrl = event.target.coverUrl.value.trim();
    
    // メインPDFのバリデーション
    if (!url) {
      setError('メインPDF URLを入力してください');
      setLoading(false);
      return;
    }
    
    if (!url.includes('.pdf')) {
      setError('有効なPDF URLを入力してください');
      setLoading(false);
      return;
    }

    // メインPDFの設定
    setPdfUrl(url);
    onPDFLoad(url);

    // 表紙PDFの処理（オプション）
    if (coverUrl) {
      if (coverUrl.includes('.pdf')) {
        setCoverPdfUrl(coverUrl);
        onCoverPDFLoad(coverUrl);
      } else {
        setError('表紙PDFのURLが無効です');
        setLoading(false);
        return;
      }
    } else {
      // 表紙が指定されていない場合はクリア
      setCoverPdfUrl(null);
      onCoverPDFLoad(null);
    }
    
    setError(null);
    setLoading(false);
  };

  const clearFiles = () => {
    if (pdfUrl && pdfUrl.startsWith('blob:')) {
      URL.revokeObjectURL(pdfUrl);
    }
    if (coverPdfUrl && coverPdfUrl.startsWith('blob:')) {
      URL.revokeObjectURL(coverPdfUrl);
    }
    setPdfUrl(null);
    setCoverPdfUrl(null);
    onPDFLoad(null);
    onCoverPDFLoad(null);
    setError(null);
  };

  return (
    <div className="fixed top-0 left-0 z-50 bg-black/90 text-white p-6 rounded-lg m-4 max-w-md">
      <h2 className="text-xl font-bold mb-4">PDFブックを読み込む</h2>
      
      {/* ローカルファイル読み込み */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">ローカルファイル</h3>
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

      {/* URL入力 */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">URLから読み込み</h3>
        <form onSubmit={handleUrlSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">
              メインPDF URL <span className="text-red-400">*</span>
            </label>
            <input
              name="url"
              type="url"
              placeholder="https://example.com/document.pdf"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              表紙PDF URL <span className="text-gray-400">(オプション)</span>
            </label>
            <input
              name="coverUrl"
              type="url"
              placeholder="https://example.com/cover.pdf"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white focus:border-green-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-2 px-4 rounded transition-colors"
          >
            {loading ? '読み込み中...' : 'URLから読み込み'}
          </button>
        </form>
        
        {/* サンプルURL設定ボタン */}
        <div className="mt-3 space-y-2">
          <p className="text-xs text-gray-400">サンプルURL:</p>
          <button
            type="button"
            onClick={() => {
              const form = document.querySelector('form');
              form.url.value = "https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf";
              form.coverUrl.value = "";
            }}
            className="w-full text-sm bg-gray-700 hover:bg-gray-600 text-white py-1 px-2 rounded transition-colors"
          >
            Mozilla PDF.js サンプルを設定
          </button>
        </div>
      </div>

      {/* サンプルPDF */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">サンプル</h3>
        <button
          onClick={() => {
            const sampleUrl = "https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf";
            setPdfUrl(sampleUrl);
            setCoverPdfUrl(sampleUrl);
            onPDFLoad(sampleUrl);
            onCoverPDFLoad(sampleUrl);
          }}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded"
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

      {(pdfUrl || coverPdfUrl) && (
        <div className="mb-4 p-3 bg-green-900/30 border border-green-700/50 rounded">
          <div className="flex items-center mb-2">
            <svg className="w-5 h-5 mr-2 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-green-400 font-medium">PDF読み込み完了</span>
          </div>
          <div className="space-y-1 text-sm">
            {pdfUrl && (
              <div className="flex items-center">
                <span className="text-blue-400 mr-2">📄</span>
                <span className="text-gray-300">メインPDF: </span>
                <span className="text-green-400 ml-1">読み込み済み</span>
              </div>
            )}
            {coverPdfUrl && (
              <div className="flex items-center">
                <span className="text-green-400 mr-2">🎨</span>
                <span className="text-gray-300">表紙PDF: </span>
                <span className="text-green-400 ml-1">読み込み済み</span>
              </div>
            )}
          </div>
          <button
            onClick={clearFiles}
            className="mt-3 text-sm bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded transition-colors"
          >
            すべてクリア
          </button>
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
  );
};