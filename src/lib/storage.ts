/**
 * Persistent storage using Dexie (IndexedDB) for APK Builder data.
 * Stores GitHub token, AI config, app config, and build history.
 */
import Dexie, { type EntityTable } from 'dexie';

export interface StoredConfig {
  id: string;
  value: string;
}

export interface BuildHistory {
  id?: number;
  repoUrl: string;
  repoOwner: string;
  repoName: string;
  appName: string;
  appId: string;
  status: 'success' | 'error' | 'pending';
  timestamp: Date;
  downloadUrl?: string;
  errorMessage?: string;
}

class AppDatabase extends Dexie {
  configs!: EntityTable<StoredConfig, 'id'>;
  buildHistory!: EntityTable<BuildHistory, 'id'>;

  constructor() {
    super('ApkBuilderDB');
    this.version(1).stores({
      configs: 'id',
      buildHistory: '++id, timestamp, repoUrl',
    });
  }
}

const db = new AppDatabase();

// Simple obfuscation for sensitive data (not encryption, but prevents casual viewing)
const obfuscate = (val: string) => btoa(unescape(encodeURIComponent(val)));
const deobfuscate = (val: string) => {
  try { return decodeURIComponent(escape(atob(val))); }
  catch { return ''; }
};

// Config keys
const KEYS = {
  GITHUB_TOKEN: 'github_token',
  GITHUB_USERNAME: 'github_username',
  AI_CONFIG: 'ai_config',
  APP_CONFIG: 'app_config',
  LAST_REPO: 'last_repo',
  THEME: 'theme',
} as const;

// ── GitHub Token ──
export async function saveGitHubToken(token: string, username: string) {
  await db.configs.bulkPut([
    { id: KEYS.GITHUB_TOKEN, value: obfuscate(token) },
    { id: KEYS.GITHUB_USERNAME, value: username },
  ]);
}

export async function loadGitHubToken(): Promise<{ token: string; username: string } | null> {
  const [tokenRow, usernameRow] = await Promise.all([
    db.configs.get(KEYS.GITHUB_TOKEN),
    db.configs.get(KEYS.GITHUB_USERNAME),
  ]);
  if (!tokenRow?.value) return null;
  return { token: deobfuscate(tokenRow.value), username: usernameRow?.value || '' };
}

export async function clearGitHubToken() {
  await db.configs.bulkDelete([KEYS.GITHUB_TOKEN, KEYS.GITHUB_USERNAME]);
}

// ── AI Config ──
export async function saveAIConfig(config: object) {
  await db.configs.put({ id: KEYS.AI_CONFIG, value: obfuscate(JSON.stringify(config)) });
}

export async function loadAIConfig(): Promise<object | null> {
  const row = await db.configs.get(KEYS.AI_CONFIG);
  if (!row?.value) return null;
  try { return JSON.parse(deobfuscate(row.value)); }
  catch { return null; }
}

// ── App Config ──
export async function saveAppConfig(config: object) {
  await db.configs.put({ id: KEYS.APP_CONFIG, value: JSON.stringify(config) });
}

export async function loadAppConfig(): Promise<object | null> {
  const row = await db.configs.get(KEYS.APP_CONFIG);
  if (!row?.value) return null;
  try { return JSON.parse(row.value); }
  catch { return null; }
}

// ── Last Repo ──
export async function saveLastRepo(repoUrl: string) {
  await db.configs.put({ id: KEYS.LAST_REPO, value: repoUrl });
}

export async function loadLastRepo(): Promise<string | null> {
  const row = await db.configs.get(KEYS.LAST_REPO);
  return row?.value || null;
}

// ── Build History ──
export async function addBuildHistory(entry: Omit<BuildHistory, 'id'>) {
  return db.buildHistory.add(entry);
}

export async function getBuildHistory(limit = 20): Promise<BuildHistory[]> {
  return db.buildHistory.orderBy('timestamp').reverse().limit(limit).toArray();
}

export async function clearAllData() {
  await Promise.all([db.configs.clear(), db.buildHistory.clear()]);
}

export { db };
