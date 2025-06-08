//いつかpdf外部読み込みできるように。。。
//スマホでアクセスしたいけどどうもWSL2だとややこしいらしい、powershellでFWに穴開けないといけないんだってさ…

export default function PDFLoader() {
    const [pdfUrl, setPdfUrl] = useState(null);
    const [error, setError] = useState(null);
  
    const handleFileUpload = (event) => {
      const file = event.target.files[0];
      if (file && file.type === 'application/pdf') {
        const url = URL.createObjectURL(file);
        setPdfUrl(url);
        setError(null);
      } else {
        setError('PDFファイルを選択してください');
      }
    };
  
    const handleUrlSubmit = (event) => {
      event.preventDefault();
      const url = event.target.url.value;
      if (url.endsWith('.pdf')) {
        setPdfUrl(url);
        setError(null);
      } else {
        setError('有効なPDF URLを入力してください');
      }
    };
  }
    export const PDFLoad = () => {
    return (
      <div className="p-4">
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">ローカルPDFファイルを読み込む</h2>
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
        {error && (
            <div className="text-red-500 mb-4">
              {error}
            </div>
          )}
  
          {pdfUrl && (
            <div className="h-[600px] w-full">
              <Book pdfUrl={pdfUrl} />
            </div>
          )}
        </div>
    );
  }