"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { gsap } from "gsap";
import { OrbitControls, Stars } from "@react-three/drei";

const financeData = [
  { category: "STOCKS & FUNDS", title: "市場洞察與佈局", content: "結合 AI 趨勢分析與數據建模，精準捕捉市場成長動能。" },
  { category: "BONDS", title: "穩健收益基石", content: "精選高品質債券配置，在動盪市場中構築資產避風港。" },
  { category: "LOANS", title: "槓桿與財務優化", content: "優化貸款結構與財務槓桿，將債務轉化為財富助力。" },
  { category: "INSURANCE", title: "全面風險屏障", content: "從傳承與守護出發，構建多層次的保障計畫。" },
  { category: "AI PLAN", title: "正在進行的計畫", content: "開發中：AI 自動選股助手 v1.0。透過代碼實現自動化。" },
];

function MorphingParticles({ shape }: { shape: string }) {
  const count = 2000; // 增加點數讓彩色效果更細膩
  const mesh = useRef<THREE.Points>(null);
  const geoRef = useRef<THREE.BufferGeometry>(null);

  // 1. 計算三種形態與彩色數據
  const { spherePositions, gridPositions, dnaPositions, colors } = useMemo(() => {
    const sphere = new Float32Array(count * 3);
    const grid = new Float32Array(count * 3);
    const dna = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const colorObj = new THREE.Color();

    for (let i = 0; i < count; i++) {
      // 球體
      const phi = Math.acos(-1 + (2 * i) / count);
      const theta = Math.sqrt(count * Math.PI) * phi;
      sphere[i * 3] = Math.cos(theta) * Math.sin(phi) * 2.5;
      sphere[i * 3 + 1] = Math.sin(theta) * Math.sin(phi) * 2.5;
      sphere[i * 3 + 2] = Math.cos(phi) * 2.5;

      // 網格
      grid[i * 3] = (i % 50) * 0.15 - 3.75;
      grid[i * 3 + 1] = Math.floor(i / 50) * 0.15 - 3;
      grid[i * 3 + 2] = 0;

      // DNA (彩色影片核心)
      const t = (i / count) * Math.PI * 6;
      const side = i % 2 === 0 ? 1 : -1;
      dna[i * 3] = Math.cos(t) * 0.8 * side;
      dna[i * 3 + 1] = (i / count) * 6 - 3;
      dna[i * 3 + 2] = Math.sin(t) * 0.8 * side;

      // 顏色設定：從青色到紫色的漸層
      const pct = i / count;
      colorObj.setHSL(0.5 + pct * 0.3, 0.8, 0.5); 
      colors[i * 3] = colorObj.r;
      colors[i * 3 + 1] = colorObj.g;
      colors[i * 3 + 2] = colorObj.b;
    }
    return { spherePositions: sphere, gridPositions: grid, dnaPositions: dna, colors };
  }, []);

  useEffect(() => {
    if (geoRef.current) {
      geoRef.current.setAttribute('position', new THREE.BufferAttribute(spherePositions, 3));
      geoRef.current.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    }
  }, [spherePositions, colors]);

  useEffect(() => {
    if (mesh.current) {
      let target;
      if (shape === "sphere") target = spherePositions;
      else if (shape === "grid") target = gridPositions;
      else target = dnaPositions;

      const currentPos = mesh.current.geometry.attributes.position.array as Float32Array;
      gsap.to(currentPos, {
        duration: 2,
        endArray: target as any,
        ease: "power3.inOut",
        onUpdate: () => {
          mesh.current!.geometry.attributes.position.needsUpdate = true;
        },
      });
    }
  }, [shape, spherePositions, gridPositions, dnaPositions]);

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.y += 0.002;
      // 微小的滑鼠視差效果
      mesh.current.rotation.x = THREE.MathUtils.lerp(mesh.current.rotation.x, state.mouse.y * 0.2, 0.05);
    }
  });

  return (
    <points ref={mesh}>
      <bufferGeometry ref={geoRef} />
      <pointsMaterial 
        size={0.04} 
        vertexColors={true} // 開啟頂點色彩
        transparent={true} 
        opacity={0.8} 
        blending={THREE.AdditiveBlending} // 發光效果
        sizeAttenuation={true} 
      />
    </points>
  );
}

export default function Home() {
  const [currentShape, setCurrentShape] = useState("sphere");

  // 監聽捲動事件自動切換形態
  useEffect(() => {
    const handleScroll = () => {
      const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      if (scrollPercent < 0.3) setCurrentShape("sphere");
      else if (scrollPercent < 0.7) setCurrentShape("dna");
      else setCurrentShape("grid");
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="relative bg-[#05070a] font-sans">
      {/* 增加頁面高度以產生捲動感 */}
      <div className="h-[300vh] w-full">
        {/* 固定背景 Canvas */}
        <div className="fixed inset-0 z-0">
          <Canvas camera={{ position: [0, 0, 8] }}>
            <color attach="background" args={["#05070a"]} />
            <Stars radius={100} count={3000} factor={4} fade />
            <MorphingParticles shape={currentShape} />
            <OrbitControls enableZoom={false} />
          </Canvas>
        </div>

        {/* UI 內容疊層 */}
        <section className="relative z-10 h-screen flex flex-col items-center justify-center pointer-events-none">
          <h1 className="text-5xl font-bold text-white mb-2">用 AI 驅動理財</h1>
          <p className="text-[#00FF41] tracking-[0.5em]">FINANCE • AI • FUTURE</p>
          <p className="text-gray-500 mt-20 animate-bounce">往下捲動探索</p>
        </section>

        <section className="relative z-10 h-screen flex flex-col items-center justify-center">
          <h2 className="text-4xl font-bold text-white mb-4">核心進化技術</h2>
          <p className="text-gray-400 max-w-md text-center">如同 DNA 般精密的運算法則，為您的資產注入成長基因。</p>
        </section>

        <section className="relative z-10 h-screen flex items-center justify-center p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl pointer-events-auto">
            {financeData.slice(0, 3).map((item, index) => (
              <div key={index} className="bg-black/40 border border-white/10 p-8 rounded-2xl backdrop-blur-md hover:border-[#00FF41] transition-all group">
                <div className="text-[#00FF41] text-xs mb-2">{item.category}</div>
                <h3 className="text-white text-xl font-bold mb-4">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.content}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}