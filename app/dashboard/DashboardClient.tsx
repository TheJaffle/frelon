"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { saveCaptures } from "./actions"

type Props = {
  userId: string
  initialData: Record<string, unknown>
  weeks: number
}

const TRAP_TYPE_OPTIONS = [
  "BeeVital",
  "Grilel Neoppi",
  "Ornetin",
  "Osaka",
  "Vespa Catch Select",
  "Vespa Catch",
  "Good4Bees",
  "Bouteille (à proscrire)",
]

const APPAT_OPTIONS = [
  "Classique 1/3-1/3-1/3",
  "Eau sucrée",
  "Autre",
]

/* ── Week date structures ────────────────────────────────── */

type WeekRange = {
  label: string
  endDate: Date
}

const WEEK_RANGES: WeekRange[] = (() => {
  const ranges: WeekRange[] = []
  let day = 9
  let month = 3 // March
  const monthNames: Record<number, string> = { 3: "03", 4: "04", 5: "05", 6: "06" }
  const daysInMonth: Record<number, number> = { 3: 31, 4: 30, 5: 31, 6: 30 }

  for (let i = 0; i < 12; i++) {
    const startDay = day
    const startMonth = month
    let endDay = day + 6
    let endMonth = month

    if (endDay > daysInMonth[endMonth]) {
      endDay -= daysInMonth[endMonth]
      endMonth += 1
    }

    const label = `${String(startDay).padStart(2, "0")}/${monthNames[startMonth]}-${String(endDay).padStart(2, "0")}/${monthNames[endMonth]}`

    // End date: year is current year
    const year = new Date().getFullYear()
    const endDate = new Date(year, endMonth - 1, endDay, 23, 59, 59)

    ranges.push({ label, endDate })

    day += 7
    if (day > daysInMonth[month]) {
      day -= daysInMonth[month]
      month += 1
    }
  }
  return ranges
})()

/* ── Simple modal component ──────────────────────────────── */

function Modal({ message, onClose }: { message: string; onClose: () => void }) {
  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
        <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 flex flex-col gap-4 text-center">
          <p className="text-gray-800 text-sm leading-relaxed">{message}</p>
          <button
              type="button"
              onClick={onClose}
              className="self-center bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-semibold text-sm py-2 px-6 rounded-lg shadow-sm transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-amber-300"
          >
            Compris
          </button>
        </div>
      </div>
  )
}

/* ── Main component ──────────────────────────────────────── */

