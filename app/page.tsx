"use client";

import {
  useState,
  useEffect,
  useRef,
  useMemo,
  Suspense,
  type ReactNode,
} from "react";
import {
  motion,
  useReducedMotion,
  AnimatePresence,
  useInView,
  useScroll,
  useSpring,
  useTransform,
  useMotionValue,
  animate,
  useMotionTemplate,
} from "framer-motion";
import {
  FiArrowLeft,
  FiMenu,
  FiX,
  FiWifi,
  FiShield,
  FiActivity,
  FiCpu,
  FiSun,
  FiPhone,
  FiMail,
  FiMapPin,
  FiCheck,
  FiAward,
  FiSend,
  FiRadio,
  FiDatabase,
  FiZap,
  FiGlobe,
  FiClock,
  FiTarget,
  FiLayers,
  FiChevronLeft,
  FiPlayCircle,
  FiStar,
} from "react-icons/fi";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  Float,
  Html,
  PerspectiveCamera,
  Preload,
  Grid,
} from "@react-three/drei";
import * as THREE from "three";

/* ================================================================== */
/*  HELPERS                                                            */
/* ================================================================== */

const fa = (n: number | string, d = 0) =>
  (typeof n === "number"
    ? d
      ? n.toFixed(d)
      : Math.round(n).toString()
    : n
  ).replace(/\d/g, (x) => "۰۱۲۳۴۵۶۷۸۹"[+x]);

/* ================================================================== */
/*  DATA                                                               */
/* ================================================================== */

const NAV = [
  ["products", "محصولات"],
  ["pipeline", "مسیر داده"],
  ["about", "گواهینامه‌ها"],
  ["contact", "تماس"],
] as const;

const PRODUCTS = [
  {
    id: "p1",
    icon: FiWifi,
    name: "ترانسمیتر فشار بی‌سیم",
    code: "RFA71GP",
    tag: "جدید",
    desc:
      "اندازه‌گیری فشار بدون کابل‌کشی و منبع تغذیه بیرونی؛ مناسب سایت‌های دورافتاده با پنل خورشیدی و باتری قابل شارژ.",
    specs: [
      ["ارتباط", "2G / NB-IoT / Wi-SUN"],
      ["تغذیه", "خورشیدی + باتری"],
      ["حفاظت", "IECEx Ex ia"],
      ["یکپارچگی", "اسکادا / Modbus"],
    ],
    color: "#5eead4",
    model: "transmitter" as const,
  },
  {
    id: "p2",
    icon: FiShield,
    name: "بریر ایزولاسیون گالوانیک",
    code: "RFA4000 / 5000",
    tag: "IECEx",
    desc:
      "جداسازی ایمن سیگنال‌های آنالوگ و دیجیتال بین Zone 0/1 و اتاق کنترل، با گواهی آزمایشگاه اپیل.",
    specs: [
      ["سیگنال", "4–20mA · HART"],
      ["کانال", "RTD و دیجیتال"],
      ["ایزولاسیون", "گالوانیک کامل"],
      ["منطقه", "Zone 0 / 1"],
    ],
    color: "#7dd3fc",
    model: "barrier" as const,
  },
  {
    id: "p3",
    icon: FiActivity,
    name: "تصحیح‌کننده حجم گاز",
    code: "RFA3001SB",
    tag: "پرکاربرد",
    desc:
      "تصحیح حجم گاز در ایستگاه‌های تقلیل فشار با دقت بالا و پایداری درازمدت در شرایط سخت میدانی.",
    specs: [
      ["نصب", "داخل Zone 0"],
      ["ثبت داده", "لاگ داخلی"],
      ["پروتکل", "Modbus RTU"],
      ["کاربرد", "ایستگاه CGS / TBS"],
    ],
    color: "#ff8a5c",
    model: "corrector" as const,
  },
  {
    id: "p4",
    icon: FiCpu,
    name: "سامانه پایش هوشمند",
    code: "RFA Cloud",
    tag: "ابری",
    desc:
      "داشبورد متمرکز برای پایش لحظه‌ای فشار، دما و جریان با هشدار خودکار و تحلیل داده‌های تاریخی.",
    specs: [
      ["داده", "زنده + تاریخی"],
      ["هشدار", "پیامک / ایمیل"],
      ["گزارش", "خودکار"],
      ["اتصال", "API باز"],
    ],
    color: "#c084fc",
    model: "cloud" as const,
  },
] as const;

const PIPELINE = [
  {
    title: "اندازه‌گیری",
    sub: "سنسور در میدان",
    icon: FiActivity,
    desc: "ترانسمیتر فشار، دما و جریان دقیق در Zone 0",
  },
  {
    title: "ایزولاسیون",
    sub: "حفاظت سیگنال",
    icon: FiShield,
    desc: "جداسازی گالوانیک مطابق IECEx",
  },
  {
    title: "ارتباط بی‌سیم",
    sub: "NB-IoT / Wi-SUN",
    icon: FiRadio,
    desc: "انتقال ایمن حتی در مناطق دورافتاده",
  },
  {
    title: "اسکادا",
    sub: "پایش مرکزی",
    icon: FiDatabase,
    desc: "یکپارچه‌سازی با سیستم کنترل مشتری",
  },
] as const;

const SOLUTIONS = [
  [
    "نفت و گاز",
    "پایش خطوط انتقال و پالایشگاه",
    ["فشار خط", "ابزار ضدانفجار", "اسکادا"],
  ],
  [
    "توزیع گاز شهری",
    "اندازه‌گیری و پایش ایستگاه‌ها",
    ["تصحیح حجم", "مانیتورینگ راه‌دور", "گزارش مرکزی"],
  ],
  [
    "زیرساخت حیاتی",
    "آب، برق و صنایع سنگین",
    ["دما و فشار", "هشدار خرابی", "یکپارچگی با PLC"],
  ],
] as const;

const CERTS = [
  ["IECEx", "گواهی بین‌المللی ضدانفجار"],
  ["ISO 9001", "مدیریت کیفیت"],
  ["دانش‌بنیان", "معاونت علمی و فناوری"],
  ["APIL", "آزمایشگاه اپیل"],
] as const;

const STATS = [
  { to: 15, suffix: "+", label: "سال تجربه صنعتی", icon: FiAward },
  { to: 320, suffix: "+", label: "پروژه اجرا‌شده", icon: FiTarget },
  { to: 98, suffix: "٪", label: "رضایت مشتریان", icon: FiStar },
  { to: 24, suffix: "/۷", label: "پشتیبانی فنی", icon: FiClock },
] as const;

const TESTIMONIALS = [
  {
    quote:
      "کیفیت پایدار تجهیزات و پشتیبانی سریع، ما را در اجرای پروژه‌های حساس خطوط انتقال گاز مطمئن کرد.",
    name: "مهندس رضایی",
    role: "مدیر فنی، شرکت انتقال گاز",
  },
  {
    quote:
      "ترانسمیترهای بی‌سیم در ایستگاه‌های بدون برق، دقیقاً همان راه‌حلی بود که سال‌ها دنبالش بودیم.",
    name: "مهندس کاظمی",
    role: "مدیر پروژه، پالایشگاه جنوب",
  },
  {
    quote:
      "گواهی IECEx و مستندات فنی کامل، فرآیند تأییدیه ما را به‌مراتب سریع‌تر کرد.",
    name: "دکتر محمدی",
    role: "مشاور HSE، هلدینگ انرژی",
  },
] as const;

/* ================================================================== */
/*  SMALL COMPONENTS                                                   */
/* ================================================================== */

function Counter({
  to,
  suffix = "",
  duration = 1.8,
}: {
  to: number;
  suffix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setVal(v),
    });
    return () => controls.stop();
  }, [inView, to, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {fa(val)}
      {suffix}
    </span>
  );
}

function Reveal({
  children,
  delay = 0,
  y = 28,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-600 backdrop-blur-sm">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#ff5a1f]" />
      {children}
    </span>
  );
}

/* ================================================================== */
/*  3D SCENE — Refinery World                                          */
/* ================================================================== */

