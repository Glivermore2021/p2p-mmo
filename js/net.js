import SimplePeer from '../lib/simple-peer.min.js';

export function setupPeer(isInitiator) {
  const peer = new SimplePeer({
    initiator: isInitiator,
    trickle: false, // disable trickle ICE for simpler signaling
    config: {
      iceServers: [] // no STUN or TURN servers
    }
  });

  peer.on('error', err => {
    console.error('Peer error:', err);
  });

  return peer;
}