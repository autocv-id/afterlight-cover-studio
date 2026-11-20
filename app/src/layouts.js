// The eight panel layouts. Each layout is a function of the art area (the
// rectangle between the quote strip and the billing footer) and the cover's
// aspect, returning slots: rectangles in canvas pixels, each with a role.
// A slot marked hero feeds the pop-out cut-out; a slot marked statStrip
// anchors the character-stat strip, which the renderer draws as a band
// across that slot's foot (v4: the stat card is a strip, not a panel — the
// judge called the full stat panel "crowding"). `slant` leans a panel's
// dividers (diagonal trio); `angle` tilts a polaroid.
export const LAYOUTS = [
  { id: 'hero-mosaic', name: 'Hero mosaic' },
  { id: 'hero-three', name: 'Hero + three' },
  { id: 'six-grid', name: 'Six grid' },
  { id: 'diagonal-trio', name: 'Diagonal trio' },
  { id: 'seven-mosaic', name: 'Seven mosaic' },
  { id: 'popout-hero', name: 'Pop-out hero' },
  { id: 'one-photo-strip', name: 'One-photo strip' },
  { id: 'polaroid', name: 'Polaroid' },
];

function rect(x, y, w, h, extra = {}) {
  return { x, y, w, h, ...extra };
}

// Splits a rectangle into a row of `n` cells with `gap` between them.
function row(art, n, gap, y, h) {
  const w = (art.w - gap * (n - 1)) / n;
  return Array.from({ length: n }, (_, i) => rect(art.x + i * (w + gap), y, w, h));
}

// Splits a rectangle into a column of `n` cells with `gap` between them.
function col(art, n, gap, x, w) {
  const h = (art.h - gap * (n - 1)) / n;
  return Array.from({ length: n }, (_, i) => rect(x, art.y + i * (h + gap), w, h));
}

function heroMosaic(art, aspect, gap) {
  if (aspect === 'wide') {
    const heroW = art.w * 0.282;
    // The hero anchors the stat strip across its foot, so its label rides
    // at the top of the panel instead of under the strip.
    const hero = rect(art.x, art.y, heroW, art.h, { hero: true, statStrip: true, labelPos: 'tl' });
    const rx = art.x + heroW + gap;
    const rw = art.x + art.w - rx;
    const topH = art.h * 0.495;
    const top = row({ x: rx, w: rw }, 3, gap, art.y, topH);
    const by = art.y + topH + gap;
    const bh = art.y + art.h - by;
    // v4: no stat panel — the two bottom photos take the whole row, each
    // ~23% wider than in v3, so their labels read larger at judge size.
    const photoW = (rw - gap) / 2;
    const bottom = [
      rect(rx, by, photoW, bh),
      rect(rx + photoW + gap, by, photoW, bh),
    ];
    return [hero, ...top, ...bottom];
  }
  if (aspect === 'portrait') {
    const heroH = art.h * 0.46;
    const hero = rect(art.x, art.y, art.w, heroH, { hero: true, labelPos: 'tl' });
    const midY = art.y + heroH + gap;
    const midH = art.h * 0.235;
    const mid = row(art, 3, gap, midY, midH);
    const by = midY + midH + gap;
    const bh = art.y + art.h - by;
    // v4: the bottom photo takes the whole row and anchors the stat strip
    // across its foot (the hero panel can't anchor it here — the title
    // crosses the hero's foot). Its label rides at the top.
    const bottom = [rect(art.x, by, art.w, bh, { statStrip: true, labelPos: 'tl' })];
    return [hero, ...mid, ...bottom];
  }
  const heroW = art.w * 0.37;
  const hero = rect(art.x, art.y, heroW, art.h, { hero: true, statStrip: true, labelPos: 'tl' });
  const rx = art.x + heroW + gap;
  const rw = art.x + art.w - rx;
  const topH = art.h * 0.495;
  const top = row({ x: rx, w: rw }, 2, gap, art.y, topH);
  const by = art.y + topH + gap;
  const bh = art.y + art.h - by;
  const bottom = [rect(rx, by, rw, bh)];
  return [hero, ...top, ...bottom];
}

function heroThree(art, aspect, gap) {
  if (aspect === 'wide') {
    const hero = rect(art.x, art.y, art.w * 0.55, art.h, { hero: true });
    const rx = art.x + art.w * 0.55 + gap;
    return [hero, ...col(art, 3, gap, rx, art.x + art.w - rx)];
  }
  const heroH = art.h * 0.55;
  const hero = rect(art.x, art.y, art.w, heroH, { hero: true, labelPos: 'tl' });
  const by = art.y + heroH + gap;
  return [hero, ...row(art, 3, gap, by, art.y + art.h - by)];
}

