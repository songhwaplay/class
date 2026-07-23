(() => {
  'use strict';

  if (window.MuseumSfx) return;

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  let context = null;
  let master = null;
  let noiseBuffer = null;
  let muted = localStorage.getItem('classSfxMuted') === '1';
  let volume = Number(localStorage.getItem('classSfxVolumeLevel') || 3) / 5;

  function ensureAudio() {
    if (!AudioContextClass) return null;
    if (!context) {
      context = new AudioContextClass({ latencyHint: 'interactive' });
      master = context.createGain();
      master.gain.value = muted ? 0.0001 : volume;
      master.connect(context.destination);
    }
    if (context.state === 'suspended') context.resume().catch(() => {});
    return context;
  }

  function envelope(start, peak, attack, duration) {
    const gain = context.createGain();
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(peak, start + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    gain.connect(master);
    return gain;
  }

  function tone(frequency, endFrequency, duration, gainValue, delay = 0, type = 'sine') {
    const start = context.currentTime + delay;
    const oscillator = context.createOscillator();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    oscillator.frequency.exponentialRampToValueAtTime(endFrequency, start + duration);
    oscillator.connect(envelope(start, gainValue, 0.008, duration));
    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);
  }

  function filteredNoise(duration, gainValue, frequency, delay = 0) {
    if (!noiseBuffer) {
      noiseBuffer = context.createBuffer(1, Math.floor(context.sampleRate * 0.08), context.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
    }
    const start = context.currentTime + delay;
    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    source.buffer = noiseBuffer;
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(frequency, start);
    filter.Q.setValueAtTime(0.7, start);
    source.connect(filter);
    filter.connect(envelope(start, gainValue, 0.004, duration));
    source.start(start, 0, duration);
    source.stop(start + duration + 0.01);
  }

  function play(name = 'tap') {
    if (muted || !ensureAudio()) return false;

    if (name === 'artwork') {
      tone(392, 388, 0.34, 0.045);
      tone(587.33, 580, 0.42, 0.024, 0.018);
      tone(783.99, 775, 0.48, 0.011, 0.032);
    } else if (name === 'room') {
      tone(246.94, 220, 0.095, 0.05);
      tone(369.99, 330, 0.12, 0.018, 0.008);
      filteredNoise(0.028, 0.008, 720);
    } else if (name === 'help') {
      tone(523.25, 518, 0.3, 0.034);
      tone(783.99, 775, 0.38, 0.016, 0.018);
    } else if (name === 'close') {
      tone(246.94, 196, 0.075, 0.028);
      filteredNoise(0.038, 0.009, 620);
    } else {
      tone(277.18, 220, 0.07, 0.032);
      filteredNoise(0.022, 0.006, 760);
    }
    return true;
  }

  function playForElement(target) {
    if (!(target instanceof Element)) return;
    const element = target.closest('[data-museum-sfx]');
    if (!element || element.matches(':disabled, [aria-disabled="true"]')) return;
    const name = element.dataset.museumSfx;
    if (name && name !== 'none') play(name);
  }

  document.addEventListener('pointerdown', event => {
    if (event.isPrimary === false || event.button > 0) return;
    playForElement(event.target);
  }, { capture: true, passive: true });

  document.addEventListener('click', event => {
    if (event.detail === 0) playForElement(event.target);
  }, { capture: true });

  const markAudioControls = root => {
    if (!(root instanceof Element)) return;
    const buttons = root.matches('.unified-music-control button')
      ? [root]
      : [...root.querySelectorAll('.unified-music-control button')];
    buttons.forEach(button => {
      button.dataset.sfx = 'none';
      button.dataset.museumSfx = 'tap';
    });
  };

  new MutationObserver(records => {
    records.forEach(record => record.addedNodes.forEach(markAudioControls));
  }).observe(document.documentElement, { childList: true, subtree: true });

  window.addEventListener('classsfxchange', event => {
    if (!event.detail) return;
    muted = Boolean(event.detail.muted);
    volume = Number.isFinite(event.detail.volume) ? event.detail.volume : volume;
    if (master && context) {
      master.gain.setTargetAtTime(muted ? 0.0001 : volume, context.currentTime, 0.012);
    }
  });

  window.MuseumSfx = { play };
})();
