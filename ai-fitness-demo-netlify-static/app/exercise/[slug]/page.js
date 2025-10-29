// app/exercise/[slug]/page.js
import dynamic from "next/dynamic";
import { EXERCISES } from "@/lib/exercises";

// On veut un rendu statique de toutes les pages existantes
export const dynamicParams = false;
export async function generateStaticParams() {
  // on génère à partir de slug si présent, sinon id stringifié
  return EXERCISES.map((e) => ({
    slug: String(e.slug ?? e.id),
  }));
}

// Le lecteur Lottie est client-only
const SquatAngles = dynamic(() => import("@/components/SquatAngles"), {
  ssr: false,
});

export default function ExercisePage({ params }) {
  const slug = String(params.slug);

  // on accepte correspondance par slug OU par id
  const ex =
    EXERCISES.find((e) => String(e.slug) === slug) ??
    EXERCISES.find((e) => String(e.id) === slug);

  if (!ex) {
    return <div className="card">Exercice introuvable.</div>;
  }

  // ✅ URLs Lottie garanties pour "squat" même si ex.lottie est absent
  const isSquat = slug === "squat" || /squat/i.test(String(ex.name ?? ""));
  const lottieUrls =
    ex?.lottie ??
    (isSquat
      ? {
          front: "/lottie/squat-front.json",
          side: "/lottie/squat-side.json",
          back: "/lottie/squat-back.json",
        }
      : null);

  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="text-2xl font-bold mb-3">{ex.name} — Démonstration</h1>

        {lottieUrls ? (
          // ✅ On rend TOUJOURS le lecteur si on a des URLs (ex.lottie ou défaut)
          <SquatAngles urls={lottieUrls} />
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
