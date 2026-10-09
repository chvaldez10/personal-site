"use client";

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
import { Button, type ButtonProps } from "./button";

interface PdfDialogButtonProps extends ButtonProps {
  pdfUrl?: string;
  label: string;
  description?: string;
}

const PdfDialogButton = React.forwardRef<
  HTMLButtonElement,
  PdfDialogButtonProps
>(({ pdfUrl, label, description, children, ...props }, ref) => (
  <Dialog>
    <DialogTrigger asChild>
      <Button {...props} ref={ref} aria-label={props["aria-label"] || label}>
        <FaFilePdf aria-hidden="true" />
        {children || <span className="sr-only">{label}</span>}
      </Button>
    </DialogTrigger>
    <DialogContent className="flex h-[85dvh] max-w-[800px] flex-col">
      <DialogHeader>
        <DialogTitle>{label}</DialogTitle>
        <DialogDescription>
          {description || "Preview the PDF or open it directly below."}
        </DialogDescription>
      </DialogHeader>
      {pdfUrl ? (
        <>
          <div className="flex flex-wrap gap-4">
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm underline"
            >
              Open {label} in a new tab
            </a>
            <a href={pdfUrl} download className="text-sm underline">
              Download {label}
            </a>
          </div>
          <iframe
            src={pdfUrl}
            title={label}
            className="min-h-0 w-full flex-1 border-0"
          />
        </>
      ) : (
        <p className="py-4 text-sm text-muted-foreground">No PDF available</p>
      )}
    </DialogContent>
  </Dialog>
));
PdfDialogButton.displayName = "PdfDialogButton";
export { PdfDialogButton };
