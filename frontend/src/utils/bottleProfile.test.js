import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import {
  CORNER_SEGMENTS,
  SLEEVE_BOTTOM,
  SLEEVE_GAP,
  SLEEVE_PROFILE,
  SLEEVE_TOP,
  UV_INSET,
  frontTextureMapping,
  ringPoints,
} from './bottleProfile.js'

const PANEL_W = 512
const PANEL_H = 1024
const usableWidth = PANEL_W * (1 - 8 * UV_INSET)
const cmPerPixel = (SLEEVE_TOP - SLEEVE_BOTTOM) / PANEL_H

function frontVertex(profile) {
  const ring = ringPoints(profile.hw + SLEEVE_GAP, profile.r + SLEEVE_GAP)
  const half = CORNER_SEGMENTS / 2
  const face = [...ring.slice(half, CORNER_SEGMENTS + 1), ...ring.slice(CORNER_SEGMENTS + 1, CORNER_SEGMENTS + half + 2)]
  const length = face.slice(1).reduce((sum, point, i) => sum + Math.hypot(point[0] - face[i][0], point[1] - face[i][1]), 0)
  return { x: face[half][0], u: face[half][0] / length }
}

function projectedOffset(canvasY, textureOffset) {
  const y = SLEEVE_TOP - canvasY * cmPerPixel
  const row = SLEEVE_PROFILE.findIndex((point, i) => i > 0 && y <= point.y) - 1
  const lower = SLEEVE_PROFILE[row]
  const upper = SLEEVE_PROFILE[row + 1]
  const a = frontVertex(lower)
  const b = frontVertex(upper)
  const mix = (y - lower.y) / (upper.y - lower.y)
  const u = Math.abs(textureOffset) / usableWidth
  const boundary = (1 - mix) * a.u
  const edge = boundary + mix * b.u
  const x = u <= boundary
    ? u * a.x / a.u
    : (1 - mix) * a.x + (u - boundary) * mix * b.x / (edge - boundary)
  return Math.sign(textureOffset) * x
}

test('front artwork maps to equal physical horizontal and vertical distances on both shoulder sections', () => {
  for (const canvasY of [72, 128, 180]) {
    const { mapOffset } = frontTextureMapping(canvasY, PANEL_W, PANEL_H)
    for (const offset of [-45, -15, 15, 45]) {
      assert.ok(Math.abs(projectedOffset(canvasY, mapOffset(offset)) - offset * cmPerPixel) < 1e-9)
    }
  }
})

test('front artwork remains centered and continuous at the mesh diagonal', () => {
  const { breakpoint, mapOffset } = frontTextureMapping(128, PANEL_W, PANEL_H)
  assert.equal(mapOffset(0), 0)
  assert.equal(mapOffset(-breakpoint), -mapOffset(breakpoint))
  assert.ok(Math.abs(mapOffset(breakpoint + 1e-6) - mapOffset(breakpoint - 1e-6)) < 1e-4)
})
