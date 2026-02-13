"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { gsap } from "gsap";
import { OrbitControls, Stars } from "@react-three/drei";

// --- 資料定義區 ---

const SECTIONS = [
  { id: "intro", title: "About Me", sub: "個人簡介" },
  { id: "company", title: "Company", sub: "諾億保險經紀人" },
  { id: "service", title: "Services", sub: "金融與貸款服務" },
  { id: "invest", title: "Investment", sub: "全球資產佈局" },
  { id: "ai", title: "AI Lab", sub: "智能運算實驗室" },
];

// 股市跑馬燈資料
const STOCK_DATA = [
  { symbol: "NVDA", price: "726.50", change: "+2.5%", up: true },
  { symbol: "TSLA", price: "198.20", change: "-1.2%", up: false },
  { symbol: "AAPL", price: "182.40", change: "+0.8%", up: true },
  { symbol: "BTC", price: "52,100", change: "+3.0%", up: true },
  { symbol: "TWD/USD", price: "31.4", change: "-0.1%", up: false },
  { symbol: "0050.TW", price: "145.6", change: "+1.1%", up: true },
  { symbol: "AMD", price: "178.9", change: "+4.2%", up: true },
  { symbol: "MSFT", price: "409.5", change: "+0.5%", up: true },
];

// 合作夥伴 (信任牆) 資料
const PARTNERS = [
  { name: "中國信託", icon: "CTBC" },
  { name: "國泰世華", icon: "CATHAY" },
  { name: "富邦金控", icon: "FUBON" },
  { name: "安聯人壽", icon: "ALLIANZ" },
  { name: "全球人壽", icon: "TRANSGLOBE" },
  { name: "遠雄人壽", icon: "FGLIFE" },
];

const CONTENT_DATA = {
  intro: {
    title: "Oliver Chang",
    role: "Financial Consultant & AI Developer",
    desc: "連結金融專業與人工智慧的橋樑。致力於利用數據驅動的決策模型，為客戶創造長期且穩健的財富增長。",
    tags: ["資產配置", "Python 開發", "風險管理"],
  },
  company: {
    title: "諾億保險經紀人",
    role: "LLOYD'S INSURANCE BROKER",
    desc: "像海豚一樣充滿智慧與友善。我們提供客製化的保險規劃，站在客戶立場，從全市場篩選最合適的保障方案。",
    tags: ["產壽險規劃", "企業團保", "稅務傳承"],
  },
  service: {
    title: "銀行金融服務",
    role: "BANKING & LOANS",
    desc: "不只是貸款，更是財務結構的優化。透過精準的貸款健診，協助您降低利息支出，活化資產流動性。",
    items: [
      { label: "信用貸款", val: "低利專案" },
      { label: "房屋貸款", val: "成數優化" },
      { label: "債務整合", val: "降低月付" },
    ],
  },
  invest: {
    title: "全球投資佈局",
    role: "GLOBAL ALLOCATION",
    desc: "跨越國界的資產配置。利用 AI 監測全球資金流向，動態調整股票、債券與基金比例，捕捉市場 alpha 值。",
    stats: [
      { label: "美股配置", val: "40%" },
      { label: "全球債券", val: "30%" },
      { label: "新興市場", val: "20%" },
    ],
  },
  ai: {
    title: "AI 實驗室 & 教學",
    role: "FUTURE TECH",
    desc: "正在進行的計畫：將複雜的投資邏輯轉化為自動化代碼。分享如何利用 LLM 輔助投資決策。",
    projects: [
      { name: "AI 選股助手 v1.0", progress: 85 },
      { name: "自動化財報分析", progress: 60 },
      { name: "教學部落格架設", progress: 40 },
    ],
  },
};

// --- 3D 粒子組件 ---

