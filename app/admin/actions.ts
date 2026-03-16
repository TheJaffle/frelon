"use server"

import { supabase } from "@/lib/supabase"
import { cookies } from "next/headers"

/**
 * Verify that the current session belongs to an admin user.
 * Returns the admin user's id, or null.
 */
export async function verifyAdmin(): Promise<string | null> {
    const cookieStore = await cookies()
    const userId = cookieStore.get("user_id")?.value
    if (!userId) return null

    const { data, error } = await supabase
        .from("users")
        .select("id, admin")
        .eq("id", userId)
        .single()

    if (error || !data || !data.admin) return null
    return data.id
}

/**
 * Create a new trapper (piégeur) in the database.
 */
export async function createUser(formData: FormData): Promise<{ success: boolean; error?: string }> {
    // Verify admin access
    const adminId = await verifyAdmin()
    if (!adminId) {
        return { success: false, error: "Accès non autorisé." }
    }

    const name = (formData.get("name") as string)?.trim()
    const address = (formData.get("address") as string)?.trim()
    const telephone = (formData.get("telephone") as string)?.trim()
    const email = (formData.get("email") as string)?.trim()
    const passwordHash = (formData.get("password_hash") as string)?.trim()

    // Validation
    if (!name) return { success: false, error: "Le nom est obligatoire." }
    if (!address) return { success: false, error: "L'adresse est obligatoire." }
    if (!telephone) return { success: false, error: "Le téléphone est obligatoire." }
    if (!email) return { success: false, error: "L'email est obligatoire." }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return { success: false, error: "Le format de l'email est invalide." }
    }
    if (!passwordHash) return { success: false, error: "Le mot de passe est obligatoire." }

    const { error } = await supabase.from("users").insert({
        name,
        address,
        telephone,
        email,
        password_hash: passwordHash,
        trap_type: "Vespa Catch Select",
        appat: "Classique 1/3-1/3-1/3",
        admin: false,
    })

    if (error) {
        console.error("Supabase insert error:", error)
        return { success: false, error: "Erreur lors de la création. Veuillez réessayer." }
    }

    return { success: true }
}
/**
 * Fetch all non-admin trappers.
 */
export async function getTrappers(): Promise<{
    success: boolean
    data?: { id: string; name: string; address: string | null; telephone: string | null }[]
    error?: string
}> {
    const adminId = await verifyAdmin()
    if (!adminId) return { success: false, error: "Accès non autorisé." }

    const { data, error } = await supabase
        .from("users")
        .select("id, name, address, telephone")
        .eq("admin", false)
        .order("name", { ascending: true })

    if (error) {
        return { success: false, error: "Erreur lors du chargement des piégeurs." }
    }

    return { success: true, data: data ?? [] }
}

/**
 * Delete a trapper by id. Only non-admin users can be deleted.
 */
export async function deleteUser(userId: string): Promise<{ success: boolean; error?: string }> {
    const adminId = await verifyAdmin()
    if (!adminId) return { success: false, error: "Accès non autorisé." }

    // Safety: make sure we're not deleting an admin
    const { data: target, error: fetchError } = await supabase
        .from("users")
        .select("id, admin")
        .eq("id", userId)
        .single()

    if (fetchError || !target) {
        return { success: false, error: "Piégeur introuvable." }
    }

    if (target.admin) {
        return { success: false, error: "Impossible de supprimer un administrateur." }
    }

    const { error } = await supabase
        .from("users")
        .delete()
        .eq("id", userId)

    if (error) {
        console.error("Supabase delete error:", error)
        return { success: false, error: "Erreur lors de la suppression. Veuillez réessayer." }
    }

    return { success: true }
}