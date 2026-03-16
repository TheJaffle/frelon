import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import Image from "next/image"
import { supabase } from "@/lib/supabase"
import AdminClient from "./AdminClient"

export default async function AdminPage() {
    const cookieStore = await cookies()
    const userId = cookieStore.get("user_id")?.value

    if (!userId) redirect("/login")

    const { data: user, error } = await supabase
        .from("users")
        .select("name, admin")
        .eq("id", userId)
        .single()

    if (error || !user) redirect("/login")
    if (!user.admin) redirect("/dashboard")

    // Fetch all users (admin and non-admin) for the list
    const { data: trappers } = await supabase
        .from("users")
        .select("id, name, address, telephone, admin")
        .order("name", { ascending: true })

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
                        <a
                            href="/dashboard"
                            className="text-amber-100 hover:text-white text-sm underline underline-offset-2 transition-colors"
                        >
                            ← Retour
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
                            Administration
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">
                            Gestion des piégeurs et de la campagne
                        </p>
                    </div>

                    <a
                        href="/admin/new-user"
                        className="block w-full text-center bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-semibold text-base py-4 rounded-xl shadow-sm transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-amber-300"
                    >
                        Ajouter un nouveau piégeur
                    </a>

                    <AdminClient initialTrappers={trappers ?? []} />
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