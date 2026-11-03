import { addProtocol, type LayerSpecification, type StyleSpecification } from 'maplibre-gl';
import mlcontour from 'maplibre-contour';
import { PMTiles, Protocol, type RangeResponse, type Source } from 'pmtiles';
import baseLayers from './offline-map-layers.json';

export const OFFLINE_MAP_FILE = '/map/santamaria.pmtiles';
// [oeste, sur, este, norte]: debe coincidir con scripts/download-offline-map.mjs
const OFFLINE_MAP_BOUNDS: [number, number, number, number] = [-91.585, 14.725, -91.517, 14.82];
const DEM_MIN_ZOOM = 9;
const DEM_MAX_ZOOM = 12;

// Reads the whole file once (about 1 MB) and serves ranges from memory, so the
// service worker never has to answer Range requests, which are fragile on iOS.
class WholeFileSource implements Source {
  private bytes: Promise<ArrayBuffer> | null = null;
  private readonly url: string;

  constructor(url: string) {
    this.url = url;
  }

  getKey(): string {
    return this.url;
  }

  async getBytes(offset: number, length: number): Promise<RangeResponse> {
    this.bytes ??= fetch(this.url).then((response) => {
      if (!response.ok) throw new Error(`Offline map unavailable: ${response.status}`);
      return response.arrayBuffer();
    });
    try {
      return { data: (await this.bytes).slice(offset, offset + length) };
    } catch (error) {
      this.bytes = null;
      throw error;
    }
  }
}

let demSource: InstanceType<typeof mlcontour.DemSource> | null = null;

function ensureProtocols(): InstanceType<typeof mlcontour.DemSource> {
  if (demSource) return demSource;
  const protocol = new Protocol();
  protocol.add(new PMTiles(new WholeFileSource(new URL(OFFLINE_MAP_FILE, location.origin).href)));
  addProtocol('pmtiles', protocol.tile);
  demSource = new mlcontour.DemSource({
    url: `${location.origin}/map/dem/{z}/{x}/{y}.png`,
    encoding: 'terrarium',
    maxzoom: DEM_MAX_ZOOM,
    worker: false,
  });
  demSource.setupMaplibre({ addProtocol });
  return demSource;
}

// Hillshade under the water and labels, contours under the labels: OpenStreetMap
// has very little detail on the volcano, so the relief is what makes the map useful.
export function createOfflineMapStyle(): StyleSpecification {
  const dem = ensureProtocols();
  const layers = baseLayers as LayerSpecification[];
  const waterIndex = Math.max(layers.findIndex((layer) => layer.id === 'water'), 1);
  const labelIndex = layers.findIndex((layer) => layer.type === 'symbol');
  const contoursIndex = labelIndex >= 0 ? Math.max(labelIndex, waterIndex) : layers.length;
  return {
    version: 8,
    glyphs: new URL('/map/fonts/', location.origin).href + '{fontstack}/{range}.pbf',
    sources: {
      protomaps: {
        type: 'vector',
        url: `pmtiles://${new URL(OFFLINE_MAP_FILE, location.origin).href}`,
        attribution: '© <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> · Protomaps',
      },
      dem: {
        type: 'raster-dem',
        tiles: [dem.sharedDemProtocolUrl],
        encoding: 'terrarium',
        tileSize: 256,
        minzoom: DEM_MIN_ZOOM,
        maxzoom: DEM_MAX_ZOOM,
        bounds: OFFLINE_MAP_BOUNDS,
      },
      contours: {
        type: 'vector',
        minzoom: 11,
        maxzoom: 15,
        bounds: OFFLINE_MAP_BOUNDS,
        tiles: [dem.contourProtocolUrl({
          thresholds: { 11: [200, 1000], 12: [100, 500], 13: [50, 250], 14: [20, 100], 15: [10, 50] },
          contourLayer: 'contours',
          elevationKey: 'ele',
          levelKey: 'level',
          extent: 4096,
          buffer: 1,
        })],
      },
    },
    layers: [
      ...layers.slice(0, waterIndex),
      {
        id: 'relief',
        type: 'hillshade',
        source: 'dem',
        paint: {
          'hillshade-exaggeration': 0.5,
          'hillshade-shadow-color': '#44524a',
          'hillshade-highlight-color': '#ffffff',
          'hillshade-accent-color': '#44524a',
        },
      },
      ...layers.slice(waterIndex, contoursIndex),
      {
        id: 'contours',
        type: 'line',
        source: 'contours',
        'source-layer': 'contours',
        paint: {
          'line-color': '#8c6d46',
          'line-opacity': 0.6,
          'line-width': ['match', ['get', 'level'], 1, 1.2, 0.5],
        },
      },
      {
        id: 'contours-label',
        type: 'symbol',
        source: 'contours',
        'source-layer': 'contours',
        filter: ['==', ['get', 'level'], 1],
        layout: {
          'symbol-placement': 'line',
          'text-size': 10,
          'text-font': ['Noto Sans Regular'],
          'text-field': ['concat', ['to-string', ['get', 'ele']], ' m'],
        },
        paint: { 'text-color': '#6b5233', 'text-halo-color': '#ffffff', 'text-halo-width': 1.2 },
      },
      ...layers.slice(contoursIndex),
    ],
  };
}
