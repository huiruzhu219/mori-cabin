import { JournalEntry } from "../types";

export interface RecordStoreState {
  records: JournalEntry[];
}

export const initialRecordStore: RecordStoreState = {
  records: [],
};
