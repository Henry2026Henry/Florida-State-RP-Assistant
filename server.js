const express = require('express');
const session = require('express-session');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const axios = require('axios');
require('dotenv').config();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true in production with HTTPS
}));

app.use(passport.initialize());
app.use(passport.session());

// Passport Discord Strategy
passport.use(new DiscordStrategy({
  clientID: process.env.DISCORD_CLIENT_ID,
  clientSecret: process.env.DISCORD_CLIENT_SECRET,
  callbackURL: process.env.DISCORD_REDIRECT_URI,
  scope: ['identify', 'email', 'guilds']
}, (accessToken, refreshToken, profile, done) => {
  profile.accessToken = accessToken;
  return done(null, profile);
}));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Not authenticated' });
};

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Discord Auth Routes
app.get('/auth/discord', passport.authenticate('discord'));

app.get('/auth/discord/callback',
  passport.authenticate('discord', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/dashboard');
  }
);

app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ error: err });
    res.redirect('/');
  });
});

// API Routes
app.get('/api/user', isAuthenticated, (req, res) => {
  res.json({
    id: req.user.id,
    username: req.user.username,
    discriminator: req.user.discriminator,
    avatar: req.user.avatar,
    email: req.user.email
  });
});

// Dashboard
app.get('/dashboard', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/');
  }
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Server Stats API - Connect to your ERLC API here
app.get('/api/server/stats', isAuthenticated, async (req, res) => {
  try {
    // Replace with your actual ERLC API endpoint
    // Example:
    // const response = await axios.get(`https://api.erlc.cc/servers/${process.env.ERLC_SERVER_ID}`, {
    //   headers: { 'Authorization': `Bearer ${process.env.ERLC_API_KEY}` }
    // });

    // Mock data for now - replace with real API calls
    res.json({
      status: 'Online',
      playersOnline: 24,
      maxPlayers: 128,
      uptime: '5d 12h 34m',
      lastRestart: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      version: '1.0.0'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch server stats', details: error.message });
  }
});

// Online Players API
app.get('/api/server/players', isAuthenticated, async (req, res) => {
  try {
    // Replace with your actual ERLC API endpoint
    res.json({
      players: [
        { id: 1, username: 'Player1', rank: 'Member', joinedAt: new Date() },
        { id: 2, username: 'Player2', rank: 'Moderator', joinedAt: new Date() },
        { id: 3, username: 'Player3', rank: 'Member', joinedAt: new Date() }
      ]
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch players', details: error.message });
  }
});

// Execute Command API
app.post('/api/server/command', isAuthenticated, async (req, res) => {
  try {
    const { command } = req.body;
    console.log(`Executing command: ${command}`);
    
    // Send command to your bot via Discord bot API or ERLC API
    // Example:
    // await axios.post(`https://api.erlc.cc/servers/${process.env.ERLC_SERVER_ID}/command`, {
    //   command: command
    // }, {
    //   headers: { 'Authorization': `Bearer ${process.env.ERLC_API_KEY}` }
    // });

    res.json({ success: true, message: `Command executed: ${command}` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to execute command', details: error.message });
  }
});

// Kick Player API
app.post('/api/server/kick', isAuthenticated, async (req, res) => {
  try {
    const { playerId, reason } = req.body;
    console.log(`Kicking player ${playerId}: ${reason}`);
    
    // Send kick command to your bot/ERLC server
    res.json({ success: true, message: `Player ${playerId} kicked` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to kick player', details: error.message });
  }
});

// Warn Player API
app.post('/api/server/warn', isAuthenticated, async (req, res) => {
  try {
    const { playerId, reason } = req.body;
    console.log(`Warning player ${playerId}: ${reason}`);
    
    res.json({ success: true, message: `Player ${playerId} warned` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to warn player', details: error.message });
  }
});

// Server logs API
app.get('/api/server/logs', isAuthenticated, (req, res) => {
  res.json({
    logs: [
      { timestamp: new Date(), message: 'Player joined', type: 'join' },
      { timestamp: new Date(), message: 'Player left', type: 'leave' },
      { timestamp: new Date(), message: 'Warning issued', type: 'warning' }
    ]
  });
});

app.listen(PORT, () => {
  console.log(`Dashboard running on http://localhost:${PORT}`);
  console.log(`Login with: http://localhost:${PORT}`);
});
