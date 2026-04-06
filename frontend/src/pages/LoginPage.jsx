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

  return (
    <div className="flex flex-col lg:flex-row min-h-screen overflow-hidden bg-[#f0ebe3]">

      {/* ════════════════════ LEFT PANEL — Form ════════════════════ */}
      <div className="w-full lg:w-[62%] min-h-screen flex flex-col p-6 sm:p-8 lg:p-12 bg-[#f0ebe3]">

        {/* Top nav */}
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 bg-black text-white px-5 py-2 rounded-full text-sm font-bold tracking-tight">
            🛡️ DisasterSync
          </div>
          <span className="text-[13px] text-gray-400 cursor-pointer select-none hover:text-gray-600">
            Help &amp; Support →
          </span>
        </div>

        {/* Centered form area */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-full max-w-md sm:max-w-lg">

            {/* Heading */}
            <h1 className="text-3xl sm:text-[34px] font-extrabold text-slate-900 leading-tight mb-2">
              Sign in to your<br />Command Center
            </h1>
            <p className="text-sm text-slate-400 mb-7">
              Access real-time disaster coordination &amp; response tools
            </p>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 mb-4 bg-rose-50 border-[1.5px] border-rose-200 text-rose-700 text-sm rounded-xl px-4 py-3">
                ⚠️ {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit}>

              {/* Username */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={form.username}
                  onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                  placeholder="e.g. admin"
                  required
                  className="w-full bg-white border-[1.5px] border-gray-300 rounded-xl px-4 py-3 sm:py-3.5 text-[15px] text-slate-900 placeholder-gray-400 focus:outline-none focus:border-slate-900 transition-colors"
                />
              </div>

              {/* Password */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Password
                  </label>
                  <span className="text-xs text-slate-400 cursor-pointer hover:text-slate-600">Forgot?</span>
                </div>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="Enter your password"
                    required
                    className="w-full bg-white border-[1.5px] border-gray-300 rounded-xl px-4 py-3 sm:py-3.5 pr-12 text-[15px] text-slate-900 placeholder-gray-400 focus:outline-none focus:border-slate-900 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(s => !s)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
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
                className={`w-full py-3 sm:py-4 rounded-xl border-none font-bold text-[15px] tracking-wide transition-opacity ${
                  loading
                    ? 'bg-gray-200 text-slate-400 cursor-not-allowed'
                    : 'bg-amber-400 text-slate-900 cursor-pointer hover:opacity-90'
                }`}
              >
                {loading ? 'Authenticating…' : 'Access Command Center'}
              </button>
            </form>

          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4">
          <span className="text-xs text-gray-400">© 2026 DisasterSync Platform</span>
          <div className="flex gap-4">
            {['Privacy', 'Terms'].map(t => (
              <a
                key={t}
                href="#"
                className="text-xs text-gray-400 no-underline hover:text-slate-600 transition-colors"
              >
                {t}
              </a>
            ))}
          </div>
        </div>

      </div>{/* /left */}

      {/* ══════════════ RIGHT PANEL — Live Stats ══════════════ */}
      <div
        className="hidden lg:flex lg:w-[38%] min-h-screen relative overflow-hidden flex-col p-6 lg:p-8"
        style={{ background: 'linear-gradient(145deg,#0c1120 0%,#18103a 55%,#0c1120 100%)' }}
      >
        {/* Glow blobs */}
        <div className="absolute top-10 right-5 w-[200px] h-[200px] rounded-full bg-red-500 opacity-[0.07] blur-[55px] pointer-events-none" />
        <div className="absolute bottom-10 left-1 w-[180px] h-[180px] rounded-full bg-blue-500 opacity-[0.07] blur-[50px] pointer-events-none" />

        {/* Top */}
        <div className="mb-3">
          <div className="inline-flex items-center gap-2 bg-white/[0.07] border border-white/[0.12] rounded-full px-3 py-1 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_6px_#4ade80]" />
            <span className="text-white text-[11px] font-medium">3 Active Incidents · Live</span>
          </div>
          <h2 className="text-white text-lg font-extrabold leading-tight mb-1">
            Real-Time Disaster<br />Response Coordination
          </h2>
          <p className="text-white/[0.35] text-[11px] m-0">
            Satellite · IoT Sensors · Crowd Reports
          </p>
        </div>

        {/* Cards */}
        <div className="flex-1 flex flex-col justify-center gap-2">

          {/* Active Incidents */}
          <div className="bg-white/[0.07] border border-white/10 rounded-xl px-3 py-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white text-xs font-semibold">Active Incidents</span>
              <span className="bg-red-500/[0.18] border border-red-500/[0.32] text-red-300 text-[10px] px-2 py-0.5 rounded-full font-semibold">
                {LIVE_ALERTS.length} Live
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              {LIVE_ALERTS.map((a,i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-white/[0.04] rounded-lg px-2 py-1.5"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[13px]">{a.dot}</span>
                    <div>
                      <div className="text-white text-[11px] font-semibold leading-tight">{a.type}</div>
                      <div className="text-white/[0.35] text-[10px]">{a.location}</div>
                    </div>
                  </div>
                  <span
                    className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                    style={{
                      background: `${a.color}25`,
                      color: a.color,
                      border: `1px solid ${a.color}40`,
                    }}
                  >
                    {a.severity}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Risk + Sensors */}
          <div className="flex gap-2">
            <div className="flex-1 bg-white/[0.07] border border-white/10 rounded-xl px-3 py-3">
              <div className="text-white/40 text-[10px] mb-1">Risk Score</div>
              <div className="text-amber-400 text-2xl font-extrabold leading-none">78</div>
              <div className="my-2 h-1 bg-white/[0.08] rounded-full overflow-hidden">
                <div className="w-[78%] h-full bg-gradient-to-r from-amber-400 to-red-500 rounded-full" />
              </div>
              <div className="text-amber-400 text-[10px] font-semibold">HIGH RISK</div>
            </div>
            <div className="flex-1 bg-white/[0.07] border border-white/10 rounded-xl px-3 py-3">
              <div className="text-white/40 text-[10px] mb-2">IoT Sensors</div>
              {[['Normal',3,'#22c55e'],['Warning',4,'#f59e0b'],['Critical',1,'#ef4444']].map(([lbl,n,c]) => (
                <div key={lbl} className="flex items-center gap-1.5 mb-1">
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: c }} />
                  <span className="text-[11px] text-white/[0.55] flex-1">{lbl}</span>
                  <span className="text-xs font-bold text-white">{n}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Teams */}
          <div className="bg-white/[0.07] border border-white/10 rounded-xl px-3 py-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white text-xs font-semibold">Response Teams</span>
              <span className="text-white/[0.28] text-[10px]">4 active</span>
            </div>
            <div className="flex flex-wrap gap-1 mb-2">
              {TEAMS.map((t,i) => (
                <div
                  key={i}
                  className="inline-flex items-center gap-1 bg-white/[0.05] border border-white/[0.08] rounded-full px-2 py-0.5"
                >
                  <div
                    className="w-1 h-1 rounded-full"
                    style={{ background: t.status === 'Deployed' ? '#ef4444' : '#f59e0b' }}
                  />
                  <span className="text-[10px] text-white/[0.68]">{t.name}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center">
              {AVATARS.map((av,i) => (
                <div
                  key={i}
                  className="w-6 h-6 rounded-full border-2 border-white/[0.13] flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
                  style={{
                    background: av.bg,
                    marginLeft: i === 0 ? 0 : -7,
                  }}
                >
                  {av.initials}
                </div>
              ))}
              <span className="ml-2 text-[10px] text-white/[0.28]">+12 responders</span>
            </div>
          </div>

        </div>

        {/* Bottom tagline */}
        <p className="text-center text-[10px] text-white/[0.16] mt-3 mb-0">
          Satellite data · IoT sensors · crowd intelligence
        </p>
      </div>{/* /right */}

    </div>
  );
}
