import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().pipe(z.email("Enter a valid email address.")),
  password: z.string().min(1, "Enter your password."),
});

export const signupSchema = loginSchema
  .extend({
    password: z.string().min(8, "Use at least 8 characters."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

export type AuthState = {
  error?: string;
  message?: string;
  fieldErrors?: Partial<
    Record<"email" | "password" | "confirmPassword", string[]>
  >;
};

export function safeNextPath(value: string | null): string {
  if (!value?.startsWith("/") || value.startsWith("//") || /[\\\s]/.test(value))
    return "/";
  try {
    const origin = "https://local.invalid";
    const target = new URL(value, origin);
    return target.origin === origin
      ? target.pathname + target.search + target.hash
      : "/";
  } catch {
    return "/";
  }
}
