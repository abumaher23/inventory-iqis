---
name: Institutional Order
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#42474f'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#727780'
  outline-variant: '#c2c7d1'
  surface-tint: '#2d6197'
  primary: '#00355f'
  on-primary: '#ffffff'
  primary-container: '#0f4c81'
  on-primary-container: '#8ebdf9'
  inverse-primary: '#a0c9ff'
  secondary: '#006492'
  on-secondary: '#ffffff'
  secondary-container: '#58bcfd'
  on-secondary-container: '#004a6d'
  tertiary: '#532800'
  on-tertiary: '#ffffff'
  tertiary-container: '#743b00'
  on-tertiary-container: '#f9a767'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d2e4ff'
  primary-fixed-dim: '#a0c9ff'
  on-primary-fixed: '#001c37'
  on-primary-fixed-variant: '#07497d'
  secondary-fixed: '#cae6ff'
  secondary-fixed-dim: '#8ccdff'
  on-secondary-fixed: '#001e2f'
  on-secondary-fixed-variant: '#004b6f'
  tertiary-fixed: '#ffdcc4'
  tertiary-fixed-dim: '#ffb780'
  on-tertiary-fixed: '#2f1400'
  on-tertiary-fixed-variant: '#6f3800'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  h1:
    fontFamily: Public Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  h2:
    fontFamily: Public Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  h3:
    fontFamily: Public Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  status-badge:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 12px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  container-margin: 32px
  gutter: 24px
  sidebar-width: 260px
  table-row-height: 56px
---

## Brand & Style
The brand personality is authoritative yet accessible, designed to instill confidence in school administrators managing high-value assets. The emotional response is one of "organized calm"—reducing the cognitive load associated with logistics through clarity and precision.

The design style follows a **Corporate / Modern** aesthetic with a lean toward **Minimalism**. It prioritizes utility over decoration, utilizing generous whitespace to separate complex data sets. The visual language uses subtle tonal shifts to denote hierarchy, ensuring the interface feels institutional and permanent rather than trendy or ephemeral.

## Colors
The palette is anchored by "Academic Blue" (#0F4C81), a deep, stable primary color that evokes tradition and reliability. A brighter secondary teal-blue is used for interactive elements to provide visual energy without sacrificing professionalism.

Status indicators are non-negotiable and highly saturated to ensure immediate recognition:
- **Success (Available):** A forest green that signifies "ready for use."
- **Warning (Borrowed):** A warm amber/yellow that indicates a temporary state of change.
- **Danger (Damaged):** A crisp red to signal urgent attention or repair needs.

The background uses a cool-toned neutral gray to minimize eye strain during long administrative sessions.

## Typography
This design system utilizes **Public Sans** for headings to provide a clean, institutional feel that mirrors government and educational standards. For all functional and body text, **Inter** is used due to its exceptional readability in data-heavy environments and its neutral, systematic character.

A strict typographic scale ensures that administrative users can scan lists and tables quickly. Uppercase labels are used sparingly for category headers and metadata to provide structural "anchors" on the page.

## Layout & Spacing
The layout employs a **fixed grid** for the main content area (1280px max-width) to ensure reports and inventory lists remain legible on various monitor sizes. A persistent left-hand sidebar provides secondary navigation, using a 260px width to allow for clear labeling of inventory categories.

The spacing rhythm is based on an 8px base unit. Inventory tables—the core of the application—use a generous 56px row height to prevent data crowding and allow for the inclusion of status badges and action icons without visual clutter.

## Elevation & Depth
Depth is conveyed through **Tonal Layers** rather than heavy shadows. The primary background is the lowest layer, with content "cards" sitting on white surfaces with 1px light gray borders (#E2E8F0). 

Shadows are used exclusively for "floating" elements like modals or dropdown menus, utilizing **Ambient Shadows** (10% opacity, 12px blur, no offset) to suggest temporary focus. This flat-yet-layered approach ensures the UI feels organized and "architectural" rather than distracting.

## Shapes
The shape language is **Soft (0.25rem)**. This slight rounding takes the "edge" off the institutional feel, making the software feel modern and user-friendly while maintaining a structured, professional appearance. 

- **Buttons & Inputs:** 4px radius (rounded-md)
- **Cards & Containers:** 8px radius (rounded-lg)
- **Status Badges:** Fully rounded (pill) to distinguish them from interactive buttons.

## Components
- **Buttons:** Primary buttons use the Academic Blue fill with white text. Secondary buttons use a ghost style with a 1px border. All buttons have a subtle hover state transition (darken 10%).
- **Status Chips:** High-contrast background with dark text for maximum legibility. These are the most colorful elements on the page to draw immediate attention to item availability.
- **Input Fields:** Use a standard 1px border (#CBD5E1). When focused, the border transitions to Primary Blue with a soft 2px outer glow.
- **Data Tables:** Features sticky headers for long lists. Alternating "zebra" striping is avoided in favor of thin 1px horizontal dividers to maintain a cleaner look.
- **Inventory Cards:** Used for "Gallery View." These include a thumbnail placeholder for equipment images, a bold title, and a bottom-aligned status badge.
- **Search & Filter Bar:** A persistent, high-visibility component at the top of list views, utilizing a magnifying glass icon and clear "Clear Filter" actions.