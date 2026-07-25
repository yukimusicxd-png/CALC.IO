const AudioContextClass = window.AudioContext || window.webkitAudioContext;
let audioContext = null;

const getAudioContext = () => {
  if (!AudioContextClass) return null;
  if (!audioContext) {
    audioContext = new AudioContextClass();
  }
  return audioContext;
};

const getSoundEnabled = () => {
  const stored = window.localStorage.getItem('calcio_sound_enabled');
  if (stored === '0' || stored === 'false') return false;
  if (stored === '1' || stored === 'true') return true;
  return true;
};

const getSoundVolume = () => {
  const stored = window.localStorage.getItem('calcio_sound_volume');
  if (!stored) return 0.75;
  const parsed = Number(stored);
  if (Number.isNaN(parsed)) return 0.75;
  return Math.min(1, Math.max(0, parsed / 100));
};

const createGain = (ctx, volume = 0.75) => {
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(volume, ctx.currentTime + 0.002);
  return gain;
};

const playClickSound = () => {
  if (!getSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }

  const volume = getSoundVolume();
  const gain = createGain(ctx, volume * 0.45);
  const osc = ctx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(880, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(520, ctx.currentTime + 0.025);
  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.03);
};

const playKeypressSound = () => {
  if (!getSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }

  const volume = getSoundVolume();
  const gain = createGain(ctx, volume * 0.55);
  const osc = ctx.createOscillator();
  osc.type = 'square';
  osc.frequency.setValueAtTime(1600, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.016);
  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.02);
};

export { playClickSound, playKeypressSound };
