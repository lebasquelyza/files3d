import { EXERCISES } from "@/lib/exercises";

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold">Exercices</h1>
        <p className="opacity-80 mt-2">Clique sur l’exercice pour voir la démonstration.</p>
      </section>

      <section className="grid sm:grid-cols-2 gap-4">
        {EXERCISES.map((ex) => (
          <a key={ex.id} href={`/exercise/${ex.id}`} className="card block hover:shadow-lg transition">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-lg font-bold">
                SQ
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold">{ex.name}</h2>
                <div className="text-sm opacity-70">
                  {ex.level} • {ex.muscles.join(", ")}
                </div>
              </div>
            </div>
          </a>
        ))}
      </section>
    </div>
  );
}
