import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import Image from "next/image"
import { supabase } from "@/lib/supabase"
import DashboardClient from "./DashboardClient"

const WEEKS = 12

type UserRow = {
    name: string
    trap_type: string | null
    appat: string | null
    address: string | null
} & {
    [K in `asian_week_${number}` | `europe_week_${number}` | `other_week_${number}`]: number | null
} & {
    [K in `declared_week_${number}`]: boolean | null
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
        <div className="min-h-screen flex flex-col relative">
            {/* Subtle background image
            <div className="fixed inset-0 -z-10">
                <Image
                    src=""
                    alt=""
                    fill
                    className="object-cover object-right"
                />
            </div>*/}

            <header className="bg-amber-600 shadow-md relative z-10">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <Image src="/frelon-face.jpg" alt="Frelon" width={36} height={36} className="rounded-full object-cover" />
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

            <main className="flex-1 flex justify-center px-4 py-10 relative z-10">
                <div className="w-full max-w-2xl flex flex-col gap-6">
                    <div className="text-center">
                        <div className="w-16 h-16 rounded-full overflow-hidden shadow-md border-2 border-amber-200 mx-auto">
                            <Image src="/frelon-flight.jpg" alt="Frelon asiatique" width={64} height={64} className="object-cover w-full h-full" />
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-amber-800 mt-3">
                            Bonjour, {user.name} !
                        </h1>
                        <h2 className="text-center text-amber-800 text-sm">
                            {user.address}
                        </h2>

                        {/* Hornet identification image */}
                        <div className="mt-4 flex justify-center px-4">
                            <Image
                                src="/type-frelon.jpg"
                                alt="Identification des types de frelons"
                                width={480}
                                height={320}
                                className="w-full max-w-[480px] h-auto rounded-xl shadow-md"
                            />
                        </div>
                    </div>

                    <DashboardClient userId={userId} initialData={user} weeks={WEEKS} />
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