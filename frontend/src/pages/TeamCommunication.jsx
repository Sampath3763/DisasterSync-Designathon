import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useWebSocket } from '../contexts/WebSocketContext';
import api from '../services/api';

const TEAM_COLORS = {
  fire: { bg: 'bg-red-700', border: 'border-red-700', text: 'text-red-400', light: 'bg-red-900/30' },
  medical: { bg: 'bg-blue-700', border: 'border-blue-700', text: 'text-blue-400', light: 'bg-blue-900/30' },
  flood: { bg: 'bg-cyan-700', border: 'border-cyan-700', text: 'text-cyan-400', light: 'bg-cyan-900/30' },
  earthquake: { bg: 'bg-orange-700', border: 'border-orange-700', text: 'text-orange-400', light: 'bg-orange-900/30' },
};
const TEAM_ICONS = { fire: '🔥', medical: '🏥', flood: '🌊', earthquake: '🏚️' };
const STATUS_COLORS = { available: 'bg-green-500', deployed: 'bg-red-500', standby: 'bg-yellow-500', offline: 'bg-gray-500' };
const MSG_TYPE_STYLES = {
  support_request: 'border-red-700 bg-red-900/20',
  update: 'border-blue-700 bg-blue-900/20',
  message: 'bg-gray-800/50 border-gray-700',
};

function timeAgo(ts) {
  const d = Date.now() - new Date(ts).getTime();
  if (d < 60000) return 'just now';
  if (d < 3600000) return `${Math.floor(d / 60000)}m ago`;
  return `${Math.floor(d / 3600000)}h ago`;
}

