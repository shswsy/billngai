---
name: บิลง่าย · BillNgai
description: Free Thai quotation, invoice and receipt generator with a live A4 preview.
colors:
  ledger-blue: "#3d5af1"
  ledger-blue-deep: "#2f4ad8"
  ledger-blue-ink: "#2b44c9"
  ledger-blue-mist: "#edf0ff"
  receipt-green: "#12965a"
  receipt-green-mist: "#e6f6ee"
  invoice-amber: "#c27400"
  invoice-amber-mist: "#fff3df"
  stamp-violet: "#7a4ee8"
  stamp-violet-mist: "#f2edff"
  void-red: "#dc3d43"
  void-red-mist: "#fdecec"
  desk-grey: "#f4f6fa"
  sheet-white: "#ffffff"
  field-grey: "#f7f9fc"
  chip-grey: "#eef1f6"
  navy-ink: "#18213a"
  slate-ink: "#4a5470"
  fog-ink: "#8790a6"
  hairline: "#e6eaf1"
  field-line: "#d6dce7"
  doc-navy: "#1f3a5f"
  doc-ink: "#1b1f27"
typography:
  headline:
    fontFamily: "Prompt, IBM Plex Sans Thai, sans-serif"
    fontSize: "28px"
    fontWeight: 600
    lineHeight: 1.3
  title:
    fontFamily: "Prompt, IBM Plex Sans Thai, sans-serif"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: 1.4
  stat:
    fontFamily: "Prompt, IBM Plex Sans Thai, sans-serif"
    fontSize: "22px"
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "IBM Plex Sans Thai, Noto Sans Thai, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "IBM Plex Sans Thai, Noto Sans Thai, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.4
  mono:
    fontFamily: "IBM Plex Mono, ui-monospace, monospace"
    fontSize: "13px"
    fontWeight: 400
    letterSpacing: "-0.01em"
    fontFeature: "tnum"
  document:
    fontFamily: "Sarabun, TH Sarabun New, sans-serif"
    fontSize: "10.5pt"
    fontWeight: 400
    lineHeight: 1.45
  document-title:
    fontFamily: "Prompt, IBM Plex Sans Thai, sans-serif"
    fontSize: "22pt"
    fontWeight: 700
    lineHeight: 1.1
rounded:
  xl: "24px"
  lg: "20px"
  md: "14px"
  control: "12px"
  sm: "10px"
  pill: "999px"
  paper: "2px"
spacing:
  page-x: "clamp(16px, 2.2vw, 32px)"
  card-x: "20px"
  stack: "16px"
  field-gap: "14px 12px"
  main-max: "1440px"
  sidebar: "236px"
components:
  button-primary:
    backgroundColor: "{colors.ledger-blue}"
    textColor: "{colors.sheet-white}"
    rounded: "{rounded.control}"
    padding: "0 18px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.ledger-blue-deep}"
  button-soft:
    backgroundColor: "{colors.sheet-white}"
    textColor: "{colors.navy-ink}"
    rounded: "{rounded.control}"
    padding: "0 18px"
    height: "44px"
  button-soft-hover:
    textColor: "{colors.ledger-blue-ink}"
  button-sm:
    rounded: "{rounded.sm}"
    padding: "0 12px"
    height: "36px"
  input:
    backgroundColor: "{colors.field-grey}"
    textColor: "{colors.navy-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "9px 13px"
    height: "44px"
  input-focus:
    backgroundColor: "{colors.sheet-white}"
  nav-item:
    textColor: "{colors.slate-ink}"
    rounded: "{rounded.control}"
    padding: "0 12px"
    height: "46px"
  nav-item-active:
    backgroundColor: "{colors.ledger-blue-mist}"
    textColor: "{colors.ledger-blue-ink}"
  chip:
    backgroundColor: "{colors.chip-grey}"
    textColor: "{colors.slate-ink}"
    rounded: "{rounded.pill}"
    padding: "0 10px"
    height: "26px"
  status-saved:
    backgroundColor: "{colors.receipt-green-mist}"
    textColor: "{colors.receipt-green}"
    rounded: "{rounded.pill}"
    height: "26px"
  status-draft:
    backgroundColor: "{colors.invoice-amber-mist}"
    textColor: "{colors.invoice-amber}"
    rounded: "{rounded.pill}"
    height: "26px"
  card-section:
    backgroundColor: "{colors.sheet-white}"
    rounded: "{rounded.lg}"
    padding: "16px 20px"
  segmented-option-selected:
    backgroundColor: "{colors.ledger-blue-mist}"
    textColor: "{colors.ledger-blue-ink}"
    rounded: "{rounded.control}"
    height: "44px"
---

# Design System: บิลง่าย · BillNgai

## Overview

**Creative North Star: "The Clean Paper Desk"**

A calm, cool-grey work desk with one sheet of white paper on it. The app chrome is a quiet, modern SaaS surface (white cards on a pale blue-grey canvas, one confident blue), and the A4 document is the hero: a true-white sheet in Sarabun with the user's own accent color, shadowed like paper lying on the desk. The chrome exists to get the user to a correct, printable Thai document fast.

