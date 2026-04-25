// Dashboard JavaScript

// Load user info on page load
document.addEventListener('DOMContentLoaded', () => {
  loadUserInfo();
  loadServerStats();
  loadPlayers();
  loadLogs();
  setupTabNavigation();
  setupCommandExecution();
});

// Load user information
async function loadUserInfo() {
  try {
    const response = await fetch('/api/user');
    const user = await response.json();
    
    document.getElementById('userName').textContent = user.username;
    const avatarUrl = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
    document.getElementById('userAvatar').src = avatarUrl;
  } catch (error) {
    console.error('Failed to load user info:', error);
  }
}

// Load server statistics
async function loadServerStats() {
  try {
    const response = await fetch('/api/server/stats');
    const stats = await response.json();
    
    document.getElementById('serverStatus').textContent = stats.status;
    document.getElementById('playersOnline').textContent = `${stats.playersOnline}/${stats.maxPlayers}`;
    document.getElementById('uptime').textContent = stats.uptime;
    document.getElementById('version').textContent = stats.version;
  } catch (error) {
    console.error('Failed to load server stats:', error);
    document.getElementById('serverStatus').textContent = 'Offline';
  }
}

// Load online players
async function loadPlayers() {
  try {
    const response = await fetch('/api/server/players');
    const data = await response.json();
    
    const playersList = document.getElementById('playersList');
    playersList.innerHTML = '';
    
    if (data.players.length === 0) {
      playersList.innerHTML = '<p class="no-data">No players online</p>';
      return;
    }
    
    data.players.forEach(player => {
      const playerCard = document.createElement('div');
      playerCard.className = 'player-card';
      playerCard.innerHTML = `
        <div class="player-info">
          <p class="player-name">${player.username}</p>
          <p class="player-rank">${player.rank}</p>
        </div>
        <div class="player-actions">
          <button class="action-btn warn-btn" onclick="warnPlayer(${player.id}, '${player.username}')">⚠️ Warn</button>
          <button class="action-btn kick-btn" onclick="kickPlayer(${player.id}, '${player.username}')">👢 Kick</button>
        </div>
      `;
      playersList.appendChild(playerCard);
    });
  } catch (error) {
    console.error('Failed to load players:', error);
    document.getElementById('playersList').innerHTML = '<p class="error">Failed to load players</p>';
  }
}

// Load server logs
async function loadLogs() {
  try {
    const response = await fetch('/api/server/logs');
    const data = await response.json();
    
    const logsList = document.getElementById('logsList');
    logsList.innerHTML = '';
    
    data.logs.forEach(log => {
      const logEntry = document.createElement('div');
      logEntry.className = `log-entry log-${log.type}`;
      const time = new Date(log.timestamp).toLocaleTimeString();
      logEntry.innerHTML = `
        <span class="log-time">${time}</span>
        <span class="log-message">${log.message}</span>
      `;
      logsList.appendChild(logEntry);
    });
  } catch (error) {
    console.error('Failed to load logs:', error);
  }
}

// Setup tab navigation
function setupTabNavigation() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Remove active class from all items
      document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
      
      // Add active class to clicked item
      item.classList.add('active');
      const tabName = item.dataset.tab;
      document.getElementById(`${tabName}-tab`).classList.add('active');
    });
  });
}

// Setup command execution
function setupCommandExecution() {
  document.getElementById('executeBtn').addEventListener('click', () => {
    const command = document.getElementById('commandInput').value;
    if (command.trim()) {
      executeCommand(command);
    }
  });
  
  document.querySelectorAll('.cmd-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const cmd = btn.dataset.cmd;
      executeCommand(cmd);
    });
  });
  
  document.getElementById('refreshBtn').addEventListener('click', () => {
    loadServerStats();
  });
  
  document.getElementById('logsRefreshBtn').addEventListener('click', () => {
    loadLogs();
  });
}

// Execute command
async function executeCommand(command) {
  try {
    const response = await fetch('/api/server/command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command })
    });
    
    const result = await response.json();
    const output = document.getElementById('commandOutput');
    const resultEl = document.getElementById('commandResult');
    
    if (result.success) {
      resultEl.textContent = `✅ ${result.message}`;
      resultEl.style.color = '#00ff00';
    } else {
      resultEl.textContent = `❌ Error: ${result.error}`;
      resultEl.style.color = '#ff0000';
    }
    
    output.style.display = 'block';
    document.getElementById('commandInput').value = '';
  } catch (error) {
    console.error('Command execution failed:', error);
  }
}

// Warn player
async function warnPlayer(playerId, playerName) {
  const reason = prompt(`Warn ${playerName}? Enter reason:`);
  if (reason === null) return;
  
  try {
    const response = await fetch('/api/server/warn', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, reason })
    });
    
    const result = await response.json();
    alert(result.message);
    loadPlayers();
  } catch (error) {
    alert('Failed to warn player');
  }
}

// Kick player
async function kickPlayer(playerId, playerName) {
  const reason = prompt(`Kick ${playerName}? Enter reason:`);
  if (reason === null) return;
  
  try {
    const response = await fetch('/api/server/kick', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, reason })
    });
    
    const result = await response.json();
    alert(result.message);
    loadPlayers();
  } catch (error) {
    alert('Failed to kick player');
  }
}

// Player search
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('playerSearch');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const searchTerm = e.target.value.toLowerCase();
      document.querySelectorAll('.player-card').forEach(card => {
        const playerName = card.querySelector('.player-name').textContent.toLowerCase();
        card.style.display = playerName.includes(searchTerm) ? 'flex' : 'none';
      });
    });
  }
});
