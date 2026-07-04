"use strict";

const header = document.getElementById("siteHeader");
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");
const soundToggle = document.getElementById("soundToggle");
const arenaGate = document.getElementById("arenaGate");
const enterArena = document.getElementById("enterArena");
const skipArena = document.getElementById("skipArena");
const arenaMusic = document.getElementById("arenaMusic");
const sectionLinks = Array.from(document.querySelectorAll(".nav-links a"));
const sections = sectionLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

if (arenaGate) {
  document.body.classList.add("sound-ready");
}

function setHeaderState() {
  if (!header) return;
  header.classList.toggle("scrolled", window.scrollY > 16);
}

function closeMenu() {
  if (!navLinks || !navToggle || !header) return;
  navLinks.classList.remove("open");
  document.body.classList.remove("menu-open");
  header.classList.remove("menu-active");
  navToggle.setAttribute("aria-expanded", "false");
  navToggle.setAttribute("aria-label", "Open menu");
}

function closeArena() {
  arenaGate?.classList.add("hidden");
  document.body.classList.add("arena-entered");
}

const AudioArena = (() => {
  const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
  let context;
  let master;
  let ambientGain;
  let ambientStarted = false;
  let soundOn = false;

  function supported() {
    return Boolean(AudioContextCtor);
  }

  function ensureContext() {
    if (!supported()) return null;
    if (!context) {
      context = new AudioContextCtor();
      master = context.createGain();
      master.gain.value = 0;
      master.connect(context.destination);
    }
    return context;
  }

  async function unlock() {
    const ctx = ensureContext();
    if (!ctx) return null;
    if (ctx.state === "suspended") {
      await ctx.resume();
    }
    return ctx;
  }

  function rampGain(gainNode, value, duration = 0.25) {
    if (!context || !gainNode) return;
    const now = context.currentTime;
    gainNode.gain.cancelScheduledValues(now);
    gainNode.gain.setTargetAtTime(value, now, duration / 4);
  }

  function startAmbient() {
    if (!context || !master || ambientStarted) return;
    ambientStarted = true;

    ambientGain = context.createGain();
    ambientGain.gain.value = 0.032;

    const filter = context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 780;
    filter.Q.value = 0.45;

    ambientGain.connect(filter);
    filter.connect(master);

    const chord = [196, 246.94, 329.63, 392];
    chord.forEach((frequency, index) => {
      const osc = context.createOscillator();
      const voiceGain = context.createGain();
      const panner = context.createStereoPanner ? context.createStereoPanner() : null;

      osc.type = index % 2 === 0 ? "sine" : "triangle";
      osc.frequency.value = frequency;
      osc.detune.value = (index - 1.5) * 3;
      voiceGain.gain.value = 0.12 / chord.length;

      osc.connect(voiceGain);
      if (panner) {
        panner.pan.value = (index - 1.5) * 0.24;
        voiceGain.connect(panner);
        panner.connect(ambientGain);
      } else {
        voiceGain.connect(ambientGain);
      }
      osc.start();
    });

    const windBuffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
    const channel = windBuffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < channel.length; i += 1) {
      last = (last + (Math.random() * 2 - 1) * 0.02) * 0.985;
      channel[i] = last;
    }

    const wind = context.createBufferSource();
    const windGain = context.createGain();
    const windFilter = context.createBiquadFilter();
    wind.buffer = windBuffer;
    wind.loop = true;
    windGain.gain.value = 0.018;
    windFilter.type = "lowpass";
    windFilter.frequency.value = 520;
    wind.connect(windFilter);
    windFilter.connect(windGain);
    windGain.connect(master);
    wind.start();
  }

  function setToggleState(on) {
    if (!soundToggle) return;
    soundToggle.setAttribute("aria-pressed", String(on));
    soundToggle.title = on ? "Sound on" : "Sound off";
  }

  async function setSound(on) {
    const ctx = await unlock();
    if (!ctx || !master) {
      soundOn = false;
      setToggleState(false);
      return false;
    }

    const musicReady = await setMusic(on);
    if (on && !musicReady) {
      soundOn = false;
      rampGain(master, 0, 0.18);
      setToggleState(false);
      document.body.classList.remove("sound-on");
      return false;
    }

    soundOn = on;
    rampGain(master, on ? 0.54 : 0, 0.28);
    setToggleState(on);
    document.body.classList.toggle("sound-on", on);
    return true;
  }


  function fadeMusic(targetVolume, pauseWhenSilent = false) {
    if (!arenaMusic) return;
    window.clearInterval(musicFadeTimer);
    const startVolume = arenaMusic.volume || 0;
    const steps = 24;
    let step = 0;
    musicFadeTimer = window.setInterval(() => {
      step += 1;
      const progress = Math.min(step / steps, 1);
      arenaMusic.volume = startVolume + (targetVolume - startVolume) * progress;
      if (progress >= 1) {
        window.clearInterval(musicFadeTimer);
        if (pauseWhenSilent) arenaMusic.pause();
      }
    }, 24);
  }

  async function setMusic(on) {
    if (!arenaMusic) return true;
    arenaMusic.loop = true;
    if (on) {
      arenaMusic.volume = Math.min(arenaMusic.volume || 0, 0.08);
      try {
        const playAttempt = arenaMusic.play();
        if (playAttempt && typeof playAttempt.catch === "function") {
          playAttempt.catch(() => {
            soundOn = false;
            fadeMusic(0, true);
            setToggleState(false);
            document.body.classList.remove("sound-on");
          });
        }
        fadeMusic(0.42);
        return true;
      } catch {
        return false;
      }
    }

    fadeMusic(0, true);
    return true;
  }
  function playClick() {
    if (!soundOn || !context || !master) return;
    const now = context.currentTime;
    const osc = context.createOscillator();
    const gain = context.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(760, now + 0.035);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.08, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.13);

    osc.connect(gain);
    gain.connect(master);
    osc.start(now);
    osc.stop(now + 0.14);
  }

  function playEntry() {
    if (!soundOn || !context || !master) return;
    const now = context.currentTime;
    [659.25, 783.99, 987.77].forEach((frequency, index) => {
      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.type = "sine";
      osc.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, now + index * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.07, now + index * 0.07 + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.05 + index * 0.06);
      osc.connect(gain);
      gain.connect(master);
      osc.start(now + index * 0.07);
      osc.stop(now + 1.2 + index * 0.06);
    });
  }

  return {
    isOn: () => soundOn,
    setSound,
    playClick,
    playEntry
  };
})();

