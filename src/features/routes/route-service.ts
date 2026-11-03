import { supabase } from '../../lib/supabase';
import { preferFreshData, withOfflineCache } from '../../lib/offline-cache';
import type {
  RouteCheckpoint,
  RouteCheckpointType,
  RouteContent,
  RouteMedia,
} from './route-types';

const SUMMIT_ROUTE_SLUG = 'ascenso-a-la-cima';
const ROUTE_MEDIA_BUCKET = 'route-media';
const routeCacheKey = (key: string) => `route-content:v3:${key}`;

type RouteRow = {
  id: string;
  slug: string;
  name_es: string;
  name_en: string;
  description_es: string | null;
  description_en: string | null;
  difficulty: string | null;
  distance_km: number | null;
  estimated_duration_minutes: number | null;
  elevation_gain_m: number | null;
  path_geojson: Record<string, unknown> | null;
  asset_prefix: string | null;
  total_distance_km: number | null;
  journey_type: string | null;
};

type CheckpointRow = {
  id: string;
  sequence: number;
  checkpoint_type: RouteCheckpointType | null;
  name_es: string;
  name_en: string;
  description_es: string | null;
  description_en: string | null;
  latitude: number | null;
  longitude: number | null;
  altitude_m: number | null;
};

type MediaRow = {
  id: string;
  checkpoint_id: string | null;
  storage_path: string;
  caption_es: string | null;
  caption_en: string | null;
  title_es: string | null;
  title_en: string | null;
  description_es: string | null;
  description_en: string | null;
  sort_order: number;
  is_cover: boolean;
};

function mapCheckpoint(row: CheckpointRow): RouteCheckpoint {
  return {
    id: row.id,
    sequence: row.sequence,
    checkpointType: row.checkpoint_type,
    nameEs: row.name_es,
    nameEn: row.name_en,
    descriptionEs: row.description_es,
    descriptionEn: row.description_en,
    latitude: row.latitude,
    longitude: row.longitude,
    altitudeM: row.altitude_m,
  };
}

async function mapMedia(row: MediaRow): Promise<RouteMedia> {
  const { data } = await supabase.storage
    .from(ROUTE_MEDIA_BUCKET)
    .createSignedUrl(row.storage_path.replace(/^\/+/, ''), 60 * 60);

  return {
    id: row.id,
    checkpointId: row.checkpoint_id,
    storagePath: row.storage_path,
    publicUrl: data?.signedUrl ?? '',
    captionEs: row.caption_es,
    captionEn: row.caption_en,
    titleEs: row.title_es,
    titleEn: row.title_en,
    descriptionEs: row.description_es,
    descriptionEn: row.description_en,
    sortOrder: row.sort_order,
    isCover: row.is_cover,
  };
}

function cacheRouteContent(content: RouteContent): void {
  try {
    window.localStorage.setItem(routeCacheKey(content.id), JSON.stringify(content));
    window.localStorage.setItem(routeCacheKey(content.slug), JSON.stringify(content));
  } catch {
    // Route data remains available for the current session when storage is full
    // or disabled by the browser.
  }
}

export function getCachedRouteContent(key = SUMMIT_ROUTE_SLUG): RouteContent | null {
  try {
    const cached = window.localStorage.getItem(routeCacheKey(key));
    if (!cached) return null;

    const parsed: unknown = JSON.parse(cached);
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      !('slug' in parsed) ||
      (parsed.slug !== key && (!('id' in parsed) || parsed.id !== key)) ||
      !('checkpoints' in parsed) ||
      !Array.isArray(parsed.checkpoints) ||
      !('media' in parsed) ||
      !Array.isArray(parsed.media)
    ) {
      return null;
    }

    return parsed as RouteContent;
  } catch {
    return null;
  }
}

export function getRouteContent(key = SUMMIT_ROUTE_SLUG): Promise<RouteContent> {
  const saved = getCachedRouteContent(key);
  return preferFreshData(() => fetchRouteContent(key), saved ? { value: saved } : null);
}

