// The six colour grades. Each grade is a canvas filter applied while a photo
// is drawn, plus two wash colours laid over the finished art: a warm wash
// from the top and a cool wash from the bottom. The Grade slider scales the
// washes; the filter always applies in full, so a cover keeps its character
// even at a low slider setting.
export const GRADES = [
  {
    id: 'golden-static', name: 'Golden Static',
    filter: 'saturate(1.18) contrast(1.05) brightness(1.02)',
    warm: 'rgba(255, 150, 60, 0.12)', cool: 'rgba(120, 40, 140, 0.10)',
  },
  {
    id: 'neon-dusk', name: 'Neon Dusk',
    filter: 'saturate(1.38) contrast(1.08)',
    warm: 'rgba(255, 60, 160, 0.14)', cool: 'rgba(40, 120, 255, 0.16)',
  },
  {
    id: 'tropic-teal', name: 'Tropic Teal',
    filter: 'saturate(1.22) contrast(1.05) hue-rotate(-14deg)',
    warm: 'rgba(255, 200, 90, 0.08)', cool: 'rgba(0, 150, 160, 0.16)',
  },
  {
    id: 'heatwave', name: 'Heatwave',
    filter: 'saturate(1.32) contrast(1.06) brightness(1.01)',
    warm: 'rgba(255, 110, 20, 0.18)', cool: 'rgba(160, 30, 60, 0.10)',
  },
  {
    id: 'ultraviolet', name: 'Ultraviolet',
    filter: 'saturate(1.26) contrast(1.07) hue-rotate(26deg)',
    warm: 'rgba(180, 80, 255, 0.14)', cool: 'rgba(20, 20, 120, 0.16)',
  },
  {
    id: 'noir', name: 'Noir',
    filter: 'grayscale(0.92) contrast(1.16) brightness(1.04)',
    warm: 'rgba(255, 240, 210, 0.06)', cool: 'rgba(0, 0, 30, 0.18)',
  },
];

export function gradeById(id) {
  return GRADES.find((g) => g.id === id) ?? GRADES[0];
}
