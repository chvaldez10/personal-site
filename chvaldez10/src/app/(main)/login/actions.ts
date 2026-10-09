"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/utils/supabase/server";
import { fetchWaffleSwitch } from "@/actions/fetchWaffleSwitch";
import {
  loginSchema,
  signupSchema,
  type AuthState,
} from "@/lib/validation/auth";

export async function login(
  _previous: AuthState,
  formData: FormData,
): Promise<AuthState> {
  if (process.env.SITE_DEMO_MODE === "true")
    return { error: "Login is disabled in demo mode." };
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  let failed = false;
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    failed = Boolean(error);
  } catch {
    return { error: "Login is temporarily unavailable. Please try again." };
  }
  if (failed)
    return {
      error:
        "Unable to sign in. Check your email and password, including email confirmation.",
    };
  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signup(
  _previous: AuthState,
  formData: FormData,
): Promise<AuthState> {
  if (process.env.SITE_DEMO_MODE === "true")
    return { error: "Signup is disabled in demo mode." };
  const parsed = signupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  try {
    const flag = await fetchWaffleSwitch("enable_signup");
    if (!flag?.is_active)
      return { error: "New registrations are currently closed." };
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
    });
    if (error)
      return { error: "Unable to create an account. Please try again later." };
    if (!data.session)
      return {
        message: "Check your email to confirm your account before signing in.",
      };
  } catch {
    return { error: "Signup is temporarily unavailable. Please try again." };
  }
  revalidatePath("/", "layout");
  redirect("/dashboard");
}
