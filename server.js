require('dotenv').config()
const mongoose = require('mongoose')
const express = require('express')
const cors = require('cors')
const fs = require('fs')
const path = require('path')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { v4: uuid } = require('uuid')

const app = express()
app.use(cors({ origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*' }))
app.use(express.json())

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me'
const DB_FILE = path.join(__dirname, 'data', 'db.json')

// ---------- simple JSON file "database" ----------
function ensureFile() {
  const dir = path.dirname(DB_FILE)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ users: [], contacts: [], sosAlerts: [], reports: [], timers: [] }, null, 2))
  }
}
function readDB() {
  ensureFile()
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'))
}
function writeDB(data) {
  ensureFile()
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2))
}

// ---------- auth middleware ----------
function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Missing or invalid Authorization header' })
  try {
    req.user = jwt.verify(token, JWT_SECRET)
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}
function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin access required' })
  next()
}

// ---------- health check ----------
app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }))

// ================= AUTH =================
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, phone } = req.body
  if (!name || !email || !password) return res.status(400).json({ error: 'name, email and password are required' })
  if (password.length < 4) return res.status(400).json({ error: 'password must be at least 4 characters' })

  const db = readDB()
  if (db.users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(409).json({ error: 'An account with this email already exists' })
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const user = { id: uuid(), name, email, passwordHash, phone: phone || null, role: 'user', createdAt: new Date().toISOString() }
  db.users.push(user)
  writeDB(db)

  const token = jwt.sign({ id: user.id, name: user.name, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' })
  const { passwordHash: _, ...publicUser } = user
  res.status(201).json({ token, user: publicUser })
})

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'email and password are required' })

  const db = readDB()
  const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase())
  if (!user) return res.status(401).json({ error: 'Invalid email or password' })

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) return res.status(401).json({ error: 'Invalid email or password' })

  const token = jwt.sign({ id: user.id, name: user.name, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' })
  const { passwordHash: _, ...publicUser } = user
  res.json({ token, user: publicUser })
})

app.get('/api/auth/me', requireAuth, (req, res) => {
  const db = readDB()
  const user = db.users.find((u) => u.id === req.user.id)
  if (!user) return res.status(404).json({ error: 'User not found' })
  const { passwordHash: _, ...publicUser } = user
  res.json({ user: publicUser })
})

// ================= EMERGENCY CONTACTS =================
app.get('/api/contacts', requireAuth, (req, res) => {
  const db = readDB()
  res.json({ contacts: db.contacts.filter((c) => c.userId === req.user.id) })
})

app.post('/api/contacts', requireAuth, (req, res) => {
  const { name, phone, relation } = req.body
  if (!name) return res.status(400).json({ error: 'name is required' })
  const db = readDB()
  const contact = { id: uuid(), userId: req.user.id, name, phone: phone || null, relation: relation || null, watching: true, createdAt: new Date().toISOString() }
  db.contacts.push(contact)
  writeDB(db)
  res.status(201).json({ contact })
})

app.put('/api/contacts/:id', requireAuth, (req, res) => {
  const db = readDB()
  const idx = db.contacts.findIndex((c) => c.id === req.params.id && c.userId === req.user.id)
  if (idx === -1) return res.status(404).json({ error: 'Contact not found' })
  db.contacts[idx] = { ...db.contacts[idx], ...req.body }
  writeDB(db)
  res.json({ contact: db.contacts[idx] })
})

app.delete('/api/contacts/:id', requireAuth, (req, res) => {
  const db = readDB()
  const before = db.contacts.length
  db.contacts = db.contacts.filter((c) => !(c.id === req.params.id && c.userId === req.user.id))
  if (db.contacts.length === before) return res.status(404).json({ error: 'Contact not found' })
  writeDB(db)
  res.status(204).send()
})

