// app/exercise/[slug]/page.js
import dynamic from "next/dynamic";
import { EXERCISES } from "@/lib/exercises";

export const dynamicParams = false;
export async function generateStaticParams() {
  return EXERCISES.map((e) => ({ slug: String(e.slug ?? e.id) }));
}

// Lottie client-only
const SquatAngles = dynamic(() => import("@/components/SquatAngles"), {
  ssr: false,
});

export default function ExercisePage({ params }) {
  const slug = String(params.slug);

  // On cherche par slug OU par id
  const ex =
    EXERCISES.find((e) => String(e.slug) === slug) ??
    EXERCISES.find((e) => String(e.id) === slug);

  if (!ex) {
    return <div className="card">Exercice introuvable.</div>;
  }

  // URLs Lottie garanties pour le squat (même si ex.lottie est absent)
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
          <>
            <SquatAngles urls={lottieUrls} />

            {/* --- Panneau debug côté page --- */}
            <details className="mt-4">
              <summary className="cursor-pointer select-none">Debug (page)</summary>
              <div className="mt-2 text-sm space-y-1">
                <div><b>slug :</b> {slug}</div>
                <div><b>aLottie :</b> {String(!!ex.lottie)}  <b>isSquat :</b> {String(isSquat)}</div>
                <div><b>front :</b> {lottieUrls.front}</div>
                <div><b>side :</b> {lottieUrls.side}</div>
                <div><b>back :</b> {lottieUrls.back}</div>
                <div className="opacity-70">
                  Les trois URLs ci-dessus doivent répondre <b>200</b> (Network).
                  Les fichiers doivent être dans <code>public/lottie/</code>.
                </div>
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
  );
}
