# VibeOS — Platform Overview

**VibeOS** is a personal operating system for the vibe-coding era — a single codebase containing multiple independent apps under one OS-style shell. Built in Vue 3 with AI-assisted development. Designed to be lived in, not just demoed.

See `docs/strategy.md` for positioning, sprint plan and architectural direction.

---

## Vision

A public personal setup that ties together the tools the author actually uses — tasks, notes, board, snippets, games, AI — under one keyboard and one switchable aesthetic.

Each app must be:
- Independently useful
- Architecturally consistent
- Visually polished — and reskinnable via vibe-paks
- Production-ready in its own right

The platform demonstrates mastery of:
- Scalable Vue 3 architecture
- TypeScript and type safety
- State management patterns (Pinia)
- Composable-driven development
- Reusable UI + theme systems (vibe-paks)
- Cross-module messaging (event bus)
- Offline-first storage with optional cloud sync (Supabase)
- AI-assisted development workflows (Claude)

---

## Goals

| Goal | Description |
|------|-------------|
| Learning | Modern frontend engineering: Vue 3, Vite, TypeScript, Pinia |
| Architecture | Scalable, modular, maintainable patterns |
| AI Workflows | Using Claude as a senior engineering assistant |
| Portfolio | Demonstrating real product thinking and engineering quality |
| Long-term | A codebase that grows and improves over time |

---

## Current State

**Product name:** VibeOS  
**Version:** 0.1.0  
**Active apps:** Dashboard, Docs, Tasks, Notes, Games (2048)  
**Architecture:** ✅ Clean and layered  
**TypeScript:** ✅ Strict mode, 0 errors  
**Tests:** ❌ Not yet implemented (S5)  
**Backend:** ❌ localStorage only (S3 — Supabase planned)  
**Deployment:** ✅ Live at mrnednick.github.io/VibeOS  
**Active sprint:** S1 — Identity (positioning, logo, vibe-paks, landing, README)

---

## Tech Stack

- **Vue 3** — Composition API, `<script setup>`
- **Vite 6** — Build tool, dev server, glob imports
- **TypeScript 5** — Strict mode
- **Pinia 2** — State management
- **Vue Router 4** — Client-side routing with lazy loading
- **Geist** — Primary typeface (Vercel's open-source font)
- **marked 18** — Markdown rendering

---

## App Roadmap

| App | Status | Sprint | Description |
|-----|--------|--------|-------------|
| Dashboard | ✅ Active | S2 redesign | Live home screen — clock, weather, Today tasks, activity feed |
| Docs | ✅ Active | — | In-app markdown documentation viewer |
| Tasks (→ *Stride*) | ✅ Active | S4 product features | Today view + Focus mode (Pomodoro) + Streaks |
| Notes (→ *Inkwell/Slate*) | ✅ Active | S4 product features | Markdown + `[[backlinks]]` + daily journal |
| Games | ✅ Active | S4 expand | 2048 done; Memory + Snake next |
| Settings | 🔜 S2 | — | Appearance / Account / Keys / Data / Shortcuts / About |
| About | 🔜 S2 | — | Personal portfolio anchor at `/about` |
| Board | 🔜 S4 | — | Time-based swimlanes (rows = days, cols = statuses), unified with Tasks |
| Studio | 🔜 S4 | — | Prompt Lab — parallel model comparison (Opus / Sonnet / Haiku) |
| Snippets | 🔜 S4 | — | Code vault with syntax highlighting + tags + search |
| Habits | 🔜 S4 | — | Daily check-offs + streak heatmap |
| Currency | 🔁 Demoted | — | Now a Dashboard widget, not a standalone module |

---

## Development Philosophy

- **Architecture first** — design decisions are documented before code is written
- **Patterns over improvisation** — new code follows established patterns in `/docs/patterns.md`
- **Spec before implementation** — every new module starts with a written spec in `docs/modules/`
- **Product quality** — every screen should feel like it belongs in a real product
- **Vibe-coded** — AI-assisted development, fast iteration, high standards

---

## Branding

> **S1 work in progress.** The values below are placeholders being replaced this sprint. See task #2 (positioning) and task #3 (logo + accent) in the task list.

| Token | Value (current) | Direction (S1) |
|-------|-----------------|----------------|
| Product name | VibeOS | unchanged |
| Logo mark | `//` (placeholder) | Blinking block cursor `▮` (recommended) |
| Accent color | `#4f8ef7` | Pick a unique accent (not Vercel default) |
| Font | Geist + JetBrains Mono | Consider a more distinct heading mono |
| Icon system | Unicode glyphs | Lucide via lucide-vue-next |
| Brand tone | Precise · Composed · Alive | unchanged |
| Tagline | *Your engineering workspace* | *Personal OS for the vibe-coding era* (working) |

### Vibe-paks (multi-theme system)

VibeOS ships with switchable visual moods, each a complete CSS variable override:

| Pack | Status | Mood |
|------|--------|------|
| Terminal Dark | ✅ current default | Dark, blue accent, dev-native |
| Brutalist | 🔜 S1 | White bg, 2px black borders, mono everywhere |
| Soft Glass | 🔜 later | Backdrop blur, pastels, soft shadows |
| CRT Retro | 🔜 later | Green phosphor, scanlines, flicker |
