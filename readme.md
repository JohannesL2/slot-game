# Fruit Reels Slots

[![CI](https://github.com/JohannesL2/slot-game/actions/workflows/ci.yml/badge.svg)](https://github.com/JohannesL2/slot-game/actions/workflows/ci.yml)
![License](https://img.shields.io/github/license/JohannesL2/slot-game)

Fruit Reels is a browser slot machine built with **TypeScript**, **PixiJS**, and **GSAP**. The project emphasizes robust RNG logic, pixel-art aesthetics, and a fully automated testing environment.

<img width="800" height="420" alt="video" src="https://github.com/user-attachments/assets/a3346b7f-06ba-4266-b657-0b42a2dcb2dd" />

<img src="./assets/screenshot.png" width="800" height="420" alt="Preview image" />

## Portfolio Note

This project was developed with my own direction and final decision-making, using an LLM coding assistant as a collaborative implementation tool for parts of the UI, gameplay logic, and polish work.

## Highlights

## Highlights
- **TypeScript Architecture:** Type-safe game logic and RNG engine implementation.
- **Automated Testing:** Comprehensive unit tests for reel generation and payout logic using **Jest**.
- **Continuous Integration (CI):** GitHub Actions workflow managing automated builds, linting, and testing on every push.
- **Classic Mechanics:** 3×3 grid with 5 active paylines, weighted symbol generation, and BAR wilds.
- **Visual Polish:** Spritesheet-driven pixel art, GSAP animations, and a responsive UI.

## Tech Stack

| Component | Technology | Purpose |
| :--- | :--- | :--- |
| **Language** | **TypeScript** | Type-safe game logic and slot engine |
| **Testing** | **Jest & ts-jest** | Unit testing for RNG and payout validation |
| **Rendering** | PixiJS | Reel rendering, spritesheet management, and particles |
| **Animation** | GSAP | Smooth reel motion, UI feedback, and win effects |
| **CI/CD** | GitHub Actions | Automated build and test pipeline |

## Game Features

- **Active paylines:** Play from 1 to 5 lines; total bet scales with coin bet × lines.
- **Coin bet control:** Cycle bet size from the control deck.
- **BAR wild:** Substitutes for line symbols; three BARs on a line pay the top line multiplier.
- **Cherry rule:** Cherries pay when 1, 2, or 3 appear from the left on an active payline.
- **Win feedback:** Winning lines, symbol pulses, count-up win badge, and celebration overlays.

## Credits
"Pixel art slot machine", by Vircon32 (Carra). Published at OpenGameArt under license CC-BY 4.0.
- **Source:** [OpenGameArt](https://opengameart.org/)

## Project Structure

```text
├── src/                # TypeScript source code
│   ├── rng.ts          # Core Slot Engine (RNG, grid generation)
│   └── rng.test.ts     # Unit tests for the engine
├── dist/               # Compiled JavaScript (Distribution)
├── assets/             # Spritesheets, audio, and images
├── index.html          # Main application entry point
├── package.json        # Dependencies and automation scripts
└── tsconfig.json       # TypeScript configuration
```

## Running Locally

Because this is a static browser project, you can run it with any simple local server. For example:

Install dependencies:
```bash
npm install
```

Build the project:
```bash
npm run build
```

3. Serve:
Open `index.html` using a local server (e.g., Live Server in VS Code) or use:
```bash
python3 -m http.server
```

Then open the local address in your browser and load `index.html`.
