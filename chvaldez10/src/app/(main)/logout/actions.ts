"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function logout(): Promise<{ error?: string }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();
    if (error) return { error: "Unable to sign out. Please try again." };
  } catch {
    return { error: "Signout is temporarily unavailable. Please try again." };
  }
  revalidatePath("/", "layout");
  redirect("/");
}
