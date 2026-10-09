import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import SignOut from "@/components/ui/forms/SignOut";

export default async function PrivatePage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) redirect("/login");
  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p>Hello {data.user.email}</p>
      <SignOut />
      <Link href="/" className="underline">
        Back to the site
      </Link>
    </section>
  );
}