Density is medium and practical: a 236px sidebar, a 380-440px editor column of collapsible numbered steps, and a sticky live preview. Every control is at least 44px tall. Status is always color-coded by document type: blue for quotation, amber for invoice, green for receipt.

The app follows the OS color scheme: a full dark palette remaps every token (canvas #0e1320, primary #6c86ff), while the paper itself stays light.

**Key Characteristics:**
- One blue (#3d5af1) for actions, selection and focus; soft "mist" tints for selected states.
- Document-type color coding: quotation blue, invoice amber, receipt green.
- White cards with a whisper shadow and 20px corners; 12px controls; pill chips and status badges.
- Four-family type system: Prompt headings, IBM Plex Sans Thai UI, IBM Plex Mono numbers, Sarabun on the printed document.
- Light and dark schemes; print outputs only the A4 paper.

## Colors

Cool, clean product neutrals with one saturated blue and three semantic tints, plus a separate muted palette that belongs to the printed document.

### Primary
- **Ledger Blue** (#3d5af1): primary buttons, active segmented tab, count badges, focus ring, quotation type stripe, brand mark gradient.
- **Ledger Blue Deep** (#2f4ad8): primary hover.
- **Ledger Blue Ink** (#2b44c9): text on blue mist (active nav, selected options, quotation badge, add-item button).
- **Ledger Blue Mist** (#edf0ff): selected nav row, step numbers, KPI icon tiles, selected segmented option.

### Secondary
- **Receipt Green** (#12965a) / **Receipt Green Mist** (#e6f6ee): saved status, receipt badge and stripe, privacy note.
- **Invoice Amber** (#c27400) / **Invoice Amber Mist** (#fff3df): unsaved/draft status, invoice badge and stripe.

### Tertiary
- **Stamp Violet** (#7a4ee8) / **Stamp Violet Mist** (#f2edff): one KPI icon tile only.
- **Void Red** (#dc3d43) / **Void Red Mist** (#fdecec): delete actions and destructive confirms.

### Neutral
- **Desk Grey** (#f4f6fa): app canvas and drawer background.
- **Sheet White** (#ffffff): cards, sidebar, buttons, the paper.
- **Field Grey** (#f7f9fc): input fills, item rows, hover rows. **Chip Grey** (#eef1f6): chips and number pills.
- **Navy Ink** (#18213a): primary text. **Slate Ink** (#4a5470): secondary text and labels. **Fog Ink** (#8790a6): hints, placeholders, captions.
- **Hairline** (#e6eaf1): card borders and dividers. **Field Line** (#d6dce7): input and soft-button borders.

### Document palette
- **Doc Navy** (#1f3a5f): default document accent (title, table header fill). User-selectable from five muted accents: #1f3a5f, #2f5d50, #8a3b2e, #4a4458, #1c1c1c.
- **Doc Ink** (#1b1f27): document body text, with #5b6270 muted and #d9dde3 rules.

### Named Rules
**The Type Has A Color Rule.** Quotation is blue, invoice is amber, receipt is green, everywhere: badges, list stripes, KPI tiles. Never reuse those hues for anything else.

**The Paper Is Not The App Rule.** The document uses its own muted accent and Sarabun body text; app blue never appears on the printed sheet.

## Typography

**Display Font:** Prompt 600-700 (headings, KPI values, brand)
**Body Font:** IBM Plex Sans Thai (with Noto Sans Thai, system-ui)
**Label/Mono Font:** IBM Plex Mono with tabular numerals (document numbers, amounts)
**Document Font:** Sarabun (Thai business-document standard) for the document body; document headings (seller name, title, section heads) inherit Prompt from the global heading rule

**Character:** Prompt gives the chrome a friendly, modern voice; Plex Sans Thai keeps forms legible; Sarabun makes the output look like a real Thai office document. `line-break: loose` is set on body for Thai.

### Hierarchy
- **Headline** (600, 28px, 1.3): page title.
- **Title** (600, 16px, 1.4): section summaries, preview head; drawer title 22px.
- **Stat** (600, 22px, 1.3): KPI values.
- **Body** (400, 15px, 1.6): inputs and general UI text.
- **Label** (500, 13px, 1.4): field labels, crumbs; hints at 12px Fog Ink.
- **Document** (Sarabun 400, 10.5pt, 1.45; title Prompt 22pt 700 in accent; English sub-title 10pt, 0.25em tracking, uppercase).

### Named Rules
**The Numbers Line Up Rule.** Every amount, count and document number uses tabular numerals (`.num` or IBM Plex Mono).

## Layout

App shell: a sticky 236px sidebar plus a main column capped at 1440px with padding `24px clamp(16px, 2.2vw, 32px)`. The workspace is a two-column grid, editor `minmax(380px, 440px)` and preview `minmax(0, 1fr)`, gap 24px; the preview card is sticky. KPIs sit in a 4-up grid (gap 16px). Inside cards, vertical rhythm is 16px and form grids use 14px row / 12px column gaps.

Breakpoints: 1199px (sidebar becomes a blurred top app bar, doc types move to segmented tabs), 1099px, 899px (single column, fixed four-button bottom bar with 56px targets, inputs bumped to avoid iOS zoom), 420px. Print (`@page` A4) shows only the paper.

## Elevation & Depth

A light hybrid: hairline-bordered white cards with a barely-there two-layer navy shadow, a stronger shadow for the paper, and a pop shadow for overlays. Selection uses tinted fills and focus halos rather than lift.

### Shadow Vocabulary
- **Card** (`box-shadow: 0 1px 2px rgba(20, 30, 60, 0.04), 0 10px 28px -14px rgba(20, 30, 60, 0.14)`): sections, KPIs, preview card, doc cards.
- **Paper** (`box-shadow: 0 2px 6px rgba(20, 30, 60, 0.06), 0 18px 40px -18px rgba(20, 30, 60, 0.28)`): the A4 sheet.
- **Pop** (`box-shadow: 0 20px 48px -18px rgba(20, 30, 60, 0.32)`): document drawer and toast.
- **Blue glow** (`box-shadow: 0 6px 16px -8px color-mix(in srgb, var(--primary) 80%, transparent)`): primary buttons and active tabs.
- **Focus halo** (`box-shadow: 0 0 0 4px color-mix(in srgb, var(--primary) 14%, transparent)`): focused inputs.

## Shapes

Friendly, consistent rounding on a near-square document. Cards and sections 20px; drawer panel 24px on its inner edge; inner tiles and items 14px; buttons, inputs and segmented options 12px; small buttons and step numbers 10px; chips, status and badges full pills. The paper itself is almost square (2px). Dashed borders mark "add" affordances (add item, logo drop zone); document-list cards carry a 4px colored type stripe on the left.

## Components

### Buttons
- **Shape:** gently rounded (12px), 44px tall (36px small at 10px radius).
- **Primary:** Ledger Blue fill, white text, padding 0 18px, blue glow shadow.
- **Hover / Focus:** primary darkens to Ledger Blue Deep; soft buttons get a blue border and blue-ink text; press shifts 1px down. Focus is a 2px blue outline, 2px offset.
- **Soft:** white fill, Field Line border, Navy Ink text.
- **Icon button:** 42px square, 12px radius, hairline border; blue on hover; can carry a pill count dot.
- **Add (dashed):** 46px, dashed blue-tinted border, Ledger Blue Ink text, fills blue mist on hover.

### Chips
- **Chip:** Chip Grey pill, 26px, Slate Ink 12.5px (mono variant for numbers).
- **Status:** pill with a 7px leading dot; saved = green on green mist, draft/changed = amber on amber mist.
- **Type badge:** small pill in the type's color on its mist.

### Cards / Containers
- **Corner Style:** 20px.
- **Background:** Sheet White on Desk Grey.
- **Shadow Strategy:** Card shadow (see Elevation).
- **Border:** 1px Hairline.
- **Internal Padding:** 16-20px; editor sections are collapsible `<details>` with a 32px numbered step tile and a rotating chevron, entering with a staggered 8px rise.
- **KPI hero:** one KPI is a blue-to-violet gradient card with white text.

### Inputs / Fields
- **Style:** Field Grey fill, 1px Field Line border, 12px radius, min-height 44px, padding 9px 13px.
- **Focus:** border turns Ledger Blue, fill turns white, 4px blue halo.
- **Hover:** border tints 40% toward blue.
- **Segmented choice (VAT):** 3-up 44px options; selected = blue border, blue mist fill, blue ink, inset 1px ring.

### Navigation
- **Sidebar:** 46px rows, Slate Ink, 12px radius; hover Field Grey; active = blue mist fill, blue ink, 600 weight, plus a 4px blue bar at the sidebar edge. Pill counts sit right.
- **Tablet:** blurred top bar with segmented doc-type tabs (active = solid blue).
- **Mobile:** fixed bottom bar, four 56px buttons; active = blue mist; the main action is solid blue.

### Document Drawer
- Right-side sheet (max 460px) on Desk Grey with a blurred navy scrim, search field, and doc cards with a type-colored left stripe; the current doc gets a blue border and halo.

### A4 Paper (signature)
- 210 × 297mm white sheet, Sarabun 10.5pt body with Prompt headings, accent-colored title and table header, Thai baht-in-words line, PromptPay QR, signature lines. Rendered with `print-color-adjust: exact`.

### Toast
- Dark navy pill-ish box (14px radius) at the bottom center, white text, green check icon, slides up 20px.

## Do's and Don'ts

### Do:
- **Do** use Ledger Blue (#3d5af1) for the one primary action per view and for focus.
- **Do** keep the quotation / invoice / receipt colors (blue / amber / green) consistent in every surface.
- **Do** keep every control at least 44px tall and use tabular numerals for money.
- **Do** keep Sarabun and the user's accent inside the paper only.
- **Do** keep both the light and dark token sets in sync when adding a color.

### Don't:
- **Don't** use app blue on the printed document.
- **Don't** use `window.alert` or `confirm`; destructive actions confirm inline in Void Red.
- **Don't** add heavy shadows to cards; the paper is the only object that sits clearly above the desk.
