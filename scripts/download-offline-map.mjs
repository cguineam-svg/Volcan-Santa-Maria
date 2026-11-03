// Regenera el mapa offline en public/map. Uso: node scripts/download-offline-map.mjs 20261101
// Requiere la herramienta pmtiles (https://github.com/protomaps/go-pmtiles/releases);
// la fecha es un build de https://maps.protomaps.com/builds/
import { execFileSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';

// [oeste, sur, este, norte]: debe coincidir con OFFLINE_MAP_BOUNDS en offline-map-style.ts
const [west, south, east, north] = [-91.585, 14.725, -91.517, 14.82];
const DEM_ZOOMS = [9, 10, 11, 12];
const build = process.argv[2];
if (!build) throw new Error('Indica la fecha del build, por ejemplo: 20261101');

await mkdir('public/map', { recursive: true });
execFileSync('pmtiles', ['extract', `https://build.protomaps.com/${build}.pmtiles`, 'public/map/santamaria.pmtiles',
  `--bbox=${west},${south},${east},${north}`, '--maxzoom=15'], { stdio: 'inherit' });

function tileAt(lng, lat, z) {
  const n = 2 ** z;
  const r = (lat * Math.PI) / 180;
  return [Math.floor(((lng + 180) / 360) * n), Math.floor(((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * n)];
}

for (const z of DEM_ZOOMS) {
  const [x0, y0] = tileAt(west, north, z);
  const [x1, y1] = tileAt(east, south, z);
  // +1 de margen: las curvas de nivel usan los tiles vecinos para no cortarse en los bordes
  for (let x = x0 - 1; x <= x1 + 1; x++) {
    for (let y = y0 - 1; y <= y1 + 1; y++) {
      const response = await fetch(`https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${z}/${x}/${y}.png`);
      if (!response.ok) throw new Error(`Elevación ${z}/${x}/${y}: ${response.status}`);
      await mkdir(`public/map/dem/${z}/${x}`, { recursive: true });
      await writeFile(`public/map/dem/${z}/${x}/${y}.png`, Buffer.from(await response.arrayBuffer()));
    }
  }
}
