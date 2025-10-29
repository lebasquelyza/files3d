"use client";

export default function Error({ error, reset }) {
  return (
    <div className="card">
      <h2 className="text-xl font-bold mb-2">Oups, une erreur est survenue</h2>
      <pre className="text-sm overflow-auto p-3 rounded bg-gray-100 dark:bg-gray-800">
        {String(error?.message || error)}
      </pre>
      <button className="btn mt-3" onClick={() => reset()}>
        Réessayer
      </button>
    </div>
  );
}
