// app/exercise/squat/page.js
export const dynamic = "force-static";

export default function SquatPage() {
  return (
    <>
      {/* Web component Lottie (aucune hydratation React requise) */}
      <script
        defer
        src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js"
      />

      <div className="space-y-6">
        <div className="card">
          <h1 className="text-2xl font-bold mb-3">Squat — Démonstration</h1>

          {/* Boutons Face / Profil / Dos + Rejouer (purs boutons DOM) */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex gap-2 flex-wrap">
              <button className="px-3 py-1 rounded-full text-sm bg-blue-600 text-white" data-view="front">Face</button>
              <button className="px-3 py-1 rounded-full text-sm bg-gray-200 dark:bg-gray-700" data-view="side">Profil</button>
              <button className="px-3 py-1 rounded-full text-sm bg-gray-200 dark:bg-gray-700" data-view="back">Dos</button>
            </div>
            <button id="replay" className="btn">Rejouer</button>
          </div>

          {/* Cadre visible en statique (hauteur garantie) */}
          <div
            className="rounded-2xl overflow-hidden shadow bg-white dark:bg-gray-800/60"
            style={{ width: "100%", maxWidth: 720, margin: "0 auto" }}
          >
            <lottie-player
              id="player"
              src="/lottie/squat-front.json"
              style={{ width: "100%", height: "420px" }}
              autoplay
              renderer="svg"
            />
          </div>

          {/* Petit script inline pour changer de vue / rejouer (pas de React) */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
(function(){
  const player = document.getElementById('player');
  if(!player) return;

  const map = {
    front: '/lottie/squat-front.json',
    side:  '/lottie/squat-side.json',
    back:  '/lottie/squat-back.json'
  };

  const btns = document.querySelectorAll('[data-view]');
  const replay = document.getElementById('replay');

  function setActive(target){
    btns.forEach(b => {
      const active = b === target;
      b.classList.toggle('bg-blue-600', active);
      b.classList.toggle('text-white', active);
      b.classList.toggle('bg-gray-200', !active);
      b.classList.toggle('dark:bg-gray-700', !active);
    });
  }

  btns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const v = btn.getAttribute('data-view');
      const next = map[v];
      if (!next) return;
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
        </div>
      </div>
    </>
  );
}
