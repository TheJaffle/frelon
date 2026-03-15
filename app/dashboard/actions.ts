"use server"

import { supabase } from "@/lib/supabase"

const WEEKS = 12

export async function saveCaptures(
    userId: string,
    formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const update: Record<string, number | string> = {}

  for (let w = 1; w <= WEEKS; w++) {
    update[`asian_week_${w}`] = Number(formData.get(`asian_week_${w}`)) || 0
    update[`europe_week_${w}`] = Number(formData.get(`europe_week_${w}`)) || 0
    update[`other_week_${w}`] = Number(formData.get(`other_week_${w}`)) || 0
  }

  update.trap_type = String(formData.get("trap_type") ?? "")
  update.appat = String(formData.get("appat") ?? "")

  const { error } = await supabase
      .from("users")
      .update(update)
      .eq("id", userId)

  if (error) {
    return { success: false, error: "Erreur lors de la sauvegarde. Veuillez réessayer." }
  }

  return { success: true }
}