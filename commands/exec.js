const windowManager = require('../core/window-manager');

function execute(args) {
  if (args.length < 1) {
    console.error('Usage: claude-tmux exec [window-name] <command>');
    console.error('  If window-name omitted, uses "default"');
    process.exit(1);
  }

  // Check if first arg looks like a command (contains spaces, starts with common commands)
  const firstArg = args[0];
  const looksLikeCommand = firstArg.includes(' ') ||
                          firstArg.startsWith('npm') ||
                          firstArg.startsWith('node') ||
                          firstArg.startsWith('python') ||
                          firstArg.startsWith('docker') ||
                          firstArg.startsWith('cd') ||
                          firstArg.startsWith('./');

  let windowName, command;

  if (args.length === 1 || looksLikeCommand) {
    // Only command provided, use "default" window
    windowName = 'default';
    command = args.join(' ');
  } else {
    // Window name + command
    windowName = args[0];
    command = args.slice(1).join(' ');
  }

  const result = windowManager.execCommand(windowName, command, global.explicitSession);

  if (!result.success) {
    console.error(`Error: ${result.error}`);
    if (result.details) {
      console.error(`Details: ${result.details}`);
    }
    process.exit(1);
  }

  console.log(`Executed in window "${windowName}"`);
}

module.exports = { execute };
