import { useMemo } from "react";
import { JournalEntry } from "../types";

export function useRecord(entries: JournalEntry[]) {
  const latestEntry = useMemo(() => entries[entries.length - 1], [entries]);
  return { latestEntry };
}
