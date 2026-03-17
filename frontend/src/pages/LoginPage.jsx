import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const DEMO_USERS = [
  { username: 'admin',   password: 'admin123',  role: 'Admin',       color: '#7c3aed', initial: 'A' },
  { username: 'safety1', password: 'safety123', role: 'Safety Team', color: '#2563eb', initial: 'S' },
  { username: 'field1',  password: 'field123',  role: 'Field Team',  color: '#059669', initial: 'F' },
  { username: 'user1',   password: 'user123',   role: 'Citizen',     color: '#d97706', initial: 'U' },
];

const LIVE_ALERTS = [
  { type: 'Flood',      location: 'New Delhi', severity: 'HIGH',     color: '#ef4444', dot: '🌊' },
  { type: 'Earthquake', location: 'Mumbai',    severity: 'CRITICAL', color: '#7c3aed', dot: '🏚️' },
  { type: 'Wildfire',   location: 'Bangalore', severity: 'MEDIUM',   color: '#f59e0b', dot: '🔥' },
];

const TEAMS = [
  { name: 'Fire Alpha',   status: 'Deployed' },
  { name: 'Medical',      status: 'Deployed' },
  { name: 'Flood Rescue', status: 'Deployed' },
  { name: 'Earthquake',   status: 'Standby'  },
];

const AVATARS = [
  { initials: 'AC', bg: '#7c3aed' },
  { initials: 'SM', bg: '#2563eb' },
  { initials: 'JR', bg: '#059669' },
  { initials: 'DP', bg: '#d97706' },
  { initials: 'MG', bg: '#dc2626' },
];

