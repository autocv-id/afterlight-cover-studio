// Poster furniture: everything that makes the cover read as a poster rather
// than a collage — the five-star press quote, the ticket stub, the gold seal,
// the barcode, the billing footer, the heat pill, the tagline ribbon, and the
// palm-silhouette strip above the billing line. All drawn in code, so every
// cover the app exports carries them; nothing here is an image asset.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A five-pointed star path, centred on (cx, cy) with outer radius r. */
export function starPath(ctx, cx, cy, r) {
  const inner = r * 0.45;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : inner;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const x = cx + Math.cos(a) * rad;
    const y = cy + Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

export function drawStars(ctx, x, y, size, count, filled, fill = '#ffc93c', empty = 'rgba(255,255,255,0.25)') {
  for (let i = 0; i < count; i++) {
    const cx = x + i * size * 1.25 + size / 2;
    starPath(ctx, cx, y + size / 2, size / 2);
    ctx.fillStyle = i < filled ? fill : empty;
    ctx.fill();
  }
}

/** The top strip: five gold stars, the press quote and its paper, and the
 *  ticket stub at the right. `strip` is the strip's rectangle. */
export function drawQuoteStrip(ctx, strip, caption, ticket, u) {
  const { x, y, w, h } = strip;
  ctx.fillStyle = '#160a1e';
  ctx.fillRect(x, y, w, h);
  const pad = h * 0.22;
  const starSize = h * 0.44;
  if (caption.quote) {
    drawStars(ctx, x + pad, y + (h - starSize) / 2, starSize, 5, 5);
  }
  const textX = x + pad + (caption.quote ? starSize * 5 * 1.25 + pad * 0.8 : 0);
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffe9b0';
  ctx.font = `${Math.round(h * 0.34)}px "Bebas Neue", sans-serif`;
  ctx.textAlign = 'left';
  const quote = caption.quote ? `“${caption.quote}”` : '';
  ctx.fillText(quote, textX, y + h / 2);
  const qw = ctx.measureText(quote).width;
  ctx.fillStyle = '#e88fb0';
  ctx.font = `${Math.round(h * 0.26)}px "Bebas Neue", sans-serif`;
  if (caption.quoteSource) {
    ctx.fillText(`— ${caption.quoteSource}`, textX + qw + h * 0.22, y + h / 2 + h * 0.03);
  }
  // Ticket stub: yellow, with notched sides.
  if (ticket) {
    ctx.font = `bold ${Math.round(h * 0.32)}px "Bebas Neue", sans-serif`;
    const tw = ctx.measureText(ticket).width + h * 0.9;
    const th = h * 0.66;
    const tx = x + w - pad - tw;
    const ty = y + (h - th) / 2;
    ctx.fillStyle = '#ffd23c';
    ctx.beginPath();
    ctx.roundRect(tx, ty, tw, th, th * 0.18);
    ctx.fill();
    ctx.fillStyle = '#160a1e';
    ctx.beginPath();
    ctx.arc(tx, ty + th / 2, th * 0.16, 0, Math.PI * 2);
    ctx.arc(tx + tw, ty + th / 2, th * 0.16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#160a1e';
    ctx.textAlign = 'center';
    ctx.fillText(ticket, tx + tw / 2, ty + th / 2 + 1);
    ctx.textAlign = 'left';
  }
  // Thin gold rule under the strip.
  ctx.fillStyle = 'rgba(255, 201, 60, 0.55)';
  ctx.fillRect(x, y + h - Math.max(2, u * 0.12), w, Math.max(2, u * 0.12));
}

/** The heat pill: a black rounded pill with HEAT and five stars. */
export function drawHeatPill(ctx, x, y, w, h, filled) {
  ctx.fillStyle = 'rgba(10, 4, 16, 0.88)';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, h / 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 201, 60, 0.8)';
  ctx.lineWidth = Math.max(1.5, h * 0.05);
  ctx.stroke();
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fff';
  ctx.font = `${Math.round(h * 0.42)}px "Bebas Neue", sans-serif`;
  ctx.textAlign = 'left';
  ctx.fillText('HEAT', x + h * 0.45, y + h / 2 + 1);
  const hw = ctx.measureText('HEAT').width;
  drawStars(ctx, x + h * 0.45 + hw + h * 0.25, y + h * 0.28, h * 0.44, 5, filled);
}

/** The gold starburst seal: "ORIGINAL COVER ART" on a serrated disc. */
export function drawSeal(ctx, cx, cy, r, labelTop = 'ORIGINAL', labelBottom = 'COVER ART') {
  const spikes = 18;
  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const rad = i % 2 === 0 ? r : r * 0.86;
    const a = -Math.PI / 2 + (i * Math.PI) / spikes;
    const px = cx + Math.cos(a) * rad;
    const py = cy + Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  const grad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.1, cx, cy, r);
  grad.addColorStop(0, '#ffe98a');
  grad.addColorStop(0.6, '#f5b81e');
  grad.addColorStop(1, '#c77f0a');
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = 'rgba(90, 50, 0, 0.7)';
  ctx.lineWidth = Math.max(1.5, r * 0.04);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.72, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(90, 50, 0, 0.55)';
  ctx.lineWidth = Math.max(1, r * 0.025);
  ctx.stroke();
  ctx.fillStyle = '#4a2c00';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `bold ${Math.round(r * 0.24)}px "Bebas Neue", sans-serif`;
  ctx.fillText(labelTop, cx, cy - r * 0.16);
  ctx.fillText(labelBottom, cx, cy + r * 0.14);
  drawStars(ctx, cx - r * 0.3, cy + r * 0.3, r * 0.16, 3, 3, '#4a2c00', '#4a2c00');
}

