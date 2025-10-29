import { EXERCISES } from "@/lib/exercises";

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold">Catalogue d'exercices avec IA</h1>
        <p className="opacity-80 mt-2">Regarde la démonstration puis entraîne-toi avec la webcam et un compteur intelligent.</p>
      </section>

      <section className="grid sm:grid-cols-2 gap-4">
        {EXERCISES.map((ex) => (
          <article key={ex.id} className="card">
            <div className="flex items-center gap-4">
              <img src={ex.thumbnail} alt={ex.name} className="w-24 h-24 rounded-xl object-cover" />
              <div className="flex-1">
                <h2 className="text-xl font-semibold">{ex.name}</h2>
                <div className="flex gap-2 mt-1">
                  <span className="badge">{ex.level}</span>
                  <span className="badge">{ex.equipment.join(", ")}</span>
                </div>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <a className="btn" href={`/exercise/${ex.id}`}>Voir l'exercice</a>
              <a className="btn" href={`/practice/${ex.id}`}>Pratiquer avec l'IA</a>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
