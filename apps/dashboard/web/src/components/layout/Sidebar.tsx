import { NavLink, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Banknote,
  MapPin,
  ShoppingCart,
  TrendingUp,
  ExternalLink,
  X,
} from 'lucide-react';

const navigation = [
  { name: 'Overview', href: '/', icon: LayoutDashboard },
  { name: 'Upah Minimum', href: '/wages', icon: Banknote },
  { name: 'Wilayah', href: '/regions', icon: MapPin },
  { name: 'Harga Pangan', href: '/prices', icon: ShoppingCart },
  { name: 'Inflasi', href: '/inflation', icon: TrendingUp },
];

const externalLinks = [
  { name: 'Home', href: '/', external: true },
  { name: 'Cost Map', href: '/map', external: true },
  { name: 'API Docs', href: '/api', external: true },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();

  useEffect(() => {
    onClose();
  }, [location.pathname, onClose]);

  return (
    <aside
      className={cn(
        'fixed lg:sticky top-0 self-start h-screen w-[var(--sidebar-width)] flex-shrink-0 border-r border-stone bg-paper z-50',
        'transition-transform duration-300 ease-out',
        'lg:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="h-[var(--header-height)] flex items-center justify-between px-5 border-b border-stone">
          <a href="/" className="flex items-center gap-3 group">
            <img src="/logo.svg" alt="OpenData.id" className="w-8 h-8" />
            <span className="font-display text-lg tracking-tight text-ink group-hover:text-accent-brand transition-colors">
              OpenData.id
            </span>
          </a>

          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 -mr-1.5 text-muted-foreground hover:text-ink transition-colors"
            aria-label="Tutup menu"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="mb-4">
            <span className="label px-2">Datasets</span>
          </div>

          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 text-sm transition-colors',
                  'hover:bg-stone/50 active:bg-stone',
                  isActive
                    ? 'bg-accent-light text-accent-brand font-medium'
                    : 'text-muted-foreground'
                )
              }
            >
              <item.icon className="w-4 h-4" strokeWidth={1.5} />
              {item.name}
            </NavLink>
          ))}

          <div className="pt-6 mt-6 border-t border-stone">
            <span className="label px-2">Links</span>
          </div>

          {externalLinks.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground hover:bg-stone/50 active:bg-stone transition-colors"
            >
              <ExternalLink className="w-4 h-4" strokeWidth={1.5} />
              {item.name}
            </a>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-stone">
          <div className="text-xs text-muted-foreground">
            <p>Data: BPS, Kemnaker, BI</p>
            <p className="mt-1">© 2026 OpenData.id</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
