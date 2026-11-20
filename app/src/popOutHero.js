// The pop-out hero: the hero photo re-drawn as a cut-out layer that breaks
// out of its panel and overlaps the title zone. A true background removal is
// out of reach offline, so the cut-out is an arch-shaped window on the hero
// photo — head and shoulders, cropped tight on the face — with a thick gold
// edge and a soft drop shadow, which reads as a sticker bursting off the
// poster. The arch's curve follows the hero's shoulders.
import { coverCrop } from './faceAwareCrop.js';

/** Draws the pop-out cut-out of `img` inside `box` (the arch's bounding box).
 *  `focal` is the photo's face point; the arch crops tighter than the panel. */
export function drawPopOutHero(ctx, img, box, focal, u) {
  const { x, y, w, h } = box;
  ctx.save();
  // Drop shadow for the whole cut-out.
  ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
  ctx.shadowBlur = u * 1.1;
  ctx.shadowOffsetX = u * 0.35;
  ctx.shadowOffsetY = u * 0.5;
  archPath(ctx, x, y, w, h);
  ctx.fillStyle = '#1c0f22';
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  // The photo, cropped tight on the face, clipped to the arch.
  archPath(ctx, x, y, w, h);
  ctx.clip();
  const zoomed = { x, y: y - h * 0.12, w, h: h * 1.12 };
  const crop = coverCrop(img, zoomed, focal, 1.5);
  ctx.drawImage(img, crop.sx, crop.sy, crop.sw, crop.sh, zoomed.x, zoomed.y, zoomed.w, zoomed.h);
  ctx.restore();
  // Gold edge around the arch.
  ctx.save();
  archPath(ctx, x, y, w, h);
  ctx.strokeStyle = '#ffc93c';
  ctx.lineWidth = Math.max(3, u * 0.28);
  ctx.stroke();
  ctx.restore();
}

// An arch: straight sides, a semicircular top, a flat bottom.
function archPath(ctx, x, y, w, h) {
  const r = w / 2;
  ctx.beginPath();
  ctx.moveTo(x, y + h);
  ctx.lineTo(x, y + r);
  ctx.arc(x + r, y + r, r, Math.PI, 0);
  ctx.lineTo(x + w, y + h);
  ctx.closePath();
}
