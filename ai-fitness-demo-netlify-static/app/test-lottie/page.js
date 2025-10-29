"use client";

import { useEffect, useRef, useState } from "react";

export default function TestLottie() {
  const boxRef = useRef(null);
  const [status, setStatus] = useState({
    lottie: "…",
    front: "…",
    error: "",
  });

  useEffect(() => {
    let destroyed = false;

    async function run() {
      // petit HEAD pour confirmer l’accès au JSON
      try {
        const r = await fetch("/lottie/squat-front.json", { method: "HEAD" });
        setStatus((s) => ({ ...s, front: r.ok ? "200" : String(r.status) }));
      } catch {
        setStatus((s) => ({ ...s, front: "ERR" }));
      }

      try {
        const mod = await import("lottie-web"); // <-- bundlé par Next, pas de CDN
        const lottie = mod.default ?? mod;
        if (destroyed) return;
        setStatus((s) => ({ ...s, lottie: "OK" }));

        const el = boxRef.current;
        if (!el) return;

        // nettoie tout contenu précédent
        el.replaceChildren();

        const anim = lottie.loadAnimation({
          container: el,
          renderer: "svg",
          loop: true,
          autoplay: true,
          path: "/lottie/squat-front.json",
        });

        // au démontage
        return () => {
          try { anim?.destroy(); } catch {}
        };
      } catch (e) {
        if (!destroyed) {
          setStatus((s) => ({ ...s, lottie: "KO", error: String(e?.message || e) }));
        }
      }
    }

    const cleanup = run();
    return () => {
      destroyed = true;
      if (typeof cleanup === "function") cleanup();
    };
  }, []);

  return (
    <div className="container py-8">
      <div className="card space-y-4">
        <h1 className="text-2xl font-bold">Test Lottie (local, sans CDN)</h1>

        <div
          className="rounded-2xl overflow-hidden shadow bg-white dark:bg-gray-800/60"
          style={{ width: "100%", maxWidth: 720, margin: "0 auto" }}
        >
          {/* hauteur garantie */}
          <div ref={boxRef} style={{ width: "100%", height: 420 }} />
        </div>

        <details>
          <summary className="cursor-pointer">Diagnostic</summary>
          <div className="mt-2 text-sm grid grid-cols-2 gap-2">
            <div><b>lottie-web import :</b> {status.lottie}</div>
            <div><b>/lottie/squat-front.json :</b> {status.front}</div>
            {status.error && (
              <div className="col-span-2 text-red-600">
                <b>Erreur :</b> {status.error}
              </div>
            )}
          </div>
        </details>
      </div>
    </div>
  );
}