async function fetchRouteContent(key: string): Promise<RouteContent> {
  const { data: routeData, error: routeError } = await supabase
    .from('routes')
    .select(
      'id, slug, name_es, name_en, description_es, description_en, difficulty, distance_km, estimated_duration_minutes, elevation_gain_m, path_geojson, asset_prefix, total_distance_km, journey_type'
    )
    .eq(/^[0-9a-f-]{36}$/i.test(key) ? 'id' : 'slug', key)
    .eq('is_active', true)
    .maybeSingle();

  if (routeError) throw routeError;
  if (!routeData) throw new Error('Active summit route was not returned');

  const route = routeData as RouteRow;
  const [checkpointResult, mediaResult, staticRouteResult, metadataResult] = await Promise.all([
    supabase
      .from('route_checkpoints')
      .select(
        'id, sequence, checkpoint_type, name_es, name_en, description_es, description_en, latitude, longitude, altitude_m'
      )
      .eq('route_id', route.id)
      .order('sequence', { ascending: true }),
    supabase
      .from('route_media')
      .select(
        'id, checkpoint_id, storage_path, caption_es, caption_en, title_es, title_en, description_es, description_en, sort_order, is_cover'
      )
      .eq('route_id', route.id)
      .order('sort_order', { ascending: true }),
    fetch(`/data/${route.asset_prefix}.geojson`).then((response) => response.ok ? response.json() as Promise<Record<string, unknown>> : null).catch(() => null),
    fetch(`/data/${route.asset_prefix}-metadata.json`).then((response) => response.ok ? response.json() as Promise<{ distanceKm: number; totalDistanceKm: number; durationMinutes: number | null; start: [number, number]; summit: [number, number] }> : null).catch(() => null),
  ]);

  if (checkpointResult.error) throw checkpointResult.error;
  if (!staticRouteResult || !metadataResult) throw new Error('Route assets unavailable');

  const cachedContent = mediaResult.error
    ? getCachedRouteContent(key)
    : null;
  const media = mediaResult.error
    ? cachedContent?.id === route.id
      ? cachedContent.media
      : []
    : await Promise.all(((mediaResult.data ?? []) as MediaRow[]).map(mapMedia));

  const content: RouteContent = {
    id: route.id,
    slug: route.slug,
    nameEs: route.name_es,
    nameEn: route.name_en,
    descriptionEs: route.description_es,
    descriptionEn: route.description_en,
    difficulty: route.difficulty,
    distanceKm: metadataResult?.distanceKm ?? route.distance_km,
    estimatedDurationMinutes: metadataResult?.durationMinutes ?? route.estimated_duration_minutes,
    elevationGainM: null,
    totalDistanceKm: metadataResult?.totalDistanceKm ?? route.total_distance_km,
    returnSamePath: route.journey_type === 'one_way_return_same_path',
    pathGeojson: staticRouteResult,
    checkpoints: ((checkpointResult.data ?? []) as CheckpointRow[]).map(
      mapCheckpoint
    ),
    media,
    mediaLoadFailed: mediaResult.error !== null,
    startCoordinate: metadataResult?.start ?? null,
    summitCoordinate: metadataResult?.summit ?? null,
  };

  if (!mediaResult.error) cacheRouteContent(content);
  return content;
}

export async function listAvailableRoutes(): Promise<RouteContent[]> {
  const rows = await withOfflineCache('available-routes', async () => {
    const { data, error } = await supabase.from('routes').select('id').eq('is_active', true).not('asset_prefix', 'is', null).order('created_at');
    if (error) throw error;
    return data as Array<{ id: string }>;
  });
  return Promise.all(rows.map((row) => getRouteContent(row.id)));
}

let routesPreloaded = false;

// On the first visit the worker is still saving the app when the routes arrive, and a
// photo requested before it takes control would never reach its cache.
async function serviceWorkerInControl(): Promise<void> {
  if (!('serviceWorker' in navigator) || navigator.serviceWorker.controller) return;
  await new Promise((resolve) => navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true }));
}

// Saves the routes and their photos while there is signal, even if the person never
// opens them before starting the hike. The service worker keeps each photo it sees.
export function preloadRoutesForOffline(): void {
  if (routesPreloaded || !navigator.onLine) return;
  routesPreloaded = true;
  void listAvailableRoutes().then(async (routes) => {
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (connection?.saveData) return;
    await serviceWorkerInControl();
    for (const media of routes.flatMap((route) => route.media)) {
      if (media.publicUrl) await fetch(media.publicUrl).catch(() => undefined);
    }
  }).catch(() => { routesPreloaded = false; });
}
