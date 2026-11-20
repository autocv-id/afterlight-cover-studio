// The cast: every sample photo the studio ships with, its screen name, its
// poster role, its location-and-time stamp, and the face (or subject) a crop
// must keep in frame. The eight photos generated for this entry sit beside
// the kit's own two samples (pier, boulevard), which are free to use.
export const SAMPLES = [
  { id: 'hero-convertible', file: 'hero-convertible.jpg', name: 'Mara', role: 'THE DRIVER', stamp: 'PIER 9 · 6:12 PM', focal: { x: 0.52, y: 0.40 } },
  { id: 'boss-suit', file: 'boss-suit.jpg', name: 'Don', role: 'THE BOSS', stamp: 'THE VELVET ROOM · 9:30 PM', focal: { x: 0.62, y: 0.45 } },
  { id: 'rider-bike', file: 'rider-bike.jpg', name: 'Rex', role: 'THE RIDER', stamp: 'HARBOR LOOP · 7:58 PM', focal: { x: 0.58, y: 0.48 } },
  { id: 'crew-rooftop', file: 'crew-rooftop.jpg', name: 'Crew', role: 'THE CREW', stamp: 'DUNE ROAD · 5:03 PM', focal: { x: 0.50, y: 0.55 } },
  { id: 'pier', file: 'pier.jpg', name: 'Sal', role: 'THE FIXER', stamp: 'STATIC GARAGE · 11:47 PM', focal: { x: 0.35, y: 0.30 } },
  { id: 'motel-neon', file: 'motel-neon.jpg', name: 'Motel 6', role: 'THE LOOKOUT', stamp: 'MOTEL 6 · 2:00 AM', focal: { x: 0.60, y: 0.40 } },
  { id: 'mechanic-bandana', file: 'mechanic-bandana.jpg', name: 'June', role: 'THE MECHANIC', stamp: 'STATIC GARAGE · 4:44 PM', focal: { x: 0.45, y: 0.30 } },
  { id: 'courier-night', file: 'courier-night.jpg', name: 'Nico', role: 'THE COURIER', stamp: 'NEON ROW · 11:12 PM', focal: { x: 0.45, y: 0.50 } },
  { id: 'guest-motel', file: 'guest-motel.jpg', name: 'Viv', role: 'THE GUEST', stamp: 'POOL SIDE · 4:44 PM', focal: { x: 0.33, y: 0.47 } },
  { id: 'boulevard', file: 'boulevard.jpg', name: 'Ana', role: 'THE INSIDER', stamp: 'OCEAN DRIVE · 6:42 PM', focal: { x: 0.42, y: 0.25 } },
];

/** Loads an image from a URL, resolving once it can be drawn. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`could not load ${url}`));
    img.src = url;
  });
}

/** Loads every sample, returning a Map from sample id to its image. */
export async function loadSamples() {
  const out = new Map();
  await Promise.all(SAMPLES.map(async (s) => {
    out.set(s.id, await loadImage(`samples/${s.file}`));
  }));
  return out;
}

/** The bundled poster fonts, loaded from the app's own files (OFL, offline). */
export async function loadFonts() {
  const faces = [
    new FontFace('Anton', 'url(fonts/Anton-Regular.ttf)'),
    new FontFace('Pacifico', 'url(fonts/Pacifico-Regular.ttf)'),
    new FontFace('Bebas Neue', 'url(fonts/BebasNeue-Regular.ttf)'),
  ];
  await Promise.all(faces.map(async (f) => {
    const loaded = await f.load();
    document.fonts.add(loaded);
  }));
  await Promise.all([
    document.fonts.load('100px Anton'),
    document.fonts.load('100px Pacifico'),
    document.fonts.load('100px "Bebas Neue"'),
  ]);
}
