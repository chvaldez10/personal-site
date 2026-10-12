"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "@/components/ui/buttons/button";
export default function SignOut() {
  const { signOut } = useAuthActions();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  return (
    <div className="space-y-2">
      <Button
        type="button"
        disabled={pending}
        onClick={async () => {
          setPending(true);
          setError("");
          try {
            await signOut();
            router.replace("/login");
            router.refresh();
          } catch {
            setError("Unable to sign out. Please try again.");
            setPending(false);
          }
        }}
      >
        {pending ? "Signing out…" : "Sign out"}
      </Button>
      <p aria-live="polite" className="text-sm text-destructive">
        {error}
      </p>
    </div>
  );
}
