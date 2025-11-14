# claude-tmux

CLI utility for running long-running processes in tmux with automatic directory-based session management.

Built for [Claude Code](https://claude.ai/code) to manage dev servers, builds, and watchers with live output visibility.

## TL;DR

```bash
npm link                          # Install globally
claude-tmux exec "npm run dev"    # Start server
claude-tmux read                  # Check output
claude-tmux connect               # User: attach to session
```

Session auto-detected from directory. Multiple windows per session. Zero config.

## Installation

```bash
git clone https://github.com/witqq/claude-tmux-cli.git
cd claude-tmux-cli
npm link
```

The `claude-tmux` command will be globally available.

## Quick Start

```bash
# Navigate to your project
cd /path/to/your-project

# Start a dev server
claude-tmux exec "npm run dev"

# Start another process in a named window
claude-tmux exec worker "npm run worker"

# Read output
claude-tmux read --lines 20

# User: connect to see live output
claude-tmux connect
```

## Why claude-tmux?

When Claude Code runs long processes (servers, builds), you want to:
- See live output in real-time
- Keep processes running after detach
- Manage multiple processes per project
- Have one place to view everything

## Core Concept

**Session per Directory**
- Each project directory gets its own tmux session
- Session ID auto-detected from path (SHA256 hash)
- Nested directories find parent session
- Override with `--session <name>` if needed

**Simple API**
- `exec` - runs commands (creates windows automatically)
- `read` - shows output
- `connect` - attaches user to session
- Window name optional (defaults to "default")

## Commands

### Basic Usage

```bash
claude-tmux exec [window-name] <command>    # Run command
claude-tmux read [window-name]              # Read output
claude-tmux connect                         # Attach to session
claude-tmux list                            # List all windows
```

### Window Management

```bash
claude-tmux kill <window-name>              # Kill specific window
claude-tmux kill-session                    # Kill entire session
claude-tmux status [window-name]            # Show status
claude-tmux clear [window-name]             # Clear history
claude-tmux ctrl-c [window-name]            # Send Ctrl+C
```

### Options

- `--session <name>` - Use explicit session (overrides auto-detection)
- `--lines N` - Number of lines to read (default: 100)

## Examples

### Single Server

```bash
cd /path/to/backend
claude-tmux exec "npm run start"
claude-tmux read --lines 50
```

### Multiple Services

```bash
cd /path/to/project

claude-tmux exec api "npm run start:api"
claude-tmux exec web "npm run start:web"
claude-tmux exec db "docker-compose up postgres"

claude-tmux list
# Shows all 3 windows in one session
```

### Parent Directory Search

```bash
cd /path/to/project
claude-tmux exec api "npm start"

cd /path/to/project/frontend
claude-tmux exec web "npm run dev"
# Uses same session as parent directory
```

### Explicit Session

```bash
# Override auto-detection
claude-tmux --session production exec "ssh prod-server"
claude-tmux --session production read --lines 100
```

## For Claude Code

Add to your global `CLAUDE.md`:

```markdown
#### claude-tmux (длительные процессы)

CLI для запуска долгих задач (dev серверы, сборки) в tmux. Пользователь видит live output через attach.

Команды: `claude-tmux exec "npm start"`, `claude-tmux read`, `claude-tmux connect`

Ссылка: @/path/to/claude-tmux-cli/CLAUDE_GUIDE.md
```

This enables Claude to use tmux for long-running processes automatically.

## How It Works

1. **Auto-Detection**: Session ID = hash(current_directory)
2. **First Window**: Initial bash window renamed to your window name
3. **No Metadata**: All info from tmux API (no JSON files)
4. **Direct Attach**: `connect` command attaches immediately

## Technical Details

- **Socket**: `-L claude-dev` (shared)
- **Sessions**: `claude-session-<hash>` (hash = SHA256 first 12 chars)
- **Windows**: Persistent bash shells
- **Platform**: macOS, Linux

## License

MIT
