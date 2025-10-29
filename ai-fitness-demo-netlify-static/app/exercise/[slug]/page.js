import dynamic from "next/dynamic";
import { EXERCISES } from "@/lib/exercises";

// On fige les routes dynamiques à la build
export const dynamicParams = false;
export async function generateStaticParams() {
  return EXERCISES.map(e => ({ slug: e.id }));
}

// ⚠️ Le composant Lottie est client-only → import dynamique sans SSR
const SquatAngles = dynamic(
  () => import("@/components/SquatAngles"),
  { ssr: false }
);

export default function ExercisePage({ params }) {
  const ex = EXERCISES.find(e => e.id === params.slug);
  if (!ex) return <div className="card">Exercice introuvable.</div>;

  // Cas Squat avec Lottie (face/profil/dos)
  if (ex.lottie) {
    return (
      <div className="space-y-6">
        <div className="card">
          <h1 className="text-2xl font-bold mb-3">{ex.name} — Démonstration</h1>
          <SquatAngles
            urls={{
              front: ex.lottie.front, // "/lottie/squat-front.json"
              side:  ex.lottie.side,  // "/lottie/squat-side.json"
              back:  ex.lottie.back,  // "/lottie/squat-back.json"
            }}
          />
        </div>
      </div>
    );
  }

  // (Facultatif) fallback vidéo si un jour tu as d'autres exos en MP4
  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="text-2xl font-bold mb-3">{ex.name} — Démonstration</h1>
        <video className="w-full rounded-xl" src={ex.video} poster={ex.thumbnail} controls loop playsInline />
      </div>
    </div>
  );
}
