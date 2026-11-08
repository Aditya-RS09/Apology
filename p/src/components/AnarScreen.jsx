import { useEffect, useRef, useState } from "react";

const POT_BOTTOM = 70; // pot distance from the bottom of the screen
const POT_H = 200;
const FUSE_START = 1500; // fuse starts burning
const IGNITE = 3000; // anar lights up

const PALETTES = [
  ["#ffd166", "#ffb703", "#ff9f1c", "#fff3b0"], // gold
  ["#ff4d6d", "#ff758f", "#ffd166", "#ffffff"], // rose + gold
  ["#c77dff", "#9d4edd", "#ff9ee6", "#ffffff"], // purple
  ["#4cc9f0", "#90e0ef", "#ffffff", "#ffd166"], // blue
  ["#ff7b00", "#ff595e", "#ffd166", "#fff3b0"], // fire
];
const HEART_PAL = ["#ff4d6d", "#ff8fab", "#ffd6e0", "#ffffff"];
const BURST_TYPES = ["ring", "sphere", "heart", "ring", "sphere"];

const rand = (a, b) => a + Math.random() * (b - a);

// lit windows in the skyline [x, y]
const WINDOWS = [
  [30, 205], [60, 205], [145, 175], [175, 175], [145, 215], [235, 215],
  [265, 215], [380, 215], [420, 215], [460, 215], [400, 180], [450, 180],
  [540, 210], [570, 210], [640, 225], [1240, 225], [1270, 225], [1345, 205],
  [1375, 205], [1470, 200], [1520, 200], [1570, 200], [1500, 230],
  [1680, 215], [1720, 215], [1790, 180], [1830, 180], [1870, 180],
  [1800, 225], [1850, 225],
];

const RANGOLI_COLORS = ["#ff595e", "#ffd166", "#ff9f1c", "#ff4d6d", "#c77dff"];
const DIYAS = [-340, -250, -150, 150, 250, 340];

