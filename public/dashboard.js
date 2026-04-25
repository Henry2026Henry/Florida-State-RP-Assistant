// Dashboard JavaScript

// State
let currentPage = 'overview';
let allPlayers = [];
let allLogs = [];

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  await loadUserInfo();
  setupEventListeners();
  refreshData();

  // Auto-refresh every 30 seconds
  setInterval(refreshData, 30000);
});

// Load user info
async function loadUserInfo() {
  try {
    const response = await fetch('/api/user');
    if (!response.ok) throw new Error('Not authenticated');

    const user = await response.json();
    document.getElementById('userName').textContent = user.username;
    document.getElementById('userAvatar').src = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
  } catch (error) {
    console.error('Error loading user:', error);
    window.location.href = '/';
  }
}

// Setup event listeners
function setupEventListeners() {
  // Navigation
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const page = link.dataset.page;
      switchPage(page);
    });
  });

  // Logout
  document.getElementById('logoutBtn').addEventListener('click', async () => {
    await fetch('/api/logout', { method: 'POST' });
    window.location.href = '/';
  });

  // Player search
  document.getElementById('playerSearch').addEventListener('input', filterPlayersList);

  // Log search
  document.getElementById('logSearch').addEventListener('input', filterLogsList);

  // Log filter
  document.getElementById('logFilter').addEventListener('change', filterLogsList);
}

// Switch page
function switchPage(page) {
  // Hide all pages
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

  // Remove active from nav
  document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));

  // Show selected page
  document.getElementById(page).classList.add('active');

  // Mark nav as active
  document.querySelector(`[data-page="${page}"]`).classList.add('active');

  currentPage = page;

  // Load page-specific data
  if (page === 'players') loadPlayers();
  if (page === 'logs') loadLogs();
}

// Refresh all data
async function refreshData() {
  try {
    const statsResponse = await fetch('/api/server/stats');
    const stats = await statsResponse.json();

    // Update stats
    document.getElementById('playerCount').textContent = stats.playerCount;
    document.getElementById('maxPlayers').textContent = `of ${stats.maxPlayers}`;
    document.getElementById('uptime').textContent = stats.uptime;
    document.getElementById('version').textContent = stats.version;
    document.getElementById('statusText').textContent = stats.status;
    document.getElementById('lastUpdate').textContent = `Last updated: ${new Date().toLocaleTimeString()}`;

    // Update status badge
    const badge = document.getElementById('serverStatus');
    badge.textContent = stats.status === 'Online' ? '● Online' : '● Offline';
    badge.classList.remove('offline');
    if (stats.status !== 'Online') badge.classList.add('offline');

    // Load activity logs
    loadActivityLogs();
  } catch (error) {
    console.error('Error refreshing data:', error);
  }
}

