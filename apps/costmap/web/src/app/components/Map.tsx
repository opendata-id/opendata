import { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

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

const ZOOM_THRESHOLD = 7.5;

function getCentroid(geometry: any): [number, number] {
  let coords: number[][] = [];

  if (geometry.type === 'Polygon') {
    coords = geometry.coordinates[0];
  } else if (geometry.type === 'MultiPolygon') {
    let maxLen = 0;
    geometry.coordinates.forEach((poly: number[][][]) => {
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

export const Map = forwardRef<MapHandle, MapProps>(function Map(
  { onRegionSelect, selectedRegionId, onZoomChange },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    (
      e: maplibregl.MapMouseEvent & { features?: maplibregl.GeoJSONFeature[] },
    ) => {
      const map = mapRef.current;
      if (!map || map.getZoom() >= ZOOM_THRESHOLD) return;

      if (e.features && e.features.length > 0) {
        const feature = e.features[0];
        const props = feature.properties as RegionProperties;
        const [lng, lat] = getCentroid(feature.geometry);
        onRegionSelect({
          name: props.name,
          avgUmr: props.avgUmr,
          regionCount: props.regionCount,
          lat,
          lng,
        });
      }
    },
    [onRegionSelect],
  );

  const handleRegionClick = useCallback(
    (
      e: maplibregl.MapMouseEvent & { features?: maplibregl.GeoJSONFeature[] },
    ) => {
      const map = mapRef.current;
      if (!map || map.getZoom() < ZOOM_THRESHOLD) return;

      if (e.features && e.features.length > 0) {
        const feature = e.features[0];
        const props = feature.properties as any;
        const [lng, lat] = getCentroid(feature.geometry);
        const costs = typeof props.costs === 'string' ? JSON.parse(props.costs) : props.costs;
        onRegionSelect({
          id: props.id,
          name: props.name,
          province: props.province,
          type: props.type,
          umr: props.umr,
          lat,
          lng,
          costs: costs && Object.keys(costs).length > 0 ? costs : undefined,
        });
      }
    },
    [onRegionSelect],
  );

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
        sources: {},
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
      minZoom: 5,
      maxZoom: 9,
      attributionControl: false,
    });

    mapRef.current = map;

    map.on('zoom', () => {
      onZoomChange?.(map.getZoom());
    });

    map.on('load', async () => {
      onZoomChange?.(map.getZoom());

      try {
        const [provincesRes, regionsRes] = await Promise.all([
          fetch(`${API_BASE}/api/regions/provinces/geojson`),
          fetch(`${API_BASE}/api/regions/geojson`),
        ]);

        if (!provincesRes.ok || !regionsRes.ok) {
          throw new Error('Failed to load map data');
        }

        const [provincesGeoJson, regionsGeoJson] = await Promise.all([
          provincesRes.json(),
          regionsRes.json(),
        ]);

        map.addSource('provinces', {
          type: 'geojson',
          data: provincesGeoJson,
          generateId: true,
        });

        map.addSource('regions', {
          type: 'geojson',
          data: regionsGeoJson,
          generateId: true,
        });

        map.addLayer({
          id: 'provinces-fill',
          type: 'fill',
          source: 'provinces',
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
          source: 'regions',
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
          source: 'regions',
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
          source: 'provinces',
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

        const provinceCentroids: GeoJSON.FeatureCollection = {
          type: 'FeatureCollection',
          features: provincesGeoJson.features.map((f: any) => ({
            type: 'Feature',
            properties: f.properties,
            geometry: {
              type: 'Point',
              coordinates: getCentroid(f.geometry),
            },
          })),
        };

        map.addSource('province-centroids', {
          type: 'geojson',
          data: provinceCentroids,
        });

        map.addLayer({
          id: 'provinces-label',
          type: 'symbol',
          source: 'province-centroids',
          layout: {
            'text-field': ['get', 'name'],
            'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
            'text-size': [
              'interpolate',
              ['linear'],
              ['zoom'],
              3, 11,
              5, 13,
              ZOOM_THRESHOLD, 15,
            ],
            'text-transform': 'uppercase',
            'text-letter-spacing': 0.05,
            'text-max-width': 8,
            'text-allow-overlap': true,
            'text-ignore-placement': true,
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
          source: 'regions',
          layout: {
            'text-field': ['get', 'name'],
            'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
            'text-size': [
              'interpolate',
              ['linear'],
              ['zoom'],
              6, 9,
              8, 11,
              10, 13,
            ],
            'text-max-width': 6,
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
          if (hoveredProvinceId !== null) {
            map.setFeatureState(
              { source: 'provinces', id: hoveredProvinceId },
              { hover: false },
            );
            hoveredProvinceId = null;
          }
        };

        const clearRegionHover = () => {
          if (hoveredRegionId !== null) {
            map.setFeatureState(
              { source: 'regions', id: hoveredRegionId },
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
            const id = e.features[0].id as number;
            if (hoveredProvinceId !== id) {
              clearProvinceHover();
              hoveredProvinceId = id;
              map.setFeatureState({ source: 'provinces', id }, { hover: true });
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
            const id = e.features[0].id as number;
            if (hoveredRegionId !== id) {
              clearRegionHover();
              hoveredRegionId = id;
              map.setFeatureState({ source: 'regions', id }, { hover: true });
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

        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setIsLoading(false);
      }
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [handleProvinceClick, handleRegionClick, onZoomChange]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const source = map.getSource('regions') as maplibregl.GeoJSONSource;
    if (!source) return;

    const data = (source as any)._data;
    if (!data || !data.features) return;

    data.features.forEach((feature: any) => {
      const id = feature.id;
      if (id !== undefined) {
        map.setFeatureState(
          { source: 'regions', id },
          { selected: feature.properties.id === selectedRegionId },
        );
      }
    });
  }, [selectedRegionId]);

  return (
    <div className="absolute inset-0 bg-paper">
      <div ref={containerRef} className="w-full h-full" />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-paper">
          <div className="flex flex-col items-center gap-3">
            <div className="w-6 h-6 border-2 border-stone border-t-accent animate-spin" />
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
});