navToggle?.addEventListener("click", () => {
  if (!navLinks || !header) return;
  const isOpen = navLinks.classList.toggle("open");
  document.body.classList.toggle("menu-open", isOpen);
  header.classList.toggle("menu-active", isOpen);
  navToggle.setAttribute("aria-expanded", String(isOpen));
  navToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
});

sectionLinks.forEach((link) => {
  link.addEventListener("click", () => closeMenu());
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMenu();
  }
});

document.addEventListener(
  "pointerdown",
  (event) => {
    if (event.target.closest("a, button, [role='button']")) {
      AudioArena.playClick();
    }
  },
  true
);

enterArena?.addEventListener("click", async () => {
  await AudioArena.setSound(true);
  closeArena();
  if (arenaMusic) {
    arenaMusic.volume = 0.42;
    if (arenaMusic.paused) {
      arenaMusic.play().catch(() => {
        if (!arenaMusic || !arenaMusic.paused) return;
        soundToggle?.setAttribute("aria-pressed", "false");
        document.body.classList.remove("sound-on");
      });
    }
  }
  soundToggle?.setAttribute("aria-pressed", "true");
  document.body.classList.add("sound-on");
  AudioArena.playEntry();
});

skipArena?.addEventListener("click", () => {
  closeArena();
});

soundToggle?.addEventListener("click", async () => {
  const nextState = !AudioArena.isOn();
  const started = await AudioArena.setSound(nextState);
  if (started && nextState) {
    AudioArena.playEntry();
  }
});

const activeObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      sectionLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
      });
    });
  },
  { rootMargin: "-42% 0px -52% 0px", threshold: 0 }
);

sections.forEach((section) => activeObserver.observe(section));

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.16 }
);

document.querySelectorAll(".reveal").forEach((element, index) => {
  element.style.transitionDelay = `${Math.min(index % 6, 4) * 45}ms`;
  revealObserver.observe(element);
});

document.querySelectorAll("video").forEach((video) => {
  video.addEventListener("error", () => {
    video.style.display = "none";
  });
});

window.addEventListener("scroll", setHeaderState, { passive: true });
setHeaderState();
function initSakuraPetals() {
  const container = document.getElementById("sakuraContainer");
  if (!container || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const petals = ["🌸", "✦", "✧", "❀"];
  const createPetal = () => {
    const petal = document.createElement("span");
    petal.className = "sakura-petal";
    petal.textContent = petals[Math.floor(Math.random() * petals.length)];
    petal.style.left = `${Math.random() * 100}%`;
    petal.style.fontSize = `${Math.random() * 12 + 12}px`;
    petal.style.animationDuration = `${Math.random() * 7 + 7}s`;
    petal.style.setProperty("--drift", `${Math.random() * 120 - 60}px`);
    container.appendChild(petal);
    window.setTimeout(() => petal.remove(), 15000);
  };

  for (let index = 0; index < 12; index += 1) {
    window.setTimeout(createPetal, index * 240);
  }

  window.setInterval(createPetal, 850);
}

function initCursorGlow() {
  const glow = document.getElementById("cursorGlow");
  if (!glow || window.matchMedia("(pointer: coarse)").matches) return;

  document.addEventListener("pointermove", (event) => {
    glow.classList.add("is-active");
    glow.style.left = `${event.clientX}px`;
    glow.style.top = `${event.clientY}px`;
  });

  document.addEventListener("pointerover", (event) => {
    if (event.target.closest("a, button, .project-card, .skill-card, .contact-links a")) {
      glow.classList.add("is-strong");
    }
  });

  document.addEventListener("pointerout", (event) => {
    if (event.target.closest("a, button, .project-card, .skill-card, .contact-links a")) {
      glow.classList.remove("is-strong");
    }
  });
}

initSakuraPetals();
initCursorGlow();