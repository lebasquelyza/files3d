// app/exercise/[slug]/page.js
import dynamic from "next/dynamic";
import { EXERCISES } from "@/lib/exercises";

// On fige les routes dynamiques à la build (SSG)
export const dynamicParams = false;
export async function generateStaticParams() {
  return EXERCISES.map((e) => ({ slug: String(e.id) })); // <-- forcer string
}

// Le lecteur Lottie est client-only -> import dynamique sans SSR
const SquatAngles = dynamic(() => import("@/components/SquatAngles"), {
  ssr: false,
  // optionally: loading: () => <div className="card">Chargement…</div>,
});

export default function ExercisePage({ params }) {
  const slug = String(params.slug); // <-- forcer string
  const ex = EXERCISES.find((e) => String(e.id) === slug);

  if (!ex) {
    return <div className="card">Exercice introuvable.</div>;
  }

  // Cas Squat avec Lottie (Face / Profil / Dos)
  if (ex.lottie) {
    const front = ex?.lottie?.front ?? null;
    const side  = ex?.lottie?.side  ?? null;
    const back  = ex?.lottie?.back  ?? null;

    // Garde-fou: si une URL manque, on affiche un message au lieu de crasher
    const missing = [!front && "front", !side && "side", !back && "back"].filter(Boolean);

    return (
      <div className="space-y-6">
        <div className="card">
          <h1 className="text-2xl font-bold mb-3">{ex.name} — Démonstration</h1>

          {missing.length > 0 ? (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/30">
              Fichier Lottie manquant: {missing.join(", ")}.
              Vérifie les chemins dans <code>ex.lottie</code>.
            </div>
          ) : (
            <SquatAngles
              urls={{ front, side, back }}
            />
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

  // Fallback vidéo
  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="text-2xl font-bold mb-3">{ex.name} — Démonstration</h1>
        <video
          className="w-full rounded-xl"
          src={ex.video}
          poster={ex.thumbnail}
          controls
          loop
          playsInline
        />
      </div>
    </div>
  );
}
