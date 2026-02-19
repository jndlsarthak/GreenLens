# GreenLens – Vision alignment & deep dive

## Project vision (summary)

GreenLens is an AI agent that turns environmental concepts into **tangible, daily actions**. It addresses:

1. **Information gap** – Make product impact visible (e.g. carbon) so choices aren’t arbitrary.
2. **Action gap** – Show what actually matters (e.g. diet vs recycling).
3. **Motivation gap** – Give feedback so users see that their actions matter.
4. **Community gap** – (Future) Shared progress and achievement.

Core flow: **Capture product (barcode/QR) → See if it’s sustainable (carbon, eco score) → If not, see alternatives.**

---

## How the current code aligns

### What’s in place and working

| Vision element | Implementation | Status |
|----------------|----------------|--------|
| **Scan product** | Camera screen with **real barcode/QR scanning** (html5-qrcode). Supports EAN/QR; extracts barcode from Open Food Facts URLs. Fallback “Scan demo product” when camera is unavailable. | Implemented |
| **Product lookup** | `POST /api/products/lookup` → Open Food Facts API by barcode → cache in DB. | Implemented |
| **Carbon analysis** | Backend rule-based **carbon calculator** (category × weight + packaging) and **eco score A–F** from footprint per kg. Used in product lookup and scan result. | Implemented |
| **Show sustainability** | Scan result page shows **carbon footprint (kg CO₂e)**, **eco score**, “equivalent to driving X miles”, and an eco tip. | Implemented |
| **Track progress** | Scans stored per user; **points**, **streak**, **challenges**, **badges**; dashboard with real scan count and carbon tracked. | Implemented |
| **Motivation** | Points per scan, challenges, badges, level from points, history. | Implemented |

So: **“Give user the power to capture the QR/barcode → see if product is sustainable (carbon etc.)”** is implemented. Scanning is real (barcode + QR); carbon is analyzed via Open Food Facts + backend calculator; result screen shows impact.

---

## Gaps vs vision

| Gap | Current state | Recommendation |
|-----|----------------|----------------|
| **Better alternatives** | “Better Alternatives” on scan result is **placeholder** (Eco Alternative 1/2, Brand 1/2). No API or logic for real lower-carbon alternatives. | Add backend: e.g. “alternatives” endpoint (same category, lower carbon, or from Open Food Facts). Frontend: call it on scan result and render real products. |
| **QR vs barcode** | Backend and Open Food Facts are **barcode-oriented**. QR is supported in the scanner; if QR contains a product URL we extract barcode and use it. Pure “QR-only” products (no barcode) would need a different data source. | Keep current approach (barcode + QR that encodes barcode/URL). For QR-only products, add a separate flow later (e.g. manual entry or other APIs). |
| **Community** | No leaderboards, teams, or shared goals. | Defer or add later (e.g. “friends” or “community” challenges). |
| **Action gap (“what matters most”)** | We show impact per product and challenges, but don’t explicitly compare impact of different **types** of actions (e.g. “eating less meat vs recycling”). | Add a small “Impact 101” or “What matters most” section (static or simple tips) that explains relative impact of actions. |

---

## Flow check: “Scan → sustainable? → alternatives”

1. **User opens app** → Onboarding → Register/Login → Dashboard (camera).
2. **User points camera at barcode/QR** → html5-qrcode decodes → barcode (or from QR URL) passed to `onScan(barcode)`.
3. **Frontend** → `productsApi.lookup(barcode)` → Backend checks cache; if miss, calls **Open Food Facts**, runs **carbon calculator**, saves product, returns name, brand, image, **carbonFootprint**, **ecoScore**.
4. **Frontend** → `scansApi(token).record({ barcode, productId, productName, carbonFootprint })` → Backend creates scan, updates user points/streak, runs challenge/badge checks.
5. **Scan result screen** → Shows product name, image, **carbon footprint**, **eco score**, “equivalent to X miles”, eco tip. **“Better Alternatives”** is still placeholder.
6. **History & dashboard** → Real scan count, carbon tracked, weekly activity from scans.

So the project **does** revolve around: **scan (barcode/QR) → analyze carbon (and sustainability) → show result**. The missing piece for the full vision is **real alternatives** (and, later, community and “what matters most” content).

---

## Technical summary

- **Scanning:** Real **barcode + QR** in the browser via `html5-qrcode`; barcode extracted from QR when it’s an Open Food Facts product URL.
- **Carbon analysis:** **Open Food Facts** (product data) + **backend rule-based calculator** (emission factors by category, weight, packaging) → **eco score A–F**.
- **Alternatives:** Not implemented; UI is placeholder until an alternatives API and frontend wiring exist.

The codebase is **apt and working** for the core idea: **capture barcode/QR → analyze carbon emissions of the scanned product → show sustainability**. Adding **real alternatives** and optional **“what matters most”** content will align it fully with the written vision.
