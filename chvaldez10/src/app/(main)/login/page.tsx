import { Login } from "@/components/ui/forms";

import { fetchWaffleSwitch } from "@/actions/fetchWaffleSwitch";

export default async function Home() {
  const enableSignUp = await fetchWaffleSwitch("enable_signup");

  return (
    <div className="flex-items-center min-h-screen">
      <Login enableSignUp={enableSignUp?.is_active || false} />
    </div>
  );
}
