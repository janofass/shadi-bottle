import QRCode from 'qrcode'
import { frontTextureMapping } from './bottleProfile'
import { BANNER_BLACK, chooseStyleDesign, contrast, luminance, rgbToHex } from './styleDesign'

const benchmarkUrls = import.meta.glob([
  '../assets/benchmarks/*.{jpeg,jpg,JPEG,JPG}',
  '!../assets/benchmarks/{radiant_stardust,caligraphy_wrap}.{jpeg,jpg,JPEG,JPG}',
], {
  eager: true,
  query: '?url',
  import: 'default',
})

const benchmarkImages = Object.create(null)
for (const [path, src] of Object.entries(benchmarkUrls)) {
  const id = path.slice(path.lastIndexOf('/') + 1).replace(/\.(jpe?g)$/i, '')
  if (Object.hasOwn(benchmarkImages, id)) throw new Error(`Duplicate benchmark style: ${id}`)
  benchmarkImages[id] = src
}

export const PANEL_W = 512
export const PANEL_H = 1024
const PANEL_COUNT = 4

const SCRIPT = '"Great Vibes","Snell Roundhand","Apple Chancery","Brush Script MT",cursive'
const SERIF = '"Cormorant Garamond","Playfair Display",Georgia,"Times New Roman",serif'
const EMOJI = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif'

export const FONT_LOADS = [
  `64px "Great Vibes"`,
  `24px "Cormorant Garamond"`,
  `italic 24px "Cormorant Garamond"`,
  `bold 24px "Cormorant Garamond"`,
  `900 64px "Playfair Display"`,
]

// Sleeve background alpha < 1 lets the inner petal layer faintly show through the print.
const BG_ALPHA = 0.95

export const PALETTE_PRESETS = [
  { id: 'baraat', label: 'Baraat Crimson', primary: '#4A0E17', accent: '#E5C158', text: '#FFF9F0' },
  { id: 'nikkah', label: 'Nikkah Emerald', primary: '#0A3B2A', accent: '#D4AF37', text: '#F9F6EE' },
  { id: 'valima', label: 'Valima Pastel', primary: '#D8A7B1', accent: '#9A5566', text: '#4A2530' },
  { id: 'ivory', label: 'Modern Ivory', primary: '#F5EFE3', accent: '#B8924A', text: '#2B2430' },
]

const FEATURED_STYLES = [
  { id: 'thousand_wishes', label: 'A Thousand Wishes - Glitter Burst' },
  { id: 'dream_bright', label: 'Dream Bright - Gemstone Constellation' },
  { id: 'into_the_night', label: 'Into the Night - Cascading Gold Rain' },
  { id: 'sweet_pea', label: 'Sweet Pea - Pressed Watercolors' },
  { id: 'covered_in_roses', label: 'Covered in Roses - Lush Velvet Petals' },
  { id: 'white_flower', label: 'White Chamomile - Dense Floral Canopy' },
  { id: 'champa_lotus', label: 'Champa & Lotus - Teal Arabesque' },
  { id: 'sakura_branch', label: 'Sakura Branch - Watercolor Branches' },
]

export const BACKGROUND_STYLES = [
  ...FEATURED_STYLES.filter(({ id }) => Object.hasOwn(benchmarkImages, id)),
  ...Object.keys(benchmarkImages)
    .filter((id) => !FEATURED_STYLES.some((style) => style.id === id))
    .sort()
    .map((id) => ({
      id,
      label: id.replace(/[_-]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()),
    })),
]

export const BANNER_STYLES = [
  { id: 'strip', label: 'Strip' },
  { id: 'card', label: 'Card' },
  { id: 'oval', label: 'Oval' },
  { id: 'none', label: 'None' },
]

// Names, "WED" and the date sit between these rows on the front panel.
const BANNER_CENTER_Y = 425
const BANNER_NAME_WIDTH = { strip: 330, card: 330, oval: 270, none: 330 }

export const FRONT_FINISHES = {
  gold: {
    label: 'Gold', ink: '#D49A55', emission: '#71380F',
    colors: ['#D79551', '#A45E25', '#C98441'], shadow: '#794018', outline: '#754017',
    highlight: '#F4D1A0', nameHighlight: '#FFDBA3',
    grainLight: 'rgba(255,230,190,0.12)', grainDark: 'rgba(91,43,15,0.12)',
    reflectionLight: '255,229,182', reflectionDark: '91,43,15', glint: '255,231,191',
  },
  silver: { label: 'Silver', ink: '#CCD6E0', emission: '#CCD6E0' },
  crimson_red: {
    label: 'Crimson Red', ink: '#A51629', emission: '#5D0710',
    colors: ['#D54F58', '#8D0D21', '#B92035'], shadow: '#550716', outline: '#480714',
    highlight: '#F28A91', nameHighlight: '#FFA8A9',
    grainLight: 'rgba(255,190,190,0.12)', grainDark: 'rgba(65,0,10,0.12)',
    reflectionLight: '255,190,190', reflectionDark: '65,0,10', glint: '255,190,190',
  },
  cobalt_blue: {
    label: 'Cobalt Blue', ink: '#174EC0', emission: '#08235E',
    colors: ['#5592E3', '#10358C', '#2C65C8'], shadow: '#091D50', outline: '#07183F',
    highlight: '#A2C8FF', nameHighlight: '#BDD8FF',
    grainLight: 'rgba(195,220,255,0.12)', grainDark: 'rgba(2,15,55,0.12)',
    reflectionLight: '195,220,255', reflectionDark: '2,15,55', glint: '195,220,255',
  },
  noir_black: {
    label: 'Noir Black', ink: '#24262B', emission: '#0B0B0C',
    colors: ['#55585E', '#121317', '#303238'], shadow: '#050607', outline: '#050607',
    highlight: '#93979F', nameHighlight: '#B3B7BF',
    grainLight: 'rgba(210,214,220,0.12)', grainDark: 'rgba(0,0,0,0.12)',
    reflectionLight: '210,214,220', reflectionDark: '0,0,0', glint: '210,214,220',
  },
}

export const GUEST_ICONS = [
  { id: 'sunflower', emoji: '🌻', label: 'Sunflower' },
  { id: 'rose', emoji: '🌹', label: 'Rose' },
  { id: 'peacock', emoji: '🦚', label: 'Peacock' },
  { id: 'crescent', emoji: '🌙', label: 'Crescent' },
  { id: 'lotus', emoji: '🪷', label: 'Lotus' },
  { id: 'crown', emoji: '👑', label: 'Crown' },
  { id: 'leaf', emoji: '🍃', label: 'Leaf' },
  { id: 'star', emoji: '⭐️', label: 'Star' },
  { id: 'diamond', emoji: '💎', label: 'Diamond' },
  { id: 'feather', emoji: '🪶', label: 'Feather' },
  { id: 'heart', emoji: '❤️', label: 'Heart' },
  { id: 'ribbon', emoji: '🎗️', label: 'Ribbon' },
]

// Decorative sample values; replace with lab-tested figures before printing.
const WATER_SPECS = [
  ['pH', '7.4'],
  ['Calcium', '18'],
  ['Magnesium', '12'],
  ['Sodium', '18'],
  ['Bicarbonate', '152'],
  ['Silica', '83'],
  ['TDS', '222'],
]

