import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import BottleCanvas from './components/BottleCanvas'
import {
  BACKGROUND_STYLES,
  BANNER_STYLES,
  FONT_LOADS,
  FRONT_FINISHES,
  GUEST_ICONS,
  PALETTE_PRESETS,
  generateSleevePreview,
  getBackgroundDesign,
  loadBackgroundImage,
} from './utils/sleeveTexture'
import { bannerColorOptions, defaultBannerColor } from './utils/styleDesign'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'
const API_URL = new URL('api/generate-sleeve', `${API_BASE_URL.replace(/\/+$/, '')}/`).href

const VIEWS = [
  { id: 'front', label: 'Front (Hero)', angle: 0 },
  { id: 'right', label: 'Right (Story)', angle: Math.PI / 2 },
  { id: 'back', label: 'Back (Specs)', angle: Math.PI },
  { id: 'left', label: 'Left (VIP Squad)', angle: -Math.PI / 2 },
]

const INITIAL_FORM = {
  groomName: 'Bablu',
  brideName: 'Sonya',
  frontFinish: 'gold',
  autoFrontFinish: 'gold',
  weddingDate: '2026-12-12',
  tagline: 'I Believe in Love',
  primary: '#0A3B2A',
  accent: '#D4AF37',
  textColor: '#F9F6EE',
  background: 'thousand_wishes',
  useOriginalBackground: true,
  autoAccent: true,
  autoTextColor: true,
  bannerStyle: 'strip',
  bannerColor: '#000000',
  autoBannerColor: true,
  bannerOpacity: 0.5,
  bannerPalette: [],
  innerEffect: 'rose_petals',
  guestIcon: 'rose',
  thankYouNote: 'Thank you for sharing in our joy and making our special day complete.',
  story: 'We met at a friend\u2019s mehndi in Karachi, shared a cup of chai, and never ran out of things to talk about.',
  firstMetDate: '2023-02-14',
  proposalDate: '2025-08-03',
  vipCrew: 'Sara\nMaham\nHina\nZoya\nFatima',
  hashtag: '#SonyaWedsBablu',
  handle: '@ShadiBottle',
  resellerName: 'Rajput Caterers & Events',
  resellerContact: 'Karachi | 0300-1234567',
}

// The backend still suggests one of three named looks; map each to a preset.
const SUGGESTED_PRESET = { ruby: 'baraat', emerald: 'nikkah', rose: 'valima' }
const PRESET_THEME = { baraat: 'ruby', nikkah: 'emerald', valima: 'rose' }

function Field({ label, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  )
}

function ColorField({ label, hint, value, onChange }) {
  return (
    <label className="field color-field">
      <span>{label}</span>
      <div className="color-row">
        <input type="color" value={value} onChange={onChange} />
        <code>{value.toUpperCase()}</code>
      </div>
      {hint && <small className="hint">{hint}</small>}
    </label>
  )
}

function Swatches({ colors }) {
  return (
    <span className="swatches">
      {colors.map((color, i) => (
        <i key={i} style={{ background: color }} />
      ))}
    </span>
  )
}

