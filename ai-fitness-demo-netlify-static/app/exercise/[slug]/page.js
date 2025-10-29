import dynamic from "next/dynamic";
import { EXERCISES } from "@/lib/exercises";

export const dynamicParams = false;
export async function generateStaticParams() {
  const { EXERCISES } = await import('@/lib/exercises');
  return EXERCISES.map(e => ({ slug: e.id }));
}

const SquatAngles = dynamic(() => import("@/components/SquatAngles"), { ssr: false });

export default function ExercisePage({ params }) {
  const ex = EXERCISES.find(e => e.id === params.slug);
  if (!ex) return <div>Exercice introuvable.</div>;

  const Title = (
    <h1 className="text-2xl font-bold mb-3">
      {ex.name} — Démonstration
    </h1>
  );

  if (ex.lottie) {
    return (
      <div className="space-y-6">
        <div className="card">
          {Title}
          <SquatAngles urls={ex.lottie} />
        </div>
        <Tips ex={ex} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card">
        {Title}
        <video className="w-full rounded-xl" src={ex.video} poster={ex.thumbnail} controls loop playsInline />
      </div>
      <Tips ex={ex} />
    </div>
  );
}

function Tips({ ex }) {
  if (!ex.cues && !ex.mistakes) return null;
  return (
    <div className="card">
      <h3 className="font-semibold mb-2">Conseils</h3>
      <div className="grid sm:grid-cols-2 gap-4">
        {ex.cues && (
          <div>
            <div className="font-medium">À faire</div>
            <ul className="list-disc pl-5 opacity-90">{ex.cues.map((c, i) => <li key={i}>{c}</li>)}</ul>
          </div>
        )}
        {ex.mistakes && (
          <div>
            <div className="font-medium">À éviter</div>
            <ul className="list-disc pl-5 opacity-90">{ex.mistakes.map((m, i) => <li key={i}>{m}</li>)}</ul>
          </div>
        )}
      </div>
    </div>
  );
}
