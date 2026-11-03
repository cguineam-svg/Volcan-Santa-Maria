import { listAvailableRoutes } from '../route-service';
import { routeBounds, routeLineCoordinates, syncRouteLayers, type RouteOverlay } from './route-map-layers';
import { acceptsPosition, watchOrientation } from '../../../../shared/gps-policy';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { GeoJSON } from 'geojson';
import {
  type GeoJSONSource,
  Map,
  Marker,
  NavigationControl,
  ScaleControl,
  setWorkerUrl,
} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import mapLibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import { useTranslation } from 'react-i18next';
import { getAppLanguage } from '../../../i18n';
import type { RouteCheckpoint, RouteContent } from '../route-types';
import { CheckpointMediaGallery } from './CheckpointMediaGallery';
import { createOfflineMapStyle, OFFLINE_MAP_FILE } from './offline-map-style';

setWorkerUrl(mapLibreWorkerUrl);

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY?.trim() || null;
const SATELLITE_STYLE_URL = MAPTILER_KEY
  ? `https://api.maptiler.com/maps/hybrid-v4/style.json?key=${encodeURIComponent(MAPTILER_KEY)}`
  : null;
const SATELLITE_TIMEOUT_MS = 8000;
const initialBaseMap = (): BaseMap => (SATELLITE_STYLE_URL && navigator.onLine ? 'satellite' : 'map');
const ACCURACY_SOURCE_ID = 'user-location-accuracy';
const ACCURACY_FILL_LAYER_ID = 'user-location-accuracy-fill';
const ACCURACY_LINE_LAYER_ID = 'user-location-accuracy-line';
const VOLCANO_CENTER: [number, number] = [-91.552, 14.757];
const INITIAL_ZOOM = 13;


type MapSelection =
  | { kind: 'start' }
  | { kind: 'destination'; slug: string }
  | { kind: 'checkpoint'; checkpointId: string }
  | null;

type RouteMapProps = {
  route: RouteContent;
  onChangeRoute?: () => void;
};

type BaseMap = 'map' | 'satellite';
type LivePosition = {
  longitude: number;
  latitude: number;
  accuracy: number;
  timestamp: number;
};

function createAccuracyCircle(position: LivePosition): GeoJSON {
  const points = 64;
  const latitudeRadians = (position.latitude * Math.PI) / 180;
  const latitudeDegrees = position.accuracy / 111_320;
  const longitudeDegrees =
    position.accuracy / (111_320 * Math.max(Math.cos(latitudeRadians), 0.01));
  const coordinates = Array.from({ length: points + 1 }, (_, index) => {
    const angle = (index / points) * Math.PI * 2;
    return [
      position.longitude + Math.cos(angle) * longitudeDegrees,
      position.latitude + Math.sin(angle) * latitudeDegrees,
    ];
  });
  return {
    type: 'Feature',
    properties: {},
    geometry: { type: 'Polygon', coordinates: [coordinates] },
  };
}

function syncAccuracyLayer(map: Map, accuracyGeoJson: GeoJSON | null): void {
  if (!accuracyGeoJson) return;
  const source = map.getSource<GeoJSONSource>(ACCURACY_SOURCE_ID);
  if (source) void source.setData(accuracyGeoJson);
  else
    map.addSource(ACCURACY_SOURCE_ID, {
      type: 'geojson',
      data: accuracyGeoJson,
    });
  if (!map.getLayer(ACCURACY_FILL_LAYER_ID))
    map.addLayer({
      id: ACCURACY_FILL_LAYER_ID,
      type: 'fill',
      source: ACCURACY_SOURCE_ID,
      paint: { 'fill-color': '#2d9cdb', 'fill-opacity': 0.16 },
    });
  if (!map.getLayer(ACCURACY_LINE_LAYER_ID))
    map.addLayer({
      id: ACCURACY_LINE_LAYER_ID,
      type: 'line',
      source: ACCURACY_SOURCE_ID,
      paint: { 'line-color': '#1685c1', 'line-width': 2, 'line-opacity': 0.75 },
    });
}

