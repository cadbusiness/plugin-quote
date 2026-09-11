import { compareSemver } from "./semver";

export type Versioned = { version: string };

export function sortByVersionDesc<T extends Versioned>(entries: T[]): T[] {
  return [...entries].sort((a, b) => compareSemver(b.version, a.version));
}

export function latestVersion(entries: Versioned[]): string | null {
  const [first] = sortByVersionDesc(entries);
  return first?.version ?? null;
}

export function isUnreadVersion(version: string, lastSeenVersion: string | null): boolean {
  if (!lastSeenVersion) return true;
  return compareSemver(version, lastSeenVersion) > 0;
}

export function unreadCount(entries: Versioned[], lastSeenVersion: string | null): number {
  return entries.filter((entry) => isUnreadVersion(entry.version, lastSeenVersion)).length;
}