export default function TeamCommunication() {
  const { user } = useAuth();
  const { on, connected } = useWebSocket();
  const [teams, setTeams] = useState([]);
  const [messages, setMessages] = useState([]);
  const [form, setForm] = useState({ toTeam: '', content: '', type: 'message', priority: 'normal' });
  const [sending, setSending] = useState(false);
  const [teamFilter, setTeamFilter] = useState('all');
  const messagesEndRef = useRef(null);

  const fetchData = useCallback(async () => {
    const [t, m] = await Promise.all([
      api.get('/teams').catch(() => ({ data: [] })),
      api.get('/messages').catch(() => ({ data: [] })),
    ]);
    setTeams(t.data);
    setMessages(m.data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)));
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    const unsub = on('team_message', (data) => {
      setMessages(prev => {
        if (prev.find(m => m.id === data.id)) return prev;
        return [...prev, data];
      });
    });
    const unsub2 = on('team_status_change', () => fetchData());
    return () => { unsub(); unsub2(); };
  }, [on, fetchData]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!form.content.trim()) return;
    setSending(true);
    try {
      await api.post('/messages', {
        ...form,
        from: user.id,
        fromName: user.name,
        fromTeam: user.team || 'admin',
      });
      setForm(f => ({ ...f, content: '' }));
      fetchData();
    } catch {}
    setSending(false);
  };

  const handleTeamStatus = async (teamId, status) => {
    await api.put(`/teams/${teamId}/status`, { status, currentTask: status === 'available' ? null : undefined }).catch(() => {});
    fetchData();
  };

  const filteredMessages = teamFilter === 'all' ? messages : messages.filter(m => m.fromTeam === teamFilter || m.toTeam === teamFilter);
  const supportRequests = messages.filter(m => m.type === 'support_request');

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-white">Inter-Team Communication</h1>
        <p className="text-gray-500 text-sm">Coordinate between fire, medical, flood, and earthquake response teams</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4" style={{ minHeight: '75vh' }}>
        {/* Left: Team Status */}
        <div className="lg:col-span-1 space-y-3">
          <div className="card p-4">
            <h2 className="font-semibold text-sm mb-3">Team Status</h2>
            <div className="space-y-2">
              {teams.map(team => {
                const tc = TEAM_COLORS[team.type] || TEAM_COLORS.fire;
                return (
                  <div key={team.id} className={`border rounded-xl p-3 cursor-pointer transition-colors ${teamFilter === team.type ? `${tc.border} ${tc.light}` : 'border-gray-800 hover:border-gray-700'}`} onClick={() => setTeamFilter(t => t === team.type ? 'all' : team.type)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>{TEAM_ICONS[team.type]}</span>
                        <span className={`text-xs font-medium ${tc.text}`}>{team.name.split(' ')[0]}</span>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${STATUS_COLORS[team.status]}`}></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1 capitalize">{team.status}</div>
                    {team.currentTask && <div className="text-xs text-gray-600 mt-1 truncate">{team.currentTask}</div>}
                    {team.status === 'deployed' && (
                      <button
                        onClick={e => { e.stopPropagation(); handleTeamStatus(team.id, 'available'); }}
                        className="mt-2 w-full text-xs py-1 bg-green-900/40 border border-green-800 text-green-400 rounded hover:bg-green-900/60 transition-colors"
                      >
                        ✓ Mark Available
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Support Requests */}
          <div className="card p-4">
            <h2 className="font-semibold text-sm mb-3 text-red-400">🆘 Support Requests ({supportRequests.length})</h2>
            {supportRequests.length === 0 ? (
              <p className="text-gray-500 text-xs text-center py-3">No pending requests</p>
            ) : (
              <div className="space-y-2">
                {supportRequests.slice(-5).map(msg => (
                  <div key={msg.id} className="bg-red-900/20 border border-red-800/50 rounded-lg p-2">
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-xs text-red-400 font-medium">{msg.fromTeam || msg.fromName}</span>
                    </div>
                    <div className="text-xs text-gray-300 line-clamp-2">{msg.content}</div>
                    <div className="text-xs text-gray-600 mt-1">{timeAgo(msg.timestamp)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center: Message Thread */}
        <div className="lg:col-span-2 card flex flex-col overflow-hidden" style={{ maxHeight: '75vh' }}>
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-sm">Messages</h2>
              {teamFilter !== 'all' && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${TEAM_COLORS[teamFilter]?.bg || 'bg-gray-700'} text-white`}>
                  {TEAM_ICONS[teamFilter]} {teamFilter}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {teamFilter !== 'all' && <button onClick={() => setTeamFilter('all')} className="text-xs text-gray-500 hover:text-white">Clear filter</button>}
              <div className={`flex items-center gap-1 text-xs ${connected ? 'text-green-400' : 'text-red-400'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-green-400 pulse-dot' : 'bg-red-400'}`}></div>
                {connected ? 'Live' : 'Offline'}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredMessages.length === 0 ? (
              <div className="text-center text-gray-500 text-sm py-12">No messages yet. Start the conversation.</div>
            ) : (
              filteredMessages.map(msg => {
                const tc = TEAM_COLORS[msg.fromTeam] || { bg: 'bg-gray-700', text: 'text-gray-400', light: 'bg-gray-800/50' };
                const isOwn = msg.from === user.id;
                return (
                  <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-xl px-4 py-3 border ${MSG_TYPE_STYLES[msg.type] || MSG_TYPE_STYLES.message}`}>
                      <div className="flex items-center gap-2 mb-1">
                        {msg.fromTeam && (
                          <span className={`text-xs font-bold ${tc.text}`}>{TEAM_ICONS[msg.fromTeam]} {msg.fromTeam?.toUpperCase()}</span>
                        )}
                        <span className="text-xs text-gray-500">{msg.fromName}</span>
                        {msg.priority === 'urgent' && <span className="text-xs bg-red-700 text-white px-1.5 py-0.5 rounded font-bold">URGENT</span>}
                        {msg.type === 'support_request' && <span className="text-xs bg-orange-700 text-white px-1.5 py-0.5 rounded">🆘 SOS</span>}
                        {msg.type === 'update' && <span className="text-xs bg-blue-700 text-white px-1.5 py-0.5 rounded">📊 UPDATE</span>}
                      </div>
                      <div className={`text-sm ${msg.type === 'support_request' ? 'text-red-200' : 'text-gray-200'}`}>{msg.content}</div>
                      {msg.toTeam && <div className="text-xs text-gray-600 mt-1">→ To: {msg.toTeam}</div>}
                      <div className="text-xs text-gray-600 mt-1 text-right">{timeAgo(msg.timestamp)}</div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Compose */}
          <form onSubmit={handleSend} className="p-4 border-t border-gray-800 space-y-3">
            <div className="flex gap-2">
              <select value={form.toTeam} onChange={e => setForm(f => ({ ...f, toTeam: e.target.value }))} className="select text-xs py-1.5 flex-1">
                <option value="">📢 All Teams (Broadcast)</option>
                <option value="fire">🔥 Fire Response Team</option>
                <option value="medical">🏥 Medical Response Team</option>
                <option value="flood">🌊 Flood Rescue Team</option>
                <option value="earthquake">🏚️ Earthquake Rescue Team</option>
              </select>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="select text-xs py-1.5">
                <option value="message">Message</option>
                <option value="support_request">Support Request</option>
                <option value="update">Status Update</option>
              </select>
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, priority: f.priority === 'urgent' ? 'normal' : 'urgent' }))}
                className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${form.priority === 'urgent' ? 'bg-red-700 border-red-600 text-white' : 'border-gray-700 text-gray-400 hover:border-gray-600'}`}
              >
                {form.priority === 'urgent' ? '🔴 URGENT' : 'Normal'}
              </button>
            </div>
            <div className="flex gap-2">
              <textarea
                value={form.content}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                className="input flex-1 resize-none h-16 text-sm"
                placeholder={form.type === 'support_request' ? 'Describe your support needs, required resources, or situation...' : 'Type your message...'}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); } }}
              />
              <button
                type="submit"
                disabled={sending || !form.content.trim()}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${form.type === 'support_request' ? 'bg-red-700 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'} text-white disabled:opacity-50`}
              >
                {sending ? '⏳' : form.type === 'support_request' ? '🆘 SOS' : '➤'}
              </button>
            </div>
          </form>
        </div>

        {/* Right: Coordination Panel */}
        <div className="lg:col-span-1 space-y-3">
          <div className="card p-4">
            <h2 className="font-semibold text-sm mb-3">Coordination Panel</h2>
            <div className="space-y-3">
              <div className="bg-gray-800 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-2">Team Readiness</div>
                {teams.map(team => (
                  <div key={team.id} className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-gray-400">{TEAM_ICONS[team.type]} {team.type}</span>
                    <span className={`text-xs font-medium ${STATUS_COLORS[team.status] ? '' : ''}`} style={{ color: team.status === 'available' ? '#22c55e' : team.status === 'deployed' ? '#ef4444' : '#f59e0b' }}>
                      {team.status}
                    </span>
                  </div>
                ))}
              </div>

              <div className="bg-gray-800 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-2">Message Summary</div>
                {[
                  { label: 'Total Messages', value: messages.length },
                  { label: 'Support Requests', value: supportRequests.length, color: 'text-red-400' },
                  { label: 'Updates', value: messages.filter(m => m.type === 'update').length, color: 'text-blue-400' },
                  { label: 'Unread', value: messages.filter(m => !m.read).length, color: 'text-yellow-400' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex justify-between mb-1">
                    <span className="text-xs text-gray-400">{label}</span>
                    <span className={`text-xs font-bold ${color || 'text-white'}`}>{value}</span>
                  </div>
                ))}
              </div>

              {/* Quick team message buttons */}
              <div className="bg-gray-800 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-2">Quick Team Ping</div>
                <div className="grid grid-cols-2 gap-1.5">
                  {teams.map(team => (
                    <button
                      key={team.id}
                      onClick={() => setForm(f => ({ ...f, toTeam: team.type, content: `[Ping] Status check from ${user.name}` }))}
                      className={`text-xs py-1.5 px-2 rounded-lg border transition-colors ${TEAM_COLORS[team.type]?.border || 'border-gray-700'} hover:${TEAM_COLORS[team.type]?.light || 'bg-gray-700'} text-gray-300`}
                    >
                      {TEAM_ICONS[team.type]} {team.type}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recent activity */}
          <div className="card p-4">
            <h2 className="font-semibold text-sm mb-3">Recent Activity</h2>
            <div className="space-y-2">
              {messages.slice(-6).reverse().map(m => (
                <div key={m.id} className="flex items-start gap-2">
                  <span className="text-sm mt-0.5">{TEAM_ICONS[m.fromTeam] || '👤'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-400 truncate">{m.fromName}: {m.content.slice(0, 50)}{m.content.length > 50 ? '...' : ''}</div>
                    <div className="text-xs text-gray-600">{timeAgo(m.timestamp)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
