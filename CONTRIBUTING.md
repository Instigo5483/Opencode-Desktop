# Contributing to OpenCode Desktop

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing.

## Getting Started

### Prerequisites

- **Node.js** 20+ (via fnm, nvm, or system package manager)
- **pnpm** (package manager)
- **Rust** toolchain (via rustup)
- **System dependencies** (Fedora):
  ```bash
  sudo dnf install webkit2gtk4.1-devel gtk3-devel openssl-devel curl wget file
  ```

### Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/opencode-desktop.git
   cd opencode-desktop
   ```

2. Install Node.js dependencies:
   ```bash
   pnpm install
   ```

3. Start the development server:
   ```bash
   pnpm tauri dev
   ```

## Project Structure

```
opencode-desktop/
├── src/                  # React frontend (TypeScript)
│   ├── components/       # UI components
│   ├── hooks/            # React hooks
│   └── lib/              # Types, commands, utilities
├── src-tauri/            # Rust backend
│   ├── src/
│   │   ├── commands/     # Tauri IPC commands
│   │   └── db/           # SQLite queries & types
│   └── Cargo.toml
├── flatpak/              # Flatpak packaging
└── package.json
```

## Development Guidelines

### Code Style

- **TypeScript**: Follow the existing code style. Use `npx tsc --noEmit` to check types.
- **Rust**: Follow standard `rustfmt` formatting. Run `cargo fmt` before committing.
- **CSS**: Use Tailwind CSS with CSS variables for theming.

### Commit Messages

Use conventional commits:
- `feat: add new feature`
- `fix: resolve bug`
- `docs: update documentation`
- `refactor: restructure code`
- `test: add tests`
- `chore: maintenance tasks`

### Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/my-feature`)
3. Make your changes
4. Ensure TypeScript and Rust compile without errors
5. Commit with a descriptive message
6. Push to your fork and open a Pull Request

### What to Contribute

- Bug fixes
- New features (discuss in an issue first)
- Documentation improvements
- Test coverage
- Performance optimizations
- Accessibility improvements

## Building for Production

### RPM (Fedora)

```bash
pnpm tauri build
# Output: src-tauri/target/release/bundle/rpm/
```

### Flatpak

```bash
# See flatpak/ directory for manifest and instructions
```

## Reporting Issues

When reporting bugs, please include:
- Operating system and version
- OpenCode version
- Steps to reproduce
- Expected vs actual behavior
- Console errors (if any)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
