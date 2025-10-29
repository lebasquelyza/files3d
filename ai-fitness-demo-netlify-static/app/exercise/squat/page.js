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
      {/* 1) Librairie lottie-web */}
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js"
        strategy="afterInteractive"
      />

      {/* 2) Contrôleur + diagnostic (aucune dépendance React côté client) */}
      {urls ? (
        <Script id="lottie-controls" strategy="afterInteractive">{`
          (function(){
            var map = { front: '${urls.front}', side: '${urls.side}', back: '${urls.back}' };

            function set(id, txt){ var el = document.getElementById(id); if(el) el.textContent = txt; }
            function ok(id){ var el = document.getElementById(id); if(el){ el.textContent = 'OK'; el.style.color = '#16a34a'; } }
            function ko(id,msg){ var el = document.getElementById(id); if(el){ el.textContent = msg || 'KO'; el.style.color = '#dc2626'; } }

            async function head(url){
              try {
                var r = await fetch(url, { method: 'HEAD' });
                return r.ok ? '200' : String(r.status || 'ERR');
              } catch(e) { return 'ERR'; }
            }

            function ready(fn){ if (document.readyState !== 'loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }

            ready(async function(){
              // 1) script lottie chargé ?
              if (window.lottie) ok('dbg-lottie'); else ko('dbg-lottie','non chargé');

              // 2) JSON accessibles ?
              set('dbg-front', await head(map.front));
              set('dbg-side',  await head(map.side));
              set('dbg-back',  await head(map.back));

              // 3) init player
              var container = document.getElementById('anim');
              if(!container){ ko('dbg-init','container introuvable'); return; }
              if(!window.lottie){ ko('dbg-init','lottie indisponible'); return; }

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

              // boutons
              var btns = document.querySelectorAll('[data-view]');
              var replay = document.getElementById('replay');
              function setActive(target){
                btns.forEach(function(b){
                  var on = (b===target);
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
                  if(!map[v]) return;
                  load(v);
                  setActive(btn);
                });
              });
              replay && replay.addEventListener('click', function(){
                try { anim.goToAndPlay(0, true); } catch(e){}
              });

              try {
                load('front');
                ok('dbg-init');
              } catch(e) {
                ko('dbg-init', 'erreur init');
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

              {/* Player */}
              <div
                className="rounded-2xl overflow-hidden shadow bg-white dark:bg-gray-800/60"
                style={{ width: "100%", maxWidth: 720, margin: "0 auto" }}
              >
                <div id="anim" style={{ width: "100%", height: "420px" }} />
              </div>

              {/* Panneau diagnostic (s'affiche toujours) */}
              <details className="mt-4">
                <summary className="cursor-pointer select-none">Diagnostic</summary>
                <div className="mt-2 text-sm grid grid-cols-2 gap-2">
                  <div><b>Script lottie :</b> <span id="dbg-lottie">…</span></div>
                  <div><b>Init player :</b> <span id="dbg-init">…</span></div>
                  <div><b>front.json :</b> <span id="dbg-front">…</span></div>
                  <div><b>side.json :</b> <span id="dbg-side">…</span></div>
                  <div><b>back.json :</b> <span id="dbg-back">…</span></div>
                  <div className="opacity-70 col-span-2">Chaque JSON doit répondre <b>200</b>. S'ils sont 200 et que "Init player" est OK, la démo doit être visible.</div>
                </div>
              </details>
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

