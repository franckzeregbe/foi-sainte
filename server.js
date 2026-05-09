const path = require('path');
const http = require('http');
const crypto = require('crypto');
const express = require('express');
const session = require('express-session');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const Database = require('better-sqlite3');
const { Server: SocketIO } = require('socket.io');
const webpush = require('web-push');
const cron = require('node-cron');
require('dotenv').config();

const app = express();
const httpServer = http.createServer(app);
const io = new SocketIO(httpServer, { cors: { origin: false } });
const PORT = Number(process.env.PORT || 5500);
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
const IS_PROD = process.env.NODE_ENV === 'production';
const TRUST_PROXY = Number(process.env.TRUST_PROXY || 0);

const db = new Database(path.join(__dirname, 'foi_sainte.db'));
db.pragma('journal_mode = WAL');

const DEFAULT_VERSE = {
  texte: "Mais vous, bien-aimés, vous édifiant vous-mêmes sur votre très sainte foi, et priant par le Saint-Esprit, conservez-vous dans l'amour de Dieu, en attendant la miséricorde de notre Seigneur Jésus-Christ pour la vie éternelle.",
  ref: 'Jude 1:20-21',
};

const DEFAULT_REPLAYS = [
  { id: 'dQw4w9WgXcQ', titre: 'Culte du 20 avril 2026 - La Grace de Dieu', date: '20 avril 2026' },
  { id: 'dQw4w9WgXcQ', titre: 'Culte du 13 avril 2026 - Foi et Perseverance', date: '13 avril 2026' },
  { id: 'dQw4w9WgXcQ', titre: 'Culte du 6 avril 2026 - Le Seigneur est ma Force', date: '6 avril 2026' },
];

const DEFAULT_PRAYERS = [
  { name: 'Christine', text: 'Merci de prier pour la guerison de mon frere qui est malade.', shared: 1 },
  { name: 'Marc', text: 'Priez pour ma famille, nous traversons une periode difficile.', shared: 1 },
  { name: 'Lucie', text: 'Demande de priere pour trouver un emploi et subvenir a mes besoins.', shared: 1 },
];

const DEFAULT_DONATIONS = {
  currency: 'XOF',
  orangeMoneyNumber: '07 89 36 21 85',
  orangeMoneyName: 'EGLISE FOI SAINTE',
  waveNumber: '07 57 55 86 03',
  mtnNumber: '05 04 00 86 26',
  paypalUrl: 'https://www.paypal.com/donate?business=VOTRE_EMAIL_PAYPAL',
  cinetpayUrl: '',
  flutterwaveUrl: '',
  skrillUrl: '',
  bankDetails: '',
  cashNote: '',
  showOrange: true,
  showWave: true,
  showMtn: true,
  showPayPal: true,
  showCinetPay: false,
  showFlutterwave: false,
  showSkrill: false,
  showBank: false,
  showCash: false,
};

