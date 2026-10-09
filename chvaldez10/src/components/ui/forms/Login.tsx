"use client";

import { useActionState, useState } from "react";
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
import { login, signup } from "@/app/(main)/login/actions";
import type { AuthState } from "@/lib/validation/auth";

function AuthForm({ isLogin }: { isLogin: boolean }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    isLogin ? login : signup,
    {},
  );
  return (
    <form action={action} className="space-y-4" aria-busy={pending}>
      <fieldset disabled={pending} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            aria-invalid={Boolean(state.fieldErrors?.email)}
            aria-describedby="email-error"
          />
          <p id="email-error" className="text-sm text-destructive">
            {state.fieldErrors?.email?.[0]}
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={isLogin ? undefined : 8}
            autoComplete={isLogin ? "current-password" : "new-password"}
            aria-invalid={Boolean(state.fieldErrors?.password)}
            aria-describedby="password-error"
          />
          <p id="password-error" className="text-sm text-destructive">
            {state.fieldErrors?.password?.[0]}
          </p>
        </div>
        {!isLogin && (
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              autoComplete="new-password"
              aria-invalid={Boolean(state.fieldErrors?.confirmPassword)}
              aria-describedby="confirm-error"
            />
            <p id="confirm-error" className="text-sm text-destructive">
              {state.fieldErrors?.confirmPassword?.[0]}
            </p>
          </div>
        )}
        <Button type="submit" className="bg-sky-600" disabled={pending}>
          {pending ? "Please wait…" : isLogin ? "Login" : "Sign Up"}
        </Button>
      </fieldset>
      <div aria-live="polite" aria-atomic="true">
        {state.error && (
          <p className="text-sm text-destructive">{state.error}</p>
        )}
        {state.message && <p className="text-sm">{state.message}</p>}
      </div>
    </form>
  );
}

export default function Login({
  enableSignUp = false,
}: {
  enableSignUp?: boolean;
}) {
  const [isLogin, setIsLogin] = useState(true);
  return (
    <Card className="flex w-full flex-col justify-center md:max-w-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">
          {isLogin ? "Welcome Back!" : "Join the Party!"}
        </CardTitle>
        <CardDescription>
          {isLogin ? "Sign in to your account." : "Create your account."}{" "}
          {enableSignUp && (
            <button
              type="button"
              className="text-pink-600 underline focus-visible:outline-2"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "Sign Up" : "Login"}
            </button>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AuthForm key={isLogin ? "login" : "signup"} isLogin={isLogin} />
      </CardContent>
    </Card>
  );
}
