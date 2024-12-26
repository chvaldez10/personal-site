import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button, ButtonProps } from "./button";

interface PdfDialogButtonProps extends ButtonProps {
  pdfUrl: string;
}

const PdfDialogButton = React.forwardRef<
  HTMLButtonElement,
  PdfDialogButtonProps
>(({ pdfUrl, ...props }, ref) => {
  return (
    <Dialog>
      {/* Button Text */}
      <DialogTrigger asChild>
        <Button variant="outline" {...props} ref={ref}>
          Open PDF
        </Button>
      </DialogTrigger>

      {/* Dialogue Content */}
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>PDF Document</DialogTitle>
          <DialogDescription>View the PDF document below.</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <iframe src={pdfUrl} width="100%" height="400px" />
        </div>
      </DialogContent>
    </Dialog>
  );
});

PdfDialogButton.displayName = "PdfDialogButton";

export { PdfDialogButton };
