[![Latest Release](https://img.shields.io/github/v/release/YOUR_USERNAME/YOUR_REPO?color=blue&label=Download%20CALC.IO)](https://github.com/YOUR_USERNAME/YOUR_REPO/releases/latest)
[![Total Downloads](https://img.shields.io/github/downloads/YOUR_USERNAME/YOUR_REPO/total?color=green)](https://github.com/YOUR_USERNAME/YOUR_REPO/releases)

# CALC.IO — Retro STEM Workstation

## Download (Latest Release)
Find the latest prebuilt binaries and installers on the GitHub Releases page:

| Platform | Latest Release |
|---:|:---|
| macOS | [Download (DMG)](https://github.com/yukimusicxd-png/CALC.IO/releases/tag/v1.0.1) |
| Windows | [Download (MSI / EXE)](https://github.com/yukimusicxd-png/CALC.IO/releases/tag/v1.0.1) |
| Linux | [Download (AppImage / DEB)](https://github.com/yukimusicxd-png/CALC.IO/releases/tag/v1.0.1) |

---

Note for macOS Users:
If macOS says "CALC.IO is damaged and can't be opened", open Terminal and run:
xattr -cr /Applications/CALC.IO.app
For a visual step-by-step walkthrough on fixing this issue, check out this guide on How to Fix App is damaged and can't be opened Error on Mac. It demonstrates how to clear the Gatekeeper quarantine flag so third-party software runs smoothly.

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

## Screenshots
<img width="1710" height="1107" alt="Screenshot 2026-07-25 at 11 29 23 PM" src="https://github.com/user-attachments/assets/d8852ffd-7c70-4d94-908f-011d2c6f5e6f" />
<img width="1710" height="1107" alt="Screenshot 2026-07-25 at 11 29 06 PM" src="https://github.com/user-attachments/assets/73a3529d-823f-41df-8193-7c35fd6c4306" />
<img width="1710" height="1107" alt="Screenshot 2026-07-25 at 11 28 59 PM" src="https://github.com/user-attachments/assets/65cb9d92-5aff-4af7-93f1-9cb4d3a6a3d5" />
<img width="1710" height="1107" alt="Screenshot 2026-07-25 at 11 28 26 PM" src="https://github.com/user-attachments/assets/c560b3be-9e01-442f-ba27-3ab00ff0b5ef" />
<img width="1710" height="1107" alt="Screenshot 2026-07-25 at 11 28 18 PM" src="https://github.com/user-attachments/assets/3fa030c1-efc7-4620-b1f5-aad6b9a03345" />
<img width="1710" height="1107" alt="Screenshot 2026-07-25 at 11 28 12 PM" src="https://github.com/user-attachments/assets/16261011-5f09-4138-a819-f87759bc47c0" />
<img width="1710" height="1107" alt="Screenshot 2026-07-25 at 11 28 06 PM" src="https://github.com/user-attachments/assets/4ad5e855-4d70-43b8-a214-f6ea4a4982ef" />
<img width="1710" height="1107" alt="Screenshot 2026-07-25 at 11 27 59 PM" src="https://github.com/user-attachments/assets/f81eb2c4-ec70-45af-9c0d-9de092030c15" />
<img width="1710" height="1107" alt="Screenshot 2026-07-25 at 11 27 52 PM" src="https://github.com/user-attachments/assets/88534709-fd1b-492c-b617-54b4f824d69e" />


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
