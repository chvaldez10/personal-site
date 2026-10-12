import { Login } from "@/components/ui/forms";
import { fetchQuery } from "convex/nextjs";
import { api } from "@convex/_generated/api";

export default async function LoginPage() {
  const setupAvailable = await fetchQuery(api.admin.setupAvailable, {});
  return (
    <section className="flex-items-center min-h-screen gap-4 px-4 pt-24 pb-12">
      <Login setupAvailable={setupAvailable} />
    </section>
  );
}
