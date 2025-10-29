import dynamic from "next/dynamic";
import { EXERCISES } from "@/lib/exercises";

export const dynamicParams = false;
export async function generateStaticParams() {
  const { EXERCISES } = await import('@/lib/exercises');
  return EXERCISES.map(e => ({ slug: e.id }));
}

const SquatAngles = dynamic(() => import("@/components/SquatAngles"), { ssr: false });

export default function ExercisePage({ params }) {
  const ex = EXERCISES.find((e) => e.id === params.slug);
  if (!ex) return <div>Exercice introuvable.</div>;

  if (ex.id === "squat") {
    return (
      <div className="space-y-6">
        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          <SquatAngles />
          <aside className="w-full card">
            <h2 className="text-xl font-semibold">{ex.name}</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="badge">{ex.level}</span>
              <span className="badge">{ex.muscles.join(", ")}</span>
            </div>
            <div className="mt-4">
              <h3 className="font-semibold">Consignes</h3>
              <ul className="list-disc pl-5 opacity-90">
                {ex.cues.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            </div>
            <div className="mt-4">
              <h3 className="font-semibold">Erreurs fréquentes</h3>
              <ul className="list-disc pl-5 opacity-90">
                {ex.mistakes.map((m, i) => <li key={i}>{m}</li>)}
              </ul>
            </div>
            <a className="btn mt-4 w-full justify-center" href={`/practice/${ex.id}`}>
              Pratiquer avec la webcam (compteur IA)
            </a>
          </aside>
        </div>
      </div>
    );
  }

  // fallback pour les autres exercices
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-6">
        <div className="flex-1 card">
          <video className="w-full rounded-xl" src={ex.video} poster={ex.thumbnail} controls loop playsInline />
        </div>
        {/* ...ton aside existant ... */}
      </div>
    </div>
  );
}
