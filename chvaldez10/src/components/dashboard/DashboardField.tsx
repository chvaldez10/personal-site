import { useId, type ComponentProps } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { dashboardFieldClass } from "./formStyles";

export default function DashboardField({
  label,
  id,
  className,
  ...props
}: ComponentProps<typeof Input> & { label: string }) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  return (
    <div className="min-w-0">
      <Label htmlFor={fieldId}>{label}</Label>
      <Input
        {...props}
        id={fieldId}
        className={cn(dashboardFieldClass, "min-h-10", className)}
      />
    </div>
  );
}
