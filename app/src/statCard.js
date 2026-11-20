// The character-stat card: one panel of the cover styled as a case file on
// dark card — the cover's hero, filed with three GTA-native stats. No other
// top-10 entry uses one; it is the most game-native element on the poster.
import { drawStars } from './posterFurniture.js';

export const HERO_STATS = [
  { label: 'DRIVE', value: 5 },
  { label: 'NERVE', value: 4 },
  { label: 'LUCK', value: 2 },
];

/** Draws the stat card inside `slot`. `u` is the cover's unit size. */
export function drawStatCard(ctx, slot, heroName, stats, u) {
  const { x, y, w, h } = slot;
  ctx.fillStyle = '#17101f';
  ctx.fillRect(x, y, w, h);
  const grad = ctx.createLinearGradient(x, y, x, y + h);
  grad.addColorStop(0, 'rgba(255, 150, 60, 0.14)');
  grad.addColorStop(1, 'rgba(120, 40, 140, 0.16)');
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = 'rgba(255, 201, 60, 0.85)';
  ctx.lineWidth = Math.max(2, u * 0.14);
  ctx.strokeRect(x + ctx.lineWidth / 2, y + ctx.lineWidth / 2, w - ctx.lineWidth, h - ctx.lineWidth);
  const pad = w * 0.09;
  const innerW = w - pad * 2;
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
  // File header.
  ctx.fillStyle = '#e88fb0';
  ctx.font = `${Math.round(w * 0.085)}px "Bebas Neue", sans-serif`;
  ctx.fillText('CASE FILE 07', x + pad, y + h * 0.11);
  ctx.fillStyle = '#ffe9b0';
  ctx.font = `bold ${Math.round(w * 0.115)}px "Bebas Neue", sans-serif`;
  const name = (heroName || 'THE DRIVER').toUpperCase();
  ctx.fillText(name, x + pad, y + h * 0.11 + w * 0.16);
  ctx.strokeStyle = 'rgba(255, 201, 60, 0.5)';
  ctx.lineWidth = Math.max(1, u * 0.07);
  ctx.beginPath();
  ctx.moveTo(x + pad, y + h * 0.11 + w * 0.24);
  ctx.lineTo(x + w - pad, y + h * 0.11 + w * 0.24);
  ctx.stroke();
  // Stat rows: label above a row of five stars.
  const rows = stats.length;
  const top = y + h * 0.11 + w * 0.36;
  const rowH = (h - (top - y) - h * 0.08) / rows;
  const starSize = Math.min(innerW / 6.4, rowH * 0.42);
  stats.forEach((s, i) => {
    const ry = top + i * rowH;
    ctx.fillStyle = '#fff';
    ctx.font = `${Math.round(starSize * 0.95)}px "Bebas Neue", sans-serif`;
    ctx.fillText(s.label, x + pad, ry + starSize * 0.9);
    drawStars(ctx, x + pad, ry + starSize * 1.05, starSize, 5, s.value);
  });
  // File number along the foot.
  ctx.fillStyle = 'rgba(232, 220, 200, 0.6)';
  ctx.font = `${Math.round(w * 0.07)}px "Bebas Neue", sans-serif`;
  ctx.fillText('AFTERLIGHT ARCHIVE', x + pad, y + h - h * 0.045);
}
