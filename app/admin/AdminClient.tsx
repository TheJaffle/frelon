"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { deleteUser } from "./actions"

type Trapper = {
    id: string
    name: string
    address: string | null
    telephone: string | null
    admin: boolean
}

type Props = {
    initialTrappers: Trapper[]
}

export default function AdminClient({ initialTrappers }: Props) {
    const router = useRouter()
    const [trappers, setTrappers] = useState<Trapper[]>(initialTrappers)
    const [confirmTarget, setConfirmTarget] = useState<Trapper | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null)

    const handleDelete = async () => {
        if (!confirmTarget) return
        setIsDeleting(true)
        setFeedback(null)

        const result = await deleteUser(confirmTarget.id)

        setIsDeleting(false)
        setConfirmTarget(null)

        if (result.success) {
            setTrappers((prev) => prev.filter((t) => t.id !== confirmTarget.id))
            setFeedback({ type: "success", message: "Piégeur supprimé." })
            setTimeout(() => setFeedback(null), 3000)
        } else {
            setFeedback({ type: "error", message: result.error ?? "Erreur inconnue." })
        }
    }

    return (
        <>
            {/* Feedback banner */}
            {feedback && (
                <div
                    className={`rounded-lg px-4 py-2 text-sm text-center ${
                        feedback.type === "success"
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : "bg-red-50 text-red-600 border border-red-200"
                    }`}
                >
                    {feedback.message}
                </div>
            )}

            {/* Trappers list */}
            <div className="flex flex-col gap-3">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    Utilisateurs ({trappers.length})
                </h2>

                {trappers.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-4">
                        Aucun utilisateur enregistré.
                    </p>
                ) : (
                    trappers.map((t) => (
                        <div
                            key={t.id}
                            className="bg-white rounded-xl shadow-sm border border-gray-100 px-4 py-3 flex items-center justify-between gap-3"
                        >
                            <div className="flex flex-col min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-gray-800 truncate">
                                        {t.name}
                                    </span>
                                    {t.admin && (
                                        <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
                                            Admin
                                        </span>
                                    )}
                                </div>
                                {t.address && (
                                    <span className="text-xs text-gray-500 truncate">
                                        {t.address}
                                    </span>
                                )}
                                {t.telephone && (
                                    <span className="text-xs text-gray-400">
                                        {t.telephone}
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-col gap-1.5 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => router.push(`/admin/edit-user/${t.id}`)}
                                    className="bg-amber-50 hover:bg-amber-100 active:bg-amber-200 text-amber-700 text-xs font-semibold py-2 px-3 rounded-lg transition-colors duration-150"
                                >
                                    Éditer
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setConfirmTarget(t); setFeedback(null) }}
                                    className="bg-red-50 hover:bg-red-100 active:bg-red-200 text-red-600 text-xs font-semibold py-2 px-3 rounded-lg transition-colors duration-150"
                                >
                                    Supprimer
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Confirmation modal */}
            {confirmTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 flex flex-col gap-4">
                        <p className="text-gray-800 text-sm text-center leading-relaxed">
                            Êtes-vous sûr de vouloir supprimer cet utilisateur ?
                        </p>
                        <p className="text-center font-semibold text-amber-800">
                            {confirmTarget.name}
                        </p>
                        <div className="flex gap-3 mt-2">
                            <button
                                type="button"
                                onClick={() => setConfirmTarget(null)}
                                disabled={isDeleting}
                                className="flex-1 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 font-semibold text-sm py-2.5 rounded-lg transition-colors duration-150"
                            >
                                Annuler
                            </button>
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="flex-1 bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:opacity-60 text-white font-semibold text-sm py-2.5 rounded-lg transition-colors duration-150"
                            >
                                {isDeleting ? "Suppression…" : "Supprimer"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}