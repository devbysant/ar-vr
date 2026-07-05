const ErrorFallback = ({
    resetErrorBoundary,
}: {
    error: Error;
    resetErrorBoundary: () => void;
}) => (
    <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100dvh',
        width: '100vw',
        background: '#0a0a0b',
        gap: '16px',
        padding: '24px',
    }}>
        <div style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            background: 'rgba(239,68,68,0.12)',
            border: '1px solid rgba(239,68,68,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.8">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" />
            </svg>
        </div>
        <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 18, fontWeight: 700, color: '#f4f4f5', marginBottom: 6 }}>
                Something went wrong
            </p>
            <p style={{ fontSize: 13, color: '#71717a' }}>
                Wayne E Solutions · Please try again
            </p>
        </div>
        <button
            onClick={resetErrorBoundary}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 24px',
                fontSize: 13,
                fontWeight: 600,
                color: '#f4f4f5',
                background: '#222226',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                cursor: 'pointer',
            }}
        >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
            </svg>
            Try Again
        </button>
    </div>
);

export default ErrorFallback;
