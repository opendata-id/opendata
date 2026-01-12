import { useState, useCallback, useRef, useEffect } from 'react';
import { Map, MapHandle, RegionProperties } from './components/Map';
import { DetailPanel } from './components/DetailPanel';

export function App() {
  const mapRef = useRef<MapHandle>(null);
  const [selectedRegion, setSelectedRegion] = useState<RegionProperties | null>(null);
  const [zoomLevel, setZoomLevel] = useState(5);
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

  const handleRegionSelect = useCallback((region: RegionProperties | null) => {
    setSelectedRegion(region);
  }, []);

  const handlePanelClose = useCallback(() => {
    setSelectedRegion(null);
  }, []);

  const handleZoomChange = useCallback((zoom: number) => {
    setZoomLevel(zoom);
  }, []);

  return (
    <div className="flex h-full w-full bg-paper">
      {/* Sidebar with controls */}
      <aside className="flex flex-col w-14 border-r border-stone bg-paper shrink-0">
        {/* Logo */}
        <div className="flex items-center justify-center h-14 border-b border-stone">
          <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
            <rect x="1" y="1" width="30" height="30" stroke="currentColor" strokeWidth="2" fill="none" className="text-ink" />
            <circle cx="16" cy="16" r="3.5" stroke="currentColor" strokeWidth="1.5" fill="none" className="text-accent" />
          </svg>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-1 p-2">
          <button
            onClick={() => mapRef.current?.zoomIn()}
            className="flex items-center justify-center w-10 h-10 bg-transparent border border-stone text-muted transition-colors hover:bg-stone hover:text-ink"
            title="Zoom in"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
            </svg>
          </button>
          <button
            onClick={() => mapRef.current?.zoomOut()}
            className="flex items-center justify-center w-10 h-10 bg-transparent border border-stone text-muted transition-colors hover:bg-stone hover:text-ink"
            title="Zoom out"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
            </svg>
          </button>

          <div className="h-px my-1 bg-stone" />

          <button
            onClick={() => mapRef.current?.tiltUp()}
            className="flex items-center justify-center w-10 h-10 bg-transparent border border-stone text-muted transition-colors hover:bg-stone hover:text-ink"
            title="Tilt up"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 12V4M4 7l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
            </svg>
          </button>
          <button
            onClick={() => mapRef.current?.tiltDown()}
            className="flex items-center justify-center w-10 h-10 bg-transparent border border-stone text-muted transition-colors hover:bg-stone hover:text-ink"
            title="Tilt down"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 4v8M4 9l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
            </svg>
          </button>

          <div className="h-px my-1 bg-stone" />

          <button
            onClick={() => mapRef.current?.resetView()}
            className="flex items-center justify-center w-10 h-10 bg-transparent border border-stone text-muted transition-colors hover:bg-stone hover:text-ink"
            title="Reset view"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 8a6 6 0 1 0 6-6 6.5 6.5 0 0 0-4.5 1.8L2 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
              <path d="M2 2v3.5h3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
            </svg>
          </button>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Zoom level */}
        <div className="flex items-center justify-center h-14 border-t border-stone">
          <span className="font-mono text-xs text-muted">
            {zoomLevel.toFixed(1)}
          </span>
        </div>
      </aside>

      {/* Map area */}
      <main className="relative flex-1">
        {/* Header */}
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
            <span className="text-ink">{time}</span>
            <span className="ml-1">WIB</span>
          </div>
        </header>

        <Map
          ref={mapRef}
          onRegionSelect={handleRegionSelect}
          selectedRegionId={selectedRegion?.id ?? null}
          onZoomChange={handleZoomChange}
        />

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