const DEFAULTS = {
  primary: '#0A3B2A',
  accent: '#D4AF37',
  textColor: '#F9F6EE',
  background: 'thousand_wishes',
  useOriginalBackground: false,
  tagline: 'I Believe in Love',
  groomName: '',
  brideName: '',
  frontFinish: 'gold',
  autoFrontFinish: 'gold',
  bannerStyle: 'strip',
  bannerColor: BANNER_BLACK,
  bannerOpacity: 0.5,
  weddingDate: '',
  guestIcon: 'rose',
  thankYouNote: '',
  story: '',
  firstMetDate: '',
  proposalDate: '',
  vipCrew: '',
  hashtag: '',
  handle: '',
  resellerName: '',
  resellerContact: '',
}

// ---------- helpers ----------

function rng(seed) {
  let a = seed >>> 0
  return () => {
    a += 0x6d2b79f5
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16)
  const target = amt < 0 ? 0 : 255
  const p = Math.abs(amt)
  const ch = (shift) => Math.round(((n >> shift) & 255) * (1 - p) + target * p)
  return `rgb(${ch(16)},${ch(8)},${ch(0)})`
}

// Keeps the preferred color when readable on bg, otherwise the most readable fallback.
function legible(bg, preferred, min, fallbacks = ['#FFFFFF', '#111111']) {
  if (contrast(preferred, bg) >= min) return preferred
  return fallbacks.reduce((best, c) => (contrast(c, bg) > contrast(best, bg) ? c : best))
}

const HEX = /^#[0-9a-f]{6}$/i
const validHex = (value, fallback) => (HEX.test(value) ? value : fallback)

// Keep the selected text and accent colors; decorative badge details use a contrasting color.
function deriveTheme({ primary, accent, textColor }) {
  const bg = primary
  const ink = textColor
  const line = accent
  const light = luminance(ink) > 0.5 ? ink : '#FFFFFF'
  return {
    bg,
    ink,
    line,
    light,
    lightBg: luminance(bg) > 0.4,
    badgeText: legible(line, bg, 3, ['#111111', '#FFFFFF']),
  }
}

function metal(ctx, t, x0, y0, x1, y1) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1)
  g.addColorStop(0, shade(t.line, t.lightBg ? 0.05 : 0.4))
  g.addColorStop(0.5, t.line)
  g.addColorStop(1, shade(t.line, -0.3))
  return g
}

const serif = (size, style = '') => `${style} ${size}px ${SERIF}`.trim()
const script = (size) => `${size}px ${SCRIPT}`

const contrastChecks = new WeakMap()

function foilText(ctx, str, x, y, metrics, embossed, finish) {
  const width = metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight
  const height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent
  if (width <= 0 || height <= 0) return

  const pad = 3
  const layer = document.createElement('canvas')
  layer.width = Math.ceil(width + pad * 2)
  layer.height = Math.ceil(height + pad * 2)
  const foil = layer.getContext('2d')
  foil.font = ctx.font
  foil.textAlign = ctx.textAlign
  foil.textBaseline = ctx.textBaseline
  foil.lineJoin = 'round'
  const tx = pad + metrics.actualBoundingBoxLeft
  const ty = pad + metrics.actualBoundingBoxAscent
  const sheen = foil.createLinearGradient(0, 0, layer.width, layer.height)
  finish.colors.forEach((color, i) => sheen.addColorStop(i / (finish.colors.length - 1), color))
  foil.fillStyle = sheen
  foil.fillText(str, tx, ty)

  // Keep the finish inside the glyphs, so it cannot make a patch on the artwork.
  foil.globalCompositeOperation = 'source-atop'
  const grain = rng(42)
  for (let i = 0; i < width * height / 180; i++) {
    foil.fillStyle = i % 2 ? finish.grainLight : finish.grainDark
    foil.fillRect(grain() * layer.width, grain() * layer.height, 0.6, 1 + grain() * 5)
  }
  const glint = foil.createRadialGradient(layer.width * 0.27, layer.height * 0.22, 0, layer.width * 0.27, layer.height * 0.22, height * 1.1)
  glint.addColorStop(0, `rgba(${finish.glint},0.5)`)
  glint.addColorStop(1, `rgba(${finish.glint},0)`)
  foil.fillStyle = glint
  foil.fillRect(0, 0, layer.width, layer.height)
  if (embossed) {
    const start = tx - foil.measureText(str).width / 2
    let prefix = ''
    let left = start
    for (const character of str) {
      prefix += character
      const right = start + foil.measureText(prefix).width
      if (right > left) {
        const reflection = foil.createLinearGradient(left, 0, right, 0)
        reflection.addColorStop(0, `rgba(${finish.reflectionDark},0.2)`)
        reflection.addColorStop(0.18, `rgba(${finish.reflectionLight},0.55)`)
        reflection.addColorStop(0.42, `rgba(${finish.reflectionLight},0)`)
        reflection.addColorStop(0.8, `rgba(${finish.reflectionDark},0.2)`)
        reflection.addColorStop(1, `rgba(${finish.reflectionLight},0.1)`)
        foil.fillStyle = reflection
        foil.fillRect(left, 0, right - left, layer.height)
      }
      left = right
    }
  }
  foil.lineWidth = embossed ? Math.min(3.2, Math.max(1.4, height / 17)) : Math.min(1.6, Math.max(0.7, height / 35))
  foil.strokeStyle = finish.shadow
  foil.strokeText(str, tx + (embossed ? 1 : 0.4), ty + (embossed ? 1 : 0.5))
  foil.strokeStyle = embossed ? finish.nameHighlight : finish.highlight
  foil.strokeText(str, tx - (embossed ? 1 : 0.4), ty - (embossed ? 1 : 0.5))

  ctx.strokeStyle = finish.outline
  ctx.lineWidth = Math.min(1.5, Math.max(0.6, height / 35))
  ctx.lineJoin = 'round'
  ctx.strokeText(str, x, y)
  ctx.drawImage(layer, x - metrics.actualBoundingBoxLeft - pad, y - metrics.actualBoundingBoxAscent - pad)
}

