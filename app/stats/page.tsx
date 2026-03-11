import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import Image from "next/image"
import { supabase } from "@/lib/supabase"
import StatsClient from "./StatsClient"
import { WEEKS, WEEK_DATES, type WeekStat } from "./types"

export default async function StatsPage() {
  const cookieStore = await cookies()
  const userId = cookieStore.get("user_id")?.value
  if (!userId) redirect("/login")

  const { data: users, error } = await supabase
      .from("users")
      .select("*")

  if (error || !users) redirect("/login")

  let asianCumul = 0
  let europeCumul = 0

  const weekStats: WeekStat[] = Array.from({ length: WEEKS }, (_, i) => {
    const w = i + 1
    const asian = users.reduce((sum, u) => sum + (Number(u[`asian_week_${w}`]) || 0), 0)
    const europe = users.reduce((sum, u) => sum + (Number(u[`europe_week_${w}`]) || 0), 0)
    asianCumul += asian
    europeCumul += europe
    return {
      label: WEEK_DATES[i],
      asian,
      europe,
      total: asian + europe,
      asianCumul,
      europeCumul,
    }
  })

  return (
      <div className="min-h-screen flex flex-col relative">
        {/* Subtle background
        <div className="fixed inset-0 -z-10">
          <Image
              src=""
              alt=""
              fill
              className="object-cover object-right"
          />
        </div> */}

        <header className="bg-amber-600 shadow-md relative z-10">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Image src="/frelon-face.jpg" alt="Frelon" width={36} height={36} className="rounded-full object-cover" />
              <span className="text-white font-semibold text-lg tracking-wide">
              Frelon Asiatique
            </span>
            </div>
            <div className="flex items-center gap-4">
              <a href="/dashboard" className="text-amber-100 hover:text-white text-sm underline underline-offset-2 transition-colors">
                ← Retour
              </a>
              <form action={async () => {
                "use server"
                const cookieStore = await cookies()
                cookieStore.delete("user_id")
                redirect("/")
              }}>
                <button type="submit" className="text-amber-100 hover:text-white text-sm underline underline-offset-2 transition-colors">
                  Se déconnecter
                </button>
              </form>
            </div>
          </div>
        </header>

        <main className="flex-1 flex justify-center px-4 py-10 relative z-10">
          <div className="w-full max-w-3xl flex flex-col gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full overflow-hidden shadow-md border-2 border-amber-200 mx-auto">
                <Image src="/frelon-face.jpg" alt="Frelon asiatique" width={64} height={64} className="object-cover w-full h-full" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-amber-800 mt-3">
                Statistiques de la campagne
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Captures cumulées par semaine — tous piégeurs confondus
              </p>
            </div>

            <StatsClient weekStats={weekStats} />

            {/* Summary table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="grid grid-cols-[auto_1fr_1fr_1fr] gap-x-4 px-4 py-2 bg-amber-100 text-xs font-semibold text-amber-800 uppercase tracking-wide">
                <span className="whitespace-nowrap">Semaine</span>
                <span className="text-center">🐝 Asiatiques</span>
                <span className="text-center">🟡 Européens</span>
                <span className="text-center font-bold">Total</span>
              </div>
              {weekStats.map((s, i) => (
                  <div
                      key={i}
                      className={`grid grid-cols-[auto_1fr_1fr_1fr] gap-x-4 px-4 py-2 text-sm items-center border-t border-gray-50 ${i % 2 === 0 ? "bg-white" : "bg-amber-50/40"}`}
                  >
                    <span className="text-xs font-semibold text-amber-700 whitespace-nowrap">{s.label}</span>
                    <span className="text-center text-gray-700">{s.asian}</span>
                    <span className="text-center text-gray-700">{s.europe}</span>
                    <span className="text-center font-bold text-amber-800">{s.total}</span>
                  </div>
              ))}
              <div className="grid grid-cols-[auto_1fr_1fr_1fr] gap-x-4 px-4 py-2 bg-amber-200 text-sm font-bold text-amber-900 border-t border-amber-300">
                <span>TOTAL</span>
                <span className="text-center">{weekStats.reduce((s, w) => s + w.asian, 0)}</span>
                <span className="text-center">{weekStats.reduce((s, w) => s + w.europe, 0)}</span>
                <span className="text-center">{weekStats.reduce((s, w) => s + w.total, 0)}</span>
              </div>
            </div>
          </div>
        </main>

        <footer className="bg-amber-600 py-4 relative z-10">
          <p className="text-center text-amber-100 text-sm">
            © {new Date().getFullYear()} — Campagne de piégeage du frelon asiatique
          </p>
        </footer>
      </div>
  )
}