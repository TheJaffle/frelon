import Link from "next/link"
import Image from "next/image"

export default function Home() {
  return (
      <div className="min-h-screen flex flex-col">
        {/* Header with translucent bg */}
        <header className="bg-amber-600/90 backdrop-blur-sm shadow-md relative z-10">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-3">
            <Image src="/frelon-face.jpg" alt="Frelon" width={36} height={36} className="rounded-full object-cover" />
            <span className="text-white font-semibold text-lg tracking-wide">
            Frelon Asiatique
          </span>
          </div>
        </header>

        {/* Hero section with background image */}
        <main className="flex-1 relative flex items-center justify-center px-6 py-16">
          {/* Background image */}
          <div className="fixed inset-0 -z-10">
            <Image
                src="/frelon-side.jpg"
                alt=""
                fill
                className="object-cover object-center"
                priority
            />
            <div className="absolute inset-0 bg-amber-950/60 backdrop-blur-[2px]" />
          </div>

          {/* Content card */}
          <div className="relative z-10 max-w-2xl w-full bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-10 flex flex-col items-center text-center gap-8">
            <div className="w-24 h-24 rounded-full overflow-hidden shadow-lg border-4 border-amber-200">
              <Image
                  src="/frelon-flight.jpg"
                  alt="Frelon asiatique en vol"
                  width={96}
                  height={96}
                  className="object-cover w-full h-full"
              />
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-amber-800 leading-tight">
              Suivi de la campagne 2026 de piégeage du frelon asiatique
            </h1>
            <h1 className="text-3xl sm:text-4xl font-bold text-amber-800 leading-tight">
              La Tour de Salvagny
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

        <footer className="bg-amber-600/90 backdrop-blur-sm py-4 relative z-10">
          <p className="text-center text-amber-100 text-sm">
            © {new Date().getFullYear()} — Campagne de piégeage du frelon asiatique
          </p>
        </footer>
      </div>
  )
}