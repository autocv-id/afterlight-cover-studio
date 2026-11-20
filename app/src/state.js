// The cover's state: everything the renderer needs, plus the editor's
// undo/redo history. Panels are aligned with the current layout's slots; a
// stat slot still holds a panel entry (its photo is never drawn, but the
// hero panel's tag names the stat card). Snapshots are plain JSON, so undo
// is a matter of restoring the last one.
import { SAMPLES } from './photos.js';
import { layoutSlots } from './layouts.js';
import { SIZES } from './render.js';

export const CAPTIONS = {
  velvet: {
    title: 'VELVET STATIC',
    script: 'one last golden hour',
    tagline: 'SEVEN FACES · ONE COAST · LAST LIGHT',
    ticket: 'FIRST PRESSING',
    quote: 'SALT, STATIC AND GASOLINE',
    quoteSource: 'THE DUSK LEDGER',
  },
  bloom: {
    title: 'STATIC BLOOM',
    script: 'after midnight',
    tagline: 'ONE NIGHT · FIVE LIVES · LAST TRAIN HOME',
    ticket: 'NIGHT SHIFT',
    quote: 'THE CITY DOESN’T SLEEP. NEITHER DO WE.',
    quoteSource: 'THE STATIC PRESS',
  },
  solo: {
    title: 'SOLO STATIC',
    script: 'one photo, five frames',
    tagline: 'ONE SHOT · FIVE LIVES',
    ticket: 'ROOM 12',
    quote: 'FIVE FRAMES, ONE SUSPECT',
    quoteSource: 'THE DUSK LEDGER',
  },
};

export function defaultState() {
  return {
    size: 'wide',
    layout: 'hero-mosaic',
    grade: 'golden-static',
    panels: [],
    caption: { ...CAPTIONS.velvet },
    furniture: { quote: true, heat: true, seal: true, tags: true, billing: true, statCard: true },
    popOut: true,
    look: { paint: 0.45, grade: 0.7, halftone: 0.35, grain: 0.3, glow: 0.5 },
    selectedPanel: 0,
  };
}

/** A panel entry from a sample: its photo, its cast tag, its stamp, and a
 *  fresh crop (face-aware, unzoomed). */
export function panelFromSample(sample, overrides = {}) {
  return {
    photoId: sample.id,
    focal: { ...sample.focal },
    tag: sample.role,
    stamp: sample.stamp,
    zoom: 1,
    panX: 0,
    panY: 0,
    flip: false,
    ...overrides,
  };
}

/** Fills `state.panels` to the current layout's slot count, taking photos in
 *  order from `sampleIds` (cycling when the layout has more slots than the
 *  list has photos). Stat slots get a photo-less entry. */
export function assignPanels(state, sampleIds) {
  const size = SIZES[state.size] ?? SIZES.wide;
  const art = { x: 0, y: 0, w: size.w, h: size.h };
  const slots = layoutSlots(state.layout, size.aspect, art, 8);
  const byId = new Map(SAMPLES.map((s) => [s.id, s]));
  const previousByPhoto = new Map(
    (state.panels || []).filter((p) => p.photoId).map((p) => [p.photoId, p]),
  );
  let n = 0;
  state.panels = slots.map((slot) => {
    if (slot.stat) return { photoId: null, tag: '', stamp: '', zoom: 1, panX: 0, panY: 0, flip: false };
    const id = sampleIds[n % sampleIds.length];
    n += 1;
    // Keep a previous crop when the same photo stays in the cover.
    const kept = previousByPhoto.get(id);
    if (kept) return { ...kept };
    const sample = byId.get(id) ?? SAMPLES[0];
    return panelFromSample(sample);
  });
  if (state.selectedPanel >= state.panels.length) state.selectedPanel = 0;
}

/** A tiny snapshot history for undo/redo. */
export function createHistory(limit = 50) {
  const past = [];
  const future = [];
  return {
    push(state) {
      past.push(JSON.stringify(state));
      if (past.length > limit) past.shift();
      future.length = 0;
    },
    undo(state) {
      if (!past.length) return null;
      future.push(JSON.stringify(state));
      return JSON.parse(past.pop());
    },
    redo(state) {
      if (!future.length) return null;
      past.push(JSON.stringify(state));
      return JSON.parse(future.pop());
    },
    get canUndo() {
      return past.length > 0;
    },
    get canRedo() {
      return future.length > 0;
    },
  };
}
