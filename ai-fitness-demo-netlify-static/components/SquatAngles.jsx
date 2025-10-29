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

  // Charge le web component <lottie-player>
  useEffect(() => {
    if (typeof window === "undefined") return;

    const ensure = () =>
      new Promise((resolve, reject) => {
        if (window.customElements?.get("lottie-player")) return resolve();
        const s = document.createElement("script");
        s.src =
          "https://unpkg.com/@lottiefiles/lottie-player@2.0.2/dist/lottie-player.js";
        s.async = true;
        s.onload = () => resolve();
        s.onerror = () => reject(new Error("Chargement lottie-player échoué"));
        document.body.appendChild(s);
      });

    ensure().catch((e) => console.error(e));
  }, []);

  // Applique la bonne source + lecture
  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    const src = [urls.front, urls.side, urls.back][idx];

    // méthode robuste: setAttribute + seek + play
    player.setAttribute("src", src);
    player.setAttribute("loop", "false");
    player.setAttribute("autoplay", "true");

    // si le fichier est long à charger, relance quand "ready"
    const onReady = () => {
      try {
        player.seek(0);
        player.play();
      } catch {}
    };
    player.addEventListener("ready", onReady, { once: true });

    // petite relance de secours après 300ms
    const t = setTimeout(() => {
      try {
        player.seek(0);
        player.play();
      } catch {}
    }, 300);

    return () => {
      player.removeEventListener("ready", onReady);
      clearTimeout(t);
    };
  }, [idx, urls.front, urls.side, urls.back]);

  const replay = () => {
    const player = playerRef.current;
    if (!player) return;
    try {
      player.seek(0);
      player.play();
    } catch {}
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

      {/* Lecteur Lottie officiel (web component) */}
      {/* @ts-ignore */}
      <lottie-player
        ref={playerRef}
        style={{ width: "100%", maxWidth: 720, margin: "0 auto" }}
        background="transparent"
        speed="1"
        mode="normal"
        autoplay
      />
    </div>
  );
}
