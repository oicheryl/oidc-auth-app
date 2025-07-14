const express = require('express');
const session = require('express-session');
const path = require('path');
const { Provider } = require('oidc-provider');
const SQLiteStore = require('better-sqlite3-session-store')(session);
const db = require('./db');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');

const app = express();
const port = 3000;

// Session setup
app.use(session({
  secret: 'supersecret',
  resave: false,
  saveUninitialized: false,
  store: new SQLiteStore({
    client: db,
    expired: {
      clear: true,
      intervalMs: 900000
    }
  })
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.use('/', authRoutes);
app.use('/', profileRoutes);

// OIDC Provider setup
const oidc = new Provider('http://localhost:3000', {
  clients: [
    {
      client_id: 'client',
      client_secret: 'clientsecret',
      grant_types: ['authorization_code'],
      redirect_uris: ['http://localhost:3000/cb'],
    },
  ],
  features: {
    devInteractions: { enabled: false },
    introspection: { enabled: true },
    revocation: { enabled: true },
  },
  formats: {
    AccessToken: 'jwt',
  },
  findAccount: async (ctx, id) => {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if (!user) return undefined;
    return {
      accountId: id,
      async claims() {
        return { sub: id, username: user.username };
      },
    };
  },
});

app.use('/oidc', oidc.callback());

app.listen(port, () => {
  console.log(`OIDC Auth App listening at http://localhost:${port}`);
}); 