import { useState, useCallback, useRef, useEffect, memo, lazy, Suspense } from 'react';
import type { MapHandle, RegionProperties, WagesData } from './components/Map';
import { DetailPanel } from './components/DetailPanel';
import { LoadingScreen } from './components/LoadingScreen';

const LazyMap = lazy(() => import('./components/Map').then(m => ({ default: m.Map })));

const ZoomInIcon = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
  </svg>
);

const ZoomOutIcon = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
  </svg>
);

const TiltUpIcon = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M8 12V4M4 7l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
  </svg>
);

const TiltDownIcon = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M8 4v8M4 9l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
  </svg>
);

const ResetIcon = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M2 8a6 6 0 1 0 6-6 6.5 6.5 0 0 0-4.5 1.8L2 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
    <path d="M2 2v3.5h3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
  </svg>
);

const LogoIcon = (
  <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
    <rect x="1" y="1" width="30" height="30" stroke="currentColor" strokeWidth="2" fill="none" className="text-ink" />
    <circle cx="16" cy="16" r="3.5" stroke="currentColor" strokeWidth="1.5" fill="none" className="text-accent" />
  </svg>
);

const Clock = memo(function Clock() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('en-GB', {
          timeZone: 'Asia/Jakarta',
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <span className="text-ink">{time}</span>
      <span className="ml-1">WIB</span>
    </>
  );
});

type LoadingStepId = 'library' | 'map' | 'wages';

interface LoadingStep {
  id: LoadingStepId;
  label: string;
  status: 'pending' | 'loading' | 'done';
}

const API_BASE = import.meta.env.DEV
  ? 'http://localhost:8080'
  : 'https://opendata.id';