function RefineryTower({
  position = [0, 0, 0] as [number, number, number],
  height = 3,
  radius = 0.25,
  color = "#1e3a5f",
}: {
  position?: [number, number, number];
  height?: number;
  radius?: number;
  color?: string;
}) {
  const rings = 6;
  return (
    <group position={position}>
      <mesh castShadow>
        <cylinderGeometry args={[radius, radius * 1.15, height, 32]} />
        <meshStandardMaterial color={color} metalness={0.9} roughness={0.3} />
      </mesh>
      <mesh position={[0, height / 2, 0]}>
        <sphereGeometry args={[radius, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={color} metalness={0.95} roughness={0.2} />
      </mesh>
      {Array.from({ length: rings }).map((_, i) => (
        <mesh
          key={i}
          position={[0, -height / 2 + (height / (rings + 1)) * (i + 1), 0]}
        >
          <torusGeometry args={[radius * 1.05, 0.02, 8, 32]} />
          <meshStandardMaterial
            color="#5eead4"
            emissive="#5eead4"
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}
      <pointLight
        position={[0, height / 2 + 0.3, 0]}
        color="#ff5a1f"
        intensity={0.8}
        distance={3}
      />
      <mesh position={[0, height / 2 + 0.05, 0]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshBasicMaterial color="#ff5a1f" />
      </mesh>
    </group>
  );
}

function StorageTank({
  position = [0, 0, 0] as [number, number, number],
  radius = 0.6,
  height = 0.7,
}: {
  position?: [number, number, number];
  radius?: number;
  height?: number;
}) {
  return (
    <group position={position}>
      <mesh castShadow>
        <cylinderGeometry args={[radius, radius, height, 32]} />
        <meshStandardMaterial color="#0d1f33" metalness={0.85} roughness={0.25} />
      </mesh>
      <mesh position={[0, height / 2, 0]}>
        <sphereGeometry
          args={[radius, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]}
        />
        <meshStandardMaterial color="#1e3a5f" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0, height / 2 + 0.02, 0]}>
        <torusGeometry args={[radius * 0.9, 0.015, 8, 32]} />
        <meshStandardMaterial
          color="#14b8a6"
          emissive="#14b8a6"
          emissiveIntensity={0.4}
        />
      </mesh>
    </group>
  );
}

function FlareStack({ position = [0, 0, 0] as [number, number, number] }) {
  const flameRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame((s) => {
    const t = s.clock.elapsedTime;
    if (flameRef.current) {
      flameRef.current.scale.y = 1 + Math.sin(t * 8) * 0.15;
      flameRef.current.scale.x = 1 + Math.sin(t * 6) * 0.1;
      flameRef.current.rotation.y = t * 0.5;
    }
    if (lightRef.current) {
      lightRef.current.intensity = 1.5 + Math.sin(t * 10) * 0.5;
    }
  });

  return (
    <group position={position}>
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 2, 16]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.4} />
      </mesh>
      <mesh position={[0, 2, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.05, 16]} />
        <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.3} />
      </mesh>
      <mesh ref={flameRef} position={[0, 2.35, 0]}>
        <coneGeometry args={[0.15, 0.6, 16]} />
        <meshBasicMaterial color="#ff5a1f" transparent opacity={0.9} />
      </mesh>
      <mesh position={[0, 2.5, 0]}>
        <coneGeometry args={[0.08, 0.4, 16]} />
        <meshBasicMaterial color="#fbbf24" transparent opacity={0.95} />
      </mesh>
      <pointLight
        ref={lightRef}
        position={[0, 2.4, 0]}
        color="#ff5a1f"
        intensity={2}
        distance={5}
      />
    </group>
  );
}

function DataPipe({
  from,
  to,
  color = "#5eead4",
  radius = 0.06,
  particleCount = 30,
}: {
  from: [number, number, number];
  to: [number, number, number];
  color?: string;
  radius?: number;
  particleCount?: number;
}) {
  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(...from),
        new THREE.Vector3(
          (from[0] + to[0]) / 2,
          Math.max(from[1], to[1]) + 0.3,
          (from[2] + to[2]) / 2,
        ),
        new THREE.Vector3(...to),
      ]),
    [from, to],
  );

  const particlesRef = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const p = curve.getPoint(i / particleCount);
      arr[i * 3] = p.x;
      arr[i * 3 + 1] = p.y;
      arr[i * 3 + 2] = p.z;
    }
    return arr;
  }, [curve, particleCount]);

  useFrame((s) => {
    if (!particlesRef.current) return;
    const t = s.clock.elapsedTime;
    const arr = particlesRef.current.geometry.attributes.position
      .array as Float32Array;
    for (let i = 0; i < particleCount; i++) {
      const u = (i / particleCount + t * 0.15) % 1;
      const p = curve.getPoint(u);
      arr[i * 3] = p.x;
      arr[i * 3 + 1] = p.y;
      arr[i * 3 + 2] = p.z;
    }
    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <group>
      <mesh>
        <tubeGeometry args={[curve, 40, radius, 8, false]} />
        <meshStandardMaterial
          color="#16283d"
          metalness={0.85}
          roughness={0.3}
          transparent
          opacity={0.6}
        />
      </mesh>
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.05}
          color={color}
          transparent
          opacity={0.95}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
}

