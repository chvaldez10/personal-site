import type { ComponentProps, ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

export default function WorkoutSelectField({
  id,
  label,
  children,
  ...props
}: Omit<
  ComponentProps<typeof Select>,
  "wrapperClassName" | "aria-labelledby"
> & {
  label: string;
  children?: ReactNode;
}) {
  const labelId = `${id}-label`;
  return (
    <div>
      <Label id={labelId} htmlFor={id} className="text-gray-800">
        {label}
      </Label>
      <Select
        {...props}
        id={id}
        aria-labelledby={labelId}
        wrapperClassName="mt-2"
      />
      {children}
    </div>
  );
}
