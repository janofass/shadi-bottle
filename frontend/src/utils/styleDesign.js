export function luminance(hex) {
  const n = parseInt(hex.slice(1), 16)
  const [r, g, b] = [16, 8, 0].map((shift) => {
    const v = ((n >> shift) & 255) / 255
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

export const rgbToHex = (rgb) => `#${rgb.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`

const distance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])

// Dominant, mutually distinct photo colors (2 or 3, fewer only for near-monochrome images).
// Near-black and near-white are skipped because they are offered as separate banner choices.
export function extractPalette(samples, count = 3) {
  const buckets = new Map()
  for (const rgb of samples) {
    const key = rgb.map((v) => Math.min(7, Math.floor(v / 32))).join(',')
    const bucket = buckets.get(key) ?? { n: 0, sum: [0, 0, 0] }
    bucket.n++
    for (let c = 0; c < 3; c++) bucket.sum[c] += rgb[c]
    buckets.set(key, bucket)
  }
  const ranked = [...buckets.values()]
    .sort((a, b) => b.n - a.n)
    .map(({ n, sum }) => sum.map((v) => v / n))
    .filter((rgb) => distance(rgb, [0, 0, 0]) > 40 && distance(rgb, [255, 255, 255]) > 40)

  let picked = []
  for (const minimum of [70, 45, 25]) {
    picked = []
    for (const rgb of ranked) {
      if (picked.length < count && picked.every((other) => distance(rgb, other) >= minimum)) picked.push(rgb)
    }
    if (picked.length >= 2) break
  }
  if (!picked.length) {
    const average = [0, 1, 2].map((c) => samples.reduce((sum, rgb) => sum + rgb[c], 0) / samples.length)
    picked = [average]
  }
  return picked.map(rgbToHex)
}

export const BANNER_BLACK = '#000000'
export const BANNER_WHITE = '#FFFFFF'

// Banner color choices: up to 3 photo colors plus white and black.
export const bannerColorOptions = (palette) => [...palette, BANNER_WHITE, BANNER_BLACK]

// Starts with the photo's darkest color so the banner stays in harmony with the artwork.
export function defaultBannerColor(palette) {
  const darkest = palette.reduce((best, color) => (luminance(color) < luminance(best) ? color : best), palette[0])
  return darkest && luminance(darkest) < 0.2 ? darkest : BANNER_BLACK
}

// Choose from coordinated foil colors using the actual photo, not just its average.
export function chooseStyleDesign(samples) {
  if (!samples.length) throw new Error('Cannot choose a style without image samples')
  const average = [0, 1, 2].map((c) => samples.reduce((sum, rgb) => sum + rgb[c], 0) / samples.length)
  const backgrounds = samples.map(rgbToHex)
  const coverage = (color, minimum) =>
    backgrounds.filter((background) => contrast(color, background) >= minimum).length / backgrounds.length
  const textCandidates = ['#FFF9F0', '#211A25']
  const textColor = textCandidates.reduce((best, color) =>
    coverage(color, 4.5) > coverage(best, 4.5) ? color : best,
  )

  const [r, g, b] = average
  const family = b > r + 10 && b > g ? 'silver' : r > g + 12 ? 'rose' : 'gold'
  const foils = [
    { family: 'gold', light: '#E8C879', dark: '#78591D' },
    { family: 'rose', light: '#EBC4CC', dark: '#814653' },
    { family: 'silver', light: '#CEDCE8', dark: '#41576B' },
  ]
  const candidates = foils.map((foil) => ({
    color: textColor === textCandidates[0] ? foil.dark : foil.light,
    family: foil.family,
  }))
  const bestFoil = candidates.reduce((best, candidate) => {
    const score = (item) => coverage(item.color, 3) + (item.family === family ? 0.12 : 0)
    return score(candidate) > score(best) ? candidate : best
  })
  return {
    primary: rgbToHex(average),
    accent: bestFoil.color,
    textColor,
    palette: extractPalette(samples),
    frontFinish: family === 'silver' ? 'silver' : 'gold',
  }
}
