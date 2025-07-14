const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '../data.sqlite'));

db.prepare(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL
)`).run();

module.exports = db; 