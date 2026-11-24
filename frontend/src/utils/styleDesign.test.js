import test from 'node:test'
import assert from 'node:assert/strict'
import { bannerColorOptions, chooseStyleDesign, contrast, defaultBannerColor, extractPalette } from './styleDesign.js'

test('coordinates readable colors with dark and light photographs', () => {
  const dark = chooseStyleDesign([[15, 30, 65], [28, 40, 80], [25, 35, 75]])
  const light = chooseStyleDesign([[240, 228, 220], [250, 235, 230], [235, 215, 210]])
  assert.equal(dark.textColor, '#FFF9F0')
  assert.equal(light.textColor, '#211A25')
  assert.ok(contrast(dark.accent, dark.textColor) >= 4.5)
  assert.ok(contrast(light.accent, light.textColor) >= 4.5)
  assert.notEqual(dark.accent, light.accent)
})

test('uses the sampled texture colors to choose a foil and front finish', () => {
  const blue = chooseStyleDesign([[20, 35, 80], [25, 40, 85]])
  const green = chooseStyleDesign([[20, 60, 30], [25, 70, 35]])
  assert.notEqual(blue.accent, green.accent)
  assert.equal(blue.frontFinish, 'silver')
  assert.equal(green.frontFinish, 'gold')
})

test('rejects empty image samples', () => {
  assert.throws(() => chooseStyleDesign([]), /without image samples/)
})


test('extracts distinct dominant photo colors and skips near black and white', () => {
  const samples = [
    ...Array(40).fill([180, 30, 40]),
    ...Array(30).fill([185, 35, 45]),
    ...Array(25).fill([30, 80, 160]),
    ...Array(20).fill([230, 190, 60]),
    ...Array(60).fill([2, 2, 2]),
    ...Array(60).fill([254, 254, 254]),
  ]
  const palette = extractPalette(samples)
  assert.equal(palette.length, 3)
  assert.equal(new Set(palette).size, 3)
  assert.ok(!palette.includes('#000000') && !palette.includes('#ffffff'))
  assert.equal(bannerColorOptions(palette).length, 5)
  assert.equal(chooseStyleDesign(samples).palette.length, 3)
})

test('falls back to the average color for a near-monochrome photograph', () => {
  assert.equal(extractPalette([[2, 2, 2], [4, 4, 4]]).length, 1)
})

test('defaults the banner to a dark photo color, otherwise black', () => {
  assert.equal(defaultBannerColor(['#E8C879', '#2A3F6B']), '#2A3F6B')
  assert.equal(defaultBannerColor(['#E8C879', '#CEDCE8']), '#000000')
})
