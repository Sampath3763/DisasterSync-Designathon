import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const ROLES = ['admin', 'safety_team', 'field_team', 'user'];
const TEAMS = ['fire', 'medical', 'flood', 'earthquake'];

const ROLE_META = {
  admin:       { label: 'Admin',       color: '#7c3aed', bg: '#4c1d95' },
  safety_team: { label: 'Safety Team', color: '#2563eb', bg: '#1e3a8a' },
  field_team:  { label: 'Field Team',  color: '#059669', bg: '#064e3b' },
  user:        { label: 'Citizen',     color: '#d97706', bg: '#78350f' },
};

const EMPTY_FORM = { username: '', password: '', name: '', email: '', role: 'user', team: '' };

function Badge({ role }) {
  const m = ROLE_META[role] || ROLE_META.user;
  return (
    <span style={{
      background: m.bg + '99', color: m.color, border: `1px solid ${m.color}55`,
      fontSize: 11, fontWeight: 600, padding: '2px 9px', borderRadius: 999,
      textTransform: 'capitalize', letterSpacing: '0.02em',
    }}>
      {m.label}
    </span>
  );
}

function Avatar({ name, role }) {
  const initials = (name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const color = ROLE_META[role]?.color || '#6b7280';
  return (
    <div style={{
      width: 36, height: 36, borderRadius: 10, flexShrink: 0,
      background: color + '33', border: `2px solid ${color}55`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color, fontSize: 13, fontWeight: 700,
    }}>
      {initials}
    </div>
  );
}

/* ── Modal ── */
function UserModal({ user: editing, onClose, onSaved }) {
  const [form, setForm]       = useState(editing ? { ...editing, password: '' } : { ...EMPTY_FORM });
  const [showPwd, setShowPwd] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [err, setErr]         = useState('');
  const isEdit                = Boolean(editing);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.username || !form.name || !form.role) { setErr('Username, name and role are required'); return; }
    if (!isEdit && !form.password) { setErr('Password is required for new users'); return; }
    setSaving(true); setErr('');
    try {
      if (isEdit) {
        await api.put(`/auth/users/${editing.id}`, form);
      } else {
        await api.post('/auth/users', form);
      }
      onSaved();
      onClose();
    } catch (e) {
      setErr(e.response?.data?.error || 'Save failed');
    }
    setSaving(false);
  };

  const inputSt = {
    width: '100%', boxSizing: 'border-box',
    background: '#1e293b', border: '1.5px solid #334155',
    borderRadius: 10, padding: '10px 13px',
    fontSize: 14, color: '#f1f5f9', outline: 'none', fontFamily: 'inherit',
  };

  const labelSt = { display: 'block', fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16,
    }}>
      <div style={{
        width: '100%', maxWidth: 480,
        background: '#0f172a', border: '1px solid #1e293b',
        borderRadius: 20, overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9' }}>
              {isEdit ? '✏️ Edit User' : '➕ Add New User'}
            </div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
              {isEdit ? `Updating credentials for ${editing.name}` : 'Create a new platform account'}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 20, lineHeight: 1 }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {err && (
            <div style={{ background: '#450a0a', border: '1px solid #7f1d1d', color: '#fca5a5', fontSize: 13, borderRadius: 10, padding: '10px 14px' }}>
              ⚠️ {err}
            </div>
          )}

          {/* Name + Email row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelSt}>Full Name *</label>
              <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. John Smith" style={inputSt} onFocus={e => (e.target.style.borderColor='#3b82f6')} onBlur={e => (e.target.style.borderColor='#334155')} />
            </div>
            <div>
              <label style={labelSt}>Email</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="user@org.gov" style={inputSt} onFocus={e => (e.target.style.borderColor='#3b82f6')} onBlur={e => (e.target.style.borderColor='#334155')} />
            </div>
          </div>

          {/* Username */}
          <div>
            <label style={labelSt}>Username *</label>
            <input
              value={form.username}
              onChange={e => set('username', e.target.value)}
              placeholder="e.g. jsmith"
              disabled={isEdit}
              style={{ ...inputSt, opacity: isEdit ? 0.5 : 1, cursor: isEdit ? 'not-allowed' : 'text' }}
              onFocus={e => { if (!isEdit) e.target.style.borderColor='#3b82f6'; }}
              onBlur={e  => (e.target.style.borderColor='#334155')}
            />
            {isEdit && <div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>Username cannot be changed after creation</div>}
          </div>

          {/* Password */}
          <div>
            <label style={labelSt}>{isEdit ? 'New Password (leave blank to keep)' : 'Password *'}</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPwd ? 'text' : 'password'}
                value={form.password}
                onChange={e => set('password', e.target.value)}
                placeholder={isEdit ? '••••••••' : 'Set a strong password'}
                style={{ ...inputSt, paddingRight: 44 }}
                onFocus={e => (e.target.style.borderColor='#3b82f6')}
                onBlur={e  => (e.target.style.borderColor='#334155')}
              />
              <button type="button" onClick={() => setShowPwd(s => !s)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 0, display: 'flex' }}>
                {showPwd ? (
                  <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M3 3l18 18" /></svg>
                ) : (
                  <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                )}
              </button>
            </div>
          </div>

          {/* Role + Team row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelSt}>Role *</label>
              <select value={form.role} onChange={e => set('role', e.target.value)} style={{ ...inputSt, cursor: 'pointer' }}>
                {ROLES.map(r => <option key={r} value={r}>{ROLE_META[r]?.label || r}</option>)}
              </select>
            </div>
            <div>
              <label style={labelSt}>Team Assignment</label>
              <select value={form.team || ''} onChange={e => set('team', e.target.value || null)} style={{ ...inputSt, cursor: 'pointer' }}>
                <option value="">— No team —</option>
                {TEAMS.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #1e293b', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '10px 20px', borderRadius: 10, background: '#1e293b', border: '1px solid #334155', color: '#94a3b8', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving} style={{ padding: '10px 24px', borderRadius: 10, background: saving ? '#334155' : '#3b82f6', border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create User'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Credentials reveal cell ── */
function CredsCell({ username, password }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <code style={{ fontSize: 12, color: '#94a3b8', background: '#1e293b', padding: '2px 7px', borderRadius: 6 }}>{username}</code>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <code style={{ fontSize: 12, color: show ? '#fbbf24' : '#475569', background: '#1e293b', padding: '2px 7px', borderRadius: 6, letterSpacing: show ? 0 : 2 }}>
          {show ? password : '••••••••'}
        </code>
        <button onClick={() => setShow(s => !s)} title={show ? 'Hide' : 'Reveal'} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: 0, display: 'flex', alignItems: 'center' }}>
          {show ? (
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M3 3l18 18" /></svg>
          ) : (
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
          )}
        </button>
      </div>
    </div>
  );
}

