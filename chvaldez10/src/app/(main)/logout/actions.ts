"use server";
export async function logout(): Promise<{ error?: string }> {
  return { error: "Use the dashboard signout button." };
}
