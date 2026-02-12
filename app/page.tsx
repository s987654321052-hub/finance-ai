"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState, useEffect, useCallback } from "react";
import * as THREE from "three";
import { gsap } from "gsap";
import { OrbitControls, Stars } from "@react-three/drei";

const detailedData = [
  { id: "stocks", category: "STOCKS", title: "AI 智能選股", content: "精準捕捉市場成長動能。" },
  { id: "bonds", category: "BONDS", title: "穩健收益配置", content: "構築資產避風港。" },
  { id: "loans", category: "LOANS", title: "智能貸款優化", content: "加速財富累積速度。" },
  { id: "insurance", category: "INSURANCE", title: "全方位風險規劃", content: "滴水不漏的全面防護。" },
  { id: "ai", category: "AI PLAN", title: "自動選股助手", content: "解放時間的自動交易。" },
];

function MorphingParticles({ shape, xOffset }: { shape: string, xOffset: number }) {
  const count = 2000;
  const mesh = useRef<THREE.Points>(null);
  const geoRef = useRef<THREE.BufferGeometry>(null);

  const { spherePositions, gridPositions, dnaPositions, colors } = useMemo(() => {
    const sphere = new Float32Array(count * 3);
    const grid = new Float32Array(count * 3);
    const dna = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const colorObj = new THREE.Color();

    for (let i = 0; i < count; i++) {
      const phi = Math.acos(-1 + (2 * i) / count);
      const theta = Math.sqrt(count * Math.PI) * phi;
      sphere[i * 3] = Math.cos(theta) * Math.sin(phi) * 2.5;
      sphere[i * 3 + 1] = Math.sin(theta) * Math.sin(phi) * 2.5;
      sphere[i * 3 + 2] = Math.cos(phi) * 2.5;

      grid[i * 3] = (i % 50) * 0.15 - 3.75;
      grid[i * 3 + 1] = Math.floor(i / 50) * 0.15 - 3;
      grid[i * 3 + 2] = 0;

      const t = (i / count) * Math.PI * 6;
      const side = i % 2 === 0 ? 1 : -1;
      dna[i * 3] = Math.cos(t) * 0.8 * side;
      dna[i * 3 + 1] = (i / count) * 6 - 3;
      dna[i * 3 + 2] = Math.sin(t) * 0.8 * side;

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
      let target = shape === "sphere" ? spherePositions : shape === "grid" ? gridPositions : dnaPositions;
      const currentPos = mesh.current.geometry.attributes.position.array as Float32Array;
      gsap.to(currentPos, { duration: 2, endArray: target as any, ease: "power3.inOut", onUpdate: () => { mesh.current!.geometry.attributes.position.needsUpdate = true; } });
      gsap.to(mesh.current.position, { x: xOffset, duration: 2, ease: "power3.inOut" });
    }
  }, [shape, xOffset, spherePositions, gridPositions, dnaPositions]);

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.y += 0.002;
      state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, state.mouse.x * 0.5, 0.05);
      state.camera.lookAt(0, 0, 0);
    }
  });

  return (
    <points ref={mesh}>
      <bufferGeometry ref={geoRef} />
      <pointsMaterial size={0.04} vertexColors={true} transparent opacity={0.8} blending={THREE.AdditiveBlending} sizeAttenuation />
    </points>
  );
}

export default function Home() {
  const [currentShape, setCurrentShape] = useState("sphere");
  const [activeIndex, setActiveIndex] = useState(0);

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

  const particleXOffset = useMemo(() => currentShape === "sphere" ? 0 : -2.5, [currentShape]);

  return (
    <main className="relative bg-[#05070a] font-sans overflow-x-hidden">
      {/* 1. 頂點 Apple 風格導航欄 */}
      <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-lg border-b border-white/10 px-10 py-4 flex justify-between items-center">
        <div className="text-white font-bold text-xl tracking-tighter">FINANCE AI</div>
        <div className="hidden md:flex gap-8 text-gray-400 text-sm">
          {["商店", "技術", "方案", "支援"].map((item) => (
            <a key={item} href="#" className="hover:text-white transition-colors">{item}</a>
          ))}
        </div>
        <button className="bg-white text-black px-4 py-1.5 rounded-full text-xs font-bold">立即開始</button>
      </nav>

      <div className="h-[300vh] w-full">
        {/* 固定背景 */}
        <div className="fixed inset-0 z-0">
          <Canvas camera={{ position: [0, 0, 8] }}>
            <color attach="background" args={["#05070a"]} />
            <Stars radius={100} count={3000} factor={4} fade />
            <MorphingParticles shape={currentShape} xOffset={particleXOffset} />
          </Canvas>
        </div>

        {/* 2. 左側上下進度點 */}
        <div className="fixed left-10 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-4">
          {["sphere", "dna", "grid"].map((s) => (
            <div key={s} className={`w-2 h-2 rounded-full transition-all duration-500 ${currentShape === s ? "bg-[#00FF41] scale-150" : "bg-white/20"}`} />
          ))}
        </div>

        {/* 內容區塊 */}
        <section className="relative z-10 h-screen flex items-center justify-center text-center">
          <h1 className="text-6xl font-bold text-white drop-shadow-2xl">用 AI 基因重構財富</h1>
        </section>

        {/* 3. 右側左右滑動內容區 (核心 Y 軸) */}
        <section className="relative z-10 h-screen flex items-center justify-end px-20">
          <div className="flex items-center gap-10 max-w-4xl">
            {/* 左箭頭 */}
            <button onClick={() => setActiveIndex(Math.max(0, activeIndex - 1))} className="text-white/30 hover:text-white text-4xl">{"<"}</button>
            
            {/* 卡片本體 */}
            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-10 rounded-3xl w-[500px] h-[350px] flex flex-col justify-between shadow-2xl">
              <div>
                <div className="text-[#00FF41] font-mono text-sm mb-4 tracking-widest">{detailedData[activeIndex].category}</div>
                <h2 className="text-4xl font-bold text-white mb-6">{detailedData[activeIndex].title}</h2>
                <p className="text-gray-400 text-lg leading-relaxed">{detailedData[activeIndex].content}</p>
              </div>
              <button className="text-white flex items-center gap-2 group">
                深入了解 <span className="group-hover:translate-x-2 transition-transform">→</span>
              </button>
            </div>

            {/* 右箭頭 */}
            <button onClick={() => setActiveIndex(Math.min(detailedData.length - 1, activeIndex + 1))} className="text-white/30 hover:text-white text-4xl">{">"}</button>
          </div>
        </section>

        <section className="relative z-10 h-screen flex flex-col items-center justify-center">
           <h2 className="text-white text-2xl opacity-50 italic">探索理財的未來形態</h2>
        </section>
      </div>
    </main>
  );
}