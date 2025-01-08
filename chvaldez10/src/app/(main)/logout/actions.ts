"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function logout() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    // redirect("/error"); // don't have error page yet
    alert("Error");
  }

  revalidatePath("/", "layout");
  redirect("/");
}