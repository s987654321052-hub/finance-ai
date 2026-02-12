"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState, useEffect, useCallback } from "react";
import * as THREE from "three";
import { gsap } from "gsap";
import { OrbitControls, Stars } from "@react-three/drei";

// 詳細數據內容，點擊後會彈出顯示
const detailedData = {
  "STOCKS & FUNDS": {
    title: "AI 智能選股策略",
    description: "透過深度學習模型分析市場情緒、財務報告與宏觀經濟數據，為您推薦最具成長潛力的股票與基金組合，實現超額收益。",
    metrics: [
      { label: "預期年化收益", value: "18.5%", color: "text-green-400" },
      { label: "波動率", value: "中", color: "text-yellow-400" },
      { label: "歷史勝率", value: "78%", color: "text-blue-400" },
    ],
    chartData: [10, 20, 15, 30, 25, 40] // 簡化數據，實際可繪製圖表
  },
  "BONDS": {
    title: "穩健收益債券配置",
    description: "結合 AI 風險評估，篩選高評級公司債與國債，提供穩健的現金流與資產保值，降低市場波動衝擊。",
    metrics: [
      { label: "預期年化收益", value: "4.2%", color: "text-blue-400" },
      { label: "風險評級", value: "低", color: "text-green-400" },
      { label: "分散度", value: "高", color: "text-green-400" },
    ],
    chartData: [5, 8, 7, 9, 6, 10]
  },
  "LOANS": {
    title: "智能貸款優化方案",
    description: "分析您的財務狀況，智能匹配最佳利率與還款週期，將貸款負擔轉化為槓桿工具，加速財富增長。",
    metrics: [
      { label: "平均節省利息", value: "1.2%", color: "text-green-400" },
      { label: "審批時間", value: "24小時", color: "text-blue-400" },
      { label: "用戶滿意度", value: "92%", color: "text-yellow-400" },
    ],
    chartData: [2, 4, 3, 5, 4, 6]
  },
  "INSURANCE": {
    title: "全方位智能風險規劃",
    description: "基於個人生命週期與風險偏好，智能定制保障計畫，從健康醫療到資產傳承，提供滴水不漏的全面防護。",
    metrics: [
      { label: "保障範圍", value: "廣", color: "text-green-400" },
      { label: "定制化程度", value: "高", color: "text-blue-400" },
      { label: "理賠速度", value: "快", color: "text-green-400" },
    ],
    chartData: [1, 2, 1, 3, 2, 4]
  },
  "AI PLAN": {
    title: "AI 自動選股助手 v1.0",
    description: "正在開發中：透過實時數據流與機器學習演算法，實現全自動化的市場監測與交易執行，解放您的時間。",
    metrics: [
      { label: "預期發布", value: "2024 Q3", color: "text-yellow-400" },
      { label: "核心技術", value: "LLM + ML", color: "text-blue-400" },
      { label: "合作夥伴", value: "待定", color: "text-gray-400" },
    ],
    chartData: [0, 0, 0, 0, 0, 0]
  }
};


function MorphingParticles({ shape, particleXOffset }: { shape: string, particleXOffset: number }) {
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
      // 粒子本身 X 軸偏移的動畫
      gsap.to(mesh.current.position, {
        x: particleXOffset,
        duration: 2,
        ease: "power3.inOut"
      });
    }
  }, [shape, particleXOffset, spherePositions, gridPositions, dnaPositions]);

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.y += 0.002;
      mesh.current.rotation.x = THREE.MathUtils.lerp(mesh.current.rotation.x, state.mouse.y * 0.2, 0.05);
      // 鏡頭微幅跟隨滑鼠移動
      state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, state.mouse.x * 1, 0.05);
      state.camera.lookAt(0, 0, 0); // 確保鏡頭持續看著中心
    }
  });

  return (
    <points ref={mesh}>
      <bufferGeometry ref={geoRef} />
      <pointsMaterial 
        size={0.04} 
        vertexColors={true}
        transparent={true} 
        opacity={0.8} 
        blending={THREE.AdditiveBlending}
        sizeAttenuation={true} 
      />
    </points>
  );
}

