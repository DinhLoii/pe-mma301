import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
if (!process.env.npm_execpath) throw new Error('Run this script with npm run setup:eas-env');
const npxCli = join(dirname(process.env.npm_execpath), 'npx-cli.js');
const environment = process.argv[2] || 'preview';
const entries = readFileSync('.env', 'utf8').split(/\r?\n/).filter(line => /^EXPO_PUBLIC_[A-Z_]+=.+/.test(line));
for (const line of entries) {
  const i = line.indexOf('='); const name = line.slice(0, i); const value = line.slice(i + 1).trim().replace(/^['"]|['"]$/g, '');
  // Values stay out of source control; these are public Firebase client settings, never admin credentials.
  const result = spawnSync(process.execPath, [npxCli, '--yes', 'eas-cli@27.1.0', 'env:create', '--environment', environment, '--name', name, '--value', value, '--visibility', 'sensitive', '--non-interactive', '--force'], { stdio: ['ignore', 'pipe', 'pipe'] });
  if (result.status) { console.error(`Could not sync ${name}. Run npx eas env:create manually.`); process.exit(result.status || 1); }
  console.log(`Synced ${name} to ${environment}`);
}
