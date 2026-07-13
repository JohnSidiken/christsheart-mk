import { createPortal } from 'react-dom';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
const Members = () => {
  const [members, setMembers] = useState([]);
  const [memberForm, setMemberForm] = useState({ name: '', phone: '', member_group: 'Ordinary Member' });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(null);
  const [saveError, setSaveError] = useState(null);
  
  const [editingMember, setEditingMember] = useState(null);
  const [editSuccess, setEditSuccess] = useState(null);
  const [editError, setEditError] = useState(null);
  
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState('');
  const [searchError, setSearchError] = useState(null);
  
  const nameInputRef = useRef(null);
  
  const GROUPS = ['Ordinary Member', 'Pastors', 'Elders', 'Admins', 'Men', 'Youths', 'Women'];
  
  useEffect(() => {
    getMembers();
  }, []);
  
  useEffect(() => {
    if (!editingMember) return;
    nameInputRef.current?.focus();
    document.body.style.overflow = 'hidden';
    const handleEsc = (event) => {
      if (event.key === 'Escape') setEditingMember(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    }
  }, [editingMember]);
  
  useEffect(() => {
    if (!search.trim()) {
      getMembers();
      return
    };
    const searchMember = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('members').select().ilike('name', `%${search}%`).order('created_at', { ascending: false });
      if (error) {
        setSearchError('Failed to find member: ' + error.message);
      } else {
        setMembers(data || []);
      }
      setLoading(false);
    };
    const timer = setTimeout(() => searchMember(), 500);
    return () => clearTimeout(timer);
  }, [search]);
  
  const getMembers = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('members').select().order('created_at', { ascending: false });
    if (error) {
      setError('⚠️ Failed to load members: ' + error.message);
    } else {
      setMembers(data || []);
    }
    setLoading(false);
  }
  
  // ========= Add Member =========
  const addMember = async (e) => {
    e.preventDefault();
    if (!memberForm.name.trim()) {
      setSaveError('Provide atleast a name to save');
      return;
    }
    setSaving(true);
    const { error } = await supabase.from('members').insert({ name: memberForm.name.trim(), phone: memberForm.phone.trim(), member_group: memberForm.member_group });
    if (error) {
      setSaveError('Failed to add member: ' + error.message);
    } else {
      getMembers();
      setMemberForm({ name: '', phone: '', member_group: 'Ordinary Member' });
      setSuccess('Member added successfully.');
    }
    setSaving(false);
    setTimeout(() => {
      setSuccess(null);
    }, 10000);
  }
  
  // ======== Update Member =========
  const openEditModal = (member) => {
    setEditingMember({ ...member });
    setEditError(null);
    setEditSuccess(null);
  };
  
  const updateMemberDetails = async (e) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from('members').update({ name: editingMember.name.trim(), phone: editingMember.phone.trim(), member_group: editingMember.member_group }).eq('id', editingMember.id);
    if (error) {
      setEditError('Failed to update member details: ' + error.message);
    } else {
      getMembers();
      setEditingMember(null);
      setEditSuccess('Member details updated successfully');
    }
    setSaving(false);
    setTimeout(() => setEditSuccess(null), 5000);
  }
  
  return (
      <div className='members'>
        <h3>Manage Members</h3>
        {/* ==== form to add Member ==== */}
        <form onSubmit={addMember} className='members__form'>
          <h4>Add Member</h4>
          <div>
            <label htmlFor='name'>Name</label>
            <input
              id='name'
              type='text'
              value={memberForm.name}
              onChange={(e) => {
              setMemberForm({ ...memberForm, name: e.target.value });
              setSaveError(null);
             }}
              placeholder="Member's Name"
              required
              disabled={saving}
            />
          </div>
          <div>
            <label htmlFor='phone'>Phone</label>
            <input 
              id='phone'
              type='tel'
              value={memberForm.phone}
              onChange={(e) => {
                setMemberForm({ ...memberForm, phone: e.target.value });
                setSaveError(null);
              }}
              placeholder='+256 7XX XXXXXX'
              maxLength={15}
              disabled={saving}
            />
          </div>
          <div>
            <label htmlFor='group'>Group</label>
            <select
              id='group'
              value={memberForm.member_group}
              onChange={(e) => {
                setMemberForm({ ...memberForm, member_group: e.target.value });
                setSaveError(null);
              }}
              disabled={saving}
            >
              {GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <button type='submit' disabled={saving}>Add Member</button>
          {saveError && <p className='member__error'>{saveError}</p>}
          {success && <p className='member__success'>{success}</p>}
        </form>
        
        <div className='search-wrapper'>
          <input 
            type='text'
            aria-label='Search member'
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSearchError(null);
            }}
            placeholder='🔍 Search member'
            className='search'
          />
          {search && <button onClick={() => {
            setSearch('');
            setSearchError(null);
          }} className='c-search-btn'>X</button>}
        </div>
        {searchError && <p className='member__error'>{searchError}</p>}
        <>
          {loading && <p className='empty'>Loading members...</p>}
          {!loading && members.length === 0 && <p className='empty'>No members added yet, added members will appear here!</p>}
          {error && <p className='member__error'>{error}</p>}
        </>
        
        {/* ==== member table ==== */}
        <div className='wrapper members'>
          <h4>All church Members</h4>
          {members.length > 0 && <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Group</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map(m => (
                <tr key={m.id}>
                  <td>{m.name}</td>
                  <td>{m.phone}</td>
                  <td>{m.member_group}</td>
                  <td>
                    <button onClick={() => openEditModal(m)} className='members__action'>✏️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>}
        </div>
        
        {/* ==== Mobile member cards ==== */}
        {members.length > 0 && <div className='members__card'>
          <h3>All church members with their respective groups (GR).</h3>
          <ul>
            {members.map(m => <li key={m.id} className='member__card'>
              <span className='member__name'>{m.name}</span>
              <span>{m.phone}</span>
              <span>GR: {m.member_group}</span>
              <button onClick={() => openEditModal(m)} className='members__action'>✏️</button>
            </li>)}
          </ul>
        </div>}
        
        {/* ===== edit Modal ===== */}
        {editingMember && createPortal(
        <div className='modal-overlay' onClick={() => setEditingMember(null)}>
          <div className='edit-modal' onClick={(e) => e.stopPropagation()}>
            <form onSubmit={updateMemberDetails} className='edit__form'>
              <h3>Edit Member details.</h3>
              <div>
                <label htmlFor='edit-name'>Name</label>
                <input 
                  id='edit-name'
                  type='text'
                  ref={nameInputRef}
                  value={editingMember.name}
                  onChange={(e) => {
                    setEditingMember({ ...editingMember, name: e.target.value })
                    setEditError(null);
                  }}
                  placeholder="Member's Name"
                  required
                />
              </div>
              <div>
                <label htmlFor='edit-phone'>Phone</label>
                <input 
                  type='tel'
                  value={editingMember.phone}
                  onChange={(e) => {
                    setEditingMember({ ...editingMember, phone: e.target.value });
                    setEditError(null);
                  }}
                  placeholder="Member's phone number"
                  required
                />
              </div>
              <div>
                <label htmlFor='edit-group'>Group</label>
                <select
                  id='edit-group'
                  value={editingMember.member_group}
                  onChange={(e) => {
                    setEditingMember({ ...editingMember, member_group: e.target.value });
                    setEditError(null);
                  }}
                >
                  {GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div className='modal__actions'>
                <button
                type='button'
                  onClick={() => setEditingMember(null)}
                  className='modal__action cancel'
                >Cancel</button>
                <button
                  type='submit'
                  className='modal__action save'
                >Save</button>
              </div>
            </form>
            {editError && <p className='member__error'>{editError}</p>}
            {editSuccess && <p className='member__success'>{editSuccess}</p>}
            </div>
          </div>,
          document.body
          )}
      </div>
    );
}
export default Members;