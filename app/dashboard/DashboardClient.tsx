
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { saveCaptures } from "./actions"
import { WEEK_RANGES } from "../stats/types"

type Props = {
  userId: string
  initialData: Record<string, unknown>
  weeks: number
}

// ── Modal de validation hebdomadaire ─────────────────────
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

// ── Modal de succès après enregistrement ─────────────────
function SuccessModal({
                        onViewStats,
                        onQuit,
                      }: {
  onViewStats: () => void
  onQuit: () => void
}) {
  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 flex flex-col gap-6 text-center">
          <div className="flex flex-col items-center gap-2">
            <span className="text-4xl">✅</span>
            <h2 className="text-xl font-bold text-gray-800">
              Enregistrement effectué
            </h2>
            <p className="text-gray-500 text-sm">
              Vos captures ont bien été sauvegardées.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <button
                type="button"
                onClick={onViewStats}
                className="w-full bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-semibold text-base py-3 rounded-xl shadow-sm transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-amber-300"
            >
              Voir statistiques
            </button>
            <button
                type="button"
                onClick={onQuit}
                className="w-full bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 font-semibold text-base py-3 rounded-xl transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-gray-300"
            >
              Quitter application
            </button>
          </div>
        </div>
      </div>
  )
}

// ── Composant principal ───────────────────────────────────
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
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState("")
  const [modalMessage, setModalMessage] = useState<string | null>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const isWeekVisible = (w: number) => declared[w] || openedWeeks.has(w)

  const handleDeclare = (w: number) => {
    const now = new Date()
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)

    if (WEEK_RANGES[w - 1].endDate > todayMidnight) {
      setModalMessage("Vous ne pouvez pas déclarer les prises d'une semaine avant le dimanche de celle-ci")
      return
    }

    for (let prev = 1; prev < w; prev++) {
      if (!isWeekVisible(prev)) {
        setModalMessage("Avant de déclarer une semaine, vous devez avoir déclaré toutes les semaines précédentes (même si vous n'avez pas fait de prises).")
        return
      }
    }

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

    for (let w = 1; w <= weeks; w++) {
      formData.set(`declared_week_${w}`, isWeekVisible(w) ? "true" : "false")
    }

    const result = await saveCaptures(userId, formData)
    setIsSaving(false)

    if (result.success) {
      setShowSuccessModal(true)
    } else {
      setSaveError(result.error ?? "Erreur inconnue.")
    }
  }

  const handleViewStats = () => {
    setShowSuccessModal(false)
    router.push("/stats")
  }

  const handleQuit = () => {
    // Supprimer le cookie user_id côté client
    document.cookie = "user_id=; path=/; max-age=0"
    window.location.href = "/"
  }

  return (
      <>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 items-center">

          <p className="text-red-500 text-sm">
            N'oubliez pas d'enregister vos captures (bouton en bas de page).
          </p>

          <div className="w-full max-w-2xl mx-auto flex flex-col gap-2">

            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-3 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">
              <span>Semaine</span>
              <span className="w-16 text-center">Asiat</span>
              <span className="w-16 text-center">Europ</span>
              <span className="w-16 text-center">Autres</span>
            </div>

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
                        <input
                            type="number"
                            min={0}
                            max={999}
                            value={values[`asian_week_${w}`]}
                            onChange={(e) => handleChange(`asian_week_${w}`, e.target.value)}
                            className="w-16 text-center rounded-md border border-gray-200 py-1 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
                        />
                        <input
                            type="number"
                            min={0}
                            max={999}
                            value={values[`europe_week_${w}`]}
                            onChange={(e) => handleChange(`europe_week_${w}`, e.target.value)}
                            className="w-16 text-center rounded-md border border-gray-200 py-1 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
                        />
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

        {/* Modale de validation hebdomadaire */}
        {modalMessage && (
            <Modal message={modalMessage} onClose={() => setModalMessage(null)} />
        )}

        {/* Modale de succès après enregistrement */}
        {showSuccessModal && (
            <SuccessModal
                onViewStats={handleViewStats}
                onQuit={handleQuit}
            />
        )}
      </>
  )
}