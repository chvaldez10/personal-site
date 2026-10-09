"use client";

import { useActionState } from "react";
import { logout } from "@/app/(main)/logout/actions";
import { Button } from "@/components/ui/buttons/button";

export default function SignOut() {
  const [state, action, pending] = useActionState(logout, {});
  return (
    <form action={action} className="space-y-2">
      <Button type="submit" disabled={pending}>
        {pending ? "Signing out…" : "Sign out"}
      </Button>
      <p aria-live="polite" className="text-sm text-destructive">
        {state.error}
      </p>
    </form>
  );
}
