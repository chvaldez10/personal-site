import { Login } from "@/components/ui/forms";
import { fetchWaffleSwitch } from "@/actions/fetchWaffleSwitch";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ confirmation?: string }>;
}) {
  const enableSignUp = await fetchWaffleSwitch("enable_signup");
  const params = await searchParams;
  return (
    <section className="flex-items-center min-h-screen gap-4 px-4 pt-24 pb-12">
      {params.confirmation === "failed" && (
        <p
          role="alert"
          className="max-w-lg text-center text-sm text-destructive"
        >
          That confirmation link is invalid or expired. Request a new email and
          try again.
        </p>
      )}
      {process.env.SITE_DEMO_MODE === "true" && (
        <p className="text-sm text-muted-foreground">
          This is a demo. Authentication is disabled.
        </p>
      )}
      <Login enableSignUp={enableSignUp?.is_active ?? false} />
    </section>
  );
}
