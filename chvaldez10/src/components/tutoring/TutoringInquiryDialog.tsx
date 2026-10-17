"use client";

import { useState, type FormEvent } from "react";
import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { api } from "@convex/_generated/api";
import { ArrowRight } from "lucide-react";
import BrandedButton from "@/components/ui/buttons/BrandedButton";
import { Button } from "@/components/ui/buttons/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import styles from "./TutoringInquiryDialog.module.css";

const fieldClass =
  "mt-2 min-h-11 border-orange-200 bg-white text-gray-950 focus-visible:ring-orange-500";

export default function TutoringInquiryDialog({
  label,
  variant = "default",
}: {
  label: string;
  variant?: "default" | "outline";
}) {
  const submit = useMutation(api.tutoringInquiries.submit);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const subjectValue = data.get("subject");
    const subject =
      subjectValue === "science" || subjectValue === "both"
        ? subjectValue
        : "math";
    setPending(true);
    setError("");
    try {
      await submit({
        contactName: String(data.get("contactName") ?? ""),
        email: String(data.get("email") ?? ""),
        grade: Number(data.get("grade")),
        subject,
        message: String(data.get("message") ?? ""),
        website: String(data.get("website") ?? ""),
      });
      form.reset();
      setSent(true);
    } catch (error) {
      setError(
        error instanceof ConvexError && typeof error.data === "string"
          ? error.data
          : "Your inquiry could not be sent. Please try again.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value);
        if (!value) {
          setSent(false);
          setError("");
        }
      }}
    >
      <DialogTrigger asChild>
        {variant === "outline" ? (
          <Button
            type="button"
            size="lg"
            variant="outline"
            className="min-h-12 rounded-xl border-orange-700 bg-white px-7 text-base font-semibold text-orange-800 hover:bg-orange-50 hover:text-orange-900 focus-visible:ring-2 focus-visible:ring-orange-700 focus-visible:ring-offset-2"
          >
            {label}
            <ArrowRight aria-hidden="true" />
          </Button>
        ) : (
          <BrandedButton type="button">{label}</BrandedButton>
        )}
      </DialogTrigger>
      <DialogContent
        disableDefaultAnimation
        overlayClassName={`bg-gray-950/45 ${styles.overlay}`}
        className={`max-h-[90dvh] w-[calc(100%-2rem)] max-w-xl overflow-y-auto rounded-2xl border-orange-200 bg-[#fffaf4] p-6 text-gray-950 sm:p-8 ${styles.content}`}
      >
        <DialogHeader className="pr-6 text-left">
          <p className="text-xs font-bold tracking-[0.18em] text-orange-700 uppercase">
            Grades 7–12 · Math + science
          </p>
          <DialogTitle className="text-2xl font-bold tracking-tight sm:text-3xl">
            Ask about tutoring
          </DialogTitle>
          <DialogDescription className="pt-1 text-base leading-6 text-gray-700">
            Tell me a little about what the student is working on. I&apos;ll
            reply by email to discuss the next step.
          </DialogDescription>
        </DialogHeader>
        {sent ? (
          <output className="block space-y-5 py-3">
            <p className="rounded-xl border border-orange-200 bg-white p-5 text-gray-800">
              Thanks for reaching out. Your inquiry has been sent.
            </p>
            <Button type="button" onClick={() => setOpen(false)}>
              Done
            </Button>
          </output>
        ) : (
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="tutor-name">Your name</Label>
              <Input
                id="tutor-name"
                name="contactName"
                autoComplete="name"
                required
                minLength={2}
                maxLength={100}
                className={fieldClass}
              />
            </div>
            <div>
              <Label htmlFor="tutor-email">Your email</Label>
              <Input
                id="tutor-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                maxLength={254}
                className={fieldClass}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="tutor-grade">Student&apos;s grade</Label>
                <select
                  id="tutor-grade"
                  name="grade"
                  required
                  defaultValue=""
                  className={`w-full rounded-md border px-3 text-sm ${fieldClass}`}
                >
                  <option value="" disabled>
                    Select grade
                  </option>
                  {[7, 8, 9, 10, 11, 12].map((grade) => (
                    <option key={grade} value={grade}>
                      Grade {grade}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="tutor-subject">Subject</Label>
                <select
                  id="tutor-subject"
                  name="subject"
                  required
                  defaultValue=""
                  className={`w-full rounded-md border px-3 text-sm ${fieldClass}`}
                >
                  <option value="" disabled>
                    Select subject
                  </option>
                  <option value="math">Math</option>
                  <option value="science">Science</option>
                  <option value="both">Math and science</option>
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="tutor-message">
                What does the student need help with?
              </Label>
              <textarea
                id="tutor-message"
                name="message"
                required
                minLength={10}
                maxLength={1000}
                rows={4}
                placeholder="Share the topic or question they are working on."
                className={`w-full rounded-md border px-3 py-2 text-sm placeholder:text-gray-500 ${fieldClass}`}
              />
            </div>
            <div className="absolute left-[-10000px]" aria-hidden="true">
              <label htmlFor="tutor-website">Website</label>
              <input
                id="tutor-website"
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
              />
            </div>
            {error && (
              <p role="alert" className="text-sm text-red-700">
                {error}
              </p>
            )}
            <Button
              type="submit"
              disabled={pending}
              className="min-h-11 bg-orange-700 text-white hover:bg-orange-800"
            >
              {pending ? "Sending…" : "Send inquiry"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
