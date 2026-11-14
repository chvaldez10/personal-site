import Link from "next/link";

export default function DashboardSessionStatus({
  loading,
}: {
  loading: boolean;
}) {
  return (
    <output className="block text-sm text-gray-700">
      {loading ? (
        "Connecting to your dashboard…"
      ) : (
        <>
          Your dashboard session is unavailable.{" "}
          <Link href="/login" className="underline">
            Sign in again
          </Link>
          .
        </>
      )}
    </output>
  );
}
