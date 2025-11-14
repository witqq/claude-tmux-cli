#!/usr/bin/env node

// Parse --session flag
let explicitSession = null;
const args = process.argv.slice(2);
const sessionIndex = args.indexOf('--session');

if (sessionIndex !== -1 && args[sessionIndex + 1]) {
  explicitSession = args[sessionIndex + 1];
  // Remove --session and its value from args
  args.splice(sessionIndex, 2);
}

// Store in global for commands to access
global.explicitSession = explicitSession;

const commands = {
  'exec': require('../commands/exec'),
  'read': require('../commands/read'),
  'list': require('../commands/list'),
  'kill': require('../commands/kill'),
  'status': require('../commands/status'),
  'connect': require('../commands/connect'),
  'clear': require('../commands/clear'),
  'ctrl-c': require('../commands/ctrl-c'),
  'kill-session': require('../commands/kill-session')
};

if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
  console.log('claude-tmux - CLI for working with tmux windows');
  console.log();
  console.log('Usage: claude-tmux [--session <name>] <command> [options]');
  console.log();
  console.log('Commands:');
  console.log('  connect                       Attach to session (create if needed)');
  console.log('  exec [name] <command>         Execute command (creates window if needed, default: "default")');
  console.log('  read [name] [--lines N]       Read output (default window: "default", lines: 100)');
  console.log('  list                          List all windows');
  console.log('  kill <name>                   Kill specific window');
  console.log('  status [name]                 Show session/window status');
  console.log('  clear [name]                  Clear window history (default: "default")');
  console.log('  ctrl-c [name]                 Send Ctrl+C to window (default: "default")');
  console.log('  kill-session                  Kill entire session');
  console.log();
  console.log('Flags:');
  console.log('  --session <name>              Use explicit session (override auto-detection)');
  console.log();
  console.log('Concept: Session per directory (auto-detected from cwd)');
  console.log('  - Session ID = hash(current_directory)');
  console.log('  - Nested dirs search for parent session');
  console.log('  - Window name optional (default: "default")');
  console.log('  - Use --session to override auto-detection');
  process.exit(0);
}

const command = args[0];
const commandArgs = args.slice(1);

if (!commands[command]) {
  console.error(`Unknown command: ${command}`);
  console.error('Run "claude-tmux --help" for usage');
  process.exit(1);
}

commands[command].execute(commandArgs);