// Load activity logs
async function loadActivityLogs() {
  try {
    const response = await fetch('/api/server/logs');
    const logs = await response.json();

    const container = document.getElementById('recentActivity');
    container.innerHTML = logs.slice(0, 5).map(log => `
      <div class="activity-item">
        <strong>${log.action}</strong>
        <small>${new Date(log.timestamp).toLocaleTimeString()} - ${log.user}</small>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading activity:', error);
  }
}

// Load players
async function loadPlayers() {
  try {
    const response = await fetch('/api/server/players');
    allPlayers = await response.json();
    displayPlayers(allPlayers);
  } catch (error) {
    console.error('Error loading players:', error);
  }
}

// Display players in table
function displayPlayers(players) {
  const tbody = document.getElementById('playersTableBody');
  
  if (players.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="loading">No players online</td></tr>';
    return;
  }

  tbody.innerHTML = players.map(player => `
    <tr>
      <td>${player.username}</td>
      <td><span style="background: #e2e8f0; padding: 4px 8px; border-radius: 4px;">${player.rank}</span></td>
      <td>${new Date(player.joinTime).toLocaleTimeString()}</td>
      <td>
        <div class="action-buttons">
          <button class="action-btn" onclick="warnPlayer('${player.id}')">Warn</button>
          <button class="action-btn danger" onclick="kickPlayer('${player.id}')">Kick</button>
        </div>
      </td>
    </tr>
  `).join('');
}

// Filter players list
function filterPlayersList() {
  const searchTerm = document.getElementById('playerSearch').value.toLowerCase();
  const filtered = allPlayers.filter(p => p.username.toLowerCase().includes(searchTerm));
  displayPlayers(filtered);
}

// Load logs
async function loadLogs() {
  try {
    const response = await fetch('/api/server/logs');
    allLogs = await response.json();
    displayLogs(allLogs);
  } catch (error) {
    console.error('Error loading logs:', error);
  }
}

// Display logs
function displayLogs(logs) {
  const container = document.getElementById('logsList');
  
  if (logs.length === 0) {
    container.innerHTML = '<p class="loading">No logs available</p>';
    return;
  }

  container.innerHTML = logs.map(log => `
    <div class="log-item">
      <div class="log-time">${new Date(log.timestamp).toLocaleString()}</div>
      <div class="log-action">${log.action}</div>
      <div class="log-details">${log.user} - ${log.details}</div>
    </div>
  `).join('');
}

// Filter logs
function filterLogsList() {
  const searchTerm = document.getElementById('logSearch').value.toLowerCase();
  const filterType = document.getElementById('logFilter').value;

  let filtered = allLogs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchTerm) ||
                         log.user.toLowerCase().includes(searchTerm) ||
                         log.details.toLowerCase().includes(searchTerm);

    if (filterType === 'all') return matchesSearch;
    
    const actionMap = {
      'join': 'joined',
      'leave': 'left',
      'command': 'executed',
      'restart': 'restarted'
    };

    return matchesSearch && log.action.toLowerCase().includes(actionMap[filterType] || '');
  });

  displayLogs(filtered);
}

// Execute command
async function executeCommand() {
  const command = document.getElementById('commandSelect').value;
  const params = document.getElementById('commandParams').value;

  if (!command) {
    showCommandResponse('Please select a command', 'error');
    return;
  }

  try {
    const response = await fetch('/api/server/command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: `${command} ${params}` })
    });

    const result = await response.json();
    
    if (result.success) {
      showCommandResponse(`Command executed: ${result.response}`, 'success');
      document.getElementById('commandParams').value = '';
    } else {
      showCommandResponse(`Error: ${result.error}`, 'error');
    }
  } catch (error) {
    showCommandResponse(`Error: ${error.message}`, 'error');
  }
}

// Show command response
function showCommandResponse(message, type) {
  const responseDiv = document.getElementById('commandResponse');
  responseDiv.textContent = message;
  responseDiv.className = `command-response ${type}`;
}

// Set command
function setCommand(cmd) {
  document.getElementById('commandSelect').value = cmd;
  document.getElementById('commandParams').focus();
}

// Player actions
async function warnPlayer(playerId) {
  const reason = prompt('Warn reason:');
  if (!reason) return;

  try {
    await fetch('/api/server/warn', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, reason })
    });

    alert('Player warned successfully');
    loadPlayers();
  } catch (error) {
    alert('Error warning player: ' + error.message);
  }
}

async function kickPlayer(playerId) {
  if (!confirm('Are you sure you want to kick this player?')) return;

  const reason = prompt('Kick reason:');
  if (!reason) return;

  try {
    await fetch('/api/server/kick', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, reason })
    });

    alert('Player kicked successfully');
    loadPlayers();
  } catch (error) {
    alert('Error kicking player: ' + error.message);
  }
}

// Filter players by rank
function filterPlayers(rank) {
  const buttons = document.querySelectorAll('.filter-btn');
  buttons.forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');

  let filtered = allPlayers;

  if (rank !== 'all') {
    filtered = allPlayers.filter(p => p.rank.toLowerCase().includes(rank));
  }

  displayPlayers(filtered);
}

// Save settings
async function saveSettings() {
  const settings = {
    serverName: document.getElementById('serverName').value,
    maxPlayers: parseInt(document.getElementById('maxPlayersInput').value),
    pvpEnabled: document.getElementById('pvpToggle').checked,
    whitelist: document.getElementById('whitelistToggle').checked
  };

  try {
    const response = await fetch('/api/server/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });

    const result = await response.json();
    
    if (result.success) {
      alert('Settings saved successfully');
    } else {
      alert('Error saving settings: ' + result.error);
    }
  } catch (error) {
    alert('Error: ' + error.message);
  }
}

// Save restart settings
async function saveRestartSettings() {
  const settings = {
    autoRestart: document.getElementById('autoRestartToggle').checked,
    autoRestartInterval: parseInt(document.getElementById('restartInterval').value)
  };

  try {
    const response = await fetch('/api/server/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });

    const result = await response.json();
    
    if (result.success) {
      alert('Restart settings updated successfully');
    } else {
      alert('Error updating settings: ' + result.error);
    }
  } catch (error) {
    alert('Error: ' + error.message);
  }
}
