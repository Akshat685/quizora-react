/**
 * Lightweight Web Audio beeps — no asset files required.
 * Muted until the user interacts once (browser autoplay policy).
 */

let ctx = null
let unlocked = false

function getCtx() {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return null
    ctx = new AudioCtx()
  }
  return ctx
}

export async function unlockAudio() {
  const audio = getCtx()
  if (!audio) return
  if (audio.state === 'suspended') {
    try {
      await audio.resume()
    } catch {
      /* ignore */
    }
  }
  unlocked = true
}

function tone({ frequency, duration = 0.12, type = 'sine', gain = 0.04, when = 0 }) {
  const audio = getCtx()
  if (!audio || !unlocked) return

  const osc = audio.createOscillator()
  const amp = audio.createGain()
  osc.type = type
  osc.frequency.value = frequency
  amp.gain.value = gain
  osc.connect(amp)
  amp.connect(audio.destination)

  const start = audio.currentTime + when
  amp.gain.setValueAtTime(gain, start)
  amp.gain.exponentialRampToValueAtTime(0.001, start + duration)
  osc.start(start)
  osc.stop(start + duration)
}

export const sounds = {
  select() {
    tone({ frequency: 520, duration: 0.08, type: 'triangle', gain: 0.035 })
  },
  correct() {
    tone({ frequency: 660, duration: 0.1, type: 'sine', gain: 0.04 })
    tone({ frequency: 880, duration: 0.12, type: 'sine', gain: 0.035, when: 0.08 })
  },
  wrong() {
    tone({ frequency: 220, duration: 0.18, type: 'sawtooth', gain: 0.03 })
  },
  tick() {
    tone({ frequency: 880, duration: 0.04, type: 'square', gain: 0.02 })
  },
  complete() {
    ;[523, 659, 784].forEach((f, i) => {
      tone({ frequency: f, duration: 0.14, type: 'sine', gain: 0.04, when: i * 0.1 })
    })
  },
  click() {
    tone({ frequency: 400, duration: 0.05, type: 'triangle', gain: 0.025 })
  },
}
