import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface Event {
  id: string;
  title: string | null;
  image_url: string;
}

const EventsMarquee = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching events:', error);
      } else {
        setEvents(data || []);
      }
      setLoading(false);
    };

    fetchEvents();
  }, []);

  if (loading || events.length === 0) {
    return null; // Don't show anything if no events or still loading
  }

  // Duplicate events to create a seamless infinite scrolling effect
  // Depending on screen size, we might need multiple copies
  const displayEvents = [...events, ...events, ...events, ...events];

  return (
    <div style={{ backgroundColor: '#eaeaea', padding: '15px 0', overflow: 'hidden', position: 'relative', borderTop: '1px solid #dcdcdc' }}>
      <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '1px' }}>
        Events and Exhibition
      </div>
      <div className="marquee-container">
        <div className="marquee-content">
          {displayEvents.map((event, index) => (
            <div 
              key={`${event.id}-${index}`} 
              className="marquee-item"
            >
              <img 
                src={event.image_url} 
                alt={event.title || 'Event'} 
                className="marquee-image"
              />
              {event.title && (
                <span style={{ fontSize: '12px', color: '#333', marginTop: '8px', fontWeight: '500', whiteSpace: 'normal', textAlign: 'center', lineHeight: '1.2' }}>
                  {event.title}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
      <style>{`
        .marquee-container {
          overflow: hidden;
          width: 100%;
        }
        
        .marquee-content {
          display: flex;
          width: max-content;
          animation: marquee 40s linear infinite;
        }

        .marquee-content:hover {
          animation-play-state: paused;
        }

        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .marquee-item {
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          margin: 0 35px;
          width: 160px;
        }

        .marquee-image {
          width: 140px;
          height: 80px;
          object-fit: contain;
        }

        @media (max-width: 768px) {
          .marquee-item {
            margin: 0 15px;
            width: 120px;
          }
          .marquee-image {
            width: 100px;
            height: 60px;
          }
        }
      `}</style>
    </div>
  );
};

export default EventsMarquee;
