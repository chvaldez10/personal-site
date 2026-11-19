"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useId, useRef, useState } from "react";
import { Button } from "@/components/ui/buttons/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import LogoImage from "@/components/ui/LogoImage";
import { publicWebUrl } from "@/lib/links";
import type { BrandLogo } from "@/types/media";
import ToolShelf from "./ToolShelf";
import styles from "./studio.module.css";

const batchSize = 12;

export default function ToolDrawer({ logos }: { logos: BrandLogo[] }) {
  const searchId = useId();
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(batchSize);
  const [playing, setPlaying] = useState(true);
  const [selected, setSelected] = useState<BrandLogo | null>(null);
  const [open, setOpen] = useState(false);
  const lastTrigger = useRef<HTMLButtonElement | null>(null);

  const query = search.trim().toLowerCase();
  const matches = query
    ? logos.filter((logo) =>
        [logo.label, logo.alt, logo.description].some((value) =>
          value?.toLowerCase().includes(query),
        ),
      )
    : logos;
  const referralLink = publicWebUrl(selected?.referral_link);

  const tools = matches.length ? (
    <ul className={styles.tools}>
      {matches.slice(0, limit).map((logo) => {
        const label = logo.label || logo.alt;
        return (
          <li key={logo.id}>
            <Button
              type="button"
              variant="ghost"
              aria-haspopup="dialog"
              aria-label={`Details about ${label}`}
              className={styles.tool}
              onClick={(event) => {
                lastTrigger.current = event.currentTarget;
                setSelected(logo);
                setOpen(true);
              }}
            >
              <span className={styles.toolIcon} aria-hidden="true">
                <LogoImage src={logo.src} alt={logo.alt} size={40} />
              </span>
              <span>{label}</span>
            </Button>
          </li>
        );
      })}
    </ul>
  ) : (
    <p className={styles.empty}>No tools match your search.</p>
  );
  const more = matches.length > limit && (
    <Button
      type="button"
      variant="outline"
      className={styles.moreTools}
      onClick={() => setLimit((current) => current + batchSize)}
    >
      Show more tools
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className={styles.drawer}>
        <div className={styles.drawerHeader}>
          <label className={styles.search} htmlFor={searchId}>
            <Search size={17} aria-hidden="true" />
            <span className="sr-only">Find a tool</span>
            <Input
              id={searchId}
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setLimit(batchSize);
              }}
              placeholder="Find a tool"
            />
          </label>
          <output className={styles.drawerCount}>
            {matches.length} {matches.length === 1 ? "tool" : "tools"}
          </output>
        </div>
        {query ? (
          <>
            {tools}
            {more}
          </>
        ) : (
          <ToolShelf
            more={more}
            paused={open}
            playing={playing}
            onPlayingChange={setPlaying}
          >
            {tools}
          </ToolShelf>
        )}
      </div>
      {selected && (
        <DialogContent
          className="max-w-sm rounded-2xl border-orange-200 bg-[#fffaf3]"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            lastTrigger.current?.focus({ preventScroll: true });
          }}
        >
          <DialogHeader className="text-left">
            <LogoImage src={selected.src} alt={selected.alt} size={44} />
            <DialogTitle className="pt-3">
              {selected.label || selected.alt}
            </DialogTitle>
            <DialogDescription className="leading-relaxed text-[#634d43]">
              {selected.description}
            </DialogDescription>
          </DialogHeader>
          {referralLink && (
            <Link
              href={referralLink}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.textLink}
            >
              Visit the site <span aria-hidden="true">↗</span>
            </Link>
          )}
        </DialogContent>
      )}
    </Dialog>
  );
}
