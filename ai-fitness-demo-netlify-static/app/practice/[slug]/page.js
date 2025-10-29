import { EXERCISES } from "@/lib/exercises";
import PoseCounter from "@/components/PoseCounter";
export const dynamicParams = false;
export async function generateStaticParams() {
  const { EXERCISES } = await import('@/lib/exercises');
  return EXERCISES.map(e => ({ slug: e.id }));
}


export default function PracticePage({ params }) {
  const ex = EXERCISES.find(e => e.id === params.slug);
  if (!ex) return <div>Exercice introuvable.</div>;

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Pratique : {ex.name}</h1>
        <a className="btn" href={`/exercise/${ex.id}`}>Voir la démo</a>
      </header>
      <div className="card">
        <PoseCounter mode={ex.id} />
      </div>
      <p className="text-sm opacity-70">Pose AI embarquée (MoveNet). Aucune image quittent votre navigateur.</p>
    </div>
  );
}
