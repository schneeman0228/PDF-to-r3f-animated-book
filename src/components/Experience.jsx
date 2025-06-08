import { Environment, Float, OrbitControls } from "@react-three/drei";
//import { PDFBook } from "./Book_comic";
import { PDFBook } from "./Book_novel";

export const Experience = () => {
  return (
    <>
      <PDFBook 
          pdfUrl="https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf"
          coverpdfUrl="https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf"
    
          //pdfUrl="/textures/B6.pdf"  // PDFファイルへのパスを指定
          //coverpdfUrl="/textures/cover.pdf"  // PDFファイルへのパスを指定
          position={[0, 0, 0]}
          scale={1}
      />
      <OrbitControls />
      <Environment preset="studio"></Environment>
      <directionalLight
        position={[5, 5, 10]}
        intensity={0.05}
        //castShadow
        //shadow-mapSize-width={2048}
        //shadow-mapSize-height={2048}
        //shadow-bias={-0.0001}
      />
      
    </>
  );
};

/*
returnの中に入ってた
<mesh position-y={-1.5} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <shadowMaterial transparent opacity={0.2} />
      </mesh>
      */
