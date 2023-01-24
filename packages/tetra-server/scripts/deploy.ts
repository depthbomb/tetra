import { join }                                   from 'node:path';
import externals                                  from './externals';
import { cwd }                                    from 'node:process';
// @ts-ignore-next-line
import { dependencies }                           from '../package.json';
import { cp, access, mkdir, readFile, writeFile } from 'node:fs/promises';

console.clear();

const distPath   = join(cwd(), 'dist');
const deployPath = join(cwd(), 'deploy');

async function checkDeployPath(): Promise<void> {
    try {
        await access(deployPath);
    } catch {
        await mkdir(deployPath);
    }
}

async function copyFiles(): Promise<void> {
    await cp(join(cwd(), '..', '..', 'yarn.lock'), join(deployPath, 'yarn.lock'));
    await cp(join(cwd(), '.env.production'), join(deployPath, '.env.production'));
    await cp(distPath, join(deployPath, 'dist'), { recursive: true });
    await cp(join(cwd(), 'views'), join(deployPath, 'views'), { recursive: true });
}

async function copyPackageJson(): Promise<void> {
    const nonExternalPackages = Object.keys(dependencies).filter(d => !externals.includes(d));
    const mainPackageJsonPath = join(cwd(), 'package.json');
    const pkg = JSON.parse(await readFile(mainPackageJsonPath, 'utf8'));
    for (const nep of nonExternalPackages) {
        delete pkg.dependencies[nep];
    }
    delete pkg.scripts.dist;
    delete pkg.scripts.build;
    delete pkg.scripts.deploy;
    delete pkg.devDependencies;
    const json = JSON.stringify(pkg);

    await writeFile(join(deployPath, 'package.json'), json);
}

async function copyYarnFiles(): Promise<void> {
    const yarnPath = join(cwd(), '..', '..', '.yarn');

    await cp(join(yarnPath, 'install-state.gz'), join(deployPath, '.yarn', 'install-state.gz'));
    await cp(join(yarnPath, 'releases'), join(deployPath, '.yarn', 'releases'), { recursive: true });
    await writeFile(join(deployPath, '.yarnrc.yml'), ['nodeLinker: node-modules', 'yarnPath: .yarn/releases/yarn-3.3.1.cjs'].join('\n'), 'utf8');
}

Promise.all([
    checkDeployPath(),
    copyFiles(),
    copyYarnFiles(),
    copyPackageJson()
]).then(() => console.log('Done!')).catch((err: any) => console.error(err));
