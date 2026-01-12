import { useEffect, useState, useRef } from 'react';

interface CostRange {
  min: number;
  avg: number;
  max: number;
}

interface RegionCosts {
  rent?: CostRange;
  food?: CostRange;
  transport?: CostRange;
  utilities?: CostRange;
  other?: CostRange;
}

interface DetailPanelProps {
  region: {
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
  };
  onClose: () => void;
}

const COST_LABELS: Record<string, { label: string; icon: string }> = {
  rent: { label: 'Sewa/Kost', icon: '🏠' },
  food: { label: 'Makanan', icon: '🍽' },
  transport: { label: 'Transport', icon: '🚌' },
  utilities: { label: 'Utilities', icon: '💡' },
  other: { label: 'Lainnya', icon: '📦' },
};

function useCountUp(target: number, duration = 800) {
  const [value, setValue] = useState(0);
  const startTime = useRef<number | null>(null);
  const animationFrame = useRef<number>();

  useEffect(() => {
    if (target === 0) {
      setValue(0);
      return;
    }

    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = Math.min((timestamp - startTime.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(target * eased));

      if (progress < 1) {
        animationFrame.current = requestAnimationFrame(animate);
      }
    };

    animationFrame.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
    };
  }, [target, duration]);

  return value;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatShortCurrency(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}jt`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}rb`;
  }
  return value.toString();
}

function getTypeLabel(type?: string): string {
  if (!type) return '';
  return type.charAt(0).toUpperCase() + type.slice(1);
}

