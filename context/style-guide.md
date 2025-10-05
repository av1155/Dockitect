# Dockitect Style Guide

## Purpose

A token-first style guide for Dockitect to unify design across all views. It outlines core design tokens, component patterns, microcopy, and accessibility guidelines for a consistent homelab management experience.

## How to Update

Update **Design Tokens** first when adjusting colors, typography, or spacing – components inherit from tokens for consistency. Revise component sections only as needed to reflect new patterns; token changes propagate throughout components.

## Design Tokens

### Color

Token | Light | Dark | Usage  
--- | --- | --- | ---
Primary | `#2563eb` (blue-600) | `#3b82f6` (blue-500) | Primary action background, node borders  
Background | `#ffffff` | `#0f172a` (slate-950) | App background color  
Surface | `#f8fafc` (slate-50) | `#1e293b` (slate-800) | Card/panel backgrounds  
Border | `#e2e8f0` (slate-200) | `#334155` (slate-700) | Component borders  
Text Primary | `#0f172a` (slate-950) | `#f8fafc` (slate-50) | Primary text  
Text Secondary | `#64748b` (slate-500) | `#94a3b8` (slate-400) | Secondary text  
Success | `#16a34a` (green-600) | `#22c55e` (green-500) | Success states, valid nodes  
Warning | `#eab308` (yellow-500) | `#facc15` (yellow-400) | Warning states  
Error | `#dc2626` (red-600) | `#ef4444` (red-500) | Error states, conflicts  

**Contrast Requirements:** All color pairs meet WCAG 2.2 AA (4.5:1 for normal text, 3:1 for large text).

### Typography

Primary font: **Inter** (system fallback: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif)

- **Type scale:** H1 (2rem/32px), H2 (1.5rem/24px), H3 (1.25rem/20px), Body (1rem/16px), Small (0.875rem/14px)
- **Font weights:** Regular (400), Medium (500), Semibold (600)
- **Line-height:** 1.5 for body text, 1.2 for headings

### Spacing & Layout

- **Base spacing unit:** 4px (use multiples: 4, 8, 12, 16, 24, 32, 48, 64)
- **Responsive breakpoints:** 768px (tablet), 1024px (desktop), 1440px (large desktop)
- **Grid:** 12-column grid for layouts

### Radius & Elevation

- **Border radius:** Small (4px), Medium (6px), Large (8px), XL (12px)
- **Shadow tokens:** 
  - sm (subtle card)
  - md (dropdown, tooltip)
  - lg (modal)
  - xl (canvas nodes, dragging)
- Higher elevation for overlays and modals

### Motion

- **Animation durations:** Short (150ms), Medium (300ms), Long (500ms)
- **Easing:** ease-in-out for state changes, ease-out for entrances
- **Accessibility:** Honor `prefers-reduced-motion` (disable canvas animations, use instant transitions)

### Iconography & Imagery

- **Icon set:** Lucide Icons
- **Base size:** 24px on 24px grid
- **Stroke width:** 2px (consistent)
- **Format:** SVG for scalability
- **Alt text:** Descriptive alt text for all meaningful graphics (canvas nodes, upload icons)

## Component Guidance

### Button

- **Purpose:** Triggers an action (upload, export, save).
- **Variants:** Primary (blue), Secondary (outlined), Destructive (red)
- **Do:** Short, specific action labels ("Upload Compose", "Export YAML", "Save Blueprint")
- **Don't:** Generic labels ("Click Here", "Submit")

### Input & Textarea

- **Purpose:** Single or multi-line text input (service names, environment variables).
- **Do:** Clear label above input; placeholder for format hints; visible error states
- **Don't:** Placeholder text as the only label; tiny inputs

### Select

- **Purpose:** Select one option from a list (network selection, theme picker).
- **Do:** Clearly show the selected option; support keyboard navigation (arrow keys)
- **Don't:** Present an ungrouped long list of options (use search/filter for >10 items)

### Card

- **Purpose:** Group related content (service details, network info, conflict panel).
- **Do:** Group related info; use clear headings; apply subtle shadow (md)
- **Don't:** Overload it with content; nest cards more than 2 levels deep

### Modal/Dialog

- **Purpose:** Modal overlay for important content (unsaved changes, delete confirmation).
- **Do:** Include a title and a close button; trap focus; allow Esc to close
- **Don't:** Use modal for trivial content; block critical UI indefinitely

### Tooltip

- **Purpose:** Contextual info tip (node details on hover, icon explanations).
- **Do:** Keep the text short (1-2 lines); show on hover/focus; delay 500ms
- **Don't:** Rely on tooltip for essential info or actions; hide critical errors in tooltips

### Toast/Alert

- **Purpose:** Show brief feedback (upload success, export complete, validation errors).
- **Do:** Keep messages concise; auto-dismiss success after 5s; provide close button
- **Don't:** Obscure canvas or toolbar; stack more than 3 toasts

### Navbar/Toolbar

- **Purpose:** Primary actions (upload, export, save) and settings.
- **Do:** Sticky top position; group related actions; show loading states
- **Don't:** Overcrowd toolbar; hide critical actions in nested menus

### Table/List

- **Purpose:** Display structured data (service list, conflict list, volume mappings).
- **Do:** Distinct header style; zebra striping for readability; sortable columns
- **Don't:** Tiny text or tight spacing; horizontal scroll on desktop

## Microcopy & Tone

- **Tone & Style:** Technical but approachable; use sentence case for UI text; avoid jargon where possible. 
  - ✅ "Upload Compose file"
  - ❌ "Import YAML manifest"
- **Errors:** Be specific and actionable. 
  - ✅ "Missing required 'image' field in service 'db'"
  - ❌ "Invalid compose file"
- **Success messages:** Confirm action and provide next steps.
  - ✅ "Successfully imported 3 services from jellyfin.yml"

## Accessibility

- **Focus & Color:** Visible focus outlines on all interactive controls; ~44px hit targets for touch/click; no color-only cues (use icons + color).
- **Semantics:** Use proper ARIA roles and labels; support screen reader and keyboard navigation.
- **Keyboard shortcuts:** Document all shortcuts; allow Esc to cancel/close; support Tab navigation.

## References

- WCAG 2.2
- WAI-ARIA Authoring Practices
- Platform HIGs (Web)
- Plain Language Guide
- Inclusive Design Principles
