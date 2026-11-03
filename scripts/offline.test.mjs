// Uses the real build and the Supabase SDK against a local mock. No real accounts.
// "Sin conexión" here means both servers are really closed, not only a flag in the browser.
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE_PATH
    ? pathToFileURL(process.env.PLAYWRIGHT_MODULE_PATH).href
    : 'playwright'
);

const root = fileURLToPath(new URL('../', import.meta.url));
const dist = join(root, 'dist');
const APP_PORT = 4179;
const API_PORT = 54399;
const APP = `http://127.0.0.1:${APP_PORT}`;
const API = `http://127.0.0.1:${API_PORT}`;
const USER = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const VISIT = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const SUMMIT = '11111111-1111-4111-8111-111111111111';
const PICACHO = '22222222-2222-4222-8222-222222222222';
const STORAGE_KEY = 'sb-127-auth-token';
const screenshotPath = process.env.OFFLINE_SCREENSHOT;
// 1x1 PNG
const PHOTO = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M/wHwAEAgH/2XsGJgAAAABJRU5ErkJggg==', 'base64');
const CORS = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' };

const jwt = (exp) => `${Buffer.from('{"alg":"HS256","typ":"JWT"}').toString('base64url')}.${Buffer.from(JSON.stringify({ sub: USER, exp, role: 'authenticated' })).toString('base64url')}.synthetic-test-signature`;
const session = (exp) => JSON.stringify({
  access_token: jwt(exp), refresh_token: 'synthetic-refresh', token_type: 'bearer', expires_in: 3600, expires_at: exp,
  user: { id: USER, aud: 'authenticated', email: 'test@example.invalid', email_confirmed_at: '2026-01-01T00:00:00Z', app_metadata: {}, user_metadata: {}, created_at: '2026-01-01T00:00:00Z' },
});
const now = () => Math.floor(Date.now() / 1000);