export default function LoginPage() {
  const { login, loading } = useAuth();
  const [form, setForm]         = useState({ username: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(form.username, form.password);
    if (!result.success) setError(result.error || 'Invalid credentials');
  };

  const quickLogin = async (u) => {
    setError('');
    const result = await login(u.username, u.password);
    if (!result.success) setError(result.error || 'Login failed');
  };

  const inputBase = {
    width: '100%', boxSizing: 'border-box',
    background: '#fff', border: '1.5px solid #e2e8f0',
    borderRadius: 14, padding: '14px 18px',
    fontSize: 15, color: '#1a202c', outline: 'none',
    fontFamily: 'inherit', transition: 'border-color 0.15s',
  };

  return (
    <div style={{ height: '100vh', display: 'flex', overflow: 'hidden', background: '#f0ebe3' }}>

      {/* ════════════════════ LEFT PANEL — 62% ════════════════════ */}
      <div style={{
        width: '62%',
        height: '100vh',
        background: '#f0ebe3',
        display: 'flex',
        flexDirection: 'column',
        padding: '30px 48px 26px',
      }}>

        {/* Top nav */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#111', color: '#fff',
            padding: '9px 20px', borderRadius: 999,
            fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em',
          }}>
            🛡️ DisasterSync
          </div>
          <span style={{ fontSize: 13, color: '#a1a1aa', cursor: 'pointer', userSelect: 'none' }}>
            Help &amp; Support →
          </span>
        </div>

        {/* Centered form area */}
        <div style={{
          flex: 1,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ width: '100%', maxWidth: 460 }}>

            {/* Heading */}
            <h1 style={{
              fontSize: 34, fontWeight: 800, color: '#0f172a',
              lineHeight: 1.2, margin: '0 0 8px',
            }}>
              Sign in to your<br />Command Center
            </h1>
            <p style={{ fontSize: 14, color: '#94a3b8', margin: '0 0 28px' }}>
              Access real-time disaster coordination &amp; response tools
            </p>

            {/* Error */}
            {error && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18,
                background: '#fff1f2', border: '1.5px solid #fecdd3',
                color: '#be123c', fontSize: 14, borderRadius: 13,
                padding: '12px 16px',
              }}>
                ⚠️ {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit}>

              {/* Username */}
              <div style={{ marginBottom: 18 }}>
                <label style={{
                  display: 'block', fontSize: 12, fontWeight: 600,
                  color: '#64748b', textTransform: 'uppercase',
                  letterSpacing: '0.07em', marginBottom: 8,
                }}>
                  Username
                </label>
                <input
                  type="text"
                  value={form.username}
                  onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                  placeholder="e.g. admin"
                  required
                  style={inputBase}
                  onFocus={e => (e.target.style.borderColor = '#0f172a')}
                  onBlur={e  => (e.target.style.borderColor = '#e2e8f0')}
                />
              </div>

              {/* Password */}
              <div style={{ marginBottom: 26 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label style={{
                    fontSize: 12, fontWeight: 600, color: '#64748b',
                    textTransform: 'uppercase', letterSpacing: '0.07em',
                  }}>
                    Password
                  </label>
                  <span style={{ fontSize: 12, color: '#94a3b8', cursor: 'pointer' }}>Forgot?</span>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="Enter your password"
                    required
                    style={{ ...inputBase, paddingRight: 50 }}
                    onFocus={e => (e.target.style.borderColor = '#0f172a')}
                    onBlur={e  => (e.target.style.borderColor = '#e2e8f0')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(s => !s)}
                    style={{
                      position: 'absolute', right: 15, top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none', border: 'none',
                      cursor: 'pointer', color: '#94a3b8',
                      padding: 0, display: 'flex', alignItems: 'center',
                    }}
                  >
                    {showPass ? (
                      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', padding: '15px 0',
                  borderRadius: 14, border: 'none',
                  background: loading ? '#e2e8f0' : '#FBBF24',
                  color: loading ? '#94a3b8' : '#1a202c',
                  fontWeight: 700, fontSize: 15,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit', letterSpacing: '0.01em',
                  transition: 'opacity 0.15s',
                }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = '0.87'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
              >
                {loading ? 'Authenticating…' : 'Access Command Center'}
              </button>
            </form>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '24px 0 18px' }}>
              <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
              <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, letterSpacing: '0.06em' }}>QUICK ACCESS</span>
              <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
            </div>

            {/* Quick-access 2×2 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {DEMO_USERS.map(u => (
                <button
                  key={u.username}
                  onClick={() => quickLogin(u)}
                  disabled={loading}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    background: '#fff', border: '1.5px solid #e2e8f0',
                    borderRadius: 14, padding: '13px 15px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    textAlign: 'left', fontFamily: 'inherit',
                    transition: 'border-color 0.15s, box-shadow 0.15s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = '#94a3b8';
                    e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.07)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{
                    width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                    background: u.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: 14, fontWeight: 700,
                  }}>
                    {u.initial}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1a202c', lineHeight: 1.3 }}>{u.role}</div>
                    <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.3 }}>{u.username}</div>
                  </div>
                </button>
              ))}
            </div>

          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 12, color: '#c4b9ae' }}>© 2026 DisasterSync Platform</span>
          <div style={{ display: 'flex', gap: 16 }}>
            {['Privacy', 'Terms'].map(t => (
              <a key={t} href="#" style={{ fontSize: 12, color: '#c4b9ae', textDecoration: 'none' }}
                onMouseEnter={e => (e.target.style.color = '#64748b')}
                onMouseLeave={e => (e.target.style.color = '#c4b9ae')}
              >{t}</a>
            ))}
          </div>
        </div>

      </div>{/* /left */}

      {/* ════════════════════ RIGHT PANEL — 38% ════════════════════ */}
      <div style={{
        width: '38%',
        height: '100vh', position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(145deg,#0c1120 0%,#18103a 55%,#0c1120 100%)',
        display: 'flex', flexDirection: 'column',
        padding: '22px 24px 18px',
      }}>
        {/* Glow blobs */}
        <div style={{ position:'absolute',top:40,right:20,width:200,height:200,borderRadius:'50%',background:'#ef4444',opacity:0.07,filter:'blur(55px)',pointerEvents:'none' }} />
        <div style={{ position:'absolute',bottom:40,left:5,width:180,height:180,borderRadius:'50%',background:'#3b82f6',opacity:0.07,filter:'blur(50px)',pointerEvents:'none' }} />

        {/* Top */}
        <div style={{ marginBottom: 14 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 999, padding: '4px 12px', marginBottom: 12,
          }}>
            <span style={{ width:6,height:6,borderRadius:'50%',background:'#4ade80',boxShadow:'0 0 6px #4ade80',display:'inline-block' }} />
            <span style={{ color:'#fff',fontSize:11,fontWeight:500 }}>3 Active Incidents · Live</span>
          </div>
          <h2 style={{ color:'#fff',fontSize:18,fontWeight:800,lineHeight:1.3,margin:'0 0 3px' }}>
            Real-Time Disaster<br />Response Coordination
          </h2>
          <p style={{ color:'rgba(255,255,255,0.35)',fontSize:11,margin:0 }}>
            Satellite · IoT Sensors · Crowd Reports
          </p>
        </div>

        {/* Cards */}
        <div style={{ flex:1,display:'flex',flexDirection:'column',justifyContent:'center',gap:9 }}>

          {/* Active Incidents */}
          <div style={{
            background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.1)',
            borderRadius:13,padding:'11px 13px',
          }}>
            <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8 }}>
              <span style={{ color:'#fff',fontSize:12,fontWeight:600 }}>Active Incidents</span>
              <span style={{
                background:'rgba(239,68,68,0.18)',border:'1px solid rgba(239,68,68,0.32)',
                color:'#fca5a5',fontSize:10,padding:'2px 8px',borderRadius:999,fontWeight:600,
              }}>
                {LIVE_ALERTS.length} Live
              </span>
            </div>
            <div style={{ display:'flex',flexDirection:'column',gap:6 }}>
              {LIVE_ALERTS.map((a,i) => (
                <div key={i} style={{
                  display:'flex',alignItems:'center',justifyContent:'space-between',
                  background:'rgba(255,255,255,0.04)',borderRadius:8,padding:'6px 9px',
                }}>
                  <div style={{ display:'flex',alignItems:'center',gap:7 }}>
                    <span style={{ fontSize:13 }}>{a.dot}</span>
                    <div>
                      <div style={{ color:'#fff',fontSize:11,fontWeight:600,lineHeight:1.2 }}>{a.type}</div>
                      <div style={{ color:'rgba(255,255,255,0.35)',fontSize:10 }}>{a.location}</div>
                    </div>
                  </div>
                  <span style={{
                    background:a.color+'25',color:a.color,border:`1px solid ${a.color}40`,
                    fontSize:9,fontWeight:700,padding:'2px 7px',borderRadius:999,
                  }}>
                    {a.severity}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Risk + Sensors */}
          <div style={{ display:'flex',gap:9 }}>
            <div style={{
              flex:1,background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.1)',
              borderRadius:13,padding:'11px 13px',
            }}>
              <div style={{ color:'rgba(255,255,255,0.4)',fontSize:10,marginBottom:3 }}>Risk Score</div>
              <div style={{ color:'#FBBF24',fontSize:26,fontWeight:800,lineHeight:1 }}>78</div>
              <div style={{ margin:'7px 0 3px',height:4,background:'rgba(255,255,255,0.08)',borderRadius:999,overflow:'hidden' }}>
                <div style={{ width:'78%',height:'100%',background:'linear-gradient(90deg,#fbbf24,#ef4444)',borderRadius:999 }} />
              </div>
              <div style={{ color:'#fbbf24',fontSize:10,fontWeight:600 }}>HIGH RISK</div>
            </div>
            <div style={{
              flex:1,background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.1)',
              borderRadius:13,padding:'11px 13px',
            }}>
              <div style={{ color:'rgba(255,255,255,0.4)',fontSize:10,marginBottom:8 }}>IoT Sensors</div>
              {[['Normal',3,'#22c55e'],['Warning',4,'#f59e0b'],['Critical',1,'#ef4444']].map(([lbl,n,c]) => (
                <div key={lbl} style={{ display:'flex',alignItems:'center',gap:6,marginBottom:5 }}>
                  <div style={{ width:6,height:6,borderRadius:'50%',background:c,flexShrink:0 }} />
                  <span style={{ fontSize:11,color:'rgba(255,255,255,0.55)',flex:1 }}>{lbl}</span>
                  <span style={{ fontSize:12,fontWeight:700,color:'#fff' }}>{n}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Teams */}
          <div style={{
            background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.1)',
            borderRadius:13,padding:'11px 13px',
          }}>
            <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8 }}>
              <span style={{ color:'#fff',fontSize:12,fontWeight:600 }}>Response Teams</span>
              <span style={{ color:'rgba(255,255,255,0.28)',fontSize:10 }}>4 active</span>
            </div>
            <div style={{ display:'flex',flexWrap:'wrap',gap:5,marginBottom:10 }}>
              {TEAMS.map((t,i) => (
                <div key={i} style={{
                  display:'inline-flex',alignItems:'center',gap:5,
                  background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',
                  borderRadius:999,padding:'3px 9px',
                }}>
                  <div style={{ width:5,height:5,borderRadius:'50%',background:t.status==='Deployed'?'#ef4444':'#f59e0b' }} />
                  <span style={{ fontSize:10,color:'rgba(255,255,255,0.68)' }}>{t.name}</span>
                </div>
              ))}
            </div>
            <div style={{ display:'flex',alignItems:'center' }}>
              {AVATARS.map((av,i) => (
                <div key={i} style={{
                  width:24,height:24,borderRadius:'50%',
                  border:'2px solid rgba(255,255,255,0.13)',
                  display:'flex',alignItems:'center',justifyContent:'center',
                  fontSize:9,fontWeight:700,color:'#fff',
                  background:av.bg,marginLeft:i===0?0:-7,flexShrink:0,
                }}>
                  {av.initials}
                </div>
              ))}
              <span style={{ marginLeft:9,fontSize:10,color:'rgba(255,255,255,0.28)' }}>+12 responders</span>
            </div>
          </div>

        </div>

        {/* Bottom tagline */}
        <p style={{ textAlign:'center',fontSize:10,color:'rgba(255,255,255,0.16)',margin:'12px 0 0' }}>
          Satellite data · IoT sensors · crowd intelligence
        </p>
      </div>{/* /right */}

    </div>
  );
}
