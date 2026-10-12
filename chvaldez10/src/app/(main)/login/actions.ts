"use server";
import type { AuthState } from "@/lib/validation/auth";
// Compatibility exports; the live login form now uses Convex Auth.
export async function login(): Promise<AuthState> {
  return { error: "Use the Convex login form." };
}
export async function signup(): Promise<AuthState> {
  return { error: "Public registration is disabled." };
}
