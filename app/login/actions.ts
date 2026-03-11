"use server"

import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { supabase } from "@/lib/supabase"

export async function getUsers(): Promise<{ id: string; name: string }[]> {
  const { data, error } = await supabase
    .from("users")
    .select("id, name")
    .order("name", { ascending: true })

  if (error || !data) return []
  return data
}

export async function login(formData: FormData): Promise<{ error: string } | void> {
  const userId = formData.get("userId") as string
  const password = formData.get("password") as string

  if (!userId) {
    return { error: "Veuillez sélectionner un participant." }
  }
  if (!password) {
    return { error: "Veuillez saisir votre mot de passe." }
  }

  const { data: user, error } = await supabase
    .from("users")
    .select("id, password_hash")
    .eq("id", userId)
    .single()

  if (error || !user) {
    return { error: "Utilisateur introuvable. Veuillez réessayer." }
  }

  if (password !== user.password_hash) {
    return { error: "Mot de passe incorrect. Veuillez réessayer." }
  }

  const cookieStore = await cookies()
  cookieStore.set("user_id", user.id, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 8, // 8 hours
  })

  redirect("/dashboard")
}