export function DetailPanel({ region, onClose }: DetailPanelProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const isProvince = !region.province && region.regionCount !== undefined;

  const umrValue = region.umr || region.avgUmr || 0;
  const animatedUmr = useCountUp(umrValue, 1000);

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 200);
  };

  return (
    <div
      className={`
        absolute left-5 bottom-5 w-[300px] bg-paper border border-stone shadow-xl
        max-sm:left-3 max-sm:right-3 max-sm:bottom-3 max-sm:w-auto
        transition-all duration-300 ease-out origin-bottom-left
        ${isVisible && !isClosing
          ? 'opacity-100 translate-y-0 scale-100'
          : 'opacity-0 translate-y-4 scale-95'
        }
      `}
      style={{
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.03)',
      }}
    >
      {/* Close button */}
      <button
        type="button"
        onClick={handleClose}
        aria-label="Close panel"
        className="
          absolute top-3 right-3 z-10 flex items-center justify-center w-8 h-8
          bg-transparent border border-transparent text-muted cursor-pointer
          transition-all duration-200 group
          hover:border-stone hover:text-ink hover:bg-stone/50
        "
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          className="transition-transform duration-200 group-hover:rotate-90"
        >
          <path
            d="M9 3L3 9M3 3l6 6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="square"
          />
        </svg>
      </button>

      <div className="p-5">
        {/* Region name with staggered animation */}
        <div
          className={`
            transition-all duration-500 ease-out delay-100
            ${isVisible && !isClosing
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-2'
            }
          `}
        >
          <h2 className="font-display text-[22px] font-normal leading-tight text-ink pr-8 tracking-tight">
            {region.name}
          </h2>
        </div>

        {/* Meta info with staggered animation */}
        <div
          className={`
            flex items-center gap-2 mt-2
            transition-all duration-500 ease-out delay-150
            ${isVisible && !isClosing
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-2'
            }
          `}
        >
          {isProvince ? (
            <>
              <span className="text-[13px] text-muted tabular-nums">
                {region.regionCount} kabupaten/kota
              </span>
              <span className="w-1 h-1 bg-stone" />
              <span
                className={`
                  inline-flex px-2 py-0.5 bg-accent/10 border border-accent/20
                  text-[10px] font-medium text-accent uppercase tracking-wider
                  transition-all duration-300 delay-300
                  ${isVisible && !isClosing ? 'opacity-100' : 'opacity-0'}
                `}
              >
                Provinsi
              </span>
            </>
          ) : (
            <>
              <span className="text-[13px] text-muted">
                {region.province}
              </span>
              {region.type && (
                <>
                  <span className="w-1 h-1 bg-stone" />
                  <span
                    className={`
                      inline-flex px-2 py-0.5 bg-accent/10 border border-accent/20
                      text-[10px] font-medium text-accent uppercase tracking-wider
                      transition-all duration-300 delay-300
                      ${isVisible && !isClosing ? 'opacity-100' : 'opacity-0'}
                    `}
                  >
                    {getTypeLabel(region.type)}
                  </span>
                </>
              )}
            </>
          )}
        </div>

        {/* Divider with draw animation */}
        <div className="relative h-px my-5 bg-stone/50 overflow-hidden">
          <div
            className={`
              absolute inset-y-0 left-0 bg-stone
              transition-all duration-700 ease-out delay-200
              ${isVisible && !isClosing ? 'w-full' : 'w-0'}
            `}
          />
        </div>

        {/* UMR section with staggered animation */}
        <div
          className={`
            transition-all duration-500 ease-out delay-250
            ${isVisible && !isClosing
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-2'
            }
          `}
        >
          <div className="flex items-baseline justify-between">
            <span className="text-[10px] uppercase tracking-[0.15em] text-muted font-medium">
              {isProvince ? 'Rata-rata UMR 2025' : 'UMR 2025'}
            </span>
            {!isProvince && region.id && (
              <span className="font-mono text-[10px] text-stone">
                #{String(region.id).padStart(3, '0')}
              </span>
            )}
          </div>

          {/* Animated currency value */}
          <div className="mt-2 overflow-hidden">
            <div
              className={`
                transition-all duration-700 ease-out delay-400
                ${isVisible && !isClosing
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-full'
                }
              `}
            >
              {umrValue > 0 ? (
                <span className="font-mono text-2xl font-medium text-ink tracking-tight">
                  {formatCurrency(animatedUmr)}
                </span>
              ) : (
                <div className="py-2 px-2 bg-stone/10 border border-dashed border-stone text-center">
                  <span className="text-xs text-muted">Belum ada data</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Living costs breakdown */}
        {!isProvince && (
          <div
            className={`
              mt-4 pt-4 border-t border-stone/30
              transition-all duration-500 ease-out delay-350
              ${isVisible && !isClosing
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-2'
              }
            `}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] uppercase tracking-[0.15em] text-muted font-medium">
                Biaya Hidup / Bulan
              </span>
              {region.costs && Object.keys(region.costs).length > 0 && (
                <span className="text-[9px] text-stone uppercase tracking-wider">
                  Min — Max
                </span>
              )}
            </div>
            {region.costs && Object.keys(region.costs).length > 0 ? (
              <div className="space-y-2">
                {Object.entries(region.costs).map(([key, cost], index) => {
                  const config = COST_LABELS[key];
                  if (!config || !cost) return null;
                  return (
                    <div
                      key={key}
                      className={`
                        flex items-center justify-between py-1.5 px-2 bg-stone/10
                        transition-all duration-300 ease-out
                        ${isVisible && !isClosing ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}
                      `}
                      style={{ transitionDelay: `${400 + index * 50}ms` }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{config.icon}</span>
                        <span className="text-xs text-ink">{config.label}</span>
                      </div>
                      <div className="font-mono text-xs text-muted">
                        <span className="text-ink">{formatShortCurrency(cost.min)}</span>
                        <span className="mx-1 text-stone">—</span>
                        <span className="text-ink">{formatShortCurrency(cost.max)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div
                className={`
                  py-3 px-2 bg-stone/10 border border-dashed border-stone text-center
                  transition-all duration-300 ease-out
                  ${isVisible && !isClosing ? 'opacity-100' : 'opacity-0'}
                `}
                style={{ transitionDelay: '400ms' }}
              >
                <span className="text-xs text-muted">Belum ada data</span>
              </div>
            )}
          </div>
        )}

        {/* Geo coordinates */}
        {region.lat !== undefined && region.lng !== undefined && (
          <div
            className={`
              mt-4 pt-4 border-t border-stone/30
              transition-all duration-500 ease-out delay-450
              ${isVisible && !isClosing
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-2'
              }
            `}
          >
            <div className="flex items-center gap-2 mb-2">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-accent/70">
                <circle cx="6" cy="5" r="2" stroke="currentColor" strokeWidth="1" />
                <path d="M6 1C3.5 1 1.5 3 1.5 5.5C1.5 8.5 6 11 6 11C6 11 10.5 8.5 10.5 5.5C10.5 3 8.5 1 6 1Z" stroke="currentColor" strokeWidth="1" />
              </svg>
              <span className="text-[10px] uppercase tracking-[0.15em] text-muted font-medium">
                Koordinat
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-stone/20 px-3 py-2">
                <div className="text-[9px] uppercase tracking-wider text-muted mb-0.5">Lat</div>
                <div className="font-mono text-xs text-ink tabular-nums">
                  {region.lat.toFixed(4)}°
                </div>
              </div>
              <div className="bg-stone/20 px-3 py-2">
                <div className="text-[9px] uppercase tracking-wider text-muted mb-0.5">Lng</div>
                <div className="font-mono text-xs text-ink tabular-nums">
                  {region.lng.toFixed(4)}°
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Province hint */}
        {isProvince && (
          <div
            className={`
              mt-4 pt-4 border-t border-stone/30
              transition-all duration-500 ease-out delay-500
              ${isVisible && !isClosing
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-2'
              }
            `}
          >
            <div className="flex items-center gap-2 text-xs text-muted">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-accent/60">
                <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1" />
                <path d="M7 4v3.5l2.5 1.5" stroke="currentColor" strokeWidth="1" strokeLinecap="square" />
              </svg>
              <span>Zoom untuk detail per kabupaten</span>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
