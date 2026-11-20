// AFTERLIGHT Cover Studio — the editor wiring. Loads the fonts and the
// sample cast, builds the rails from the layout/grade/photo tables, renders
// the live preview, and wires every control: photo pick and swap, crop by
// drag and scroll, caption fields, furniture toggles, look sliders, undo
// and redo, and the three-size PNG export. A `?shot=` query loads a fixed
// scene for a screenshot instead (./shots.js).
import { SAMPLES, loadImage, loadSamples, loadFonts } from './photos.js';
import { LAYOUTS } from './layouts.js';
import { GRADES } from './grades.js';
import { renderCover, SIZES } from './render.js';
import { defaultState, assignPanels, panelFromSample, createHistory, CAPTIONS } from './state.js';
import { onePhotoFill } from './onePhotoFill.js';
import { exportSize, exportAllSizes } from './exportAllSizes.js';
import { applyShot, markShotReady } from './shots.js';

const $ = (id) => document.getElementById(id);
const canvas = $('cover');
const state = defaultState();
const history = createHistory();
const images = new Map();
let geometry = null;
let renderQueued = false;
let userPhotos = [];

function queueRender() {
  if (renderQueued) return;
  renderQueued = true;
  requestAnimationFrame(() => {
    renderQueued = false;
    render();
  });
}

function render() {
  geometry = renderCover(canvas, state, images);
  updatePanelOverlay();
  updatePanelControls();
  updateHistoryButtons();
}

function commit() {
  history.push(state);
  queueRender();
}

// --- Panel-number overlay -------------------------------------------------
const overlay = $('panel-numbers');

function updatePanelOverlay() {
  overlay.innerHTML = '';
  if (!geometry) return;
  const box = canvas.getBoundingClientRect();
  const sx = box.width / canvas.width;
  const sy = box.height / canvas.height;
  geometry.slots.forEach((slot, i) => {
    if (slot.stat || slot.background) return;
    const badge = document.createElement('button');
    badge.type = 'button';
    badge.className = `panel-number${i === state.selectedPanel ? ' selected' : ''}`;
    badge.textContent = String(i + 1);
    badge.style.left = `${slot.x * sx + 6}px`;
    badge.style.top = `${slot.y * sy + 6}px`;
    badge.addEventListener('click', () => {
      state.selectedPanel = i;
      queueRender();
    });
    overlay.appendChild(badge);
  });
}

// --- Left rail: photos, layouts, grades -----------------------------------
const thumbs = $('thumbnails');

function rebuildThumbnails() {
  thumbs.innerHTML = '';
  const all = [...SAMPLES.map((s) => ({ ...s, user: false })), ...userPhotos];
  all.forEach((photo) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'thumb';
    button.title = `${photo.name} — ${photo.role}`;
    const img = document.createElement('img');
    img.src = photo.user ? photo.url : `samples/${photo.file}`;
    img.alt = photo.name;
    const label = document.createElement('span');
    label.textContent = photo.name;
    button.append(img, label);
    button.addEventListener('click', () => {
      const slot = state.panels[state.selectedPanel];
      if (!slot || slot.photoId === null) return;
      history.push(state);
      state.panels[state.selectedPanel] = panelFromSample(photo);
      queueRender();
    });
    thumbs.appendChild(button);
  });
}

function buildOptionButtons(container, items, current, onPick) {
  container.innerHTML = '';
  items.forEach((item) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `option${item.id === current ? ' selected' : ''}`;
    button.textContent = item.name;
    button.addEventListener('click', () => onPick(item.id));
    container.appendChild(button);
  });
}

function rebuildLayoutButtons() {
  buildOptionButtons($('layouts'), LAYOUTS, state.layout, (id) => {
    history.push(state);
    state.layout = id;
    assignPanels(state, state.panels.filter((p) => p.photoId).map((p) => p.photoId));
    queueRender();
    rebuildLayoutButtons();
  });
}

function rebuildGradeButtons() {
  buildOptionButtons($('grades'), GRADES, state.grade, (id) => {
    history.push(state);
    state.grade = id;
    queueRender();
    rebuildGradeButtons();
  });
}

// --- Right rail: panel controls, caption, furniture, look -----------------
function updatePanelControls() {
  const panel = state.panels[state.selectedPanel];
  const enabled = Boolean(panel && panel.photoId);
  $('zoom').disabled = !enabled;
  $('zoom').value = enabled ? String(Math.round(panel.zoom * 100)) : '100';
  $('zoom-value').textContent = enabled ? `${panel.zoom.toFixed(1)}×` : '—';
  $('name-tag').disabled = !enabled;
  if (document.activeElement !== $('name-tag')) {
    $('name-tag').value = enabled ? panel.tag : '';
  }
  ['reset-crop', 'flip', 'swap', 'face'].forEach((id) => { $(id).disabled = !enabled; });
  $('popout').checked = state.popOut;
}