function MorphingParticles({ shape }: { shape: string }) {
  const count = 3000;
  const mesh = useRef<THREE.Points>(null);
  const geoRef = useRef<THREE.BufferGeometry>(null);

  // 將 matrix 改為 chip
  const { sphere, wave, ring, globe, chip, colors } = useMemo(() => {
    const spherePos = new Float32Array(count * 3);
    const wavePos = new Float32Array(count * 3);
    const ringPos = new Float32Array(count * 3);
    const globePos = new Float32Array(count * 3);
    // const matrixPos = new Float32Array(count * 3); // 移除舊的
    const chipPos = new Float32Array(count * 3); // 新增晶片資料
    const cols = new Float32Array(count * 3);
    const colorObj = new THREE.Color();

    // 計算晶片網格的邊長 (根號3000大約是54.7)
    const sideNum = Math.ceil(Math.sqrt(count));

    for (let i = 0; i < count; i++) {
      // 1. Sphere
      const phi = Math.acos(-1 + (2 * i) / count);
      const theta = Math.sqrt(count * Math.PI) * phi;
      spherePos[i * 3] = Math.cos(theta) * Math.sin(phi) * 2.5;
      spherePos[i * 3 + 1] = Math.sin(theta) * Math.sin(phi) * 2.5;
      spherePos[i * 3 + 2] = Math.cos(phi) * 2.5;

      // 2. Wave
      const x = (i / count) * 10 - 5; 
      const y = Math.sin(x * 2) * 0.5 + (Math.random() - 0.5) * 2;
      const z = (i % 20) * 0.2 - 2;
      wavePos[i * 3] = x;
      wavePos[i * 3 + 1] = y;
      wavePos[i * 3 + 2] = z;

      // 3. Ring
      const angle = (i / count) * Math.PI * 2 * 3; 
      const radius = 3 + Math.random() * 0.5;
      ringPos[i * 3] = Math.cos(angle) * radius;
      ringPos[i * 3 + 1] = (i / count) * 4 - 2; 
      ringPos[i * 3 + 2] = Math.sin(angle) * radius;

      // 4. Globe
      const gPhi = Math.acos(-1 + (2 * i) / count);
      const gTheta = Math.sqrt(count * Math.PI) * gPhi;
      globePos[i * 3] = Math.cos(gTheta) * Math.sin(gPhi) * 3;
      globePos[i * 3 + 1] = Math.sin(gTheta) * Math.sin(gPhi) * 3;
      globePos[i * 3 + 2] = Math.cos(gPhi) * 3;

      // 5. Microchip (晶片) - 全新邏輯
      // 計算網格行列
      const col = i % sideNum;
      const row = Math.floor(i / sideNum);
      
      // 將網格映射到 3D 空間座標 (X-Z 平面)
      const chipX = (col / sideNum - 0.5) * 8; // 寬度範圍 -4 到 4
      const chipZ = (row / sideNum - 0.5) * 8; // 深度範圍 -4 到 4
      let chipY = 0; // 預設是扁平的

      // 增加細節：中心隆起模擬 CPU 核心
      const centerDist = Math.sqrt(chipX * chipX + chipZ * chipZ);
      if (centerDist < 1.5) {
        chipY = 0.5; // 中心突起
      } else {
        // 增加細節：模擬電路板的紋理軌跡 (每隔幾行幾列稍微墊高)
        if (col % 6 === 0 || row % 6 === 0) {
            chipY = 0.1; 
        }
      }

      chipPos[i * 3] = chipX;
      chipPos[i * 3 + 1] = chipY;
      chipPos[i * 3 + 2] = chipZ;

      // 顏色
      const pct = i / count;
      colorObj.setHSL(0.4 + pct * 0.2, 0.8, 0.6);
      cols[i * 3] = colorObj.r;
      cols[i * 3 + 1] = colorObj.g;
      cols[i * 3 + 2] = colorObj.b;
    }
    
    return { 
        sphere: spherePos, 
        wave: wavePos, 
        ring: ringPos, 
        globe: globePos, 
        chip: chipPos, // 回傳新的晶片資料
        colors: cols 
    };
  }, []);

  useEffect(() => {
    if (geoRef.current) {
      geoRef.current.setAttribute('position', new THREE.BufferAttribute(sphere, 3));
      geoRef.current.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    }
  }, [sphere, colors]);

  useEffect(() => {
    if (mesh.current) {
      let target;
      switch (shape) {
        case "company": target = wave; break;
        case "service": target = ring; break;
        case "invest": target = globe; break;
        case "ai": target = chip; break; // 改為切換到晶片
        default: target = sphere; break;
      }

      const currentPos = mesh.current.geometry.attributes.position.array as Float32Array;
      
      gsap.to(currentPos, {
        duration: 2.5,
        endArray: target as any,
        ease: "power3.inOut",
        onUpdate: () => {
          if (mesh.current) mesh.current.geometry.attributes.position.needsUpdate = true;
        },
      });
      
      // 保持粒子靠左
      gsap.to(mesh.current.position, {
        x: -2.5, 
        duration: 2,
        ease: "power2.inOut"
      });
    }
  }, [shape, sphere, wave, ring, globe, chip]); // 依賴項加入 chip

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.y += 0.002;
      mesh.current.rotation.x = THREE.MathUtils.lerp(mesh.current.rotation.x, state.mouse.y * 0.1, 0.05);
      mesh.current.rotation.y = THREE.MathUtils.lerp(mesh.current.rotation.y, state.mouse.x * 0.1 + (state.clock.elapsedTime * 0.05), 0.05);
    }
  });

  return (
    <points ref={mesh}>
      <bufferGeometry ref={geoRef} />
      <pointsMaterial size={0.04} vertexColors={true} transparent opacity={0.8} blending={THREE.AdditiveBlending} sizeAttenuation />
    </points>
  );
}

