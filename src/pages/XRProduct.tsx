import '@google/model-viewer';
import { useRef, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { isValidModel, getProduct, glbPath } from '../config/models';

// Target real-world size for furniture in AR (metres).
// GLBs exported in cm/mm will have dims 100x/1000x too large — this corrects that.
const AR_TARGET_MAX_DIM = 1.5;

declare global {
    namespace JSX {
        interface IntrinsicElements {
            'model-viewer': React.DetailedHTMLProps<
                React.HTMLAttributes<HTMLElement> & {
                    src?: string;
                    alt?: string;
                    ar?: boolean | '';
                    'ar-modes'?: string;
                    'ar-placement'?: string;
                    'camera-controls'?: boolean | '';
                    'auto-rotate'?: boolean | '';
                    'shadow-intensity'?: string;
                    'shadow-softness'?: string;
                    'environment-image'?: string;
                    exposure?: string;
                    'tone-mapping'?: string;
                    poster?: string;
                    loading?: string;
                    reveal?: string;
                    style?: React.CSSProperties;
                    className?: string;
                    'ios-src'?: string;
                    'xr-environment'?: boolean | '';
                    'quick-look-browsers'?: string;
                    'camera-orbit'?: string;
                    'min-camera-orbit'?: string;
                    'max-camera-orbit'?: string;
                    'field-of-view'?: string;
                },
                HTMLElement
            >;
        }
    }
}

const XrProduct = () => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const status = searchParams.get('status');
    const showAR = status !== 'false';
    const modelMissing = !isValidModel(id ?? '');
    const product = getProduct(id ?? '');
    const productName = product?.name ?? searchParams.get('name') ?? id ?? 'Product';
    const modelSrc = product ? glbPath(product) : `/${id}.glb`;

    const mvRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const mv = mvRef.current as any;
        if (!mv) return;

        const normaliseScale = () => {
            // getDimensions() returns AABB size in GLTF metres.
            // If the GLB was authored in cm/mm, values are 100×/1000× too large.
            const dims = mv.getDimensions?.();
            if (!dims) return;

            const maxDim = Math.max(
                Math.abs(dims.x ?? 0),
                Math.abs(dims.y ?? 0),
                Math.abs(dims.z ?? 0),
            );
            if (maxDim <= 0) return;

            const s = AR_TARGET_MAX_DIM / maxDim;

            // mv.model is a Three.js Object3D — setting .scale fixes both the
            // 3D preview zoom and the AR placement size in one shot.
            if (mv.model?.scale) {
                mv.model.scale.set(s, s, s);
                mv.updateFraming?.(); // recompute camera framing after scale change
            }
        };

        mv.addEventListener('load', normaliseScale);
        return () => mv.removeEventListener('load', normaliseScale);
    }, [modelSrc]);

    return (
        <div className="xr-root">
            <header className="xr-header">
                <div className="xr-header-inner">
                    <img src="/logo.png" alt="Wayne E Solutions" className="xr-header-logo-img" />
                    <span className="xr-header-title">{productName}</span>
                    <span className="xr-header-badge">AR</span>
                </div>
            </header>

            <div className="xr-canvas-area">
                {modelMissing ? (
                    <div className="model-not-found">
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#52525b" strokeWidth="1.2">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                        </svg>
                        <p className="mnf-title">Model Not Found</p>
                        <p className="mnf-sub">
                            No GLB file matched slug <code className="mnf-code">{id}</code>
                        </p>
                    </div>
                ) : (
                    <model-viewer
                        ref={mvRef as React.Ref<HTMLElement>}
                        src={modelSrc}
                        alt={productName}
                        camera-controls=""
                        auto-rotate=""
                        shadow-intensity="1"
                        shadow-softness="0.8"
                        exposure="1"
                        environment-image="neutral"
                        tone-mapping="commerce"
                        loading="eager"
                        reveal="auto"
                        camera-orbit="0deg 75deg auto"
                        min-camera-orbit="auto auto 0.5m"
                        max-camera-orbit="auto auto 8m"
                        field-of-view="45deg"
                        {...(showAR ? { ar: '' } : {})}
                        ar-modes="webxr scene-viewer quick-look"
                        ar-placement="floor"
                        xr-environment=""
                        style={{
                            width: '100%',
                            height: '100%',
                            display: 'block',
                            '--poster-color': '#0a0a0b',
                        } as React.CSSProperties}
                    >
                        {showAR && (
                            <button
                                slot="ar-button"
                                className="xr-ar-btn"
                                style={{ position: 'absolute', bottom: 36, left: '50%', transform: 'translateX(-50%)' }}
                            >
                                <span className="xr-btn-icon">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                        <path d="M2 8V6a2 2 0 0 1 2-2h4M2 16v2a2 2 0 0 0 2 2h4M22 8V6a2 2 0 0 0-2-2h-4M22 16v2a2 2 0 0 1-2 2h-4" />
                                        <circle cx="12" cy="12" r="3" />
                                        <path d="M12 5v2M12 17v2M5 12h2M17 12h2" />
                                    </svg>
                                </span>
                                View in AR
                                <span className="xr-btn-badge">LIVE</span>
                            </button>
                        )}
                        <div slot="progress-bar" className="mv-progress-bar" />
                    </model-viewer>
                )}
            </div>
        </div>
    );
};

export default XrProduct;
