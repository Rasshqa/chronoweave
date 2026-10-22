# ChronoWeave: Deterministic Data-Driven 3D & Generative Art Studio

ChronoWeave is a web-based 2D and 3D generative art studio that transforms real-world historical weather telemetry (temperatures, wind dynamics, and precipitation records) into deterministic 3D data sculptures and fluid particle flow-fields.

Users can generate, orbit, customize, and export high-resolution 4K museum exhibition posters (`2400 x 3000 px`) or 9:16 mobile wallpapers (`2160 x 3840 px`) complete with precision typography spec sheets.

---

## Architectural Highlights

- **Framework:** Next.js 15 (App Router, React 19, TypeScript strict mode)
- **3D & Shader Engine:** Three.js, `@react-three/fiber`, `@react-three/drei`, with custom GLSL displacement vertex and rim-lit fragment shaders
- **2D Generative Engine:** High-performance HTML5 2D Canvas driven by 3D Simplex noise vector fields (`simplex-noise`)
- **Telemetry Integration:** Zero-key Open-Meteo Geocoding and Historical Archive API with astronomical seasonal fallback
- **High-DPI Offscreen Compositor:** In-browser canvas compositor generating 4K exhibition prints with technical telemetry typography
- **Public Archive Gallery:** Community collection backed by Prisma with an in-memory persistence fallback for zero-config deployments
- **Deterministic Reproducibility:** Every city, date, and title combination hashes via `cyrb128` into a `mulberry32` PRNG seed, ensuring 100% reproducible visuals

---

## Key Interactive Features

- **Dual Generative Modes:** Toggle between 3D GLSL displacement shader mesh and 2D Simplex noise particle flow-field with real-time parameter synchronization.
- **Floating Thermal Palette Inspector:** HUD spectrum overlay displaying the 3 interpolated thermal colors (`primaryColor`, `secondaryColor`, `accentColor`) with 1-click hex code copy and tooltip feedback.
- **Serendipitous Event Shuffling:** 1-click "Shuffle" button to instantaneously load memorable historical climate events (e.g., Tokyo Heatwave, Reykjavik Polar Vortex, Sahara Sirocco, Kyoto Blossom Day).
- **Interactive Community Gallery with Multi-Category Filtering:** Filter curated artifacts by category (`3D Sculptures`, `2D Flow-Fields`, `Glacial <10°C`, `Temperate 10-25°C`, `Tropical >25°C`) or live keyword search with empty-state resilience.
- **4K High-DPI Poster & 9:16 Wallpaper Compositor:** Export 4K exhibition prints (`2400 x 3000 px`) and 9:16 vertical wallpapers (`2160 x 3840 px`) rendered offscreen with typographic spec sheets.

---

## Mathematical Mapping Formulas (TRD Implementation)

Given real-world telemetry parameters:

1. **Deterministic Seed Hash Generation:**
   $$\text{SeedString} = \text{`:${lat.toFixed(2)}:${lon.toFixed(2)}:${date}:${title}`}$$
   Hashed with `cyrb128` and seeded into `mulberry32` PRNG.

2. **Thermal Color Interpolation ($T_{\text{max}} \in [-10^\circ\text{C}, 42^\circ\text{C}]$):**
   $$\tau = \text{clamp}\left(\frac{T_{\text{max}} + 10}{52}, 0, 1\right)$$
   - $\tau < 0.35$ (Cryo Zone): Cyber Cyan (`#00F0FF`) to Deep Cobalt (`#3B82F6`)
   - $0.35 \le \tau \le 0.70$ (Temperate Zone): Cyber Cyan (`#00F0FF`), Violet (`#8B5CF6`), and Electric Gold (`#FFB800`)
   - $\tau > 0.70$ (Solar Zone): Hyper-Orange (`#FF5500`) to Plasma Crimson (`#FF0055`)

3. **Wind Turbulence & Noise Frequency ($W_{\text{max}} \in [0, 100]\text{ km/h}$):**
   $$\text{noiseScale} = 0.6 + \left(\frac{W_{\text{max}}}{100}\right) \times 3.4$$
   $$\text{particleSpeed} = 0.5 + \left(\frac{W_{\text{max}}}{25}\right)$$

4. **Precipitation & Geometry Complexity ($R_{\text{sum}} \in [0, 100]\text{ mm}$):**
   $$\text{spikeAmplitude} = 0.25 + \min\left(1.5, \frac{R_{\text{sum}}}{30}\right)$$
   $$\text{particleCount} = 1500 + \lfloor \min(4000, R_{\text{sum}} \times 60) \rfloor$$

---

## Getting Started

### Prerequisites
- Node.js 18+ (tested on Node v20/v26)
- npm or pnpm

### Installation

1. Clone repository:
   ```bash
   git clone https://github.com/Rasshqa/chronoweave.git
   cd chronoweave
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

4. Run deterministic mapping formula test suite:
   ```bash
   npm test
   ```

5. Build for production:
   ```bash
   npm run build
   ```

6. Start local production server:
   ```bash
   npm start
   # Server runs at http://localhost:3000
   ```

---

## Project Structure

```
chronoweave/
├── prisma/
│   └── schema.prisma                # ArtworkArchive PostgreSQL model
├── src/
│   ├── app/
│   │   ├── layout.tsx               # Root layout with dark mode
│   │   ├── globals.css              # Tailwind v4 theme variables
│   │   ├── page.tsx                 # Split-screen generative studio
│   │   ├── gallery/
│   │   │   └── page.tsx             # Public community minted archive
│   │   ├── artifact/[seedHash]/
│   │   │   ├── page.tsx             # Server-rendered permalink view
│   │   │   └── ArtifactClientView.tsx # Interactive 3D/2D permalink client
│   │   └── api/
│   │       ├── telemetry/route.ts   # Open-Meteo Geocoding + Archive proxy
│   │       └── gallery/route.ts     # Save and fetch community artifacts
│   ├── components/
│   │   └── studio/
│   │       ├── TelemetryControlPanel.tsx # Left sidebar controls & presets
│   │       ├── SculptureViewport3D.tsx   # Three.js R3F custom GLSL shader
│   │       ├── FlowFieldViewport2D.tsx   # HTML5 2D canvas Simplex particles
│   │       ├── TelemetryHudOverlay.tsx   # Precision corner HUD readouts
│   │       └── PosterExportEngine.tsx    # Offscreen High-DPI 4K canvas compositor
│   └── lib/
│       ├── prng.ts                  # cyrb128 hash & mulberry32 seeded PRNG
│       ├── mappingEngine.ts         # Deterministic weather to visual mapping
│       ├── presets.ts               # Curated historical presets
│       └── db.ts                    # Prisma client with in-memory fallback
└── tests/
    └── mapping.test.ts              # Automated formula verification tests
```

---

## License
MIT License. Built by Rasshqa for the Portfolio Batch project.
