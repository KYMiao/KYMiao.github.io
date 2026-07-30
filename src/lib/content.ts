import type { CollectionEntry } from "astro:content";

type DatedEntry =
  | CollectionEntry<"publications">
  | CollectionEntry<"photography">
  | CollectionEntry<"blog">;

export function slugFor(entry: DatedEntry) {
  return entry.id
    .replace(/\/index(?:\.md|\.mdx)?$/, "")
    .replace(/\.(md|mdx)$/, "")
    .replace(/\/_index$/, "")
    .replace(/^_index$/, "");
}

export function byDateDesc<T extends DatedEntry>(entries: T[]) {
  return [...entries].sort((a, b) => {
    const aTime = a.data.date ? new Date(a.data.date).getTime() : 0;
    const bTime = b.data.date ? new Date(b.data.date).getTime() : 0;
    return bTime - aTime;
  });
}

export function visibleEntries<T extends DatedEntry>(entries: T[]) {
  return entries.filter((entry) => {
    const slug = slugFor(entry);
    return !entry.data.draft && slug && slug !== "_index";
  });
}

export function formatDate(date: Date | string | undefined, options: Intl.DateTimeFormatOptions = {}) {
  if (!date) return "";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    year: "numeric",
    ...options,
  }).format(new Date(date));
}

export function yearOf(date: Date | string | undefined) {
  return date ? new Date(date).getFullYear() : "";
}