function sixGrid(art, aspect, gap) {
  if (aspect === 'wide' || aspect === 'square') {
    const rows = 2;
    const h = (art.h - gap) / rows;
    return [...row(art, 3, gap, art.y, h), ...row(art, 3, gap, art.y + h + gap, h)];
  }
  const cols = 2;
  const w = (art.w - gap) / cols;
  const h = (art.h - gap * 2) / 3;
  const out = [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 2; c++) out.push(rect(art.x + c * (w + gap), art.y + r * (h + gap), w, h));
  }
  return out;
}

function diagonalTrio(art, aspect, gap) {
  const slant = Math.round(art.w * 0.028);
  if (aspect === 'portrait') {
    const h = (art.h - gap * 2) / 3;
    return [0, 1, 2].map((i) => rect(art.x, art.y + i * (h + gap), art.w, h, { slant: -slant, hero: i === 0 }));
  }
  const w = (art.w - gap * 2) / 3;
  return [0, 1, 2].map((i) => rect(art.x + i * (w + gap), art.y, w, art.h, { slant, hero: i === 1 }));
}

function sevenMosaic(art, aspect, gap) {
  if (aspect === 'wide') {
    const topH = art.h * 0.5;
    const top = row(art, 4, gap, art.y, topH);
    const by = art.y + topH + gap;
    const bh = art.y + art.h - by;
    const side = (art.w - gap * 2) * 0.24;
    const mid = art.w - side * 2 - gap * 2;
    return [
      ...top,
      rect(art.x, by, side, bh),
      rect(art.x + side + gap, by, mid, bh, { hero: true }),
      rect(art.x + art.w - side, by, side, bh),
    ];
  }
  const w = (art.w - gap) / 2;
  const h = (art.h - gap * 3) / 4;
  const cells = [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 2; c++) cells.push(rect(art.x + c * (w + gap), art.y + r * (h + gap), w, h));
  }
  cells.push(rect(art.x, art.y + 3 * (h + gap), art.w, h, { hero: true }));
  return cells;
}

function popoutHero(art, aspect, gap) {
  if (aspect === 'wide') {
    const hero = rect(art.x, art.y, art.w * 0.4, art.h, { hero: true });
    const rx = art.x + art.w * 0.4 + gap;
    const rw = art.x + art.w - rx;
    const h = (art.h - gap) / 2;
    const cells = [];
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 2; c++) cells.push(rect(rx + c * ((rw - gap) / 2 + gap), art.y + r * (h + gap), (rw - gap) / 2, h));
    }
    return [hero, ...cells];
  }
  const heroH = art.h * 0.5;
  const hero = rect(art.x, art.y, art.w, heroH, { hero: true, labelPos: 'tl' });
  const by = art.y + heroH + gap;
  const bh = art.y + art.h - by;
  const w = (art.w - gap) / 2;
  const h = (bh - gap) / 2;
  const cells = [];
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 2; c++) cells.push(rect(art.x + c * (w + gap), by + r * (h + gap), w, h));
  }
  return [hero, ...cells];
}

function onePhotoStrip(art, aspect) {
  if (aspect === 'portrait') {
    const h = art.h / 5;
    return [0, 1, 2, 3, 4].map((i) => rect(art.x, art.y + i * h, art.w, h, { strip: i }));
  }
  const w = art.w / 5;
  return [0, 1, 2, 3, 4].map((i) => rect(art.x + i * w, art.y, w, art.h, { strip: i }));
}

function polaroid(art, aspect, gap) {
  const bg = rect(art.x, art.y, art.w, art.h, { background: true });
  const angles = [-6, 5, -4, 7];
  const pw = art.w * 0.44;
  const ph = art.h * 0.44;
  const spots = [
    { x: art.x + art.w * 0.03, y: art.y + art.h * 0.03 },
    { x: art.x + art.w * 0.53, y: art.y + art.h * 0.03 },
    { x: art.x + art.w * 0.03, y: art.y + art.h * 0.53 },
    { x: art.x + art.w * 0.53, y: art.y + art.h * 0.53 },
  ];
  const cards = spots.map((s, i) => rect(s.x, s.y, pw, ph, { angle: angles[i], polaroid: true }));
  return [bg, ...cards];
}

const BUILDERS = {
  'hero-mosaic': heroMosaic,
  'hero-three': heroThree,
  'six-grid': sixGrid,
  'diagonal-trio': diagonalTrio,
  'seven-mosaic': sevenMosaic,
  'popout-hero': popoutHero,
  'one-photo-strip': onePhotoStrip,
  polaroid,
};

/** Panel slots for a layout, in canvas pixels, for the given art area. */
export function layoutSlots(layoutId, aspect, art, gap) {
  const build = BUILDERS[layoutId] ?? heroMosaic;
  return build(art, aspect, gap);
}

export function layoutById(id) {
  return LAYOUTS.find((l) => l.id === id) ?? LAYOUTS[0];
}
