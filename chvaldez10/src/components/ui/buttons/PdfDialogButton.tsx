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
import { cn } from "@/lib/utils";

interface PdfDialogButtonProps extends ButtonProps {
  pdfUrl?: string;
  downloadUrl?: string;
  label: string;
  description?: string;
}

const PdfDialogButton = React.forwardRef<
  HTMLButtonElement,
  PdfDialogButtonProps
>(({ pdfUrl, downloadUrl, label, description, children, ...props }, ref) => {
  const [previewReady, setPreviewReady] = React.useState(false);

  return (
    <Dialog
      onOpenChange={(open) => {
        if (open) setPreviewReady(false);
      }}
    >
      <DialogTrigger asChild>
        <Button
          {...props}
          ref={ref}
          className={cn("cursor-pointer", props.className)}
          aria-label={props["aria-label"] || label}
        >
          <FaFilePdf aria-hidden="true" />
          {children || <span className="sr-only">{label}</span>}
        </Button>
      </DialogTrigger>
      <DialogContent
        disableDefaultAnimation
        overlayClassName="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 duration-200 motion-reduce:animate-none!"
        className="flex h-[85dvh] max-w-200 flex-col"
      >
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
              <a
                href={downloadUrl || pdfUrl}
                download
                className="text-sm underline"
              >
                Download {label}
              </a>
            </div>
            <div
              className="relative min-h-0 flex-1 overflow-hidden rounded-sm bg-[#fff8ed]"
              aria-busy={!previewReady}
            >
              {!previewReady && (
                <output className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-sm text-[#6f594b]">
                  <FaFilePdf
                    className="h-7 w-7 text-[#b65a3e]"
                    aria-hidden="true"
                  />
                  <span>Loading preview…</span>
                </output>
              )}
              <iframe
                src={pdfUrl}
                title={label}
                inert={!previewReady}
                onLoad={() => setPreviewReady(true)}
                className={`absolute inset-0 h-full w-full border-0 transition-opacity duration-200 motion-reduce:transition-none ${previewReady ? "opacity-100" : "opacity-0"}`}
              />
            </div>
          </>
        ) : (
          <p className="py-4 text-sm text-muted-foreground">No PDF available</p>
        )}
      </DialogContent>
    </Dialog>
  );
});
PdfDialogButton.displayName = "PdfDialogButton";
export { PdfDialogButton };
