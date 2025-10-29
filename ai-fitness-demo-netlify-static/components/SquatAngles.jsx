"use client";
import { useRef, useState, useEffect } from "react";
import Lottie from "lottie-react";

// Assure-toi d'avoir ces 3 fichiers dans public/lottie/
import squatFront from "@/public/lottie/squat-front.json";
import squatSide from "@/public/lottie/squat-side.json";
import squatBack from "@/public/lottie/squat-back.json";

const ANGLES = [
  { key: "front", label: "Face", data: squatFront },
  { key: "side",  label: "Profil", data: squatSide },
  { key: "back",  label: "Dos", data: squatBack },
];

export default function SquatAngles() {
  const [idx, setIdx] = useState(0); // 0: face, 1: profil, 2: dos
  const lottieRef = useRef(null);
  const containerRef = useRef(null);

  // Relance l’animation quand on change d’angle
  useEffect(() => {
    const l = lottieRef.current;
    if (!l) return;
    l.stop();
    // Petite attente pour s'assurer du changement de source
    const t = setTimeout(() => l.play(), 30);
    return () => clearTimeout(t);
  }, [idx]);

  // Flèches clavier ← →
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") setIdx((i) => (i + 1) % ANGLES.length);
      if (e.key === "ArrowLeft") setIdx((i) => (i - 1 + ANGLES.length) % ANGLES.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Swipe mobile
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let startX = null;
    const onStart = (e) => { startX = e.touches ? e.touches[0].clientX : e.clientX; };
    const onMove  = (e) => {
      if (startX == null) return;
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      const dx = x - startX;
      if (Math.abs(dx) > 60) {
        setIdx((i) => (i + (dx < 0 ? 1 : -1) + ANGLES.length) % ANGLES.length);
        startX = null;
      }
    };
    const onEnd = () => { startX = null; };
    el.addEventListener("mousedown", onStart);
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseup", onEnd);
    el.addEventListener("mouseleave", onEnd);
    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove", onMove, { passive: true });
    el.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      el.removeEventListener("mousedown", onStart);
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseup", onEnd);
      el.removeEventListener("mouseleave", onEnd);
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", onEnd);
    };
  }, []);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold">Squat — Démo 2D (IA illustrée)</h2>
        <div className="hidden sm:flex gap-2">
          {ANGLES.map((a, i) => (
            <button
              key={a.key}
              onClick={() => setIdx(i)}
              className={`px-3 py-1 rounded-full text-sm ${
                i === idx ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700"
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>

      <div ref={containerRef} className="rounded-2xl overflow-hidden shadow bg-white">
        <Lottie
          lottieRef={lottieRef}
          animationData={ANGLES[idx].data}
          loop={false}           // un squat pédagogique puis stop
          autoplay={true}
          style={{ width: "100%", maxWidth: 720, margin: "0 auto" }}
        />
      </div>

      <div className="sm:hidden flex justify-center gap-2 mt-3">
        {ANGLES.map((a, i) => (
          <button
            key={a.key}
            onClick={() => setIdx(i)}
            className={`px-3 py-1 rounded-full text-sm ${
              i === idx ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700"
            }`}
          >
            {a.label}
          </button>
        ))}
      </div>

      <p className="opacity-70 text-sm mt-2">
        Astuce : balaie horizontalement (gauche/droite) ou utilise les flèches du clavier pour changer d’angle.
      </p>
    </div>
  );
}
