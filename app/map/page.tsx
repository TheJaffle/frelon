import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import Image from "next/image"
import { supabase } from "@/lib/supabase"
import MapLoader from "./MapLoader"

export default async function MapPage() {
    const cookieStore = await cookies()
    const userId = cookieStore.get("user_id")?.value

    if (!userId) redirect("/login")

    const { data: currentUser, error: authError } = await supabase
        .from("users")
        .select("admin")
        .eq("id", userId)
        .single()

    if (authError || !currentUser) redirect("/login")

    const isAdmin = Boolean(currentUser.admin)

    // Fetch trappers with coordinates
    const { data: trappers } = await supabase
        .from("users")
        .select("name, address, latitude, longitude, trap_type")
        .not("latitude", "is", null)
        .not("longitude", "is", null)

    return (
        <div className="min-h-screen flex flex-col">
            <header className="bg-amber-600 shadow-md relative z-20">
                <div className="max-w-4xl mx-auto px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
                    <div className="flex items-center gap-3">
                        <Image src="/frelon-face.jpg" alt="Frelon" width={36} height={36} className="rounded-full object-cover" />
                        <span className="text-white font-semibold text-lg tracking-wide">
                            Frelon Asiatique
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        {isAdmin && (
                            <a href="/admin" className="text-amber-100 hover:text-white text-sm underline underline-offset-2 transition-colors">
                                Admin
                            </a>
                        )}
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

            <main className="flex-1 flex flex-col items-center px-4 py-6">
                <div className="w-full max-w-4xl flex flex-col gap-4">
                    <div className="text-center">
                        <h1 className="text-2xl sm:text-3xl font-bold text-amber-800">
                            Carte des pièges
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">
                            Localisation de tous les pièges sur la commune
                        </p>
                    </div>

                    <div className="w-full rounded-xl overflow-hidden shadow-md border border-gray-200" style={{ height: "70vh" }}>
                        <MapLoader trappers={trappers ?? []} />
                    </div>

                    {/* Legend */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-4 py-3">
                        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                            Légende des types de piège
                        </h2>
                        <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                            {[
                                { label: "BeeVital", color: "#EAB308" },
                                { label: "Grilel Neoppi", color: "#3B82F6" },
                                { label: "Ornetin", color: "#8B5CF6" },
                                { label: "Osaka", color: "#EF4444" },
                                { label: "Vespa Catch Select", color: "#22C55E" },
                                { label: "Vespa Catch", color: "#F97316" },
                                { label: "Good4Bees", color: "#EC4899" },
                                { label: "Bouteille", color: "#6B7280" },
                                { label: "Autre", color: "#1F2937" },
                            ].map((item) => (
                                <div key={item.label} className="flex items-center gap-1.5">
                                    <span
                                        className="inline-block w-3 h-3 rounded-full shrink-0"
                                        style={{ backgroundColor: item.color }}
                                    />
                                    <span className="text-xs text-gray-600">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            <footer className="bg-amber-600 py-4 relative z-20">
                <p className="text-center text-amber-100 text-sm">
                    © {new Date().getFullYear()} — Campagne de piégeage du frelon asiatique
                </p>
            </footer>
        </div>
    )
}