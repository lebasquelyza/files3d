"use client";
import { useEffect, useMemo, useRef, useState } from "react";

export default function SquatAngles({
  urls = {
    front: "/lottie/squat-front.json",
    side:  "/lottie/squat-side.json",
    back:  "/lottie/squat-back.json",
  },
}) {
  const labels = useMemo(() => ["Face", "Profil", "Dos"], []);
  const [idx, setIdx] = useState(0); // 0: face, 1: profil, 2: dos
  const playerRef = useRef(null);

  // Charge le web component <lottie-player> si besoin
  useEffect(() => {
    if (typeof window === "undefined") return;

    function ensureLottiePlayer() {
      return new Promise((resolve, reject) => {
        if (window.customElements && window.customElements.get("lottie-player")) {
          resolve();
          return;
        }
        const s = document.createElement("script");
        s.src = "https://unpkg.com/@lottiefiles/lottie-player@2.0.2/dist/lottie-player.js";
        s.async = true;
        s.onload = () => resolve();
        s.onerror = () => reject(new Error("Impossible de charger lottie-player"));
        document.body.appendChild(s);
      });
    }

    ensureLottiePlayer().catch((e) => {
      console.error(e);
      alert("Erreur: lecteur Lottie non chargé.");
    });
  }, []);

  // Quand on change d’angle → recharge la source et rejoue
  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    const src = [urls.front, urls.side, urls.back][idx];
    player.load(src);        // charge le nouveau JSON
    player.loop = false;     // un squat puis stop
    player.autoplay = true;  // lecture auto
    // petite sécurité: relance quand le fichier est prêt
    const onReady = () => player.play();
    player.addEventListener("ready", onReady, { once: true });
    return () => player.removeEventListener("ready", onReady);
  }, [idx, urls.front, urls.side, urls.back]);

  const replay = () => {
    const player = playerRef.current;
    if (!player) return;
    player.seek(0);
    player.play();
  };

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
        <button className="btn" onClick={replay}>Rejouer</button>
      </div>

      {/* Le lecteur Lottie officiel (web component) */}
      <div className="rounded-2xl overflow-hidden shadow bg-white">
        {/* @ts-ignore - web component */}
        <lottie-player
          ref={playerRef}
          style={{ width: "100%", maxWidth: 720, margin: "0 auto" }}
          background="transparent"
          speed="1"
          mode="normal"
          autoplay
        />
      </div>
    </div>
  );
}