function RefineryScene() {
  const groupRef = useRef<THREE.Group>(null);
  const reduce = useReducedMotion();

  useFrame((s) => {
    if (groupRef.current && !reduce) {
      groupRef.current.rotation.y = Math.sin(s.clock.elapsedTime * 0.1) * 0.15;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.5, 0]}>
      <Grid
        args={[20, 20]}
        cellSize={0.5}
        cellThickness={0.5}
        cellColor="#1e3a5f"
        sectionSize={2.5}
        sectionThickness={1}
        sectionColor="#14b8a6"
        fadeDistance={25}
        fadeStrength={1}
        followCamera={false}
        infiniteGrid
        position={[0, -0.01, 0]}
      />
      <RefineryTower position={[-1.8, 1.5, 0]} height={3} radius={0.3} />
      <RefineryTower
        position={[-0.8, 1, -0.5]}
        height={2}
        radius={0.2}
        color="#1e3a5f"
      />
      <RefineryTower
        position={[0.6, 1.2, -0.3]}
        height={2.4}
        radius={0.22}
        color="#1e3a5f"
      />
      <StorageTank position={[2, 0.35, 0.5]} radius={0.55} height={0.7} />
      <StorageTank position={[2.8, 0.35, -0.2]} radius={0.5} height={0.7} />
      <StorageTank position={[1.4, 0.35, -0.8]} radius={0.45} height={0.7} />
      <FlareStack position={[3.2, 0, 0.8]} />
      <DataPipe from={[-1.8, 1, 0.3]} to={[0.6, 0.8, 0.2]} color="#5eead4" />
      <DataPipe from={[0.6, 0.8, 0.2]} to={[2, 0.6, 0.5]} color="#7dd3fc" />
      <DataPipe from={[-1.8, 0.5, -0.3]} to={[-0.8, 0.5, -0.5]} color="#ff8a5c" />
      <DataPipe from={[2, 0.6, 0.5]} to={[3.2, 0.5, 0.8]} color="#c084fc" />
      {[
        [-2.5, 2.5, 0.5],
        [1.5, 2.2, -0.5],
        [3, 2, 0.3],
      ].map((pos, i) => (
        <Float key={i} speed={2} rotationIntensity={0.5} floatIntensity={0.8}>
          <mesh position={pos as [number, number, number]}>
            <icosahedronGeometry args={[0.12, 0]} />
            <meshStandardMaterial
              color={["#5eead4", "#ff8a5c", "#7dd3fc"][i]}
              emissive={["#5eead4", "#ff8a5c", "#7dd3fc"][i]}
              emissiveIntensity={1.5}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

/* --- 3D Gauge --- */
const valueToAngle = (v: number) => {
  const n = Math.min(100, Math.max(0, v)) / 100;
  return -Math.PI * 0.7 + n * Math.PI * 1.4;
};

function Gauge3D({
  value,
  label,
  unit,
  color = "#5eead4",
  danger = false,
}: {
  value: number;
  label: string;
  unit: string;
  color?: string;
  danger?: boolean;
}) {
  const needleRef = useRef<THREE.Group>(null);
  const target = useMemo(() => valueToAngle(value), [value]);
  const strokeColor = danger ? "#ff5a1f" : color;

  useFrame(() => {
    if (!needleRef.current) return;
    needleRef.current.rotation.z = THREE.MathUtils.lerp(
      needleRef.current.rotation.z,
      target,
      0.08,
    );
  });

  const ticks = useMemo(() => {
    const arr: { pos: [number, number, number]; rot: number }[] = [];
    for (let i = 0; i <= 8; i++) {
      const angle = -Math.PI * 0.7 + (i / 8) * Math.PI * 1.4;
      const r = 0.83;
      arr.push({
        pos: [Math.sin(angle) * r, Math.cos(angle) * r, 0.11],
        rot: -angle,
      });
    }
    return arr;
  }, []);

  return (
    <group>
      <mesh castShadow>
        <cylinderGeometry args={[1, 1, 0.18, 64]} />
        <meshStandardMaterial color="#071018" metalness={0.9} roughness={0.25} />
      </mesh>
      <mesh position={[0, 0, 0.09]}>
        <torusGeometry args={[1.02, 0.045, 16, 64]} />
        <meshStandardMaterial
          color={strokeColor}
          emissive={strokeColor}
          emissiveIntensity={0.5}
        />
      </mesh>
      <mesh position={[0, 0, 0.1]}>
        <circleGeometry args={[0.96, 64]} />
        <meshStandardMaterial color="#0a1725" />
      </mesh>
      <mesh position={[0, 0, 0.105]}>
        <ringGeometry args={[0.9, 0.94, 64]} />
        <meshStandardMaterial color="#1e3350" />
      </mesh>
      {ticks.map((t, i) => (
        <mesh key={i} position={t.pos} rotation={[0, 0, t.rot]}>
          <boxGeometry args={[0.025, 0.08, 0.012]} />
          <meshStandardMaterial color="#5a7a9a" />
        </mesh>
      ))}
      <group ref={needleRef} position={[0, 0, 0.13]}>
        <mesh position={[0, 0.38, 0]}>
          <boxGeometry args={[0.035, 0.76, 0.022]} />
          <meshStandardMaterial
            color={strokeColor}
            emissive={strokeColor}
            emissiveIntensity={0.6}
          />
        </mesh>
      </group>
      <mesh position={[0, 0, 0.15]}>
        <sphereGeometry args={[0.07, 20, 20]} />
        <meshStandardMaterial color="#ffffff" metalness={0.8} roughness={0.2} />
      </mesh>
      <Html
        position={[0, -0.28, 0.16]}
        center
        distanceFactor={6}
        style={{ pointerEvents: "none", userSelect: "none" }}
      >
        <div
          style={{
            fontFamily: "Vazirmatn, Tahoma, sans-serif",
            textAlign: "center",
            color: "#fff",
            direction: "rtl",
          }}
        >
          <div
            style={{
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: "-0.5px",
              textShadow: "0 0 12px rgba(94,234,212,.35)",
            }}
          >
            {fa(value, 1)}
          </div>
          <div
            style={{
              fontSize: 9,
              color: "#7b8fa6",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {unit}
          </div>
        </div>
      </Html>
      <Html
        position={[0, -1.35, 0]}
        center
        distanceFactor={6}
        style={{ pointerEvents: "none", userSelect: "none" }}
      >
        <div
          style={{
            fontFamily: "Vazirmatn, Tahoma, sans-serif",
            color: "#94a3b8",
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.05em",
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </div>
      </Html>
    </group>
  );
}

/* --- Ambient Particles --- */
function AmbientParticles({ count = 120 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);

  const { positions, velocities } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 6 - 1;
      vel[i * 3] = (Math.random() - 0.5) * 0.005;
      vel[i * 3 + 1] = Math.random() * 0.004 + 0.001;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.005;
    }
    return { positions: pos, velocities: vel };
  }, [count]);

  useFrame(() => {
    if (!ref.current) return;
    const arr = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      arr[i * 3] += velocities[i * 3];
      arr[i * 3 + 1] += velocities[i * 3 + 1];
      arr[i * 3 + 2] += velocities[i * 3 + 2];
      if (arr[i * 3 + 1] > 5) {
        arr[i * 3 + 1] = -5;
        arr[i * 3] = (Math.random() - 0.5) * 12;
      }
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color="#ff8a5c"
        transparent
        opacity={0.5}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

function EnergyRing({
  radius = 2,
  color = "#14b8a6",
  speed = 1,
  position = [0, 0, 0] as [number, number, number],
}: {
  radius?: number;
  color?: string;
  speed?: number;
  position?: [number, number, number];
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (ref.current) {
      ref.current.rotation.z = s.clock.elapsedTime * speed * 0.3;
      ref.current.rotation.x = Math.sin(s.clock.elapsedTime * speed * 0.5) * 0.3;
    }
  });
  return (
    <mesh ref={ref} position={position} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[radius, 0.015, 8, 64]} />
      <meshBasicMaterial color={color} transparent opacity={0.6} />
    </mesh>
  );
}

/* --- Holographic scan ring --- */
function HoloScan({ color = "#5eead4" }: { color?: string }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (ref.current) {
      ref.current.position.y = Math.sin(s.clock.elapsedTime * 1.2) * 1.2;
      ref.current.rotation.z = s.clock.elapsedTime * 0.8;
    }
  });
  return (
    <mesh ref={ref} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[2.2, 0.008, 8, 64]} />
      <meshBasicMaterial color={color} transparent opacity={0.45} />
    </mesh>
  );
}

/* --- Product abstract 3D models --- */
function ProductModel({
  type,
  color,
}: {
  type: "transmitter" | "barrier" | "corrector" | "cloud";
  color: string;
}) {
  const group = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (group.current) {
      group.current.rotation.y = s.clock.elapsedTime * 0.4;
    }
  });

  return (
    <group ref={group}>
      {type === "transmitter" && (
        <>
          <mesh position={[0, 0.15, 0]}>
            <cylinderGeometry args={[0.35, 0.4, 0.9, 32]} />
            <meshStandardMaterial color="#0d1f33" metalness={0.9} roughness={0.25} />
          </mesh>
          <mesh position={[0, 0.65, 0]}>
            <sphereGeometry args={[0.22, 24, 24]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.6}
              metalness={0.7}
              roughness={0.2}
            />
          </mesh>
          <mesh position={[0, -0.4, 0]}>
            <cylinderGeometry args={[0.5, 0.55, 0.12, 32]} />
            <meshStandardMaterial color="#1e3a5f" metalness={0.85} roughness={0.3} />
          </mesh>
          {[0, 1, 2].map((i) => (
            <mesh
              key={i}
              position={[
                Math.cos((i * Math.PI * 2) / 3) * 0.55,
                0.1,
                Math.sin((i * Math.PI * 2) / 3) * 0.55,
              ]}
            >
              <boxGeometry args={[0.08, 0.35, 0.08]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} />
            </mesh>
          ))}
        </>
      )}
      {type === "barrier" && (
        <>
          <mesh>
            <boxGeometry args={[1.1, 0.9, 0.25]} />
            <meshStandardMaterial color="#0d1f33" metalness={0.85} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0, 0.14]}>
            <boxGeometry args={[0.9, 0.7, 0.04]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.5}
              transparent
              opacity={0.85}
            />
          </mesh>
          {[-0.3, 0, 0.3].map((x, i) => (
            <mesh key={i} position={[x, -0.55, 0]}>
              <cylinderGeometry args={[0.06, 0.06, 0.2, 12]} />
              <meshStandardMaterial color="#475569" metalness={0.9} />
            </mesh>
          ))}
        </>
      )}
      {type === "corrector" && (
        <>
          <mesh>
            <boxGeometry args={[0.9, 0.7, 0.55]} />
            <meshStandardMaterial color="#0d1f33" metalness={0.9} roughness={0.25} />
          </mesh>
          <mesh position={[0, 0.2, 0.3]}>
            <circleGeometry args={[0.22, 32]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.7}
            />
          </mesh>
          <mesh position={[0.35, -0.15, 0.3]}>
            <boxGeometry args={[0.25, 0.12, 0.04]} />
            <meshStandardMaterial color="#1e3a5f" />
          </mesh>
          <mesh position={[-0.35, -0.15, 0.3]}>
            <boxGeometry args={[0.25, 0.12, 0.04]} />
            <meshStandardMaterial color="#1e3a5f" />
          </mesh>
        </>
      )}
      {type === "cloud" && (
        <>
          <Float speed={2} floatIntensity={0.6} rotationIntensity={0.3}>
            <mesh>
              <icosahedronGeometry args={[0.55, 1]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={0.8}
                wireframe
                transparent
                opacity={0.9}
              />
            </mesh>
            <mesh scale={0.7}>
              <icosahedronGeometry args={[0.55, 0]} />
              <meshStandardMaterial
                color="#0d1f33"
                metalness={0.6}
                roughness={0.4}
                transparent
                opacity={0.7}
              />
            </mesh>
          </Float>
          {[0, 1, 2, 3].map((i) => (
            <mesh
              key={i}
              position={[
                Math.cos((i * Math.PI) / 2 + 0.4) * 0.9,
                Math.sin(i * 1.2) * 0.3,
                Math.sin((i * Math.PI) / 2 + 0.4) * 0.9,
              ]}
            >
              <sphereGeometry args={[0.08, 12, 12]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={1.2}
              />
            </mesh>
          ))}
        </>
      )}
      <EnergyRing radius={1.1} color={color} speed={0.8} position={[0, -0.1, 0]} />
    </group>
  );
}

function ProductScene3D({
  type,
  color,
}: {
  type: "transmitter" | "barrier" | "corrector" | "cloud";
  color: string;
}) {
  const reduce = useReducedMotion();
  return (
    <div className="absolute inset-0">
      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 0.3, 3.2]} fov={40} />
          <ambientLight intensity={0.35} />
          <directionalLight position={[3, 4, 5]} intensity={1.1} />
          <pointLight position={[-3, 2, -2]} intensity={0.7} color={color} />
          <Environment preset="warehouse" />
          <ProductModel type={type} color={color} />
          {!reduce && (
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              autoRotate
              autoRotateSpeed={0.8}
              maxPolarAngle={Math.PI / 1.8}
              minPolarAngle={Math.PI / 3}
            />
          )}
          <Preload all />
        </Suspense>
      </Canvas>
    </div>
  );
}

