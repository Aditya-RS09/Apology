import { useEffect, useRef, useState } from "react";

const lines = [
  "Happy Diwali, baby! 🪔❤️✨",
  "I'm truly sorry for making you cry, my love. 🥺💗 It was never my intention to hurt you or make you feel that way. 💔",
  "I was going through a difficult time myself, but I should have cared for you, understood your feelings, and been there for you. 🫂❤️",
  "I know I made mistakes, and I take responsibility for them. I genuinely want to make things right by showing you my love through my actions and efforts, not just my words. 🥹💕",
  "I wish you the most beautiful Diwali filled with endless happiness, laughter, love, and countless moments of joy. 🪔🌸💖",
  "I'm missing you so, so much, baby! 🥺❤️ Please come back soon. I want you here with me so that I can finally feel the magic of Diwali too. 🫶🏻💞",
  "Because honestly, it's not about which day you come back. My Diwali will begin on the day I get to see you, hold you close, and have you beside me. 🥹🫂❤️",
  "Once again, I'm truly sorry for everything I did wrong in the past, my love. I promise to put in genuine efforts to make things better. 💗🕊️",
  "I love you more than words can ever express, baby! ❤️😘",
  "Wishing you a very Happy, Beautiful, Bright, and Safe Diwali, my sweetheart! 🪔🌙💖✨",
];

const FIRST_GAP = 3000; // short pause after the heading
const GAP = 1000; // pause between the other sentences (8 seconds)
const BUTTON_DELAY = 3000; // wait after the last sentence before the button

const bulbColors = ["#ffd166", "#ff9f1c", "#ff595e", "#ffe29a", "#ff7b00"];
const floaters = ["✨", "🪔", "⭐", "✨", "🪷", "✨"];

const DiwaliScreen = ({ onBlow }) => {
  // the heading is visible from the start
  const [visible, setVisible] = useState(1);
  const [showButton, setShowButton] = useState(false);
  const bottomRef = useRef(null);

  // floating sparkles, generated once
  const [particles] = useState(() =>
    Array.from({ length: 18 }, (_, i) => ({
      id: i,
      emoji: floaters[i % floaters.length],
      left: Math.random() * 94,
      size: 14 + Math.random() * 16,
      duration: 9 + Math.random() * 9,
      delay: Math.random() * 10,
    }))
  );

  // add the next sentence after the pause; earlier ones stay on screen
  useEffect(() => {
    if (visible >= lines.length) return;
    const t = setTimeout(
      () => setVisible((v) => v + 1),
      visible === 1 ? FIRST_GAP : GAP
    );
    return () => clearTimeout(t);
  }, [visible]);

  // show the button a few seconds after the last sentence
  useEffect(() => {
    if (visible < lines.length) return;
    const t = setTimeout(() => setShowButton(true), BUTTON_DELAY);
    return () => clearTimeout(t);
  }, [visible]);

  // scroll down smoothly so the newest sentence (or button) is in view
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [visible, showButton]);

  return (
    <div className="flex-1 flex items-center justify-center px-6 py-16 relative">
      {/* the card: overflow-hidden keeps every effect inside the frame */}
      <div
        className="relative overflow-hidden rounded-[3rem] text-center max-w-3xl w-full"
        style={{
          background:
            "linear-gradient(160deg, #fffaf0 0%, #fff1d6 45%, #ffe2b8 100%)",
          border: "4px solid #f5b83d",
          boxShadow:
            "0 0 0 6px rgba(255,255,255,0.7), 0 20px 60px rgba(255,140,0,0.35), inset 0 0 60px rgba(255,190,80,0.35)",
        }}
      >
        {/* ===== Effects layer (inside the card only) ===== */}
        <div className="absolute inset-0 pointer-events-none z-0">
          {/* soft glows */}
          <div
            className="absolute -top-20 -left-20 w-72 h-72 rounded-full"
            style={{ background: "radial-gradient(circle,#ffd166aa,transparent 70%)" }}
          />
          <div
            className="absolute -bottom-24 -right-20 w-80 h-80 rounded-full"
            style={{ background: "radial-gradient(circle,#ff9f1caa,transparent 70%)" }}
          />

          {/* floating sparkles and diyas */}
          {particles.map((p) => (
            <span
              key={p.id}
              className="absolute"
              style={{
                left: `${p.left}%`,
                bottom: "-40px",
                fontSize: p.size,
                opacity: 0,
                animation: `floatUp ${p.duration}s linear ${p.delay}s infinite`,
              }}
            >
              {p.emoji}
            </span>
          ))}
        </div>

        {/* string of twinkling lights along the top */}
        <div className="relative z-10 flex justify-around px-6 pt-3">
          {Array.from({ length: 16 }).map((_, i) => (
            <span
              key={i}
              className="block rounded-full"
              style={{
                width: 10,
                height: 10,
                background: bulbColors[i % bulbColors.length],
                boxShadow: `0 0 10px 3px ${bulbColors[i % bulbColors.length]}`,
                animation: `twinkle 1.4s ease-in-out ${(i % 5) * 0.25}s infinite alternate`,
              }}
            />
          ))}
        </div>

        {/* ===== Content ===== */}
        <div className="relative z-10 p-12 pt-8">
          <div
            className="text-7xl mb-6"
            style={{ animation: "diyaGlow 1.6s ease-in-out infinite alternate" }}
          >
            🪔
          </div>

          {lines.slice(0, visible).map((line, i) => (
            <p
              key={i}
              className={`mb-6 ${
                i === 0 ? "diwali-title text-5xl" : "text-2xl leading-relaxed"
              }`}
              style={{
                animation: "fadeIn 1s ease forwards",
                color: i === 0 ? undefined : "#5a1f12",
                fontFamily: "'Playfair Display', Georgia, serif",
                fontWeight: i === 0 ? 700 : 500,
              }}
            >
              {line}
            </p>
          ))}

          {/* Blow the Firecracker button, after the last sentence */}
          {showButton && (
            <button
              onClick={onBlow}
              className="mt-4 mb-2 px-12 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full text-2xl font-medium shadow-lg hover:scale-105 transition-all duration-300"
              style={{
                animation:
                  "fadeIn 1s ease forwards, buttonGlow 1.5s ease-in-out infinite alternate",
              }}
            >
              Blow the Firecracker 🎆
            </button>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700&display=swap');

        .diwali-title {
          background: linear-gradient(90deg, #e65100, #f5a000, #e65100);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 0 8px rgba(255,170,0,0.55));
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes twinkle {
          from { opacity: 0.35; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1.15); }
        }
        @keyframes diyaGlow {
          from { filter: drop-shadow(0 0 6px #ff9f1c); transform: scale(1); }
          to { filter: drop-shadow(0 0 22px #ffd166); transform: scale(1.08); }
        }
        @keyframes floatUp {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          10% { opacity: 0.9; }
          90% { opacity: 0.8; }
          100% { transform: translateY(-1800px) rotate(25deg); opacity: 0; }
        }
        @keyframes buttonGlow {
          from { box-shadow: 0 0 8px 0 rgba(255,140,0,0.5); }
          to { box-shadow: 0 0 28px 8px rgba(255,140,0,0.8); }
        }
      `}</style>
    </div>
  );
};

export default DiwaliScreen;