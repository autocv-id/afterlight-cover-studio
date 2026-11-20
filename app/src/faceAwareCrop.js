// Face-aware cropping: a cover-fit crop that keeps the photo's focal point
// (usually a face) inside the panel, with a zoom multiplier and a pan offset
// the editor's drag and scroll gestures drive. The crop is computed in source
// pixels so the caller can draw it with a single drawImage call.
export function coverCrop(img, rect, focal, zoom = 1, panX = 0, panY = 0) {
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  const base = Math.max(rect.w / iw, rect.h / ih);
  const scale = base * Math.max(zoom, 0.2);
  let sw = rect.w / scale;
  let sh = rect.h / scale;
  sw = Math.min(sw, iw);
  sh = Math.min(sh, ih);
  const fx = (focal?.x ?? 0.5) * iw;
  const fy = (focal?.y ?? 0.5) * ih;
  // Centre the window on the focal point, then apply the pan (fractions of
  // the window size), clamping so the window never leaves the photo.
  let sx = fx - sw / 2 + panX * sw;
  let sy = fy - sh / 2 + panY * sh;
  sx = Math.max(0, Math.min(iw - sw, sx));
  sy = Math.max(0, Math.min(ih - sh, sy));
  return { sx, sy, sw, sh };
}

/** The crop for one panel of a one-photo strip: the same photo, a different
 *  slice of it. `slot` counts from 0; `count` is the number of panels. */
export function stripCrop(img, slot, count, vertical = true) {
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  if (vertical) {
    const w = iw / count;
    return { sx: w * slot, sy: 0, sw: w, sh: ih };
  }
  const h = ih / count;
  return { sx: 0, sy: h * slot, sw: iw, sh: h };
}
