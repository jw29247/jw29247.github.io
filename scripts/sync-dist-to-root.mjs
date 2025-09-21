import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync } from 'node:fs';
import { join } from 'node:path';

const DIST_DIR = 'dist';

if (!existsSync(DIST_DIR)) {
  console.error('sync-dist-to-root: dist directory not found. Run `npm run build` first.');
  process.exit(1);
}

function copyEntry(sourceDir, targetDir, entry) {
  const sourcePath = join(sourceDir, entry);
  const targetPath = join(targetDir, entry);
  const stats = statSync(sourcePath);

  if (stats.isDirectory()) {
    if (existsSync(targetPath)) {
      rmSync(targetPath, { recursive: true, force: true });
    }
    mkdirSync(targetPath, { recursive: true });
    readdirSync(sourcePath).forEach((child) => copyEntry(sourcePath, targetPath, child));
  } else {
    cpSync(sourcePath, targetPath);
  }
}

readdirSync(DIST_DIR).forEach((entry) => {
  copyEntry(DIST_DIR, '.', entry);
});

console.log('sync-dist-to-root: copied static build output to repository root.');
