[![Latest Release](https://img.shields.io/github/v/release/YOUR_USERNAME/YOUR_REPO?color=blue&label=Download%20CALC.IO)](https://github.com/YOUR_USERNAME/YOUR_REPO/releases/latest)
[![Total Downloads](https://img.shields.io/github/downloads/YOUR_USERNAME/YOUR_REPO/total?color=green)](https://github.com/YOUR_USERNAME/YOUR_REPO/releases)

# CALC.IO — Retro STEM Workstation

## Download (Latest Release)
Find the latest prebuilt binaries and installers on the GitHub Releases page:

| Platform | Latest Release |
|---:|:---|
| macOS | [Download (DMG)](https://github.com/yukimusicxd-png/CALC.IO/releases/latest) |
| Windows | [Download (MSI / EXE)](https://github.com/yukimusicxd-png/CALC.IO/releases/latest) |
| Linux | [Download (AppImage / DEB)](https://github.com/yukimusicxd-png/CALC.IO/releases/latest) |

---

## Project Overview
CALC.IO is a retro-styled, single-page STEM workstation built with modern web and native packaging tools. It combines interactive math, physics, chemistry, and geographic utilities with a nostalgic terminal aesthetic and a versatile plugin architecture.

The app ships as a web front-end and can be packaged as a native desktop application via Tauri for macOS, Windows, and Linux.

## Key Features
- Interactive Mathematics module: symbolic parsing, polynomial tools, numerical methods, complex numbers, geometry utilities.
- Physics suite: mechanics, circuits, optics, thermodynamics, and a live anti-gravity screensaver sandbox using Matter.js.
- Chemistry tools: stoichiometry, concentration calculators, pH and solution utilities.
- Geographic explorer: 3D globe and 2D map views (globe.gl + react-leaflet), search and weather overlays.
- Retro terminal UI with customizable themes and sound effects.
- Extensible modular UI with quick-launch footer and persistent settings.
- Cross-platform desktop packaging via Tauri with auto-update support.

## Tech Stack
- Frontend: React + Vite
- Physics: Matter.js
- Globe / Maps: globe.gl, react-leaflet
- Math: mathjs (plus custom numeric utilities)
- Charts: Chart.js
- Native Packaging: Tauri
- Build / CI: GitHub Actions

## Development
Install dependencies and run the dev server:

```bash
npm ci
npm run dev
```

Build production frontend assets:

```bash
npm run build
```

Package the app with Tauri (when Tauri toolchain & Rust are installed):

```bash
# build native bundles (macOS/Windows/Linux depend on platform)
npx tauri build
```

## Contributing
Contributions are welcome — open issues or submit pull requests on GitHub. See repository issues and PR templates for guidelines.

## License
This project is provided under the terms in the repository. Check `LICENSE` for details.
