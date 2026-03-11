import Link from "next/link"

export default function Home() {
  return (
      <div className="min-h-screen bg-amber-50 flex flex-col">
        <header className="bg-amber-600 shadow-md">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-3">
            <span className="text-3xl">🐝</span>
            <span className="text-white font-semibold text-lg tracking-wide">
            Frelon Asiatique
          </span>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center px-6 py-16">
          <div className="max-w-2xl w-full bg-white rounded-2xl shadow-lg p-10 flex flex-col items-center text-center gap-8">
            <div className="bg-amber-100 rounded-full p-5">
              <span className="text-5xl">🪤</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-amber-800 leading-tight">
              Suivi de la campagne de piégeage du frelon asiatique
            </h1>

            <p className="text-gray-600 text-base sm:text-lg leading-relaxed max-w-xl">
              Cette plateforme permet de centraliser et de suivre en temps réel
              les données collectées lors de la campagne de piégeage du frelon
              asiatique (<em>Vespa velutina</em>). Consultez les statistiques,
              déclarez vos captures et contribuez à la protection de nos
              pollinisateurs.
            </p>

            <Link
                href="/login"
                className="mt-2 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-semibold text-lg px-10 py-3 rounded-full shadow-md transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-amber-300"
            >
              Se connecter
            </Link>
          </div>
        </main>

        <footer className="bg-amber-600 py-4">
          <p className="text-center text-amber-100 text-sm">
            © {new Date().getFullYear()} — Campagne de piégeage du frelon asiatique
          </p>
        </footer>
      </div>
  )
}