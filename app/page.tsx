"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { gsap } from "gsap";
import { OrbitControls, Stars } from "@react-three/drei";

// 1. 抽離資料，避免重複渲染
const financeData = [
  { category: "STOCKS & FUNDS", title: "市場洞察與佈局", content: "結合 AI 趨勢分析與數據建模，精準捕捉市場成長動能。" },
  { category: "BONDS", title: "穩健收益基石", content: "精選高品質債券配置，在動盪市場中構築資產避風港。" },
  { category: "LOANS", title: "槓桿與財務優化", content: "優化貸款結構與財務槓桿，將債務轉化為財富助力。" },
  { category: "INSURANCE", title: "全面風險屏障", content: "從傳承與守護出發，構建多層次的保障計畫。" },
  { category: "AI PLAN", title: "正在進行的計畫", content: "開發中：AI 自動選股助手 v1.0。透過代碼實現自動化。" },
];

function MorphingParticles({ shape }: { shape: string }) {
  const count = 1200; // 輕量化：減少點數
  const mesh = useRef<THREE.Points>(null);

  // 優化：只計算一次座標
  const { spherePositions, gridPositions } = useMemo(() => {
    const sphere = new Float32Array(count * 3);
    const grid = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const phi = Math.acos(-1 + (2 * i) / count);
      const theta = Math.sqrt(count * Math.PI) * phi;
      sphere[i * 3] = Math.cos(theta) * Math.sin(phi) * 2;
      sphere[i * 3 + 1] = Math.sin(theta) * Math.sin(phi) * 2;
      sphere[i * 3 + 2] = Math.cos(phi) * 2;

      grid[i * 3] = (i % 40) * 0.15 - 3;
      grid[i * 3 + 1] = Math.floor(i / 40) * 0.15 - 2;
      grid[i * 3 + 2] = 0;
    }
    return { spherePositions: sphere, gridPositions: grid };
  }, []);

  useEffect(() => {
    if (mesh.current) {
      const target = shape === "sphere" ? spherePositions : gridPositions;
      const currentPos = mesh.current.geometry.attributes.position.array as Float32Array;
      
      gsap.to(currentPos, {
        duration: 1.5, // 縮短時間，增加流暢感
        endArray: target as any,
        ease: "expo.out",
        onUpdate: () => {
          mesh.current!.geometry.attributes.position.needsUpdate = true;
        },
      });
    }
  }, [shape, spherePositions, gridPositions]);

  useFrame(() => {
    if (mesh.current) mesh.current.rotation.y += 0.001; // 減慢轉速，降低渲染壓力
  });

  return (
    {/* 修正後的粒子渲染區塊 */}
<points ref={mesh}>
  <bufferGeometry>
    <bufferAttribute
      attach="attributes-position"
      count={count}
      array={spherePositions}
      itemSize={3}
    />
  </bufferGeometry>
  <pointsMaterial 
    size={0.035} 
    color="#00FF41" 
    transparent={true} 
    opacity={0.6} 
    sizeAttenuation={true} 
  />
</points>
  );
}

export default function Home() {
  const [currentShape, setCurrentShape] = useState("sphere");

  return (
    <main className="relative h-screen w-full bg-[#05070a] overflow-hidden font-sans">
      {/* 輕量化 UI：移除 backdrop-blur，改用 rgba 背景 */}
      <div className="absolute z-20 top-10 left-10 pointer-events-none">
        <h1 className="text-3xl font-bold text-white drop-shadow-md">
          {currentShape === "sphere" ? "用 AI 驅動理財" : "跨界理財方案"}
        </h1>
        <p className="text-[#00FF41] text-xs tracking-[0.3em] mt-1">FINANCE • AI • COMMUNITY</p>
      </div>

      {currentShape === "grid" && (
        <div className="absolute z-30 inset-0 flex items-center justify-center p-8 bg-black/60">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl">
            {financeData.map((item, index) => (
              <div key={index} className="bg-[#111] border border-white/10 p-5 rounded-xl hover:border-[#00FF41] transition-colors">
                <div className="text-[#00FF41] text-[10px] mb-1 opacity-50">{item.category}</div>
                <h3 className="text-white text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-gray-400 text-xs leading-relaxed">{item.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="absolute z-40 bottom-10 left-1/2 -translate-x-1/2 flex gap-4">
        <button onClick={() => setCurrentShape("sphere")} className={`px-6 py-2 rounded-full border text-sm transition-all ${currentShape === "sphere" ? "bg-[#00FF41] text-black font-bold" : "text-[#00FF41] border-[#00FF41]"}`}>首頁</button>
        <button onClick={() => setCurrentShape("grid")} className={`px-6 py-2 rounded-full border text-sm transition-all ${currentShape === "grid" ? "bg-[#00FF41] text-black font-bold" : "text-[#00FF41] border-[#00FF41]"}`}>理財智庫</button>
      </div>

      <Canvas camera={{ position: [0, 0, 7] }} dpr={[1, 2]}> {/* 限制像素比，優化效能 */}
        <color attach="background" args={["#05070a"]} />
        <Stars radius={100} count={2000} factor={4} fade />
        <MorphingParticles shape={currentShape} />
        <OrbitControls enableZoom={false} />
      </Canvas>
    </main>
  );
}