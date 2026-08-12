# OpenCode Desktop

A modern, lightweight Linux desktop GUI wrapper for [OpenCode](https://opencode.ai), built with Tauri v2 + React 19 + TypeScript + Tailwind CSS.

## Features

- **Session Browser** — Browse, search, rename, and delete OpenCode sessions from a native sidebar
- **Chat Viewer** — Read user/assistant messages with properly parsed content from OpenCode's SQLite database
- **Model Selector** — Modal popup to search and select from 88+ AI models grouped by provider
- **Image Paste** — Paste screenshots via Ctrl+V or drag-and-drop files directly into the chat
- **Project Folders** — Create new project folders or select existing ones for each session
- **Tool Call Viewer** — Expandable tool call blocks with args and results
- **System Theme** — Automatically follows your KDE/GNOME dark/light theme (Catppuccin palette)
- **Smooth Animations** — Framer Motion throughout: slide-in panels, spring transitions, hover effects
- **Native Feel** — Built with Tauri for minimal resource usage and native performance

## Screenshots

> Screenshots coming soon.

## Requirements

- Linux (Fedora KDE recommended)
- OpenCode CLI installed and in PATH
- Node.js 20+ and pnpm (for development)
- Rust toolchain (for development/building)

## Development

### Prerequisites

```bash
# Fedora
sudo dnf install webkit2gtk4.1-devel gtk3-devel openssl-devel curl wget file

# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Node.js (via fnm or nvm)
fnm install 20

# Install pnpm
npm install -g pnpm
```

### Setup

```bash
git clone https://github.com/opencode-desktop/opencode-desktop.git
cd opencode-desktop
pnpm install
```

### Run in Development

```bash
pnpm tauri dev
```

### Build for Production

```bash
pnpm tauri build
```

The RPM package will be at:
```
src-tauri/target/release/bundle/rpm/opencode-desktop-0.1.0-1.x86_64.rpm
```

## Packaging

### RPM (Fedora)

```bash
pnpm tauri build
# Output: src-tauri/target/release/bundle/rpm/
sudo rpm -i src-tauri/target/release/bundle/rpm/opencode-desktop-*.rpm
```

### Flatpak

```bash
# Install dependencies for offline builds
pipx install git+https://github.com/flatpak/flatpak-builder-tools.git

# Generate offline sources
flatpak-node-generator --no-requests-cache -o flatpak/npm-sources.json pnpm pnpm-lock.yaml
python3 flatpak-builder-tools/cargo/flatpak-cargo-generator.py \
  -o flatpak/cargo-sources.json src-tauri/Cargo.lock

# Build and install
flatpak-builder --force-clean --user --repo=repo --install builddir flatpak/org.opencode.desktop.yml
```

## Architecture

```
┌──────────────┬───────────────────────────────────────┐
│  Sidebar     │  ChatArea                             │
│  (280px)     │  (flex-1)                             │
│              │                                       │
│  [🔍 Search] │  ┌─ MessageBubble (user) ───────────┐ │
│              │  │ "What does this code do?"        │ │
│  Session 1   │  └──────────────────────────────────┘ │
│  Session 2   │  ┌─ MessageBubble (assistant) ──────┐ │
│  Session 3   │  │ "This code reads a file..."      │ │
│              │  │ [▶ 2 tool calls]                │ │
│              │  │   └ read_file: {path: "..."}     │ │
│              │  └──────────────────────────────────┘ │
│              │                                       │
│              ├───────────────────────────────────────┤
│              │  StatusBar                            │
│              │  Model: mimo-v2.5-free · 42 messages  │
│              ├───────────────────────────────────────┤
│              │  InputBar                             │
│              │  📁 ~/project ▾ [Browse] [+ New]      │
│              │  [📎] [Type message...]       [▶]    │
│              │  [img1.png ✕]                         │
└──────────────┴───────────────────────────────────────┘
```

## How It Works

### Data Flow

- **Session browsing**: Rust backend reads `~/.local/share/opencode/opencode.db` via rusqlite
- **Message content**: Text extracted from the `part` table (`{"type":"text","text":"..."}`)
- **Tool calls**: Mapped from `{"type":"tool","tool":"websearch","state":{...}}` parts
- **Model selection**: Cached at `~/.cache/opencode/models.json`, override persisted per-session
- **New sessions**: Spawns `opencode run --dir {project} {prompt} -f {images} --model {provider/model}`
- **Images**: Saved to temp directory, attached via CLI `-f` flag

### OpenCode Storage

The app reads from OpenCode's SQLite database at:
- `~/.local/share/opencode/opencode.db` — sessions, messages, parts, projects

Key tables queried:
- `session` — session list with title, model, cost, timestamps
- `message` — message metadata (role, model, tokens, cost)
- `part` — actual content: text, tool calls, reasoning, step markers
- `project` — registered working directories

Model cache:
- `~/.cache/opencode/models.json` — all available models from all providers
- `~/.local/state/opencode/model.json` — recently used model state

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Desktop shell | Tauri v2 (Rust) |
| Frontend | React 19, TypeScript, Tailwind CSS |
| Animations | Framer Motion |
| Database | rusqlite (direct SQLite read) |
| CLI integration | `opencode run` with JSON output |
| Theming | Catppuccin Mocha/Latte via CSS custom properties |

## Project Structure

```
opencode-desktop/
├── src/                          # React frontend
│   ├── components/               # UI components
│   │   ├── Sidebar.tsx           # Session list with search
│   │   ├── SessionItem.tsx       # Session card with context menu
│   │   ├── ChatArea.tsx          # Message list
│   │   ├── MessageBubble.tsx     # Individual message
│   │   ├── ToolCallBlock.tsx     # Expandable tool call
│   │   ├── InputBar.tsx          # Message input + attachments
│   │   ├── ModelSelector.tsx     # Model picker modal
│   │   ├── ProjectFolderPicker.tsx
│   │   ├── ImageAttachment.tsx   # Pending image thumbnail
│   │   ├── StatusBar.tsx         # Bottom info bar
│   │   └── ContextMenu.tsx       # Right-click menu
│   ├── hooks/                    # React hooks
│   ├── lib/                      # Types, commands, utils
│   └── index.css                 # Theme + animations
├── src-tauri/                    # Rust backend
│   ├── src/
│   │   ├── commands/             # Tauri IPC commands
│   │   ├── db/                   # SQLite queries + types
│   │   ├── attachment.rs         # Temp image management
│   │   ├── lib.rs                # Command registration
│   │   └── main.rs               # Entry point
│   └── Cargo.toml
├── flatpak/                      # Flatpak packaging
└── package.json
```

## Configuration

### Environment Variables

- `OPENCODE_DB` — Override the database path
- `PATH` — Must include the `opencode` binary

### Supported Image Formats

- PNG, JPEG, GIF, WebP, BMP, SVG
- Pasted from clipboard (Ctrl+V)
- Drag-and-dropped from file manager

## License

MIT
