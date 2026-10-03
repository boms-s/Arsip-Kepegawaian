"use client";

import { useSyncExternalStore } from "react";
import { DUMMY_ARCHIVES } from "@/config/dummyArchives";

export type ArchiveStatus = "ACTIVE" | "INACTIVE";
export type ArchiveAction = "create" | "update" | "delete" | "download";

export interface ArchiveHistoryEntry {
  id: string;
  action: ArchiveAction;
  actor: string;
  description: string;
  timestamp: string;
  archiveId?: string;
  archiveNumber?: string;
}

export interface ArchiveRecord {
  id: string;
  number: string;
  title: string;
  categoryId: string;
  typeId: string;
  employeeId: string;
  archivedAt: string;
  status: ArchiveStatus;
  description: string;
  fileName: string;
  fileSize: number;
  history: ArchiveHistoryEntry[];
}

export interface ArchiveDatabase {
  records: ArchiveRecord[];
  audit: ArchiveHistoryEntry[];
}

const STORAGE_KEY = "siarsip.archive-store.v1";
const CHANGE_EVENT = "siarsip-archive-store-change";
const EMPTY_DATABASE: ArchiveDatabase = { records: DUMMY_ARCHIVES, audit: [] };
const EMPTY_SNAPSHOT = JSON.stringify(EMPTY_DATABASE);

export function getArchiveSnapshot(): string {
  if (typeof window === "undefined") return EMPTY_SNAPSHOT;
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? EMPTY_SNAPSHOT;
  } catch {
    return EMPTY_SNAPSHOT;
  }
}

export function subscribeToArchiveStore(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function saveArchiveDatabase(database: ArchiveDatabase): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(database));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function useArchiveDatabase(): ArchiveDatabase {
  const snapshot = useSyncExternalStore(subscribeToArchiveStore, getArchiveSnapshot, () => EMPTY_SNAPSHOT);
  try {
    const parsed = JSON.parse(snapshot) as Partial<ArchiveDatabase>;
    return {
      records: Array.isArray(parsed.records) ? parsed.records : DUMMY_ARCHIVES,
      audit: Array.isArray(parsed.audit) ? parsed.audit : [],
    };
  } catch {
    return EMPTY_DATABASE;
  }
}

function openFileDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("siarsip-archive-files", 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains("files")) request.result.createObjectStore("files");
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveArchiveFile(id: string, file: File): Promise<void> {
  const database = await openFileDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction("files", "readwrite");
    transaction.objectStore("files").put(file, id);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  database.close();
}

export async function getArchiveFile(id: string): Promise<Blob | undefined> {
  const database = await openFileDatabase();
  const file = await new Promise<Blob | undefined>((resolve, reject) => {
    const request = database.transaction("files", "readonly").objectStore("files").get(id);
    request.onsuccess = () => resolve(request.result as Blob | undefined);
    request.onerror = () => reject(request.error);
  });
  database.close();
  return file;
}

export async function deleteArchiveFile(id: string): Promise<void> {
  const database = await openFileDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction("files", "readwrite");
    transaction.objectStore("files").delete(id);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  database.close();
}