function bindPanelControls() {
  $('zoom').addEventListener('input', () => {
    const panel = state.panels[state.selectedPanel];
    if (!panel) return;
    panel.zoom = Number($('zoom').value) / 100;
    queueRender();
  });
  $('zoom').addEventListener('change', () => history.push(state));
  $('reset-crop').addEventListener('click', () => {
    const panel = state.panels[state.selectedPanel];
    if (!panel) return;
    history.push(state);
    Object.assign(panel, { zoom: 1, panX: 0, panY: 0, flip: false });
    queueRender();
  });
  $('flip').addEventListener('click', () => {
    const panel = state.panels[state.selectedPanel];
    if (!panel) return;
    history.push(state);
    panel.flip = !panel.flip;
    queueRender();
  });
  $('swap').addEventListener('click', () => {
    const next = (state.selectedPanel + 1) % state.panels.length;
    const a = state.panels[state.selectedPanel];
    const b = state.panels[next];
    if (!a || !b || a.photoId === null || b.photoId === null) return;
    history.push(state);
    state.panels[state.selectedPanel] = b;
    state.panels[next] = a;
    state.selectedPanel = next;
    queueRender();
  });
  $('face').addEventListener('click', () => {
    const panel = state.panels[state.selectedPanel];
    if (!panel) return;
    history.push(state);
    Object.assign(panel, { panX: 0, panY: 0, zoom: 1.35 });
    queueRender();
  });
  $('name-tag').addEventListener('input', () => {
    const panel = state.panels[state.selectedPanel];
    if (!panel) return;
    panel.tag = $('name-tag').value.toUpperCase();
    queueRender();
  });
  $('name-tag').addEventListener('change', () => history.push(state));
  $('popout').addEventListener('change', () => {
    history.push(state);
    state.popOut = $('popout').checked;
    queueRender();
  });
}

function bindCaptionFields() {
  const fields = [
    ['title', 'title'], ['script', 'script'], ['tagline', 'tagline'],
    ['ticket', 'ticket'], ['quote', 'quote'],
  ];
  fields.forEach(([id, key]) => {
    $(id).addEventListener('input', () => {
      state.caption[key] = $(id).value;
      queueRender();
    });
    $(id).addEventListener('change', () => history.push(state));
  });
}

function bindFurniture() {
  const boxes = [
    ['fx-quote', 'quote'], ['fx-heat', 'heat'], ['fx-seal', 'seal'],
    ['fx-tags', 'tags'], ['fx-billing', 'billing'], ['fx-stat', 'statCard'],
  ];
  boxes.forEach(([id, key]) => {
    $(id).addEventListener('change', () => {
      history.push(state);
      state.furniture[key] = $(id).checked;
      queueRender();
    });
  });
}

function bindLookSliders() {
  const sliders = [
    ['look-paint', 'paint'], ['look-grade', 'grade'], ['look-halftone', 'halftone'],
    ['look-grain', 'grain'], ['look-glow', 'glow'],
  ];
  sliders.forEach(([id, key]) => {
    $(id).addEventListener('input', () => {
      state.look[key] = Number($(id).value) / 100;
      queueRender();
    });
    $(id).addEventListener('change', () => history.push(state));
  });
}

// --- Canvas gestures: click to select, drag to pan, scroll to zoom --------
function canvasPoint(event) {
  const box = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - box.left) * (canvas.width / box.width),
    y: (event.clientY - box.top) * (canvas.height / box.height),
  };
}

function bindCanvasGestures() {
  let dragging = false;
  let last = null;
  canvas.addEventListener('pointerdown', (event) => {
    if (!geometry) return;
    const p = canvasPoint(event);
    const i = geometry.slots.findIndex((s) => !s.stat && p.x >= s.x && p.x <= s.x + s.w && p.y >= s.y && p.y <= s.y + s.h);
    if (i === -1) return;
    state.selectedPanel = i;
    dragging = true;
    last = p;
    canvas.setPointerCapture(event.pointerId);
    queueRender();
  });
  canvas.addEventListener('pointermove', (event) => {
    if (!dragging || !geometry) return;
    const p = canvasPoint(event);
    const panel = state.panels[state.selectedPanel];
    const slot = geometry.slots[state.selectedPanel];
    if (panel && slot) {
      panel.panX -= (p.x - last.x) / slot.w;
      panel.panY -= (p.y - last.y) / slot.h;
      panel.panX = Math.max(-0.6, Math.min(0.6, panel.panX));
      panel.panY = Math.max(-0.6, Math.min(0.6, panel.panY));
      queueRender();
    }
    last = p;
  });
  canvas.addEventListener('pointerup', () => {
    if (dragging) history.push(state);
    dragging = false;
  });
  canvas.addEventListener('wheel', (event) => {
    event.preventDefault();
    const panel = state.panels[state.selectedPanel];
    if (!panel) return;
    panel.zoom = Math.max(1, Math.min(3, panel.zoom * (event.deltaY < 0 ? 1.1 : 0.91)));
    queueRender();
  }, { passive: false });
}

// --- History, export, photo intake ----------------------------------------
function updateHistoryButtons() {
  $('undo').disabled = !history.canUndo;
  $('redo').disabled = !history.canRedo;
}

