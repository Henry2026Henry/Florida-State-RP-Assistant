# Deployment Guide

## Local Development

```bash
npm install
npm start
```

Visit `http://localhost:3000`

## Production Deployment

### Prerequisites
- Node.js 14+
- Discord OAuth credentials
- ERLC API key

### 1. Railway.app (Recommended)

**Easy 1-click deployment:**

1. Push code to GitHub
2. Visit [railway.app](https://railway.app)
3. Connect GitHub repository
4. Add environment variables:
   - `DISCORD_CLIENT_ID`
   - `DISCORD_CLIENT_SECRET`
   - `ERLC_API_KEY`
   - `ERLC_SERVER_ID`
   - `SESSION_SECRET`
   - `NODE_ENV=production`

5. Deploy!

### 2. Heroku

```bash
# Install Heroku CLI
# Login
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set DISCORD_CLIENT_ID=xxx
heroku config:set DISCORD_CLIENT_SECRET=xxx
heroku config:set ERLC_API_KEY=xxx
heroku config:set ERLC_SERVER_ID=xxx
heroku config:set SESSION_SECRET=xxx
heroku config:set NODE_ENV=production

# Deploy
git push heroku main
```

### 3. VPS (DigitalOcean, Linode, etc.)

```bash
# SSH into server
ssh root@your_ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repository
git clone https://github.com/Henry2026Henry/Florida-State-RP-Assistant.git
cd Florida-State-RP-Assistant

# Install dependencies
npm install

# Create .env file
nano .env
# Add your credentials

# Install PM2 (process manager)
npm install -g pm2

# Start with PM2
pm2 start server.js --name "fs-rp-dashboard"
pm2 startup
pm2 save

# Setup Nginx as reverse proxy
sudo apt-get install nginx

# Create Nginx config
sudo nano /etc/nginx/sites-available/default
```

**Nginx configuration:**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable HTTPS with Let's Encrypt
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### 4. Docker

```bash
# Build image
docker build -t fs-rp-dashboard .

# Run container
docker run -p 3000:3000 \
  -e DISCORD_CLIENT_ID=xxx \
  -e DISCORD_CLIENT_SECRET=xxx \
  -e ERLC_API_KEY=xxx \
  -e ERLC_SERVER_ID=xxx \
  -e SESSION_SECRET=xxx \
  fs-rp-dashboard
```

**Docker Compose:**
```yaml
version: '3.8'
services:
  dashboard:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DISCORD_CLIENT_ID=${DISCORD_CLIENT_ID}
      - DISCORD_CLIENT_SECRET=${DISCORD_CLIENT_SECRET}
      - ERLC_API_KEY=${ERLC_API_KEY}
      - ERLC_SERVER_ID=${ERLC_SERVER_ID}
      - SESSION_SECRET=${SESSION_SECRET}
      - NODE_ENV=production
```

## Environment Variables

```
DISCORD_CLIENT_ID=your_id
DISCORD_CLIENT_SECRET=your_secret
DISCORD_REDIRECT_URI=https://your-domain.com/auth/discord/callback
ERLC_API_KEY=your_key
ERLC_SERVER_ID=your_server_id
SESSION_SECRET=long_random_string
PORT=3000
NODE_ENV=production
```

## Monitoring

```bash
# PM2 monitoring
pm2 monit

# View logs
pm2 logs fs-rp-dashboard

# Restart
pm2 restart fs-rp-dashboard

# Stop
pm2 stop fs-rp-dashboard
```

## Updates

```bash
# Pull latest changes
git pull origin main

# Install updates
npm install

# Restart
pm2 restart fs-rp-dashboard
```

## Troubleshooting

**Port already in use:**
```bash
# Find process on port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

**Out of memory:**
```bash
# Increase swap
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

**SSL Certificate issues:**
```bash
# Renew certificate
sudo certbot renew

# Force renewal
sudo certbot renew --force-renewal
```
