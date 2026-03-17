"use server"

import { supabase } from "@/lib/supabase"

const WEEKS = 12

/**
 * Save a trapper's weekly captures and declared flags.
 */
export async function saveCaptures(
    userId: string,
    formData: FormData
): Promise<{ success: boolean; error?: string }> {
  if (!userId) {
    return { success: false, error: "Utilisateur non identifié." }
  }

  const update: Record<string, unknown> = {}

  // Weekly capture values + declared flags only
  for (let w = 1; w <= WEEKS; w++) {
    const asian = formData.get(`asian_week_${w}`)
    const other = formData.get(`other_week_${w}`)
    const europe = formData.get(`europe_week_${w}`)
    const declared = formData.get(`declared_week_${w}`)

    if (asian !== null) update[`asian_week_${w}`] = Number(asian) || 0
    if (other !== null) update[`other_week_${w}`] = Number(other) || 0
    if (europe !== null) update[`europe_week_${w}`] = Number(europe) || 0
    if (declared !== null) update[`declared_week_${w}`] = declared === "true"
  }

  const { error } = await supabase
      .from("users")
      .update(update)
      .eq("id", userId)

  if (error) {
    console.error("Supabase update error:", error)
    return { success: false, error: "Erreur lors de l'enregistrement. Veuillez réessayer." }
  }

  return { success: true }
}