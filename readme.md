# Harbor Royale Slots

Harbor Royale is a polished browser slot machine built with **PixiJS** and **GSAP**. It takes the original prototype and turns it into a full casino-style mini game with a themed cabinet UI, responsive reel window, weighted symbols, paylines, wilds, scatters, animated win feedback, and ambient harbor touches like floating bubbles.

![Game Gameplay Preview](./assets/screenshot.png)

## Portfolio Note

This project was developed with my own direction and final decision-making, using an LLM coding assistant as a collaborative implementation tool for parts of the UI, gameplay logic, and polish work.

## Highlights

- Casino-style presentation with a responsive machine cabinet, compact HUD, paytable, and control deck.
- 3x3 reel setup with up to 5 active paylines.
- Weighted symbol generation for more slot-like outcomes.
- Per-symbol payouts for 2-of-a-kind and 3-of-a-kind wins.
- Treasure Chest wilds and Seastar scatter bonuses.
- Animated paylines, burst particles, cabinet pulse, and win callouts.
- In-browser sound effects for spin, reel stops, and win states.
- Responsive layout work so the reels and controls stay visible together across desktop and smaller screens.

## Tech Stack

| Component | Technology | Purpose |
| :--- | :--- | :--- |
| Rendering | PixiJS | Reel rendering, cabinet effects, particles |
| Animation | GSAP | Reel motion, UI feedback, win effects |
| Language | JavaScript (ES Modules) | Game logic and interaction flow |
| Styling | CSS | Responsive slot machine layout and visual design |

## Game Features

- **Active paylines:** Play from 1 to 5 lines and scale the total bet dynamically.
- **Coin bet control:** Cycle bet size without leaving the main machine view.
- **Wild system:** Treasure chests substitute for line symbols and can trigger jackpot-style wins.
- **Scatter system:** Seastars pay anywhere on the reels.
- **Win feedback:** Winning lines, symbol pulses, count-up win badge, and celebration overlays make results easier to read.
- **Harbor theme:** Nautical symbols, premium navy-and-gold cabinet treatment, and soft bubble motion inside the reel window support the Harbor Royale identity.

## Project Structure

```text
├── assets/             # Symbol art and screenshot assets
├── index.html          # App shell and slot machine UI structure
├── main.js             # Pixi scene, reel logic, payouts, effects, sound
├── style.css           # Responsive cabinet layout and visual styling
└── readme.md           # Project documentation
```

## Running Locally

Because this is a static browser project, you can run it with any simple local server. For example:

```bash
python3 -m http.server
```

Then open the local address in your browser and load `index.html`.
