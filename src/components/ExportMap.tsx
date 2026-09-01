import { useRef, useState, useCallback, useEffect } from 'react';

const MIN_SCALE = 1;
const MAX_SCALE = 5;

function clamp(val: number, min: number, max: number) {
    return Math.min(Math.max(val, min), max);
}

export default function ExportMap() {
    const containerRef = useRef<HTMLDivElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);

    const [scale, setScale] = useState(1);
    const [translate, setTranslate] = useState({ x: 0, y: 0 });

    // For tracking pinch distance
    const lastPinchDistRef = useRef<number | null>(null);
    // For tracking pan
    const isPanningRef = useRef(false);
    const lastPointerRef = useRef<{ x: number; y: number } | null>(null);
    const activeTouchCountRef = useRef(0);

    // Clamp translation so the image doesn't drift outside its bounds
    const clampTranslate = useCallback((tx: number, ty: number, sc: number) => {
        const container = containerRef.current;
        if (!container) return { x: tx, y: ty };
        const cw = container.clientWidth;
        const ch = container.clientHeight;
        const maxX = (cw * (sc - 1)) / 2;
        const maxY = (ch * (sc - 1)) / 2;
        return {
            x: clamp(tx, -maxX, maxX),
            y: clamp(ty, -maxY, maxY),
        };
    }, []);

    // --- TRACKPAD / MOUSE WHEEL ZOOM ---
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const onWheel = (e: WheelEvent) => {
            // Only intercept pinch gestures (ctrlKey) and trackpad scroll
            if (!e.ctrlKey && Math.abs(e.deltaY) < 5) return;
            e.preventDefault();

            const zoomFactor = e.ctrlKey ? 0.02 : 0.003;
            const delta = -e.deltaY * zoomFactor;

            setScale(prev => {
                const next = clamp(prev + delta * prev, MIN_SCALE, MAX_SCALE);
                setTranslate(t => clampTranslate(t.x, t.y, next));
                return next;
            });
        };

        container.addEventListener('wheel', onWheel, { passive: false });
        return () => container.removeEventListener('wheel', onWheel);
    }, [clampTranslate]);

    // --- TOUCH PINCH TO ZOOM ---
    const getDistance = (a: Touch, b: Touch) =>
        Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);

    const onTouchStart = useCallback((e: React.TouchEvent) => {
        activeTouchCountRef.current = e.touches.length;
        if (e.touches.length === 2) {
            lastPinchDistRef.current = getDistance(e.touches[0], e.touches[1]);
        } else if (e.touches.length === 1) {
            isPanningRef.current = true;
            lastPointerRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
    }, []);

    const onTouchMove = useCallback((e: React.TouchEvent) => {
        if (e.touches.length === 2 && lastPinchDistRef.current !== null) {
            e.preventDefault();
            const newDist = getDistance(e.touches[0], e.touches[1]);
            const ratio = newDist / lastPinchDistRef.current;
            lastPinchDistRef.current = newDist;

            setScale(prev => {
                const next = clamp(prev * ratio, MIN_SCALE, MAX_SCALE);
                setTranslate(t => clampTranslate(t.x, t.y, next));
                return next;
            });
        } else if (e.touches.length === 1 && isPanningRef.current && scale > 1) {
            const touch = e.touches[0];
            const last = lastPointerRef.current;
            if (last) {
                const dx = touch.clientX - last.x;
                const dy = touch.clientY - last.y;
                setTranslate(prev => clampTranslate(prev.x + dx, prev.y + dy, scale));
            }
            lastPointerRef.current = { x: touch.clientX, y: touch.clientY };
        }
    }, [scale, clampTranslate]);

    const onTouchEnd = useCallback(() => {
        lastPinchDistRef.current = null;
        isPanningRef.current = false;
        lastPointerRef.current = null;
        activeTouchCountRef.current = 0;
    }, []);

    // --- MOUSE PAN (desktop) ---
    const onMouseDown = useCallback((e: React.MouseEvent) => {
        if (scale <= 1) return;
        isPanningRef.current = true;
        lastPointerRef.current = { x: e.clientX, y: e.clientY };
        e.preventDefault();
    }, [scale]);

    const onMouseMove = useCallback((e: React.MouseEvent) => {
        if (!isPanningRef.current || !lastPointerRef.current) return;
        const dx = e.clientX - lastPointerRef.current.x;
        const dy = e.clientY - lastPointerRef.current.y;
        setTranslate(prev => clampTranslate(prev.x + dx, prev.y + dy, scale));
        lastPointerRef.current = { x: e.clientX, y: e.clientY };
    }, [scale, clampTranslate]);

    const onMouseUp = useCallback(() => {
        isPanningRef.current = false;
        lastPointerRef.current = null;
    }, []);

    const resetZoom = useCallback(() => {
        setScale(1);
        setTranslate({ x: 0, y: 0 });
    }, []);

    const isZoomed = scale > 1.05;

    return (
        <div style={{ width: '100%', position: 'relative', textAlign: 'center' }}>
            {/* MAP IMAGE CONTAINER */}
            <div
                ref={containerRef}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseUp}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                style={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: '1050px',
                    margin: '0 auto',
                    backgroundColor: '#fff',
                    overflow: 'hidden',
                    borderRadius: '4px',
                    cursor: isZoomed ? 'grab' : 'default',
                    userSelect: 'none',
                    touchAction: 'pan-x pan-y', // allow single-finger scroll on page, pinch handled manually
                }}
            >
                <img
                    ref={imgRef}
                    src="/images/map.webp"
                    alt="Global Export Map"
                    draggable={false}
                    style={{
                        width: '100%',
                        height: 'auto',
                        display: 'block',
                        transform: `scale(${scale}) translate(${translate.x / scale}px, ${translate.y / scale}px)`,
                        transformOrigin: 'center center',
                        transition: isPanningRef.current ? 'none' : 'transform 0.15s ease-out',
                        willChange: 'transform',
                    }}
                />
            </div>

            {/* Hint + Reset */}
            <div style={{
                marginTop: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                minHeight: '24px',
            }}>
                {!isZoomed && (
                    <span style={{ fontSize: '11px', color: '#aaa', fontWeight: '500', letterSpacing: '0.3px' }}>
                        Pinch or scroll to zoom
                    </span>
                )}
                {isZoomed && (
                    <button
                        onClick={resetZoom}
                        style={{
                            fontSize: '11px',
                            color: '#8b6352',
                            background: 'none',
                            border: '1px solid #d9c4b8',
                            borderRadius: '20px',
                            padding: '3px 12px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            letterSpacing: '0.3px',
                        }}
                    >
                        Reset zoom ✕
                    </button>
                )}
            </div>
        </div>
    );
}
