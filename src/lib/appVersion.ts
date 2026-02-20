import { readFileSync } from 'node:fs';
import { join } from 'node:path';

type PackageJson = {
  version?: string;
};

export function getAppVersion(): string {
  try {
    const raw = readFileSync(join(process.cwd(), 'package.json'), 'utf8');
    const pkg = JSON.parse(raw) as PackageJson;

    if (!pkg.version) return 'v0.0.0';
    return `v${pkg.version}`;
  } catch {
    return 'v0.0.0';
  }
}