"use client";
import { useEffect, useMemo, useRef, useState } from "react";

// Lecteur Lottie sans SSR, chargé côté client
let lottieLib = null;
async function getLottie() {
  if (lottieLib) return lottieLib;
  const mod = await import("lottie-web"); // no SSR
  lottieLib = mod.default ?? mod;
  return lottieLib;
}

export default function SquatAngles({
  urls = {
    front: "/lottie/squat-front.json",
    side:  "/lottie/squat-side.json",
    back:  "/lottie/squat-back.json",
  },
}) {
  const labels = useMemo(() => ["Face", "Profil", "Dos"], []);
  const [idx, setIdx] = useState(0); // 0 face, 1 profil, 2 dos
  const [err, setErr] = useState("");
  const wrapRef = useRef(null);
  const animRef = useRef(null);
  const dataCache = useRef({ front: null, side: null, back: null });

  // Précharge les 3 JSON une seule fois
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [f, s, b] = await Promise.all([
          fetch(urls.front).then(r => { if(!r.ok) throw new Error("front "+r.status); return r.json(); }),
          fetch(urls.side ).then(r => { if(!r.ok) throw new Error("side "+r.status ); return r.json(); }),
          fetch(urls.back ).then(r => { if(!r.ok) throw new Error("back "+r.status ); return r.json(); }),
        ]);
        if (!alive) return;
        dataCache.current.front = f;
        dataCache.current.side  = s;
        dataCache.current.back  = b;
        setErr("");
      } catch (e) {
        if (!alive) return;
        setErr("Impossible de charger les animations. Vérifie /public/lottie/*.json ("+e.message+").");
      }
    })();
    return () => { alive = false; };
  }, [urls.front, urls.side, urls.back]);

  // (Ré)initialise l’animation dans le conteneur lorsque idx change
  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!wrapRef.current) return;
      // vide le conteneur avant de remonter l’anim
      wrapRef.current.innerHTML = "";

      const lottie = await getLottie();

      // choisit le JSON courant
      const key = ["front","side","back"][idx];
      const data = dataCache.current[key];
      if (!data) return; // pas encore chargé → l’autre useEffect remplira

      // crée l’anim
      const anim = lottie.loadAnimation({
        container: wrapRef.current,
        renderer: "svg",
        loop: false,
        autoplay: true,
        animationData: data,
        rendererSettings: {
          preserveAspectRatio: "xMidYMid meet",
          progressiveLoad: true
        }
      });
      animRef.current = anim;

      // sécurité: rejoue au début quand c’est prêt
      const onDOMLoaded = () => { if (!cancelled) anim.goToAndPlay(0, true); };
      anim.addEventListener("DOMLoaded", onDOMLoaded);

      // cleanup
      return () => {
        anim.removeEventListener("DOMLoaded", onDOMLoaded);
        anim.destroy();
      };
    })();

    return () => { cancelled = true; };
  }, [idx]);

  const replay = () => {
    const anim = animRef.current;
    if (!anim) return;
    anim.goToAndPlay(0, true);
  };

  const select = (i) => {
    setIdx(i);
    // anim sera recréée et rejouée automatiquement par l’effet ci-dessus
  };

  const label = labels[idx];

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex gap-2">
          {labels.map((lab, i) => (
            <button
              key={lab}
              onClick={() => select(i)}
              className={`px-3 py-1 rounded-full text-sm ${
                i === idx ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700"
              }`}
            >
              {lab}
            </button>
          ))}
        </div>
        <button className="btn" onClick={replay}>Rejouer</button>
      </div>

      {err ? (
        <div className="p-4 rounded-lg bg-red-100 text-red-700">{err}</div>
      ) : (
        <div
          className="rounded-2xl overflow-hidden shadow bg-white"
          style={{ width: "100%", maxWidth: 720, margin: "0 auto" }}
        >
          <div ref={wrapRef} aria-label={`Squat — vue ${label}`} />
        </div>
      )}
    </div>
  );
}
