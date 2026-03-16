
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import Image from "next/image"
import { supabase } from "@/lib/supabase"
import DashboardClient from "./DashboardClient"

const WEEKS = 12

export default async function DashboardPage() {
    const cookieStore = await cookies()
    const userId = cookieStore.get("user_id")?.value

    if (!userId) redirect("/login")

    const { data: user, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single()

    if (error || !user) redirect("/login")

    const isAdmin = Boolean(user.admin)

    return (
        <div className="min-h-screen flex flex-col">
            <header className="bg-amber-600 shadow-md relative z-10">
                <div className="max-w-4xl mx-auto px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
                    <div className="flex items-center gap-3">
                        <Image src="/frelon-face.jpg" alt="Frelon" width={36} height={36} className="rounded-full object-cover" />
                        <span className="text-white font-semibold text-lg tracking-wide">
                            Frelon Asiatique
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        {isAdmin && (
                            <a
                                href="/admin"
                                className="text-amber-100 hover:text-white text-sm underline underline-offset-2 transition-colors"
                            >
                                Admin
                            </a>
                        )}
                        <a
                            href="/stats"
                            className="text-amber-100 hover:text-white text-sm underline underline-offset-2 transition-colors"
                        >
                            Statistiques
                        </a>
                        <form
                            action={async () => {
                                "use server"
                                const cookieStore = await cookies()
                                cookieStore.delete("user_id")
                                redirect("/")
                            }}
                        >
                            <button
                                type="submit"
                                className="text-amber-100 hover:text-white text-sm underline underline-offset-2 transition-colors"
                            >
                                Se déconnecter
                            </button>
                        </form>
                    </div>
                </div>
            </header>

            <main className="flex-1 flex justify-center px-4 py-10">
                <div className="w-full max-w-2xl flex flex-col gap-8">
                    <div className="text-center">
                        <h1 className="text-2xl sm:text-3xl font-bold text-amber-800">
                            Bonjour, {user.name}
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">
                            Déclarez vos captures hebdomadaires
                        </p>
                    </div>

                    <DashboardClient
                        userId={userId}
                        initialData={user as Record<string, unknown>}
                        weeks={WEEKS}
                    />
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