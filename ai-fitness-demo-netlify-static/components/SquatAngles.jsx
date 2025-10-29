"use client";
import { useEffect, useRef, useState } from "react";
import Lottie from "lottie-react";

export default function SquatAngles({ urls = {front:"/lottie/squat-front.json", side:"/lottie/squat-side.json", back:"/lottie/squat-back.json"} }) {
  const [idx, setIdx] = useState(0);
  const [data, setData] = useState([null, null, null]);
  const lottieRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    Promise.all([
      fetch(urls.front).then(r=>r.json()),
      fetch(urls.side).then(r=>r.json()),
      fetch(urls.back).then(r=>r.json()),
    ]).then(setData);
  }, [urls.front, urls.side, urls.back]);

  useEffect(() => {
    const l = lottieRef.current;
    if (!l) return;
    l.stop();
    const t = setTimeout(() => l.play(), 30);
    return () => clearTimeout(t);
  }, [idx]);

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
        setIdx((i) => (i + (dx < 0 ? 1 : -1) + 3) % 3);
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
    el.addEventListener("touchend", onEnd);
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

  const current = data[idx];
  if (!current) return <div className="card">Chargement…</div>;

  const labels = ["Face", "Profil", "Dos"];

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex gap-2">
          {labels.map((label, i) => (
            <button
              key={label}
              onClick={() => setIdx(i)}
              className={`px-3 py-1 rounded-full text-sm ${
                i === idx ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div ref={containerRef} className="rounded-2xl overflow-hidden shadow bg-white">
        <Lottie
          lottieRef={lottieRef}
          animationData={current}
          loop={false}
          autoplay={true}
          style={{ width: "100%", maxWidth: 720, margin: "0 auto" }}
        />
      </div>
    </div>
  );
}

