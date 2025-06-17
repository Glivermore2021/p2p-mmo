// Minimal example: shared player position synced via peer data channel with CRDT-style last-write-wins

let localPlayer = { x: 100, y: 100, id: null, timestamp: 0 };
let players = {};

let peer;
let canvas, ctx;

export function setupGame(gameCanvas, connectedPeer) {
  peer = connectedPeer;
  canvas = gameCanvas;
  ctx = canvas.getContext('2d');

  // Assign a random ID for this player
  localPlayer.id = Math.random().toString(36).substr(2, 9);

  // Add self to players list
  players[localPlayer.id] = { ...localPlayer };

  peer.on('data', data => {
    try {
      const msg = JSON.parse(data);
      if (msg.type === 'state') {
        mergePlayerState(msg.player);
      }
    } catch (e) {
      console.warn('Invalid data received', e);
    }
  });

  // Send local state every 100ms
  setInterval(() => {
    localPlayer.timestamp = Date.now();
    sendState();
    render();
  }, 100);

  // Handle keyboard input
  window.addEventListener('keydown', e => {
    const speed = 5;
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
        localPlayer.y -= speed;
        break;
      case 'ArrowDown':
      case 's':
        localPlayer.y += speed;
        break;
      case 'ArrowLeft':
      case 'a':
        localPlayer.x -= speed;
        break;
      case 'ArrowRight':
      case 'd':
        localPlayer.x += speed;
        break;
    }
  });

  render();
}

function mergePlayerState(newPlayer) {
  const existing = players[newPlayer.id];
  if (!existing || newPlayer.timestamp > existing.timestamp) {
    players[newPlayer.id] = newPlayer;
  }
}

function sendState() {
  if (peer.connected) {
    peer.send(JSON.stringify({ type: 'state', player: localPlayer }));
  }
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const id in players) {
    const p = players[id];
    ctx.fillStyle = p.id === localPlayer.id ? 'red' : 'blue';
    ctx.beginPath();
    ctx.arc(p.x, p.y, 10, 0, 2 * Math.PI);
    ctx.fill();
  }
}