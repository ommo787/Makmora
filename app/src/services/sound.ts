import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import { Platform } from 'react-native';

/** Two short sounds, made for Makmoura: a light "ding" when a child taps a task, and a chime for big moments. */
const SOURCES = { tap: require('../../assets/sounds/tap.wav'), celebrate: require('../../assets/sounds/celebrate.wav') };
const players: Partial<Record<keyof typeof SOURCES, AudioPlayer>> = {};
let ready = false;

export function play(name: keyof typeof SOURCES) {
  // browsers refuse sound before the first tap; stay quiet instead of throwing
  if (Platform.OS === 'web' && !(globalThis.navigator as { userActivation?: { hasBeenActive: boolean } } | undefined)?.userActivation?.hasBeenActive) return;
  try {
    if (!ready) {
      ready = true;
      // respect the silent switch and never stop the family's music
      setAudioModeAsync({ playsInSilentMode: false, interruptionMode: 'mixWithOthers' }).catch(() => {});
    }
    const p = (players[name] ??= createAudioPlayer(SOURCES[name]));
    p.seekTo(0);
    p.play();
  } catch {
    // sound is a nicety; never block the tap
  }
}
