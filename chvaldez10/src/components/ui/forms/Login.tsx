"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { loginSchema, signupSchema } from "@/lib/validation/auth";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/buttons/button";
function OwnerLogin({ setupAvailable }: { setupAvailable: boolean }) {
  const { signIn } = useAuthActions();
  const router = useRouter();
  const [setup, setSetup] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setError("");
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const parsed = (setup ? signupSchema : loginSchema).safeParse(data);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    setPending(true);
    try {
      const authenticated = await signIn("password", {
        email: parsed.data.email,
        password: parsed.data.password,
        flow: setup ? "signUp" : "signIn",
        ...(setup ? { setupKey: String(data.setupKey ?? "").trim() } : {}),
      });
      if (authenticated.signingIn) {
        router.replace("/dashboard");
        router.refresh();
      } else setError("Sign-in could not be completed. Please try again.");
    } catch {
      setError(
        setup
          ? "Owner setup failed. Check your email, setup key, and password."
          : "Unable to sign in. Check your email and password.",
      );
    } finally {
      setPending(false);
    }
  }
  return (
    <form onSubmit={submit} className="space-y-4" aria-busy={pending}>
      <fieldset disabled={pending} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={setup ? 12 : undefined}
            maxLength={128}
            autoComplete={setup ? "new-password" : "current-password"}
            aria-describedby={error ? "login-error" : undefined}
            aria-invalid={Boolean(error)}
          />
        </div>
        {setup && (
          <>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                maxLength={128}
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="setupKey">Owner setup key</Label>
              <Input
                id="setupKey"
                name="setupKey"
                type="password"
                required
                autoComplete="off"
              />
            </div>
          </>
        )}
        <Button type="submit" disabled={pending}>
          {pending ? "Please wait…" : setup ? "Create owner account" : "Login"}
        </Button>
      </fieldset>
      {setupAvailable && (
        <button
          type="button"
          disabled={pending}
          className="text-sm underline"
          onClick={() => {
            setSetup(!setup);
            setError("");
          }}
        >
          {setup ? "Back to login" : "Set up owner account"}
        </button>
      )}
      <p
        id="login-error"
        aria-live="polite"
        aria-atomic="true"
        className="text-sm text-destructive"
      >
        {error}
      </p>
    </form>
  );
}
export default function Login({
  setupAvailable = false,
}: {
  setupAvailable?: boolean;
}) {
  return (
    <Card className="w-full md:max-w-lg">
      <CardHeader>
        <CardTitle>
          <h1 className="text-2xl">Dashboard login</h1>
        </CardTitle>
        <CardDescription>Sign in with your owner account.</CardDescription>
      </CardHeader>
      <CardContent>
        <OwnerLogin setupAvailable={setupAvailable} />
      </CardContent>
    </Card>
  );
}
