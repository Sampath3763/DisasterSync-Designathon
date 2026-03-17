import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { users } from '../data/mockData.js';

const router = Router();

/* ── helpers ─────────────────────────────────────────── */
function safe(u) {
  const { password: _, ...rest } = u;
  return rest;
}

function isAdmin(req) {
  const token = req.headers.authorization?.split(' ')[1];
  const userId = token?.split('-')[2];
  const u = users.find(u => u.id === userId);
  return u?.role === 'admin';
}

/* ── auth ────────────────────────────────────────────── */
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  res.json({ user: safe(user), token: `mock-token-${user.id}-${Date.now()}` });
});

router.get('/me', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const userId = token?.split('-')[2];
  const user = users.find(u => u.id === userId);
  if (!user) return res.status(401).json({ error: 'Invalid token' });
  res.json(safe(user));
});

/* ── user list (safe – no passwords) ────────────────── */
router.get('/users', (req, res) => {
  res.json(users.map(safe));
});

/* ── user list WITH credentials (admin only) ─────────── */
router.get('/users/credentials', (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: 'Admin access required' });
  res.json(users);                       // full objects including password
});

/* ── create user (admin only) ───────────────────────── */
router.post('/users', (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: 'Admin access required' });

  const { username, password, name, email, role, team } = req.body;
  if (!username || !password || !name || !role)
    return res.status(400).json({ error: 'username, password, name and role are required' });

  if (users.find(u => u.username === username))
    return res.status(409).json({ error: 'Username already exists' });

  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const newUser = {
    id: uuidv4(),
    username,
    password,
    name,
    email: email || '',
    role,
    team: team || null,
    avatar: initials,
  };
  users.push(newUser);
  res.status(201).json(safe(newUser));
});

/* ── update user (admin only) ───────────────────────── */
router.put('/users/:id', (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: 'Admin access required' });

  const idx = users.findIndex(u => u.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'User not found' });

  // prevent changing built-in admin's own role away from admin
  const { password, name, email, role, team } = req.body;
  const updated = { ...users[idx] };

  if (name)     updated.name     = name;
  if (email !== undefined) updated.email = email;
  if (role)     updated.role     = role;
  if (team  !== undefined) updated.team  = team || null;
  if (password && password.trim()) updated.password = password;
  if (name) updated.avatar = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  users[idx] = updated;
  res.json(safe(users[idx]));
});

/* ── delete user (admin only) ───────────────────────── */
router.delete('/users/:id', (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: 'Admin access required' });

  const idx = users.findIndex(u => u.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'User not found' });
  if (users[idx].username === 'admin')
    return res.status(400).json({ error: 'Cannot delete the primary admin account' });

  users.splice(idx, 1);
  res.json({ success: true });
});

export default router;
