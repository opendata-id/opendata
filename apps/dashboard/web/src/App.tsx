import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from '@/components/layout';

const OverviewPage = lazy(() =>
  import('@/features/overview').then((m) => ({ default: m.OverviewPage }))
);
const WagesPage = lazy(() =>
  import('@/features/wages').then((m) => ({ default: m.WagesPage }))
);
const PricesPage = lazy(() =>
  import('@/features/prices').then((m) => ({ default: m.PricesPage }))
);
const InflationPage = lazy(() =>
  import('@/features/inflation').then((m) => ({ default: m.InflationPage }))
);
const RegionsPage = lazy(() =>
  import('@/features/regions').then((m) => ({ default: m.RegionsPage }))
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 bg-accent-brand animate-pulse-slow" />
        <span className="text-sm text-muted-foreground">Memuat...</span>
      </div>
    </div>
  );
}

const basename = import.meta.env.MODE === 'production' ? '/data' : '/';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename={basename}>
        <Routes>
          <Route element={<Layout />}>
            <Route
              index
              element={
                <Suspense fallback={<PageLoader />}>
                  <OverviewPage />
                </Suspense>
              }
            />
            <Route
              path="wages"
              element={
                <Suspense fallback={<PageLoader />}>
                  <WagesPage />
                </Suspense>
              }
            />
            <Route
              path="prices"
              element={
                <Suspense fallback={<PageLoader />}>
                  <PricesPage />
                </Suspense>
              }
            />
            <Route
              path="inflation"
              element={
                <Suspense fallback={<PageLoader />}>
                  <InflationPage />
                </Suspense>
              }
            />
            <Route
              path="regions"
              element={
                <Suspense fallback={<PageLoader />}>
                  <RegionsPage />
                </Suspense>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
