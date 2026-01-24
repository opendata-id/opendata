import { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef, memo } from 'react';
import maplibregl from 'maplibre-gl';
import { Protocol } from 'pmtiles';
import 'maplibre-gl/dist/maplibre-gl.css';

export interface WagesData {
  regions: Record<string, { umr: number; ump: number }>;
  provinces: Record<string, { ump: number; regionCount: number }>;
}

export interface CostRange {
  min: number;
  avg: number;
  max: number;
}

export interface RegionCosts {
  rent?: CostRange;
  food?: CostRange;
  transport?: CostRange;
  utilities?: CostRange;
  other?: CostRange;
}

export interface RegionProperties {
  id?: number;
  name: string;
  province?: string;
  type?: string;
  umr?: number;
  ump?: number;
  avgUmr?: number;
  regionCount?: number;
  lat?: number;
  lng?: number;
  costs?: RegionCosts;
}

interface MapProps {
  onRegionSelect: (region: RegionProperties | null) => void;
  selectedRegionId: number | null;
  onZoomChange?: (zoom: number) => void;
  onMapLoad?: () => void;
  onLibraryLoad?: () => void;
  wagesData?: WagesData | null;
}

export interface MapHandle {
  zoomIn: () => void;
  zoomOut: () => void;
  resetView: () => void;
  tiltUp: () => void;
  tiltDown: () => void;
}

const API_BASE = import.meta.env.DEV
  ? 'http://localhost:8080'
  : 'https://opendata.id';

const TILES_URL = import.meta.env.DEV
  ? 'pmtiles://http://localhost:8000/indonesia.pmtiles'
  : 'pmtiles://https://opendata.id/tiles/indonesia.pmtiles';

const ZOOM_THRESHOLD = 7.5;

const protocol = new Protocol();
maplibregl.addProtocol('pmtiles', protocol.tile);

const costsCache: Record<number, RegionCosts> = {};