/* ══════════════════ MAIN PAGE ══════════════════ */
export default function UserManagement() {
  const { user: me } = useAuth();
  const [users, setUsers]       = useState([]);
  const [modal, setModal]       = useState(null);   // null | 'add' | userObject
  const [delConfirm, setDelConfirm] = useState(null);
  const [search, setSearch]     = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [loading, setLoading]   = useState(false);
  const [toast, setToast]       = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/auth/users/credentials');
      setUsers(data);
    } catch {
      // fallback to safe list
      const { data } = await api.get('/auth/users').catch(() => ({ data: [] }));
      setUsers(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleDelete = async (u) => {
    try {
      await api.delete(`/auth/users/${u.id}`);
      showToast(`User "${u.username}" deleted`);
      fetchUsers();
    } catch (e) {
      showToast(e.response?.data?.error || 'Delete failed');
    }
    setDelConfirm(null);
  };

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = !q || u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const stats = {
    total: users.length,
    admin: users.filter(u => u.role === 'admin').length,
    safety: users.filter(u => u.role === 'safety_team').length,
    field: users.filter(u => u.role === 'field_team').length,
    citizen: users.filter(u => u.role === 'user').length,
  };

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">User Management</h1>
          <p className="text-gray-500 text-sm">Create, edit and manage platform accounts &amp; credentials</p>
        </div>
        <button
          onClick={() => setModal('add')}
          style={{ background: '#3b82f6', border: 'none', color: '#fff', fontWeight: 700, fontSize: 14, padding: '10px 20px', borderRadius: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'inherit' }}
        >
          <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Add User
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total Users', value: stats.total, color: '#f1f5f9' },
          { label: 'Admins',      value: stats.admin,   color: ROLE_META.admin.color },
          { label: 'Safety Team', value: stats.safety,  color: ROLE_META.safety_team.color },
          { label: 'Field Team',  value: stats.field,   color: ROLE_META.field_team.color },
          { label: 'Citizens',    value: stats.citizen, color: ROLE_META.user.color },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search + filter bar */}
      <div className="flex flex-wrap gap-3 items-center">
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, username or email…"
            className="input w-full"
            style={{ paddingLeft: 36 }}
          />
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="select text-sm py-2">
          <option value="all">All Roles</option>
          {ROLES.map(r => <option key={r} value={r}>{ROLE_META[r]?.label || r}</option>)}
        </select>
      </div>

      {/* User table */}
      <div className="card overflow-hidden">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#111827', borderBottom: '1px solid #1f2937' }}>
                {['User', 'Role / Team', 'Credentials', 'Email', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#4b5563' }}>Loading users…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#4b5563' }}>No users found</td></tr>
              ) : filtered.map((u, i) => (
                <tr key={u.id} style={{ borderBottom: '1px solid #1f2937', background: i % 2 === 0 ? 'transparent' : '#0a0f1a' }}>
                  {/* User */}
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar name={u.name} role={u.role} />
                      <div>
                        <div style={{ fontWeight: 600, color: '#f1f5f9', fontSize: 14 }}>{u.name}</div>
                        {u.id === me?.id && <span style={{ fontSize: 10, color: '#22c55e', fontWeight: 600 }}>● YOU</span>}
                      </div>
                    </div>
                  </td>

                  {/* Role / Team */}
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <Badge role={u.role} />
                      {u.team && (
                        <span style={{ fontSize: 11, color: '#64748b' }}>
                          🏷 {u.team.charAt(0).toUpperCase() + u.team.slice(1)} Team
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Credentials */}
                  <td style={{ padding: '12px 16px' }}>
                    <CredsCell username={u.username} password={u.password || '(hidden)'} />
                  </td>

                  {/* Email */}
                  <td style={{ padding: '12px 16px', color: '#64748b', fontSize: 13 }}>
                    {u.email || <span style={{ color: '#374151' }}>—</span>}
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={() => setModal(u)}
                        style={{ padding: '6px 12px', borderRadius: 8, background: '#1e3a8a', border: '1px solid #2563eb55', color: '#93c5fd', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
                      >
                        ✏️ Edit
                      </button>
                      {u.username !== 'admin' && (
                        <button
                          onClick={() => setDelConfirm(u)}
                          style={{ padding: '6px 12px', borderRadius: 8, background: '#450a0a', border: '1px solid #7f1d1d55', color: '#fca5a5', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
                        >
                          🗑 Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '10px 16px', borderTop: '1px solid #1f2937', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: '#4b5563' }}>
            Showing {filtered.length} of {users.length} users
          </span>
          <span style={{ fontSize: 11, color: '#374151' }}>🔒 Credentials visible to admins only</span>
        </div>
      </div>

      {/* Add / Edit modal */}
      {modal && (
        <UserModal
          user={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => { fetchUsers(); showToast(modal === 'add' ? 'User created successfully' : 'User updated successfully'); }}
        />
      )}

      {/* Delete confirmation */}
      {delConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 16, padding: 28, maxWidth: 380, width: '90%', boxShadow: '0 16px 48px rgba(0,0,0,0.5)' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🗑️</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 6 }}>Delete User?</div>
            <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 20 }}>
              This will permanently remove <strong style={{ color: '#f1f5f9' }}>{delConfirm.name}</strong> (<code style={{ color: '#fbbf24' }}>{delConfirm.username}</code>) from the platform.
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => handleDelete(delConfirm)} style={{ flex: 1, padding: '10px', borderRadius: 10, background: '#7f1d1d', border: '1px solid #991b1b', color: '#fca5a5', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
                Yes, Delete
              </button>
              <button onClick={() => setDelConfirm(null)} style={{ flex: 1, padding: '10px', borderRadius: 10, background: '#1e293b', border: '1px solid #334155', color: '#94a3b8', fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 100,
          background: '#052e16', border: '1px solid #166534',
          color: '#86efac', fontSize: 13, fontWeight: 600,
          padding: '12px 20px', borderRadius: 12,
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          animation: 'fadeIn 0.2s ease',
        }}>
          ✅ {toast}
        </div>
      )}
    </div>
  );
}
