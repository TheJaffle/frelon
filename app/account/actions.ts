"use server"

import { supabase } from "@/lib/supabase"
import { cookies } from "next/headers"

/**
 * Update the currently logged-in user's own account.
 */
export async function updateMyAccount(
    formData: FormData
): Promise<{ success: boolean; error?: string }> {
    const cookieStore = await cookies()
    const userId = cookieStore.get("user_id")?.value
    if (!userId) {
        return { success: false, error: "Non connecté." }
    }

    const name = (formData.get("name") as string)?.trim()
    const address = (formData.get("address") as string)?.trim()
    const telephone = (formData.get("telephone") as string)?.trim()
    const email = (formData.get("email") as string)?.trim()
    const trapType = (formData.get("trap_type") as string)?.trim()
    const appat = (formData.get("appat") as string)?.trim()
    const latRaw = (formData.get("latitude") as string)?.trim()
    const lngRaw = (formData.get("longitude") as string)?.trim()
    const latitude = latRaw ? parseFloat(latRaw) : null
    const longitude = lngRaw ? parseFloat(lngRaw) : null

    // Validation
    if (!name) return { success: false, error: "Le nom est obligatoire." }
    if (!address) return { success: false, error: "L'adresse est obligatoire." }
    if (!telephone) return { success: false, error: "Le téléphone est obligatoire." }
    if (!email) return { success: false, error: "L'email est obligatoire." }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return { success: false, error: "Le format de l'email est invalide." }
    }

    const { error } = await supabase
        .from("users")
        .update({
            name,
            address,
            telephone,
            email,
            trap_type: trapType || "Vespa Catch Select",
            appat: appat || "Classique 1/3-1/3-1/3",
            latitude,
            longitude,
        })
        .eq("id", userId)

    if (error) {
        console.error("Supabase update error:", error)
        return { success: false, error: `Erreur lors de la mise à jour : ${error.message}` }
    }

    return { success: true }
}