import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
const PrayerRequests = () => {
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { getRequests() }, []);
  
  const getRequests = async () => {
    const { data, error } = await supabase.from('prayer_requests').select().order('created_at', { ascending: false})
    if (error) {
      setError('Failed to load prayer requests: ' + error.message);
    } else {
      setRequests(data || []);
    }
    setLoading(false);
  }
  
  const MarkAsPrayed = async (id) => {
    const { error } = await supabase.from('prayer_requests').update({ is_prayed_for: true }).eq('id', id);
    if (error) {
      setError('Failed to MarkAsPrayed prayer for: ' + error.message);
    } else {
      getRequests();
    }
  }
  
  const deletePrayer = async (id) => {
    if (!window.confirm('This action cannot be undone, are you sure you want to delete this prayer request?')) return;
    setError(null);
    const { error } = await supabase.from('prayer_requests').delete().eq('id', id);
    if (error) {
      setError('Failed to delete: ' + error.message);
    } else {
      getRequests();
    }
  }
  return (
      <div className='requests'>
        <h3>Prayer Requests submitted</h3>
        {loading && <p className='empty'>Loading prayer requests...</p>}
        {!loading && requests.length === 0 ? <p className='empty'>No prayer requests sent in yet!</p> :
        <div className='wrapper'>
          <table>
            <caption>Prayer requests sent in</caption>
            <thead>
              <tr><th>Name</th><th>Prayer point</th><th>Time sent</th><th>Private</th><th>Prayed for</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {requests.map(req => (
                <tr key={req.id}>
                <td data-label='Name'>{req.name}</td>
                <td data-label='Prayer point'>{req.request}</td>
                <td data-label='Time sent'>{new Date(req.created_at).toLocaleDateString('en-UG', {
                 day: 'numeric',
                 month: 'short',
                 year: 'numeric'
                })}</td>
                <td data-label='Private ?'>{req.is_private === true ? 'Yes' : 'No'}</td>
                <td data-label='Prayed for ?'>{!!req.is_prayed_for === true ? 'Yes' : 'No'}</td>
                <td data-label='Actions'>
                  {!req.is_prayed_for && <button onClick={() => MarkAsPrayed(req.id)} className='prayer__action done'>Mark Prayed</button>}
                  <button onClick={() => deletePrayer(req.id)} className='prayer__action danger'>Delete</button>
                </td>
              </tr>
              ))}
            </tbody>
          </table>
        </div>}
        {error && <p className='prayer__error'>{error}</p>}
      </div>
    );
}
export default PrayerRequests;