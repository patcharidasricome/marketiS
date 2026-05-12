# Octo Code — marketiS Design System

## Overview
Octo Code is a developer-centric design system inspired by GitHub's visual language. The interface defaults to **light mode** (clean whites and subtle grays) with a full dark mode override available via `[data-theme="dark"]`. Both themes share the same structural tokens — only their resolved values differ. The aesthetic is functional, information-dense, and built for productivity.

## Color Tokens

All colors are defined as CSS custom properties on `:root` (light) and overridden under `[data-theme="dark"]`.

### Light Mode (`:root`)
| Token | Value | Role |
|---|---|---|
| `--primary` | `#3190fc` | Links, focus rings, interactive accents |
| `--primary-hover` | `rgb(0, 78, 174)` | Hovered primary elements |
| `--secondary` | `#0969da` | Primary action buttons (`.btn-primary` background) |
| `--secondary-hover` | `#064d9d` | Hovered primary buttons |
| `--neutral` | `#656d76` | Muted icons, meta text |
| `--background` | `#f5f8fa` | Page canvas |
| `--surface` | `#ffffff` | Cards, panels |
| `--surface-elevated` | `#f6f8fa` | Chip backgrounds, table headers |
| `--surface-overlay` | `#ffffff` | Dropdowns, popovers |
| `--text-primary` | `#1f2328` | Body copy, headings |
| `--text-secondary` | `#656d76` | Descriptions, timestamps, meta |
| `--text-link` | `#0969da` | Anchor text |
| `--border` | `#ebedef` | Card edges, dividers, input outlines |
| `--border-hover` | `#bbc6d4ac` | Hovered borders |
| `--success` | `#4bca6f` | Positive states, confirmations |
| `--warning` | `#9a6700` | Caution alerts, draft states |
| `--error` | `#cf222e` | Errors, destructive actions |
| `--accent-orange` | `#0969da` | (Mapped to action blue in current palette) |
| `--backdrop` | `rgba(31, 35, 40, 0.5)` | Modal overlay |
| `--placeholder` | `#8c959f` | Input placeholder text |
| `--btn-secondary-text` | `#24292f` | `.btn-secondary` label color |

### Dark Mode (`[data-theme="dark"]`)
| Token | Value | Role |
|---|---|---|
| `--primary` | `#3190fc` | Links, focus rings, interactive accents |
| `--primary-hover` | `rgb(0, 78, 174)` | Hovered primary elements |
| `--secondary` | `#0969da` | Primary action buttons |
| `--secondary-hover` | `#064d9d` | Hovered primary buttons |
| `--neutral` | `#8b949e` | Muted icons, meta text |
| `--background` | `#0d1117` | Page canvas |
| `--surface` | `#161b22` | Cards, panels |
| `--surface-elevated` | `#1c2128` | Popovers, elevated containers |
| `--surface-overlay` | `#21262d` | Dropdowns, modals |
| `--text-primary` | `#e6edf3` | Body copy, headings |
| `--text-secondary` | `#8b949e` | Descriptions, meta |
| `--text-link` | `#58a6ff` | Anchor text |
| `--border` | `#30363d` | Dividers, card borders, input outlines |
| `--border-hover` | `#484f58` | Hovered borders |
| `--success` | `#3fb950` | Positive states |
| `--warning` | `#d29922` | Caution states |
| `--error` | `#f85149` | Errors, destructive actions |
| `--accent-orange` | `#0969da` | (Mapped to action blue in current palette) |
| `--backdrop` | `rgba(1, 4, 9, 0.8)` | Modal overlay |
| `--placeholder` | `#484f58` | Input placeholder text |
| `--btn-secondary-text` | `#c9d1d9` | `.btn-secondary` label color |

## Typography
- **Display / Headings**: Work Sans (`var(--font-work-sans)`) — weight 600, letter-spacing `-0.02em`
- **Body**: Inter (`var(--font-inter)`) — weights 400, 500, 600; base size 14px
- **Code / Mono**: JetBrains Mono (`var(--font-jetbrains)`) — weight 400, ligatures enabled (`"liga" 1`)

Type scale: `12px` (labels/meta) › `14px` (body default) › `16px` (section titles) › `20px` (page titles) › `24px+` (marketing).

## Elevation
Depth is expressed through background-color layering, not shadows:

| Layer | Light value | Dark value |
|---|---|---|
| Page canvas | `#f5f8fa` | `#0d1117` |
| Cards / panels | `#ffffff` | `#161b22` |
| Elevated surfaces | `#f6f8fa` | `#1c2128` |
| Overlays / dropdowns | `#ffffff` | `#21262d` |
| Modal backdrop | `rgba(31,35,40,0.5)` | `rgba(1,4,9,0.8)` |

## Components

### Buttons
- **`.btn-primary`**: `var(--secondary)` background (`#0969da`), white text, 6px radius, `8px 20px` padding, 32px height, 500 weight. Hover → `var(--secondary-hover)`.
- **`.btn-secondary`**: transparent background, `var(--btn-secondary-text)` text, `1px solid var(--border)` border, same geometry. Hover shifts border to `var(--border-hover)` and text to `var(--text-primary)`.
- **`.btn-danger`**: transparent background, `var(--error)` text, `1px solid var(--border)` border. Hover shifts border to `var(--error)`.
- **`.btn-small`** modifier: 28px height, `4px 12px` padding, 12px font.

### Cards
`.card` — `var(--surface)` background, `1px solid var(--border)` border, 6px radius, 16px padding, 16px bottom margin. Hover shifts border to `var(--border-hover)`. Entrance via `fadeIn 150ms ease-out`.

### Form Inputs
`.form-input`, `.form-textarea`, `.form-select` — full width, `8px 12px` padding, `var(--background)` fill, `1px solid var(--border)` border, 6px radius, 14px font. Focus: `2px solid var(--primary)` outline + `outline-offset: 2px`. Placeholder color: `var(--placeholder)`.

### Chips
`.chip` — `var(--surface-elevated)` background, pill radius (9999px), 24px height, `4px 12px` padding, 12px font, 500 weight, `var(--text-link)` color. Hover → `var(--surface-overlay)`.

### Tables
Full-width, collapsed borders, 14px font. `th`: `8px 16px` padding, 500 weight, `var(--surface)` background, `1px solid var(--border)` bottom border. `td`: same padding, `var(--text-secondary)` color. Row hover: `var(--surface-elevated)` background.

### Modals
`.modal-overlay` — fixed inset, `var(--backdrop)` background, `z-index: 1000`, flex-centered with 16px padding.

## Spacing
Base unit: **4px**. Scale: 4 · 8 · 12 · 16 · 24 · 32 · 40 · 48 · 64px.
- Button padding: `8px 20px` (default), `4px 12px` (small)
- Input padding: `8px 12px`
- Card padding: `16px`
- Chip padding: `4px 12px`
- Page main padding: `32px`
- Section gap: `24px` between content sections

## Border Radius
- **3px** — inline code snippets, small badges
- **6px** — buttons, inputs, cards, dropdowns, modals (primary radius)
- **9999px** — chips, pills, notification counters

## Animations
All transitions are capped at **150ms** to keep the UI feeling instant. Keyframes defined in `globals.css`:
- `fadeIn` — `opacity: 0 + translateY(4px)` → visible; used for card entrance
- `slideUp` — `translateY(8px) + opacity: 0` → visible
- `pulseDot` — scale + opacity pulse over 2s (loading indicators)

Utility classes: `.animate-fade-in`, `.animate-slide-up`, `.animate-pulse-dot`.

## Scrollbar
Custom webkit scrollbar: 8×8px, track color `var(--background)`, thumb `var(--border)` (4px radius), hover thumb `var(--border-hover)`.

## Theme Switching
- Default theme applied via `:root` (light).
- Dark mode triggered by setting `data-theme="dark"` on `<html>`.
- Preference persisted in `localStorage` under key `marketis-theme`.
- A `beforeInteractive` script in `layout.tsx` reads this key and sets the attribute before first paint to prevent flash.
- Theme toggle lives in the bottom-left corner of the sidebar (`Sidebar.tsx`).

## Do's and Don'ts
- **Do** treat light mode as the default — dark mode is an opt-in preference
- **Do** use JetBrains Mono for code, SHAs, file names, and terminal output
- **Do** rely on surface-color layering for depth; avoid decorative shadows
- **Do** keep all transition durations at or below 150ms
- **Don't** exceed font-weight 600 anywhere in the UI
- **Don't** use border-radius larger than 6px on functional components
- **Don't** use `--primary` (`#3190fc`) for large filled backgrounds — reserve it for focus rings and interactive accents
- **Don't** hardcode color hex values in components — always reference a CSS token