// ================= SOS =================
app.post('/api/sos/trigger', requireAuth, (req, res) => {
  const db = readDB()
  const existing = db.sosAlerts.find((a) => a.userId === req.user.id && a.status === 'active')
  if (existing) return res.status(409).json({ error: 'You already have an active SOS alert', alert: existing })

  const { lat, lng, source } = req.body
  const alert = { id: uuid(), userId: req.user.id, lat: lat ?? null, lng: lng ?? null, source: source || 'manual', status: 'active', createdAt: new Date().toISOString(), resolvedAt: null }
  db.sosAlerts.push(alert)
  writeDB(db)

  const notified = db.contacts.filter((c) => c.userId === req.user.id && c.watching)
  res.status(201).json({ alert, notified: notified.map((c) => ({ id: c.id, name: c.name })) })
})

app.post('/api/sos/cancel/:id', requireAuth, (req, res) => {
  const db = readDB()
  const idx = db.sosAlerts.findIndex((a) => a.id === req.params.id && a.userId === req.user.id)
  if (idx === -1) return res.status(404).json({ error: 'Active alert not found' })
  db.sosAlerts[idx].status = 'resolved'
  db.sosAlerts[idx].resolvedAt = new Date().toISOString()
  writeDB(db)
  res.json({ alert: db.sosAlerts[idx] })
})

app.get('/api/sos/active', requireAuth, (req, res) => {
  const db = readDB()
  res.json({ alert: db.sosAlerts.find((a) => a.userId === req.user.id && a.status === 'active') || null })
})

app.get('/api/sos/history', requireAuth, (req, res) => {
  const db = readDB()
  const alerts = db.sosAlerts.filter((a) => a.userId === req.user.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  res.json({ alerts })
})

// ================= UNSAFE AREA REPORTS =================
const VALID_CATEGORIES = ['Poor lighting', 'Harassment', 'Isolated area', 'Suspicious activity', 'Other']

app.get('/api/reports', (req, res) => {
  const db = readDB()
  let reports = db.reports
  if (req.query.category) reports = reports.filter((r) => r.category.toLowerCase() === req.query.category.toLowerCase())
  res.json({ reports: reports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) })
})

app.post('/api/reports', requireAuth, (req, res) => {
  const { category, severity, note, lat, lng } = req.body
  if (!category || !VALID_CATEGORIES.includes(category)) {
    return res.status(400).json({ error: `category must be one of: ${VALID_CATEGORIES.join(', ')}` })
  }
  const db = readDB()
  const report = { id: uuid(), userId: req.user.id, category, severity: severity || 'medium', note: note || '', lat: lat ?? null, lng: lng ?? null, confirmations: 1, createdAt: new Date().toISOString() }
  db.reports.push(report)
  writeDB(db)
  res.status(201).json({ report })
})

app.get('/api/reports/nearby', (req, res) => {
  const lat = parseFloat(req.query.lat)
  const lng = parseFloat(req.query.lng)
  const radiusKm = req.query.radiusKm ? parseFloat(req.query.radiusKm) : 5
  if (Number.isNaN(lat) || Number.isNaN(lng)) return res.status(400).json({ error: 'lat and lng query params are required numbers' })

  function distanceKm(lat1, lng1, lat2, lng2) {
    const R = 6371
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLng = ((lng2 - lng1) * Math.PI) / 180
    const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  }

  const db = readDB()
  const nearby = db.reports
    .filter((r) => r.lat != null && r.lng != null)
    .map((r) => ({ ...r, distanceKm: distanceKm(lat, lng, r.lat, r.lng) }))
    .filter((r) => r.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm)

  res.json({ reports: nearby })
})

// ================= SAFETY TIMER =================
app.post('/api/timer/start', requireAuth, (req, res) => {
  const duration = Number(req.body.durationSeconds)
  if (!duration || duration <= 0) return res.status(400).json({ error: 'durationSeconds must be a positive number' })

  const db = readDB()
  db.timers = db.timers.map((t) => (t.userId === req.user.id && t.status === 'active' ? { ...t, status: 'cancelled' } : t))
  const now = Date.now()
  const timer = { id: uuid(), userId: req.user.id, durationSeconds: duration, startedAt: new Date(now).toISOString(), expiresAt: new Date(now + duration * 1000).toISOString(), status: 'active' }
  db.timers.push(timer)
  writeDB(db)
  res.status(201).json({ timer })
})

