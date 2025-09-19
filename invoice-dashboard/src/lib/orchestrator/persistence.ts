"use server";

import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const isServer = typeof window === "undefined";

if (!isServer) {
  throw new Error(
    "The orchestrator file store can only be imported in a server environment."
  );
}

export type Updater<T> = (current: T | undefined) => T;

export interface PersistenceAdapter<T> {
  read(): Promise<T | undefined>;
  write(value: T): Promise<void>;
  update(updater: Updater<T>): Promise<T>;
  clear(): Promise<void>;
}

export function safeClone<T>(value: T): T {
  if (value === undefined || value === null) {
    return value;
  }

  if (typeof globalThis.structuredClone === "function") {
    return globalThis.structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value)) as T;
}

const DEFAULT_STORE_DIRECTORY = path.join(process.cwd(), "data", "orchestrator");
const DEFAULT_STORE_FILE = "store.json";

async function ensureDirectory(filePath: string) {
  await mkdir(path.dirname(filePath), { recursive: true });
}

async function readFromFile<T>(filePath: string): Promise<T | undefined> {
  try {
    const raw = await readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as T;
    return safeClone(parsed);
  } catch (error: unknown) {
    if (isMissingFileError(error)) {
      return undefined;
    }

    throw error;
  }
}

function isMissingFileError(error: unknown): error is NodeJS.ErrnoException {
  return Boolean(
    error &&
      typeof error === "object" &&
      "code" in error &&
      (error as NodeJS.ErrnoException).code === "ENOENT"
  );
}

export function createFileStore<T>(
  fileName = DEFAULT_STORE_FILE,
  { directory = DEFAULT_STORE_DIRECTORY, defaultValue }: {
    directory?: string;
    defaultValue?: T;
  } = {}
): PersistenceAdapter<T> {
  const resolvedPath = path.isAbsolute(fileName)
    ? fileName
    : path.join(directory, fileName);

  return {
    async read() {
      const value = await readFromFile<T>(resolvedPath);
      if (value !== undefined) {
        return value;
      }

      return defaultValue !== undefined ? safeClone(defaultValue) : undefined;
    },

    async write(value) {
      await ensureDirectory(resolvedPath);
      const cloned = safeClone(value);
      await writeFile(resolvedPath, JSON.stringify(cloned, null, 2), "utf8");
    },

    async update(updater) {
      const current = await this.read();
      const next = updater(current);
      await this.write(next);
      return next;
    },

    async clear() {
      await rm(resolvedPath, { force: true });
    },
  };
}

export type OrchestratorSnapshot = Record<string, unknown>;

export const orchestratorStore = createFileStore<OrchestratorSnapshot>(
  DEFAULT_STORE_FILE,
  {
    directory: DEFAULT_STORE_DIRECTORY,
    defaultValue: {},
  }
);

export async function loadOrchestratorSnapshot() {
  return orchestratorStore.read();
}

export async function saveOrchestratorSnapshot(snapshot: OrchestratorSnapshot) {
  await orchestratorStore.write(snapshot);
}

export async function updateOrchestratorSnapshot(
  updater: Updater<OrchestratorSnapshot>
) {
  return orchestratorStore.update(updater);
}

export async function clearOrchestratorSnapshot() {
  await orchestratorStore.clear();
}
