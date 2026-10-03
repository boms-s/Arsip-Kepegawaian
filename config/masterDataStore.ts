"use client";

import { useSyncExternalStore } from "react";
import { DUMMY_DOCUMENT_CATEGORIES, DUMMY_DOCUMENT_TYPES, type DocumentCategory, type DocumentType } from "@/config/dummyMasterData";

export interface MasterDataDatabase {
  categories: DocumentCategory[];
  types: DocumentType[];
}

const STORAGE_KEY = "siarsip.master-data.v1";
const CHANGE_EVENT = "siarsip-master-data-change";
const DEFAULT_DATABASE: MasterDataDatabase = { categories: DUMMY_DOCUMENT_CATEGORIES, types: DUMMY_DOCUMENT_TYPES };
const DEFAULT_SNAPSHOT = JSON.stringify(DEFAULT_DATABASE);

function getSnapshot() {
  if (typeof window === "undefined") return DEFAULT_SNAPSHOT;
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? DEFAULT_SNAPSHOT;
  } catch {
    return DEFAULT_SNAPSHOT;
  }
}

function subscribe(onChange: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function saveMasterData(database: MasterDataDatabase) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(database));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function useMasterData() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, () => DEFAULT_SNAPSHOT);
  try {
    const data = JSON.parse(snapshot) as Partial<MasterDataDatabase>;
    return {
      categories: Array.isArray(data.categories) ? data.categories : DUMMY_DOCUMENT_CATEGORIES,
      types: Array.isArray(data.types) ? data.types : DUMMY_DOCUMENT_TYPES,
    };
  } catch {
    return DEFAULT_DATABASE;
  }
}