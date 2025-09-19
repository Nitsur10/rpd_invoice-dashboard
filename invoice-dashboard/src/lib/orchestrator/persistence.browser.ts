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

const memoryStore = new Map<string, unknown>();
const DEFAULT_KEY = "orchestrator";

export function createMemoryStore<T>(
  key = DEFAULT_KEY,
  { defaultValue }: { defaultValue?: T } = {}
): PersistenceAdapter<T> {
  return {
    async read() {
      if (memoryStore.has(key)) {
        return safeClone(memoryStore.get(key) as T);
      }

      return defaultValue !== undefined ? safeClone(defaultValue) : undefined;
    },

    async write(value) {
      memoryStore.set(key, safeClone(value));
    },

    async update(updater) {
      const current = await this.read();
      const next = updater(current);
      await this.write(next);
      return next;
    },

    async clear() {
      memoryStore.delete(key);
    },
  };
}

export type OrchestratorSnapshot = Record<string, unknown>;

export const orchestratorStore = createMemoryStore<OrchestratorSnapshot>(
  DEFAULT_KEY,
  { defaultValue: {} }
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
