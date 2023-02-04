import { join } from 'node:path';

export const MONOREPO_ROOT        = join(__dirname, '..', '..', '..');
export const MONOREPO_CLIENT_PATH = join(MONOREPO_ROOT, 'packages', 'tetra-client2');
export const MONOREPO_SERVER_PATH = join(MONOREPO_ROOT, 'packages', 'tetra-server');

export const STATIC_PATH          = join(MONOREPO_CLIENT_PATH, 'dist');
export const VIEWS_PATH           = join(MONOREPO_SERVER_PATH, 'views');
export const CLIENT_MANIFEST_PATH = join(STATIC_PATH, 'manifest.json');
