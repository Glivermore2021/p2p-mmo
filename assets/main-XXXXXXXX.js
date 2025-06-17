// Bundled output: main.js + net.js + game.js + crdt.js + QR support (simulated Vite bundle)

(function () { // === CRDT Module === function mergeStates(localState, remoteState) { const merged = { ...localState }; for (const [id, remotePlayer] of Object.entries(remoteState)) { const localPlayer = merged[id]; if (!localPlayer || remotePlayer.timestamp > localPlayer.timestamp) { merged[id] = remotePlayer; } } return merged; }

// === Game Logic === const canvas = document.createElement('canvas'); const ctx = canvas.getContext('2d'); canvas.width = 400; canvas.height = 400; document.body.appendChild(canvas);

const localId = Math.random().toString(36).slice(2); let localState = { [localId]: { x: 200, y: 200, timestamp: Date.now(), color: 'blue' } }; let peers = [];

function draw(state) { ctx.clearRect(0, 0, canvas.width, canvas.height); for (const player of Object.values(state)) { ctx.fillStyle = player.color || 'gray'; ctx.fillRect(player.x - 5, player.y - 5, 10, 10); } }

function setupGameControls(updateFn) { window.addEventListener('keydown', (e) => { const player = localState[localId]; if (!player) return; switch (e.key) { case 'ArrowUp': player.y -= 5; break; case 'ArrowDown': player.y += 5; break; case 'ArrowLeft': player.x -= 5; break; case 'ArrowRight': player.x += 5; break; default: return; } player.timestamp = Date.now(); updateFn(); }); }

// === Networking === function createPeer(initiator) { return new SimplePeer({ initiator, trickle: false, config: { iceServers: [] } }); }

function handlePeer(peer) { peer.on('signal', data => { const encoded = btoa(JSON.stringify(data)); document.getElementById('signalOut').value = encoded; generateQRCode(encoded); });

peer.on('data', data => {
  const remote = JSON.parse(data);
  localState = mergeStates(localState, remote);
  draw(localState);
});

peer.on('connect', () => {
  console.log('Connected to peer');
  peers.push(peer);
});

return peer;

}

function broadcastState() { const message = JSON.stringify(localState); for (const p of peers) { if (p.connected) p.send(message); } }

function generateQRCode(text) { const qrCanvas = document.getElementById('qrcode'); qrCanvas.innerHTML = ''; new QRCode(qrCanvas, { text: text, width: 128, height: 128 }); }

// === UI === document.body.innerHTML += <section> <button id="hostBtn">Host</button> <button id="joinBtn">Join</button> <textarea id="signalIn" placeholder="Paste signal here..."></textarea> <textarea id="signalOut" readonly></textarea> <div id="qrcode"></div> </section>;

document.getElementById('hostBtn').onclick = () => { const peer = handlePeer(createPeer(true)); window.peer = peer; // for debugging };

document.getElementById('joinBtn').onclick = () => { const peer = handlePeer(createPeer(false)); const signalData = JSON.parse(atob(document.getElementById('signalIn').value.trim())); peer.signal(signalData); window.peer = peer; };

setupGameControls(broadcastState);

setInterval(() => { draw(localState); broadcastState(); }, 100); })();

