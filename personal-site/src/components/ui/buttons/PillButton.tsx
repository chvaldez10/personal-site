import * as React from "react";
import { ButtonProps, Button } from "./button";

const PillButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, ...props }, ref) => {
    return (
      <Button className={`rounded-full ${className}`} ref={ref} {...props} />
    );
  }
);
PillButton.displayName = "PillButton";

export { PillButton };