/* --- Main 3D Canvas (Hero) --- */
function HeroScene3D({ pressure, temp }: { pressure: number; temp: number }) {
  const reduce = useReducedMotion();

  return (
    <div className="absolute inset-0">
      <Canvas
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 0.5, 5.5]} fov={42} />
          <ambientLight intensity={0.3} />
          <directionalLight position={[4, 6, 5]} intensity={1.1} color="#ffffff" />
          <pointLight position={[-4, 3, -3]} intensity={0.8} color="#14b8a6" />
          <pointLight position={[4, -2, 4]} intensity={0.6} color="#ff5a1f" />
          <Environment preset="warehouse" />
          <group position={[0, 0.2, 0]}>
            <group position={[-1.6, 0.9, 0.4]} scale={0.7}>
              <Gauge3D
                value={pressure}
                label="فشار خط"
                unit="bar"
                color="#5eead4"
                danger={pressure > 85}
              />
            </group>
            <group position={[1.6, 0.9, 0.4]} scale={0.55}>
              <Gauge3D value={temp} label="دما" unit="°C" color="#7dd3fc" />
            </group>
            <EnergyRing radius={2.5} color="#14b8a6" speed={1} />
            <EnergyRing radius={3} color="#ff5a1f" speed={0.6} />
            <EnergyRing radius={3.5} color="#7dd3fc" speed={0.4} />
            <HoloScan color="#5eead4" />
            <AmbientParticles count={reduce ? 0 : 150} />
          </group>
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            enableRotate={!reduce}
            autoRotate={!reduce}
            autoRotateSpeed={0.5}
            maxPolarAngle={Math.PI / 2.1}
            minPolarAngle={Math.PI / 3.2}
          />
          <Preload all />
        </Suspense>
      </Canvas>
    </div>
  );
}

/* --- Hybrid Control Room --- */
function ControlRoom() {
  const reduce = useReducedMotion();
  const [pressure, setPressure] = useState(72);
  const [temp, setTemp] = useState(38);

  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => {
      setPressure((p) => Math.min(95, Math.max(45, p + (Math.random() - 0.5) * 4)));
      setTemp((t) => Math.min(55, Math.max(25, t + (Math.random() - 0.5) * 1.2)));
    }, 1800);
    return () => clearInterval(t);
  }, [reduce]);

  const warn = pressure > 85;

  return (
    <div className="relative">
      <div className="absolute -inset-6 rounded-[36px] bg-gradient-to-br from-[#ff5a1f]/20 via-[#14b8a6]/10 to-transparent blur-3xl" />
      <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] border border-white/10 bg-[#071018] shadow-[0_50px_100px_-30px_rgba(7,16,24,.55)] sm:aspect-square">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            background:
              "radial-gradient(500px 300px at 20% 15%, rgba(20,184,166,.18), transparent 60%), radial-gradient(500px 300px at 80% 85%, rgba(255,90,31,.14), transparent 60%)",
          }}
        />
        <HeroScene3D pressure={pressure} temp={temp} />
        <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between p-5">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
            <div className="leading-tight">
              <p className="text-[11px] font-semibold text-white">
                ایستگاه تقلیل فشار · ونک-۰۳
              </p>
              <p className="text-[10px] text-slate-500">اتصال زنده · دیجیتال توین</p>
            </div>
          </div>
          <span
            dir="ltr"
            className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[10px] font-semibold text-slate-300 backdrop-blur-sm"
          >
            RFA71GP
          </span>
        </div>
        <div className="absolute inset-x-0 bottom-0 z-20 grid grid-cols-3 gap-2 p-4 text-[10px]">
          {(
            [
              [FiSun, "باتری", "۸۷٪"],
              [FiRadio, "ارتباط", "NB-IoT"],
              [FiDatabase, "اسکادا", "متصل"],
            ] as const
          ).map(([I, k, v]) => (
            <div
              key={k}
              className="rounded-xl border border-white/5 bg-white/[0.04] px-2.5 py-2.5 text-center backdrop-blur-sm"
            >
              <I className="mx-auto mb-1 h-3.5 w-3.5 text-[#5eead4]" />
              <p className="text-[9px] text-slate-500">{k}</p>
              <p className="mt-0.5 font-semibold text-white">{v}</p>
            </div>
          ))}
        </div>
        <AnimatePresence>
          {warn && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute left-1/2 top-16 z-20 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#ff5a1f] px-3.5 py-1 text-[10px] font-bold text-white shadow-lg shadow-orange-500/40"
            >
              هشدار: فشار بالاتر از آستانه
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <p className="mt-4 text-center text-[10px] font-medium uppercase tracking-wider text-slate-500">
        نمای سه‌بعدی تعاملی · داده‌ها شبیه‌سازی شده‌اند
      </p>
    </div>
  );
}

/* ================================================================== */
/*  3D SHOWCASE SECTION                                                */
/* ================================================================== */