const AnarScreen = () => {
  const canvasRef = useRef(null);
  const launchRef = useRef(null);
  const [lit, setLit] = useState(false);

  const [stars] = useState(() =>
    Array.from({ length: 90 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 62,
      size: 1 + Math.random() * 2.2,
      dur: 2 + Math.random() * 3,
      delay: Math.random() * 4,
    }))
  );

  // light the anar after the fuse has burned
  useEffect(() => {
    const t = setTimeout(() => setLit(true), IGNITE);
    return () => clearTimeout(t);
  }, []);

  // all the sparks and fireworks
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    let s = Math.min(1.3, Math.max(0.65, h / 900));
    let sparks = [];
    let rockets = [];
    let raf;
    let last = performance.now();
    const start = last;
    let nextRocket = IGNITE + 4500;

    const onResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      s = Math.min(1.3, Math.max(0.65, h / 900));
    };
    window.addEventListener("resize", onResize);

    const addSpark = (p) => {
      if (sparks.length > 3200) return;
      sparks.push({ px: p.x, py: p.y, drag: 1, tw: false, size: 2, ...p });
    };

    const burst = (x, y, pal, type) => {
      const pick = () => pal[(Math.random() * pal.length) | 0];
      if (type === "heart") {
        const n = 90;
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2;
          const hx = 16 * Math.pow(Math.sin(a), 3);
          const hy = -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a));
          const k = 0.5 * s * (0.94 + Math.random() * 0.12);
          addSpark({
            x, y, vx: hx * k, vy: hy * k, life: 1, decay: 0.009,
            size: 2.6, color: HEART_PAL[(Math.random() * HEART_PAL.length) | 0],
            g: 0.02 * s, drag: 0.945, tw: true,
          });
        }
      } else {
        const n = 120;
        for (let i = 0; i < n; i++) {
          const a = Math.random() * Math.PI * 2;
          const sp =
            (type === "ring" ? rand(4.4, 5.2) : rand(1.2, 5.4)) * s;
          addSpark({
            x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1,
            decay: rand(0.009, 0.014), size: rand(1.6, 2.8), color: pick(),
            g: 0.03 * s, drag: 0.965, tw: true,
          });
        }
      }
      // bright flash at the centre
      for (let i = 0; i < 6; i++) {
        addSpark({
          x, y, vx: rand(-0.4, 0.4), vy: rand(-0.4, 0.4), life: 1,
          decay: 0.09, size: 7, color: "#fff6d6", g: 0, drag: 0.9,
        });
      }
    };

    const launch = (x, targetY, pal, type) => {
      rockets.push({
        x, y: h - POT_BOTTOM - 10, vx: rand(-0.3, 0.3),
        vy: -rand(9, 12) * s, targetY, pal, type,
      });
    };

    launchRef.current = (x, y) => {
      launch(
        x,
        Math.min(y, h * 0.7),
        PALETTES[(Math.random() * PALETTES.length) | 0],
        BURST_TYPES[(Math.random() * BURST_TYPES.length) | 0]
      );
    };

    const frame = (now) => {
      const dt = Math.min(3, (now - last) / 16.67);
      last = now;
      const t = now - start;
      const mouthX = w / 2;
      const potTop = h - POT_BOTTOM - POT_H;

      // fade old trails to transparent
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0,0,0,0.24)";
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";

      // tiny sparks from the burning fuse
      if (t > FUSE_START && t < IGNITE) {
        const p = (t - FUSE_START) / (IGNITE - FUSE_START);
        const tipY = potTop - 30 * (1 - p);
        if (Math.random() < 0.7 * dt) {
          addSpark({
            x: mouthX + rand(-2, 2), y: tipY, vx: rand(-1.2, 1.2),
            vy: rand(-2.5, -0.5), life: 0.8, decay: 0.05, size: 1.4,
            color: "#ffd166", g: 0.08 * s, drag: 0.98,
          });
        }
      }

      // the anar fountain
      if (t > IGNITE) {
        const ramp = Math.min(1, (t - IGNITE) / 2500);
        const pal = PALETTES[Math.floor((t - IGNITE) / 6000) % PALETTES.length];
        const sway = Math.sin(t / 650) * 0.12;
        const count = Math.round((3 + 12 * ramp) * dt);
        for (let i = 0; i < count; i++) {
          const ang = -Math.PI / 2 + sway + rand(-0.38, 0.38);
          const sp =
            (rand(6, 12) + (Math.random() < 0.06 ? rand(2, 4) : 0)) *
            s * (0.55 + 0.45 * ramp);
          addSpark({
            x: mouthX + rand(-6, 6), y: potTop + 8,
            vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, life: 1,
            decay: rand(0.008, 0.016), size: rand(1.2, 2.8),
            color: pal[(Math.random() * pal.length) | 0],
            g: 0.16 * s, drag: 0.995, tw: Math.random() < 0.3,
          });
        }

        // sky fireworks every couple of seconds
        if (t > nextRocket) {
          launch(
            rand(w * 0.12, w * 0.88),
            rand(h * 0.14, h * 0.42),
            PALETTES[(Math.random() * PALETTES.length) | 0],
            BURST_TYPES[(Math.random() * BURST_TYPES.length) | 0]
          );
          nextRocket = t + rand(1800, 3200);
        }
      }

      // rockets
      rockets = rockets.filter((r) => {
        r.x += r.vx * dt;
        r.y += r.vy * dt;
        addSpark({
          x: r.x, y: r.y, vx: rand(-0.3, 0.3), vy: rand(0.2, 1),
          life: 0.7, decay: 0.05, size: 1.6, color: "#ffe9a8",
          g: 0.04, drag: 0.98,
        });
        ctx.globalAlpha = 1;
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(r.x, r.y, 2.4, 0, Math.PI * 2);
        ctx.fill();
        if (r.y <= r.targetY) {
          burst(r.x, r.y, r.pal, r.type);
          return false;
        }
        return true;
      });

      // sparks
      sparks = sparks.filter(
        (p) => p.life > 0 && p.y < h - POT_BOTTOM + 15
      );
      ctx.lineCap = "round";
      for (const p of sparks) {
        p.px = p.x;
        p.py = p.y;
        const d = Math.pow(p.drag, dt);
        p.vx *= d;
        p.vy *= d;
        p.vy += p.g * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= p.decay * dt;
        ctx.globalAlpha =
          Math.max(p.life, 0) * (p.tw ? 0.5 + Math.random() * 0.5 : 1);
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.size;
        ctx.beginPath();
        ctx.moveTo(p.px, p.py);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const handlePointer = (e) => launchRef.current?.(e.clientX, e.clientY);

  const serif = "'Playfair Display', Georgia, serif";

  return (
    <div
      onPointerDown={handlePointer}
      className="fixed inset-0 z-[40] overflow-hidden select-none"
      style={{
        cursor: "pointer",
        background:
          "linear-gradient(180deg, #02010a 0%, #0a0620 45%, #1a0b30 75%, #3a1238 100%)",
        animation: "rootFade 1.2s ease both",
      }}
    >
      {/* stars */}
      {stars.map((st) => (
        <span
          key={st.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${st.left}%`,
            top: `${st.top}%`,
            width: st.size,
            height: st.size,
            animation: `twinkle ${st.dur}s ease-in-out ${st.delay}s infinite alternate`,
          }}
        />
      ))}

      {/* moon */}
      <div
        className="absolute rounded-full"
        style={{
          top: "7%",
          right: "8%",
          width: 58,
          height: 58,
          boxShadow: "inset -15px 6px 0 0 #fff1c4",
          filter: "drop-shadow(0 0 14px rgba(255,240,190,0.7))",
        }}
      />

      {/* shooting stars */}
      <div
        className="absolute"
        style={{
          top: "6%", right: "34%", width: 120, height: 2,
          background: "linear-gradient(270deg, transparent, #fff)",
          animation: "shoot 9s linear 4s infinite", opacity: 0,
        }}
      />
      <div
        className="absolute"
        style={{
          top: "14%", right: "58%", width: 90, height: 2,
          background: "linear-gradient(270deg, transparent, #fff)",
          animation: "shoot 12s linear 9s infinite", opacity: 0,
        }}
      />

      {/* skyline */}
      <svg
        viewBox="0 0 1920 260"
        className="absolute left-0 w-full"
        style={{ bottom: 140 }}
      >
        <g fill="#07030f">
          <rect x="0" y="175" width="120" height="85" />
          <rect x="120" y="145" width="90" height="115" />
          <rect x="210" y="190" width="110" height="70" />
          {/* left temple */}
          <rect x="340" y="195" width="180" height="65" />
          <rect x="360" y="160" width="140" height="40" />
          <path d="M372 160 L430 62 L488 160 Z" />
          <path d="M402 100 L430 28 L458 100 Z" />
          <rect x="427" y="10" width="6" height="22" />
          <circle cx="430" cy="10" r="6" />
          <rect x="520" y="185" width="90" height="75" />
          <rect x="610" y="205" width="110" height="55" />
          {/* low wall in the middle */}
          <rect x="720" y="232" width="480" height="28" />
          {/* right side */}
          <rect x="1210" y="205" width="110" height="55" />
          <rect x="1320" y="180" width="90" height="80" />
          <rect x="1420" y="170" width="200" height="90" />
          <path d="M1440 170 Q1520 70 1600 170 Z" />
          <rect x="1517" y="48" width="6" height="30" />
          <circle cx="1520" cy="46" r="6" />
          <rect x="1626" y="110" width="16" height="150" />
          <circle cx="1634" cy="106" r="10" />
          <rect x="1650" y="190" width="110" height="70" />
          <rect x="1760" y="150" width="160" height="110" />
        </g>
        <g fill="#ffcf6b">
          {WINDOWS.map(([x, y], i) => (
            <rect
              key={i}
              x={x}
              y={y}
              width="8"
              height="11"
              style={{
                animation: `twinkleWin ${2 + (i % 5)}s ease-in-out ${(i % 7) * 0.4}s infinite alternate`,
              }}
            />
          ))}
        </g>
      </svg>

      {/* ground */}
      <div
        className="absolute left-0 right-0 bottom-0"
        style={{
          height: 150,
          background: "linear-gradient(180deg, #1d0c27 0%, #0b0513 60%, #05020a 100%)",
          borderTop: "1px solid rgba(255,170,60,0.25)",
        }}
      />

      {/* rangoli */}
      <svg
        viewBox="-380 -50 760 100"
        className="absolute left-1/2"
        style={{
          bottom: 20,
          width: 760,
          height: 100,
          marginLeft: -380,
          opacity: lit ? 1 : 0.55,
          transition: "opacity 2s ease",
          filter: lit ? "drop-shadow(0 0 8px rgba(255,170,60,0.7))" : "none",
        }}
      >
        <g transform="scale(1 0.13)" fill="none" strokeWidth="5">
          <circle r="360" stroke="#ffd166" strokeDasharray="4 14" strokeLinecap="round" />
          <circle r="300" stroke="#ff595e" />
          <circle r="130" stroke="#ffd166" strokeWidth="6" />
          {Array.from({ length: 16 }).map((_, i) => (
            <ellipse
              key={i}
              cx="0"
              cy="-215"
              rx="34"
              ry="84"
              stroke={RANGOLI_COLORS[i % RANGOLI_COLORS.length]}
              transform={`rotate(${i * 22.5})`}
            />
          ))}
          {Array.from({ length: 8 }).map((_, i) => (
            <circle
              key={i}
              cx="0"
              cy="-80"
              r="14"
              fill={RANGOLI_COLORS[(i + 1) % RANGOLI_COLORS.length]}
              stroke="none"
              transform={`rotate(${i * 45})`}
            />
          ))}
        </g>
      </svg>

      {/* diyas */}
      {DIYAS.map((x, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: `calc(50% + ${x}px)`,
            bottom: 62 + (i % 2) * 8,
            width: 26,
            marginLeft: -13,
          }}
        >
          <div
            className="mx-auto"
            style={{
              width: 8,
              height: 15,
              borderRadius: "50% 50% 50% 50% / 62% 62% 38% 38%",
              background: "linear-gradient(#fff7c2, #ff9f1c)",
              boxShadow: "0 0 14px 6px rgba(255,170,40,0.75)",
              animation: `flick ${0.25 + (i % 3) * 0.08}s ease-in-out infinite alternate`,
            }}
          />
          <div
            style={{
              width: 26,
              height: 11,
              marginTop: -2,
              borderRadius: "0 0 26px 26px",
              background: "linear-gradient(#e2692a, #8a2e0f)",
            }}
          />
        </div>
      ))}

      {/* glow on the ground and in the sky around the anar */}
      <div
        className="absolute left-1/2 pointer-events-none"
        style={{
          bottom: -60,
          width: 1000,
          height: 320,
          marginLeft: -500,
          background:
            "radial-gradient(ellipse, rgba(255,150,40,0.7), rgba(255,90,0,0.22) 45%, transparent 70%)",
          opacity: lit ? 1 : 0.12,
          transition: "opacity 2s ease",
          animation: lit ? "glowPulse 1.1s ease-in-out infinite alternate" : "none",
        }}
      />
      <div
        className="absolute left-1/2 pointer-events-none"
        style={{
          bottom: 100,
          width: 520,
          height: 520,
          marginLeft: -260,
          background:
            "radial-gradient(circle, rgba(255,190,80,0.35), transparent 65%)",
          opacity: lit ? 1 : 0,
          transition: "opacity 2.5s ease",
        }}
      />

      {/* pot shadow */}
      <div
        className="absolute left-1/2 pointer-events-none"
        style={{
          bottom: POT_BOTTOM - 8,
          width: 210,
          height: 20,
          marginLeft: -105,
          background: "radial-gradient(ellipse, rgba(0,0,0,0.7), transparent 70%)",
        }}
      />

      {/* the anar pot */}
      <div
        className="absolute left-1/2"
        style={{
          bottom: POT_BOTTOM,
          width: 170,
          height: POT_H,
          marginLeft: -85,
        }}
      >
        {!lit && (
          <div
            className="absolute"
            style={{
              left: "50%",
              bottom: "100%",
              marginLeft: -1.5,
              width: 3,
              height: 30,
              background: "linear-gradient(#e0bb83, #a9814b)",
              animation: `fuseBurn ${IGNITE - FUSE_START}ms linear ${FUSE_START}ms forwards`,
            }}
          >
            <span
              className="absolute rounded-full"
              style={{
                top: -8,
                left: -5,
                width: 13,
                height: 13,
                background: "#ffd166",
                boxShadow: "0 0 14px 6px #ff9f1c",
                animation: "flick 0.12s ease-in-out infinite alternate",
              }}
            />
          </div>
        )}

        <div
          style={{
            width: "100%",
            height: "100%",
            animation: lit
              ? "potShake 0.5s ease 1, potGlow 1s ease-in-out 0.5s infinite alternate"
              : "none",
            filter: lit ? undefined : "drop-shadow(0 0 5px rgba(120,30,10,0.8))",
          }}
        >
          <svg viewBox="0 0 170 200" width="170" height="200" style={{ overflow: "visible" }}>
            <defs>
              <linearGradient id="anarBody" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0" stopColor="#4a0a07" />
                <stop offset="0.3" stopColor="#b3200f" />
                <stop offset="0.5" stopColor="#f0502f" />
                <stop offset="0.7" stopColor="#b3200f" />
                <stop offset="1" stopColor="#3d0806" />
              </linearGradient>
              <linearGradient id="anarGold" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0" stopColor="#8a5a12" />
                <stop offset="0.25" stopColor="#ffe08a" />
                <stop offset="0.5" stopColor="#c98f1f" />
                <stop offset="0.75" stopColor="#ffe08a" />
                <stop offset="1" stopColor="#8a5a12" />
              </linearGradient>
              <clipPath id="anarClip">
                <path d="M50 12 H120 L156 192 Q156 198 150 198 H20 Q14 198 14 192 Z" />
              </clipPath>
            </defs>

            <path
              d="M50 12 H120 L156 192 Q156 198 150 198 H20 Q14 198 14 192 Z"
              fill="url(#anarBody)"
            />
            <g clipPath="url(#anarClip)">
              <rect x="0" y="52" width="170" height="9" fill="url(#anarGold)" />
              <rect x="0" y="136" width="170" height="9" fill="url(#anarGold)" />
              <rect x="0" y="178" width="170" height="14" fill="url(#anarGold)" />
              <polyline
                points={Array.from({ length: 12 }, (_, i) => `${i * 16},${i % 2 ? 78 : 68}`).join(" ")}
                fill="none"
                stroke="#ffe08a"
                strokeWidth="2"
              />
              <polyline
                points={Array.from({ length: 12 }, (_, i) => `${i * 16},${i % 2 ? 160 : 150}`).join(" ")}
                fill="none"
                stroke="#ffe08a"
                strokeWidth="2"
              />
              <text
                x="85"
                y="118"
                textAnchor="middle"
                fontSize="38"
                fill="#ffe08a"
              >
                ✦
              </text>
              {[44, 58, 112, 126].map((x) => (
                <circle key={x} cx={x} cy="108" r="3" fill="#ffe08a" />
              ))}
              <rect x="68" y="12" width="10" height="190" fill="#fff" opacity="0.08" />
            </g>
            <rect x="44" y="0" width="82" height="16" rx="5" fill="url(#anarGold)" />
            <ellipse
              cx="85"
              cy="3"
              rx="36"
              ry="5"
              fill="#fff3b0"
              style={{ opacity: lit ? 1 : 0, transition: "opacity 0.6s" }}
            />
          </svg>
        </div>
      </div>

      {/* sparks and fireworks */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
      />

      {/* flash when the anar lights */}
      {lit && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 50% 78%, rgba(255,240,190,0.95), rgba(255,160,40,0.4) 35%, transparent 65%)",
            animation: "flashFade 0.9s ease-out forwards",
          }}
        />
      )}

      {/* message */}
      <div
        className="absolute left-0 right-0 text-center px-4 pointer-events-none"
        style={{ top: "9%" }}
      >
        <h1
          style={{
            fontFamily: serif,
            fontWeight: 700,
            fontSize: "clamp(1.8rem, 4.5vw, 3.6rem)",
            animation: "fadeIn 2.5s ease 4s both",
          }}
        >
          <span className="gold-text">Shubh Deepawali, my love</span>{" "}
          <span>🪔</span>
        </h1>
        <p
          style={{
            marginTop: 10,
            fontFamily: serif,
            fontSize: "clamp(0.95rem, 1.8vw, 1.25rem)",
            color: "rgba(255,233,176,0.85)",
            animation: "fadeIn 2s ease 9s both",
          }}
        >
          Tap anywhere to light up the sky ✨
        </p>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700&display=swap');

        .gold-text {
          background: linear-gradient(90deg, #ffb703, #fff3b0, #ffb703);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 0 12px rgba(255,170,0,0.7));
        }

        @keyframes rootFade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes twinkle {
          from { opacity: 0.2; }
          to { opacity: 1; }
        }
        @keyframes twinkleWin {
          from { opacity: 0.45; }
          to { opacity: 1; }
        }
        @keyframes flick {
          from { transform: scale(0.85); opacity: 0.8; }
          to { transform: scale(1.2); opacity: 1; }
        }
        @keyframes fuseBurn {
          from { height: 30px; }
          to { height: 0px; }
        }
        @keyframes potShake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-3px); }
          40% { transform: translateX(3px); }
          60% { transform: translateX(-2px); }
          80% { transform: translateX(2px); }
        }
        @keyframes potGlow {
          from { filter: drop-shadow(0 0 14px #ff9f1c) brightness(1); }
          to { filter: drop-shadow(0 0 42px #ffd166) brightness(1.25); }
        }
        @keyframes glowPulse {
          from { opacity: 0.75; }
          to { opacity: 1; }
        }
        @keyframes flashFade {
          0% { opacity: 0.95; }
          100% { opacity: 0; }
        }
        @keyframes shoot {
          0% { transform: translate(0, 0) rotate(-35deg); opacity: 0; }
          2% { opacity: 1; }
          10% { transform: translate(-420px, 300px) rotate(-35deg); opacity: 0; }
          100% { transform: translate(-420px, 300px) rotate(-35deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default AnarScreen;