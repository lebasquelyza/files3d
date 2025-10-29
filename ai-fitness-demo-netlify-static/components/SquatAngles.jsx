"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/** Lazy-load de lottie-web côté client */
let lottieLib = null;
async function getLottie() {
  if (lottieLib) return lottieLib;
  const mod = await import("lottie-web");
  lottieLib = mod.default ?? mod;
  return lottieLib;
}

/** Composant: démos Lottie Face / Profil / Dos + bouton Rejouer */
export default function SquatAngles({
  urls = {
    front: "/lottie/squat-front.json",
    side:  "/lottie/squat-side.json",
    back:  "/lottie/squat-back.json",
  },
}) {
  const labels = useMemo(() => ["Face", "Profil", "Dos"], []);
  const [idx, setIdx] = useState(0); // 0: face, 1: profil, 2: dos
  const wrapRef = useRef(null);
  const animRef = useRef(null);
  const cacheRef = useRef({ front: null, side: null, back: null });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  /** Préchargement des 3 JSON (avec validation minimale Lottie) */
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setErr("");

        const fetchJson = async (name, url) => {
          const r = await fetch(url);
          if (!r.ok) throw new Error(`${name} ${r.status}`);
          const j = await r.json();
          const looksLikeLottie = (d) =>
            d && typeof d === "object" && "v" in d && Array.isArray(d.layers);
          if (!looksLikeLottie(j)) {
            throw new Error(`${name} payload invalide (pas un Lottie)`);
          }
          return j;
        };

        const [f, s, b] = await Promise.all([
          fetchJson("front", urls.front),
          fetchJson("side",  urls.side),
          fetchJson("back",  urls.back),
        ]);

        if (!alive) return;
        cacheRef.current = { front: f, side: s, back: b };
        setLoading(false);
      } catch (e) {
        if (!alive) return;
        setErr("Impossible de charger /lottie/*.json : " + (e?.message ?? String(e)));
        setLoading(false);
      }
    })();

    return () => { alive = false; };
  }, [urls.front, urls.side, urls.back]);

  /** (Re)création de l’animation à chaque changement de vue */
  useEffect(() => {
    if (loading || err) return;

    const container = wrapRef.current;
    if (!container) return;

    // Nettoyage total de l’anim précédente et du DOM
    try { animRef.current?.destroy(); } catch {}
    animRef.current = null;
    try {
      if (container.replaceChildren) container.replaceChildren();
      else container.innerHTML = "";
    } catch {}

    let cancelled = false;
    let removeReadyListener = () => {};

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

        const onReady = () => {
          try { anim.goToAndPlay(0, true); }
          catch (e) { setErr("Erreur Lottie (lecture) : " + (e?.message ?? String(e))); }
        };

        anim.addEventListener("DOMLoaded", onReady);
        removeReadyListener = () => anim.removeEventListener("DOMLoaded", onReady);
      } catch (e) {
        if (!cancelled) {
          setErr("Erreur Lottie : " + (e?.message ?? String(e)));
        }
      }
    })();

    return () => {
      cancelled = true;
      try { removeReadyListener(); } catch {}
      try { animRef.current?.destroy(); } catch {}
      animRef.current = null;
    };
  }, [idx, loading, err]);

  /** Rejouer depuis 0 */
  const replay = () => {
    try { animRef.current?.goToAndPlay(0, true); }
    catch (e) { setErr("Impossible de rejouer l’animation : " + (e?.message ?? String(e))); }
  };

  /** États de chargement / erreur */
  if (loading) {
    return (
      <div className="card">
        Chargement… (vérifie la présence de <code>/lottie/*.json</code>)
      </div>
    );
  }
  if (err) {
    return <div className="card text-red-600">{err}</div>;
  }

  /** Rendu principal
   *  - Hauteur garantie via paddingTop (16:9) + enfant en absolute
   *  - overflow:hidden pour empêcher le SVG de déborder/recouvrir la page
   */
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex gap-2 flex-wrap">
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

        <button type="button" className="btn" onClick={replay}>
          Rejouer
        </button>
      </div>

      <div
        className="rounded-2xl overflow-hidden shadow bg-white dark:bg-gray-800/60"
        style={{
          width: "100%",
          maxWidth: 720,
          margin: "0 auto",
          position: "relative",
          overflow: "hidden",
          // ✅ Hauteur garantie (choisis UNE option) :
          // height: 420,            // A) hauteur fixe simple
          paddingTop: "56.25%",     // B) 16:9 responsive; commenter si tu utilises "height"
        }}
      >
        {/* Si paddingTop est utilisé, l'enfant remplit via absolute */}
        <div
          ref={wrapRef}
          aria-label={`Squat — vue ${labels[idx]}`}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            background: "transparent",
          }}
        />
      </div>
    </div>
  );
}

