/* ===========================================
   PAPER CUES (Notebook theme)
   Minimal audio hints, synthesized (no files):
   a soft tick each time a page edge (tear line) crosses the middle of the screen.
   M = mute. Browsers stay silent until the first click/key.
   =========================================== */
(() => {
  const VOL = { tick: 0.25 };
  const slides = [...document.querySelectorAll('.slide')];
  const hint = document.querySelector('.hint');
  if (hint) hint.textContent = '← → / dokun gezin · N notlar · F tam ekran · M ses';

  let ac = null, muted = false;
  const unlock = () => { ac ??= new (window.AudioContext || window.webkitAudioContext)(); ac.resume(); };
  ['pointerdown', 'keydown', 'touchend'].forEach(e => addEventListener(e, unlock, { passive: true }));
  addEventListener('keydown', e => { if (e.key === 'm' || e.key === 'M') muted = !muted; });

  // short burst of band-passed noise with a fast decay: freq sets the colour, len the length
  function cue(freq, len, vol) {
    if (!ac || ac.state !== 'running' || muted) return;
    const n = Math.ceil(ac.sampleRate * len), buf = ac.createBuffer(1, n, ac.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 4);
    const src = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
    src.buffer = buf; f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = 1.2; g.gain.value = vol;
    src.connect(f).connect(g).connect(ac.destination); src.start();
  }
  const tick = () => cue(3200, 0.018, VOL.tick);

  const edgesAbove = () => slides.filter(s => s.getBoundingClientRect().top < innerHeight / 2).length;
  let edges = edgesAbove();
  addEventListener('scroll', () => {
    const e = edgesAbove();
    if (e !== edges) { edges = e; tick(); }
  }, { capture: true, passive: true });
  console.assert(edges >= 1, 'paper cues: first page counted');
})();

/* ===========================================
   TAP / CLICK / DRAG NAVIGATION (touch smartboards, mouse)
   Tap or click: right three quarters = next slide, left quarter = previous.
   Mouse click-and-drag scrolls the paper like a phone; a quick flick
   goes to the next/previous page. Links and buttons keep working.
   =========================================== */
(() => {
  const DRAG_PX = 6;                // movement before a press counts as a drag, not a tap
  const pos = () => Math.max(document.documentElement.scrollTop, document.body.scrollTop);
  const setPos = y => [document.documentElement, document.body].forEach(el => el.scrollTo({ top: y, behavior: 'instant' }));
  const skip = t => t.closest('a, button, input, .notes-panel');
  let drag = null, wasDrag = false;
  document.documentElement.style.cursor = 'grab';

  addEventListener('pointerdown', e => {
    if (e.pointerType !== 'mouse' || e.button !== 0 || skip(e.target)) return;
    drag = { y0: e.clientY, top0: pos(), y: e.clientY, t: e.timeStamp, v: 0, moved: false };
  });
  addEventListener('pointermove', e => {
    if (!drag) return;
    if (!drag.moved && Math.abs(e.clientY - drag.y0) > DRAG_PX) {
      drag.moved = true; dispatchEvent(new Event('drag-start'));
      document.documentElement.style.cursor = 'grabbing'; document.body.style.userSelect = 'none';
    }
    if (!drag.moved) return;
    const dt = Math.max(1, e.timeStamp - drag.t);
    drag.v = 0.7 * drag.v + 0.3 * ((drag.y - e.clientY) / dt);   // px/ms, positive = paper moving up (forward)
    drag.y = e.clientY; drag.t = e.timeStamp;
    setPos(drag.top0 - (e.clientY - drag.y0));
  });
  addEventListener('pointerup', () => {
    if (!drag) return;
    wasDrag = drag.moved;
    if (drag.moved) dispatchEvent(new CustomEvent('drag-end', { detail: { v: drag.v } }));
    document.documentElement.style.cursor = 'grab'; document.body.style.userSelect = '';
    drag = null;
  });

  addEventListener('click', e => {
    if (wasDrag) { wasDrag = false; return; }          // the end of a drag is not a tap
    if (e.button !== 0 || skip(e.target) || getSelection().toString()) return;
    dispatchEvent(new Event('slide-tap'));
    const key = e.clientX < innerWidth * 0.25 ? 'ArrowLeft' : 'ArrowRight';
    document.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
  });
})();

/* ===========================================
   SETTLE ON A PAGE
   When scrolling stops between two pages, glide to the page that
   fills most of the screen. Waits while a finger is still down.
   =========================================== */
(() => {
  const slides = [...document.querySelectorAll('.slide')];
  const pos = () => Math.max(document.documentElement.scrollTop, document.body.scrollTop);
  let timer = 0, touching = false;
  addEventListener('touchstart', () => { touching = true; }, { passive: true });
  addEventListener('touchend', () => { touching = false; arm(); }, { passive: true });
  addEventListener('drag-start', () => { touching = true; });
  addEventListener('drag-end', e => {
    touching = false;
    const FLICK = 0.5;              // px/ms
    if (Math.abs(e.detail.v) < FLICK) return arm();
    // the next page edge in the flick direction, from the real position (not the most-visible page, which may already be the next one)
    const tops = slides.map(s => s.getBoundingClientRect().top);
    const i = e.detail.v > 0 ? tops.findIndex(t => t > 2) : tops.findLastIndex(t => t < -2);
    (slides[i] || current()).scrollIntoView({ behavior: 'smooth' });
  });
  function current() {               // the slide that fills most of the screen
    return slides.reduce((a, s) => {
      const r = s.getBoundingClientRect(), seen = Math.min(r.bottom, innerHeight) - Math.max(r.top, 0);
      return seen > a.seen ? { s, seen } : a;
    }, { s: null, seen: -1 }).s;
  }
  function settle() {
    if (touching) return;
    const best = current();
    if (best && Math.abs(best.getBoundingClientRect().top) > 2) best.scrollIntoView({ behavior: 'smooth' });
  }
  function arm() { clearTimeout(timer); timer = setTimeout(settle, 180); }
  addEventListener('scroll', arm, { capture: true, passive: true });
  console.assert(slides.length > 0, 'settle: slides found');
})();
