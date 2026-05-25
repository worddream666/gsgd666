# Monster Kingdom

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/PHP-777BB4?style=flat-square&logo=php&logoColor=white" alt="PHP">
  <img src="https://img.shields.io/badge/Engine-GameCreator-orange?style=flat-square" alt="GameCreator">
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License">
</p>

> Dedicated to all children who left their memories in Monster World

[English](README.md) | [简体中文](README_zh_CN.md)

---

## I. Project Introduction

Monster Kingdom is a 2D top-down ARPG (Action Role Playing Game) built on the GameCreator engine.

This project is a **nostalgic open-source recreation** of the classic 4399 web game "Monster World", created to preserve childhood memories for returning players.

### Core Features

- **Real-time Battle System** - Smooth ARPG combat experience
- **Multi-Controller Support** - Keyboard, Mouse, Gamepad
- **Plugin System** - Quests, Achievements, Forging, Reputation, etc.
- **Cloud Save** - Server-side save synchronization
- **Leaderboard** - Global player rankings

### Open Source Content

This project is fully open source, including:

| Module | Description | Status |
|--------|-------------|--------|
| Game Client | TypeScript source code | ✅ Open Source |
| Server Side | PHP API code | ✅ Open Source |
| Game Assets | Resources and configurations | ✅ Open Source |
| Documentation | Technical documentation | ✅ Open Source |

### Tech Stack

| Category | Technology | Description |
|----------|------------|-------------|
| Engine | GameCreator | Core game engine |
| Client | TypeScript | Game logic development |
| Server | PHP | API server |
| Database | JSON/File | Data storage |

---

## II. Game World Restoration

### Classic Maps

#### Lotus Village (Beginner Zone)
- Starting area for new players
- NPCs: 【Scout】Iron Dark, 【Scout】Iron Light, 【Moon咏Guide】Sister Hua, 【Reward Ambassador】Ah Chun, 【Blacksmith】Silver Forge
- Monsters: 【12】Captive Stick Bear, 【8】Captive Mischievous Monkey

#### Rainbow Forest
- Beginner leveling area
- Monsters: Naughty Pig, Mischievous Monkey
- BOSS: Naughty Pig Battle (waiting)

#### Rainbow Village
- Coastal fishing village
- Monsters: White Shark, Amphibious Fishman, Fishman Captain, White Shark Captain (waiting)
- Dungeon: Sawtooth Shark (optimizing)

#### Star Hunting City (In Development)
- Main city
- Features: Stall Market, Auction House, Caravan Escort
- NPCs: King, Chamber of Commerce President, Arena Manager

### Project Structure

```
gsgd-open/
├── Game/                      # Game Client
│   ├── game/                  # Main Game Logic
│   │   ├── GCMain.ts         # Game Entry Point
│   │   ├── GameGate.ts       # Scene Controller
│   │   └── project/          # Project Modules
│   │       ├── battle/       # Battle System
│   │       ├── controller/   # Input Control
│   │       ├── scene/        # Scene System
│   │       ├── ui/           # UI System
│   │       └── utils/        # Utilities
│   └── system/               # System Modules
│       ├── 锻造代码/         # Forging System
│       └── 副本/             # Dungeon System
├── fwq/                      # Server Side
│   ├── api.php               # Main API
│   ├── secure_save_api.php   # Encrypted Save
│   └── *.html                # Web Interfaces
├── asset/                    # Game Resources
│   ├── audio/                # Audio Assets
│   ├── image/                # Image Assets
│   ├── json/                 # UI Configs
│   └── language/             # Language Packs
```

---

## III. Module Architecture

### 3.1 Core Modules

#### Game Entry (GCMain)

```typescript
let Game: ProjectGame = new ProjectGame();
GameGate.start();
```

#### Scene Controller (GameGate)

Manages scene transitions, save/load operations.

| State | Description |
|-------|-------------|
| `STATE_0` | Leave Scene |
| `STATE_1` | Load Scene |
| `STATE_2` | Execute Enter Events |
| `STATE_3` | Scene Complete |
| `STATE_4` | Player Control Start |

#### Battle System (GameBattle)

Core battle flow control, refreshes every 6 frames (~100ms).

### 3.2 UI System

