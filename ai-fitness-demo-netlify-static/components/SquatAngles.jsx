"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Lottie from "lottie-react";

export default function SquatAngles({
  urls = {
    front: "/lottie/squat-front.json",
    side:  "/lottie/squat-side.json",
    back:  "/lottie/squat-back.json",
  },
}) {
  const labels = useMemo(() => ["Face", "Profil", "Dos"], []);
  const [idx, setIdx] = useState(0);     // 0: face, 1: profil, 2: dos
  const [data, setData] = useState([null, null, null]);
  const [error, setError] = useState(null);
  const [nonce, setNonce] = useState(0); // pour forcer le remount (replay)
  const containerRef = useRef(null);

  // Précharge les JSON (public/) et gère les erreurs 404
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [front, side, back] = await Promise.all([
          fetch(urls.front).then(r => { if(!r.ok) throw new Error("front "+r.status); return r.json(); }),
          fetch(urls.side).then(r  => { if(!r.ok) throw new Error("side "+r.status);  return r.json(); }),
          fetch(urls.back).then(r  => { if(!r.ok) throw new Error("back "+r.status);  return r.json(); }),
        ]);
        if (mounted) { setData([front, side, back]); setError(null); }
      } catch (e) {
        if (mounted) setError("Impossible de charger les animations (vérifie les fichiers dans /public/lottie/). Détail: " + e.message);
      }
    })();
    return () => { mounted = false; };
  }, [urls.front, urls.side, urls.back]);

  // Swipe mobile pour changer d’angle
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
        setIdx(i => (i + (dx < 0 ? 1 : -1) + 3) % 3);
        setNonce(n => n + 1); // force replay
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

  // Affichages d’état
  if (error) return <div className="card text-red-600">{error}</div>;
  if (!current) return <div className="card">Chargement…</div>;

  // Handlers boutons
  const select = (i) => { setIdx(i); setNonce(n => n + 1); }; // rejoue même si on reclique le même angle

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex gap-2">
          {labels.map((label, i) => (
            <button
              key={label}
              onClick={() => select(i)}
              className={`px-3 py-1 rounded-full text-sm ${
                i === idx ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setNonce(n => n + 1)}
          className="btn"
          aria-label="Rejouer"
          title="Rejouer"
        >
          Rejouer
        </button>
      </div>

      <div ref={containerRef} className="rounded-2xl overflow-hidden shadow bg-white">
        {/* key force un remount => lottie autoplay relance l'anim */}
        <Lottie
          key={`${idx}-${nonce}`}
          animationData={current}
          loop={false}
          autoplay={true}
          style={{ width: "100%", maxWidth: 720, margin: "0 auto" }}
        />
      </div>
    </div>
  );
}

