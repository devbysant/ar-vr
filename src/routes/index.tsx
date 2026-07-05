import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorFallback from '../components/ErrorFallback';

const Home = lazy(() => import('../pages/XRHome'));
const Product = lazy(() => import('../pages/XRProduct'));

const AppRoutes = () => {
    return (
        <ErrorBoundary
            FallbackComponent={ErrorFallback}
            onReset={() => {
                window.location.reload();
            }}
        >
            <Suspense
                fallback={
                    <div className="flex justify-center items-center h-screen w-screen">
                        <div className="loader" />
                    </div>
                }
            >
                <Routes>
                    <Route path="/product/:id" element={<Home />} />
                    <Route path="/xr/:id" element={<Product />} />
                </Routes>
            </Suspense>
        </ErrorBoundary>
    );
};

export default AppRoutes;
