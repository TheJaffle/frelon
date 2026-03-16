
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
    const adminId = await verifyAdmin()
    if (!adminId) {
        return { success: false, error: "Accès non autorisé." }
    }

    const name = (formData.get("name") as string)?.trim()
    const address = (formData.get("address") as string)?.trim()
    const telephone = (formData.get("telephone") as string)?.trim()
    const email = (formData.get("email") as string)?.trim()
    const passwordHash = (formData.get("password_hash") as string)?.trim()
    const isAdmin = formData.get("admin") === "true"

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
        admin: isAdmin,
    })

    if (error) {
        console.error("Supabase insert error:", error)
        return { success: false, error: `Erreur lors de la création : ${error.message}` }
    }

    return { success: true }
}

/**
 * Fetch all trappers (admin and non-admin).
 */
export async function getTrappers(): Promise<{
    success: boolean
    data?: { id: string; name: string; address: string | null; telephone: string | null; admin: boolean }[]
    error?: string
}> {
    const adminId = await verifyAdmin()
    if (!adminId) return { success: false, error: "Accès non autorisé." }

    const { data, error } = await supabase
        .from("users")
        .select("id, name, address, telephone, admin")
        .order("name", { ascending: true })

    if (error) {
        return { success: false, error: "Erreur lors du chargement des piégeurs." }
    }

    return { success: true, data: data ?? [] }
}

/**
 * Fetch a single user by id (for edit form).
 */
export async function getUser(userId: string): Promise<{
    success: boolean
    data?: {
        id: string
        name: string
        address: string | null
        telephone: string | null
        email: string | null
        password_hash: string | null
        trap_type: string | null
        appat: string | null
        admin: boolean
    }
    error?: string
}> {
    const adminId = await verifyAdmin()
    if (!adminId) return { success: false, error: "Accès non autorisé." }

    const { data, error } = await supabase
        .from("users")
        .select("id, name, address, telephone, email, password_hash, trap_type, appat, admin")
        .eq("id", userId)
        .single()

    if (error || !data) {
        return { success: false, error: "Piégeur introuvable." }
    }

    return { success: true, data }
}

/**
 * Update an existing user.
 */
export async function updateUser(
    userId: string,
    formData: FormData
): Promise<{ success: boolean; error?: string }> {
    const adminId = await verifyAdmin()
    if (!adminId) {
        return { success: false, error: "Accès non autorisé." }
    }

    const name = (formData.get("name") as string)?.trim()
    const address = (formData.get("address") as string)?.trim()
    const telephone = (formData.get("telephone") as string)?.trim()
    const email = (formData.get("email") as string)?.trim()
    const passwordHash = (formData.get("password_hash") as string)?.trim()
    const trapType = (formData.get("trap_type") as string)?.trim()
    const appat = (formData.get("appat") as string)?.trim()
    const isAdmin = formData.get("admin") === "true"

    // Validation
    if (!name) return { success: false, error: "Le nom est obligatoire." }
    if (!address) return { success: false, error: "L'adresse est obligatoire." }
    if (!telephone) return { success: false, error: "Le téléphone est obligatoire." }
    if (!email) return { success: false, error: "L'email est obligatoire." }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return { success: false, error: "Le format de l'email est invalide." }
    }
    if (!passwordHash) return { success: false, error: "Le mot de passe est obligatoire." }

    const { error } = await supabase
        .from("users")
        .update({
            name,
            address,
            telephone,
            email,
            password_hash: passwordHash,
            trap_type: trapType || "Vespa Catch Select",
            appat: appat || "Classique 1/3-1/3-1/3",
            admin: isAdmin,
        })
        .eq("id", userId)

    if (error) {
        console.error("Supabase update error:", error)
        return { success: false, error: `Erreur lors de la mise à jour : ${error.message}` }
    }

    return { success: true }
}

/**
 * Delete a user by id.
 */
export async function deleteUser(userId: string): Promise<{ success: boolean; error?: string }> {
    const adminId = await verifyAdmin()
    if (!adminId) return { success: false, error: "Accès non autorisé." }

    // Safety: prevent self-deletion
    if (userId === adminId) {
        return { success: false, error: "Impossible de supprimer votre propre compte." }
    }

    const { data: target, error: fetchError } = await supabase
        .from("users")
        .select("id, admin")
        .eq("id", userId)
        .single()

    if (fetchError || !target) {
        return { success: false, error: "Piégeur introuvable." }
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