function getRouteGeoJson(value: Record<string, unknown> | null): GeoJSON | null {
  if (!value || typeof value.type !== 'string') return null;
  const geometry = value as unknown as GeoJSON;
  return routeLineCoordinates(geometry).length ? geometry : null;
}

function getLocalizedCheckpoint(
  checkpoint: RouteCheckpoint,
  language: 'es' | 'en'
) {
  return {
    name: language === 'es' ? checkpoint.nameEs : checkpoint.nameEn,
    description:
      language === 'es' ? checkpoint.descriptionEs : checkpoint.descriptionEn,
  };
}

export function RouteMap({ route, onChangeRoute }: RouteMapProps) {
  const { t, i18n } = useTranslation();
  const language = getAppLanguage(i18n.resolvedLanguage);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const [mapAttempt, setMapAttempt] = useState(0);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapFailed, setMapFailed] = useState(false);
  const [baseMap, setBaseMap] = useState<BaseMap>(initialBaseMap);
  const [styleSwitching, setStyleSwitching] = useState(false);
  const [satelliteLoadFailed, setSatelliteLoadFailed] = useState(false);
  const [offlineMapSaved, setOfflineMapSaved] = useState(false);
  const [selection, setSelection] = useState<MapSelection>(null);
  const [locationStatus, setLocationStatus] = useState<
    'idle' | 'locating' | 'active' | 'error'
  >('idle');
  const [locationError, setLocationError] = useState<string | null>(null);
  const [livePosition, setLivePosition] = useState<LivePosition | null>(null);
  const stopWatchRef = useRef<(() => void) | null>(null);
  const userMarkerRef = useRef<Marker | null>(null);
  const latestPositionRef = useRef<LivePosition | null>(null);
  const accuracyGeoJsonRef = useRef<GeoJSON | null>(null);
  const centerOnFirstPositionRef = useRef(true);
  const [failedMediaIds, setFailedMediaIds] = useState<Set<string>>(
    () => new Set()
  );

  const locatedCheckpoints = useMemo(
    () =>
      route.checkpoints.filter(
        (checkpoint) =>
          checkpoint.latitude !== null && checkpoint.longitude !== null
      ),
    [route.checkpoints]
  );
  const [availableRoutes, setAvailableRoutes] = useState<RouteContent[]>([]);
  const [alternativeFailed, setAlternativeFailed] = useState(false);
  const [routeAttempt, setRouteAttempt] = useState(0);
  const fittedRoutesRef = useRef('');
  useEffect(() => {
    let active = true;
    void listAvailableRoutes().then((items) => {
      if (active) { setAvailableRoutes(items); setAlternativeFailed(items.length < 2); }
    }).catch(() => { if (active) setAlternativeFailed(true); });
    return () => { active = false; };
  }, [routeAttempt]);
  const routes = useMemo(() => [route, ...availableRoutes.filter((item) => item.id !== route.id)], [route, availableRoutes]);
  const routeOverlays = useMemo<RouteOverlay[]>(() => {
    return routes.flatMap((item) => {
      const geojson = getRouteGeoJson(item.pathGeojson);
      return geojson ? [{ id: item.id, slug: item.slug, geojson, active: item.id === route.id }] : [];
    });
  }, [route.id, routes]);
  const routeOverlaysRef = useRef(routeOverlays);
  const baseMapRef = useRef<BaseMap>(initialBaseMap());
  const pendingBaseMapRef = useRef<BaseMap | null>(null);
  const fallbackInProgressRef = useRef(false);
  const selectedCheckpoint =
    selection?.kind === 'checkpoint'
      ? (locatedCheckpoints.find(
          (checkpoint) => checkpoint.id === selection.checkpointId
        ) ?? null)
      : null;
  const selectedCheckpointMedia = useMemo(() => {
    if (!selectedCheckpoint) return [];

    return route.media
      .filter(
        (media) =>
          media.checkpointId === selectedCheckpoint.id &&
          !failedMediaIds.has(media.id)
      )
      .toSorted(
        (first, second) =>
          Number(second.isCover) - Number(first.isCover) ||
          first.sortOrder - second.sortOrder
      );
  }, [failedMediaIds, route.media, selectedCheckpoint]);

  useEffect(() => {
    if (!containerRef.current) return;

    let loaded = false;
    let active = true;
    let map: Map | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let satelliteTimer = 0;

    const fallBackToLocalMap = () => {
      window.clearTimeout(satelliteTimer);
      pendingBaseMapRef.current = null;
      setStyleSwitching(false);
      baseMapRef.current = 'map';
      fallbackInProgressRef.current = true;
      setBaseMap('map');
      setSatelliteLoadFailed(true);
      try {
        map?.setStyle(createOfflineMapStyle());
      } catch {
        fallbackInProgressRef.current = false;
        setMapFailed(true);
      }
    };

    try {
      const startingBaseMap = initialBaseMap();
      baseMapRef.current = startingBaseMap;
      pendingBaseMapRef.current =
        startingBaseMap === 'satellite' ? 'satellite' : null;
      queueMicrotask(() => { if (active) setBaseMap(startingBaseMap); });
      map = new Map({
        container: containerRef.current,
        style: startingBaseMap === 'satellite' && SATELLITE_STYLE_URL ? SATELLITE_STYLE_URL : createOfflineMapStyle(),
        center: VOLCANO_CENTER,
        zoom: INITIAL_ZOOM,
        dragPan: true,
        touchZoomRotate: true,
      });
      mapRef.current = map;
      fittedRoutesRef.current = '';
      // A weak signal can leave the satellite style hanging without ever failing.
      if (startingBaseMap === 'satellite') {
        satelliteTimer = window.setTimeout(() => {
          if (active && pendingBaseMapRef.current === 'satellite') fallBackToLocalMap();
        }, SATELLITE_TIMEOUT_MS);
      }
      resizeObserver = new ResizeObserver(() => {
        if (!map || !active) return;
        map.resize();
        if (loaded && !latestPositionRef.current) {
          const bounds = routeBounds(routeOverlaysRef.current);
          if (bounds) map.fitBounds(bounds, { padding: { top: 100, bottom: 65, left: 60, right: 60 }, maxZoom: 14, duration: 0 });
        }
      });
      resizeObserver.observe(containerRef.current);

      map.addControl(
        new NavigationControl({ showCompass: false, showZoom: true }),
        'top-right'
      );
      map.addControl(
        new ScaleControl({ maxWidth: 100, unit: 'metric' }),
        'bottom-left'
      );

      map.on('style.load', () => {
        if (!map) return;

        window.clearTimeout(satelliteTimer);
        const appliedBaseMap = pendingBaseMapRef.current ?? baseMapRef.current;
        baseMapRef.current = appliedBaseMap;
        syncRouteLayers(map, routeOverlaysRef.current, appliedBaseMap);
        syncAccuracyLayer(map, accuracyGeoJsonRef.current);

        if (fallbackInProgressRef.current && appliedBaseMap === 'map') {
          fallbackInProgressRef.current = false;
        }

        if (pendingBaseMapRef.current) {
          pendingBaseMapRef.current = null;
          setBaseMap(appliedBaseMap);
          setStyleSwitching(false);
          setSatelliteLoadFailed(false);
        }
      });
      map.on('load', () => {
        if (!map) return;
        loaded = true;
        syncRouteLayers(map, routeOverlaysRef.current, baseMapRef.current);
        setMapLoaded(true);
        setMapFailed(false);
      });
      map.on('error', () => {
        const pendingBaseMap = pendingBaseMapRef.current;
        if (pendingBaseMap) {
          pendingBaseMapRef.current = null;
          setStyleSwitching(false);

          if (pendingBaseMap === 'satellite' && map) {
            fallBackToLocalMap();
            return;
          }
        }

        if (baseMapRef.current === 'satellite' && !navigator.onLine) {
          fallBackToLocalMap();
          return;
        }

        // The local style cannot fail as a whole: a missing tile or glyph only leaves
        // a gap, and the route stays visible on top of it.
        if (!loaded && !fallbackInProgressRef.current && baseMapRef.current !== 'map') {
          setMapFailed(true);
          setMapLoaded(false);
        }
      });
    } catch {
      queueMicrotask(() => {
        if (!active) return;
        setMapFailed(true);
        setMapLoaded(false);
      });
    }

    return () => {
      active = false;
      window.clearTimeout(satelliteTimer);
      resizeObserver?.disconnect();
      if (stopWatchRef.current !== null && navigator.geolocation) {
        stopWatchRef.current();
        stopWatchRef.current = null;
      }
      userMarkerRef.current?.remove();
      userMarkerRef.current = null;
      latestPositionRef.current = null;
      accuracyGeoJsonRef.current = null;
      centerOnFirstPositionRef.current = true;
      mapRef.current = null;
      fallbackInProgressRef.current = false;
      map?.remove();
    };
  }, [mapAttempt]);

  useEffect(() => {
    if (!('caches' in window)) return;
    let active = true;
    let timer = 0;
    // The service worker saves the map in the background after the first visit.
    const check = () => {
      void caches.match(OFFLINE_MAP_FILE).then((saved) => {
        if (!active) return;
        if (saved) setOfflineMapSaved(true);
        else timer = window.setTimeout(check, 2000);
      });
    };
    check();
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    routeOverlaysRef.current = routeOverlays;
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    const syncWhenReady = () => syncRouteLayers(map, routeOverlaysRef.current, baseMapRef.current);
    if (map.isStyleLoaded()) syncWhenReady();
    else map.once('idle', syncWhenReady);
    const fitKey = routeOverlays.map((item) => item.id).sort().join(',');
    if (fitKey !== fittedRoutesRef.current && !latestPositionRef.current) {
      const bounds = routeBounds(routeOverlays);
      if (bounds) map.fitBounds(bounds, { padding: { top: 100, bottom: 65, left: 60, right: 60 }, maxZoom: 14, duration: 0 });
      fittedRoutesRef.current = fitKey;
    }
    return () => { map.off('idle', syncWhenReady); };
  }, [mapLoaded, routeOverlays]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    const markers: Marker[] = [];
    for (const destination of routes) {
      if (!destination.summitCoordinate) continue;
      const picacho = destination.slug === 'mirador-picacho';
      const label = t(picacho ? 'final.picachoDestination' : 'final.summitDestination');
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `route-map-marker route-destination-marker ${picacho ? 'picacho' : 'summit'} ${destination.id === route.id ? 'active' : ''}`;
      button.setAttribute('aria-label', label);
      button.title = label;
      const icon = document.createElement('span');
      icon.className = 'destination-icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = picacho ? '◆' : '▲';
      const caption = document.createElement('span');
      caption.className = 'destination-label';
      caption.textContent = label;
      button.append(caption, icon);
      button.addEventListener('click', () => setSelection({ kind: 'destination', slug: destination.slug }));
      markers.push(new Marker({ element: button, anchor: 'bottom' }).setLngLat(destination.summitCoordinate).addTo(map));
    }
    if (route.startCoordinate) {
      const startButton = document.createElement('button');
      startButton.type = 'button';
      startButton.className = 'route-map-marker route-start-marker';
      startButton.setAttribute('aria-label', t('routes.map.startMarkerLabel'));
      startButton.textContent = '●';
      startButton.addEventListener('click', () =>
        setSelection({ kind: 'start' })
      );
      markers.push(
        new Marker({ element: startButton, anchor: 'bottom' })
          .setLngLat(route.startCoordinate)
          .addTo(map)
      );
    }

    locatedCheckpoints.forEach((checkpoint) => {
      if (checkpoint.latitude === null || checkpoint.longitude === null) return;

      const { name } = getLocalizedCheckpoint(checkpoint, language);
      const checkpointButton = document.createElement('button');
      checkpointButton.type = 'button';
      checkpointButton.className =
        'route-map-marker route-map-checkpoint-marker';
      checkpointButton.setAttribute(
        'aria-label',
        t('routes.map.checkpointMarkerLabel', { name })
      );
      const checkpointLabel = document.createElement('span');
      checkpointLabel.textContent = String(checkpoint.sequence);
      checkpointButton.append(checkpointLabel);
      checkpointButton.addEventListener('click', () => {
        setSelection({ kind: 'checkpoint', checkpointId: checkpoint.id });
      });

      markers.push(
        new Marker({ element: checkpointButton, anchor: 'bottom' })
          .setLngLat([checkpoint.longitude, checkpoint.latitude])
          .addTo(map)
      );
    });

    return () => {
      markers.forEach((marker) => marker.remove());
    };
  }, [
    language,
    locatedCheckpoints,
    mapLoaded,
    routes,
    route.id,
    route.startCoordinate,
    t,
  ]);

  const recenterMap = () => {
    const bounds = routeBounds(routeOverlays);
    if (bounds) mapRef.current?.fitBounds(bounds, { padding: { top: 100, bottom: 65, left: 60, right: 60 }, maxZoom: 14, duration: 700 });
  };

  const centerOnPosition = (position: LivePosition) => {
    mapRef.current?.easeTo({
      center: [position.longitude, position.latitude],
      zoom: Math.max(mapRef.current.getZoom(), 15),
      duration: 700,
    });
  };

  const activateLocation = () => {
    const currentPosition = latestPositionRef.current;
    if (stopWatchRef.current !== null) {
      if (currentPosition) centerOnPosition(currentPosition);
      return;
    }
    if (!window.isSecureContext || !navigator.geolocation) {
      setLocationStatus('error');
      setLocationError(t('routes.map.locationUnavailable'));
      return;
    }
    setLocationStatus('locating');
    setLocationError(null);
    centerOnFirstPositionRef.current = true;
    stopWatchRef.current = watchOrientation(navigator.geolocation,
      ({ coords, timestamp }) => {
        const position = {
          longitude: coords.longitude,
          latitude: coords.latitude,
          accuracy: coords.accuracy,
          timestamp,
        };
        if (!acceptsPosition(latestPositionRef.current, position)) return;
        latestPositionRef.current = position;
        const accuracyGeoJson = createAccuracyCircle(position);
        accuracyGeoJsonRef.current = accuracyGeoJson;
        setLivePosition(position);
        setLocationStatus('active');
        setLocationError(null);
        const map = mapRef.current;
        if (!map) return;
        if (!userMarkerRef.current) {
          const markerElement = document.createElement('div');
          markerElement.className = 'route-user-location-marker';
          markerElement.setAttribute('role', 'img');
          markerElement.setAttribute('aria-label', t('routes.map.youAreHere'));
          markerElement.title = t('routes.map.youAreHere');
          userMarkerRef.current = new Marker({ element: markerElement })
            .setLngLat([position.longitude, position.latitude])
            .addTo(map);
        } else
          userMarkerRef.current.setLngLat([
            position.longitude,
            position.latitude,
          ]);
        if (map.isStyleLoaded()) syncAccuracyLayer(map, accuracyGeoJson);
        if (centerOnFirstPositionRef.current) {
          centerOnFirstPositionRef.current = false;
          centerOnPosition(position);
        }
      },
      (error) => {
        setLocationStatus('error');
        const key =
          error.code === error.PERMISSION_DENIED
            ? 'permissionDenied'
            : error.code === error.POSITION_UNAVAILABLE
              ? 'positionUnavailable'
              : 'timeout';
        setLocationError(t(`routes.map.locationErrors.${key}`));
        if (error.code === error.PERMISSION_DENIED && stopWatchRef.current !== null) {
          stopWatchRef.current();
          stopWatchRef.current = null;
        }
      }
    );
  };

  const changeBaseMap = (nextBaseMap: BaseMap) => {
    if (
      nextBaseMap === baseMap ||
      styleSwitching ||
      (nextBaseMap === 'satellite' && !SATELLITE_STYLE_URL)
    ) {
      return;
    }

    const map = mapRef.current;
    if (!map) return;

    const nextStyle =
      nextBaseMap === 'satellite' ? SATELLITE_STYLE_URL : createOfflineMapStyle();
    if (!nextStyle) return;

    pendingBaseMapRef.current = nextBaseMap;
    setBaseMap(nextBaseMap);
    setStyleSwitching(true);
    setSatelliteLoadFailed(false);

    try {
      map.setStyle(nextStyle);
    } catch {
      pendingBaseMapRef.current = null;
      baseMapRef.current = 'map';
      fallbackInProgressRef.current = true;
      setBaseMap('map');
      setStyleSwitching(false);
      setSatelliteLoadFailed(nextBaseMap === 'satellite');
      try {
        map.setStyle(createOfflineMapStyle());
      } catch {
        fallbackInProgressRef.current = false;
        setMapFailed(true);
      }
    }
  };

  const retryMap = () => {
    setMapFailed(false);
    setMapLoaded(false);
    setMapAttempt((attempt) => attempt + 1);
  };

  const hideFailedMedia = (mediaId: string) => {
    setFailedMediaIds((currentIds) => {
      const nextIds = new Set(currentIds);
      nextIds.add(mediaId);
      return nextIds;
    });
  };

  const localizedCheckpoint = selectedCheckpoint
    ? getLocalizedCheckpoint(selectedCheckpoint, language)
    : null;

  return (
    <div className="route-map-section">
      {mapLoaded && <div className="route-map-route-key">
          <div className="route-map-active-badge" role="status"><small>{t('final.selectedDestination')}</small><strong>{t(route.slug === 'mirador-picacho' ? 'final.picachoBadge' : 'final.summitBadge')}</strong></div>
          <ul className="route-map-legend" aria-label={t('final.routeLegend')}>
            {routeOverlays.map((item) => <li key={item.id} className={item.active ? 'active' : ''}>
              <span aria-hidden="true" />{t(item.slug === 'mirador-picacho' ? 'final.picachoBadge' : 'final.summitBadge')}
            </li>)}
          </ul>
        </div>}
      {onChangeRoute && <button type="button" className="secondary-button map-change-route" onClick={onChangeRoute}>{t('final.changeRoute')}</button>}
      <div className="route-map-frame">
        <div
          ref={containerRef}
          className="route-map-canvas"
          role="region"
          aria-label={t('routes.map.mapLabel')}
        />



        {!mapLoaded && !mapFailed && (
          <div className="route-map-state" role="status">
            {t('routes.map.loading')}
          </div>
        )}

        {mapFailed && (
          <div className="route-map-state route-map-error" role="alert">
            <p>{t('routes.map.loadError')}</p>
            <button
              className="secondary-button"
              type="button"
              onClick={retryMap}
            >
              {t('profile.retry')}
            </button>
          </div>
        )}

        {mapLoaded && (
          <div
            className="route-map-basemap-switcher"
            role="group"
            aria-label={t('routes.map.baseMapControl')}
            aria-busy={styleSwitching}
          >
            <button
              type="button"
              aria-pressed={baseMap === 'map'}
              onClick={() => changeBaseMap('map')}
              disabled={styleSwitching}
            >
              {t('routes.map.mapBase')}
            </button>
            <button
              type="button"
              aria-pressed={baseMap === 'satellite'}
              onClick={() => changeBaseMap('satellite')}
              disabled={!SATELLITE_STYLE_URL || styleSwitching}
              title={
                SATELLITE_STYLE_URL
                  ? undefined
                  : t('routes.map.satelliteUnavailable')
              }
            >
              {t('routes.map.satelliteBase')}
            </button>
          </div>
        )}

        {mapLoaded && (
          <button
            className="route-map-recenter"
            type="button"
            onClick={recenterMap}
            title={t('routes.map.recenter')}
            aria-label={t('routes.map.recenter')}
          >
            <span aria-hidden="true">⌖</span>
          </button>
        )}

        {mapLoaded && (
          <button
            className="route-map-my-location"
            type="button"
            onClick={activateLocation}
            disabled={locationStatus === 'locating'}
          >
            <span aria-hidden="true">●</span>
            {t('routes.map.myLocation')}
          </button>
        )}

        {selection && mapLoaded && (
          <aside
            className="route-map-details"
            aria-label={t('routes.map.selectedPoint')}
          >
            <button
              className="route-map-details-close"
              type="button"
              onClick={() => setSelection(null)}
              aria-label={t('routes.map.closeDetails')}
            >
              ×
            </button>

            {selection.kind === 'destination' && (
              <>
                <span className="route-checkpoint-type">
                  {t('visits.route')}
                </span>
                <h3>
                  {t(selection.slug === 'mirador-picacho' ? 'final.picachoDestination' : 'final.summitDestination')}
                </h3>

              </>
            )}
            {selection.kind === 'start' && (
              <>
                <span className="route-checkpoint-type">
                  {t('routes.map.routeStart')}
                </span>
                <h3>{t('routes.map.startMarkerLabel')}</h3>
              </>
            )}

            {selection.kind === 'checkpoint' &&
              selectedCheckpoint &&
              localizedCheckpoint && (
                <>
                  {selectedCheckpoint.checkpointType && (
                    <span className="route-checkpoint-type">
                      {t(
                        `routes.checkpointTypes.${selectedCheckpoint.checkpointType}`
                      )}
                    </span>
                  )}
                  <h3>{localizedCheckpoint.name}</h3>
                  {localizedCheckpoint.description && (
                    <p>{localizedCheckpoint.description}</p>
                  )}
                  {selectedCheckpoint.altitudeM !== null && (
                    <span className="route-checkpoint-altitude">
                      {t('routes.altitude', {
                        altitude: selectedCheckpoint.altitudeM,
                      })}
                    </span>
                  )}

                  <CheckpointMediaGallery
                    key={selectedCheckpoint.id}
                    media={selectedCheckpointMedia}
                    fallbackAlt={localizedCheckpoint.name}
                    language={language}
                    onMediaError={hideFailedMedia}
                    compact
                  />
                </>
              )}
          </aside>
        )}
      </div>

      {alternativeFailed && <p className="route-map-note" role="status">{t('final.alternativeUnavailable')}{' '}
        <button type="button" className="text-button" onClick={() => { setAlternativeFailed(false); setRouteAttempt((attempt) => attempt + 1); }}>{t('profile.retry')}</button>
      </p>}
      <p className="route-map-note" role="status">{t(offlineMapSaved ? 'offline.mapSaved' : 'offline.mapSaving')}</p>
      <div className="route-location-status" aria-live="polite">
        {locationStatus === 'locating' && <p>{t('routes.map.locating')}</p>}
        {livePosition && (
          <p>
            {t('routes.map.accuracy', {
              accuracy: Math.round(livePosition.accuracy),
            })}
          </p>
        )}
        {locationError && (
          <p className="route-location-error">{locationError}</p>
        )}
        <small>{t('routes.map.locationPrivacy')}</small>
      </div>

      <section className="route-stats-card">
        <h3>{language === 'es' ? route.nameEs : route.nameEn}</h3>
        <div>
          <strong>{route.distanceKm?.toFixed(2) ?? '—'} km</strong>
          <span>{t(route.returnSamePath ? 'final.oneWay' : 'final.roundTrip')}</span>
        </div>
        <div>
          <strong>
            {Math.floor((route.estimatedDurationMinutes ?? 0) / 60)} h{' '}
            {String((route.estimatedDurationMinutes ?? 0) % 60).padStart(
              2,
              '0'
            )}{' '}
            min
          </strong>
          <span>{t('routes.stats.time')}</span>
        </div>
        {route.returnSamePath && <p><strong>{route.totalDistanceKm?.toFixed(2)} km</strong> — {t('final.total')}<br />{t('final.sameWay')}</p>}
        <p>{t('routes.stats.disclaimer')}</p>
      </section>

      {locatedCheckpoints.length === 0 && (
        <p className="route-map-note">{t('routes.map.noCheckpoints')}</p>
      )}
      {route.mediaLoadFailed && (
        <p className="route-map-note" role="status">
          {t('routes.map.mediaLoadError')}
        </p>
      )}
      {satelliteLoadFailed && (
        <p className="route-map-note" role="status">
          {t('routes.map.satelliteLoadError')}
        </p>
      )}
    </div>
  );
}
