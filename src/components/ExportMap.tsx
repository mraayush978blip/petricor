import { useState } from 'react';

interface DestinationDot {
    id: string;
    name: string;
    flag: string;
    top: string;
    left: string;
    region: string;
}

const DESTINATION_DOTS: DestinationDot[] = [
    // NORTH AMERICA
    { id: 'us-west', name: 'United States (West)', flag: '🇺🇸', top: '38.0%', left: '28.5%', region: 'North America' },
    { id: 'us-east', name: 'United States (East)', flag: '🇺🇸', top: '33.0%', left: '36.0%', region: 'North America' },
    { id: 'ca', name: 'Canada', flag: '🇨🇦', top: '22.5%', left: '28.5%', region: 'North America' },
    { id: 'mx', name: 'Mexico', flag: '🇲🇽', top: '47.0%', left: '31.5%', region: 'North America' },

    // EUROPE
    { id: 'uk', name: 'United Kingdom', flag: '🇬🇧', top: '26.0%', left: '46.5%', region: 'Europe' },
    { id: 'de', name: 'Germany', flag: '🇩🇪', top: '23.0%', left: '55.5%', region: 'Europe' },
    { id: 'nl', name: 'Netherlands', flag: '🇳🇱', top: '24.5%', left: '50.0%', region: 'Europe' },
    { id: 'fr', name: 'France', flag: '🇫🇷', top: '29.0%', left: '48.0%', region: 'Europe' },
    { id: 'it', name: 'Italy', flag: '🇮🇹', top: '31.0%', left: '52.5%', region: 'Europe' },
    { id: 'es', name: 'Spain', flag: '🇪🇸', top: '32.0%', left: '45.0%', region: 'Europe' },

    // MIDDLE EAST & SOUTH ASIA
    { id: 'sa', name: 'Saudi Arabia', flag: '🇸🇦', top: '42.0%', left: '58.5%', region: 'Middle East' },
    { id: 'np', name: 'Nepal', flag: '🇳🇵', top: '41.5%', left: '69.5%', region: 'South Asia' },
    { id: 'bd', name: 'Bangladesh', flag: '🇧🇩', top: '44.0%', left: '71.5%', region: 'South Asia' },
    { id: 'lk', name: 'Sri Lanka', flag: '🇱🇰', top: '53.0%', left: '68.0%', region: 'South Asia' },

    // EAST & SOUTHEAST ASIA
    { id: 'th', name: 'Thailand', flag: '🇹🇭', top: '47.0%', left: '75.0%', region: 'Southeast Asia' },
    { id: 'vn', name: 'Vietnam', flag: '🇻🇳', top: '46.0%', left: '77.0%', region: 'Southeast Asia' },
    { id: 'my', name: 'Malaysia', flag: '🇲🇾', top: '54.0%', left: '77.0%', region: 'Southeast Asia' },
    { id: 'sg', name: 'Singapore', flag: '🇸🇬', top: '56.5%', left: '77.5%', region: 'Southeast Asia' },
    { id: 'kr', name: 'South Korea', flag: '🇰🇷', top: '34.0%', left: '82.5%', region: 'East Asia' },
    { id: 'jp', name: 'Japan', flag: '🇯🇵', top: '36.5%', left: '78.5%', region: 'East Asia' },
];

export default function ExportMap() {
    const [hoveredDot, setHoveredDot] = useState<DestinationDot | null>(null);

    return (
        <div style={{ width: '100%', position: 'relative', textAlign: 'center' }}>
            {/* CLEAN MAP IMAGE CONTAINER */}
            <div style={{ position: 'relative', width: '100%', maxWidth: '1050px', margin: '0 auto', backgroundColor: '#fff' }}>
                <img
                    src="/images/map.png"
                    alt="Global Export Map"
                    style={{ width: '100%', height: 'auto', display: 'block' }}
                />

                {/* ELEGANT PULSING DOTS AT EXACT ROOT ENDPOINTS */}
                {DESTINATION_DOTS.map((dot, idx) => {
                    const isHovered = hoveredDot?.id === dot.id;

                    return (
                        <div
                            key={dot.id}
                            onMouseEnter={() => setHoveredDot(dot)}
                            onMouseLeave={() => setHoveredDot(null)}
                            style={{
                                position: 'absolute',
                                top: dot.top,
                                left: dot.left,
                                transform: 'translate(-50%, -50%)',
                                cursor: 'pointer',
                                zIndex: isHovered ? 10 : 2
                            }}
                        >
                            {/* Expanding Ring */}
                            <div
                                style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    width: isHovered ? '24px' : '16px',
                                    height: isHovered ? '24px' : '16px',
                                    border: isHovered ? '2px solid #7c5847' : '1.5px solid #8b6352',
                                    borderRadius: '50%',
                                    animation: 'pulse-ring 2s infinite',
                                    animationDelay: `${(idx % 5) * 0.3}s`,
                                    transition: 'all 0.2s ease'
                                }}
                            />

                            {/* Center Pin Dot */}
                            <div style={{
                                width: isHovered ? '10px' : '6px',
                                height: isHovered ? '10px' : '6px',
                                backgroundColor: isHovered ? '#7c5847' : '#8b6352',
                                borderRadius: '50%',
                                border: '1px solid #ffffff',
                                boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                                transition: 'all 0.2s ease'
                            }} />

                            {/* Hover Tooltip Popup */}
                            {isHovered && (
                                <div style={{
                                    position: 'absolute',
                                    bottom: '18px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    backgroundColor: '#ffffff',
                                    color: '#2c2c2c',
                                    padding: '6px 12px',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    fontWeight: '700',
                                    boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
                                    border: '1px solid #7c5847',
                                    whiteSpace: 'nowrap',
                                    pointerEvents: 'none',
                                    zIndex: 20,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}>
                                    <span>{dot.flag}</span>
                                    <span>{dot.name}</span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <style>{`
                @keyframes pulse-ring {
                    0% {
                        transform: translate(-50%, -50%) scale(0.5);
                        opacity: 0.8;
                    }
                    100% {
                        transform: translate(-50%, -50%) scale(1.8);
                        opacity: 0;
                    }
                }
            `}</style>
        </div>
    );
}