// --- 新增組件：股市跑馬燈 ---
function StockTicker() {
  // 定義狀態：一開始是空的陣列
  const [tickerData, setTickerData] = useState([
    { symbol: "LOADING...", price: "---", change: "---", up: true }
  ]);

  // 這裡是你的 Google Apps Script 網址 (請換成你剛剛複製的那一串！)
  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxXab8-1UMzKkPa88T9gzDAAXJUoiNt6bfDJzPNfw9pK13KoeCPhXDOLkBGu3e1o8Te/exec";

  useEffect(() => {
    // 定義抓取資料的函式
    const fetchData = async () => {
      try {
        const response = await fetch(GOOGLE_SCRIPT_URL);
        const data = await response.json();
        // 成功抓到後，更新狀態
        setTickerData(data);
      } catch (error) {
        console.error("Error fetching stock data:", error);
        // 如果失敗，可以設定回預設值，或保持 Loading
      }
    };

    fetchData(); // 執行抓取

    // 選用：每 30 秒自動更新一次 (讓它更像真的看盤軟體)
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-0 left-0 w-full bg-black/80 backdrop-blur-md border-t border-white/10 z-50 py-2 overflow-hidden flex items-center">
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
          white-space: nowrap;
          display: flex;
          gap: 3rem;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
      <div className="flex items-center gap-2 px-4 border-r border-white/20 z-10 bg-black/80">
        <span className="w-2 h-2 bg-[#00FF41] rounded-full animate-pulse"></span>
        <span className="text-[#00FF41] text-xs font-bold tracking-widest">LIVE</span>
      </div>
      <div className="animate-marquee pl-4">
        {tickerData.map((stock, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span className="text-white font-bold">{stock.symbol}</span>
            <span className="text-gray-400">{stock.price}</span>
            <span className={`${stock.up ? 'text-green-400' : 'text-red-400'} flex items-center`}>
              {stock.up ? '▲' : '▼'} {stock.change}
            </span>
          </div>
        ))}
        {/* 重複一次以確保無縫銜接感 */}
        {tickerData.map((stock, i) => (
          <div key={`dup-${i}`} className="flex items-center gap-2 text-sm">
            <span className="text-white font-bold">{stock.symbol}</span>
            <span className="text-gray-400">{stock.price}</span>
            <span className={`${stock.up ? 'text-green-400' : 'text-red-400'} flex items-center`}>
              {stock.up ? '▲' : '▼'} {stock.change}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- 主頁面組件 ---

export default function Home() {
  const [activeSection, setActiveSection] = useState("intro");
  const [showDashboard, setShowDashboard] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const h = window.innerHeight;
      
      // 調整判斷閾值
      if (scrollY < h * 0.6) setActiveSection("intro");
      else if (scrollY < h * 1.6) setActiveSection("company");
      else if (scrollY < h * 2.6) setActiveSection("service");
      else if (scrollY < h * 3.6) setActiveSection("invest");
      else setActiveSection("ai");
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <main className="relative bg-[#05070a] font-sans text-white overflow-x-hidden selection:bg-[#00FF41] selection:text-black pb-12">
      
      {/* 1. 頂部導航 */}
      <nav className="fixed top-0 w-full z-50 bg-black/60 backdrop-blur-md border-b border-white/10 px-6 py-4 flex justify-between items-center transition-all">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => scrollToSection("intro")}>
            <div className="w-8 h-8 bg-gradient-to-br from-[#00FF41] to-blue-500 rounded-full flex items-center justify-center font-bold text-black text-xs">
                O
            </div>
            <span className="font-bold tracking-wide text-lg">Oliver.C</span>
        </div>
        <div className="hidden md:flex gap-6 text-sm font-medium text-gray-400">
          {SECTIONS.map((s) => (
            <button 
              key={s.id} 
              onClick={() => scrollToSection(s.id)}
              className={`${activeSection === s.id ? "text-[#00FF41]" : "hover:text-white"} transition-colors cursor-pointer bg-transparent border-none`}
            >
              {s.title}
            </button>
          ))}
        </div>
        <button className="bg-white/10 hover:bg-[#00FF41] hover:text-black border border-white/20 px-4 py-2 rounded-full text-xs transition-all">
          聯絡我
        </button>
      </nav>

      {/* 2. 背景 3D Canvas */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 8] }}>
          <color attach="background" args={["#05070a"]} />
          <Stars radius={100} count={3000} factor={4} fade />
          <MorphingParticles shape={activeSection} />
          <ambientLight intensity={0.5} />
        </Canvas>
      </div>

      {/* 3. 左側進度條 */}
      <div className="fixed left-8 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col gap-6">
        {SECTIONS.map((s) => (
          <div 
            key={s.id} 
            className="group flex items-center gap-4 cursor-pointer"
            onClick={() => scrollToSection(s.id)}
          >
            <div className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${activeSection === s.id ? "bg-[#00FF41] scale-150 ring-4 ring-[#00FF41]/20" : "bg-white/20 group-hover:bg-white"}`} />
            <span className={`text-xs tracking-widest transition-all duration-500 ${activeSection === s.id ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}`}>
              {s.sub}
            </span>
          </div>
        ))}
      </div>

      {/* 4. 內容區塊 */}
      <div className="relative z-10">
        
        {/* Section 1: Intro */}
        <section id="intro" className="h-screen w-full flex items-center justify-end px-4 md:px-20">
          <div className="w-full md:w-1/2 max-w-xl">
             <div className="relative animate-fade-in">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-2 border-[#00FF41] p-1 mb-6 overflow-hidden bg-gray-800">
                    <img src="/avatar.jpg" alt="Oliver" className="w-full h-full object-cover rounded-full" />
                </div>
                <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
                  {CONTENT_DATA.intro.title}
                </h1>
                <p className="text-[#00FF41] text-lg mb-6 font-mono">{CONTENT_DATA.intro.role}</p>
                <p className="text-gray-400 leading-relaxed text-lg mb-8">
                  {CONTENT_DATA.intro.desc}
                </p>
                <div className="flex gap-3 flex-wrap">
                  {CONTENT_DATA.intro.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 border border-white/20 rounded-full text-xs text-gray-300">
                      {tag}
                    </span>
                  ))}
                </div>
             </div>
          </div>
        </section>

        {/* Section 2: Company (合作夥伴牆) */}
        <section id="company" className="h-screen w-full flex items-center justify-end px-4 md:px-20 bg-gradient-to-b from-transparent to-black/20">
          <div className="w-full md:w-1/2 max-w-xl p-8 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 hover:border-[#00FF41]/50 transition-all duration-500">
             <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-white rounded-lg p-2 flex items-center justify-center">
                   <img src="/logo.png" alt="Lloyds" className="w-full h-auto" />
                </div>
                <div>
                   <h2 className="text-2xl font-bold text-white">{CONTENT_DATA.company.title}</h2>
                   <p className="text-xs text-[#00FF41] tracking-widest">{CONTENT_DATA.company.role}</p>
                </div>
             </div>
             <p className="text-gray-300 leading-relaxed mb-6 border-l-2 border-[#00FF41] pl-4">
               {CONTENT_DATA.company.desc}
             </p>
             
             {/* 信任牆 - 合作夥伴 Logo */}
             <div className="mt-8 pt-6 border-t border-white/10">
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-4">Trusted Partners</p>
                <div className="grid grid-cols-3 gap-3">
                    {PARTNERS.map((p, idx) => (
                        <div key={idx} className="bg-black/40 border border-white/5 rounded-md py-2 flex flex-col items-center justify-center hover:bg-white/10 hover:border-[#00FF41]/30 transition-all group cursor-default">
                            <span className="text-gray-500 font-bold text-xs group-hover:text-white transition-colors">{p.icon}</span>
                            <span className="text-[10px] text-gray-600 group-hover:text-[#00FF41] transition-colors scale-90">{p.name}</span>
                        </div>
                    ))}
                </div>
             </div>
          </div>
        </section>

        {/* Section 3: Services */}
        <section id="service" className="h-screen w-full flex items-center justify-end px-4 md:px-20">
            <div className="w-full md:w-1/2 max-w-xl">
                <div className="mb-10">
                    <h2 className="text-4xl font-bold mb-2">{CONTENT_DATA.service.title}</h2>
                    <div className="h-1 w-20 bg-[#00FF41]"></div>
                </div>
                <div className="flex flex-col gap-4">
                    {CONTENT_DATA.service.items?.map((item, idx) => (
                        <div key={idx} className="group flex justify-between items-center p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all cursor-pointer">
                            <span className="text-xl font-medium group-hover:text-[#00FF41] transition-colors">{item.label}</span>
                            <span className="text-sm text-gray-400 bg-black/40 px-3 py-1 rounded-full">{item.val}</span>
                        </div>
                    ))}
                </div>
                <p className="mt-8 text-gray-400 text-sm">{CONTENT_DATA.service.desc}</p>
            </div>
        </section>

        {/* Section 4: Invest */}
        <section id="invest" className="h-screen w-full flex items-center justify-end px-4 md:px-20">
            <div className="w-full md:w-1/2 max-w-xl text-right">
                <h2 className="text-4xl font-bold mb-4 text-white">
                    {CONTENT_DATA.invest.title}
                </h2>
                <p className="text-[#00FF41] font-mono mb-8">{CONTENT_DATA.invest.role}</p>
                
                <div className="flex justify-end gap-6 mb-8">
                    {CONTENT_DATA.invest.stats?.map((stat, idx) => (
                        <div key={idx} className="text-center">
                            <div className="text-3xl font-bold text-white">{stat.val}</div>
                            <div className="text-xs text-gray-500 uppercase">{stat.label}</div>
                        </div>
                    ))}
                </div>

                <p className="text-gray-400 mb-8 ml-auto max-w-md">
                   {CONTENT_DATA.invest.desc}
                </p>

                <button 
                    onClick={() => setShowDashboard(true)}
                    className="bg-[#00FF41] text-black font-bold px-8 py-4 rounded-full hover:scale-105 transition-transform flex items-center gap-2 ml-auto shadow-[0_0_20px_rgba(0,255,65,0.4)]"
                >
                    查看資產儀表板 <span className="text-lg">↗</span>
                </button>
            </div>
        </section>

        {/* Section 5: AI Lab (粒子變形為晶片) */}
        <section id="ai" className="h-screen w-full flex items-center justify-end px-4 md:px-20 bg-gradient-to-t from-black via-transparent to-transparent">
             <div className="w-full md:w-1/2 max-w-xl bg-black/80 backdrop-blur-md p-8 border-t border-[#00FF41] rounded-tl-3xl">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                    <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                    {CONTENT_DATA.ai.title}
                </h2>
                <div className="space-y-6">
                    {CONTENT_DATA.ai.projects?.map((proj, idx) => (
                        <div key={idx}>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-300 font-mono">{proj.name}</span>
                                <span className="text-[#00FF41]">{proj.progress}%</span>
                            </div>
                            <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-[#00FF41] relative overflow-hidden" 
                                    style={{ width: `${proj.progress}%` }}
                                >
                                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-8 pt-6 border-t border-white/10">
                    <h3 className="text-lg font-bold text-white mb-2">最新教學</h3>
                    <div className="text-sm text-gray-400 hover:text-[#00FF41] cursor-pointer transition-colors">
                        ▶ 如何使用 Python 抓取台股即時數據？
                    </div>
                    <div className="text-sm text-gray-400 hover:text-[#00FF41] cursor-pointer transition-colors mt-2">
                        ▶ ChatGPT 在財報分析中的應用實例
                    </div>
                </div>
             </div>
        </section>

      </div>

      {/* 底部跑馬燈 */}
      <StockTicker />

      {/* 5. 儀表板彈窗 (維持不變) */}
      {showDashboard && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg animate-fade-in">
            <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-4xl rounded-3xl p-6 md:p-10 relative shadow-2xl overflow-y-auto max-h-[90vh]">
                <button 
                    onClick={() => setShowDashboard(false)}
                    className="absolute top-4 right-4 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                >
                    ✕
                </button>
                
                <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
                    <span className="text-[#00FF41]">●</span> 投資組合詳細分析
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[
                        { title: "配息佔比", val: "7.0%", color: "border-orange-500" },
                        { title: "股債比例", val: "40:60", color: "border-blue-500" },
                        { title: "投資區域", val: "US/TW", color: "border-yellow-500" },
                        { title: "貨幣比例", val: "USD", color: "border-green-500" },
                    ].map((item, i) => (
                        <div key={i} className="bg-white/5 rounded-2xl p-6 flex flex-col items-center justify-center border border-white/5">
                            <h3 className="text-gray-400 text-sm mb-4 border-l-4 pl-2 border-[#00FF41] self-start">{item.title}</h3>
                            <div className={`w-24 h-24 rounded-full border-8 ${item.color} flex items-center justify-center text-xl font-bold`}>
                                {item.val}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-white/5 rounded-2xl p-6 overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-300">
                        <thead className="text-gray-500 border-b border-white/10">
                            <tr>
                                <th className="pb-3">基金名稱</th>
                                <th className="pb-3">幣別</th>
                                <th className="pb-3">配息率</th>
                                <th className="pb-3 text-right">投入比例</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {[
                                { name: "安聯台灣科技", curr: "TWD", rate: "-", pct: "10%" },
                                { name: "安聯收益成長AM", curr: "USD", rate: "7.8%", pct: "90%" },
                            ].map((row, idx) => (
                                <tr key={idx} className="hover:bg-white/5">
                                    <td className="py-4 font-bold text-white">{row.name}</td>
                                    <td className="py-4">{row.curr}</td>
                                    <td className="py-4 text-[#00FF41]">{row.rate}</td>
                                    <td className="py-4 text-right">
                                        <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded">{row.pct}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      )}
    </main>
  );
}