app.post('/api/timer/checkin/:id', requireAuth, (req, res) => {
  const db = readDB()
  const idx = db.timers.findIndex((t) => t.id === req.params.id && t.userId === req.user.id)
  if (idx === -1) return res.status(404).json({ error: 'Timer not found' })
  db.timers[idx].status = 'checked_in'
  writeDB(db)
  res.json({ timer: db.timers[idx] })
})

app.get('/api/timer/status', requireAuth, (req, res) => {
  const db = readDB()
  const timer = db.timers.find((t) => t.userId === req.user.id && t.status === 'active')
  if (!timer) return res.json({ timer: null })

  if (new Date(timer.expiresAt).getTime() <= Date.now()) {
    timer.status = 'expired'
    writeDB(db)

    const existingAlert = db.sosAlerts.find((a) => a.userId === req.user.id && a.status === 'active')
    if (!existingAlert) {
      const alert = { id: uuid(), userId: req.user.id, lat: null, lng: null, source: 'timer', status: 'active', createdAt: new Date().toISOString(), resolvedAt: null }
      db.sosAlerts.push(alert)
      writeDB(db)
      const notified = db.contacts.filter((c) => c.userId === req.user.id && c.watching)
      return res.json({ timer, autoAlertTriggered: true, alert, notified: notified.map((c) => c.name) })
    }
  }
  res.json({ timer, autoAlertTriggered: false })
})

// ================= AI ASSISTANT (key stays on the server) =================
const SYSTEM_PROMPT =
  "You are SafeHer AI, a calm, practical personal-safety assistant inside a women's safety app. " +
  'Give short, specific, actionable safety guidance (3-5 sentences max, sometimes a short list). ' +
  'Be warm but not alarmist. Never diagnose, never give legal advice, and if the user describes ' +
  'an immediate emergency, clearly and gently tell them to contact local emergency services right away.'

app.post('/api/assistant/chat', requireAuth, async (req, res) => {
  const { message } = req.body
  if (!message || !message.trim()) return res.status(400).json({ error: 'message is required' })

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'Server is missing ANTHROPIC_API_KEY' })

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 1000, system: SYSTEM_PROMPT, messages: [{ role: 'user', content: message }] })
    })
    if (!response.ok) return res.status(502).json({ error: 'Upstream AI request failed' })
    const data = await response.json()
    const reply = (data.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('\n')
    res.json({ reply: reply || "I couldn't quite process that — could you try rephrasing?" })
  } catch (err) {
    res.status(500).json({ error: 'Failed to reach the AI assistant service' })
  }
})

// ================= ADMIN =================
app.get('/api/admin/kpis', requireAuth, requireAdmin, (req, res) => {
  const db = readDB()
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  res.json({
    totalUsers: db.users.length,
    activeSOSAlerts: db.sosAlerts.filter((a) => a.status === 'active').length,
    unsafeReportsLast7Days: db.reports.filter((r) => new Date(r.createdAt) >= sevenDaysAgo).length
  })
})

app.get('/api/admin/incidents', requireAuth, requireAdmin, (req, res) => {
  const db = readDB()
  const alerts = db.sosAlerts.map((a) => ({ id: a.id, type: 'SOS Alert', status: a.status, time: a.createdAt }))
  const reports = db.reports.map((r) => ({ id: r.id, type: 'Unsafe Report', status: 'review', time: r.createdAt }))
  const merged = [...alerts, ...reports].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 20)
  res.json({ incidents: merged })
})

app.get('/api/admin/guardians-online', requireAuth, requireAdmin, (req, res) => {
  const db = readDB()
  res.json({ guardians: db.contacts.filter((c) => c.watching) })
})

// ---------- 404 + error handling ----------
app.use((req, res) => {
  res.status(404).json({
    error: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    error: "Internal server error"
  });
});

const PORT = process.env.PORT || 4000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");

    app.listen(PORT, () => {
      console.log(`✅ SafeHer AI backend running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err.message);
  });