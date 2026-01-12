import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Ticker } from './Ticker';
import { useMobileNav } from './useMobileNav';

export function Layout() {
  const nav = useMobileNav();

  return (
    <div className="min-h-screen bg-paper pb-10">
      <Ticker />

      <div className="flex min-h-[calc(100vh-var(--ticker-height))]">
        <Sidebar isOpen={nav.isOpen} onClose={nav.close} />

        {/* Mobile overlay */}
        {nav.isOpen && (
          <div
            className="fixed inset-0 bg-ink/40 z-40 lg:hidden backdrop-blur-sm"
            onClick={nav.close}
            aria-hidden="true"
          />
        )}

        <div className="flex-1 min-w-0">
          <Header onMenuClick={nav.toggle} />
          <main className="p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>

      <footer className="fixed bottom-0 left-0 right-0 px-4 md:px-6 py-2 border-t border-amber-200 bg-amber-50 z-40">
        <p className="text-xs text-amber-800">
          <span className="font-semibold">Alpha</span> — Trend charts use simulated data. All other figures are real and sourced from BPS, Kemnaker, and BI.
        </p>
      </footer>
    </div>
  );
}