/** A deterministic barcode: the same bars on every render of a cover. */
export function drawBarcode(ctx, x, y, w, h, seed = 20261120) {
  const rnd = mulberry32(seed);
  ctx.fillStyle = '#fff';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#111';
  let bx = x + w * 0.06;
  const end = x + w * 0.94;
  while (bx < end) {
    const bw = (1 + Math.floor(rnd() * 3)) * Math.max(1, w * 0.008);
    if (rnd() > 0.45) ctx.fillRect(bx, y + h * 0.08, bw, h * 0.68);
    bx += bw + Math.max(1, w * 0.008);
  }
  ctx.fillStyle = '#111';
  ctx.font = `${Math.round(h * 0.16)}px "Bebas Neue", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('0 21119 11202 7', x + w / 2, y + h * 0.88);
  ctx.textAlign = 'left';
}

/** One palm silhouette: a curved trunk with five drooping fronds. */
export function drawPalm(ctx, x, y, s, color = 'rgba(0,0,0,0.55)') {
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = Math.max(1.5, s * 0.05);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + s * 0.08, y - s * 0.55, x + s * 0.22, y - s * 0.85);
  ctx.stroke();
  const topX = x + s * 0.22;
  const topY = y - s * 0.85;
  for (let i = 0; i < 5; i++) {
    const a = Math.PI * (0.15 + i * 0.18);
    const ex = topX + Math.cos(a) * s * 0.55;
    const ey = topY - Math.sin(a) * s * 0.3 + s * 0.28;
    ctx.beginPath();
    ctx.moveTo(topX, topY);
    ctx.quadraticCurveTo(topX + (ex - topX) * 0.5, topY - s * 0.22, ex, ey);
    ctx.stroke();
  }
}

/** The billing footer: COMING SOON, the production lines, and the barcode,
 *  with a palm-silhouette strip along its top edge. */
export function drawBillingFooter(ctx, footer, billing, u) {
  const { x, y, w, h } = footer;
  ctx.fillStyle = '#160a1e';
  ctx.fillRect(x, y, w, h);
  // Palm strip.
  const palmH = h * 0.34;
  const palmY = y + palmH;
  ctx.fillStyle = 'rgba(255, 150, 60, 0.16)';
  ctx.fillRect(x, y, w, palmH);
  const step = w / 14;
  for (let i = 0; i < 14; i++) {
    const px = x + step * (i + 0.5) + (i % 2 === 0 ? step * 0.18 : -step * 0.12);
    drawPalm(ctx, px, palmY, palmH * (i % 3 === 0 ? 1.5 : 1.15), 'rgba(20, 6, 26, 0.8)');
  }
  const textY = y + palmH + (h - palmH) * 0.5;
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ff7ab8';
  ctx.font = `${Math.round(h * 0.3)}px "Bebas Neue", sans-serif`;
  ctx.textAlign = 'left';
  ctx.fillText('COMING SOON', x + h * 0.3, textY);
  const lines = billing.split('\n');
  ctx.fillStyle = '#e8dcc8';
  ctx.textAlign = 'center';
  const lh = h * 0.24;
  lines.forEach((line, i) => {
    ctx.font = `${Math.round(h * (i === 0 ? 0.24 : 0.2))}px "Bebas Neue", sans-serif`;
    ctx.fillText(line, x + w / 2, textY + (i - (lines.length - 1) / 2) * lh * 1.25);
  });
  const bw = Math.min(w * 0.075, h * 1.9);
  const bh = h * 0.62;
  drawBarcode(ctx, x + w - h * 0.3 - bw, textY - bh / 2, bw, bh);
  ctx.textAlign = 'left';
}

/** The tagline ribbon: a dark band with gold chevrons at each end. */
export function drawTaglineRibbon(ctx, cx, y, text, u) {
  ctx.font = `${Math.round(u * 1.5)}px "Bebas Neue", sans-serif`;
  const tw = ctx.measureText(text).width;
  const pad = u * 1.6;
  const h = u * 2.3;
  const w = tw + pad * 2 + h;
  const x = cx - w / 2;
  ctx.fillStyle = 'rgba(12, 5, 18, 0.92)';
  ctx.beginPath();
  ctx.moveTo(x + h / 2, y);
  ctx.lineTo(x + w - h / 2, y);
  ctx.lineTo(x + w, y + h / 2);
  ctx.lineTo(x + w - h / 2, y + h);
  ctx.lineTo(x + h / 2, y + h);
  ctx.lineTo(x, y + h / 2);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 201, 60, 0.75)';
  ctx.lineWidth = Math.max(1.5, u * 0.08);
  ctx.stroke();
  ctx.fillStyle = '#ffe9b0';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, cx, y + h / 2 + 1);
  ctx.textAlign = 'left';
}
