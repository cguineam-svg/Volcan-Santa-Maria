import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative, resolve, sep } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';

async function hashFiles(root: string, urls: string[]): Promise<string> {
  const hash = createHash('sha256');
  for (const url of urls) {
    hash.update(url).update(await readFile(join(root, url === '/' ? 'index.html' : url)));
  }
  return hash.digest('hex').slice(0, 12);
}

// Writes the list of built files into sw.js, so the whole app and the map are saved
// on the phone at install time, and any change in the build updates the service worker.
function precacheManifest(): Plugin {
  let outDir = 'dist';
  return {
    name: 'precache-manifest',
    apply: 'build',
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir);
    },
    async writeBundle() {
      const entries = await readdir(outDir, { recursive: true, withFileTypes: true });
      const urls = entries
        .filter((entry) => entry.isFile())
        .map((entry) => `/${relative(outDir, join(entry.parentPath, entry.name)).split(sep).join('/')}`)
        .filter((url) => url !== '/sw.js' && url !== '/index.html' && !url.endsWith('.gpx') && !url.endsWith('.map'))
        .sort();
      const mapAssets = urls.filter((url) => url.startsWith('/map/'));
      const appAssets = ['/', ...urls.filter((url) => !url.startsWith('/map/'))];
      const listUrls = (list: string[]) => list.map((url) => JSON.stringify(encodeURI(url))).join(',');
      const worker = await readFile(join(outDir, 'sw.js'), 'utf8');
      await writeFile(join(outDir, 'sw.js'), worker
        .replace('__BUILD_ID__', await hashFiles(outDir, appAssets))
        .replace('__MAP_ID__', await hashFiles(outDir, mapAssets))
        .replace('/*__APP_ASSETS__*/', listUrls(appAssets))
        .replace('/*__MAP_ASSETS__*/', listUrls(mapAssets)));
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), precacheManifest()],
  server: {
    host: '127.0.0.1',
    port: 3000,
    strictPort: true,
  },
});
