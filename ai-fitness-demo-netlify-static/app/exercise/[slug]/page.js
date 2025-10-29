// app/exercise/[slug]/page.js
import dynamic from "next/dynamic";
import { EXERCISES } from "@/lib/exercises";

// On fige les routes dynamiques à la build (SSG)
export const dynamicParams = false;
export async function generateStaticParams() {
  return EXERCISES.map((e) => ({ slug: e.id }));
}

// Le lecteur Lottie est client-only -> import dynamique sans SSR
const SquatAngles = dynamic(() => import("@/components/SquatAngles"), {
  ssr: false,
});

export default function ExercisePage({ params }) {
  const ex = EXERCISES.find((e) => e.id === params.slug);
  if (!ex) {
    return <div className="card">Exercice introuvable.</div>;
  }

  // Cas Squat avec Lottie (Face / Profil / Dos)
  if (ex.lottie) {
    return (
      <div className="space-y-6">
        <div className="card">
          <h1 className="text-2xl font-bold mb-3">{ex.name} — Démonstration</h1>
          <SquatAngles
            urls={{
              front: ex.lottie.front, // "/lottie/squat-front.json"
              side: ex.lottie.side,   // "/lottie/squat-side.json"
              back: ex.lottie.back,   // "/lottie/squat-back.json"
            }}
          />
        </div>

        {/* Bloc conseils (facultatif) */}
        {(ex.cues?.length || ex.mistakes?.length) ? (
          <div className="card">
            <h3 className="font-semibold mb-2">Conseils</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {ex.cues?.length ? (
                <div>
                  <div className="font-medium">À faire</div>
                  <ul className="list-disc pl-5 opacity-90">
                    {ex.cues.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {ex.mistakes?.length ? (
                <div>
                  <div className="font-medium">À éviter</div>
                  <ul className="list-disc pl-5 opacity-90">
                    {ex.mistakes.map((m, i) => (
                      <li key={i}>{m}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  // Fallback vidéo (au cas où d'autres exos en MP4 arriveraient plus tard)
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
