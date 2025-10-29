"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Chargement lazy de lottie-web (client only)
 */
let lottieLib = null;
async function getLottie() {
  if (lottieLib) return lottieLib;
  const mod = await import("lottie-web");
  lottieLib = mod.default ?? mod;
  return lottieLib;
}

/**
 * Composant d’affichage des trois vues Lottie (Face / Profil / Dos)
 */
export default function SquatAngles({
  urls = {
    front: "/lottie/squat-front.json",
    side: "/lottie/squat-side.json",
    back: "/lottie/squat-back.json",
  },
}) {
  const labels = useMemo(() => ["Face", "Profil", "Dos"], []);
  const [idx, setIdx] = useState(0); // 0: face, 1: profil, 2: dos
  const wrapRef = useRef(null);
  const animRef = useRef(null);
  const cacheRef = useRef({ front: null, side: null, back: null });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  /**
   * Préchargement des 3 JSON Lottie avec validation minimale
   */
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
          fetchJson("side", urls.side),
          fetchJson("back", urls.back),
        ]);

        if (!alive) return;
        cacheRef.current = { front: f, side: s, back: b };
        setLoading(false);
      } catch (e) {
        if (!alive) return;
        setErr(
          "Impossible de charger /lottie/*.json : " + (e?.message ?? String(e))
        );
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [urls.front, urls.side, urls.back]);

  /**
   * (Re)création de l’animation à chaque changement de vue
   * + nettoyage strict pour éviter fuites/erreurs
   */
  useEffect(() => {
    if (loading || err) return;

    const container = wrapRef.current;
    if (!container) return;

    // Nettoyage total de l’anim précédente et du DOM
    try {
      animRef.current?.destroy();
    } catch {}
    animRef.current = null;
    try {
      // Plus sûr que innerHTML = ""
      if (container.replaceChildren) container.replaceChildren();
      else container.innerHTML = "";
    } catch {}

    let cancelled = false;
    let removeReadyListener = () => {};

    (async () => {
      try {
        const lottie = await getLottie();
        if (cancelled) return;

        const key = ["front", "side", "back"][idx];
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
          try {
            anim.goToAndPlay(0, true);
          } catch (e) {
            // Si le goToAndPlay échoue, on signale l’erreur sans crasher
            setErr("Erreur Lottie (lecture) : " + (e?.message ?? String(e)));
          }
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
      try {
        removeReadyListener();
      } catch {}
      try {
        animRef.current?.destroy();
      } catch {}
      animRef.current = null;
    };
  }, [idx, loading, err]);

  /**
   * Replay (remet la tête de lecture à 0)
   */
  const replay = () => {
    try {
      animRef.current?.goToAndPlay(0, true);
    } catch (e) {
      setErr("Impossible de rejouer l’animation : " + (e?.message ?? String(e)));
    }
  };

  /**
   * Rendus d’états
   */
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

  /**
   * Rendu principal
   * - Le conteneur clippe strictement le SVG (overflow:hidden)
   * - aspectRatio évite que le SVG "prenne tout l’écran" s’il a des tailles bizarres
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
                i === idx
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700"
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
          aspectRatio: "16 / 9", // fixe un cadre pour empêcher tout débordement plein écran
        }}
      >
        <div
          ref={wrapRef}
          aria-label={`Squat — vue ${labels[idx]}`}
          style={{
            width: "100%",
            height: "100%",
            position: "relative",
            background: "transparent",
          }}
        />
      </div>
    </div>
  );
}

