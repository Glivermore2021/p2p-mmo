import { setupPeer } from './net.js';
import { setupGame } from './game.js';
import QRCode from './qrcode.min.js';

const hostBtn = document.getElementById('host-btn');
const hostOfferTextarea = document.getElementById('host-offer');
const hostQrCanvas = document.getElementById('host-qr');

const joinOfferTextarea = document.getElementById('join-offer');
const joinBtn = document.getElementById('join-btn');
const joinAnswerTextarea = document.getElementById('join-answer');
const joinQrCanvas = document.getElementById('join-qr');

const gameSection = document.getElementById('game-section');
const gameCanvas = document.getElementById('game-canvas');

let peer;

function generateQRCode(text, canvas) {
  canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  new QRCode(canvas, {
    text,
    width: canvas.width,
    height: canvas.height,
    colorDark: '#000000',
    colorLight: '#ffffff',
    correctLevel: QRCode.CorrectLevel.H,
  });
}

hostBtn.onclick = async () => {
  peer = setupPeer(true);

  peer.on('signal', data => {
    const signalString = JSON.stringify(data);
    hostOfferTextarea.value = signalString;
    generateQRCode(signalString, hostQrCanvas);
  });

  peer.on('connect', () => {
    startGame();
  });
};

joinBtn.onclick = () => {
  const offer = joinOfferTextarea.value.trim();
  if (!offer) {
    alert('Please paste the host offer.');
    return;
  }

  peer = setupPeer(false);

  peer.signal(JSON.parse(offer));

  peer.on('signal', data => {
    const signalString = JSON.stringify(data);
    joinAnswerTextarea.value = signalString;
    generateQRCode(signalString, joinQrCanvas);
  });

  peer.on('connect', () => {
    startGame();
  });
};

function startGame() {
  document.getElementById('host-section').style.display = 'none';
  document.getElementById('join-section').style.display = 'none';
  gameSection.style.display = 'block';
  setupGame(gameCanvas, peer);
}