export const Map = memo(forwardRef<MapHandle, MapProps>(function Map(
  { onRegionSelect, selectedRegionId, onZoomChange, onMapLoad, onLibraryLoad, wagesData },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const selectedIdRef = useRef<number | null>(null);
  const regionsLoadedRef = useRef(false);
  const libraryLoadedRef = useRef(false);

  useEffect(() => {
    if (!libraryLoadedRef.current) {
      libraryLoadedRef.current = true;
      onLibraryLoad?.();
    }
  }, [onLibraryLoad]);

  useImperativeHandle(ref, () => ({
    zoomIn: () => {
      mapRef.current?.zoomIn({ duration: 200 });
    },
    zoomOut: () => {
      mapRef.current?.zoomOut({ duration: 200 });
    },
    resetView: () => {
      mapRef.current?.easeTo({
        center: [118, -2],
        zoom: 5,
        pitch: 0,
        bearing: 0,
        duration: 500,
      });
    },
    tiltUp: () => {
      const map = mapRef.current;
      if (map) {
        map.easeTo({ pitch: Math.min(map.getPitch() + 15, 60), duration: 200 });
      }
    },
    tiltDown: () => {
      const map = mapRef.current;
      if (map) {
        map.easeTo({ pitch: Math.max(map.getPitch() - 15, 0), duration: 200 });
      }
    },
  }));

  const handleProvinceClick = useCallback(
    (e: maplibregl.MapMouseEvent & { features?: maplibregl.GeoJSONFeature[] }) => {
      const map = mapRef.current;
      if (!map || map.getZoom() >= ZOOM_THRESHOLD) return;

      if (e.features && e.features.length > 0) {
        const feature = e.features[0];
        const props = feature.properties as RegionProperties;
        const geometry = feature.geometry as GeoJSON.Polygon | GeoJSON.MultiPolygon;
        const [lng, lat] = getCentroid(geometry);

        const province: RegionProperties = {
          name: props.name,
          lat,
          lng,
        };

        onRegionSelect(province);
      }
    },
    [onRegionSelect],
  );

  const handleRegionClick = useCallback(
    async (e: maplibregl.MapMouseEvent & { features?: maplibregl.GeoJSONFeature[] }) => {
      const map = mapRef.current;
      if (!map || map.getZoom() < ZOOM_THRESHOLD) return;

      if (e.features && e.features.length > 0) {
        const feature = e.features[0];
        const props = feature.properties as any;
        const geometry = feature.geometry as GeoJSON.Polygon | GeoJSON.MultiPolygon;
        const [lng, lat] = getCentroid(geometry);

        const region: RegionProperties = {
          id: props.id,
          name: props.name,
          province: props.province,
          type: props.type,
          lat,
          lng,
        };

        const cachedCosts = costsCache[props.id];
        if (cachedCosts) {
          onRegionSelect({ ...region, costs: cachedCosts });
          return;
        }

        onRegionSelect(region);

        try {
          const costsRes = await fetch(`${API_BASE}/api/regions/${props.id}/costs`);
          if (costsRes.ok) {
            const costs = await costsRes.json();
            if (costs && Object.keys(costs).length > 0) {
              costsCache[props.id] = costs;
              onRegionSelect({ ...region, costs });
            }
          }
        } catch {
          // Costs fetch failed
        }
      }
    },
    [onRegionSelect],
  );

  useEffect(() => {
    selectedIdRef.current = selectedRegionId;
  }, [selectedRegionId]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        glyphs: 'https://fonts.openmaptiles.org/{fontstack}/{range}.pbf',
        sources: {
          indonesia: {
            type: 'vector',
            url: TILES_URL,
            promoteId: {
              provinces: 'id',
              'province-labels': 'id',
              regions: 'id',
              'region-labels': 'id',
            },
          },
        },
        layers: [
          {
            id: 'background',
            type: 'background',
            paint: { 'background-color': '#f0eeeb' },
          },
        ],
      },
      center: [118, -2],
      zoom: 5,
      minZoom: 3,
      maxZoom: 10,
      attributionControl: false,
      // showCollisionBoxes: true,  // Uncomment to debug label collisions
    });

    mapRef.current = map;

    map.on('zoom', () => {
      onZoomChange?.(map.getZoom());
    });

    map.on('load', () => {
      onZoomChange?.(map.getZoom());

      map.addLayer({
        id: 'provinces-fill',
        type: 'fill',
        source: 'indonesia',
        'source-layer': 'provinces',
        paint: {
          'fill-color': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            '#5a5a5a',
            '#3d3d3d',
          ],
          'fill-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            ZOOM_THRESHOLD - 0.5,
            1,
            ZOOM_THRESHOLD + 0.5,
            0,
          ],
        },
      });

      map.addLayer({
        id: 'regions-fill',
        type: 'fill',
        source: 'indonesia',
        'source-layer': 'regions',
        paint: {
          'fill-color': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            '#5a5a5a',
            '#3d3d3d',
          ],
          'fill-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            ZOOM_THRESHOLD - 0.5,
            0,
            ZOOM_THRESHOLD + 0.5,
            1,
          ],
        },
      });

      map.addLayer({
        id: 'regions-outline',
        type: 'line',
        source: 'indonesia',
        'source-layer': 'regions',
        paint: {
          'line-color': [
            'case',
            ['boolean', ['feature-state', 'selected'], false],
            '#c45d3a',
            '#c8c5c0',
          ],
          'line-width': [
            'case',
            ['boolean', ['feature-state', 'selected'], false],
            2.5,
            0.5,
          ],
          'line-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            ZOOM_THRESHOLD - 0.5,
            0,
            ZOOM_THRESHOLD + 0.5,
            1,
          ],
        },
      });

      map.addLayer({
        id: 'provinces-outline',
        type: 'line',
        source: 'indonesia',
        'source-layer': 'provinces',
        paint: {
          'line-color': '#8a8784',
          'line-width': [
            'interpolate',
            ['linear'],
            ['zoom'],
            3, 1.5,
            ZOOM_THRESHOLD, 2,
            ZOOM_THRESHOLD + 1, 1.5,
          ],
          'line-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            ZOOM_THRESHOLD, 1,
            ZOOM_THRESHOLD + 1, 0,
          ],
        },
      });

      map.addLayer({
        id: 'provinces-label',
        type: 'symbol',
        source: 'indonesia',
        'source-layer': 'province-labels',
        layout: {
          'text-field': ['get', 'name'],
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-size': 12,
          'text-transform': 'uppercase',
          'text-letter-spacing': 0.05,
          'text-max-width': 8,
          'text-overlap': 'always',
          'text-ignore-placement': true,
          'symbol-z-order': 'source',
        },
        paint: {
          'text-color': '#ffffff',
          'text-halo-color': '#1a1a1a',
          'text-halo-width': 1.5,
          'text-opacity': [
            'step',
            ['zoom'],
            1,
            ZOOM_THRESHOLD + 0.5, 0,
          ],
        },
      });

      map.addLayer({
        id: 'regions-label',
        type: 'symbol',
        source: 'indonesia',
        'source-layer': 'region-labels',
        layout: {
          'text-field': ['get', 'name'],
          'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
          'text-size': 11,
          'text-max-width': 6,
          'text-overlap': 'always',
          'text-ignore-placement': true,
        },
        paint: {
          'text-color': '#ffffff',
          'text-halo-color': '#2a2a2a',
          'text-halo-width': 1,
          'text-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            ZOOM_THRESHOLD - 0.5,
            0,
            ZOOM_THRESHOLD + 0.5,
            1,
          ],
        },
      });

      let hoveredProvinceId: number | null = null;
      let hoveredRegionId: number | null = null;

      const clearProvinceHover = () => {
        if (hoveredProvinceId != null) {
          map.setFeatureState(
            { source: 'indonesia', sourceLayer: 'provinces', id: hoveredProvinceId },
            { hover: false },
          );
          hoveredProvinceId = null;
        }
      };

      const clearRegionHover = () => {
        if (hoveredRegionId != null) {
          map.setFeatureState(
            { source: 'indonesia', sourceLayer: 'regions', id: hoveredRegionId },
            { hover: false },
          );
          hoveredRegionId = null;
        }
      };

      map.on('mousemove', 'provinces-fill', (e) => {
        if (map.getZoom() >= ZOOM_THRESHOLD) {
          clearProvinceHover();
          return;
        }

        if (e.features && e.features.length > 0) {
          map.getCanvas().style.cursor = 'pointer';
          const id = e.features[0].id as number | undefined;
          if (id == null) {
            console.log('Province feature has no id:', e.features[0].properties);
            return;
          }

          if (hoveredProvinceId !== id) {
            clearProvinceHover();
            hoveredProvinceId = id;
            map.setFeatureState(
              { source: 'indonesia', sourceLayer: 'provinces', id },
              { hover: true }
            );
          }
        }
      });

      map.on('mouseleave', 'provinces-fill', () => {
        map.getCanvas().style.cursor = '';
        clearProvinceHover();
      });

      map.on('mousemove', 'regions-fill', (e) => {
        if (map.getZoom() < ZOOM_THRESHOLD) {
          clearRegionHover();
          return;
        }

        if (e.features && e.features.length > 0) {
          map.getCanvas().style.cursor = 'pointer';
          const id = e.features[0].id as number | undefined;
          if (id == null) {
            console.log('Region feature has no id:', e.features[0].properties);
            return;
          }

          if (hoveredRegionId !== id) {
            clearRegionHover();
            hoveredRegionId = id;
            map.setFeatureState(
              { source: 'indonesia', sourceLayer: 'regions', id },
              { hover: true }
            );
          }
        }
      });

      map.on('mouseleave', 'regions-fill', () => {
        map.getCanvas().style.cursor = '';
        clearRegionHover();
      });

      map.on('zoom', () => {
        if (map.getZoom() >= ZOOM_THRESHOLD) {
          clearProvinceHover();
        } else {
          clearRegionHover();
        }
      });

      map.on('click', 'provinces-fill', handleProvinceClick);
      map.on('click', 'regions-fill', handleRegionClick);

      map.on('sourcedata', (e) => {
        if (e.sourceId === 'indonesia' && e.isSourceLoaded && !regionsLoadedRef.current) {
          regionsLoadedRef.current = true;
          setIsLoading(false);
          onMapLoad?.();

          if (selectedIdRef.current !== null) {
            updateSelection(map, selectedIdRef.current);
          }
        }
      });
    });

    map.on('error', (e) => {
      console.error('Map error:', e);
      setError('Failed to load map');
      setIsLoading(false);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [handleProvinceClick, handleRegionClick, onZoomChange, onMapLoad]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !regionsLoadedRef.current) return;

    updateSelection(map, selectedRegionId);
  }, [selectedRegionId]);

  return (
    <div className="absolute inset-0 bg-paper">
      <div ref={containerRef} className="w-full h-full" />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-paper">
          <div className="flex flex-col items-center gap-3">
            <div className="w-6 h-6 rounded-full border-2 border-stone border-t-accent animate-spin" />
            <span className="text-xs text-muted">Loading map...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-paper text-muted">
          <p className="font-medium text-ink">Failed to load map data</p>
          <small className="font-mono text-xs">{error}</small>
        </div>
      )}
    </div>
  );
}));

function getCentroid(geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon): [number, number] {
  let coords: number[][] = [];

  if (geometry.type === 'Polygon') {
    coords = geometry.coordinates[0];
  } else if (geometry.type === 'MultiPolygon') {
    let maxLen = 0;
    geometry.coordinates.forEach((poly) => {
      if (poly[0].length > maxLen) {
        maxLen = poly[0].length;
        coords = poly[0];
      }
    });
  }

  if (coords.length === 0) return [0, 0];

  let sumX = 0, sumY = 0;
  coords.forEach((coord) => {
    sumX += coord[0];
    sumY += coord[1];
  });

  return [sumX / coords.length, sumY / coords.length];
}

let prevSelectedId: number | null = null;

function updateSelection(map: maplibregl.Map, selectedId: number | null) {
  if (prevSelectedId != null) {
    map.setFeatureState(
      { source: 'indonesia', sourceLayer: 'regions', id: prevSelectedId },
      { selected: false },
    );
  }

  if (selectedId != null) {
    map.setFeatureState(
      { source: 'indonesia', sourceLayer: 'regions', id: selectedId },
      { selected: true },
    );
  }

  prevSelectedId = selectedId;
}
