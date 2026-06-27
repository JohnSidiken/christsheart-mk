import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const PublicPage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingEvents, setLoadingEvents] = useState(true);
  
  useEffect(() => {
    getAnnouncements();
    getEvents();
  }, []);
  
  const getAnnouncements = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('announcements').select().order('created_at', { ascending: false });
    if (error) {
      setError('Faled to load announcements: ' + error.message);
    } else {
      setAnnouncements(data);
    }
    setLoading(false);
  };
  
  const getEvents = async () => {
    setLoadingEvents(true);
    setError(null);
    const { data, error } = await supabase.from('events').select().order('created_at', { ascending: false });
    if (error) {
      setError('Failed to load events: ' + error.message);
    } else {
      setEvents(data);
    }
    setLoadingEvents(false);
  }
  return (
      <div className='main__container'>
        <h2 className='chm__title'>Updates</h2>
        {loading && <p className='empty'>Loading announcements...</p>}
        {!loading && announcements.length === 0 && <p className='empty'>No announcements yet!</p>}
        {announcements.map(a => (
        <div key={a.id} className='ann__card'>
          <p style={{ fontSize: '1.1rem', margin: 0 }}>{a.content}</p>
          <small style={{ color: '#666', marginTop: '6px' }}>Posted: {new Date(a.created_at).toLocaleDateString('en-UG', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          })}</small>
        </div>
        ))}
        {error && <div className='error'>{error}</div>}
        {loadingEvents && <p className='empty'>Loading upcoming events....</p>}
        {!loadingEvents && events.length === 0 && <p className='empty'>No upcoming events yet, if any, will appear here!</p>}
        {events.map(event => (
          <div key={event.id} className='events__card'>
            {event.photo_url && <div className='image-wrapper'>
              <img
              src={event.photo_url}
              alt={event.title}
              className='event__image'
            />
            </div>}
            <div>
              <h3>{event.title}</h3>
              <p>{event.description}</p>
              <small className='small'>Date & Time: {new Date(event.event_date).toLocaleString()}</small>
            </div>
          </div>
        ))}
      </div>
    );
}
export default PublicPage;