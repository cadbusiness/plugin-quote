const SEMVER = /^([0-9]+)\.([0-9]+)\.([0-9]+)$/;

export type Semver = {
  major: number;
  minor: number;
  patch: number;
};

export function isSemver(value: string): boolean {
  return SEMVER.test(value);
}

export function parseSemver(value: string): Semver | null {
  const match = SEMVER.exec(value.trim());
  if (!match) return null;
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
  };
}

/** Negative if a < b, 0 if equal, positive if a > b. Invalid versions sort last. */
export function compareSemver(a: string, b: string): number {
  const left = parseSemver(a);
  const right = parseSemver(b);
  if (!left && !right) return 0;
  if (!left) return -1;
  if (!right) return 1;
  if (left.major !== right.major) return left.major - right.major;
  if (left.minor !== right.minor) return left.minor - right.minor;
  return left.patch - right.patch;
}

/** `1.8.0` → `1.8`; keep the patch when it is not zero. */
export function releaseLabel(version: string): string {
  const parsed = parseSemver(version);
  if (!parsed) return version;
  if (parsed.patch === 0) return `${parsed.major}.${parsed.minor}`;
  return version;
}
