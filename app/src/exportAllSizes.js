// PNG export: renders the cover at each post size on an offscreen canvas
// and downloads it. Export-all-three renders each size in turn, so the
// maker gets the full set — 1080 × 1080, 1080 × 1350, 1920 × 1080 — in one
// click. Nothing leaves the machine: the PNGs are built locally.
import { renderCover, SIZES } from './render.js';

function download(canvas, filename) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
      resolve(filename);
    }, 'image/png');
  });
}

function slug(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'cover';
}

/** Renders `state` at `sizeId` and downloads the PNG. */
export async function exportSize(state, images, sizeId) {
  const size = SIZES[sizeId] ?? SIZES.wide;
  const canvas = document.createElement('canvas');
  renderCover(canvas, { ...state, size: sizeId }, images);
  return download(canvas, `${slug(state.caption.title)}-${size.w}x${size.h}.png`);
}

/** Renders and downloads all three post sizes, one after another. */
export async function exportAllSizes(state, images) {
  const names = [];
  for (const sizeId of ['square', 'portrait', 'wide']) {
    names.push(await exportSize(state, images, sizeId));
    await new Promise((r) => setTimeout(r, 120));
  }
  return names;
}
