# ERLC Bot Dashboard

> A beautiful web dashboard to manage your ERLC (Emergency Response: Liberty County) Discord bot and Roblox server.

## 🎯 Features

✅ **Discord OAuth Authentication** - Secure login with Discord  
✅ **Real-time Server Stats** - View players online, uptime, server status  
✅ **Player Management** - Warn, kick, and manage players  
✅ **Command Execution** - Execute server commands directly  
✅ **Activity Logs** - Track server events and actions  
✅ **Server Settings** - Configure server options  
✅ **Responsive Design** - Works on mobile and desktop  
✅ **Discord-themed UI** - Beautiful dark theme  

## 🚀 Quick Start

### Prerequisites
- Node.js 14+ installed
- Discord Bot created ([Discord Developer Portal](https://discord.com/developers/applications))
- Your Discord Client ID and Secret
- Your ERLC API key (if applicable)

### Installation

1. **Clone or download this repository**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file**
   ```bash
   cp .env.example .env
   ```

4. **Configure `.env` with your credentials**
   ```
   DISCORD_CLIENT_ID=1317514046005575781
   DISCORD_CLIENT_SECRET=dEUXzwyK1i-E3lOQ_YmUWCQXrZnIyoYF
   DISCORD_REDIRECT_URI=http://localhost:3000/auth/discord/callback
   BOT_TOKEN=your_bot_token
   ERLC_API_KEY=your_api_key
   ERLC_SERVER_ID=your_server_id
   SESSION_SECRET=generate_a_random_key_here
   PORT=3000
   NODE_ENV=development
   ```

5. **Start the server**
   ```bash
   npm start
   ```

6. **Open in browser**
   ```
   http://localhost:3000
   ```

## 📋 Dashboard Sections

### 📊 Overview
- Server status and statistics
- Player count
- Server uptime
- Recent activity feed

### 👥 Players
- List of online players
- Search and filter players
- Quick warn/kick buttons

### ⚡ Commands
- Execute custom server commands
- Quick command buttons
- Command output display

### 📝 Logs
- View server activity history
- Different log types (joins, leaves, warnings)
- Filterable by type

### ⚙️ Settings
- Server configuration
- Save settings
- Auto-restart options

## 🔧 Integration with Your Bot

The dashboard is currently using **mock data**. To connect it to your actual ERLC server:

### 1. Update Server Stats Endpoint

In `server.js`, update the `/api/server/stats` route:

```javascript
app.get('/api/server/stats', isAuthenticated, async (req, res) => {
  try {
    const response = await axios.get(`https://your-erlc-api.com/servers/${process.env.ERLC_SERVER_ID}`, {
      headers: { 'Authorization': `Bearer ${process.env.ERLC_API_KEY}` }
    });
    
    res.json({
      status: response.data.status,
      playersOnline: response.data.players_online,
      maxPlayers: response.data.max_players,
      uptime: response.data.uptime,
      version: response.data.version
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch server stats' });
  }
});
```

### 2. Update Players Endpoint

Replace mock data with your actual player data from the ERLC API

### 3. Connect Commands

Send commands to your bot via Discord API or ERLC webhook

## 🌐 Deployment

See `DEPLOYMENT.md` for guides on:
- Railway (recommended)
- Heroku
- VPS (DigitalOcean, Linode)
- Docker

## 📁 File Structure

```
.
├── server.js                 # Express backend
├── package.json              # Dependencies
├── .env.example              # Environment template
├── public/
│   ├── index.html            # Login page
│   ├── dashboard.html        # Main dashboard
│   ├── dashboard.js          # Frontend logic
│   ├── styles.css            # Global styles
│   └── dashboard.css         # Dashboard styles
├── README.md                 # This file
└── DEPLOYMENT.md             # Deployment guide
```

## 🔐 Security Notes

⚠️ **Important:**
- Never commit `.env` file with real credentials
- Use strong `SESSION_SECRET` - Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- Use HTTPS in production
- Enable secure cookies when using HTTPS
- Validate and sanitize all user inputs
- Implement rate limiting for API endpoints

## 🐛 Troubleshooting

### "Cannot GET /auth/discord"
- Check Discord credentials in `.env`
- Verify redirect URI matches in Discord Developer Portal

### "Session not saved"
- Ensure `SESSION_SECRET` is set
- Check cookie settings match your deployment environment

### "Failed to fetch players"
- Verify ERLC API endpoint is correct
- Check API key has proper permissions
- Verify server ID is correct

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review `.env` configuration
3. Check browser console for errors
4. Check server logs for backend errors

## 📝 License

This project is open source and available under the MIT License.

## 🙏 Credits

Built for ERLC (Emergency Response: Liberty County) server management.

---

**Ready to deploy?** Check out `DEPLOYMENT.md` for step-by-step guides!