function text(ctx, str, x, y, font, fill, align = 'center', embossed = false) {
  ctx.font = font
  ctx.fillStyle = fill
  ctx.textAlign = align
  const check = contrastChecks.get(ctx)
  if (check && !check.lowContrast && str && fill === check.color) {
    // Sample the rendered area behind the text; photos do not have a single background color.
    const metrics = ctx.measureText(str)
    const transform = ctx.getTransform()
    const left = Math.max(0, Math.floor(transform.e + x - metrics.actualBoundingBoxLeft))
    const top = Math.max(0, Math.floor(transform.f + y - metrics.actualBoundingBoxAscent))
    const right = Math.min(ctx.canvas.width, Math.ceil(transform.e + x + metrics.actualBoundingBoxRight))
    const bottom = Math.min(ctx.canvas.height, Math.ceil(transform.f + y + metrics.actualBoundingBoxDescent))
    if (right > left && bottom > top) {
      const { data } = ctx.getImageData(left, top, right - left, bottom - top)
      const width = right - left
      const height = bottom - top
      let low = 0
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 5; col++) {
          const px = Math.min(width - 1, Math.floor((col + 0.5) * width / 5))
          const py = Math.min(height - 1, Math.floor((row + 0.5) * height / 4))
          const index = (py * width + px) * 4
          const background = rgbToHex([data[index], data[index + 1], data[index + 2]])
          if (contrast(fill, background) < 4.5) low++
        }
      }
      check.lowContrast = low >= 5
    }
  }
  if (check?.finish && fill === check.color) {
    const foilName = embossed && check.finish !== 'silver'
    for (const [mask, color] of [
      [check.metalMask, foilName ? '#a0a0a0' : '#808080'],
      [check.roughnessMask, foilName ? '#606060' : '#808080'],
      [check.bumpMask, foilName ? '#ffffff' : '#808080'],
    ]) {
      mask.save()
      mask.setTransform(ctx.getTransform())
      mask.font = font
      mask.textAlign = align
      mask.textBaseline = ctx.textBaseline
      mask.fillStyle = color
      if (foilName && mask === check.bumpMask) mask.filter = 'blur(1.2px)'
      mask.fillText(str, x, y)
      mask.restore()
    }
    ctx.save()
    const metrics = ctx.measureText(str)
    const height = Math.max(12, metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent)
    if (check.finish !== 'silver') {
      foilText(ctx, str, x, y, metrics, foilName, FRONT_FINISHES[check.finish])
    } else {
      ctx.lineWidth = Math.min(1.6, Math.max(0.8, height / 20))
      ctx.strokeStyle = '#586B7C'
      ctx.shadowColor = 'rgba(0,0,0,0.45)'
      ctx.shadowOffsetY = 1.5
      ctx.shadowBlur = 1.5
      ctx.strokeText(str, x, y)
      ctx.shadowColor = 'transparent'
      const foil = ctx.createLinearGradient(0, y - height / 2, 0, y + height / 2)
      const colors = ['#8495A5', '#F1F6FA', '#A8B6C2', '#E9F0F5', '#7F91A2']
      colors.forEach((color, i) => foil.addColorStop(i / (colors.length - 1), color))
      ctx.fillStyle = foil
      ctx.fillText(str, x, y)
    }
    ctx.restore()
  } else {
    ctx.fillText(str, x, y)
  }
}

function fitFont(ctx, str, make, maxW, maxSize, minSize = 16) {
  let s = maxSize
  ctx.font = make(s)
  while (s > minSize && ctx.measureText(str).width > maxW) {
    s -= 2
    ctx.font = make(s)
  }
  return make(s)
}

const spaced = (str) => str.split('').join('\u200A')

function wrapLines(ctx, str, maxW) {
  const lines = []
  str.split('\n').forEach((para) => {
    let line = ''
    para.split(/\s+/).filter(Boolean).forEach((word) => {
      const trial = line ? `${line} ${word}` : word
      if (line && ctx.measureText(trial).width > maxW) {
        lines.push(line)
        line = word
      } else {
        line = trial
      }
    })
    lines.push(line)
  })
  return lines
}

function paragraph(ctx, str, x, y, maxW, lineH, maxLines, font, fill, align = 'center') {
  ctx.font = font
  const lines = wrapLines(ctx, str, maxW)
  if (lines.length > maxLines) {
    lines.length = maxLines
    lines[maxLines - 1] = `${lines[maxLines - 1].replace(/[\s,.;:]+$/, '')}…`
  }
  lines.forEach((line, i) => text(ctx, line, x, y + i * lineH, font, fill, align))
  return y + lines.length * lineH
}

function formatDate(iso, month = 'long') {
  if (!iso) return ''
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return ''
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', { day: 'numeric', month, year: 'numeric' })
}

// ---------- ornaments ----------

function petalPath(ctx, r) {
  ctx.moveTo(0, 0)
  ctx.bezierCurveTo(r * 0.5, -r * 0.2, r * 0.45, -r * 0.8, 0, -r)
  ctx.bezierCurveTo(-r * 0.45, -r * 0.8, -r * 0.5, -r * 0.2, 0, 0)
}

function petals(ctx, cx, cy, r, n, rot, fill) {
  for (let i = 0; i < n; i++) {
    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(rot + (i * Math.PI * 2) / n)
    ctx.beginPath()
    petalPath(ctx, r)
    if (fill) ctx.fill()
    else ctx.stroke()
    ctx.restore()
  }
}

function flower(ctx, cx, cy, r, n, fill, center) {
  ctx.fillStyle = fill
  petals(ctx, cx, cy, r, n, 0, true)
  ctx.fillStyle = center
  ctx.beginPath()
  ctx.arc(cx, cy, r * 0.22, 0, Math.PI * 2)
  ctx.fill()
}

function diamond(ctx, x, y, s, fill) {
  ctx.fillStyle = fill
  ctx.beginPath()
  ctx.moveTo(x, y - s)
  ctx.lineTo(x + s, y)
  ctx.lineTo(x, y + s)
  ctx.lineTo(x - s, y)
  ctx.closePath()
  ctx.fill()
}

function heart(ctx, cx, cy, s, fill) {
  ctx.save()
  ctx.translate(cx, cy)
  ctx.scale(s, s)
  ctx.beginPath()
  ctx.moveTo(0, 0.35)
  ctx.bezierCurveTo(-1.1, -0.35, -0.5, -1, 0, -0.45)
  ctx.bezierCurveTo(0.5, -1, 1.1, -0.35, 0, 0.35)
  ctx.fillStyle = fill
  ctx.fill()
  ctx.restore()
}

function dotsRing(ctx, cx, cy, r, count, size, fill) {
  ctx.fillStyle = fill
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2
    ctx.beginPath()
    ctx.arc(cx + r * Math.cos(a), cy + r * Math.sin(a), size, 0, Math.PI * 2)
    ctx.fill()
  }
}

