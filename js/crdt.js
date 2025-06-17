// Simple CRDT for player positions with last-write-wins (timestamp)

export function mergeStates(localState, remoteState) {
  const merged = { ...localState };

  for (const [id, remotePlayer] of Object.entries(remoteState)) {
    const localPlayer = merged[id];
    if (
      !localPlayer ||
      (remotePlayer.timestamp && remotePlayer.timestamp > localPlayer.timestamp)
    ) {
      merged[id] = remotePlayer;
    }
  }

  return merged;
}