function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL DEFAULT 'admin',
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  // Migration : ajouter la colonne username si elle n'existe pas
  const cols = db.prepare("PRAGMA table_info(admins)").all().map(c => c.name);
  if (!cols.includes('username')) {
    db.exec("ALTER TABLE admins ADD COLUMN username TEXT NOT NULL DEFAULT 'admin'");
  }

  db.exec(`
      CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS replays (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      yt_id TEXT NOT NULL,
      title TEXT NOT NULL,
      date_text TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS prayers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      text TEXT NOT NULL,
      shared INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS stat_totals (
      key TEXT PRIMARY KEY,
      value INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS stat_daily_visitors (
      day TEXT NOT NULL,
      visitor_id TEXT NOT NULL,
      PRIMARY KEY(day, visitor_id)
    );

    CREATE TABLE IF NOT EXISTS push_subscriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      endpoint TEXT UNIQUE NOT NULL,
      p256dh TEXT NOT NULL,
      auth TEXT NOT NULL,
      actif INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS agenda (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date_text TEXT NOT NULL,
      type TEXT NOT NULL,
      titre TEXT NOT NULL,
      heure TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  ensureSetting('verse', JSON.stringify(DEFAULT_VERSE));
  ensureSetting('live', JSON.stringify({
    streamUrl: '',
    liveVerseText: `"${DEFAULT_VERSE.texte}" — ${DEFAULT_VERSE.ref}`,
    liveVideoId: '',
    isLive: false,
  }));
  ensureSetting('donations', JSON.stringify(DEFAULT_DONATIONS));
  ensureSetting('eglise', JSON.stringify({
    nom: 'Église FOI SAINTE',
    slogan: 'Édifiés sur la foi, marchant dans l’amour',
    vision: 'Être une communauté de foi vivante, ancrée dans la Parole de Dieu, rayonnant l’amour du Christ dans toute la Côte d’Ivoire et au-delà.',
    mission: 'Évangéliser, former des disciples, adorer Dieu en esprit et en vérité, et servir notre prochain avec amour et compassion.',
    valeurs: 'Foi, Prière, Fraternité, Intégrité, Service. Nous croyons en la puissance transformatrice de l’Évangile de Jésus-Christ.',
    histoire: 'L’Église FOI SAINTE a été fondée avec la conviction profonde que Dieu appelle son peuple à se bâtir sur une foi solide et inébranlable. Depuis notre création, nous avons grandi en nombre et en maturité spirituelle, portés par la grâce de Dieu et la fidélité de notre communauté.',
    horaireCulte: 'Dimanche — 10h00 à 13h00',
    horaireEtude: 'Mercredi — 19h00 à 20h30',
    horaireVeillee: 'Vendredi — 21h00 à 00h00',
    adresse: 'Abidjan, Côte d’Ivoire',
    contact: '+225 07 89 36 21 85',
    email: 'contact@foisainte.com',
    equipe: 'Pasteur | Pasteur Principal',
  }));

  const replayCount = db.prepare('SELECT COUNT(*) AS c FROM replays').get().c;
  if (replayCount === 0) {
    const insertReplay = db.prepare('INSERT INTO replays (yt_id, title, date_text, created_at) VALUES (?, ?, ?, ?)');
    const now = new Date().toISOString();
    const transaction = db.transaction((rows) => {
      for (const row of rows) {
        insertReplay.run(row.id, row.titre, row.date, now);
      }
    });
    transaction(DEFAULT_REPLAYS);
  }

  const prayerCount = db.prepare('SELECT COUNT(*) AS c FROM prayers').get().c;
  if (prayerCount === 0) {
    const insertPrayer = db.prepare('INSERT INTO prayers (name, text, shared, created_at) VALUES (?, ?, ?, ?)');
    const now = new Date().toISOString();
    const tx = db.transaction((rows) => {
      for (const row of rows) {
        insertPrayer.run(row.name, row.text, row.shared, now);
      }
    });
    tx(DEFAULT_PRAYERS);
  }

  const agendaCount = db.prepare('SELECT COUNT(*) AS c FROM agenda').get().c;
  if (agendaCount === 0) {
    const insertAgenda = db.prepare('INSERT INTO agenda (date_text, type, titre, heure, created_at) VALUES (?, ?, ?, ?, ?)');
    const now = new Date().toISOString();
    const txA = db.transaction(() => {
      insertAgenda.run('Dimanche 27 avril', 'Culte principal', 'La puissance de la Foi', '10h00 - 13h00', now);
      insertAgenda.run('Mercredi 30 avril', 'Etude biblique', 'Le livre de Job - Session 4', '19h00 - 20h30', now);
      insertAgenda.run('Vendredi 2 mai', 'Veillee de priere', "Nuit de priere et d'adoration", '21h00 - 00h00', now);
      insertAgenda.run('Dimanche 4 mai', 'Culte principal', "Marcher dans l'Esprit", '10h00 - 13h00', now);
    });
    txA();
  }

  ensureStatKey('totalVisits');
  ensureStatKey('chatMessages');
  ensureStatKey('prayerRequests');
}

async function createDefaultAdmin() {
  if (!needsSetup()) return;
  const username = (process.env.ADMIN_DEFAULT_USERNAME || 'admin').trim();
  const password = (process.env.ADMIN_DEFAULT_PASSWORD || '').trim();
  if (!username || password.length < 12) {
    console.warn('[FOI SAINTE] Aucun compte admin trouvé. Définissez ADMIN_DEFAULT_USERNAME et ADMIN_DEFAULT_PASSWORD (min 12 car.) dans .env');
    return;
  }
  const hash = await bcrypt.hash(password, 12);
  db.prepare('INSERT INTO admins (username, password_hash, created_at) VALUES (?, ?, ?)').run(username, hash, new Date().toISOString());
  console.log(`[FOI SAINTE] Compte admin créé : "${username}" — Changez le mot de passe dès la première connexion.`);
}

function ensureSetting(key, defaultValue) {
  db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)').run(key, defaultValue);
}

function ensureStatKey(key) {
  db.prepare('INSERT OR IGNORE INTO stat_totals (key, value) VALUES (?, 0)').run(key);
}

function getSettingJson(key, fallback) {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
  if (!row) return fallback;
  try {
    return JSON.parse(row.value);
  } catch {
    return fallback;
  }
}

function setSettingJson(key, value) {
  db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').run(key, JSON.stringify(value));
}

function normalizeDonations(raw) {
  const input = raw && typeof raw === 'object' ? raw : {};
  const readText = (key, max = 250) => String(input[key] ?? DEFAULT_DONATIONS[key] ?? '').trim().slice(0, max);
  const readBool = (key) => (key in input ? Boolean(input[key]) : Boolean(DEFAULT_DONATIONS[key]));

  return {
    currency: readText('currency', 8) || 'XOF',
    orangeMoneyNumber: readText('orangeMoneyNumber', 60),
    orangeMoneyName: readText('orangeMoneyName', 120),
    waveNumber: readText('waveNumber', 60),
    mtnNumber: readText('mtnNumber', 60),
    paypalUrl: readText('paypalUrl', 500),
    cinetpayUrl: readText('cinetpayUrl', 500),
    flutterwaveUrl: readText('flutterwaveUrl', 500),
    skrillUrl: readText('skrillUrl', 500),
    bankDetails: readText('bankDetails', 800),
    cashNote: readText('cashNote', 300),
    showOrange: readBool('showOrange'),
    showWave: readBool('showWave'),
    showMtn: readBool('showMtn'),
    showPayPal: readBool('showPayPal'),
    showCinetPay: readBool('showCinetPay'),
    showFlutterwave: readBool('showFlutterwave'),
    showSkrill: readBool('showSkrill'),
    showBank: readBool('showBank'),
    showCash: readBool('showCash'),
  };
}

function getDonationsConfig() {
  return normalizeDonations(getSettingJson('donations', DEFAULT_DONATIONS));
}

function getAgenda() {
  return db.prepare('SELECT id, date_text, type, titre, heure FROM agenda ORDER BY id ASC').all();
}

function getReplays() {
  return db
    .prepare('SELECT id, yt_id, title, date_text FROM replays ORDER BY id DESC')
    .all()
    .map((r) => ({ dbId: r.id, id: r.yt_id, titre: r.title, date: r.date_text }));
}

function getSharedPrayers() {
  return db
    .prepare('SELECT id, name, text FROM prayers WHERE shared = 1 ORDER BY id DESC')
    .all();
}

function getAllPrayers() {
  return db
    .prepare('SELECT id, name, text, shared, created_at FROM prayers ORDER BY id DESC')
    .all();
}

function statValue(key) {
  const row = db.prepare('SELECT value FROM stat_totals WHERE key = ?').get(key);
  return row ? row.value : 0;
}

function buildStats(day) {
  const uniqueRow = db.prepare('SELECT COUNT(*) AS c FROM stat_daily_visitors WHERE day = ?').get(day);
  return {
    totalVisits: statValue('totalVisits'),
    uniqueVisitorsToday: uniqueRow ? uniqueRow.c : 0,
    chatMessages: statValue('chatMessages'),
    prayerRequests: statValue('prayerRequests'),
    day,
  };
}

function incrementStat(key, amount = 1) {
  db.prepare('UPDATE stat_totals SET value = value + ? WHERE key = ?').run(amount, key);
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function createVisitorId() {
  return crypto.randomUUID();
}

function needsSetup() {
  const row = db.prepare('SELECT COUNT(*) AS c FROM admins').get();
  return row.c === 0;
}

function requireAdmin(req, res, next) {
  if (!req.session.adminId) {
    return res.status(401).json({ error: 'AUTH_REQUIRED' });
  }
  next();
}

// ─── WEB PUSH (VAPID) ─────────────────────────────────────────────────────────

function initVapid() {
  let keys = getSettingJson('vapid_keys', null);
  if (!keys) {
    keys = webpush.generateVAPIDKeys();
    setSettingJson('vapid_keys', keys);
  }
  webpush.setVapidDetails('mailto:contact@foisainte.com', keys.publicKey, keys.privateKey);
  return keys;
}

async function broadcastPush(title, body) {
  const subs = db.prepare('SELECT endpoint, p256dh, auth FROM push_subscriptions WHERE actif = 1').all();
  let sent = 0;
  const payload = JSON.stringify({ title, body, icon: '/logo-foi-sainte.jpg', badge: '/logo-foi-sainte.jpg', url: '/' });
  for (const sub of subs) {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        payload
      );
      sent++;
    } catch (err) {
      if (err.statusCode === 410 || err.statusCode === 404) {
        db.prepare('UPDATE push_subscriptions SET actif = 0 WHERE endpoint = ?').run(sub.endpoint);
      }
    }
  }
  return sent;
}

// ─── CRON ─────────────────────────────────────────────────────────────────────

let cronJob = null;

function scheduleCron() {
  if (cronJob) { cronJob.stop(); cronJob = null; }
  const schedule = getSettingJson('push_schedule', { enabled: false, day: 'sunday', hour: 9, minute: 30, message: 'Le culte commence dans 30 minutes — Rejoignez-nous !' });
  if (!schedule.enabled) return;
  const dayMap = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 };
  const dayNum = dayMap[schedule.day] ?? 0;
  const cronExpr = `${Number(schedule.minute)} ${Number(schedule.hour)} * * ${dayNum}`;
  cronJob = cron.schedule(cronExpr, async () => {
    await broadcastPush('⛪ Église FOI SAINTE', schedule.message || 'Le culte commence dans 30 minutes !');
  }, { timezone: 'Africa/Abidjan' });
}

// ─── SOCKET.IO CHAT ───────────────────────────────────────────────────────────

const recentMessages = [];
const MAX_CHAT_MESSAGES = 50;

io.on('connection', (socket) => {
  socket.emit('chat:history', recentMessages.slice(-20));

  socket.on('chat:send', (data) => {
    const name = String(data?.name || 'Anonyme').trim().slice(0, 40);
    const text = String(data?.text || '').trim().slice(0, 120);
    if (!text) return;
    const msg = { name, text, ts: Date.now() };
    recentMessages.push(msg);
    if (recentMessages.length > MAX_CHAT_MESSAGES) recentMessages.shift();
    incrementStat('chatMessages', 1);
    io.emit('chat:message', msg);
  });
});

initDb();
initVapid();
scheduleCron();
createDefaultAdmin();

if (TRUST_PROXY > 0) {
  app.set('trust proxy', TRUST_PROXY);
}

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: false,
}));
app.use(express.json({ limit: '1mb' }));
app.use(session({
  name: 'foi_admin_sid',
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: IS_PROD,
    maxAge: 1000 * 60 * 60 * 8,
  },
}));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

app.get('/api/public/content', (req, res) => {
  const verse = getSettingJson('verse', DEFAULT_VERSE);
  const live = getSettingJson('live', {
    streamUrl: '',
    liveVerseText: `"${DEFAULT_VERSE.texte}" — ${DEFAULT_VERSE.ref}`,
    liveVideoId: '',
    isLive: false,
  });
  res.json({
    verse,
    live,
    donations: getDonationsConfig(),
    replays: getReplays(),
    intentions: getSharedPrayers(),
    agenda: getAgenda(),
    eglise: getSettingJson('eglise', {}),
  });
});

app.post('/api/public/prayers', (req, res) => {
  const name = String(req.body?.name || '').trim();
  const text = String(req.body?.text || '').trim();
  const share = Boolean(req.body?.share);

  if (!name || !text) {
    return res.status(400).json({ error: 'INVALID_PAYLOAD' });
  }

  db.prepare('INSERT INTO prayers (name, text, shared, created_at) VALUES (?, ?, ?, ?)')
    .run(name.slice(0, 80), text.slice(0, 1000), share ? 1 : 0, new Date().toISOString());

  incrementStat('prayerRequests', 1);
  res.json({ ok: true });
});

app.post('/api/public/stats/visit', (req, res) => {
  const day = todayKey();
  const rawVisitorId = String(req.body?.visitorId || '').trim();
  const visitorId = rawVisitorId || createVisitorId();

  incrementStat('totalVisits', 1);
  db.prepare('INSERT OR IGNORE INTO stat_daily_visitors (day, visitor_id) VALUES (?, ?)').run(day, visitorId);

  res.json({ ok: true, visitorId, stats: buildStats(day) });
});

app.post('/api/public/stats/chat', (req, res) => {
  incrementStat('chatMessages', 1);
  res.json({ ok: true });
});

app.get('/api/public/stats', (req, res) => {
  res.json(buildStats(todayKey()));
});

app.get('/api/admin/status', (req, res) => {
  res.json({
    authenticated: Boolean(req.session.adminId),
    needsSetup: needsSetup(),
  });
});

app.post('/api/admin/setup', authLimiter, async (req, res) => {
  if (!needsSetup()) {
    return res.status(409).json({ error: 'ALREADY_SETUP' });
  }

  const username = String(req.body?.username || '').trim();
  const password = String(req.body?.password || '').trim();

  if (!username || username.length < 3) {
    return res.status(400).json({ error: 'USERNAME_TOO_SHORT' });
  }
  if (password.length < 12) {
    return res.status(400).json({ error: 'PASSWORD_TOO_SHORT' });
  }

  const hash = await bcrypt.hash(password, 12);
  const result = db.prepare('INSERT INTO admins (username, password_hash, created_at) VALUES (?, ?, ?)').run(username, hash, new Date().toISOString());
  req.session.adminId = result.lastInsertRowid;
  res.json({ ok: true });
});

app.post('/api/admin/login', authLimiter, async (req, res) => {
  const username = String(req.body?.username || '').trim();
  const password = String(req.body?.password || '').trim();
  const admin = db.prepare('SELECT id, username, password_hash FROM admins WHERE username = ? LIMIT 1').get(username);

  if (!admin) {
    return res.status(401).json({ error: 'INVALID_CREDENTIALS' });
  }

  const valid = await bcrypt.compare(password, admin.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'INVALID_CREDENTIALS' });
  }

  req.session.adminId = admin.id;
  res.json({ ok: true });
});

app.post('/api/admin/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('foi_admin_sid');
    res.json({ ok: true });
  });
});

app.post('/api/admin/change-password', requireAdmin, authLimiter, async (req, res) => {
  const currentPassword = String(req.body?.currentPassword || '').trim();
  const newPassword = String(req.body?.newPassword || '').trim();
  const newUsername = String(req.body?.newUsername || '').trim();

  if (newPassword.length < 12) {
    return res.status(400).json({ error: 'PASSWORD_TOO_SHORT' });
  }

  const admin = db.prepare('SELECT id, password_hash FROM admins WHERE id = ?').get(req.session.adminId);
  if (!admin) return res.status(409).json({ error: 'NOT_SETUP' });

  const valid = await bcrypt.compare(currentPassword, admin.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'INVALID_CREDENTIALS' });
  }

  const hash = await bcrypt.hash(newPassword, 12);
  if (newUsername && newUsername.length >= 3) {
    db.prepare('UPDATE admins SET username = ?, password_hash = ? WHERE id = ?').run(newUsername, hash, admin.id);
  } else {
    db.prepare('UPDATE admins SET password_hash = ? WHERE id = ?').run(hash, admin.id);
  }

  req.session.destroy(() => {
    res.clearCookie('foi_admin_sid');
    res.json({ ok: true });
  });
});

app.get('/api/admin/dashboard', requireAdmin, (req, res) => {
  res.json({
    verse: getSettingJson('verse', DEFAULT_VERSE),
    live: getSettingJson('live', { streamUrl: '', liveVerseText: '', liveVideoId: '', isLive: false }),
    donations: getDonationsConfig(),
    replays: getReplays(),
    prayers: getAllPrayers(),
    agenda: getAgenda(),
    eglise: getSettingJson('eglise', {}),
    stats: buildStats(todayKey()),
  });
});

app.put('/api/admin/verse', requireAdmin, (req, res) => {
  const texte = String(req.body?.texte || '').trim();
  const ref = String(req.body?.ref || '').trim();
  if (!texte || !ref) {
    return res.status(400).json({ error: 'INVALID_PAYLOAD' });
  }
  setSettingJson('verse', { texte, ref });
  res.json({ ok: true });
});

app.put('/api/admin/live', requireAdmin, (req, res) => {
  const payload = {
    streamUrl: String(req.body?.streamUrl || '').trim(),
    liveVerseText: String(req.body?.liveVerseText || '').trim(),
    liveVideoId: String(req.body?.liveVideoId || '').trim(),
    isLive: Boolean(req.body?.isLive),
  };
  setSettingJson('live', payload);
  res.json({ ok: true });
});

app.put('/api/admin/donations', requireAdmin, (req, res) => {
  const payload = normalizeDonations(req.body || {});
  setSettingJson('donations', payload);
  res.json({ ok: true, donations: payload });
});

app.post('/api/admin/replays', requireAdmin, (req, res) => {
  const id = String(req.body?.id || '').trim();
  const titre = String(req.body?.titre || '').trim();
  const date = String(req.body?.date || '').trim();

  if (!id || !titre || !date) {
    return res.status(400).json({ error: 'INVALID_PAYLOAD' });
  }

  db.prepare('INSERT INTO replays (yt_id, title, date_text, created_at) VALUES (?, ?, ?, ?)')
    .run(id.slice(0, 80), titre.slice(0, 200), date.slice(0, 120), new Date().toISOString());
  res.json({ ok: true });
});

app.put('/api/admin/replays/:replayId', requireAdmin, (req, res) => {
  const replayId = Number(req.params.replayId);
  const yt_id = String(req.body?.id || '').trim();
  const titre = String(req.body?.titre || '').trim();
  const date = String(req.body?.date || '').trim();

  if (!Number.isInteger(replayId) || replayId <= 0) {
    return res.status(400).json({ error: 'INVALID_REPLAY_ID' });
  }
  if (!yt_id || !titre || !date) {
    return res.status(400).json({ error: 'INVALID_PAYLOAD' });
  }

  db.prepare('UPDATE replays SET yt_id = ?, title = ?, date_text = ? WHERE id = ?')
    .run(yt_id.slice(0, 80), titre.slice(0, 200), date.slice(0, 120), replayId);
  res.json({ ok: true });
});

app.delete('/api/admin/replays/:id', requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'INVALID_ID' });
  }
  db.prepare('DELETE FROM replays WHERE id = ?').run(id);
  res.json({ ok: true });
});

app.post('/api/admin/agenda', requireAdmin, (req, res) => {
  const date_text = String(req.body?.date_text || '').trim();
  const type = String(req.body?.type || '').trim();
  const titre = String(req.body?.titre || '').trim();
  const heure = String(req.body?.heure || '').trim();
  if (!date_text || !type || !titre || !heure) return res.status(400).json({ error: 'INVALID_PAYLOAD' });
  db.prepare('INSERT INTO agenda (date_text, type, titre, heure, created_at) VALUES (?, ?, ?, ?, ?)')
    .run(date_text.slice(0, 120), type.slice(0, 80), titre.slice(0, 200), heure.slice(0, 80), new Date().toISOString());
  res.json({ ok: true });
});

app.put('/api/admin/agenda/:id', requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const date_text = String(req.body?.date_text || '').trim();
  const type = String(req.body?.type || '').trim();
  const titre = String(req.body?.titre || '').trim();
  const heure = String(req.body?.heure || '').trim();
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'INVALID_ID' });
  if (!date_text || !type || !titre || !heure) return res.status(400).json({ error: 'INVALID_PAYLOAD' });
  db.prepare('UPDATE agenda SET date_text = ?, type = ?, titre = ?, heure = ? WHERE id = ?')
    .run(date_text.slice(0, 120), type.slice(0, 80), titre.slice(0, 200), heure.slice(0, 80), id);
  res.json({ ok: true });
});

app.delete('/api/admin/agenda/:id', requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'INVALID_ID' });
  db.prepare('DELETE FROM agenda WHERE id = ?').run(id);
  res.json({ ok: true });
});

app.put('/api/admin/eglise', requireAdmin, (req, res) => {
  const fields = ['nom','slogan','vision','mission','valeurs','histoire','horaireCulte','horaireEtude','horaireVeillee','adresse','contact','email','equipe'];
  const payload = {};
  for (const f of fields) payload[f] = String(req.body?.[f] || '').trim().slice(0, 1000);
  setSettingJson('eglise', payload);
  res.json({ ok: true, eglise: payload });
});

app.delete('/api/admin/prayers/:id', requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'INVALID_ID' });
  }
  db.prepare('DELETE FROM prayers WHERE id = ?').run(id);
  res.json({ ok: true });
});

app.post('/api/admin/stats/reset', requireAdmin, (req, res) => {
  db.prepare('UPDATE stat_totals SET value = 0 WHERE key IN (?, ?, ?)').run('totalVisits', 'chatMessages', 'prayerRequests');
  db.prepare('DELETE FROM stat_daily_visitors').run();
  res.json({ ok: true });
});

// ─── Export CSV ───────────────────────────────────────────────────────────────

function toCSV(headers, rows) {
  const escape = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const header = headers.map(escape).join(',');
  const body = rows.map(r => headers.map(h => escape(r[h])).join(',')).join('\n');
  return header + '\n' + body;
}

app.get('/api/admin/export/prayers', requireAdmin, (req, res) => {
  const rows = db.prepare('SELECT id, name, prayer_text AS demande, created_at AS date FROM prayers ORDER BY created_at DESC').all();
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="demandes-de-priere.csv"');
  res.send('\uFEFF' + toCSV(['id', 'name', 'demande', 'date'], rows));
});

app.get('/api/admin/export/stats', requireAdmin, (req, res) => {
  const totals = db.prepare('SELECT key, value FROM stat_totals').all();
  const daily = db.prepare('SELECT visit_date AS date, visitors FROM stat_daily_visitors ORDER BY visit_date DESC').all();
  let csv = '"Indicateur","Valeur"\n';
  totals.forEach(t => { csv += `"${t.key}","${t.value}"\n`; });
  csv += '\n"Date","Visiteurs uniques"\n';
  daily.forEach(d => { csv += `"${d.date}","${d.visitors}"\n`; });
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="statistiques.csv"');
  res.send('\uFEFF' + csv);
});

app.get('/api/admin/export/replays', requireAdmin, (req, res) => {
  const rows = db.prepare('SELECT id, title AS titre, youtube_id AS youtube, created_at AS date FROM replays ORDER BY created_at DESC').all();
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="replays.csv"');
  res.send('\uFEFF' + toCSV(['id', 'titre', 'youtube', 'date'], rows));
});

// ─── PUSH NOTIFICATION ROUTES ────────────────────────────────────────────────

app.get('/api/public/push/vapid-key', (req, res) => {
  const keys = getSettingJson('vapid_keys', null);
  if (!keys) return res.status(503).json({ error: 'VAPID_NOT_INIT' });
  res.json({ publicKey: keys.publicKey });
});

app.post('/api/public/push/subscribe', (req, res) => {
  const { endpoint, keys } = req.body || {};
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return res.status(400).json({ error: 'INVALID_PAYLOAD' });
  }
  db.prepare(`INSERT INTO push_subscriptions (endpoint, p256dh, auth, actif, created_at)
    VALUES (?, ?, ?, 1, ?)
    ON CONFLICT(endpoint) DO UPDATE SET actif = 1, p256dh = excluded.p256dh, auth = excluded.auth`)
    .run(endpoint, keys.p256dh, keys.auth, new Date().toISOString());
  res.json({ ok: true });
});

app.post('/api/public/push/unsubscribe', (req, res) => {
  const { endpoint } = req.body || {};
  if (!endpoint) return res.status(400).json({ error: 'INVALID_PAYLOAD' });
  db.prepare('UPDATE push_subscriptions SET actif = 0 WHERE endpoint = ?').run(endpoint);
  res.json({ ok: true });
});

app.get('/api/admin/push/schedule', requireAdmin, (req, res) => {
  res.json(getSettingJson('push_schedule', { enabled: false, day: 'sunday', hour: 9, minute: 30, message: 'Le culte commence dans 30 minutes — Rejoignez-nous !' }));
});

app.put('/api/admin/push/schedule', requireAdmin, (req, res) => {
  const { enabled, day, hour, minute, message } = req.body || {};
  setSettingJson('push_schedule', {
    enabled: Boolean(enabled),
    day: String(day || 'sunday'),
    hour: Math.max(0, Math.min(23, Number(hour) || 9)),
    minute: Math.max(0, Math.min(59, Number(minute) || 30)),
    message: String(message || '').slice(0, 200),
  });
  scheduleCron();
  res.json({ ok: true });
});

app.post('/api/admin/push/send', requireAdmin, async (req, res) => {
  const title = String(req.body?.title || '').trim().slice(0, 100);
  const body = String(req.body?.body || '').trim().slice(0, 200);
  if (!title) return res.status(400).json({ error: 'INVALID_PAYLOAD' });
  try {
    const count = await broadcastPush(title, body);
    res.json({ ok: true, sent: count });
  } catch {
    res.status(500).json({ error: 'PUSH_FAILED' });
  }
});

app.get('/api/admin/push/stats', requireAdmin, (req, res) => {
  const total = db.prepare('SELECT COUNT(*) AS c FROM push_subscriptions').get().c;
  const actif = db.prepare('SELECT COUNT(*) AS c FROM push_subscriptions WHERE actif = 1').get().c;
  res.json({ total, actif });
});

app.use(express.static(__dirname));

httpServer.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Serveur FOI SAINTE actif sur http://localhost:${PORT}`);
});
