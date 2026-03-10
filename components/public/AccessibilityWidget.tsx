'use client'

import { useEffect, useRef, useState } from 'react'
import { Accessibility, X, Sun, Moon, Type, Contrast, Eye } from 'lucide-react'

type TextSize = 'sm' | 'md' | 'lg'
type ColorblindMode = 'none' | 'deuteranopia' | 'protanopia' | 'achromatopsia'

interface A11yState {
  theme: 'dark' | 'light'
  textSize: TextSize
  highContrast: boolean
  colorblind: ColorblindMode
  showAltText: boolean
}

const STORAGE_KEY = 'uraan-a11y'

const DEFAULTS: A11yState = {
  theme: 'dark',
  textSize: 'md',
  highContrast: false,
  colorblind: 'none',
  showAltText: false,
}

function readState(): A11yState {
  if (typeof window === 'undefined') return DEFAULTS
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return { ...DEFAULTS, ...(JSON.parse(stored) as Partial<A11yState>) }
  } catch {}
  return DEFAULTS
}

function applyAndSave(state: A11yState) {
  const h = document.documentElement
  h.setAttribute('data-theme', state.theme)
  h.setAttribute('data-text-size', state.textSize)
  if (state.highContrast) {
    h.setAttribute('data-high-contrast', 'true')
  } else {
    h.removeAttribute('data-high-contrast')
  }
  if (state.colorblind !== 'none') {
    h.setAttribute('data-colorblind', state.colorblind)
  } else {
    h.removeAttribute('data-colorblind')
  }
  if (state.showAltText) {
    h.setAttribute('data-alt-text', 'true')
  } else {
    h.removeAttribute('data-alt-text')
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {}
}

// ── Pill toggle ────────────────────────────────────────────────────────────
function PillToggle({
  checked,
  onChange,
  id,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  id: string
}) {
  return (
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[--color-accent] ${
        checked ? 'bg-[--color-accent]' : 'bg-zinc-600'
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-4' : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}

export default function AccessibilityWidget() {
  const [open, setOpen] = useState(false)
  const [state, setState] = useState<A11yState>(readState)
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  function update(partial: Partial<A11yState>) {
    setState((prev) => {
      const next = { ...prev, ...partial }
      applyAndSave(next)
      return next
    })
  }

  const TEXT_SIZES: { value: TextSize; label: string }[] = [
    { value: 'sm', label: 'A−' },
    { value: 'md', label: 'A' },
    { value: 'lg', label: 'A+' },
  ]

  const COLORBLIND_OPTIONS: { value: ColorblindMode; label: string }[] = [
    { value: 'none', label: 'None' },
    { value: 'deuteranopia', label: 'Deuteranopia' },
    { value: 'protanopia', label: 'Protanopia' },
    { value: 'achromatopsia', label: 'Greyscale' },
  ]

  return (
    <div ref={ref} className="relative">
      {/* Trigger button */}
      <button
        aria-label="Accessibility options"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((v) => !v)}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-[--color-border] bg-[--color-surface-alt] text-[--color-text-secondary] transition-colors hover:border-[--color-accent] hover:text-[--color-accent] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[--color-accent]"
      >
        <Accessibility className="h-4 w-4" />
      </button>

      {/* Panel */}
      {open && (
        <div
          role="dialog"
          aria-label="Accessibility settings"
          className="absolute right-0 top-10 z-50 w-72 rounded-xl border border-[--color-border] bg-[--color-surface] p-4 shadow-2xl"
        >
          {/* Header */}
          <div className="mb-4 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-widest text-[--color-accent]">
              Accessibility
            </p>
            <button
              aria-label="Close accessibility panel"
              onClick={() => setOpen(false)}
              className="rounded p-0.5 text-[--color-text-muted] hover:text-[--color-text-primary]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Theme */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-[--color-text-secondary]">
                {state.theme === 'dark' ? (
                  <Moon className="h-4 w-4 text-[--color-text-muted]" />
                ) : (
                  <Sun className="h-4 w-4 text-[--color-text-muted]" />
                )}
                <label htmlFor="a11y-theme">
                  {state.theme === 'dark' ? 'Dark theme' : 'Light theme'}
                </label>
              </div>
              <PillToggle
                id="a11y-theme"
                checked={state.theme === 'light'}
                onChange={(v) => update({ theme: v ? 'light' : 'dark' })}
              />
            </div>

            {/* Text size */}
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm text-[--color-text-secondary]">
                <Type className="h-4 w-4 text-[--color-text-muted]" />
                <span>Text size</span>
              </div>
              <div className="flex gap-1" role="group" aria-label="Text size">
                {TEXT_SIZES.map(({ value, label }) => (
                  <button
                    key={value}
                    aria-pressed={state.textSize === value}
                    onClick={() => update({ textSize: value })}
                    className={`flex-1 rounded-md px-2 py-1.5 text-sm font-medium transition-colors ${
                      state.textSize === value
                        ? 'bg-[--color-accent] text-white'
                        : 'bg-[--color-surface-alt] text-[--color-text-secondary] hover:bg-[--color-border]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* High contrast */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-[--color-text-secondary]">
                <Contrast className="h-4 w-4 text-[--color-text-muted]" />
                <label htmlFor="a11y-contrast">High contrast</label>
              </div>
              <PillToggle
                id="a11y-contrast"
                checked={state.highContrast}
                onChange={(v) => update({ highContrast: v })}
              />
            </div>

            {/* Colorblind corrections */}
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm text-[--color-text-secondary]">
                <Eye className="h-4 w-4 text-[--color-text-muted]" />
                <label htmlFor="a11y-colorblind">Colour correction</label>
              </div>
              <select
                id="a11y-colorblind"
                value={state.colorblind}
                onChange={(e) => update({ colorblind: e.target.value as ColorblindMode })}
                className="w-full rounded-md border border-[--color-border] bg-[--color-surface-alt] px-3 py-1.5 text-sm text-[--color-text-primary] focus:outline-none focus:ring-1 focus:ring-[--color-accent]"
              >
                {COLORBLIND_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Alt text */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-[--color-text-secondary]">
                <label htmlFor="a11y-alttext" className="block font-medium">
                  Show image captions
                </label>
                <span className="text-xs text-[--color-text-muted]">
                  Displays alt text on images
                </span>
              </div>
              <PillToggle
                id="a11y-alttext"
                checked={state.showAltText}
                onChange={(v) => update({ showAltText: v })}
              />
            </div>
          </div>

          {/* Reset */}
          <button
            onClick={() => update(DEFAULTS)}
            className="mt-4 w-full rounded-md py-1.5 text-xs text-[--color-text-muted] transition-colors hover:text-[--color-text-primary]"
          >
            Reset to defaults
          </button>
        </div>
      )}
    </div>
  )
}
