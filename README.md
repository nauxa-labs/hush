# 🤫 Hush

> **Focus in silence.**  
> A minimalist Focus Workspace with ambient sounds, YouTube playlists, and Kanban task management.

<p align="center">
  <img src="public/icon-512.png" alt="Hush Logo" width="120">
</p>

<p align="center">
  <strong>v2.0.0 "Phoenix" • by <a href="https://github.com/nauxa-labs">Nauxa Labs</a></strong>
</p>

---

## ✨ Features

### 🎵 Audio System
- **YouTube Playlist** - Add any YouTube video, drag to reorder, shuffle
- **Volume Control** - Independent volume for music and atmosphere
- **7 Curated Atmospheres** - Web Audio synthesized soundscapes:
  - Silence, Rainy Study, Café Corner, Ocean Dawn
  - Forest Morning, Fireplace, Night Rain

### ⏱️ Focus Timer
- **Pomodoro Timer** - Customizable focus cycles
- **Focus Mode Overlay** - Fullscreen distraction-free timer
- **Quick Presets** - 15, 25, 45, 60 minute options
- **Task Focus** - Focus on specific Kanban card

### 📋 Workspace
- **Kanban Board** - Drag-and-drop task cards
- **Multiple Workspaces** - Organize by project
- **Editable Names** - Double-click to rename
- **List View** - Alternative simple checkbox view

### 📊 Productivity
- **Statistics Tracking** - Sessions, minutes, streaks
- **Daily Goals** - Set and track focus targets
- **10 Achievements** - Unlock badges as you progress

### 🎨 Design
- **Dual Theme** - Glass Dark / Glass Light
- **Glassmorphism UI** - Modern translucent aesthetic
- **Smooth Animations** - Framer Motion powered

### 📱 Technical
- **PWA Installable** - Works on desktop & mobile
- **Offline-First** - Full offline detection
- **Privacy-First** - All data stays local

---

## 🚀 Quick Start

```bash
# Clone repository
git clone https://github.com/nauxa-labs/hush.git
cd hush

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React 19.0.0 |
| Bundler | Vite 5 |
| State | MobX |
| Styling | Tailwind CSS + CSS Variables |
| Animation | Framer Motion |
| DnD | @dnd-kit |
| Audio | Web Audio API + YouTube IFrame API |

---

## 📁 Project Structure

```
src/
├── components/
│   ├── audio/          # YouTube player, Ambient player
│   ├── focus/          # Timer, Focus overlay
│   ├── layout/         # AppShell, Sidebar, TopBar
│   ├── panels/         # Audio, Stats, Settings, Badges
│   ├── workspace/      # Kanban, Columns, Cards
│   └── ui/             # Toast, ConfirmDialog, etc.
├── lib/
│   ├── audio/          # AmbientEngine (Web Audio)
│   ├── services/       # Timer, Audio, Network, Storage
│   └── store/          # MobX stores
├── stores/             # AudioStore
└── contexts/           # React contexts
```

---

## 🔄 Migration from v1.x

Hush 2.0 is a complete rewrite from VanillaJS to React. Legacy code preserved in `_legacy/` folder.

| v1.x (Legacy) | v2.0 (Phoenix) |
|---------------|----------------|
| VanillaJS | React 19 |
| 6 procedural sounds | 7 curated atmospheres |
| Simple task list | Kanban board |
| Single workspace | Multiple workspaces |
| — | YouTube playlists |
| — | Offline detection |

---

## 📄 License

MIT License - feel free to use Hush for personal or commercial projects.

---

## 💜 Nauxa Labs

Hush is proudly developed by **Nauxa Labs**, building tools for focused productivity.

<p align="center">
  Made with focus 🤫
</p>
