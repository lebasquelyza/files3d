// app/exercise/[slug]/page.js
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

  // URLs Lottie garanties pour le squat (adapter si besoin)
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
    <div className="space-y-6">
      {/* Charge le web component Lottie (aucune hydratation React nécessaire) */}
      <script
        defer
        src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js"
      />

      <div className="card">
        <h1 className="text-2xl font-bold mb-3">{ex.name} — Démonstration</h1>

        {urls ? (
          <>
            {/* Boutons statiques */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex gap-2 flex-wrap">
                <button className="px-3 py-1 rounded-full text-sm bg-blue-600 text-white" data-view="front">Face</button>
                <button className="px-3 py-1 rounded-full text-sm bg-gray-200 dark:bg-gray-700" data-view="side">Profil</button>
                <button className="px-3 py-1 rounded-full text-sm bg-gray-200 dark:bg-gray-700" data-view="back">Dos</button>
              </div>
              <button id="replay" className="btn">Rejouer</button>
            </div>

            {/* Cadre visible en statique */}
            <div
              className="rounded-2xl overflow-hidden shadow bg-white dark:bg-gray-800/60"
              style={{ width: "100%", maxWidth: 720, margin: "0 auto" }}
            >
              <lottie-player
                id="player"
                src={urls.front}
                style={{ width: "100%", height: "420px" }}
                autoplay
                controls
                renderer="svg"
              />
            </div>

            {/* Mini-script inline pour changer de vue et rejouer (pas de React) */}
            <script
              dangerouslySetInnerHTML={{
                __html: `
(function(){
  const player = document.getElementById('player');
  const map = { front: '${urls.front}', side: '${urls.side}', back: '${urls.back}' };
  const btns = document.querySelectorAll('[data-view]');
  const replay = document.getElementById('replay');

  function setActive(target){
    btns.forEach(b => b.classList.toggle('bg-blue-600', b===target));
    btns.forEach(b => b.classList.toggle('text-white', b===target));
    btns.forEach(b => b.classList.toggle('bg-gray-200', b!==target));
    btns.forEach(b => b.classList.toggle('dark:bg-gray-700', b!==target));
  }

  btns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const v = btn.getAttribute('data-view');
      const next = map[v];
      if (!next) return;
      // recharge et lance
      try { player.load(next); player.play(); } catch(e) {}
      setActive(btn);
    });
  });

  replay?.addEventListener('click', () => {
    try { player.seek(0); player.play(); } catch(e) {}
  });
})();`,
              }}
            />
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
  );
}

