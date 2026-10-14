require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { Pool } = require('pg');

const app = express();
app.use(express.json());
app.use(cors({
  origin: ['http://127.0.0.1:5500', 'http://localhost:5500'] // add your Vercel URL later
}));

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });

const makeToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

app.post('/api/register', authLimiter, async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password || password.length < 8)
    return res.status(400).json({ error: 'Name, email and a password of 8+ characters are required' });
  try {
    const hash = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3)',
      [name.trim(), email.trim().toLowerCase(), hash]
    );
    res.status(201).json({ message: 'Account created' });
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: 'Email already registered' });
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/login', authLimiter, async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email.trim().toLowerCase()]);
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash)))
      return res.status(401).json({ error: 'Wrong email or password' });

    res.json({
      token: makeToken(user.id),
      user: { name: user.name, email: user.email }
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

// Middleware for protected routes (checkout, orders, etc.)
function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Please log in' });
  }
}

app.get('/api/me', auth, async (req, res) => {
  const { rows } = await pool.query('SELECT name, email FROM users WHERE id = $1', [req.user.id]);
  res.json(rows[0]);
});

app.listen(3000, () => console.log('API running on http://localhost:3000'));