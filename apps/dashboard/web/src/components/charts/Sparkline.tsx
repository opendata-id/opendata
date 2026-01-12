import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  strokeWidth?: number;
  className?: string;
  color?: 'accent' | 'positive' | 'negative' | 'muted';
  showArea?: boolean;
}

export function Sparkline({
  data,
  width = 80,
  height = 24,
  strokeWidth = 1.5,
  className,
  color = 'accent',
  showArea = false,
}: SparklineProps) {
  const { path, areaPath } = useMemo(() => {
    if (!data.length) return { path: '', areaPath: '' };

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const padding = 2;
    const effectiveWidth = width - padding * 2;
    const effectiveHeight = height - padding * 2;

    const points = data.map((value, index) => {
      const x = padding + (index / (data.length - 1)) * effectiveWidth;
      const y = padding + effectiveHeight - ((value - min) / range) * effectiveHeight;
      return { x, y };
    });

    const linePath = points
      .map((point, i) => `${i === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
      .join(' ');

    const area = showArea
      ? `${linePath} L ${points[points.length - 1].x.toFixed(2)} ${height - padding} L ${padding} ${height - padding} Z`
      : '';

    return { path: linePath, areaPath: area };
  }, [data, width, height, showArea]);

  const colorClasses = {
    accent: 'stroke-accent-brand',
    positive: 'stroke-positive',
    negative: 'stroke-negative',
    muted: 'stroke-muted-foreground',
  };

  const fillClasses = {
    accent: 'fill-accent-brand/10',
    positive: 'fill-positive/10',
    negative: 'fill-negative/10',
    muted: 'fill-muted-foreground/10',
  };

  if (!data.length) return null;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn('overflow-visible', className)}
    >
      {showArea && areaPath && (
        <path
          d={areaPath}
          className={fillClasses[color]}
          strokeWidth={0}
        />
      )}
      <path
        d={path}
        fill="none"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={colorClasses[color]}
      />
    </svg>
  );
}