export function App() {
  const mapRef = useRef<MapHandle>(null);
  const [selectedRegion, setSelectedRegion] = useState<RegionProperties | null>(null);
  const [zoomLevel, setZoomLevel] = useState(5);

  const [isAppReady, setIsAppReady] = useState(false);
  const [wagesData, setWagesData] = useState<WagesData | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingSteps, setLoadingSteps] = useState<LoadingStep[]>([
    { id: 'library', label: 'Loading map library', status: 'loading' },
    { id: 'map', label: 'Loading map tiles', status: 'pending' },
    { id: 'wages', label: 'Loading wage data', status: 'pending' },
  ]);

  const updateStepStatus = useCallback((id: LoadingStepId, status: LoadingStep['status']) => {
    setLoadingSteps(steps =>
      steps.map(s => s.id === id ? { ...s, status } : s)
    );
  }, []);

  const handleLibraryLoad = useCallback(() => {
    updateStepStatus('library', 'done');
    updateStepStatus('map', 'loading');
    setLoadingProgress(20);
  }, [updateStepStatus]);

  const handleMapLoad = useCallback(() => {
    updateStepStatus('map', 'done');
    setLoadingProgress(60);
  }, [updateStepStatus]);

  useEffect(() => {
    const loadWages = async () => {
      updateStepStatus('wages', 'loading');
      setLoadingProgress(70);

      try {
        const res = await fetch(`${API_BASE}/api/regions/wages`);
        if (res.ok) {
          const data = await res.json();
          setWagesData(data);
        }
      } catch (e) {
        console.error('Failed to load wages:', e);
      }

      updateStepStatus('wages', 'done');
      setLoadingProgress(100);

      setTimeout(() => setIsAppReady(true), 300);
    };

    loadWages();
  }, [updateStepStatus]);

  const handleRegionSelect = useCallback((region: RegionProperties | null) => {
    if (!region) {
      setSelectedRegion(null);
      return;
    }

    if (region.id && wagesData?.regions) {
      const wage = wagesData.regions[String(region.id)];
      if (wage) {
        region = { ...region, umr: wage.umr, ump: wage.ump };
      }
    } else if (!region.province && region.name && wagesData?.provinces) {
      const provData = wagesData.provinces[region.name];
      if (provData) {
        region = { ...region, umr: provData.ump, regionCount: provData.regionCount };
      }
    }

    setSelectedRegion(region);
  }, [wagesData]);

  const handlePanelClose = useCallback(() => {
    setSelectedRegion(null);
  }, []);

  const handleZoomChange = useCallback((zoom: number) => {
    setZoomLevel(zoom);
  }, []);

  if (!isAppReady) {
    return <LoadingScreen steps={loadingSteps} progress={loadingProgress} />;
  }

  return (
    <div className="flex h-full w-full bg-paper">
      <aside className="flex flex-col w-14 border-r border-stone bg-paper shrink-0">
        <div className="flex items-center justify-center h-14 border-b border-stone">
          {LogoIcon}
        </div>

        <div className="flex flex-col gap-1 p-2">
          <button
            onClick={() => mapRef.current?.zoomIn()}
            className="flex items-center justify-center w-10 h-10 bg-transparent border border-stone text-muted transition-colors hover:bg-stone hover:text-ink"
            title="Zoom in"
          >
            {ZoomInIcon}
          </button>
          <button
            onClick={() => mapRef.current?.zoomOut()}
            className="flex items-center justify-center w-10 h-10 bg-transparent border border-stone text-muted transition-colors hover:bg-stone hover:text-ink"
            title="Zoom out"
          >
            {ZoomOutIcon}
          </button>

          <div className="h-px my-1 bg-stone" />

          <button
            onClick={() => mapRef.current?.tiltUp()}
            className="flex items-center justify-center w-10 h-10 bg-transparent border border-stone text-muted transition-colors hover:bg-stone hover:text-ink"
            title="Tilt up"
          >
            {TiltUpIcon}
          </button>
          <button
            onClick={() => mapRef.current?.tiltDown()}
            className="flex items-center justify-center w-10 h-10 bg-transparent border border-stone text-muted transition-colors hover:bg-stone hover:text-ink"
            title="Tilt down"
          >
            {TiltDownIcon}
          </button>

          <div className="h-px my-1 bg-stone" />

          <button
            onClick={() => mapRef.current?.resetView()}
            className="flex items-center justify-center w-10 h-10 bg-transparent border border-stone text-muted transition-colors hover:bg-stone hover:text-ink"
            title="Reset view"
          >
            {ResetIcon}
          </button>
        </div>

        <div className="flex-1" />

        <div className="flex items-center justify-center h-14 border-t border-stone">
          <span className="font-mono text-xs text-muted">
            {zoomLevel.toFixed(1)}
          </span>
        </div>
      </aside>

      {/* Map area */}
      <main className="relative flex-1">
        <header className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between h-12 px-4 bg-paper/90 border-b border-stone backdrop-blur-sm">
          <div className="flex items-center">
            <span className="font-display text-sm text-ink tracking-tight">
              opendata.id
            </span>
            <span className="mx-3 text-stone">|</span>
            <span className="text-xs text-muted">
              Indonesia Cost of Living Index
            </span>
          </div>
          <div className="font-mono text-xs text-muted">
            <Clock />
          </div>
        </header>

        <Suspense fallback={null}>
          <LazyMap
            ref={mapRef}
            onRegionSelect={handleRegionSelect}
            selectedRegionId={selectedRegion?.id ?? null}
            onZoomChange={handleZoomChange}
            onMapLoad={handleMapLoad}
            onLibraryLoad={handleLibraryLoad}
            wagesData={wagesData}
          />
        </Suspense>

        {selectedRegion && (
          <DetailPanel region={selectedRegion} onClose={handlePanelClose} />
        )}
      </main>

      {/* Alpha banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center h-8 bg-accent/90 backdrop-blur-sm">
        <span className="text-xs text-white font-medium tracking-wide">
          ALPHA — Data may be incomplete or inaccurate
        </span>
      </div>
    </div>
  );
}

export default App;