export default function App() {
  const [form, setForm] = useState(INITIAL_FORM)
  const [fontsTick, setFontsTick] = useState(0)
  const [photoTick, setPhotoTick] = useState(0)
  const [photoError, setPhotoError] = useState('')
  const [request, setRequest] = useState({ status: 'idle', message: '' })
  const [brief, setBrief] = useState(null)
  const [briefOpen, setBriefOpen] = useState(false)
  const [cameraView, setCameraView] = useState(null)
  const briefRef = useRef(null)

  const update = (key) => (event) => setForm((f) => ({ ...f, [key]: event.target.value }))
  const updatePrimary = (event) => {
    const primary = event.target.value
    setForm((f) => ({ ...f, primary, useOriginalBackground: false }))
  }
  const updateBackground = (event) => {
    const background = event.target.value
    setForm((f) => ({ ...f, background, useOriginalBackground: true, autoAccent: true, autoTextColor: true, autoBannerColor: true }))
  }
  const updateStyleColor = (key, autoKey) => (event) => {
    const color = event.target.value
    setForm((f) => ({ ...f, [key]: color, [autoKey]: false }))
  }
  const bannerChoices = bannerColorOptions(form.bannerPalette)
  const bannerChoiceLabel = (color, i) =>
    i < form.bannerPalette.length ? `Photo color ${i + 1}` : color === '#FFFFFF' ? 'White' : 'Black'
  const updateBannerColor = (color) => setForm((f) => ({ ...f, bannerColor: color, autoBannerColor: false }))
  const applyPreset = (preset) =>
    setForm((f) => ({
      ...f, primary: preset.primary, accent: preset.accent, textColor: preset.text, useOriginalBackground: false,
      autoAccent: false, autoTextColor: false,
    }))
  const sameColors = (preset) =>
    preset.primary.toLowerCase() === form.primary.toLowerCase() &&
    preset.accent.toLowerCase() === form.accent.toLowerCase() &&
    preset.text.toLowerCase() === form.textColor.toLowerCase()
  const activePreset = PALETTE_PRESETS.find(sameColors)
  const suggested = brief && PALETTE_PRESETS.find((p) => p.id === SUGGESTED_PRESET[brief.theme])

  useEffect(() => {
    Promise.all(FONT_LOADS.map((font) => document.fonts.load(font)))
      .catch(() => {})
      .finally(() => setFontsTick((n) => n + 1))
  }, [])

  useEffect(() => {
    let current = true
    loadBackgroundImage(form.background).then((loaded) => {
      if (!current) return
      if (loaded) {
        const design = getBackgroundDesign(form.background)
        setForm((f) =>
          f.background === form.background
            ? {
                ...f,
                primary: f.useOriginalBackground ? design.primary : f.primary,
                accent: f.autoAccent ? design.accent : f.accent,
                textColor: f.autoTextColor ? design.textColor : f.textColor,
                bannerPalette: design.palette,
                bannerColor: f.autoBannerColor ? defaultBannerColor(design.palette) : f.bannerColor,
                autoFrontFinish: design.frontFinish,
              }
            : f,
        )
        setPhotoError('')
        setPhotoTick((n) => n + 1)
      } else {
        setPhotoError(form.background)
      }
    })
    return () => {
      current = false
    }
  }, [form.background])

  useEffect(() => {
    const dialog = briefRef.current
    if (!dialog) return
    if (briefOpen && !dialog.open) dialog.showModal()
    if (!briefOpen && dialog.open) dialog.close()
  }, [briefOpen])

  const selectedStyleKey = form.background
  const deferredForm = useDeferredValue(form)
  const sleevePreview = useMemo(
    () => generateSleevePreview(deferredForm),
    // fontsTick / photoTick re-render the texture once web fonts and the background photo finish loading
    [deferredForm, fontsTick, photoTick],
  )

  async function generateConcept() {
    setRequest({ status: 'loading', message: 'Generating concept…' })
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groom_name: form.groomName,
          bride_name: form.brideName,
          wedding_date: form.weddingDate,
          theme: PRESET_THEME[activePreset?.id] ?? 'custom',
          guest_icon: form.guestIcon,
          background_style: selectedStyleKey,
          story: form.story,
          first_met_date: form.firstMetDate,
          proposal_date: form.proposalDate,
          vip_crew: form.vipCrew,
          hashtag: form.hashtag,
          handle: form.handle,
          reseller_name: form.resellerName,
          reseller_contact: form.resellerContact,
        }),
      })
      if (!response.ok) {
        const detail = await response.json().catch(() => ({}))
        throw new Error(detail.detail ?? `Request failed (${response.status})`)
      }
      const concept = await response.json()
      setForm((f) => ({
        ...f,
        thankYouNote: concept.thank_you_note || f.thankYouNote,
        story: concept.story || f.story,
      }))
      setRequest({ status: 'done', message: 'Concept applied to the preview.' })
      setBrief(concept)
      setBriefOpen(true)
    } catch (error) {
      setRequest({ status: 'error', message: error.message })
    }
  }

  return (
    <div className="workspace">
      <section className="viewport" aria-label="3D bottle preview">
        <div className="canvas-wrap">
          <BottleCanvas
            sleeveCanvas={sleevePreview.canvas}
            metalCanvas={sleevePreview.metalCanvas}
            roughnessCanvas={sleevePreview.roughnessCanvas}
            bumpCanvas={sleevePreview.bumpCanvas}
            foilColor={sleevePreview.foilColor}
            cameraView={cameraView}
            innerEffect={form.innerEffect}
          />
        </div>
        <div className="views" role="group" aria-label="Camera presets">
          {VIEWS.map((view) => (
            <button
              key={view.id}
              type="button"
              onClick={() => setCameraView({ id: view.id, angle: view.angle })}
              aria-pressed={cameraView?.id === view.id}
            >
              {view.label}
            </button>
          ))}
        </div>
      </section>

      <aside className="panel">
        <h1>Shadi Bottle Studio</h1>

        <fieldset>
          <legend>Couple</legend>
          <Field label="Groom name">
            <input value={form.groomName} onChange={update('groomName')} maxLength={40} />
          </Field>
          <Field label="Bride name">
            <input value={form.brideName} onChange={update('brideName')} maxLength={40} />
          </Field>
          <Field label="Front text finish">
            <select value={form.frontFinish} onChange={update('frontFinish')}>
              <option value="auto">Automatic</option>
              {Object.entries(FRONT_FINISHES).map(([id, finish]) => (
                <option key={id} value={id}>{finish.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Wedding date">
            <input type="date" value={form.weddingDate} onChange={update('weddingDate')} />
          </Field>
          <Field label="Hero tagline / crest">
            <input value={form.tagline} onChange={update('tagline')} maxLength={30} />
          </Field>
        </fieldset>

        <fieldset>
          <legend>Bridal Attire Palette</legend>
          <div className="themes" role="group" aria-label="Palette presets">
            {PALETTE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                aria-pressed={activePreset?.id === preset.id}
                className={activePreset?.id === preset.id ? 'theme active' : 'theme'}
                onClick={() => applyPreset(preset)}
              >
                <Swatches colors={[preset.primary, preset.accent, preset.text]} />
                {preset.label}
              </button>
            ))}
          </div>
          <ColorField
            label="Primary base color"
            hint="Match with Bride's lehenga / gown"
            value={form.primary}
            onChange={updatePrimary}
          />
          <ColorField
            label="Accent / foil color"
            hint="Borders, monograms and filigree"
            value={form.accent}
            onChange={updateStyleColor('accent', 'autoAccent')}
          />
          <ColorField
            label="Text / secondary color"
            value={form.textColor}
            onChange={updateStyleColor('textColor', 'autoTextColor')}
          />
          {sleevePreview.lowContrast && (
            <p className="hint" role="status">
              Some text may be hard to read against the background, card or accent. Consider changing your colors.
            </p>
          )}
        </fieldset>

        <fieldset>
          <legend>Name banner</legend>
          <p className="hint">Photo, then a translucent banner, then the names and date on top.</p>
          <div className="segmented" role="group" aria-label="Banner type">
            {BANNER_STYLES.map((style) => (
              <button
                key={style.id}
                type="button"
                aria-pressed={form.bannerStyle === style.id}
                onClick={() => setForm((f) => ({ ...f, bannerStyle: style.id }))}
              >
                {style.label}
              </button>
            ))}
          </div>
          {form.bannerStyle !== 'none' && (
            <>
              <div className="field">
                <span>Banner color</span>
                <div className="banner-colors" role="group" aria-label="Banner color">
                  {bannerChoices.map((color, i) => (
                    <button
                      key={`${color}-${i}`}
                      type="button"
                      className="banner-color"
                      style={{ background: color }}
                      title={`${bannerChoiceLabel(color, i)} ${color.toUpperCase()}`}
                      aria-label={`${bannerChoiceLabel(color, i)} ${color.toUpperCase()}`}
                      aria-pressed={form.bannerColor.toLowerCase() === color.toLowerCase()}
                      onClick={() => updateBannerColor(color)}
                    />
                  ))}
                </div>
              </div>
              <Field label={`Banner opacity: ${Math.round(form.bannerOpacity * 100)}%`}>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={Math.round(form.bannerOpacity * 100)}
                  onChange={(event) => setForm((f) => ({ ...f, bannerOpacity: Number(event.target.value) / 100 }))}
                />
              </Field>
            </>
          )}
        </fieldset>

        <fieldset>
          <legend>Style</legend>
          <Field label="Background style">
            <select value={form.background} onChange={updateBackground}>
              {BACKGROUND_STYLES.map((style) => (
                <option key={style.id} value={style.id}>
                  {style.label}
                </option>
              ))}
            </select>
          </Field>
          {photoError === form.background && (
            <p className="status error" role="alert">The selected background image could not be loaded.</p>
          )}
          <Field label="Inside bottle">
            <select value={form.innerEffect} onChange={update('innerEffect')}>
              <option value="rose_petals">Rose petals</option>
              <option value="stardust">Star dust</option>
            </select>
          </Field>
          <Field label="Guest identification icon">
            <select value={form.guestIcon} onChange={update('guestIcon')}>
              {GUEST_ICONS.map((icon) => (
                <option key={icon.id} value={icon.id}>
                  {icon.emoji} {icon.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Thank-you note">
            <textarea rows={3} maxLength={160} value={form.thankYouNote} onChange={update('thankYouNote')} />
          </Field>
        </fieldset>

        <fieldset>
          <legend>Our story</legend>
          <Field label="How we met">
            <textarea rows={4} maxLength={300} value={form.story} onChange={update('story')} />
          </Field>
          <Field label="First met">
            <input type="date" value={form.firstMetDate} onChange={update('firstMetDate')} />
          </Field>
          <Field label="Proposal">
            <input type="date" value={form.proposalDate} onChange={update('proposalDate')} />
          </Field>
          <p className="hint">The wedding day on the timeline uses the wedding date above.</p>
        </fieldset>

        <fieldset>
          <legend>VIP crew</legend>
          <Field label="Squad roster (one name per line, up to 8)">
            <textarea rows={5} value={form.vipCrew} onChange={update('vipCrew')} />
          </Field>
        </fieldset>

        <fieldset>
          <legend>Instagram</legend>
          <Field label="Hashtag">
            <input value={form.hashtag} onChange={update('hashtag')} maxLength={40} />
          </Field>
          <Field label="Handle (also used for the QR code)">
            <input value={form.handle} onChange={update('handle')} maxLength={40} />
          </Field>
        </fieldset>

        <fieldset>
          <legend>Reseller / event planner</legend>
          <Field label="Co-brand name">
            <input value={form.resellerName} onChange={update('resellerName')} maxLength={40} />
          </Field>
          <Field label="Contact line">
            <input value={form.resellerContact} onChange={update('resellerContact')} maxLength={60} />
          </Field>
        </fieldset>

        <button
          type="button"
          className="generate"
          onClick={generateConcept}
          disabled={request.status === 'loading'}
        >
          {request.status === 'loading' ? 'Generating…' : 'Generate Sleeve Concept'}
        </button>
        {request.message && (
          <p className={`status ${request.status}`} role="status">
            {request.message}
            {brief && request.status === 'done' && (
              <>
                {' '}
                <button type="button" className="link" onClick={() => setBriefOpen(true)}>
                  View design brief
                </button>
              </>
            )}
          </p>
        )}
      </aside>

      <dialog
        ref={briefRef}
        className="brief"
        aria-labelledby="brief-title"
        onClose={() => setBriefOpen(false)}
        onClick={(event) => event.target === event.currentTarget && setBriefOpen(false)}
      >
        {brief && (
          <div className="brief-body">
            <header>
              <h2 id="brief-title">Gemini 3.8 Flash Design Brief</h2>
              <button type="button" className="close" aria-label="Close design brief" onClick={() => setBriefOpen(false)}>
                &times;
              </button>
            </header>
            <section>
              <h3>Suggested palette</h3>
              {suggested ? (
                <p className="palette">
                  <Swatches colors={[suggested.primary, suggested.accent, suggested.text]} />
                  {suggested.label}
                  <button type="button" className="link" onClick={() => applyPreset(suggested)}>
                    Apply to preview
                  </button>
                </p>
              ) : (
                <p>{brief.theme}</p>
              )}
            </section>
            <section>
              <h3>Design notes</h3>
              <p>{brief.design_notes}</p>
            </section>
            <section>
              <h3>Thank-you note</h3>
              <p>{brief.thank_you_note}</p>
            </section>
            <section>
              <h3>How we met</h3>
              <p>{brief.story}</p>
            </section>
          </div>
        )}
      </dialog>
    </div>
  )
}
