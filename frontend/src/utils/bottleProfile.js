// All dimensions in cm.
export const WIDTH = 6.6
export const DEPTH = 6.6
export const HEIGHT = 19.5
export const HALF_W = WIDTH / 2
const DEPTH_RATIO = DEPTH / WIDTH
export const NECK_R = 1.3
export const CORNER_SEGMENTS = 6
export const PROFILE = [
  { y: 0, hw: HALF_W - 0.35, r: 0.9 },
  { y: 0.35, hw: HALF_W, r: 1.0 },
  { y: 12.5, hw: HALF_W, r: 1.0 },
  { y: 13.6, hw: 3.1, r: 1.2 },
  { y: 14.8, hw: 2.7, r: 1.5 },
  { y: 16.3, hw: 1.9, r: 1.9 },
  { y: 17.0, hw: NECK_R, r: NECK_R },
  { y: HEIGHT, hw: NECK_R, r: NECK_R },
]

export const SLEEVE_GAP = 0.05
export const SLEEVE_BOTTOM = 1.8
export const SLEEVE_PROFILE = [
  { y: SLEEVE_BOTTOM, hw: HALF_W, r: 1.0 },
  ...PROFILE.filter(({ y }) => y >= 12.5 && y <= 16.3),
]
export const SLEEVE_TOP = SLEEVE_PROFILE[SLEEVE_PROFILE.length - 1].y
export const UV_INSET = 2 / 2048

export function ringPoints(hw, r) {
  const hd = hw * DEPTH_RATIO
  const cr = Math.min(r, hw, hd)
  const centers = [
    [hw - cr, hd - cr],
    [-(hw - cr), hd - cr],
    [-(hw - cr), -(hd - cr)],
    [hw - cr, -(hd - cr)],
  ]
  const points = []
  centers.forEach(([cx, cz], k) => {
    for (let i = 0; i <= CORNER_SEGMENTS; i++) {
      const a = k * (Math.PI / 2) + (i / CORNER_SEGMENTS) * (Math.PI / 2)
      points.push([cx + cr * Math.cos(a), cz + cr * Math.sin(a), a])
    }
  })
  return points
}

const faceLengths = SLEEVE_PROFILE.map(({ hw, r }) => {
  const pts = ringPoints(hw + SLEEVE_GAP, r + SLEEVE_GAP)
  const half = CORNER_SEGMENTS / 2
  const face = [...pts.slice(half, CORNER_SEGMENTS + 1), ...pts.slice(CORNER_SEGMENTS + 1, CORNER_SEGMENTS + half + 2)]
  return face.slice(1).reduce((length, p, i) => length + Math.hypot(p[0] - face[i][0], p[1] - face[i][1]), 0)
})

// Invert the front mesh's symmetric triangle mapping at a given texture row.
export function frontTextureMapping(canvasY, panelWidth, panelHeight) {
  const y = SLEEVE_TOP - (canvasY / panelHeight) * (SLEEVE_TOP - SLEEVE_BOTTOM)
  let row = 0
  while (row < SLEEVE_PROFILE.length - 2 && y > SLEEVE_PROFILE[row + 1].y) row++
  const lower = SLEEVE_PROFILE[row]
  const upper = SLEEVE_PROFILE[row + 1]
  const mix = Math.max(0, Math.min(1, (y - lower.y) / (upper.y - lower.y)))
  const lowerHalf = lower.hw - lower.r
  const upperHalf = upper.hw - upper.r
  const threshold = (1 - mix) * lowerHalf
  const edge = threshold + mix * upperHalf
  const uvThreshold = threshold / faceLengths[row]
  const uvEdge = uvThreshold + mix * upperHalf / faceLengths[row + 1]
  const usableWidth = panelWidth * (1 - 8 * UV_INSET)
  const pixelHeight = (SLEEVE_TOP - SLEEVE_BOTTOM) / panelHeight
  return {
    breakpoint: threshold / pixelHeight,
    mapOffset: (offset) => {
      const distance = Math.abs(offset) * pixelHeight
      const uv = distance <= threshold || edge === threshold
        ? distance / faceLengths[row]
        : uvThreshold + (distance - threshold) * (uvEdge - uvThreshold) / (edge - threshold)
      return Math.sign(offset) * uv * usableWidth
    },
  }
}
