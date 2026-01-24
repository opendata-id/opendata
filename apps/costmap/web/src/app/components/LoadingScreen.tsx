import { useEffect, useState, memo } from 'react';

interface LoadingStep {
  id: string;
  label: string;
  status: 'pending' | 'loading' | 'done';
}

interface LoadingScreenProps {
  steps: LoadingStep[];
  progress: number;
}

export const LoadingScreen = memo(function LoadingScreen({ steps, progress }: LoadingScreenProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-paper">
      {/* Grid pattern background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Diagonal accent line */}
      <div
        className={`
          absolute top-0 left-0 w-[1px] bg-accent origin-top-left
          transition-all duration-1000 ease-out
          ${mounted ? 'h-[200vh] opacity-100' : 'h-0 opacity-0'}
        `}
        style={{ transform: 'rotate(45deg)' }}
      />

      {/* Content */}
      <div
        className={`
          relative flex flex-col items-center
          transition-all duration-700 ease-out
          ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        `}
      >
        {/* Logo mark */}
        <div
          className={`
            relative w-16 h-16 mb-8
            transition-all duration-500 delay-100
            ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}
          `}
        >
          <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
            <rect
              x="2" y="2" width="60" height="60"
              stroke="currentColor" strokeWidth="2"
              className="text-ink"
            />
            <circle
              cx="32" cy="32" r="8"
              stroke="currentColor" strokeWidth="2"
              className="text-accent"
              style={{
                strokeDasharray: '50.26',
                strokeDashoffset: mounted ? 0 : 50.26,
                transition: 'stroke-dashoffset 1.5s ease-out 0.3s',
              }}
            />
          </svg>

          {/* Corner accents */}
          <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-accent" />
          <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-accent" />
          <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-accent" />
          <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-accent" />
        </div>

        {/* Title */}
        <h1
          className={`
            font-display text-2xl text-ink tracking-tight mb-1
            transition-all duration-500 delay-200
            ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
          `}
        >
          opendata.id
        </h1>
        <p
          className={`
            text-xs text-muted tracking-wide mb-10
            transition-all duration-500 delay-300
            ${mounted ? 'opacity-100' : 'opacity-0'}
          `}
        >
          Indonesia Cost of Living Index
        </p>

        {/* Progress bar */}
        <div
          className={`
            relative w-64 h-[3px] bg-stone/50 overflow-hidden mb-6
            transition-all duration-500 delay-400
            ${mounted ? 'opacity-100' : 'opacity-0'}
          `}
        >
          <div
            className="absolute inset-y-0 left-0 bg-accent transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
          {/* Shimmer effect */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            style={{
              transform: 'translateX(-100%)',
              animation: progress < 100 ? 'shimmer 1.5s infinite' : 'none',
            }}
          />
        </div>

        {/* Steps */}
        <div
          className={`
            flex flex-col gap-2 w-64
            transition-all duration-500 delay-500
            ${mounted ? 'opacity-100' : 'opacity-0'}
          `}
        >
          {steps.map((step, i) => (
            <div
              key={step.id}
              className={`
                flex items-center gap-3 py-1.5 px-2 transition-all duration-300
                ${step.status === 'loading' ? 'bg-accent/5' : ''}
              `}
              style={{ transitionDelay: `${600 + i * 100}ms` }}
            >
              {/* Status indicator */}
              <div className="relative w-4 h-4 flex items-center justify-center">
                {step.status === 'pending' && (
                  <div className="w-1.5 h-1.5 bg-stone" />
                )}
                {step.status === 'loading' && (
                  <div className="w-3 h-3 rounded-full border border-accent border-t-transparent animate-spin" />
                )}
                {step.status === 'done' && (
                  <svg width="14" height="14" viewBox="0 0 14 14" className="text-accent">
                    <path
                      d="M2.5 7.5L5.5 10.5L11.5 4.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="square"
                      fill="none"
                    />
                  </svg>
                )}
              </div>

              <span
                className={`
                  font-mono text-xs transition-colors duration-200
                  ${step.status === 'loading' ? 'text-accent' : ''}
                  ${step.status === 'done' ? 'text-muted' : ''}
                  ${step.status === 'pending' ? 'text-stone' : ''}
                `}
              >
                {step.label}
                {step.status === 'loading' && (
                  <span className="inline-block w-6 loading-dots" />
                )}
              </span>
            </div>
          ))}
        </div>

        {/* Percentage */}
        <div
          className={`
            mt-6 font-mono text-[10px] text-muted tracking-wider
            transition-all duration-500 delay-700
            ${mounted ? 'opacity-100' : 'opacity-0'}
          `}
        >
          <span className="text-ink">{progress.toFixed(0)}</span>
          <span>%</span>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .loading-dots::after {
          content: '';
          animation: dots 1.2s steps(4, end) infinite;
        }
        @keyframes dots {
          0%, 20% { content: ''; }
          40% { content: '.'; }
          60% { content: '..'; }
          80%, 100% { content: '...'; }
        }
      `}</style>
    </div>
  );
});
