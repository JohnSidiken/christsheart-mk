import { useState } from 'react';
import { supabase } from '../lib/supabase.js';
const PrayerRequestForm = () => {
  const [name, setName] = useState('');
  const [request, setRequest] = useState('');
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !request.trim()) {
      setError('Both fields must be filled before sending!');
      return;
    }
    setError(null);
    setSaving(true);
    const { error } = await supabase.from('prayer_requests').insert({ name: name.trim(), request: request.trim() });
    if (error) {
      setError('Failed to send prayer request: ' + error.message);
    } else {
      setName('');
      setRequest('');
      setMessage("Prayer Request Sent. Pastors are going to pray and it's gonna be well with you. And through it all, God is so faithful!");
      setTimeout(() => setMessage(''), 10000);
    }
    setSaving(false);
  }
  return (
      <div id='request' className='prayer'>
        <h3>Send in your prayer request</h3>
        <form onSubmit={handleSubmit} className='prayer__form'>
          <div>
            <label htmlFor='name'>Name:</label>
            <input 
            id='name'
            type='text'
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError(null);
            }}
            placeholder='John ...'
            disabled={saving}
          />
          </div>
          <div>
            <label htmlFor='prayer'>Prayer request:</label>
            <input
          id='prayer'
            type='text'
            value={request}
            onChange={(e) => {
              setRequest(e.target.value);
              setError(null);
            }}
            placeholder='Pray for ...'
            disabled={saving}
            className='prayer__input'
          />
          </div>
          {error && <p className='prayer__error'>{error}</p>}
          <div className='btn-wrapper'>
            <button type='submit' disabled={saving} className='request__btn'>{saving? 'sending' : 'Send'}</button>
          </div>
        </form>
        {message && <p className='prayer__success'>{message}</p>}
      </div>
    );
}
export default PrayerRequestForm;