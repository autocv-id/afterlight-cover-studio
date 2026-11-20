// Fixed scenes for screenshots: `?shot=cover` shows the hero cover alone,
// `?shot=editor` the app mid-edit, `?shot=portrait` the neon portrait cover,
// `?shot=square` the one-photo-five-crops square cover. Each preset is a
// real state of the app — the same state a maker reaches by picking the
// layout, grade and caption in the editor — so every screenshot shows a
// cover the app genuinely produces. window.__shotReady is set once painted.
import { CAPTIONS, assignPanels } from './state.js';
import { onePhotoFill } from './onePhotoFill.js';

export const SHOTS = {
  cover: {
    size: 'wide', layout: 'hero-mosaic', grade: 'golden-static',
    caption: CAPTIONS.velvet, popOut: true,
    photos: ['hero-convertible', 'boss-suit', 'rider-bike', 'crew-rooftop', 'pier', 'motel-neon'],
  },
  editor: {
    // v4: the editor previews the SQUARE cover, not the wide one — a
    // 16:9 preview in the tall centre stage left ~550px of dead space
    // above and below it; the square preview fills 73% of the stage
    // height instead of 41%, and the diagonal-trio square is a third
    // distinct cover in the set (wide hero, portrait, square editor).
    size: 'square', layout: 'diagonal-trio', grade: 'neon-dusk',
    caption: CAPTIONS.bloom, popOut: true,
    photos: ['mechanic-bandana', 'courier-night', 'guest-motel'],
  },
  portrait: {
    size: 'portrait', layout: 'hero-mosaic', grade: 'neon-dusk',
    caption: CAPTIONS.bloom, popOut: true,
    photos: ['mechanic-bandana', 'courier-night', 'guest-motel', 'motel-neon', 'hero-convertible'],
  },
  square: {
    size: 'square', layout: 'one-photo-strip', grade: 'golden-static',
    caption: CAPTIONS.solo, popOut: false,
    photos: ['guest-motel'],
  },
};

/** Applies a shot preset to `state` and returns whether it hides the editor
 *  chrome (cover shots show the cover alone, full frame). */
export function applyShot(shot, state) {
  const preset = SHOTS[shot];
  if (!preset) return false;
  state.size = preset.size;
  state.layout = preset.layout;
  state.grade = preset.grade;
  state.caption = { ...preset.caption };
  state.popOut = preset.popOut;
  state.selectedPanel = 0;
  assignPanels(state, preset.photos);
  if (shot === 'square') onePhotoFill(state, preset.photos[0]);
  // The square title sits low across the middle strip: lift the middle
  // crop's face clear of the lettering (positive panY moves the subject
  // up in the frame), so the title never covers it.
  if (shot === 'square' && state.panels[2]) state.panels[2].panY = 0.15;
  // The editor shot shows a mid-edit zoom on the selected panel.
  if (shot === 'editor' && state.panels[1]) {
    state.panels[1].zoom = 1.4;
    state.selectedPanel = 1;
  }
  // The cover shot zooms the fisherman in: at 1.0× his face sits under the
  // title, at 1.4× the crop centres on it and it clears the lettering.
  if (shot === 'cover' && state.panels[4]) state.panels[4].zoom = 1.4;
  // The title sits on the seam between the rows, so the top-row labels ride
  // at the top of their panels instead of under the lettering.
  if (shot === 'cover') {
    [1, 2, 3].forEach((i) => {
      if (state.panels[i]) state.panels[i].labelTop = true;
    });
  }
  return shot !== 'editor';
}

export function markShotReady() {
  requestAnimationFrame(() => requestAnimationFrame(() => {
    window.__shotReady = true;
  }));
}
