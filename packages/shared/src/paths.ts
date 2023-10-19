import { join, resolve } from 'node:path';

export const MONOREPO_ROOT = resolve('..', '..');
export const SERVER_DIR    = join(MONOREPO_ROOT, 'apps', 'server');
export const PUBLIC_DIR    = join(SERVER_DIR, 'public');
export const DOTENV_PATH   = join(SERVER_DIR, '.env');

export default { MONOREPO_ROOT, SERVER_DIR, PUBLIC_DIR, DOTENV_PATH };
