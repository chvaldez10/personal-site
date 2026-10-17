import type { FunctionReturnType } from "convex/server";
import type { api } from "@convex/_generated/api";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import LogoImage from "@/components/ui/LogoImage";

type Logos = FunctionReturnType<typeof api.brandLogos.listForAdmin>;

export default function LogoList({ logos }: { logos: Logos | undefined }) {
  return (
    <Card className="border-orange-200 bg-white text-gray-950">
      <CardHeader>
        <h2 className="text-xl font-semibold">Current logos</h2>
      </CardHeader>
      <CardContent>
        {logos === undefined ? (
          <p>Loading logos…</p>
        ) : logos.length === 0 ? (
          <p>No logos yet.</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {logos.map((logo) => (
              <li
                key={logo.id}
                className="flex items-center gap-3 rounded-md border border-orange-200 bg-[#fffbf5] p-3"
              >
                <LogoImage src={logo.src} alt={logo.alt} />
                <div>
                  <p className="font-medium">{logo.label || logo.alt}</p>
                  <p className="text-sm text-gray-700">{logo.description}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
