// One photo, all panels: fills every photo slot with the same photo, each
// panel showing a different slice of it. The crops step across the photo so
// the cover reads as five frames of one shoot, and the labels name the
// crops, not people — the criterion-2 proof, visible in the artwork itself.
import { SAMPLES } from './photos.js';

export const CROP_TAGS = [
  { tag: 'THE ARRIVAL', stamp: '' },
  { tag: 'POOL SIDE', stamp: '4:44 PM' },
  { tag: 'THE CLOSE-UP', stamp: '' },
  { tag: 'THE WIDE', stamp: '' },
  { tag: 'THE GOODBYE', stamp: '' },
  { tag: 'THE GUEST', stamp: '' },
  { tag: 'THE ALIBI', stamp: '' },
];

/** Assigns `photoId` to every photo slot of `state`, varying the crop. */
export function onePhotoFill(state, photoId) {
  const sample = SAMPLES.find((s) => s.id === photoId) ?? SAMPLES[0];
  const photoSlots = state.panels.filter((p) => p.photoId !== null);
  const count = Math.max(photoSlots.length, 1);
  let i = 0;
  state.panels = state.panels.map((panel) => {
    if (panel.photoId === null) return panel;
    const t = count === 1 ? 0.5 : i / (count - 1);
    const crop = CROP_TAGS[i % CROP_TAGS.length];
    i += 1;
    return {
      ...panel,
      photoId: sample.id,
      focal: { ...sample.focal },
      tag: crop.tag,
      stamp: crop.stamp,
      zoom: 1.35 + (i % 3) * 0.18,
      panX: (t - 0.5) * 0.55,
      panY: (i % 2 === 0 ? -1 : 1) * 0.08,
      flip: false,
    };
  });
}
