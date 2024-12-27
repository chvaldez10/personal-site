import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { FaFilePdf } from "react-icons/fa";

import { Button, ButtonProps } from "./button";

interface PdfDialogButtonProps extends ButtonProps {
  pdfUrl?: string;
  label: string;
  description?: string;
}

const PdfDialogButton = React.forwardRef<
  HTMLButtonElement,
  PdfDialogButtonProps
>(({ pdfUrl, label, description, ...props }, ref) => {
  return (
    <Dialog>
      {/* Button Text */}
      <DialogTrigger asChild>
        <Button {...props} ref={ref}>
          <FaFilePdf />
          {props.children}
        </Button>
      </DialogTrigger>

      {/* Dialogue Content */}
      <DialogContent className="max-w-[800px] h-screen md:h-[80vh] flex flex-col transition-all duration-300">
        <DialogHeader>
          <DialogTitle>{label}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="flex-1 py-4">
          {pdfUrl ? (
            <iframe
              src={pdfUrl}
              width="100%"
              height="100%"
              style={{ border: "none" }}
            />
          ) : (
            <div className="flex-1 flex justify-center items-center h-full">
              <p className="text-sm text-gray-500">No PDF available</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
});

PdfDialogButton.displayName = "PdfDialogButton";

export { PdfDialogButton };
