"use client";
import { useEffect, useMemo, useRef, useState } from "react";

// Charge lottie-web côté client seulement
let lottieLib = null;
async function getLottie() {
  if (lottieLib) return lottieLib;
  const mod = await import("lottie-web");
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
  const wrapRef = useRef(null);
  const animRef = useRef(null);
  const cacheRef = useRef({ front: null, side: null, back: null });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Précharge les JSON
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [f, s, b] = await Promise.all([
          fetch(urls.front).then(r => { if(!r.ok) throw new Error("front " + r.status); return r.json(); }),
          fetch(urls.side ).then(r => { if(!r.ok) throw new Error("side "  + r.status); return r.json(); }),
          fetch(urls.back ).then(r => { if(!r.ok) throw new Error("back "  + r.status); return r.json(); }),
        ]);

        if (!alive) return;

        // petite validation Lottie (très légère)
        const looksLikeLottie = (d) => d && typeof d === "object" && ("v" in d) && ("layers" in d);
        if (!looksLikeLottie(f) || !looksLikeLottie(s) || !looksLikeLottie(b)) {
          throw new Error("payload Lottie invalide (champs manquants)");
        }

        cacheRef.current = { front: f, side: s, back: b };
        setErr("");
        setLoading(false);
      } catch (e) {
        if (!alive) return;
        setErr("Impossible de charger /lottie/*.json : " + (e?.message ?? e));
        setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [urls.front, urls.side, urls.back]);

  // (Re)crée l’animation quand l’angle change
  useEffect(() => {
    if (loading || err) return;
    const container = wrapRef.current;
    if (!container) return;

    // Nettoie l’anim précédente + le DOM
    try { animRef.current?.destroy(); } catch {}
    animRef.current = null;
    container.replaceChildren(); // plus propre que innerHTML=""

    let cancelled = false;
    let removeListener = () => {};

    (async () => {
      try {
        const lottie = await getLottie();
        if (cancelled) return;

        const key = ["front","side","back"][idx];
        const data = cacheRef.current[key];
        if (!data) throw new Error("Données Lottie absentes pour " + key);

        const anim = lottie.loadAnimation({
          container,
          renderer: "svg",
          loop: false,
          autoplay: true,
          animationData: data,
          rendererSettings: { preserveAspectRatio: "xMidYMid meet" },
        });
        animRef.current = anim;

        const onReady = () => anim.goToAndPlay(0, true);
        anim.addEventListener("DOMLoaded", onReady);
        removeListener = () => anim.removeEventListener("DOMLoaded", onReady);
      } catch (e) {
        if (!cancelled) {
          setErr("Erreur Lottie: " + (e?.message ?? e));
        }
      }
    })();

    return () => {
      cancelled = true;
      try { removeListener(); } catch {}
      try { animRef.current?.destroy(); } catch {}
      animRef.current = null;
    };
  }, [idx, loading, err]);

  const replay = () => {
    try {
      animRef.current?.goToAndPlay(0, true);
    } catch (e) {
      setErr("Impossible de rejouer l’animation: " + (e?.message ?? e));
    }
  };

  if (loading) return <div className="card">Chargement… (vérifie /lottie/*.json)</div>;
  if (err) return <div className="card text-red-600">{err}</div>;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex gap-2">
          {labels.map((lab, i) => (
            <button
              key={lab}
              type="button"
              onClick={() => setIdx(i)}
              className={`px-3 py-1 rounded-full text-sm ${
                i === idx ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700"
              }`}
            >
              {lab}
            </button>
          ))}
        </div>
        <button type="button" className="btn" onClick={replay}>Rejouer</button>
      </div>

      <div className="rounded-2xl overflow-hidden shadow bg-white dark:bg-gray-800/60" style={{ width: "100%", maxWidth: 720, margin: "0 auto" }}>
        <div ref={wrapRef} aria-label={`Squat — vue ${labels[idx]}`} />
      </div>
    </div>
  );
}