function wave(ctx, x0, y0, x1, y1, amp, phase) {
  const len = Math.hypot(x1 - x0, y1 - y0)
  const dx = (x1 - x0) / len
  const dy = (y1 - y0) / len
  ctx.beginPath()
  for (let s = 0; s <= len; s += 2) {
    const o = Math.sin(s / 6 + phase) * amp
    const px = x0 + dx * s - dy * o
    const py = y0 + dy * s + dx * o
    if (s === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
  ctx.stroke()
}

function filigreeFrame(ctx, t, x, y, w, h) {
  ctx.save()
  const stroke = metal(ctx, t, x, y, x + w, y + h)
  ctx.strokeStyle = stroke
  ctx.lineWidth = 3
  ctx.strokeRect(x, y, w, h)
  ctx.lineWidth = 1.5
  ctx.strokeRect(x + 12, y + 12, w - 24, h - 24)

  ctx.lineWidth = 1.2
  ;[0, Math.PI].forEach((phase) => {
    wave(ctx, x + 26, y + 6, x + w - 26, y + 6, 3, phase)
    wave(ctx, x + 26, y + h - 6, x + w - 26, y + h - 6, 3, phase)
    wave(ctx, x + 6, y + 26, x + 6, y + h - 26, 3, phase)
    wave(ctx, x + w - 6, y + 26, x + w - 6, y + h - 26, 3, phase)
  })

  ;[
    [x, y, 1, 1],
    [x + w, y, -1, 1],
    [x, y + h, 1, -1],
    [x + w, y + h, -1, -1],
  ].forEach(([cx, cy, sx, sy]) => {
    ctx.save()
    ctx.translate(cx, cy)
    ctx.scale(sx, sy)
    ctx.lineWidth = 2
    ;[28, 40].forEach((r) => {
      ctx.beginPath()
      ctx.arc(0, 0, r, 0, Math.PI / 2)
      ctx.stroke()
    })
    flower(ctx, 21, 21, 14, 8, stroke, t.bg)
    ctx.fillStyle = stroke
    ctx.beginPath()
    ctx.arc(54, 7, 3, 0, Math.PI * 2)
    ctx.arc(7, 54, 3, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  })
  ctx.restore()
}

function divider(ctx, t, cx, y, w) {
  const stroke = metal(ctx, t, cx - w / 2, y, cx + w / 2, y)
  ctx.save()
  ctx.strokeStyle = stroke
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(cx - w / 2, y)
  ctx.lineTo(cx - 16, y)
  ctx.moveTo(cx + 16, y)
  ctx.lineTo(cx + w / 2, y)
  ctx.stroke()
  diamond(ctx, cx, y, 6, stroke)
  diamond(ctx, cx - 26, y, 3, stroke)
  diamond(ctx, cx + 26, y, 3, stroke)
  ctx.restore()
}

function vine(ctx, t, x0, x1, y, amp) {
  const stroke = metal(ctx, t, x0, y, x1, y)
  const period = 34
  ctx.save()
  ctx.strokeStyle = stroke
  ctx.lineWidth = 2
  ctx.beginPath()
  for (let x = x0; x <= x1; x += 4) {
    const yy = y + Math.sin((x - x0) / period) * amp
    if (x === x0) ctx.moveTo(x, yy)
    else ctx.lineTo(x, yy)
  }
  ctx.stroke()

  ctx.fillStyle = stroke
  for (let k = 0; ; k++) {
    const x = x0 + period * (Math.PI / 2 + k * Math.PI)
    if (x > x1) break
    const dir = k % 2 === 0 ? 1 : -1
    ctx.save()
    ctx.translate(x, y + dir * amp)
    ctx.rotate(dir === 1 ? Math.PI / 2 : -Math.PI / 2)
    ctx.beginPath()
    petalPath(ctx, 16)
    ctx.fill()
    ctx.restore()
  }
  for (let k = 0; ; k++) {
    const x = x0 + period * Math.PI * k
    if (x > x1) break
    if (k > 0) flower(ctx, x, y, 8, 6, stroke, t.bg)
  }
  ctx.restore()
}

// ---------- photographic backgrounds ----------

// crop: [x, y, w, h] as image fractions, chosen to avoid the printed product text and photo edges.
// The crop is scaled to the panel width and mirror-tiled down the panel. pan shifts the crop
// per panel so wide images look different on each face. filter boosts the photo's color depth.
const BENCHMARK_TREATMENTS = {
  thousand_wishes: {
    crop: [0.04, 0.64, 0.92, 0.36],
    filter: 'saturate(1.35) contrast(1.1) brightness(1.05)',
    tint: 0.18,
    veil: 0.3,
  },
  dream_bright: {
    crop: [0.04, 0, 0.92, 0.43],
    filter: 'saturate(1.4) contrast(1.12)',
    tint: 0.15,
    veil: 0.35,
  },
  into_the_night: {
    crop: [0.1, 0, 0.82, 0.8],
    filter: 'saturate(1.25) contrast(1.15) brightness(1.08)',
    tint: 0.12,
    veil: 0.2,
  },
  sweet_pea: {
    crop: [0.12, 0, 0.76, 0.53],
    filter: 'saturate(1.3) contrast(1.05) brightness(1.02)',
    tint: 0.15,
    veil: 0.55,
  },
  covered_in_roses: {
    crop: [0.02, 0, 0.94, 0.22],
    filter: 'saturate(1.35) contrast(1.15)',
    tint: 0.15,
    veil: 0.5,
  },
  white_flower: {
    crop: [0, 0, 1, 1],
    filter: 'saturate(1.15) contrast(1.05)',
    tint: 0.12,
    veil: 0.55,
  },
  champa_lotus: {
    crop: [0, 0, 1, 1],
    filter: 'saturate(1.4) contrast(1.08)',
    tint: 0.12,
    veil: 0.5,
  },
  sakura_branch: {
    crop: [0, 0, 0.32, 0.97],
    pan: 0.22,
    filter: 'saturate(1.3) contrast(1.05)',
    tint: 0.15,
    veil: 0.4,
  },
  // The iStock credit sits in the lower right, so keep the left 60% of the image.
  circular_gradient: {
    crop: [0, 0, 0.6, 1],
    filter: 'saturate(1.2) contrast(1.05)',
    tint: 0.12,
    veil: 0.3,
  },
  dots_in_spectrum: {
    crop: [0, 0, 0.6, 1],
    filter: 'saturate(1.2) contrast(1.05)',
    tint: 0.12,
    veil: 0.3,
  },
  // Stock-site marks run along the bottom edge.
  roses_are_forever: {
    crop: [0, 0, 1, 0.9],
    filter: 'saturate(1.25) contrast(1.1)',
    tint: 0.15,
    veil: 0.4,
  },
}

const DEFAULT_PHOTO_TREATMENT = {
  crop: [0, 0, 1, 1],
  filter: 'saturate(1.2) contrast(1.05)',
  tint: 0.15,
  veil: 0.4,
}

const photoImages = new Map()
const photoLoads = new Map()

// Resolves true once the style's photo is decoded and available to generateSleeveTexture.
export function loadBackgroundImage(key) {
  const src = benchmarkImages[key]
  if (!src) return Promise.resolve(false)
  if (photoImages.has(key)) return Promise.resolve(true)
  if (!photoLoads.has(key)) {
    photoLoads.set(
      key,
      new Promise((resolve) => {
        const img = new Image()
        img.onload = () => {
          photoImages.set(key, img)
          resolve(true)
        }
        img.onerror = () => {
          photoLoads.delete(key)
          resolve(false)
        }
        img.src = src
      }),
    )
  }
  return photoLoads.get(key)
}

function averageColor(canvas) {
  const w = 16
  const h = 32
  const small = document.createElement('canvas')
  small.width = w
  small.height = h
  const ctx = small.getContext('2d')
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(canvas, 0, 0, w, h)
  const { data } = ctx.getImageData(0, 0, w, h)
  const sum = [0, 0, 0]
  for (let i = 0; i < data.length; i += 4) for (let c = 0; c < 3; c++) sum[c] += data[i + c]
  return sum.map((v) => v / (w * h))
}

const photoCache = new Map()

// One panel of the sleeve background: the photo, color-graded, as a PANEL_W x PANEL_H canvas.
function photoLayer(key, primary, panel) {
  const img = photoImages.get(key)
  if (!img) return null
  const id = `${key}|${primary}|${panel}`
  if (photoCache.has(id)) return photoCache.get(id)

  const spec = Object.hasOwn(BENCHMARK_TREATMENTS, key) ? BENCHMARK_TREATMENTS[key] : DEFAULT_PHOTO_TREATMENT
  const canvas = document.createElement('canvas')
  canvas.width = PANEL_W
  canvas.height = PANEL_H
  const ctx = canvas.getContext('2d')
  ctx.imageSmoothingQuality = 'high'

  const [fx, fy, fw, fh] = spec.crop
  const sx = Math.min(fx + (spec.pan ?? 0) * panel, 1 - fw) * img.naturalWidth
  const sy = fy * img.naturalHeight
  const sw = fw * img.naturalWidth
  const sh = fh * img.naturalHeight
  const tileH = sh * (PANEL_W / sw)

  if (primary && 'filter' in ctx) ctx.filter = spec.filter
  for (let i = 0, y = 0; y < PANEL_H; i++, y += tileH) {
    ctx.save()
    if (i % 2) {
      ctx.translate(0, y + tileH)
      ctx.scale(1, -1)
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, PANEL_W, tileH)
    } else {
      ctx.drawImage(img, sx, sy, sw, sh, 0, y, PANEL_W, tileH)
    }
    ctx.restore()
  }
  if ('filter' in ctx) ctx.filter = 'none'

  if (primary) {
    // Overlay ties the photo to the chosen palette; multiply deepens the hues toward the bottom.
    ctx.globalCompositeOperation = 'overlay'
    ctx.globalAlpha = spec.tint
    ctx.fillStyle = primary
    ctx.fillRect(0, 0, PANEL_W, PANEL_H)
    ctx.globalCompositeOperation = 'multiply'
    ctx.globalAlpha = 1
    const depth = ctx.createLinearGradient(0, 0, 0, PANEL_H)
    depth.addColorStop(0, '#FFFFFF')
    depth.addColorStop(0.6, '#E4E4E4')
    depth.addColorStop(1, '#A8A8A8')
    ctx.fillStyle = depth
    ctx.fillRect(0, 0, PANEL_W, PANEL_H)
    ctx.globalCompositeOperation = 'source-over'
    // Overlay alone cannot tint the black or white parts of a photograph.
    ctx.globalAlpha = 0.4
    ctx.fillStyle = primary
    ctx.fillRect(0, 0, PANEL_W, PANEL_H)
    ctx.globalAlpha = 1
  }

  const layer = { canvas, avg: averageColor(canvas), veil: spec.veil, original: !primary }
  if (photoCache.size >= 48) photoCache.delete(photoCache.keys().next().value)
  photoCache.set(id, layer)
  return layer
}

export function getBackgroundDesign(key) {
  const photo = photoLayer(key, null, 0)
  if (!photo) throw new Error(`Background image is not loaded: ${key}`)
  const canvas = document.createElement('canvas')
  canvas.width = 24
  canvas.height = 32
  const ctx = canvas.getContext('2d')
  ctx.drawImage(photo.canvas, 48, 240, PANEL_W - 96, 540, 0, 0, canvas.width, canvas.height)
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const samples = []
  for (let i = 0; i < data.length; i += 4) samples.push([data[i], data[i + 1], data[i + 2]])
  return { ...chooseStyleDesign(samples), primary: rgbToHex(photo.avg) }
}

function medallion(ctx, t, cx, cy, r, emoji) {
  const stroke = metal(ctx, t, cx - r, cy - r, cx + r, cy + r)
  ctx.save()
  ctx.fillStyle = t.light
  ctx.globalAlpha = 0.95
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 1
  ctx.strokeStyle = stroke
  ctx.lineWidth = 5
  ctx.stroke()
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.arc(cx, cy, r - 8, 0, Math.PI * 2)
  ctx.stroke()
  dotsRing(ctx, cx, cy, r + 11, 28, 2.5, stroke)
  ctx.font = `${Math.round(r * 1.1)}px ${EMOJI}`
  ctx.textAlign = 'center'
  ctx.fillText(emoji, cx, cy + 3)
  ctx.restore()
}

function shoulderMedallion(ctx, t, cx, cy, r, emoji) {
  const size = Math.ceil((r + 16) * 2)
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const drawing = canvas.getContext('2d')
  drawing.textBaseline = 'middle'
  medallion(drawing, t, size / 2, size / 2, r, emoji)
  const top = cy - size / 2
  for (let row = 0; row < size; row++) {
    const { breakpoint, mapOffset } = frontTextureMapping(top + row + 0.5, PANEL_W, PANEL_H)
    const middle = size / 2
    const points = [0, Math.max(0, middle - breakpoint), middle, Math.min(size, middle + breakpoint), size]
    for (let i = 0; i < points.length - 1; i++) {
      const start = points[i]
      const end = points[i + 1]
      if (end <= start) continue
      const x = cx + mapOffset(start - middle)
      const width = mapOffset(end - middle) - mapOffset(start - middle)
      ctx.drawImage(canvas, start, row, end - start, 1, x, top + row, width, 1)
    }
  }
}

function badge(ctx, t, cx, cy, r, tagline) {
  const words = tagline.trim().split(/\s+/).filter(Boolean)
  const mid = words.length > 1 ? Math.ceil(words.length / 2) : 0
  const top = spaced(words.slice(0, mid).join(' ').toUpperCase())
  const bottom = words.slice(mid).join(' ')
  ctx.save()
  ctx.font = serif(14, 'bold')
  const topWidth = ctx.measureText(top).width
  ctx.font = script(28)
  const bottomWidth = ctx.measureText(bottom).width
  if (topWidth > 104 || bottomWidth > 104) {
    const halfWidth = 180
    const halfHeight = 42
    ctx.fillStyle = t.plate
    ctx.beginPath()
    ctx.moveTo(cx - halfWidth, cy - halfHeight)
    ctx.lineTo(cx + halfWidth, cy - halfHeight)
    ctx.lineTo(cx + halfWidth - 18, cy)
    ctx.lineTo(cx + halfWidth, cy + halfHeight)
    ctx.lineTo(cx - halfWidth, cy + halfHeight)
    ctx.lineTo(cx - halfWidth + 18, cy)
    ctx.closePath()
    ctx.fill()
    ctx.strokeStyle = t.ink
    ctx.lineWidth = 2
    ctx.stroke()
    let size = 26
    let lines
    do {
      ctx.font = serif(size, 'italic')
      lines = wrapLines(ctx, tagline.trim(), 290)
      if (lines.length <= 2 && lines.every((line) => ctx.measureText(line).width <= 290)) break
      size -= 2
    } while (size > 8)
    lines.forEach((line, i) => {
      const font = fitFont(ctx, line, (s) => serif(s, 'italic'), 290, size, 6)
      text(ctx, line, cx, cy + (i - (lines.length - 1) / 2) * 29, font, t.ink)
    })
    ctx.restore()
    return
  }
  ctx.fillStyle = t.plate
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = t.ink
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(cx, cy, r - 8, 0, Math.PI * 2)
  ctx.stroke()
  dotsRing(ctx, cx, cy, r - 15, 30, 1.8, t.ink)
  if (top) text(ctx, top, cx, cy - 18, fitFont(ctx, top, (s) => serif(s, 'bold'), 104, 17, 9), t.ink)
  text(ctx, bottom, cx, top ? cy + 14 : cy, fitFont(ctx, bottom, script, 104, 46, 18), t.ink)
  heart(ctx, cx, cy + 44, 9, t.ink)
  ctx.restore()
}

function monogram(ctx, t, cx, cy, r, letters) {
  ctx.save()
  ctx.fillStyle = metal(ctx, t, cx - r, cy - r, cx + r, cy + r)
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = t.badgeText
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.arc(cx, cy, r - 5, 0, Math.PI * 2)
  ctx.stroke()
  text(ctx, letters, cx, cy + 2, serif(Math.round(r * 0.8), 'bold'), t.ink)
  ctx.restore()
}

function card(ctx, t, x, y, w, h, fill = t.light, opacity = 0.95) {
  ctx.save()
  ctx.fillStyle = fill
  ctx.globalAlpha = opacity
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, 18)
  ctx.fill()
  ctx.globalAlpha = 1
  ctx.strokeStyle = metal(ctx, t, x, y, x + w, y + h)
  ctx.lineWidth = 2.5
  ctx.stroke()
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.roundRect(x + 7, y + 7, w - 14, h - 14, 12)
  ctx.stroke()
  ctx.restore()
}

function cameraIcon(ctx, t, cx, cy, w, h) {
  const stroke = metal(ctx, t, cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2)
  ctx.save()
  ctx.strokeStyle = stroke
  ctx.fillStyle = stroke
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.roundRect(cx - w / 2, cy - h / 2, w, h, 16)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(cx, cy, h * 0.27, 0, Math.PI * 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(cx + w * 0.3, cy - h * 0.28, 3.5, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function drawQr(ctx, url, x, y, size) {
  const qr = QRCode.create(url, { errorCorrectionLevel: 'M' })
  const n = qr.modules.size
  const cell = Math.floor(size / n)
  const offset = (size - cell * n) / 2
  ctx.fillStyle = '#111111'
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (qr.modules.get(r, c)) ctx.fillRect(x + offset + c * cell, y + offset + r * cell, cell, cell)
    }
  }
}

function barcode(ctx, x, y, w, h) {
  const rand = rng(42)
  ctx.fillStyle = '#111111'
  let cx = x
  while (cx < x + w) {
    const bar = 1 + Math.floor(rand() * 3)
    if (cx + bar > x + w) break
    ctx.fillRect(cx, y, bar, h)
    cx += bar + 1 + Math.floor(rand() * 3)
  }
}

// ---------- panels ----------

function panelBase(ctx, t, photo, banner) {
  const g = ctx.createLinearGradient(0, 0, 0, PANEL_H)
  g.addColorStop(0, shade(t.bg, 0.12))
  g.addColorStop(0.5, t.bg)
  g.addColorStop(1, shade(t.bg, -0.18))
  ctx.globalAlpha = BG_ALPHA
  ctx.fillStyle = g
  ctx.fillRect(0, 0, PANEL_W, PANEL_H)

  if (photo) {
    ctx.drawImage(photo.canvas, 0, 0)
    ctx.globalAlpha = 1
    if (!photo.original) {
      // Veil calms busy areas so the printed text stays readable.
      const n = parseInt(t.bg.slice(1), 16)
      const rgb = `${n >> 16},${(n >> 8) & 255},${n & 255}`
      const veil = ctx.createLinearGradient(0, 0, 0, PANEL_H)
      veil.addColorStop(0, `rgba(${rgb},0.05)`)
      veil.addColorStop(0.18, `rgba(${rgb},${photo.veil})`)
      veil.addColorStop(0.85, `rgba(${rgb},${photo.veil})`)
      veil.addColorStop(1, `rgba(${rgb},0.1)`)
      ctx.fillStyle = veil
      ctx.fillRect(0, 0, PANEL_W, PANEL_H)
    }
  } else {
    ctx.globalAlpha = 1
    const glow = ctx.createRadialGradient(256, 320, 20, 256, 320, 380)
    glow.addColorStop(0, 'rgba(255,255,255,0.16)')
    glow.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = glow
    ctx.fillRect(0, 0, PANEL_W, PANEL_H)
  }

  if (banner) drawBanner(ctx, banner)
  filigreeFrame(ctx, t, 36, 36, PANEL_W - 72, PANEL_H - 72)
}

// Middle layer of the photo / banner / text sandwich; the text is drawn after it.
function drawBanner(ctx, { style, color, opacity }) {
  const cx = PANEL_W / 2
  const cy = BANNER_CENTER_Y
  ctx.save()
  ctx.globalAlpha = opacity
  ctx.fillStyle = color
  ctx.beginPath()
  if (style === 'strip') ctx.rect(36, cy - 146, PANEL_W - 72, 292)
  else if (style === 'card') ctx.roundRect(56, cy - 146, PANEL_W - 112, 292, 22)
  else ctx.ellipse(cx, cy, 214, 166, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function heroPanel(ctx, t, o) {
  const cx = PANEL_W / 2
  const icon = GUEST_ICONS.find((i) => i.id === o.guestIcon) ?? GUEST_ICONS[0]

  shoulderMedallion(ctx, t, cx, 128, 56, icon.emoji)
  text(ctx, spaced(icon.label.toUpperCase()), cx, 208, serif(15, 'bold'), t.ink)
  divider(ctx, t, cx, 236, 240)

  const bride = (o.brideName || 'Bride').toUpperCase()
  const groom = (o.groomName || 'Groom').toUpperCase()
  const nameFace = (size) => `900 ${size}px "Playfair Display",Georgia,"Times New Roman",serif`
  const maxNameSize = 68
  const nameFont = (name) => fitFont(ctx, name, nameFace, BANNER_NAME_WIDTH[o.bannerStyle] ?? 330, maxNameSize, 6)
  const brideFont = nameFont(bride)
  const groomFont = nameFont(groom)
  const wedFont = serif(32, 'bold')
  const date = spaced(formatDate(o.weddingDate).toUpperCase())
  const dateFont = fitFont(ctx, date, (s) => serif(s, 'bold'), BANNER_NAME_WIDTH[o.bannerStyle] ?? 330, 26, 14)
  text(ctx, bride, cx, 322, brideFont, t.ink, 'center', true)
  text(ctx, 'WED', cx, 394, wedFont, t.ink)
  text(ctx, groom, cx, 468, groomFont, t.ink, 'center', true)
  if (date) text(ctx, date, cx, 540, dateFont, t.ink)

  badge(ctx, t, cx, 660, 78, o.tagline)

  const gratitudeFont = script(40)
  paragraph(
    ctx,
    o.thankYouNote || 'Thank you for celebrating with us. Your love and blessings made our day unforgettable.',
    cx,
    836,
    350,
    28,
    4,
    serif(22, 'italic'),
    t.ink,
    'center',
  )
  text(ctx, 'With Gratitude', cx, 790, gratitudeFont, t.ink)
  vine(ctx, t, 70, PANEL_W - 70, 944, 6)
}

function storyPanel(ctx, t, o) {
  const cx = PANEL_W / 2
  text(ctx, 'Our Story', cx, 120, fitFont(ctx, 'Our Story', script, 380, 76), t.ink)
  text(ctx, spaced('HOW WE MET'), cx, 182, serif(18, 'bold'), t.ink)
  divider(ctx, t, cx, 208, 240)

  const storyFont = serif(24, 'italic')
  const story = o.story || 'Our paths crossed when we least expected it, and from that day on we knew.'
  ctx.font = storyFont
  const lineCount = Math.min(wrapLines(ctx, story, 332).length, 9)
  const cardH = Math.max(150, lineCount * 32 + 76)
  const cardY = 236 + (340 - cardH) / 2
  card(ctx, t, 62, cardY, 388, cardH, t.line, 1)
  paragraph(ctx, story, cx, cardY + (cardH - lineCount * 32) / 2 + 16, 332, 32, 9, storyFont, t.ink)

  text(ctx, 'Our Journey', cx, 634, script(48), t.ink)

  const nodes = [
    ['First Met', formatDate(o.firstMetDate, 'short')],
    ['Proposal', formatDate(o.proposalDate, 'short')],
    ['Wedding Day', formatDate(o.weddingDate, 'short')],
    ['Happily Married', 'Forever'],
  ]
  const stroke = metal(ctx, t, 0, 700, 0, 900)
  ctx.save()
  ctx.strokeStyle = stroke
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(112, 708)
  ctx.lineTo(112, 900)
  ctx.stroke()
  nodes.forEach(([label, date], i) => {
    const y = 708 + i * 64
    ctx.fillStyle = stroke
    ctx.beginPath()
    ctx.arc(112, y, 13, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = t.bg
    ctx.beginPath()
    ctx.arc(112, y, 5, 0, Math.PI * 2)
    ctx.fill()
    text(ctx, spaced(label.toUpperCase()), 142, y - 11, serif(20, 'bold'), t.ink, 'left')
    if (date) text(ctx, date, 142, y + 15, serif(22, 'italic'), t.ink, 'left')
  })
  ctx.restore()
  vine(ctx, t, 70, PANEL_W - 70, 944, 6)
}

function crewPanel(ctx, t, o) {
  const cx = PANEL_W / 2
  text(ctx, 'VIP Crew', cx, 116, fitFont(ctx, 'VIP Crew', script, 380, 76), t.ink)
  text(ctx, spaced('THE BRIDE SQUAD'), cx, 176, serif(18, 'bold'), t.ink)
  divider(ctx, t, cx, 202, 240)

  const names = o.vipCrew.split(/[\n,]+/).map((n) => n.trim()).filter(Boolean).slice(0, 8)
  const stroke = metal(ctx, t, 0, 240, 0, 500)
  names.forEach((name, i) => {
    const y = 244 + i * 34
    const font = fitFont(ctx, name, (s) => serif(s, 'bold'), 300, 26, 14)
    text(ctx, name, cx, y, font, t.ink)
    const half = ctx.measureText(name).width / 2
    diamond(ctx, cx - half - 16, y, 4, stroke)
    diamond(ctx, cx + half + 16, y, 4, stroke)
  })

  cameraIcon(ctx, t, cx, 548, 66, 52)
  text(ctx, spaced('SNAP & TAG'), cx, 606, serif(22, 'bold'), t.ink)
  const handle = o.handle || '@ShadiBottle'
  const hashtag = o.hashtag || '#WeddingHashtag'
  text(ctx, handle, cx, 640, fitFont(ctx, handle, (s) => serif(s, 'bold'), 360, 30, 16), t.ink)
  text(ctx, hashtag, cx, 674, fitFont(ctx, hashtag, (s) => serif(s, 'bold'), 360, 30, 16), t.ink)

  card(ctx, t, 156, 704, 200, 200)
  const qrUrl = `https://www.instagram.com/${handle.replace(/^@/, '').trim()}/`
  drawQr(ctx, qrUrl, 172, 720, 168)
  text(ctx, spaced('SCAN FOR SELFIE FILTER'), cx, 936, serif(14, 'bold'), t.ink)
}

function regulatoryPanel(ctx, t, o) {
  const cx = PANEL_W / 2
  const title = spaced('PURIFIED DRINKING WATER')
  text(ctx, title, cx, 112, fitFont(ctx, title, (s) => serif(s, 'bold'), 340, 22, 12), t.ink)
  text(ctx, spaced('NET VOLUME'), cx, 150, serif(16, 'bold'), t.ink)
  text(ctx, '500 ml', cx, 205, serif(76, 'bold'), t.ink)
  text(ctx, '(16.9 fl oz)', cx, 252, serif(22, 'italic'), t.ink)
  divider(ctx, t, cx, 282, 240)

  text(ctx, spaced('WATER ANALYSIS (mg/L)'), cx, 316, serif(16, 'bold'), t.ink)
  ctx.save()
  ctx.strokeStyle = t.line
  ctx.lineWidth = 1
  ctx.setLineDash([2, 5])
  WATER_SPECS.forEach(([label, value], i) => {
    const y = 352 + i * 32
    text(ctx, label, 72, y, serif(22), t.ink, 'left')
    const labelW = ctx.measureText(label).width
    text(ctx, value, 440, y, serif(22, 'bold'), t.ink, 'right')
    const valueW = ctx.measureText(value).width
    ctx.beginPath()
    ctx.moveTo(72 + labelW + 8, y + 8)
    ctx.lineTo(440 - valueW - 8, y + 8)
    ctx.stroke()
  })
  ctx.restore()

  ctx.fillStyle = '#FFFFFF'
  ctx.beginPath()
  ctx.roundRect(126, 590, 260, 108, 8)
  ctx.fill()
  barcode(ctx, 146, 602, 220, 62)
  text(ctx, '0 12345 67890 5', cx, 680, '16px ui-monospace, Menlo, monospace', '#111111')

  divider(ctx, t, cx, 734, 240)
  monogram(ctx, t, 112, 800, 30, 'SB')
  text(ctx, spaced('POWERED BY'), 300, 780, serif(15, 'bold'), t.ink)
  text(ctx, 'Shadi Bottle', 300, 818, fitFont(ctx, 'Shadi Bottle', script, 230, 46, 24), t.ink)

  const reseller = o.resellerName || 'Your Event Planner'
  const initials = reseller.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('')
  monogram(ctx, t, 112, 900, 30, initials)
  text(ctx, spaced('IN PARTNERSHIP WITH'), 300, 872, fitFont(ctx, spaced('IN PARTNERSHIP WITH'), (s) => serif(s, 'bold'), 230, 15, 10), t.ink)
  text(ctx, reseller, 300, 906, fitFont(ctx, reseller, (s) => serif(s, 'bold'), 230, 28, 14), t.ink)
  if (o.resellerContact) {
    text(ctx, o.resellerContact, 300, 938, fitFont(ctx, o.resellerContact, (s) => serif(s, 'italic'), 230, 20, 12), t.ink)
  }
}

// ---------- public API ----------

// Returns the sleeve canvas and an estimated text contrast warning.
export function generateSleevePreview(options = {}) {
  const o = { ...DEFAULTS, ...options }
  const primary = validHex(o.primary, DEFAULTS.primary)
  const photos = [0, 1, 2, 3].map((i) => photoLayer(o.background, o.useOriginalBackground ? null : primary, i))
  const hasPhotos = photos.every(Boolean)
  // With a photo, legibility is computed against the photo's average color instead of the palette primary.
  const avg = hasPhotos ? [0, 1, 2].map((c) => photos.reduce((sum, p) => sum + p.avg[c], 0) / photos.length) : null
  const t = deriveTheme({
    primary: avg ? rgbToHex(avg) : primary,
    accent: validHex(o.accent, DEFAULTS.accent),
    textColor: validHex(o.textColor, DEFAULTS.textColor),
  })
  const finish = o.frontFinish === 'auto' ? o.autoFrontFinish : o.frontFinish
  if (!Object.hasOwn(FRONT_FINISHES, finish)) throw new Error(`Unknown front text finish: ${finish}`)
  if (!BANNER_STYLES.some(({ id }) => id === o.bannerStyle)) throw new Error(`Unknown banner style: ${o.bannerStyle}`)
  const bannerOpacity = Number.isFinite(Number(o.bannerOpacity)) ? Math.min(1, Math.max(0, Number(o.bannerOpacity))) : DEFAULTS.bannerOpacity
  const banner = o.bannerStyle === 'none'
    ? null
    : { style: o.bannerStyle, color: validHex(o.bannerColor, DEFAULTS.bannerColor), opacity: bannerOpacity }
  const finishStyle = FRONT_FINISHES[finish]
  const frontTheme = {
    ...t,
    finish,
    ink: finishStyle.ink,
    line: finishStyle.ink,
    plate: primary,
  }
  const canvas = document.createElement('canvas')
  canvas.width = PANEL_W * PANEL_COUNT
  canvas.height = PANEL_H
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  const metalCanvas = document.createElement('canvas')
  metalCanvas.width = canvas.width
  metalCanvas.height = canvas.height
  const metalMask = metalCanvas.getContext('2d')
  metalMask.fillStyle = '#000000'
  metalMask.fillRect(0, 0, metalCanvas.width, metalCanvas.height)
  const roughnessCanvas = document.createElement('canvas')
  roughnessCanvas.width = canvas.width
  roughnessCanvas.height = canvas.height
  const roughnessMask = roughnessCanvas.getContext('2d')
  roughnessMask.fillStyle = '#ffffff'
  roughnessMask.fillRect(0, 0, roughnessCanvas.width, roughnessCanvas.height)
  const bumpCanvas = document.createElement('canvas')
  bumpCanvas.width = canvas.width
  bumpCanvas.height = canvas.height
  const bumpMask = bumpCanvas.getContext('2d')
  bumpMask.fillStyle = '#000000'
  bumpMask.fillRect(0, 0, bumpCanvas.width, bumpCanvas.height)
  const check = { color: t.ink, lowContrast: false, metalMask, roughnessMask, bumpMask }
  contrastChecks.set(ctx, check)

  try {
    ;[heroPanel, storyPanel, crewPanel, regulatoryPanel].forEach((draw, i) => {
      ctx.save()
      ctx.beginPath()
      ctx.rect(i * PANEL_W, 0, PANEL_W, PANEL_H)
      ctx.clip()
      ctx.translate(i * PANEL_W, 0)
      ctx.textBaseline = 'middle'
      const panelTheme = i === 0 ? frontTheme : t
      check.color = panelTheme.ink
      check.finish = i === 0 ? panelTheme.finish : null
      panelBase(ctx, panelTheme, photos[i], i === 0 ? banner : null)
      draw(ctx, panelTheme, o)
      ctx.restore()
    })
  } finally {
    contrastChecks.delete(ctx)
  }
  const foilColor = finishStyle.emission
  return { canvas, metalCanvas, roughnessCanvas, bumpCanvas, foilColor, lowContrast: check.lowContrast }
}

// Returns a 2048x1024 canvas: Front | Right | Left | Back panels, 512px each.
export function generateSleeveTexture(options = {}) {
  return generateSleevePreview(options).canvas
}

function drawWrapped(ctx, size, x, y, reach, draw) {
  for (const dx of [-size, 0, size]) {
    for (const dy of [-size, 0, size]) {
      const px = x + dx
      const py = y + dy
      if (px + reach < 0 || px - reach > size || py + reach < 0 || py - reach > size) continue
      ctx.save()
      ctx.translate(px, py)
      draw()
      ctx.restore()
    }
  }
}

// Seamlessly tileable water layer: rose petals, jasmine buds and gold shimmer on a faint tint.
export function generateInnerPetalTexture({ size = 1024, seed = 11 } = {}) {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  const rand = rng(seed)

  ctx.fillStyle = 'rgba(255, 214, 224, 0.14)'
  ctx.fillRect(0, 0, size, size)

  const wrapped = (x, y, reach, draw) => drawWrapped(ctx, size, x, y, reach, draw)

  for (let i = 0; i < 7; i++) {
    const r = 120 + rand() * 120
    wrapped(rand() * size, rand() * size, r, () => {
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r)
      g.addColorStop(0, 'rgba(255,255,255,0.10)')
      g.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(0, 0, r, 0, Math.PI * 2)
      ctx.fill()
    })
  }

  for (let i = 0; i < 46; i++) {
    const L = 34 + rand() * 36
    const W = L * 0.42
    const angle = rand() * Math.PI * 2
    wrapped(rand() * size, rand() * size, L, () => {
      ctx.rotate(angle)
      const g = ctx.createRadialGradient(0, -L * 0.15, 2, 0, 0, L * 0.7)
      g.addColorStop(0, '#E0455E')
      g.addColorStop(0.6, '#B01530')
      g.addColorStop(1, '#7A0A1F')
      ctx.globalAlpha = 0.92
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.moveTo(0, L / 2)
      ctx.bezierCurveTo(W * 0.95, L * 0.25, W * 0.75, -L * 0.55, W * 0.12, -L * 0.5)
      ctx.quadraticCurveTo(0, -L * 0.44, -W * 0.12, -L * 0.5)
      ctx.bezierCurveTo(-W * 0.75, -L * 0.55, -W * 0.95, L * 0.25, 0, L / 2)
      ctx.fill()
      ctx.strokeStyle = 'rgba(255,200,205,0.28)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(0, L / 2)
      ctx.lineTo(0, -L * 0.3)
      ctx.stroke()
    })
  }

  for (let i = 0; i < 34; i++) {
    const L = 18 + rand() * 12
    const W = 6 + rand() * 3
    const angle = rand() * Math.PI * 2
    wrapped(rand() * size, rand() * size, L, () => {
      ctx.rotate(angle)
      ctx.shadowColor = 'rgba(255,255,255,0.7)'
      ctx.shadowBlur = 6
      const g = ctx.createLinearGradient(0, -L / 2, 0, L / 2)
      g.addColorStop(0, '#FFFFFF')
      g.addColorStop(1, '#F3E6C8')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.moveTo(0, -L / 2)
      ctx.bezierCurveTo(W, -L * 0.2, W * 0.8, L * 0.35, 0, L / 2)
      ctx.bezierCurveTo(-W * 0.8, L * 0.35, -W, -L * 0.2, 0, -L / 2)
      ctx.fill()
      ctx.shadowBlur = 0
      ctx.fillStyle = '#7BA05B'
      ctx.beginPath()
      ctx.ellipse(0, L / 2, 2.2, 3.2, 0, 0, Math.PI * 2)
      ctx.fill()
    })
  }

  for (let i = 0; i < 220; i++) {
    const r = 1.5 + rand() * 3.5
    const sparkle = rand() < 0.2
    wrapped(rand() * size, rand() * size, r * 4, () => {
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r)
      g.addColorStop(0, 'rgba(255,228,140,0.95)')
      g.addColorStop(1, 'rgba(255,228,140,0)')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(0, 0, r, 0, Math.PI * 2)
      ctx.fill()
      if (sparkle) {
        ctx.strokeStyle = 'rgba(255,240,180,0.8)'
        ctx.lineWidth = 0.8
        ctx.beginPath()
        ctx.moveTo(-r * 3, 0)
        ctx.lineTo(r * 3, 0)
        ctx.moveTo(0, -r * 3)
        ctx.lineTo(0, r * 3)
        ctx.stroke()
      }
    })
  }

  return canvas
}

// A transparent, tileable layer of gold and ivory stardust inside the water.
export function generateInnerStardustTexture({ size = 1024, seed = 23 } = {}) {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  const rand = rng(seed)

  ctx.fillStyle = 'rgba(255, 242, 205, 0.08)'
  ctx.fillRect(0, 0, size, size)
  for (let i = 0; i < 360; i++) {
    const r = i < 50 ? 7 + rand() * 5 : 2 + rand() * 3
    const star = i < 50
    drawWrapped(ctx, size, rand() * size, rand() * size, r * 3, () => {
      const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 2)
      glow.addColorStop(0, 'rgba(255,250,215,0.98)')
      glow.addColorStop(0.35, 'rgba(180,126,30,0.9)')
      glow.addColorStop(1, 'rgba(180,126,30,0)')
      ctx.fillStyle = glow
      ctx.beginPath()
      ctx.arc(0, 0, r * 2, 0, Math.PI * 2)
      ctx.fill()
      if (star) {
        ctx.strokeStyle = 'rgba(170,116,24,0.9)'
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.moveTo(-r * 2.5, 0)
        ctx.lineTo(r * 2.5, 0)
        ctx.moveTo(0, -r * 2.5)
        ctx.lineTo(0, r * 2.5)
        ctx.stroke()
      }
    })
  }
  return canvas
}
