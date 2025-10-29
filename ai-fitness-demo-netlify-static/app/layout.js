export const metadata = {
  title: "AI Fitness Demo",
  description: "Catalogue d'exercices + pose AI (MoveNet)",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className="min-h-screen">
        <header className="border-b border-black/5 dark:border-white/10 mb-6">
          <div className="container py-4 flex items-center justify-between">
            <a href="/" className="font-bold text-xl">AI Fitness</a>
            <nav className="text-sm opacity-80">
              <a href="https://example.com" target="_blank" rel="noreferrer" className="hover:underline">À propos</a>
            </nav>
          </div>
        </header>
        <main className="container pb-16">{children}</main>
        <footer className="border-t border-black/5 dark:border-white/10 mt-8">
          <div className="container py-6 text-sm opacity-70">
            ⚠️ Conseils généraux. Ne remplace pas un professionnel de santé.
          </div>
        </footer>
      </body>
    </html>
  );
}
