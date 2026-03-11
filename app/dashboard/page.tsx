
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { supabase } from "@/lib/supabase"
import DashboardClient from "./DashboardClient"

const WEEKS = 12

type UserRow = {
    name: string
} & {
    [K in `asian_week_${number}` | `europe_week_${number}`]: number | null
}

export default async function DashboardPage() {
    const cookieStore = await cookies()
    const userId = cookieStore.get("user_id")?.value

    if (!userId) redirect("/login")

    const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single()

    if (error || !data) redirect("/login")

    const user = data as unknown as UserRow

    return (
        <div className="min-h-screen bg-amber-50 flex flex-col">
            <header className="bg-amber-600 shadow-md">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">🐝</span>
                        <span className="text-white font-semibold text-lg tracking-wide">
              Frelon Asiatique
            </span>
                    </div>
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
            </header>

            <main className="flex-1 flex justify-center px-4 py-10">
                <div className="w-full max-w-2xl flex flex-col gap-6">
                    <div className="text-center">
                        <span className="text-4xl">🪤</span>
                        <h1 className="text-2xl sm:text-3xl font-bold text-amber-800 mt-2">
                            Bonjour, {user.name} !
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">
                            Saisissez vos captures pour chaque semaine, puis enregistrez.
                        </p>
                    </div>

                    <DashboardClient userId={userId} initialData={user} weeks={WEEKS} />
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