export default function DashboardClient({ userId, initialData, weeks }: Props) {
  const router = useRouter()

  const buildInitial = () => {
    const state: Record<string, number> = {}
    for (let w = 1; w <= weeks; w++) {
      state[`asian_week_${w}`] = Number(initialData[`asian_week_${w}`]) || 0
      state[`other_week_${w}`] = Number(initialData[`other_week_${w}`]) || 0
      state[`europe_week_${w}`] = Number(initialData[`europe_week_${w}`]) || 0
    }
    return state
  }

  const buildDeclared = () => {
    const state: Record<number, boolean> = {}
    for (let w = 1; w <= weeks; w++) {
      state[w] = Boolean(initialData[`declared_week_${w}`])
    }
    return state
  }

  const [values, setValues] = useState<Record<string, number>>(buildInitial)
  const [declared] = useState<Record<number, boolean>>(buildDeclared)
  const [openedWeeks, setOpenedWeeks] = useState<Set<number>>(new Set())
  const [trapType, setTrapType] = useState<string>(String(initialData.trap_type ?? ""))
  const [appat, setAppat] = useState<string>(String(initialData.appat ?? ""))
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState("")
  const [modalMessage, setModalMessage] = useState<string | null>(null)

  const isWeekVisible = (w: number) => declared[w] || openedWeeks.has(w)

  const handleDeclare = (w: number) => {
    const today = new Date()

    // Rule A — future week
    if (WEEK_RANGES[w - 1].endDate > today) {
      setModalMessage("Vous ne pouvez pas déclarer les prises d'une semaine avant le dimanche de celle-ci")
      return
    }

    // Rule B — previous weeks must be declared
    for (let prev = 1; prev < w; prev++) {
      if (!isWeekVisible(prev)) {
        setModalMessage("Avant de déclarer une semaine, vous devez avoir déclaré toutes les semaines précédentes (même si vous n'avez pas fait de prises).")
        return
      }
    }

    // Rule C — all good
    setOpenedWeeks((prev) => new Set(prev).add(w))
    setSaveError("")
  }

  const handleChange = (key: string, raw: string) => {
    const n = raw === "" ? 0 : Math.max(0, parseInt(raw, 10) || 0)
    setValues((prev) => ({ ...prev, [key]: n }))
    setSaveError("")
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)
    setSaveError("")

    const formData = new FormData()
    for (const [key, val] of Object.entries(values)) {
      formData.set(key, String(val))
    }
    formData.set("trap_type", trapType)
    formData.set("appat", appat)

    // Send declared flags for all visible weeks
    for (let w = 1; w <= weeks; w++) {
      formData.set(`declared_week_${w}`, isWeekVisible(w) ? "true" : "false")
    }

    const result = await saveCaptures(userId, formData)
    setIsSaving(false)

    if (result.success) {
      router.push("/stats")
    } else {
      setSaveError(result.error ?? "Erreur inconnue.")
    }
  }

  return (
      <>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 items-center">

          {/* Dropdowns for trap type & bait */}
          <div className="w-full max-w-sm flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="trap_type" className="text-sm font-medium text-gray-700">
                Type de piège
              </label>
              <select
                  id="trap_type"
                  value={trapType}
                  onChange={(e) => { setTrapType(e.target.value); setSaveError("") }}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
              >
                <option value="">— Sélectionnez —</option>
                {TRAP_TYPE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="appat" className="text-sm font-medium text-gray-700">
                Type d&apos;appât
              </label>
              <select
                  id="appat"
                  value={appat}
                  onChange={(e) => { setAppat(e.target.value); setSaveError("") }}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
              >
                <option value="">— Sélectionnez —</option>
                {APPAT_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>

          <p className="text-gray-500 text-sm">
            Saisissez vos captures pour chaque semaine, puis enregistrez.
          </p>

          {/* Table wrapper — constrained to same width as the rest */}
          <div className="w-full max-w-2xl mx-auto flex flex-col gap-2">

            {/* Column headers */}
            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-3 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">
              <span>Semaine</span>
              <span className="w-16 text-center">Asiat</span>
              <span className="w-16 text-center">Europ</span>
              <span className="w-16 text-center">Autres</span>
            </div>

            {/* Week rows */}
            {Array.from({ length: weeks }, (_, i) => i + 1).map((w) => (
                <div
                    key={w}
                    className="bg-white rounded-lg shadow-sm border border-gray-100 px-3 py-2 grid grid-cols-[1fr_auto_auto_auto] gap-3 items-center"
                >
                  <span className="text-xs font-semibold text-amber-700 whitespace-nowrap">
                    {WEEK_RANGES[w - 1].label}
                  </span>

                  {isWeekVisible(w) ? (
                      <>
                        {/* Asian hornets */}
                        <input
                            type="number"
                            min={0}
                            max={999}
                            value={values[`asian_week_${w}`]}
                            onChange={(e) => handleChange(`asian_week_${w}`, e.target.value)}
                            className="w-16 text-center rounded-md border border-gray-200 py-1 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
                        />

                        {/* European hornets */}
                        <input
                            type="number"
                            min={0}
                            max={999}
                            value={values[`europe_week_${w}`]}
                            onChange={(e) => handleChange(`europe_week_${w}`, e.target.value)}
                            className="w-16 text-center rounded-md border border-gray-200 py-1 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
                        />

                        {/* Other hornets */}
                        <input
                            type="number"
                            min={0}
                            max={999}
                            value={values[`other_week_${w}`]}
                            onChange={(e) => handleChange(`other_week_${w}`, e.target.value)}
                            className="w-16 text-center rounded-md border border-gray-200 py-1 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
                        />
                      </>
                  ) : (
                      <button
                          type="button"
                          onClick={() => handleDeclare(w)}
                          className="col-span-3 justify-self-center bg-amber-100 hover:bg-amber-200 active:bg-amber-300 text-amber-800 text-xs font-semibold py-1.5 px-4 rounded-md transition-colors duration-150"
                      >
                        Déclarer
                      </button>
                  )}
                </div>
            ))}
          </div>

          {saveError && (
              <p className="text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-sm text-center">
                {saveError}
              </p>
          )}

          <button
              type="submit"
              disabled={isSaving}
              className="bg-amber-600 hover:bg-amber-700 active:bg-amber-800 disabled:opacity-60 text-white font-semibold text-sm py-2 px-6 rounded-lg shadow-sm transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-amber-300 mt-2"
          >
            {isSaving ? "Enregistrement…" : "Enregistrer"}
          </button>
        </form>

        {/* Validation modal */}
        {modalMessage && (
            <Modal message={modalMessage} onClose={() => setModalMessage(null)} />
        )}
      </>
  )
}