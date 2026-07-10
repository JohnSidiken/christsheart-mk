import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import PrayerRequests from '../components/PrayerRequests';
import Members from '../components/Members'

const AdminPanel = () => {
  // ANNOUNCEMENTS STATE
  const [announcements, setAnnouncements] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [newContent, setNewContent] = useState('');

  // EVENTS STATE
  const [events, setEvents] = useState([]);
  const [eventForm, setEventForm] = useState({title: '', description: '', eventDate: ''});
  const [eventFile, setEventFile] = useState(null);

  // NEW: Edit mode for events
  const [editingEventId, setEditingEventId] = useState(null);
  const [editingEventForm, setEditingEventForm] = useState({title: '', description: '', eventDate: ''});
  const [editingEventFile, setEditingEventFile] = useState(null);

  // SHARED STATE
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getAnnouncements();
    getEvents();
  }, []);

  // ========== ANNOUNCEMENTS CRUD ==========
  const getAnnouncements = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
    .from('announcements')
    .select()
    .order('created_at', { ascending: false });
    if (error) {
      setError('Failed to load announcements: ' + error.message);
    } else {
      setAnnouncements(data);
    }
    setLoading(false);
  }

  const addAnnouncement = async () => {
    if (!newContent.trim()) {
      setError('This field cannot be empty!');
      return;
    }
    setSaving(true);
    setError(null);
    const { error } = await supabase.from('announcements').insert({ content: newContent });
    if (error) {
      setError('Failed to post ' + error.message);
    } else {
      setNewContent('');
      getAnnouncements();
    }
    setSaving(false);
  }

  const updateAnnouncement = async (id) => {
    if (!editingText.trim()) {
      setError('Announcement text cannot be empty!');
      return;
    }
    setSaving(true);
    setError(null);
    const { error } = await supabase.from('announcements').update({ content: editingText }).eq('id', id);
    if (error) {
      setError('Failed to update: ' + error.message);
    } else {
      setEditingId(null);
      setEditingText('');
      getAnnouncements();
    }
    setSaving(false);
  }

  const deleteAnnouncement = async (id) => {
    if (!confirm('Do you want to delete this announcement? This action cannot be reversed!')) return;
    setError(null);
    const { error } = await supabase.from('announcements').delete().eq('id', id);
    if (error) {
      setError('Failed to delete: ' + error.message);
    } else {
      getAnnouncements();
    }
  }

  // ========== EVENTS CRUD ==========
  const getEvents = async () => {
    const { data, error } = await supabase
    .from('events')
    .select()
    .order('event_date', { ascending: true });

    if (error) setError('Failed to load events: ' + error.message);
    else setEvents(data);
  }

  const addEvent = async () => {
    if (!eventForm.title ||!eventForm.eventDate) {
      setError('Title and Date+Time required');
      return;
    }

    setSaving(true);
    const eventId = crypto.randomUUID();
    let photo_url = null;
    let photo_path = null;

    try {
      if (eventFile) {
        const fileName = `${Date.now()}-${eventFile.name.replace(/\s+/g, '-')}`;
        photo_path = `event/${eventId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
        .from('events')
        .upload(photo_path, eventFile);
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
        .from('events')
        .getPublicUrl(photo_path);
        photo_url = urlData.publicUrl;
      }

      const { error: insertError } = await supabase.from('events').insert({
        id: eventId,
        title: eventForm.title.trim(),
        description: eventForm.description.trim(),
        event_date: eventForm.eventDate,
        photo_url,
        photo_path
      });

      if (insertError) throw insertError;

      setEventForm({title: '', description: '', eventDate: ''});
      setEventFile(null);
      getEvents();

    } catch (err) {
      setError('Failed to add event: ' + err.message);
    }
    setSaving(false);
  }

  // Update event
  const updateEvent = async () => {
    if (!editingEventForm.title ||!editingEventForm.eventDate) {
      setError('Title and Date+Time required');
      return;
    }

    setSaving(true);
    let photo_url = null;
    let photo_path = null;

    try {
      const currentEvent = events.find(e => e.id === editingEventId);
      photo_url = currentEvent.photo_url;
      photo_path = currentEvent.photo_path;

      if (editingEventFile) {
        if (photo_path) {
          await supabase.storage.from('events').remove([photo_path]);
        }

        const fileName = `${Date.now()}-${editingEventFile.name.replace(/\s+/g, '-')}`;
        photo_path = `event/${editingEventId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
        .from('events')
        .upload(photo_path, editingEventFile);
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
        .from('events')
        .getPublicUrl(photo_path);
        photo_url = urlData.publicUrl;
      }

      const { error: updateError } = await supabase.from('events')
      .update({
          title: editingEventForm.title.trim(),
          description: editingEventForm.description.trim(),
          event_date: editingEventForm.eventDate,
          photo_url,
          photo_path
        })
      .eq('id', editingEventId);

      if (updateError) throw updateError;

      setEditingEventId(null);
      setEditingEventForm({title: '', description: '', eventDate: ''});
      setEditingEventFile(null);
      getEvents();

    } catch (err) {
      setError('Failed to update event: ' + err.message);
    }
    setSaving(false);
  }

  const deleteEvent = async (id, photo_path) => {
    if (!confirm('Delete this event? This cannot be undone!')) return;

    if (photo_path) {
      await supabase.storage.from('events').remove([photo_path]);
    }

    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) setError('Delete failed: ' + error.message);
    else getEvents();
  }

  return (
    <div style={{
      padding: '1rem'
    }}>
      <h2 style={{ color: '#2c3e50', marginBottom: '1rem' }}>Admin Panel</h2>

      {error && (
        <div className='error'>
          ⚠️ {error}
        </div>
      )}

      {/* ========== ANNOUNCEMENTS SECTION ========== */}
      <div style={{
        padding: '1rem',
        marginBottom: '2rem',
        border: '1px dashed #ccc',
        borderRadius: '12px'
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '1rem', textAlign: 'center' }}>Add New Announcement</h3>
        <input
          type='text'
          value={newContent}
          onChange={e => setNewContent(e.target.value)}
          placeholder='Type Announcement here...'
          style={{
          width: '70%',
          padding: '0.5rem',
          marginBottom: '1rem',
          borderRadius: '10px'
        }}
          disabled={saving}
        />
        <button onClick={addAnnouncement} style={{
          padding: '0.5rem 1rem',
          color: 'white',
          borderRadius: '6px',
          border: 'none',
          marginLeft: '0.5rem',
          fontWeight: 'bold',
          background: saving? '#95a5a6' : '#3498db',
          cursor: saving? 'not-allowed' : 'pointer'
        }}>
          {saving? 'Posting...' : 'Post'}
        </button>

        <h3 style={{
          marginBottom: '1rem',
          textAlign: 'center'
        }}>Manage Announcements</h3>
        {loading && <p>Loading announcements...</p>}
        {!loading && announcements.length === 0 && <p>No announcements yet! Create one above!</p>}

        {announcements.map(a => (
          <div key={a.id} style={{
            border: '1px solid #ddd',
            marginBottom: '1rem',
            padding: '1rem',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            borderRadius: '10px'
          }}>
            {editingId === a.id? (
              <>
                <input
                  value={editingText}
                  onChange={e => setEditingText(e.target.value)}
                  style={{
                    width: '70%',
                    padding: '0.75rem',
                    fontSize: '1em',
                    marginBottom: '0.5rem',
                    borderRadius: '6px',
                    border: '1px solid #ddd'
                  }}
                  disabled={saving}
                />
                <button
                  onClick={() => updateAnnouncement(a.id)}
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#27ae60',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    marginLeft: '0.5rem'
                  }}
                >{saving? 'Saving...' : 'Save'}</button>
                <button
                  onClick={() => setEditingId(null)}
                  style={{
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0.5rem 1rem',
                    background: '#95a5a6',
                    marginLeft: '0.5rem'
                  }}
                >Cancel</button>
              </>
            ): (
              <>
                <p style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>{a.content}</p>
                <small style={{ color: '#666' }}>Posted: {new Date(a.created_at).toLocaleDateString()}</small>
                <br />
                <button
                  onClick={() => {setEditingId(a.id); setEditingText(a.content);}}
                  style={{
                    color: 'white',
                    background: '#3498db',
                    border: 'none',
                    borderRadius: '6px',
                    marginRight: '0.5rem',
                    padding: '0.5rem 1rem',
                    marginTop: '0.5rem'
                  }}
                >Edit</button>
                <button onClick={() => deleteAnnouncement(a.id)} style={{
                  border: 'none',
                  borderRadius: '6px',
                  color: 'white',
                  background: '#e74c3c',
                  padding: '0.5rem 1rem',
                  marginLeft: '0.5rem',
                  marginTop: '0.5rem'
                }}>Delete</button>
              </>
            )}
          </div>
        ))}
      </div>

      {/* ========== EVENTS SECTION ========== */}
      <div style={{
        padding: '1.5rem',
        marginTop: '3rem',
        border: '2px solid #3498db',
        borderRadius: '12px'
      }}>
        <h3 style={{
        marginTop: 0,
        color: '#2c3e50',
        textAlign: 'center',
        marginBottom: '0.5rem'
      }}>Manage Events</h3>

        {/* Add Event Form */}
        <div style={{ marginBottom: '2rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
          <h4 style={{
            marginBottom: '0.5rem'
          }}>Add New Event</h4>
          <input
            type="text"
            placeholder="Event Title"
            value={eventForm.title}
            onChange={e => {
              setEventForm({...eventForm, title: e.target.value});
              setError(null);
            }}
            style={{ width: '70%', padding: '0.5rem', marginBottom: '0.5rem', display: 'block', borderRadius: '6px', border: '1px solid #ddd' }}
          />
          <textarea
            placeholder="Description"
            value={eventForm.description}
            onChange={e => {
              setEventForm({...eventForm, description: e.target.value});
              setError(null);
            }}
            rows="2"
            style={{ width: '70%', padding: '0.5rem', marginBottom: '0.5rem', display: 'block', borderRadius: '6px', border: '1px solid #ddd' }}
          />
          <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>Date & Time</label>
          <input
            type="datetime-local"
            value={eventForm.eventDate}
            onChange={e => setEventForm({...eventForm, eventDate: e.target.value})}
            style={{ padding: '0.5rem', marginBottom: '0.5rem', display: 'block', borderRadius: '6px', border: '1px solid #ddd' }}
          />
          <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>Photo - Optional</label>
          <input
            type="file"
            accept="image/*"
            onChange={e => setEventFile(e.target.files[0])}
            style={{ marginBottom: '0.5rem', display: 'block' }}
          />
          <button
            onClick={addEvent}
            disabled={saving}
            style={{
              padding: '0.5rem 1rem',
              background: saving? '#95a5a6' : '#27ae60',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: saving? 'not-allowed' : 'pointer',
              fontWeight: 'bold'
            }}
          >
            {saving? 'Saving...' : 'Add Event'}
          </button>
        </div>

        {/* Events List - WITH EDIT MODE */}
        <h4 style={{
          marginBottom: '0.5rem',
          textAlign: 'center'
        }}>All Events</h4>
        {events.length === 0 && <p>No events yet. Create one above!</p>}
        {events.map(event => (
          <div key={event.id} style={{
            border: '1px solid #ddd',
            marginBottom: '1rem',
            padding: '1rem',
            borderRadius: '10px',
            display: 'flex',
            gap: '1rem',
            alignItems: 'flex-start'
          }}>
            {event.photo_url && (
              <img src={event.photo_url} alt={event.title} style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} />
            )}
            <div style={{ flex: 1 }}>
              {editingEventId === event.id? (
                // EDIT MODE
                <>
                  <input
                    type="text"
                    value={editingEventForm.title}
                    onChange={e => setEditingEventForm({...editingEventForm, title: e.target.value})}
                    style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem', borderRadius: '6px', border: '1px solid #ddd' }}
                  />
                  <textarea
                    value={editingEventForm.description}
                    onChange={e => setEditingEventForm({...editingEventForm, description: e.target.value})}
                    rows="2"
                    style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem', borderRadius: '6px', border: '1px solid #ddd' }}
                  />
                  <input
                    type="datetime-local"
                    value={editingEventForm.eventDate}
                    onChange={e => setEditingEventForm({...editingEventForm, eventDate: e.target.value})}
                    style={{ padding: '0.5rem', marginBottom: '0.5rem', borderRadius: '6px', border: '1px solid #ddd', display: 'block' }}
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => setEditingEventFile(e.target.files[0])}
                    style={{ marginBottom: '0.5rem', display: 'block', fontSize: '0.8rem' }}
                  />
                  <button onClick={updateEvent} disabled={saving} style={{ padding: '0.4rem 0.8rem', background: '#27ae60', color: 'white', border: 'none', borderRadius: '6px', marginRight: '0.5rem', cursor: 'pointer' }}>
                    {saving? 'Saving...' : 'Save'}
                  </button>
                  <button onClick={() => setEditingEventId(null)} style={{ padding: '0.4rem 0.8rem', background: '#95a5a6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                    Cancel
                  </button>
                </>
              ) : (
                // VIEW MODE
                <>
                  <p style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: 'bold' }}>{event.title}</p>
                  <p style={{ margin: '0 0 0.5rem 0', color: '#555' }}>{event.description}</p>
                  <small style={{ color: '#666' }}>
                    When: {new Date(event.event_date).toLocaleString()}
                  </small>
                  <br />
                  <button
                    onClick={() => {
                      setEditingEventId(event.id);
                      setEditingEventForm({
                        title: event.title,
                        description: event.description,
                        eventDate: event.event_date.slice(0, 16)
                      });
                    }}
                    style={{
                      color: 'white',
                      background: '#3498db',
                      border: 'none',
                      borderRadius: '6px',
                      marginRight: '0.5rem',
                      padding: '0.5rem 1rem',
                      marginTop: '0.5rem',
                      cursor: 'pointer'
                    }}
                  >Edit</button>
                  <button
                    onClick={() => deleteEvent(event.id, event.photo_path)}
                    style={{
                      border: 'none',
                      borderRadius: '6px',
                      color: 'white',
                      background: '#e74c3c',
                      padding: '0.5rem 1rem',
                      marginTop: '0.5rem',
                      cursor: 'pointer'
                    }}
                  >Delete</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* ===== MEMBERS =====*/}
      <Members />
      {/* ===== PRAYER RRQUESTS ===== */}
      <PrayerRequests />
    </div>
  );
}

export default AdminPanel;