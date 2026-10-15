# WoWPlaystyle

A Horizontal Progression Sandbox for Legacy MMO Theorycrafting

WoWPlaystyle is a browser-based design tool built to help players, modders, and theorycrafters engineer entirely new playstyles for classic MMO architectures. Instead of relying on vertical power creep or simple stat bloat, this app provides a visual canvas to design cross-discipline loadouts using existing legacy engine mechanics—what we call "Digital Duct Tape."

You can access the live tool directly from your browser here: https://wo-w-playstyle.vercel.app/

## The Concept

Traditional MMO progression forces players into a rigid, vertical climb. WoWPlaystyle explores a different approach: Horizontal Progression.

The goal isn't to make numbers bigger, but to fundamentally alter how a class interacts with the game world. By repurposing legacy engine mechanics—like aura stacking, ground-reticle targeting, and entity swapping—we can design radical new class roles without requiring a developer to rewrite the underlying game engine.

This app serves as your drafting board. Whether you want to turn a Warlock into a shape-shifting melee hybrid or a Warrior into a spatial tactician, this sandbox lets you map out the items, the crafting supply chains, and the engine workarounds required to make it happen.

## Features

- **Visual Tooltip Generator:** Create authentic, high-quality item tooltips for your custom gear pieces, complete with stat allocations and unique mechanical effects.
- **Crafting Supply Chain Flowcharts:** Map out the "Relic Restoration Heist." Visually connect the required server economy professions (Blacksmithing, Tailoring, Alchemy, etc.) needed to restore and assemble your custom loadout.
- **100% Local & Private:** There is no backend database tracking your ideas. All flowchart building, tooltip generation, and state management happens entirely in your local browser memory.
- **Save & Load Functionality:** Export your active workspace as a lightweight JSON file to your hard drive, and load it back up anytime to continue tweaking your design.
- **Image Export:** Instantly export your finished flowcharts and tooltips as clean, watermarked PNG images, ready to be shared directly to Discord or Reddit theorycrafting threads.
- **Wowhead Integration:** Need an icon for your custom spell or item? The app directs you straight to the Wowhead icon database for easy reference.

## Tech Stack

- **Framework:** Next.js / React
- **Styling:** Tailwind CSS
- **Hosting:** Vercel (Static Export)

## Running the App Locally

If you want to pull down the repository and run the sandbox on your own machine:

Clone the repository:

```bash
git clone https://github.com/krellian36/WoWPlaystyle.git
```

Navigate to the project directory:

```bash
cd WoWPlaystyle
```

Install the dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Feedback & Community

* **Read the Full Design Document:** [Modular Playstyles Design Document](./DESIGN_DOCUMENT.md)
