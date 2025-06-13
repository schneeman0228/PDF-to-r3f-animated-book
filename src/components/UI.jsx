import { atom, useAtom } from "jotai";
import { useEffect } from "react";

/*本文*/
const pictures = [
  "DSC00680",
  "DSC00933",
  "DSC00966",
  "DSC00983",
  "DSC01011",
  "DSC01040",
  "DSC01064",
  "DSC01071",
  "DSC01103",
  "DSC01145",
  "DSC01420",
  "DSC01461",
  "DSC01489",
  "DSC02031",
  "DSC02064",
  "DSC02069",
];

/*表紙*/
export const pageAtom = atom(0);
export const pages = [
  {
    front: "book-cover",
    back: pictures[0],
  },
];
for (let i = 1; i < pictures.length - 1; i += 2) {
  pages.push({
    front: pictures[i % pictures.length],
    back: pictures[(i + 1) % pictures.length],
  });
}

/*裏表紙*/
pages.push({
  front: pictures[pictures.length - 1],
  back: "book-back",
});

export const UI = () => {
  const [page, setPage] = useAtom(pageAtom);

  /*音（いらない）*/
  useEffect(() => {
    const audio = new Audio("/audios/page-flip-01a.mp3");
    audio.play().catch(() => {
      // 音声再生に失敗した場合は無視（ブラウザの自動再生ポリシー等）
    });
  }, [page]);

  return (
    <>
      <main className="pointer-events-none select-none z-10 fixed inset-0 flex justify-between flex-col">
        {/* 上部エリア（将来的に追加コンテンツ用） */}
        <div className="pointer-events-auto mt-4 ml-4">
          {/* 必要に応じて上部にコントロールを追加 */}
        </div>
        
        {/* 下部のページナビゲーション */}
        <div className="w-full pointer-events-auto flex justify-center pb-safe">
          {/* モバイルでメニューと重ならないよう、レスポンシブな余白を設定 */}
          <div className="
            overflow-auto flex items-center gap-2 max-w-full p-3
            mb-2 lg:mb-5
            bg-black/20 backdrop-blur-sm rounded-full
            border border-white/10
          ">
            {[...pages].map((_, index) => (
              <button
                key={index}
                className={`
                  border-transparent hover:border-white transition-all duration-300
                  px-3 py-2 lg:px-4 lg:py-3 rounded-full text-sm lg:text-lg
                  uppercase shrink-0 border touch-target
                  ${index === page
                    ? "bg-white/90 text-black shadow-lg"
                    : "bg-black/30 text-white hover:bg-black/50"
                  }
                `}
                onClick={() => setPage(index)}
              >
                {index === 0 ? "Cover" : `Page ${index}`}
              </button>
            ))}
            <button
              className={`
                border-transparent hover:border-white transition-all duration-300
                px-3 py-2 lg:px-4 lg:py-3 rounded-full text-sm lg:text-lg
                uppercase shrink-0 border touch-target
                ${page === pages.length
                  ? "bg-white/90 text-black shadow-lg"
                  : "bg-black/30 text-white hover:bg-black/50"
                }
              `}
              onClick={() => setPage(pages.length)}
            >
              Back Cover
            </button>
          </div>
        </div>
      </main>
    </>
  );
};