export default function Home() {
  const [currentShape, setCurrentShape] = useState("sphere");
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");

  const handleOpenDetail = useCallback((category: string) => {
    setSelectedCategory(category);
    setIsDetailOpen(true);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setIsDetailOpen(false);
    setSelectedCategory("");
  }, []);

  // 監聽捲動事件自動切換形態和粒子位置
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

  // 根據形狀調整粒子 X 軸偏移，為右側 UI 騰出空間
  const particleXOffset = useMemo(() => {
    if (currentShape === "sphere") return 0;
    if (currentShape === "dna") return -1.5; // DNA 時稍微往左
    return -2.5; // 網格時大幅往左
  }, [currentShape]);


  const currentDetail = selectedCategory ? detailedData[selectedCategory as keyof typeof detailedData] : null;

  return (
    <main className="relative bg-[#05070a] font-sans overflow-x-hidden">
      <div className="h-[300vh] w-full">
        {/* 固定背景 Canvas，背景模糊效果 */}
        <div className={`fixed inset-0 z-0 transition-all duration-500 ${isDetailOpen ? 'filter blur-sm brightness-50' : ''}`}>
          <Canvas camera={{ position: [0, 0, 8] }}>
            <color attach="background" args={["#05070a"]} />
            <Stars radius={100} count={3000} factor={4} fade />
            <MorphingParticles shape={currentShape} particleXOffset={particleXOffset} />
            <OrbitControls enableZoom={false} />
          </Canvas>
        </div>

        {/* UI 內容疊層 - 第一屏：歡迎 */}
        <section className="relative z-10 h-screen flex flex-col items-center justify-center pointer-events-none text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
            用 AI 驅動理財
          </h1>
          <p className="text-[#00FF41] text-lg tracking-[0.5em] mb-20">
            FINANCE • AI • FUTURE
          </p>
          <p className="text-gray-500 text-sm animate-bounce">
            向下捲動探索無限可能
          </p>
        </section>

        {/* UI 內容疊層 - 第二屏：核心技術與右側選單 */}
        <section className="relative z-10 h-screen flex items-center justify-center p-8">
            <div className="w-1/2 flex flex-col justify-center items-center pointer-events-none pr-4 text-center">
                <h2 className="text-4xl font-bold text-white mb-4 drop-shadow-md">
                    核心進化技術
                </h2>
                <p className="text-gray-400 max-w-md">
                    如同 DNA 般精密的運算法則，為您的資產注入成長基因。
                </p>
            </div>

            {/* 右側固定選單 */}
            <div className="w-1/2 fixed right-0 h-screen top-0 flex items-center justify-center pointer-events-auto">
                <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 md:p-8 w-64 md:w-80 flex flex-col gap-4">
                    <h3 className="text-white text-xl font-bold mb-2">理財服務清單</h3>
                    {Object.keys(detailedData).map((category, index) => (
                        <button
                            key={index}
                            onClick={() => handleOpenDetail(category)}
                            className={`block w-full text-left py-3 px-4 rounded-lg transition-all text-sm font-medium
                                ${selectedCategory === category ? 'bg-[#00FF41] text-black' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}
                        >
                            {detailedData[category as keyof typeof detailedData].title}
                        </button>
                    ))}
                </div>
            </div>
        </section>

        {/* UI 內容疊層 - 第三屏：理財智庫卡片 */}
        <section className="relative z-10 h-screen flex flex-col items-center justify-center p-8">
            <h2 className="text-4xl font-bold text-white mb-10 drop-shadow-md">
                跨界理財方案
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl pointer-events-auto">
                {Object.values(detailedData).map((item, index) => (
                    <div key={index} 
                         className="bg-black/40 border border-white/10 p-6 rounded-2xl backdrop-blur-md hover:border-[#00FF41] transition-all group cursor-pointer"
                         onClick={() => handleOpenDetail(Object.keys(detailedData)[index])}>
                        <div className="text-[#00FF41] text-xs mb-2">{Object.keys(detailedData)[index]}</div>
                        <h3 className="text-white text-xl font-bold mb-4">{item.title}</h3>
                        <p className="text-gray-400 text-sm line-clamp-3">{item.description}</p>
                    </div>
                ))}
            </div>
        </section>
      </div>

      {/* 彈出詳情頁 */}
      {isDetailOpen && currentDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-black/70 backdrop-blur-xl border border-[#00FF41]/30 rounded-3xl p-8 md:p-12 max-w-3xl w-full text-white relative shadow-2xl animate-fade-in-up">
            <button 
              onClick={handleCloseDetail} 
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-3xl font-light leading-none"
            >
              &times;
            </button>
            <h2 className="text-4xl font-bold text-[#00FF41] mb-6">{currentDetail.title}</h2>
            <p className="text-gray-300 text-lg leading-relaxed mb-8">{currentDetail.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {currentDetail.metrics.map((metric, idx) => (
                <div key={idx} className="bg-white/5 p-4 rounded-xl flex flex-col items-center justify-center text-center">
                  <p className={`text-4xl font-bold ${metric.color} mb-1`}>{metric.value}</p>
                  <p className="text-gray-400 text-sm">{metric.label}</p>
                </div>
              ))}
            </div>

            {/* 簡化的圖表區域 */}
            <div className="h-40 bg-white/5 rounded-xl p-4 flex items-end">
                {currentDetail.chartData.map((val, idx) => (
                    <div key={idx} 
                         className="flex-1 bg-[#00FF41] mx-1 rounded-sm transition-all duration-500" 
                         style={{ height: `${val * 2}%` }}> {/* 乘以比例放大高度 */}
                    </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}