| Interface | File | Description |
|-----------|------|-------------|
| Main | `GUI_Main.ts` | Status bar, quick actions |
| Skills | `GUI_Skill.ts` | Skill list, details |
| Bag | `GUI_Bag.ts` | Item management |
| Actor | `GUI_Actor.ts` | Attribute view |
| Quest | `Lmkrt_GUI_Mission.ts` | Quest tracking |
| Achievement | `Lmkrt_GUI_Achievement.ts` | Achievement unlock |
| Reputation | `Lmkrt_GUI_Favor.ts` | NPC reputation |
| Forging | `Crafting_system.ts.ts` | Equipment enhancement |

### 3.3 Network System

#### Server API (fwq/)

| File | Function |
|------|----------|
| `api.php` | Account, Save, Leaderboard |
| `secure_save_api.php` | Encrypted Save |
| `index.html` | Login Page |
| `ranking.html` | Leaderboard |
| `chat.html` | Chat Room |
| `save_load.html` | Cloud Save |

---

## IV. Getting Started

### Prerequisites

- Node.js >= 16
- PHP >= 7.4
- Web Server (Nginx/Apache)

### Installation

```bash
# Clone repository
git clone https://github.com/worddream666/gsgd666.git
cd gsgd666

# Install dependencies
npm install
```

### Development

```bash
# Development mode (watch compilation)
npm run watch

# Build project
npm run build
```

### Deployment

#### Frontend
1. Build: `npm run build`
2. Deploy `Game/dist/` to web server

#### Backend
1. Deploy `fwq/` to PHP server
2. Configure database connection
3. Set keys (required for production)

---

## V. Copyright Notice

### 5.1 Project Nature Statement

⚠️ **Important Notice**: This project is an open-source project for **learning, communication, and code demonstration**. The purpose of this project is:

- 🎓 **Learning & Communication**: For game development enthusiasts to learn 2D ARPG game development techniques
- 💡 **Code Demonstration**: Demonstrating game development practices with GameCreator engine and PHP backend
- 🎮 **Nostalgic Preservation**: Preserving classic game code implementations for old players to reminisce

### 5.2 Disclaimer

⚠️ **Important**: This project **does not guarantee** that every user can successfully run and deploy the development environment!

Due to the following reasons, we cannot guarantee that all users will successfully run this project:
- Different versions of GameCreator engine may cause compatibility issues
- PHP environment configuration differences may affect server-side operation
- Network environment and port configuration may vary
- Dependency version differences may cause build failures

**If you encounter environment configuration issues, this is normal.** We recommend:
- Refer to GameCreator official documentation
- Check PHP environment configuration guides
- Adjust according to your actual environment

### 5.3 Copyright Attribution

1. This project is a **non-commercial nostalgic project** created solely for preserving childhood memories. No commercial use is intended.

2. All original game assets, story content, and world settings are copyrighted by **Ninja Cat Studio** and **4399 Network Co., Ltd.**

3. All self-developed server and client code is released under the **MIT License**, freely usable, modifiable, and distributable for learning, communication, and nostalgic preservation.

4. If the original copyright holder believes this project infringes on legitimate rights, please contact me and I will immediately remove all related content.

---

## VI. Our Childhood Memories

I still remember that summer in elementary school, when I first clicked on that icon in 4399 and rushed into Rainbow Forest. I followed Congcong Pig and defeated my first Naughty Pig. I saved materials for a long time, forged step by step, and finally made that much-desired Fox Set. Looking at the power on the panel, I thought this world would always be here, waiting for us to explore, waiting for us to defeat all monsters, waiting for us to finish all dungeons with friends.

Years later, we learned that starting from 2015, the development team faced financial difficulties. Without new updates, players gradually left. To survive, the studio had to shift to mobile games. Monster World eventually shut down. In the autumn of 2018, the server was gone forever. The materials in our backpacks, the sets we saved for so long, the next meetings with friends - all disappeared in an instant.

Now this world is back. I rebuilt it and named it **Monster Kingdom**. This is not a commercial game, just a non-profit server for old players. No payments, no profits - just for those of us who miss it, to return to that world, put on our old gear, fight boars again, walk through the tropical rainforest again, and finish the dreams we never completed.

I don't want this memory to disappear again. So I made it open source. Even if I can't maintain it someday, others can continue. This world will always be here, **never shutting down again**.

---

## VII. Acknowledgments

- [GameCreator](https://www.gamecreator.com/) - Game engine
- All contributors
- All players who left memories in Monster World

---

<p align="center">
  <i>Dedicated to all children who once left their memories in that world</i>
</p>
