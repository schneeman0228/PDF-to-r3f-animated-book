import { CanvasTexture } from 'three'
import { useCursor, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useAtom } from "jotai";
import { easing } from "maath";
import { useEffect, useMemo, useRef, useState } from "react";
import * as pdfjs from 'pdfjs-dist';

//CDNに挑戦
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@5.3.31/build/pdf.worker.min.mjs`;

//こいつを読み込むのに3時間くらいかかった気が。結局ローカル最強
// 静的なパスを使用
//pdfjs.GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.min.mjs';

import {
  Bone,
  BoxGeometry,
  Color,
  Float32BufferAttribute,
  MathUtils,
  MeshStandardMaterial,
  Skeleton,
  SkinnedMesh,
  SRGBColorSpace,
  Uint16BufferAttribute,
  Vector3,
} from "three";
import { degToRad } from "three/src/math/MathUtils.js";
import { pageAtom, pages } from "./UI";

// PDFページをテクスチャに変換する関数
const pdfPageToTexture = async (pdfPage, scale = 1.0) => {
  const viewport = pdfPage.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  
  const context = canvas.getContext('2d');
  const renderContext = {
    canvasContext: context,
    viewport: viewport
  };

  await pdfPage.render(renderContext).promise;
  
  // ページ番号を追加
  context.fillStyle = 'red';
  context.font = '100px Arial';
  context.fillText(`Page ${pdfPage.pageNumber}`, 50, 100);
  
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
};

// PDFローダーフック
const usePDFPages = (pdfUrl) => {
  const [textures, setTextures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPDF = async () => {
      try {
        const pdf = await pdfjs.getDocument(pdfUrl).promise;
        const pageTextures = [];
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const texture = await pdfPageToTexture(page);
          //コンソールに読み込み状況を表示
          pageTextures.push(texture);
          console.log(`Loading page ${i}, index: ${i-1}`);
        }
        
        setTextures(pageTextures);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };

    loadPDF();
  }, [pdfUrl]);

  return { textures, loading, error };
};

// 表紙用：　PDFページを分割してテクスチャに変換する関数
const splitPDFPageToTextures = async (pdfPage, scale = 2) => {
  const viewport = pdfPage.getViewport({ scale });
  
  // 元のキャンバスを作成
  const originalCanvas = document.createElement('canvas');
  originalCanvas.width = viewport.width;
  originalCanvas.height = viewport.height;
  
  const originalContext = originalCanvas.getContext('2d');
  const renderContext = {
    canvasContext: originalContext,
    viewport: viewport
  };

  await pdfPage.render(renderContext).promise;

  // 表紙用のキャンバス
  const frontCanvas = document.createElement('canvas');
  frontCanvas.width = viewport.width / 2;  // 半分の幅
  frontCanvas.height = viewport.height;
  const frontContext = frontCanvas.getContext('2d');

  // 背表紙用のキャンバス
  const backCanvas = document.createElement('canvas');
  backCanvas.width = viewport.width / 2;  // 半分の幅
  backCanvas.height = viewport.height;
  const backContext = backCanvas.getContext('2d');

  // 左半分を表紙として切り出し
  frontContext.drawImage(
    originalCanvas,
    0, 0, viewport.width / 2, viewport.height,  // ソースの範囲
    0, 0, viewport.width / 2, viewport.height   // 描画先の範囲
  );

  // 右半分を背表紙として切り出し
  backContext.drawImage(
    originalCanvas,
    viewport.width / 2, 0, viewport.width / 2, viewport.height,  // ソースの範囲
    0, 0, viewport.width / 2, viewport.height   // 描画先の範囲
  );

  // テクスチャの生成
  const frontTexture = new CanvasTexture(frontCanvas);
  frontTexture.colorSpace = SRGBColorSpace;
  
  const backTexture = new CanvasTexture(backCanvas);
  backTexture.colorSpace = SRGBColorSpace;

  return {
    frontTexture,
    backTexture
  };
};

// 表紙用：　PDFカバーローダーフック
const usePDFCover = (coverPdfUrl) => {
  const [coverTextures, setCoverTextures] = useState({ front: null, back: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCoverPDF = async () => {
      try {
        const pdf = await pdfjs.getDocument(coverPdfUrl).promise;
        // 最初のページのみを読み込み
        const page = await pdf.getPage(1);
        const { frontTexture, backTexture } = await splitPDFPageToTextures(page);
        
        setCoverTextures({
          front: frontTexture,
          back: backTexture
        });
        setLoading(false);
      } catch (err) {
        console.error("Error loading cover PDF:", err);
        setError(err);
        setLoading(false);
      }

      //コンソールに読み込み状況を表示
      console.log('Cover Loading');
    };

    if (coverPdfUrl) {
      loadCoverPDF();
    }
  }, [coverPdfUrl]);

  return { coverTextures, loading, error };
};


//モデルのパラメータ
const easingFactor = 0.5; // Controls the speed of the easing
const easingFactorFold = 0.4; // Controls the speed of the easing 開き具合
const insideCurveStrength = 0.18; // Controls the strength of the curve
const outsideCurveStrength = 0.01; // Controls the strength of the curve 手で持った時の曲がり具合
const turningCurveStrength = 0.09; // Controls the strength of the curve　???

const PAGE_WIDTH = 1.28;
const PAGE_HEIGHT = 1.71; // 4:3 aspect ratio
const PAGE_DEPTH = 0.001;
const PAGE_SEGMENTS = 40;//セグメント数なのだが開き具合？
const SEGMENT_WIDTH = PAGE_WIDTH / PAGE_SEGMENTS;

const pageGeometry = new BoxGeometry(
  PAGE_WIDTH,
  PAGE_HEIGHT,
  PAGE_DEPTH,
  PAGE_SEGMENTS,
  2
);

/*元のコードのまま*/
pageGeometry.translate(PAGE_WIDTH / 2, 0, 0);

const position = pageGeometry.attributes.position;
const vertex = new Vector3();
const skinIndexes = [];
const skinWeights = [];

for (let i = 0; i < position.count; i++) {
  // ALL VERTICES
  vertex.fromBufferAttribute(position, i); // get the vertex
  const x = vertex.x; // get the x position of the vertex

  // スキンインデックスの計算（どのボーンが影響するか）
  const skinIndex = Math.max(0, Math.floor(x / SEGMENT_WIDTH));
  // スキンウェイトの計算（各ボーンの影響度）
  let skinWeight = (x % SEGMENT_WIDTH) / SEGMENT_WIDTH; // calculate the skin weight

  skinIndexes.push(skinIndex, skinIndex + 1, 0, 0); // set the skin indexes
  skinWeights.push(1 - skinWeight, skinWeight, 0, 0); // set the skin weights
}

// スキニング情報をジオメトリに追加
pageGeometry.setAttribute(
  "skinIndex",
  new Uint16BufferAttribute(skinIndexes, 4)
);
pageGeometry.setAttribute(
  "skinWeight",
  new Float32BufferAttribute(skinWeights, 4)
);

const whiteColor = new Color("white");
const emissiveColor = new Color("orange");

//側面用
//小口染め用
const sideColor = new Color("#c9b592");
const pageMaterials = [  
  new MeshStandardMaterial({
    color: sideColor,
  }),
  //背広
  new MeshStandardMaterial({
    color: "#0011ff",
  }),
  new MeshStandardMaterial({
    color: sideColor,
  }),
  new MeshStandardMaterial({
    color: sideColor,
  }),
];

// ページコンポーネント
const Page = ({ number, coverTextures, textures, page, opened, bookClosed, ...props }) => {
 
  const group = useRef();
  const turnedAt = useRef(0);
  const lastOpened = useRef(opened);
  const skinnedMeshRef = useRef();

  // geometry は既存のものを使用
  const manualSkinnedMesh = useMemo(() => {
    // ボーンの作成
    const bones = [];
    for (let i = 0; i <= PAGE_SEGMENTS; i++) {
      let bone = new Bone();
      bones.push(bone);
      if (i === 0) {
        bone.position.x = 0;
      } else {
        bone.position.x = SEGMENT_WIDTH;
      }
      if (i > 0) {
        bones[i - 1].add(bone);
      }
    }
    const skeleton = new Skeleton(bones);

    // 表裏のマテリアル設定
    // マテリアルの設定
    let materials;
    
    if (number === 0) {
      // 表紙のマテリアル
      materials = [
        ...pageMaterials,//側面
        // 裏面（1ページ目）
        new MeshStandardMaterial({
          color: whiteColor,
          //map: textures[5],
          roughness: 0.1,
          metalness: 0.01,
          emissive: emissiveColor,
          emissiveIntensity: 0,
        }),
        // 表面（表紙）        
        new MeshStandardMaterial({
          color: whiteColor,
          map: coverTextures?.front || null,
          roughness: 0.1,
          metalness: 0.1,
          emissive: emissiveColor,
          emissiveIntensity: 0,
        }),
      ];
    } else if (number === textures.length/2+1) {
      // 背表紙のマテリアル
      materials = [
        ...pageMaterials,//側面
        // 裏面（背表紙）
        new MeshStandardMaterial({
          color: whiteColor,
          map: coverTextures?.back || null,
          roughness: 0.1,
          metalness: 0.1,
          emissive: emissiveColor,
          emissiveIntensity: 0,
        }),
        // 表面（最終ページ）
        new MeshStandardMaterial({
          color: whiteColor,
          //map: textures[0],
          roughness: 0.1,
          metalness: 0.01,
          emissive: emissiveColor,
          emissiveIntensity: 0,
        }),
      ];
    } else if (number <= textures.length) {
      // 通常ページのマテリアル
      const pageColor = new Color("#c9b592");
      materials = [
        ...pageMaterials,//側面
        // 裏面
        new MeshStandardMaterial({
          color: pageColor,
          map: textures[number*2-1],
          roughness: 1,
          emissive: emissiveColor,
          emissiveIntensity: 0,
        }),
        // 表面
        new MeshStandardMaterial({
          color: pageColor,
          map: textures[number*2-2],
          roughness: 1,
          emissive: emissiveColor,
          emissiveIntensity: 0,
        }),
      ];
    }

    const mesh = new SkinnedMesh(pageGeometry, materials);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.frustumCulled = false;
    mesh.add(skeleton.bones[0]);
    mesh.bind(skeleton);
    return mesh;
  }, [number, textures, coverTextures]);

  // アニメーションロジックは既存のまま
  useFrame((_, delta) => {
    if (!skinnedMeshRef.current) {
      return;
    }

    const emissiveIntensity = highlighted ? 0.22 : 0;
    skinnedMeshRef.current.material[4].emissiveIntensity =
      skinnedMeshRef.current.material[5].emissiveIntensity = MathUtils.lerp(
        skinnedMeshRef.current.material[4].emissiveIntensity,
        emissiveIntensity,
        0.1
      );

    if (lastOpened.current !== opened) {
      turnedAt.current = +new Date();
      lastOpened.current = opened;
    }
    let turningTime = Math.min(400, new Date() - turnedAt.current) / 400;
    turningTime = Math.sin(turningTime * Math.PI);

    // 右とじ用に回転方向を反転
    let targetRotation = opened ? Math.PI / 2 : -Math.PI / 2;
    if (!bookClosed) {
      targetRotation += degToRad(number * -0.8); // 角度も反転
    }    

    const bones = skinnedMeshRef.current.skeleton.bones;
    for (let i = 0; i < bones.length; i++) {
      const target = i === 0 ? group.current : bones[i];

      const insideCurveIntensity = i < 8 ? Math.sin(i * 0.2 + 0.25) : 0;
      const outsideCurveIntensity = i >= 8 ? Math.cos(i * 0.3 + 0.09) : 0;
      const turningIntensity =
        Math.sin(i * Math.PI * (1 / bones.length)) * turningTime;
      let rotationAngle =
        insideCurveStrength * insideCurveIntensity * targetRotation -
        outsideCurveStrength * outsideCurveIntensity * targetRotation +
        turningCurveStrength * turningIntensity * targetRotation;
      let foldRotationAngle = degToRad(Math.sign(targetRotation) * 2);
      if (bookClosed) {
        if (i === 0) {
          rotationAngle = targetRotation;
          foldRotationAngle = 0;
        } else {
          rotationAngle = 0;
          foldRotationAngle = 0;
        }
      }
      easing.dampAngle(
        target.rotation,
        "y",
        rotationAngle,
        easingFactor,
        delta
      );

      const foldIntensity =
        i > 8
          ? Math.sin(i * Math.PI * (1 / bones.length) - 0.5) * turningTime
          : 0;
      easing.dampAngle(
        target.rotation,
        "x",
        foldRotationAngle * foldIntensity,
        easingFactorFold,
        delta
      );
    }
  });

  const [_, setPage] = useAtom(pageAtom);
  const [highlighted, setHighlighted] = useState(false);
  useCursor(highlighted);

  return (
    <group
      {...props}
      ref={group}
      onPointerEnter={(e) => {
        e.stopPropagation();
        setHighlighted(true);
      }}
      onPointerLeave={(e) => {
        e.stopPropagation();
        setHighlighted(false);
      }}
      onClick={(e) => {
        e.stopPropagation();
        setPage(opened ? number : number + 1);
        setHighlighted(false);
      }}
    >
      <primitive
        object={manualSkinnedMesh}
        ref={skinnedMeshRef}
        position-z={number * PAGE_DEPTH + page * PAGE_DEPTH}
      />
    </group>
  );
};


// メインのブックコンポーネント
export const PDFBook = ({ pdfUrl, coverpdfUrl, ...props }) => {
  const [page] = useAtom(pageAtom);
  const [delayedPage, setDelayedPage] = useState(page);
  
  //表紙用
  const { coverTextures, loading: coverLoading, error: coverError } = usePDFCover(coverpdfUrl);
  
  const { textures, loading, error } = usePDFPages(pdfUrl);

  useEffect(() => {
    let timeout;
    const goToPage = () => {
      setDelayedPage((delayedPage) => {
        if (page === delayedPage) {
          return delayedPage;
        } else {
          timeout = setTimeout(
            () => {
              goToPage();
            },
            Math.abs(page - delayedPage) > 2 ? 50 : 150
          );
          if (page > delayedPage) {
            return delayedPage + 1;
          }
          if (page < delayedPage) {
            return delayedPage - 1;
          }
        }
      });
    };
    goToPage();
    return () => {
      clearTimeout(timeout);
    };
  }, [page]);

  if (loading) {
    return null; // またはローディングインジケータ
  }

  if (error) {
    console.error("PDF loading error:", error);
    return null; // またはエラーメッセージ
  }

  if (loading || coverLoading) {
    return null;
  }

  if (error || coverError) {
    console.error("PDF loading error:", error || coverError);
    return null;
  }

  // 実際のページ数は textures.length - 1 になる（最後のページは裏面として使用）
  const pageCount = Math.floor((textures.length ));
  
  return (
    <group {...props} rotation-y={-Math.PI / 2}>
      {Array.from({ length: (textures.length/2)+2 }, (_, i) => (
        //{[...textures].map((pageData, i) => (
        <Page
          key={i}
          page={delayedPage}
          number={i}
          textures={textures}
          coverTextures={coverTextures}  // 表紙テクスチャを渡す
          opened={delayedPage > i}
          bookClosed={delayedPage === 0 || delayedPage === textures.length/2+2}
        />
      ))}
    </group>
  );
};