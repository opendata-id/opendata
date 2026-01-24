import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';

const pageTitles: Record<string, string> = {
  '/': 'Data Overview',
  '/wages': 'Upah Minimum',
  '/regions': 'Wilayah',
  '/prices': 'Harga Pangan',
  '/inflation': 'Inflasi',
};

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const location = useLocation();
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = { timeZone: 'Asia/Jakarta' };

      setTime(
        now.toLocaleTimeString('en-GB', {
          ...options,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );

      setDate(
        now.toLocaleDateString('en-GB', {
          ...options,
          weekday: 'short',
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const pageTitle = pageTitles[location.pathname] || 'OpenData.id';

  return (
    <header className="h-[var(--header-height)] border-b border-stone bg-paper flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 -ml-1.5 text-muted-foreground hover:text-ink transition-colors"
          aria-label="Buka menu"
        >
          <Menu className="w-5 h-5" strokeWidth={1.5} />
        </button>

        <h1 className="font-serif text-base md:text-lg text-ink">{pageTitle}</h1>
      </div>

      {/* Time - hide date on mobile */}
      <div className="text-sm text-muted-foreground font-mono">
        <span className="hidden sm:inline">{date}</span>
        <span className="hidden sm:inline mx-2">—</span>
        <span className="text-ink">{time}</span>
        <span className="ml-1 text-xs">WIB</span>
      </div>
    </header>
  );
}
