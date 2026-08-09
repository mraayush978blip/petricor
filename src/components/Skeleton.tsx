export default function Skeleton({ width = '100%', height = '100%', borderRadius = '4px', style = {} }: { width?: string | number, height?: string | number, borderRadius?: string, style?: any }) {
    return (
        <div
            className="skeleton-shimmer"
            style={{
                width,
                height,
                borderRadius,
                ...style
            }}
        />
    );
}

export function ProductSkeleton() {
    return (
        <div className="product-card" style={{ border: '1px solid #eaeaea', borderRadius: '4px', overflow: 'hidden', backgroundColor: '#fff', width: '260px' }}>
            <Skeleton height="180px" borderRadius="0" />
            <div style={{ padding: '20px' }}>
                <Skeleton height="20px" width="80%" style={{ marginBottom: '10px' }} />
                <Skeleton height="14px" width="40%" style={{ marginBottom: '20px' }} />
                <Skeleton height="35px" width="100%" borderRadius="4px" />
            </div>
        </div>
    );
}
