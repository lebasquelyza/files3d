// app/exercise/[slug]/page.js
import Script from "next/script";
import { EXERCISES } from "@/lib/exercises";

export const dynamicParams = false;
export async function generateStaticParams() {
  return EXERCISES.map((e) => ({ slug: String(e.slug ?? e.id) }));
}

export default function ExercisePage({ params }) {
  const slug = String(params.slug);
  const ex =
    EXERCISES.find((e) => String(e.slug) === slug) ??
    EXERCISES.find((e) => String(e.id) === slug);

  if (!ex) return <div className="card">Exercice introuvable.</div>;

  // URLs Lottie par défaut pour le squat si ex.lottie absent
  const isSquat = slug === "squat" || /squat/i.test(String(ex.name ?? ""));
  const urls =
    ex?.lottie ??
    (isSquat
      ? {
          front: "/lottie/squat-front.json",
          side:  "/lottie/squat-side.json",
          back:  "/lottie/squat-back.json",
        }
      : null);

  return (
    <>
      {/* 1) Charger lottie-web côté client (fiable en App Router) */}
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js"
        strategy="afterInteractive"
      />

      {/* 2) Script de contrôle du player (s’exécute après chargement) */}
      {urls ? (
        <Script id="lottie-controls" strategy="afterInteractive">{`
          (function(){
            var map = { front: '${urls.front}', side: '${urls.side}', back: '${urls.back}' };
            function ready(fn){ if (document.readyState !== 'loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }
            function init(){
              var container = document.getElementById('anim');
              if (!container || !window.lottie) return;
              var btns = document.querySelectorAll('[data-view]');
              var replay = document.getElementById('replay');
              var anim = null;

              function load(view){
                try { anim && anim.destroy && anim.destroy(); } catch(e){}
                anim = window.lottie.loadAnimation({
                  container: container,
                  renderer: 'svg',
                  loop: false,
                  autoplay: true,
                  path: map[view]
                });
              }
              function setActive(target){
                btns.forEach(function(b){
                  var on = (b === target);
                  b.classList.toggle('bg-blue-600', on);
                  b.classList.toggle('text-white', on);
                  b.classList.toggle('bg-gray-200', !on);
                  b.classList.toggle('dark:bg-gray-700', !on);
                });
              }

              btns.forEach(function(btn){
                btn.addEventListener('click', function(e){
                  e.preventDefault();
                  var v = btn.getAttribute('data-view');
                  if (!map[v]) return;
                  load(v);
                  setActive(btn);
                });
              });

              replay && replay.addEventListener('click', function(){
                try { anim.goToAndPlay(0, true); } catch(e){}
              });

              load('front'); // démarrage
            }

            ready(function(){
              if (window.lottie) { init(); }
              else {
                var tries = 0;
                var iv = setInterval(function(){
                  if (window.lottie || ++tries > 40) { // ~4s max
                    clearInterval(iv);
                    window.lottie && init();
                  }
                }, 100);
              }
            });
          })();
        `}</Script>
      ) : null}

      <div className="space-y-6">
        <div className="card">
          <h1 className="text-2xl font-bold mb-3">{ex.name} — Démonstration</h1>

          {urls ? (
            <>
              {/* Boutons */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex gap-2 flex-wrap">
                  <button className="px-3 py-1 rounded-full text-sm bg-blue-600 text-white" data-view="front">Face</button>
                  <button className="px-3 py-1 rounded-full text-sm bg-gray-200 dark:bg-gray-700" data-view="side">Profil</button>
                  <button className="px-3 py-1 rounded-full text-sm bg-gray-200 dark:bg-gray-700" data-view="back">Dos</button>
                </div>
                <button id="replay" className="btn">Rejouer</button>
              </div>

              {/* Conteneur d’animation (hauteur garantie) */}
              <div
                className="rounded-2xl overflow-hidden shadow bg-white dark:bg-gray-800/60"
                style={{ width: "100%", maxWidth: 720, margin: "0 auto" }}
              >
                <div id="anim" style={{ width: "100%", height: "420px" }} />
              </div>
            </>
          ) : ex.video ? (
            <video
              className="w-full rounded-xl"
              src={ex.video}
              poster={ex.thumbnail}
              controls
              loop
              playsInline
            />
          ) : (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/30">
              Aucune démo disponible pour cet exercice.
            </div>
          )}
        </div>

        {(ex.cues?.length || ex.mistakes?.length) ? (
          <div className="card">
            <h3 className="font-semibold mb-2">Conseils</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {ex.cues?.length ? (
                <div>
                  <div className="font-medium">À faire</div>
                  <ul className="list-disc pl-5 opacity-90">
                    {ex.cues.map((c, i) => <li key={i}>{c}</li>)}
                  </ul>
                </div>
              ) : null}
              {ex.mistakes?.length ? (
                <div>
                  <div className="font-medium">À éviter</div>
                  <ul className="list-disc pl-5 opacity-90">
                    {ex.mistakes.map((m, i) => <li key={i}>{m}</li>)}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}