const routeRow = (id, slug, prefix) => ({ id, slug, name_es: slug, name_en: slug, description_es: null, description_en: null, difficulty: null, distance_km: 1, estimated_duration_minutes: 60, elevation_gain_m: null, path_geojson: null, asset_prefix: prefix, total_distance_km: 2, journey_type: 'one_way_return_same_path', is_active: true });
const routes = [routeRow(SUMMIT, 'ascenso-a-la-cima', 'santa-maria-route'), routeRow(PICACHO, 'mirador-picacho', 'mirador-picacho-route')];
const profile = { first_name: 'Prueba', last_name: 'Offline', avatar_kind: null, avatar_path: null, avatar_preset: null, nationality_country_code: 'GT', department_code: 'GT-09', sex: 'female', date_of_birth: '1990-01-01', phone: '+50255555555', document_type: 'dpi', document_number: '1234567890101' };
const contact = { id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc', first_name: 'Contacto', last_name: 'Prueba', relationship: 'familiar', phone: '+50255555556' };
const checkpoint = { id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd', sequence: 1, checkpoint_type: null, name_es: 'Punto', name_en: 'Point', description_es: null, description_en: null, latitude: 14.76, longitude: -91.55, altitude_m: 3000 };
const media = { id: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', checkpoint_id: checkpoint.id, storage_path: 'punto.jpg', caption_es: null, caption_en: null, title_es: null, title_en: null, description_es: null, description_en: null, sort_order: 1, is_cover: true };
const visitDetails = () => [{
  visit_id: VISIT, route_id: SUMMIT, route_name_es: 'Cima', route_name_en: 'Summit', status: 'in_progress', join_code: 'ABC123', visit_type: 'individual', start_mode: 'now', has_local_guide: false, guide_name: null, planned_start_at: null,
  started_at: new Date(Date.now() - 5 * 3600_000).toISOString(), expected_return_at: new Date(Date.now() + 3600_000).toISOString(), completed_at: null, created_by: USER,
  participants: [{ user_id: USER, first_name: 'Prueba', last_name: 'Offline', avatar_kind: null, avatar_path: null, avatar_preset: null, member_role: 'leader', member_status: 'active', joined_at: new Date().toISOString(), return_started_at: null, checked_out_at: null }],
}];

let apiMode = 'normal';
let photoRequests = 0;
let signedToken = 0;
const json = (res, status, body) => { res.writeHead(status, { ...CORS, 'content-type': 'application/json' }); res.end(JSON.stringify(body)); };
function apiHandler(req, res) {
  if (apiMode === 'hang') return;
  if (req.method === 'OPTIONS') { res.writeHead(204, CORS); res.end(); return; }
  const url = new URL(req.url, API);
  const path = url.pathname;
  const single = (req.headers.accept ?? '').includes('vnd.pgrst.object');
  if (path === '/auth/v1/token') return json(res, 200, JSON.parse(session(now() + 3600)));
  if (path === '/auth/v1/logout') { res.writeHead(204, CORS); res.end(); return; }
  if (path === '/auth/v1/user') return json(res, 200, JSON.parse(session(now() + 3600)).user);
  if (path.startsWith('/storage/v1/object/sign/route-media/')) {
    if (req.method === 'POST') return json(res, 200, { signedURL: `/object/sign/route-media/punto.jpg?token=t${++signedToken}` });
    photoRequests += 1;
    res.writeHead(200, { ...CORS, 'content-type': 'image/png' });
    res.end(PHOTO);
    return;
  }
  if (path === '/rest/v1/user_roles') return json(res, 200, single ? { role: 'tourist' } : [{ role: 'tourist' }]);
  if (path === '/rest/v1/profiles') return json(res, 200, single ? profile : [profile]);
  if (path === '/rest/v1/emergency_contacts') return json(res, 200, single ? contact : [contact]);
  if (path === '/rest/v1/routes') {
    const filter = url.searchParams.get('id') ?? url.searchParams.get('slug');
    if (filter) {
      const value = filter.replace('eq.', '');
      const row = routes.find((item) => item.id === value || item.slug === value) ?? null;
      return json(res, 200, single ? row : row ? [row] : []);
    }
    return json(res, 200, routes.map(({ id }) => ({ id })));
  }
  if (path === '/rest/v1/route_checkpoints') return json(res, 200, [checkpoint]);
  if (path === '/rest/v1/route_media') return json(res, 200, [media]);
  if (path === '/rest/v1/rpc/get_my_consent_status') return json(res, 200, true);
  if (path === '/rest/v1/rpc/get_my_active_group_visit') return json(res, 200, [{ visit_id: VISIT, route_id: SUMMIT, status: 'in_progress' }]);
  if (path === '/rest/v1/rpc/get_group_visit_details') return json(res, 200, visitDetails());
  return json(res, 200, []);
}

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png' };
async function appHandler(req, res) {
  const pathname = decodeURIComponent(new URL(req.url, APP).pathname);
  const file = join(dist, normalize(pathname === '/' ? 'index.html' : pathname));
  try {
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end();
  }
}

function serve(handler, port) {
  const sockets = new Set();
  const server = createServer(handler);
  server.on('connection', (socket) => { sockets.add(socket); socket.on('close', () => sockets.delete(socket)); });
  return new Promise((resolve) => server.listen(port, '127.0.0.1', () => resolve({
    close: () => new Promise((done) => { sockets.forEach((socket) => socket.destroy()); server.close(done); }),
  })));
}

execSync('npm run build', { cwd: root, stdio: 'ignore', env: { ...process.env, VITE_SUPABASE_URL: API, VITE_SUPABASE_PUBLISHABLE_KEY: 'synthetic-key', VITE_MAPTILER_KEY: '' } });

let appServer = await serve(appHandler, APP_PORT);
let apiServer = await serve(apiHandler, API_PORT);
const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL ?? 'msedge' });
const context = await browser.newContext({ locale: 'es-GT', permissions: ['geolocation'], geolocation: { latitude: 14.76, longitude: -91.55 }, viewport: { width: 412, height: 860 } });
const page = await context.newPage();
const pageErrors = [];
page.on('pageerror', (error) => pageErrors.push(error.message));
// Un archivo del mapa que falta no rompe la carga: solo deja huecos sin relieve o sin texto.
const missingMapFiles = [];
page.on('response', (response) => {
  if (response.status() >= 400 && new URL(response.url()).pathname.startsWith('/map/')) missingMapFiles.push(response.url());
});
let failed = 0;
async function check(name, run) {
  try {
    await run();
    console.log(`ok   - ${name}`);
  } catch (error) {
    failed += 1;
    console.log(`FAIL - ${name}\n       ${String(error.message).split('\n').slice(0, 6).join('\n       ')}`);
    console.log(`       pantalla: ${(await page.locator('body').innerText().catch(() => '')).slice(0, 300).replace(/\s+/g, ' ')}`);
  }
}
const savedPhotos = () => page.evaluate(() => caches.open('volcan-fotos-v1').then((cache) => cache.keys()).then((keys) => keys.length));
async function waitForSavedPhoto() {
  for (let tries = 0; tries < 60 && (await savedPhotos()) === 0; tries += 1) await page.waitForTimeout(250);
  assert.equal(await savedPhotos(), 1);
}
const setExpiredSession = () => page.evaluate(([key, value]) => localStorage.setItem(key, value), [STORAGE_KEY, session(now() - 600)]);
const openMap = async () => {
  await page.getByRole('button', { name: /ruta|mapa/i }).first().waitFor({ timeout: 25000 });
  await page.getByRole('button', { name: /mapa/i }).first().click();
  await page.locator('#route-tab-map').click();
  await page.locator('.route-map-basemap-switcher').waitFor({ timeout: 15000 });
};

try {
  await check('primera visita con señal: guarda la app, el mapa, las rutas y las fotos', async () => {
    await page.addInitScript(([key, value]) => { if (!localStorage.getItem(key) && !sessionStorage.getItem('seeded')) { localStorage.setItem(key, value); sessionStorage.setItem('seeded', '1'); } }, [STORAGE_KEY, session(now() + 3600)]);
    await page.goto(APP);
    await page.getByRole('button', { name: 'Finalizar ascenso' }).waitFor({ timeout: 20000 });
    await page.waitForFunction(async () => (await navigator.serviceWorker.ready).active?.state === 'activated' && Boolean(navigator.serviceWorker.controller), null, { timeout: 30000 });
    await page.waitForFunction(async () => Boolean(await caches.match('/map/santamaria.pmtiles')) && Boolean(await caches.match('/map/dem/12/970/1833.png')), null, { timeout: 30000 });
    await page.waitForFunction(() => localStorage.getItem('route-content:v3:mirador-picacho') !== null, null, { timeout: 15000 });
    await waitForSavedPhoto();
    assert.equal(await page.evaluate(() => localStorage.getItem('offline-cache:v1:owner')), USER);
  });

  await check('una foto se reutiliza aunque su URL firmada cambie de token', async () => {
    await page.evaluate((url) => fetch(url), `${API}/storage/v1/object/sign/route-media/punto.jpg?token=otro`);
    assert.equal(await savedPhotos(), 1);
    assert.ok(photoRequests > 0);
  });

  // Sin señal: servidores apagados y token vencido, el caso real a mitad de la subida
  await setExpiredSession();
  await appServer.close();
  await apiServer.close();
  await context.setOffline(true);

  await check('sin conexión y con el token vencido: abre sin mandar al login', async () => {
    await page.reload();
    await page.getByRole('button', { name: 'Finalizar ascenso' }).waitFor({ timeout: 15000 });
    assert.equal(await page.locator('.offline-notice').count(), 1);
  });

  await check('sin conexión: el mapa carga y marca que está guardado', async () => {
    await openMap();
    assert.equal(await page.getByText('No pudimos cargar el mapa.').count(), 0);
    await page.getByText('Mapa guardado: funciona sin conexión.').waitFor({ timeout: 5000 });
    assert.ok(await page.getByText('Mirador Picacho', { exact: false }).count() > 0, 'la ruta alternativa debe seguir disponible');
  });

  await check('sin conexión: el GPS ubica a la persona en el mapa', async () => {
    await page.getByRole('button', { name: 'Mi ubicación' }).click();
    await page.locator('.route-user-location-marker').waitFor({ timeout: 10000 });
    await page.waitForTimeout(2500);
    if (screenshotPath) await page.screenshot({ path: screenshotPath });
  });

  await check('sin conexión: la foto del punto de control se ve', async () => {
    await page.locator('.route-map-checkpoint-marker').first().click();
    const photo = page.locator('.route-map-details img').first();
    await photo.waitFor({ timeout: 5000 });
    await page.waitForFunction(() => document.querySelector('.route-map-details img')?.naturalWidth > 0, null, { timeout: 5000 });
  });

  await check('sin conexión: una acción avisa que no se guardó y no finge éxito', async () => {
    await page.reload();
    await page.getByRole('button', { name: 'Finalizar ascenso' }).click();
    await page.locator('[role="dialog"], [role="alertdialog"]').getByRole('button', { name: 'Finalizar ascenso' }).click();
    await page.getByText('Sin conexión: no se pudo completar', { exact: false }).waitFor({ timeout: 3000 });
    assert.ok(await page.getByRole('button', { name: 'Finalizar ascenso' }).count() > 0, 'la visita debe seguir abierta');
  });

  // Señal débil: el teléfono cree que hay red, pero el servidor nunca responde
  apiMode = 'hang';
  appServer = await serve(appHandler, APP_PORT);
  apiServer = await serve(apiHandler, API_PORT);
  await context.setOffline(false);

  await check('señal débil: no se queda cargando y muestra lo guardado', async () => {
    await setExpiredSession();
    const started = Date.now();
    await page.reload();
    await page.getByRole('button', { name: 'Finalizar ascenso' }).waitFor({ timeout: 25000 });
    const seconds = (Date.now() - started) / 1000;
    console.log(`       llegó a la visita en ${seconds.toFixed(1)} s`);
    assert.ok(seconds < 12, 'una señal débil no debe sumar una espera por cada consulta');
    await openMap();
  });

  apiMode = 'normal';

  await check('al volver la señal: se puede cerrar sesión y se borran los datos personales', async () => {
    await page.reload();
    await page.getByRole('button', { name: 'Finalizar ascenso' }).waitFor({ timeout: 20000 });
    await page.locator('[aria-haspopup="menu"]').first().click();
    await page.getByRole('menuitem', { name: /cerrar sesi/i }).click();
    await page.waitForFunction((key) => localStorage.getItem(key) === null, STORAGE_KEY, { timeout: 10000 });
    await page.waitForFunction(() => !Object.keys(localStorage).some((key) => key.startsWith('offline-cache:')), null, { timeout: 5000 });
  });

  await check('sin errores de JavaScript sin capturar', async () => assert.deepEqual(pageErrors, []));
  await check('todos los archivos del mapa existen', async () => assert.deepEqual(missingMapFiles, []));
} finally {
  await browser.close();
  await appServer.close();
  await apiServer.close();
}

console.log(failed ? `\n${failed} prueba(s) fallaron` : '\nTodas las pruebas pasaron');
process.exit(failed ? 1 : 0);
