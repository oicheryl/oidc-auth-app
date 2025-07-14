const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db');
const router = express.Router();

// Root route
router.get('/', (req, res) => {
  let user = null;
  if (req.session.userId) {
    user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.session.userId);
  }
  res.render('index', { user });
});

// Registration page
router.get('/register', (req, res) => {
  res.render('register');
});

// Register user
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.render('register', { error: 'All fields required.' });
  const hash = await bcrypt.hash(password, 10);
  try {
    db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run(username, hash);
    res.redirect('/login');
  } catch (e) {
    res.render('register', { error: 'Username already exists.' });
  }
});

// Login page
router.get('/login', (req, res) => {
  res.render('login');
});

// Login user
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user) return res.render('login', { error: 'Invalid credentials.' });
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.render('login', { error: 'Invalid credentials.' });
  req.session.userId = user.id;
  res.redirect('/profile');
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

module.exports = router; 