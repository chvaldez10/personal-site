import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { safeNextPath } from "@/lib/validation/auth";

const otpTypes: EmailOtpType[] = [
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  let verified = false;
  if (
    process.env.SITE_DEMO_MODE !== "true" &&
    token_hash &&
    type &&
    otpTypes.includes(type as EmailOtpType)
  ) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.verifyOtp({
        type: type as EmailOtpType,
        token_hash,
      });
      verified = !error;
    } catch {
      verified = false;
    }
  }
  if (verified) redirect(safeNextPath(searchParams.get("next")));
  redirect("/login?confirmation=failed");
}
