import { useParams } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import XrCube from '../components/XRContainer';
import { useState, Suspense } from 'react';
import { PRODUCTS, getProduct, glbPath } from '../config/models';


const StarRow = ({ rating, count }: { rating: number; count: number }) => (
    <div className="ecom-rating-row">
        <div className="ecom-stars">
            {[1, 2, 3, 4, 5].map(i => (
                <svg key={i} width="13" height="13" viewBox="0 0 24 24"
                    fill={i <= Math.round(rating) ? '#f59e0b' : 'none'}
                    stroke="#f59e0b" strokeWidth="1.5">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
            ))}
        </div>
        <span className="ecom-rating-val">{rating.toFixed(1)}</span>
        <span className="ecom-rating-count">· {count} reviews</span>
    </div>
);

const ViewerToolbar = ({ onReset }: { onReset: () => void }) => (
    <div className="viewer-toolbar">
        <button className="toolbar-btn" title="Perspective">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 3v18" />
            </svg>
        </button>
        <button className="toolbar-btn toolbar-btn-active" title="3D">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
        </button>
        <div className="toolbar-divider" />
        <button className="toolbar-btn" title="Reset" onClick={onReset}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" />
            </svg>
        </button>
        <div className="toolbar-divider" />
        <button className="toolbar-btn" title="Globe">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
        </button>
    </div>
);

const BottomBar = () => (
    <div className="viewer-bottom-bar">
        <button className="bottom-btn" title="Refresh">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" />
            </svg>
        </button>
        <button className="bottom-btn bottom-btn-active" title="3D">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
        </button>
        <button className="bottom-btn" title="Settings">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
            </svg>
        </button>
        <div className="toolbar-divider-v" />
        <button className="bottom-btn" title="Share">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" />
            </svg>
        </button>
        <div className="toolbar-divider-v" />
        <button className="bottom-btn" title="Fullscreen">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3" />
            </svg>
        </button>
    </div>
);