function RefineryShowcase() {
  const reduce = useReducedMotion();

  return (
    <div className="relative h-[500px] w-full overflow-hidden rounded-[36px] border border-white/10 bg-[#071018] sm:h-[600px]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background:
            "radial-gradient(600px 400px at 20% 20%, rgba(20,184,166,.12), transparent 60%), radial-gradient(600px 400px at 80% 80%, rgba(255,90,31,.1), transparent 60%)",
        }}
      />
      <div className="absolute inset-0">
        <Canvas
          dpr={[1, 1.75]}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          style={{ background: "transparent" }}
        >
          <Suspense fallback={null}>
            <PerspectiveCamera makeDefault position={[5, 4, 6]} fov={45} />
            <ambientLight intensity={0.25} />
            <directionalLight position={[5, 8, 5]} intensity={1.3} color="#ffffff" />
            <pointLight position={[-5, 3, -3]} intensity={0.9} color="#14b8a6" />
            <pointLight position={[5, -2, 5]} intensity={0.7} color="#ff5a1f" />
            <Environment preset="warehouse" />
            <RefineryScene />
            {!reduce && (
              <OrbitControls
                enableZoom={false}
                enablePan={false}
                autoRotate
                autoRotateSpeed={0.6}
                maxPolarAngle={Math.PI / 2.2}
                minPolarAngle={Math.PI / 4}
              />
            )}
            <Preload all />
          </Suspense>
        </Canvas>
      </div>
      <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between p-6 sm:p-10">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-200 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#14b8a6]" />
            دیجیتال توین پالایشگاه
          </span>
          <span className="hidden font-mono text-[10px] text-slate-500 sm:block">
            rfaa.ir / refinery-01
          </span>
        </div>
        <div className="max-w-md">
          <h3 className="text-2xl font-black leading-tight text-white sm:text-4xl">
            کل پالایشگاه، در یک نگاه.
          </h3>
          <p className="mt-3 text-[12px] leading-7 text-slate-300 sm:text-[13px]">
            هر برج، مخزن و لوله در این نمای سه‌بعدی، به داده‌های زنده سنسورهای
            ما متصل است. فشار، دما و جریان در لحظه.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {["برج تقطیر", "مخازن ذخیره", "شعله", "لوله‌کشی داده"].map((t) => (
              <span
                key={t}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-medium text-slate-300 backdrop-blur-sm"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="pointer-events-none absolute left-4 top-4 h-6 w-6 border-l-2 border-t-2 border-[#14b8a6]/40" />
      <div className="pointer-events-none absolute right-4 top-4 h-6 w-6 border-r-2 border-t-2 border-[#14b8a6]/40" />
      <div className="pointer-events-none absolute bottom-4 left-4 h-6 w-6 border-b-2 border-l-2 border-[#ff5a1f]/40" />
      <div className="pointer-events-none absolute bottom-4 right-4 h-6 w-6 border-b-2 border-r-2 border-[#ff5a1f]/40" />
    </div>
  );
}

/* ================================================================== */
/*  PRODUCT 3D CARD — tilt only on this (very subtle)                  */
/* ================================================================== */

function Product3DCard({
  product,
  active,
  index,
  onClick,
}: {
  product: (typeof PRODUCTS)[number];
  active: boolean;
  index: number;
  onClick: () => void;
}) {
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const ref = useRef<HTMLButtonElement>(null);

  // very subtle tilt — max 4deg
  const handleMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    rotateX.set(-y * 4);
    rotateY.set(x * 4);
  };

  const handleLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  const Icon = product.icon;

  return (
    <motion.button
      ref={ref}
      role="tab"
      aria-selected={active}
      onClick={onClick}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 800,
      }}
      className={`group relative min-w-[240px] overflow-hidden rounded-2xl border p-4 text-start transition-colors duration-300 lg:min-w-0 ${active
        ? "border-[#071018] bg-[#071018] text-white shadow-xl shadow-slate-900/15"
        : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"
        }`}
    >
      {active && (
        <motion.span
          layoutId="activeProductBg"
          className="absolute inset-0 -z-0 rounded-2xl bg-gradient-to-br from-[#071018] to-[#0d1f33]"
          transition={{ type: "spring", stiffness: 400, damping: 32 }}
        />
      )}
      <span
        className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: `${product.color}40` }}
      />
      <div className="relative z-10 flex items-center gap-4">
        <span
          className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl transition-colors ${active ? "bg-white/10" : "bg-slate-100"
            }`}
          style={{ color: active ? product.color : undefined }}
        >
          <Icon className={`h-5 w-5 ${active ? "" : "text-slate-500"}`} />
        </span>
        <span className="min-w-0 flex-1">
          <b className="block truncate text-[13px] font-bold">{product.name}</b>
          <span
            dir="ltr"
            className={`mt-0.5 block text-left text-[11px] font-medium ${active ? "text-slate-400" : "text-slate-500"
              }`}
          >
            {product.code}
          </span>
        </span>
        <FiChevronLeft
          className={`h-4 w-4 shrink-0 transition-transform duration-300 ${active ? "text-[#ff8a5c]" : "text-slate-300 group-hover:-translate-x-1"
            }`}
        />
      </div>
    </motion.button>
  );
}

/* ================================================================== */
/*  MAIN PAGE                                                          */
/* ================================================================== */

export default function RFAAHomePage() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [sel, setSel] = useState(0);
  const [sent, setSent] = useState(false);
  const p = PRODUCTS[sel];

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.3,
  });

  // very subtle mouse parallax — only for hero text (max ±6px)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const parallaxX = useSpring(useTransform(mouseX, [-0.5, 0.5], [-6, 6]), {
    stiffness: 80,
    damping: 20,
  });
  const parallaxY = useSpring(useTransform(mouseY, [-0.5, 0.5], [-6, 6]), {
    stiffness: 80,
    damping: 20,
  });

  // Cursor ambient glow
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const cursorOpacity = useMotionValue(0);

  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 16);
    f();
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);

  useEffect(() => {
    if (reduce) return;
    const handleMouse = (e: MouseEvent) => {
      mouseX.set(e.clientX / window.innerWidth - 0.5);
      mouseY.set(e.clientY / window.innerHeight - 0.5);
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      cursorOpacity.set(1);
    };
    const handleLeave = () => cursorOpacity.set(0);
    window.addEventListener("mousemove", handleMouse);
    window.addEventListener("mouseleave", handleLeave);
    return () => {
      window.removeEventListener("mousemove", handleMouse);
      window.removeEventListener("mouseleave", handleLeave);
    };
  }, [mouseX, mouseY, cursorX, cursorY, cursorOpacity, reduce]);

  const go = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setOpen(false);
  };

  const field =
    "peer w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm text-slate-900 placeholder-transparent transition focus:border-[#ff5a1f] focus:outline-none focus:ring-4 focus:ring-[#ff5a1f]/10";
  const labelCls =
    "pointer-events-none absolute -top-2.5 start-3 bg-white px-1.5 text-[11px] font-medium text-slate-500 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-400 peer-focus:-top-2.5 peer-focus:translate-y-0 peer-focus:text-[11px] peer-focus:text-[#ff5a1f]";

  const cursorBg = useMotionTemplate`radial-gradient(400px circle at ${cursorX}px ${cursorY}px, rgba(255,90,31,0.07), transparent 40%)`;

  return (
    <div
      dir="rtl"
      className="relative min-h-screen overflow-x-clip bg-[#f4f6f8] text-[#071018] antialiased selection:bg-[#ff5a1f]/25"
      style={{ fontFamily: "Vazirmatn, Tahoma, sans-serif" }}
    >
      {/* Cursor ambient glow */}
      {!reduce && (
        <motion.div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-[80] hidden lg:block"
          style={{ background: cursorBg, opacity: cursorOpacity }}
        />
      )}

      {/* scroll progress */}
      <motion.div
        style={{ scaleX: progress }}
        className="fixed inset-x-0 top-0 z-[100] h-[3px] origin-right bg-gradient-to-l from-[#ff5a1f] via-[#ff8a5c] to-[#14b8a6]"
      />

      {/* grain */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[90] opacity-[0.035] mix-blend-multiply"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* HEADER */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled
          ? "border-b border-slate-200/70 bg-[#f4f6f8]/85 backdrop-blur-xl"
          : ""
          }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
          <button
            onClick={() => go("top")}
            className="flex items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-[#ff5a1f]"
          >
            <span className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-[#071018] to-[#0d1f33] text-sm font-black text-white shadow-lg shadow-slate-900/10">
              RF
              <span className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent" />
            </span>
            <span className="text-start leading-tight">
              <b className="block text-[13px] font-extrabold tracking-tight">
                رسا فناور آژیراک
              </b>
              <span className="text-[10px] font-medium text-slate-500">
                ابزار دقیق صنعتی · RFAA
              </span>
            </span>
          </button>

          <nav className="hidden items-center gap-1 rounded-2xl border border-slate-200/80 bg-white/60 p-1 backdrop-blur-sm lg:flex">
            {NAV.map(([id, l]) => (
              <button
                key={id}
                onClick={() => go(id)}
                className="rounded-xl px-4 py-2 text-[13px] font-semibold text-slate-600 transition-colors hover:bg-white hover:text-[#071018]"
              >
                {l}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => go("contact")}
              className="group hidden items-center gap-2 rounded-xl bg-[#071018] px-5 py-2.5 text-[13px] font-bold text-white shadow-lg shadow-slate-900/10 transition-all hover:bg-[#0d1f33] hover:shadow-xl sm:flex"
            >
              درخواست مشاوره
              <FiArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
            </button>
            <button
              aria-label="منو"
              onClick={() => setOpen(true)}
              className="grid h-10 w-10 place-items-center rounded-xl border border-slate-300 bg-white/60 backdrop-blur-sm lg:hidden"
            >
              <FiMenu />
            </button>
          </div>
        </div>
      </header>

      {/* mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-[#071018] p-5 text-white lg:hidden"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                منو
              </span>
              <button
                aria-label="بستن"
                onClick={() => setOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-lg border border-white/20"
              >
                <FiX />
              </button>
            </div>
            <nav className="mt-10">
              {NAV.map(([id, l], i) => (
                <motion.button
                  key={id}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  onClick={() => go(id)}
                  className="flex w-full items-center justify-between border-b border-white/10 py-5 text-start text-2xl font-black"
                >
                  {l}
                  <FiChevronLeft className="h-5 w-5 text-slate-500" />
                </motion.button>
              ))}
            </nav>
            <button
              onClick={() => go("contact")}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-[#ff5a1f] py-4 text-sm font-bold"
            >
              درخواست مشاوره
              <FiArrowLeft />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HERO */}
      <section
        id="top"
        className="relative overflow-hidden pt-32 pb-24 sm:pt-40 lg:pb-32"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(1200px 600px at 15% 10%, rgba(255,90,31,0.10), transparent 60%), radial-gradient(1000px 500px at 85% 15%, rgba(20,184,166,0.10), transparent 55%), radial-gradient(900px 400px at 50% 100%, rgba(13,31,51,0.08), transparent 70%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage: "radial-gradient(#b7c2cd 1px, transparent 1px)",
            backgroundSize: "26px 26px",
            maskImage: "linear-gradient(to bottom, #000 30%, transparent 80%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, #000 30%, transparent 80%)",
          }}
        />

        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 lg:grid-cols-[1.05fr_.95fr] lg:px-8">
          <motion.div
            style={{ x: reduce ? 0 : parallaxX, y: reduce ? 0 : parallaxY }}
          >
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-slate-200 bg-white/70 px-4 py-2 text-[11px] font-semibold backdrop-blur-sm"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#ff5a1f]/10 text-[#ff5a1f]">
                <FiAward className="h-3 w-3" />
              </span>
              شرکت دانش‌بنیان · دارای گواهی IECEx
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.7,
                delay: 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="text-[2.6rem] font-black leading-[1.15] tracking-tight sm:text-[3.6rem] lg:text-[4.4rem]"
            >
              فشار را از دل صحرا،
              <br />
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-l from-[#ff5a1f] via-[#ff8a5c] to-[#ff5a1f] bg-clip-text text-transparent">
                  لحظه‌به‌لحظه ببینید.
                </span>
                <svg
                  aria-hidden
                  viewBox="0 0 400 12"
                  className="absolute -bottom-2 left-0 h-3 w-full text-[#ff5a1f]/30"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M2 8 Q 100 2, 200 6 T 398 4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mt-8 max-w-xl text-[15px] leading-9 text-slate-600"
            >
              ترانسمیتر، بریر و تصحیح‌کننده حجم گاز؛ طراحی و ساخت ایران برای
              ایستگاه‌هایی که کابل، برق و دسترسی ندارند. ایمن در Zone 0، متصل به
              اسکادا، با پشتیبانی ۲۴ ساعته.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="mt-10 flex flex-wrap gap-3"
            >
              <button
                onClick={() => go("products")}
                className="group flex items-center gap-2 rounded-xl bg-[#071018] px-7 py-4 text-sm font-bold text-white shadow-xl shadow-slate-900/15 transition-all hover:bg-[#0d1f33] hover:shadow-2xl"
              >
                مشاهده محصولات
                <FiArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              </button>
              <button
                onClick={() => go("contact")}
                className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white/70 px-7 py-4 text-sm font-bold backdrop-blur-sm transition-all hover:border-slate-400 hover:bg-white"
              >
                <FiPlayCircle className="h-4 w-4 text-[#ff5a1f]" />
                استعلام قیمت
              </button>
            </motion.div>

            <motion.dl
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="mt-14 grid max-w-lg grid-cols-3 gap-6 border-t border-slate-300/80 pt-8"
            >
              {[
                ["۱۵+", "سال تجربه"],
                ["۳۲۰+", "پروژه اجرا‌شده"],
                ["۲۴/۷", "پشتیبانی فنی"],
              ].map(([v, l]) => (
                <div key={l}>
                  <dd className="text-3xl font-black tracking-tight">{v}</dd>
                  <dt className="mt-1 text-[11px] font-medium text-slate-500">
                    {l}
                  </dt>
                </div>
              ))}
            </motion.dl>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.9,
              delay: 0.2,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <ControlRoom />
          </motion.div>
        </div>
      </section>

      {/* MARQUEE */}
      <section className="relative overflow-hidden border-y border-slate-200/80 bg-white/60 py-6 backdrop-blur-sm">
        <div className="pointer-events-none absolute inset-y-0 start-0 z-10 w-24 bg-gradient-to-l from-transparent to-[#f4f6f8]" />
        <div className="pointer-events-none absolute inset-y-0 end-0 z-10 w-24 bg-gradient-to-r from-transparent to-[#f4f6f8]" />
        <motion.div
          animate={reduce ? {} : { x: ["0%", "-50%"] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="flex w-max items-center gap-14 whitespace-nowrap"
        >
          {Array.from({ length: 2 }).map((_, dup) => (
            <div key={dup} className="flex items-center gap-14">
              {[
                "IECEx Certified",
                "ISO 9001:2015",
                "دانش‌بنیان",
                "APIL Laboratory",
                "طراحی و تولید ملی",
                "Zone 0 Rated",
              ].map((t) => (
                <span
                  key={t}
                  className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-widest text-slate-400"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[#ff5a1f]/60" />
                  {t}
                </span>
              ))}
            </div>
          ))}
        </motion.div>
      </section>

      {/* 3D REFINERY SHOWCASE */}
      <section className="py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <Reveal>
            <div className="mb-10 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
              <div>
                <SectionLabel>نمای سه‌بعدی</SectionLabel>
                <h2 className="mt-5 max-w-2xl text-3xl font-black leading-[1.25] tracking-tight sm:text-5xl">
                  پالایشگاه را بچرخانید، از هر زاویه ببینید.
                </h2>
                <p className="mt-5 max-w-xl text-sm leading-8 text-slate-600">
                  یک مدل تعاملی از یک پالایشگاه نمونه با برج تقطیر، مخازن ذخیره،
                  شعله و لوله‌های داده. با موس بچرخانید.
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/70 p-3 backdrop-blur-sm">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#14b8a6]/10 text-[#14b8a6]">
                  <FiLayers className="h-4 w-4" />
                </span>
                <div className="text-start">
                  <p className="text-[11px] font-bold">۳۶۰ درجه</p>
                  <p className="text-[10px] text-slate-500">تعامل کامل</p>
                </div>
              </div>
            </div>
          </Reveal>
          <Reveal>
            <RefineryShowcase />
          </Reveal>
        </div>
      </section>

      {/* PRODUCTS */}
      <section id="products" className="relative py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <Reveal>
            <SectionLabel>محصولات</SectionLabel>
            <h2 className="mt-5 max-w-2xl text-3xl font-black leading-[1.25] tracking-tight sm:text-5xl">
              چهار ابزار، یک زنجیره اندازه‌گیری کامل.
            </h2>
            <p className="mt-5 max-w-xl text-sm leading-8 text-slate-600">
              از سنسور میدان تا داشبورد مرکزی؛ هر قطعه در این خانواده با دیگری
              یکپارچه کار می‌کند.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-6 lg:grid-cols-[.75fr_1.25fr]">
            <div
              role="tablist"
              className="flex gap-3 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0"
            >
              {PRODUCTS.map((x, i) => (
                <Product3DCard
                  key={x.id}
                  product={x}
                  active={i === sel}
                  index={i}
                  onClick={() => setSel(i)}
                />
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={p.id}
                role="tabpanel"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
              >
                {/* 3D product preview */}
                <div className="relative h-[220px] overflow-hidden border-b border-slate-100 bg-[#071018] sm:h-[260px]">
                  <div
                    className="absolute inset-0 opacity-40"
                    style={{
                      background: `radial-gradient(circle at 50% 40%, ${p.color}33, transparent 65%)`,
                    }}
                  />
                  <ProductScene3D type={p.model} color={p.color} />
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                    <span
                      dir="ltr"
                      className="rounded-lg border px-3 py-1 font-mono text-[11px] font-bold backdrop-blur-sm"
                      style={{
                        color: p.color,
                        borderColor: `${p.color}40`,
                        background: `${p.color}15`,
                      }}
                    >
                      {p.code}
                    </span>
                    <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-sm">
                      {p.tag}
                    </span>
                  </div>
                </div>

                <div className="relative p-8 sm:p-10">
                  <div
                    className="absolute -top-24 -left-24 h-64 w-64 rounded-full blur-3xl transition-colors"
                    style={{ background: `${p.color}15` }}
                  />
                  <h3 className="relative text-2xl font-black tracking-tight sm:text-3xl">
                    {p.name}
                  </h3>
                  <p className="relative mt-4 max-w-xl text-sm leading-8 text-slate-600">
                    {p.desc}
                  </p>

                  <dl className="relative mt-8 grid gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 sm:grid-cols-2">
                    {p.specs.map(([k, v]) => (
                      <div
                        key={k}
                        className="flex items-center justify-between gap-3 bg-white px-4 py-3.5"
                      >
                        <dt className="text-[11px] font-medium text-slate-500">
                          {k}
                        </dt>
                        <dd className="flex items-center gap-1.5 text-[12px] font-bold">
                          <FiCheck className="h-3.5 w-3.5 text-emerald-600" />
                          {v}
                        </dd>
                      </div>
                    ))}
                  </dl>

                  <button
                    onClick={() => go("contact")}
                    className="relative mt-8 flex items-center gap-2 text-sm font-bold transition-colors hover:opacity-80"
                    style={{ color: p.color }}
                  >
                    دریافت کاتالوگ و قیمت
                    <FiArrowLeft className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* PIPELINE */}
      <section
        id="pipeline"
        className="relative overflow-hidden bg-[#071018] py-24 text-white lg:py-32"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(900px 400px at 20% 20%, rgba(20,184,166,0.15), transparent 60%), radial-gradient(800px 400px at 80% 80%, rgba(255,90,31,0.12), transparent 60%)",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-300 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-[#14b8a6]" />
              مسیر داده
            </span>
            <h2 className="mt-5 max-w-2xl text-3xl font-black leading-[1.25] tracking-tight sm:text-5xl">
              از سنسور تا اتاق کنترل.
            </h2>
            <p className="mt-5 max-w-xl text-sm leading-8 text-slate-400">
              داده در هر پروژه یک مسیر مشخص و ایمن را طی می‌کند؛ هر حلقه،
              تضمین‌کننده دقت و صحت مرحله بعدی است.
            </p>
          </Reveal>

          <div className="relative mt-16">
            <div className="absolute inset-x-0 top-[42px] hidden h-px lg:block">
              <div className="relative h-px w-full bg-gradient-to-l from-transparent via-white/15 to-transparent">
                {!reduce && (
                  <motion.div
                    initial={{ x: "100%" }}
                    animate={{ x: "-100%" }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute top-0 h-px w-24 bg-gradient-to-l from-transparent via-[#14b8a6] to-transparent"
                  />
                )}
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-4 lg:gap-4">
              {PIPELINE.map((step, i) => {
                const Icon = step.icon;
                return (
                  <Reveal key={step.title} delay={i * 0.1}>
                    <div className="relative flex flex-col items-start gap-5 lg:items-center lg:text-center">
                      <div className="relative">
                        <span
                          className="absolute inset-0 animate-ping rounded-2xl bg-[#14b8a6]/20"
                          style={{ animationDuration: "3s" }}
                        />
                        <span className="relative grid h-20 w-20 place-items-center rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/[0.02] text-[#5eead4] backdrop-blur-sm">
                          <Icon className="h-7 w-7" />
                        </span>
                        <span className="absolute -end-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-[#ff5a1f] text-[10px] font-black text-white shadow-lg">
                          {fa(i + 1)}
                        </span>
                      </div>
                      <div className="lg:max-w-[200px]">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#5eead4]">
                          {step.sub}
                        </p>
                        <h3 className="mt-1.5 text-lg font-black">
                          {step.title}
                        </h3>
                        <p className="mt-2 text-xs leading-7 text-slate-400">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>

          <div className="mt-20 grid gap-px overflow-hidden rounded-3xl bg-white/10 md:grid-cols-3">
            {SOLUTIONS.map(([t, d, items], i) => (
              <Reveal key={t} delay={i * 0.08}>
                <div className="group relative h-full bg-[#071018] p-8 transition-colors hover:bg-[#0d1f33]">
                  <h3 className="text-xl font-black">{t}</h3>
                  <p className="mt-2 text-[13px] leading-7 text-slate-400">
                    {d}
                  </p>
                  <ul className="mt-6 space-y-3 text-[13px] text-slate-200">
                    {items.map((x) => (
                      <li key={x} className="flex items-center gap-2.5">
                        <span className="grid h-5 w-5 place-items-center rounded-md bg-[#14b8a6]/10 text-[#5eead4]">
                          <FiCheck className="h-3 w-3" />
                        </span>
                        {x}
                      </li>
                    ))}
                  </ul>
                  <div className="pointer-events-none absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-[#14b8a6]/10 opacity-0 blur-3xl transition-opacity group-hover:opacity-100" />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* STATS — no tilt, simple hover lift */}
      <section className="py-24 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid gap-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:grid-cols-2 lg:grid-cols-4 lg:p-12">
            {STATS.map((s, i) => {
              const Icon = s.icon;
              return (
                <Reveal key={s.label} delay={i * 0.08}>
                  <div className="flex flex-col items-start gap-4 transition-transform duration-300 hover:-translate-y-1">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-[#ff5a1f]/10 to-[#14b8a6]/10 text-[#ff5a1f]">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-4xl font-black tracking-tight">
                        <Counter to={s.to} suffix={s.suffix} />
                      </p>
                      <p className="mt-1 text-[12px] font-medium text-slate-500">
                        {s.label}
                      </p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="pb-24 lg:pb-32">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 lg:grid-cols-2 lg:px-8">
          <Reveal>
            <SectionLabel>درباره ما</SectionLabel>
            <h2 className="mt-5 text-3xl font-black leading-[1.25] tracking-tight sm:text-5xl">
              استاندارد، نه ادعا.
            </h2>
            <p className="mt-6 max-w-lg text-sm leading-9 text-slate-600">
              رسا فناور آژیراک (RFAA) با تیم مهندسی مجرب و همکاری دانشگاهی،
              تجهیزاتی می‌سازد که پیش از ورود به میدان، در آزمایشگاه‌های معتبر
              آزمون و گواهی می‌شوند. دفتر مرکزی ما در تهران و خط تولید در داخل
              کشور است.
            </p>

            <ul className="mt-8 space-y-3.5 border-t border-slate-200 pt-8">
              {(
                [
                  [FiMapPin, "دفتر مرکزی تهران", "با تیم پشتیبانی فنی مستقر"],
                  [FiZap, "خط تولید داخلی", "کنترل کامل کیفیت از ابتدا"],
                  [FiGlobe, "گواهی‌های بین‌المللی", "IECEx · ISO · دانش‌بنیان"],
                ] as const
              ).map(([I, t, s]) => (
                <li key={t} className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#071018] text-[#ff8a5c]">
                    <I className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[13px] font-bold">{t}</p>
                    <p className="mt-0.5 text-[12px] text-slate-500">{s}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="grid grid-cols-2 gap-4">
              {CERTS.map(([t, s]) => (
                <div
                  key={t}
                  className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#ff5a1f] hover:shadow-xl hover:shadow-orange-500/10"
                >
                  <span className="absolute -top-8 -left-8 h-24 w-24 rounded-full bg-[#ff5a1f]/5 opacity-0 blur-2xl transition-opacity group-hover:opacity-100" />
                  <div className="relative">
                    <b
                      dir="ltr"
                      className="block text-2xl font-black tracking-tight"
                    >
                      {t}
                    </b>
                    <span className="mt-2 block text-[11px] font-medium leading-6 text-slate-500">
                      {s}
                    </span>
                    <FiArrowLeft className="mt-5 h-4 w-4 text-slate-300 transition-all group-hover:-translate-x-1 group-hover:text-[#ff5a1f]" />
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* TESTIMONIALS — no tilt */}
      <section className="pb-24 lg:pb-32">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <Reveal>
            <SectionLabel>اعتماد مشتریان</SectionLabel>
            <h2 className="mt-5 max-w-2xl text-3xl font-black leading-[1.25] tracking-tight sm:text-5xl">
              حرف‌هایی که در میدان شنیده‌ایم.
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={t.name} delay={i * 0.1}>
                <figure className="relative flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/5">
                  <div className="mb-4 flex gap-0.5 text-[#ff5a1f]">
                    {Array.from({ length: 5 }).map((_, k) => (
                      <FiStar key={k} className="h-3.5 w-3.5 fill-current" />
                    ))}
                  </div>
                  <blockquote className="flex-1 text-[13px] leading-8 text-slate-700">
                    «{t.quote}»
                  </blockquote>
                  <figcaption className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-5">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#071018] to-[#0d1f33] text-xs font-black text-white">
                      {t.name.split(" ")[1]?.[0] ?? "R"}
                    </span>
                    <div>
                      <p className="text-[13px] font-bold">{t.name}</p>
                      <p className="text-[11px] text-slate-500">{t.role}</p>
                    </div>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-24 lg:pb-32">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <Reveal>
            <div className="relative overflow-hidden rounded-[36px] bg-gradient-to-br from-[#071018] to-[#0d1f33] p-10 text-white sm:p-16">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "radial-gradient(600px 300px at 20% 20%, rgba(255,90,31,0.25), transparent 60%), radial-gradient(500px 300px at 90% 80%, rgba(20,184,166,0.2), transparent 60%)",
                }}
              />
              <div className="relative grid items-center gap-10 lg:grid-cols-[1.2fr_.8fr]">
                <div>
                  <h2 className="text-3xl font-black leading-[1.2] tracking-tight sm:text-5xl">
                    پروژه‌تان را از امروز شروع کنیم.
                  </h2>
                  <p className="mt-5 max-w-lg text-sm leading-8 text-slate-300">
                    تیم مهندسی ما آماده بررسی نیاز شما، انتخاب محصول مناسب و
                    ارائه پیشنهاد فنی و مالی در سریع‌ترین زمان است.
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => go("contact")}
                    className="group flex items-center justify-between gap-2 rounded-2xl bg-[#ff5a1f] px-6 py-5 text-sm font-bold shadow-xl shadow-orange-500/25 transition-all hover:bg-[#e84a12]"
                  >
                    شروع گفتگو با کارشناس
                    <FiArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                  </button>
                  <a
                    href="tel:+982188776655"
                    className="flex items-center justify-between gap-2 rounded-2xl border border-white/15 bg-white/5 px-6 py-5 text-sm font-bold backdrop-blur-sm transition-colors hover:bg-white/10"
                  >
                    <span>تماس تلفنی</span>
                    <span
                      dir="ltr"
                      className="font-mono text-[12px] text-slate-300"
                    >
                      ۰۲۱-۸۸۷۷۶۶۵۵
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="pb-24 lg:pb-32">
        <div className="mx-auto grid max-w-7xl gap-6 px-5 lg:grid-cols-[1.15fr_.85fr] lg:px-8">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 sm:p-10">
              <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-[#14b8a6]/5 blur-3xl" />
              <div className="relative">
                <h2 className="text-2xl font-black sm:text-3xl">
                  پروژه‌تان را بگویید.
                </h2>
                <p className="mt-2 text-[13px] text-slate-500">
                  ظرف ۲۴ ساعت کاری پاسخ می‌دهیم.
                </p>

                {sent ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    role="status"
                    className="mt-10 flex items-center gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-6"
                  >
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-500 text-white">
                      <FiCheck className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-[13px] font-bold text-emerald-900">
                        درخواست شما با موفقیت ثبت شد.
                      </p>
                      <p className="mt-0.5 text-[12px] text-emerald-700">
                        کارشناس ما در اولین فرصت با شما تماس می‌گیرد.
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setSent(true);
                    }}
                    className="mt-8 grid gap-5 sm:grid-cols-2"
                  >
                    <div className="relative">
                      <input required placeholder="نام" className={field} />
                      <label className={labelCls}>نام و نام خانوادگی</label>
                    </div>
                    <div className="relative">
                      <input placeholder="شرکت" className={field} />
                      <label className={labelCls}>نام شرکت</label>
                    </div>
                    <div className="relative">
                      <input
                        required
                        inputMode="tel"
                        placeholder="تلفن"
                        className={field}
                      />
                      <label className={labelCls}>شماره تماس</label>
                    </div>
                    <div className="relative">
                      <input
                        type="email"
                        dir="ltr"
                        placeholder="ایمیل"
                        className={field}
                      />
                      <label className={`${labelCls} start-3 text-start`}>
                        ایمیل
                      </label>
                    </div>
                    <div className="relative sm:col-span-2">
                      <select className={field}>
                        <option>مشاوره فنی</option>
                        <option>استعلام قیمت</option>
                        <option>سفارش محصول</option>
                        <option>پشتیبانی فنی</option>
                      </select>
                      <label className={labelCls}>موضوع درخواست</label>
                    </div>
                    <div className="relative sm:col-span-2">
                      <textarea
                        rows={4}
                        placeholder="توضیحات"
                        className={`${field} resize-none`}
                      />
                      <label className={labelCls}>شرح درخواست</label>
                    </div>
                    <button className="group flex items-center justify-center gap-2 rounded-xl bg-[#071018] py-4 text-sm font-bold text-white shadow-lg shadow-slate-900/10 transition-all hover:bg-[#0d1f33] sm:col-span-2">
                      <FiSend className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                      ارسال درخواست
                    </button>
                  </form>
                )}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="flex h-full flex-col gap-4">
              {(
                [
                  [FiPhone, "تلفن تماس", "۰۲۱-۸۸۷۷۶۶۵۵", "پاسخ در ساعات کاری"],
                  [FiMail, "ایمیل", "info@rfaa.ir", "پاسخ حداکثر ۲۴ ساعت"],
                  [
                    FiMapPin,
                    "نشانی دفتر مرکزی",
                    "تهران، خیابان ولیعصر، بالاتر از میدان ونک، برج نگین، طبقه ۸",
                    "",
                  ],
                ] as const
              ).map(([I, l, v, s]) => (
                <div
                  key={l}
                  className="flex items-start gap-4 rounded-3xl border border-slate-200 bg-white p-6 transition-colors hover:border-slate-300"
                >
                  <span className="mt-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#ff5a1f]/10 text-[#ff5a1f]">
                    <I className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium text-slate-500">
                      {l}
                    </p>
                    <p className="mt-1 text-[13px] font-bold leading-7">{v}</p>
                    {s && <p className="mt-1 text-[11px] text-slate-400">{s}</p>}
                  </div>
                </div>
              ))}

              <div className="mt-auto rounded-3xl bg-[#071018] p-6 text-white">
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <FiClock className="h-3.5 w-3.5 text-[#5eead4]" />
                  ساعات کاری
                </div>
                <p className="mt-3 text-[13px] leading-7 text-slate-300">
                  شنبه تا چهارشنبه · ۸:۳۰ تا ۱۷:۰۰
                  <br />
                  پنجشنبه · ۸:۳۰ تا ۱۳:۰۰
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white/60 py-10 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#071018] text-[11px] font-black text-white">
                RF
              </span>
              <div className="text-start">
                <p className="text-[12px] font-bold">رسا فناور آژیراک</p>
                <p className="text-[10px] text-slate-500">
                  ابزار دقیق صنعتی · RFAA
                </p>
              </div>
            </div>

            <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[12px] font-medium text-slate-500">
              {NAV.map(([id, l]) => (
                <button
                  key={id}
                  onClick={() => go(id)}
                  className="transition-colors hover:text-[#071018]"
                >
                  {l}
                </button>
              ))}
            </nav>
          </div>

          <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-6 sm:flex-row">
            <p className="text-[11px] text-slate-500">
              © ۱۴۰۴ رسا فناور آژیراک · تمامی حقوق محفوظ است.
            </p>
            <p className="flex items-center gap-1.5 text-[11px] text-slate-500">
              ساخته‌شده برای صنعت ایران
              <span className="text-[#ff5a1f]">❤</span>
            </p>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700;800;900&display=swap");
        html {
          scroll-behavior: smooth;
          scroll-padding-top: 80px;
          -webkit-font-smoothing: antialiased;
        }
        body {
          background: #f4f6f8;
        }
        button:focus-visible,
        a:focus-visible,
        select:focus-visible,
        input:focus-visible,
        textarea:focus-visible {
          outline: 2px solid #ff5a1f;
          outline-offset: 2px;
        }
        select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: left 1rem center;
          padding-inline-end: 1rem;
          padding-inline-start: 2.5rem;
        }
        ::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }
        ::-webkit-scrollbar-track {
          background: #eef1f4;
        }
        ::-webkit-scrollbar-thumb {
          background: #c7d0d9;
          border-radius: 10px;
          border: 2px solid #eef1f4;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        @media (prefers-reduced-motion: reduce) {
          html {
            scroll-behavior: auto;
          }
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}