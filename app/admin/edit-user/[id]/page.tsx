
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import Image from "next/image"
import { supabase } from "@/lib/supabase"
import EditUserForm from "./EditUserForm"

type Props = {
    params: Promise<{ id: string }>
}

export default async function EditUserPage({ params }: Props) {
    const { id } = await params
    const cookieStore = await cookies()
    const userId = cookieStore.get("user_id")?.value

    if (!userId) redirect("/login")

    const { data: currentUser, error: authError } = await supabase
        .from("users")
        .select("admin")
        .eq("id", userId)
        .single()

    if (authError || !currentUser) redirect("/login")
    if (!currentUser.admin) redirect("/dashboard")

    // Fetch the user to edit — including latitude & longitude
    const { data: targetUser, error: fetchError } = await supabase
        .from("users")
        .select("id, name, address, telephone, email, password_hash, trap_type, appat, admin, latitude, longitude")
        .eq("id", id)
        .single()

    if (fetchError || !targetUser) redirect("/admin")

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
                    <a
                        href="/admin"
                        className="text-amber-100 hover:text-white text-sm underline underline-offset-2 transition-colors"
                    >
                        ← Retour
                    </a>
                </div>
            </header>

            <main className="flex-1 flex justify-center px-4 py-10">
                <div className="w-full max-w-md flex flex-col gap-6">
                    <div className="text-center">
                        <h1 className="text-2xl sm:text-3xl font-bold text-amber-800">
                            Modifier le piégeur
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">
                            Modifiez les informations de {targetUser.name}.
                        </p>
                    </div>

                    <EditUserForm user={targetUser} />
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