const XrHome = () => {
    const { id } = useParams();

    const firstProduct = PRODUCTS[0];
    const initialProduct = getProduct(id ?? '') ?? firstProduct;
    const [selectedProduct, setSelectedProduct] = useState(initialProduct);
    const [resetKey, setResetKey] = useState(0);

    const handleSelect = (slug: string) => {
        const p = getProduct(slug);
        if (p) { setSelectedProduct(p); setResetKey(k => k + 1); }
    };

    const p = selectedProduct;
    const modelUrl = glbPath(p);

    return (
        <div className="viewer-root">

            {/* ── Header ── */}
            <header className="viewer-header">
                <div className="header-left">
                    <img src="/logo.png" alt="Logo" className="header-logo-img" />
                    <div className="header-divider-v" />
                    <div className="header-breadcrumb">
                        <span className="header-bc-dim">{p.category}</span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 18l6-6-6-6" />
                        </svg>
                        <span className="header-product-name">{p.name}</span>
                    </div>
                </div>
                <div className="header-right">
                    <span className="header-badge">3D</span>
                    <button className="header-share-btn">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                            <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" />
                        </svg>
                        Share
                    </button>
                </div>
            </header>

            {/* ── Body ── */}
            <div className="ecom-body">

                {/* ── LEFT COLUMN (single scroll) ── */}
                <div className="ep-left-col">

                    {/* Product info */}
                    <div className="ep-info">
                        <div className="ecom-category-tag">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                            </svg>
                            {p.category} 
                        </div>
                        <h1 className="ecom-product-name">{p.name}</h1>
                        <p className="ecom-subheading">{p.subheading}</p>

                        {/* Desktop only: rating, price, desc */}
                        <div className="ep-desktop-only">
                            <StarRow rating={p.rating} count={p.reviewCount} />
                            <div className="ecom-price-row">
                                <span className="ecom-price">{p.price}</span>
                                <span className="ecom-price-original">{p.originalPrice}</span>
                                <span className="ecom-discount-badge">{p.discount}</span>
                            </div>
                            <p className="ecom-desc">{p.description}</p>
                        </div>
                    </div>

                    {/* Purchase section */}
                    <div className="ep-purchase">
                        {/* Mobile only: rating + price + desc */}
                        <div className="ep-mobile-only">
                            <StarRow rating={p.rating} count={p.reviewCount} />
                            <div className="ecom-price-row">
                                <span className="ecom-price">{p.price}</span>
                                <span className="ecom-price-original">{p.originalPrice}</span>
                                <span className="ecom-discount-badge">{p.discount}</span>
                            </div>
                            <p className="ecom-desc">{p.description}</p>
                        </div>

                        <div className="ecom-divider" />

                        <div className="ecom-section-label">
                            Select Product
                            <span className="ecom-section-count">{PRODUCTS.length} available</span>
                        </div>
                        <div className="ecom-variants">
                            {PRODUCTS.map(prod => (
                                <button
                                    key={prod.slug}
                                    className={`ecom-variant-btn ${selectedProduct.slug === prod.slug ? 'ecom-variant-active' : ''}`}
                                    onClick={() => handleSelect(prod.slug)}
                                >
                                    <div className="ecom-variant-icon">
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                                                stroke={selectedProduct.slug === prod.slug ? '#a78bfa' : '#71717a'}
                                                strokeWidth="1.5" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                    <div className="ecom-variant-info">
                                        <span className="ecom-variant-name">{prod.name}</span>
                                        <span className="ecom-variant-ext">{prod.category}</span>
                                    </div>
                                    {selectedProduct.slug === prod.slug && (
                                        <svg className="ecom-variant-check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2.5">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    )}
                                </button>
                            ))}
                        </div>

                        <div className="ecom-divider" />

                        <button className="ecom-btn-cart">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                                <line x1="3" y1="6" x2="21" y2="6" />
                                <path d="M16 10a4 4 0 0 1-8 0" />
                            </svg>
                            Add to Cart
                        </button>

                        <a className="ecom-ar-link ecom-ar-desktop-only" href={`/xr/${p.slug}`}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                <path d="M2 8V6a2 2 0 0 1 2-2h4M2 16v2a2 2 0 0 0 2 2h4M22 8V6a2 2 0 0 0-2-2h-4M22 16v2a2 2 0 0 1-2 2h-4" />
                                <circle cx="12" cy="12" r="3" />
                                <path d="M12 5v2M12 17v2M5 12h2M17 12h2" />
                            </svg>
                            View in AR on Mobile
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 18l6-6-6-6" />
                            </svg>
                        </a>
                    </div>

                    {/* Specs */}
                    <div className="ep-specs">
                        <div className="ecom-divider" />
                        <div className="ecom-section-label">Specifications</div>
                        <div className="ecom-specs">
                            <div className="ecom-spec-row">
                                <span className="ecom-spec-key">Format</span>
                                <span className="ecom-spec-val"><span className="ecom-spec-badge-glb">GLB</span></span>
                            </div>
                            {p.specs.map(s => (
                                <div className="ecom-spec-row" key={s.key}>
                                    <span className="ecom-spec-key">{s.key}</span>
                                    <span className={`ecom-spec-val${s.value === 'Yes' ? ' ecom-spec-green' : ''}`}>
                                        {s.value === 'Yes' && (
                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                        )}
                                        {s.value}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="ecom-divider" />

                        <div className="ecom-trust-row">
                            <div className="ecom-trust-item">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                </svg>
                                <span>Commercial License</span>
                            </div>
                            <div className="ecom-trust-item">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                                    <polyline points="17 6 23 6 23 12" />
                                </svg>
                                <span>Instant Download</span>
                            </div>
                            <div className="ecom-trust-item">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                    <circle cx="12" cy="10" r="3" />
                                </svg>
                                <span>AR / VR Ready</span>
                            </div>
                        </div>

                        <div style={{ flex: 1 }} />

                        <div className="ecom-footer">
                            <span className="ecom-footer-brand">Wayne E Solutions</span>
                            <span className="ecom-footer-sub">3D Asset Viewer</span>
                        </div>
                    </div>

                </div>{/* end ep-left-col */}

                {/* ── RIGHT: 3D Viewer ── */}
                <div className="ecom-viewer">
                    <a className="ecom-ar-floating" href={`/xr/${p.slug}`}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path d="M2 8V6a2 2 0 0 1 2-2h4M2 16v2a2 2 0 0 0 2 2h4M22 8V6a2 2 0 0 0-2-2h-4M22 16v2a2 2 0 0 1-2 2h-4" />
                            <circle cx="12" cy="12" r="3" />
                            <path d="M12 5v2M12 17v2M5 12h2M17 12h2" />
                        </svg>
                        View in AR
                    </a>

                    <div className="viewer-top-controls">
                        <ViewerToolbar onReset={() => setResetKey(k => k + 1)} />
                    </div>

                    <div className="canvas-wrapper">
                        <Suspense fallback={
                            <div className="canvas-loader">
                                <div className="loader" />
                                <span className="loader-text">Loading model…</span>
                            </div>
                        }>
                            <Canvas
                                key={resetKey}
                                camera={{ position: [0, 0, 3.5], fov: 45 }}
                                gl={{ antialias: true, alpha: true }}
                                resize={{ scroll: true, debounce: { scroll: 50, resize: 0 } }}
                            >
                                <XrCube position={[0, 0, 0]} fileId={modelUrl} />
                            </Canvas>
                        </Suspense>

                        <div className="canvas-hint">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3M2 12h20M12 2v20" />
                            </svg>
                            Drag to rotate · Scroll to zoom
                        </div>
                    </div>

                    <BottomBar />
                </div>{/* end ecom-viewer */}

            </div>{/* end ecom-body */}
        </div>
    );
};

export default XrHome;
