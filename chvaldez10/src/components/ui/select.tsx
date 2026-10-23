"use client";

/* eslint-disable jsx-a11y/prefer-tag-over-role, jsx-a11y/no-noninteractive-element-to-interactive-role, jsx-a11y/click-events-have-key-events -- This select uses a combobox with a listbox. Keyboard interaction stays on the trigger. */

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

type SelectOption = { value: string; label: string };

type SelectProps = {
  id: string;
  value: string;
  onValueChange: (value: string) => void;
  options: readonly SelectOption[];
  placeholder?: string;
  name?: string;
  disabled?: boolean;
  className?: string;
  wrapperClassName?: string;
  "aria-describedby"?: string;
  "aria-labelledby"?: string;
  "aria-label"?: string;
};

function Select({
  id,
  value,
  onValueChange,
  options,
  placeholder = "Select an option",
  name,
  disabled,
  className,
  wrapperClassName,
  ...ariaProps
}: SelectProps) {
  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const listboxId = React.useId();
  const selectedIndex = options.findIndex((option) => option.value === value);

  React.useEffect(() => {
    if (!open) return;

    function closeOutside(event: Event) {
      if (
        event.target instanceof Node &&
        !wrapperRef.current?.contains(event.target)
      )
        setOpen(false);
    }

    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("focusin", closeOutside);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("focusin", closeOutside);
    };
  }, [open]);

  React.useEffect(() => {
    if (!open || activeIndex < 0) return;
    document
      .getElementById(`${listboxId}-option-${activeIndex}`)
      ?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, listboxId, open]);

  function openMenu(index = selectedIndex) {
    setActiveIndex(index >= 0 ? index : 0);
    setOpen(true);
  }

  function selectOption(index: number) {
    const option = options[index];
    if (!option) return;
    onValueChange(option.value);
    setOpen(false);
    triggerRef.current?.focus();
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "Escape") {
      if (open) {
        event.preventDefault();
        setOpen(false);
      }
      return;
    }

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        openMenu(
          event.key === "ArrowDown"
            ? selectedIndex
            : selectedIndex >= 0
              ? selectedIndex
              : options.length - 1,
        );
      } else {
        setActiveIndex(
          (index) =>
            (index + (event.key === "ArrowDown" ? 1 : -1) + options.length) %
            options.length,
        );
      }
      return;
    }

    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      openMenu(event.key === "Home" ? 0 : options.length - 1);
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (open) selectOption(activeIndex);
      else openMenu();
      return;
    }

    if (event.key === "Tab") {
      setOpen(false);
      return;
    }

    if (
      event.key.length === 1 &&
      !event.altKey &&
      !event.ctrlKey &&
      !event.metaKey
    ) {
      const startsWithKey = (option: SelectOption) =>
        option.label.toLowerCase().startsWith(event.key.toLowerCase());
      const currentIndex = open ? activeIndex : selectedIndex;
      const nextMatch = options.findIndex(
        (option, index) => index > currentIndex && startsWithKey(option),
      );
      const match =
        nextMatch >= 0 ? nextMatch : options.findIndex(startsWithKey);
      if (match >= 0) {
        event.preventDefault();
        openMenu(match);
      }
    }
  }

  return (
    <div ref={wrapperRef} className={cn("relative w-full", wrapperClassName)}>
      {name && <input type="hidden" name={name} value={value} />}
      <button
        id={id}
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-controls={open ? listboxId : undefined}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-activedescendant={
          open && activeIndex >= 0
            ? `${listboxId}-option-${activeIndex}`
            : undefined
        }
        disabled={disabled || options.length === 0}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={onKeyDown}
        className={cn(
          "flex h-12 w-full cursor-pointer items-center rounded-xl border border-orange-200 bg-white px-4 pr-14 text-left text-base font-medium text-gray-900 shadow-sm transition-[border-color,box-shadow] hover:border-orange-400 hover:shadow-md focus-visible:border-orange-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none",
          className,
        )}
        {...ariaProps}
      >
        {selectedIndex >= 0 ? options[selectedIndex].label : placeholder}
      </button>
      <ChevronDown
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute top-2 right-2 size-8 rounded-lg border border-orange-200 bg-orange-50 p-2 text-orange-700 transition-colors",
          open && "border-orange-300 bg-orange-100",
        )}
      />
      {open && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute top-full z-30 mt-2 max-h-60 w-full overflow-auto rounded-2xl border border-orange-200 bg-white p-1.5 shadow-xl shadow-orange-900/10"
        >
          {options.map((option, index) => (
            <li
              id={`${listboxId}-option-${index}`}
              key={option.value}
              role="option"
              aria-selected={option.value === value}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => selectOption(index)}
              className={cn(
                "flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-800",
                index === activeIndex && "bg-orange-50 text-orange-900",
                option.value === value &&
                  "bg-orange-100/70 font-semibold text-orange-900",
              )}
            >
              <span>{option.label}</span>
              {option.value === value && (
                <Check
                  aria-hidden="true"
                  className="size-4 shrink-0 text-pink-700"
                />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export { Select };

/* eslint-enable jsx-a11y/prefer-tag-over-role, jsx-a11y/no-noninteractive-element-to-interactive-role, jsx-a11y/click-events-have-key-events */