function bindHistory() {
  $('undo').addEventListener('click', () => {
    const prev = history.undo(state);
    if (prev) {
      Object.assign(state, prev);
      queueRender();
      rebuildLayoutButtons();
      rebuildGradeButtons();
      syncForm();
    }
  });
  $('redo').addEventListener('click', () => {
    const next = history.redo(state);
    if (next) {
      Object.assign(state, next);
      queueRender();
      rebuildLayoutButtons();
      rebuildGradeButtons();
      syncForm();
    }
  });
  document.addEventListener('keydown', (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'z' && !event.shiftKey) {
      event.preventDefault();
      $('undo').click();
    }
    if ((event.metaKey || event.ctrlKey) && (event.key.toLowerCase() === 'y' || (event.key.toLowerCase() === 'z' && event.shiftKey))) {
      event.preventDefault();
      $('redo').click();
    }
  });
}

function syncForm() {
  $('title').value = state.caption.title;
  $('script').value = state.caption.script;
  $('tagline').value = state.caption.tagline;
  $('ticket').value = state.caption.ticket;
  $('quote').value = state.caption.quote;
  $('fx-quote').checked = state.furniture.quote;
  $('fx-heat').checked = state.furniture.heat;
  $('fx-seal').checked = state.furniture.seal;
  $('fx-tags').checked = state.furniture.tags;
  $('fx-billing').checked = state.furniture.billing;
  $('fx-stat').checked = state.furniture.statCard;
  $('look-paint').value = String(Math.round(state.look.paint * 100));
  $('look-grade').value = String(Math.round(state.look.grade * 100));
  $('look-halftone').value = String(Math.round(state.look.halftone * 100));
  $('look-grain').value = String(Math.round(state.look.grain * 100));
  $('look-glow').value = String(Math.round(state.look.glow * 100));
}

function bindExport() {
  $('size').addEventListener('change', () => {
    history.push(state);
    state.size = $('size').value;
    assignPanels(state, state.panels.filter((p) => p.photoId).map((p) => p.photoId));
    queueRender();
  });
  $('export').addEventListener('click', async () => {
    $('status').textContent = 'Rendering…';
    const name = await exportSize(state, images, state.size);
    $('status').textContent = `Saved ${name}`;
  });
  $('export-all').addEventListener('click', async () => {
    $('status').textContent = 'Rendering all three sizes…';
    const names = await exportAllSizes(state, images);
    $('status').textContent = `Saved ${names.length} PNGs — one per size`;
  });
}

function bindPhotoIntake() {
  $('add-photos').addEventListener('change', async (event) => {
    const files = [...event.target.files];
    for (const file of files) {
      const url = URL.createObjectURL(file);
      try {
        const img = await loadImage(url);
        const id = `user-${userPhotos.length + 1}`;
        images.set(id, img);
        userPhotos.push({
          id, url, name: file.name.replace(/\.[^.]+$/, '').slice(0, 14) || 'Photo',
          role: 'THE GUEST', stamp: '', focal: { x: 0.5, y: 0.4 }, user: true,
        });
      } catch {
        URL.revokeObjectURL(url);
      }
    }
    event.target.value = '';
    rebuildThumbnails();
    $('status').textContent = `${userPhotos.length} of your photos loaded — click one, then a panel, to place it`;
  });
  $('load-samples').addEventListener('click', () => {
    history.push(state);
    assignPanels(state, SAMPLES.slice(0, 6).map((s) => s.id));
    queueRender();
    $('status').textContent = 'Sample cast loaded';
  });
  $('autofill').addEventListener('click', () => {
    history.push(state);
    const ids = [...SAMPLES.map((s) => s.id)];
    for (let i = ids.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ids[i], ids[j]] = [ids[j], ids[i]];
    }
    assignPanels(state, ids);
    queueRender();
    $('status').textContent = 'Panels auto-filled from the cast';
  });
  $('one-photo').addEventListener('click', () => {
    const panel = state.panels[state.selectedPanel];
    if (!panel || !panel.photoId) return;
    history.push(state);
    onePhotoFill(state, panel.photoId);
    queueRender();
    $('status').textContent = 'One photo fills all panels — five crops of the same shot';
  });
}

// --- Boot -----------------------------------------------------------------
async function boot() {
  await loadFonts();
  const samples = await loadSamples();
  samples.forEach((img, id) => images.set(id, img));
  assignPanels(state, ['hero-convertible', 'boss-suit', 'rider-bike', 'crew-rooftop', 'pier', 'motel-neon']);
  rebuildThumbnails();
  rebuildLayoutButtons();
  rebuildGradeButtons();
  bindPanelControls();
  bindCaptionFields();
  bindFurniture();
  bindLookSliders();
  bindCanvasGestures();
  bindHistory();
  bindExport();
  bindPhotoIntake();
  syncForm();
  const params = new URLSearchParams(location.search);
  const shot = params.get('shot');
  if (shot) {
    const coverOnly = applyShot(shot, state);
    if (coverOnly) document.body.classList.add('shot-cover');
    syncForm();
    rebuildLayoutButtons();
    rebuildGradeButtons();
  }
  render();
  if (shot) markShotReady();
}

boot().catch((error) => {
  $('status').textContent = `Could not start: ${error.message}`;
});
