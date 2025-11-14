const windowManager = require('../core/window-manager');

function execute(args) {
  if (args.length < 1) {
    console.error('Usage: claude-tmux kill <window-name>');
    process.exit(1);
  }

  const windowName = args[0];

  const result = windowManager.killWindow(windowName, global.explicitSession);

  if (!result.success) {
    console.error(`Error: ${result.error}`);
    if (result.details) {
      console.error(`Details: ${result.details}`);
    }
    process.exit(1);
  }

  console.log(`Killed window "${windowName}"`);
}

module.exports = { execute };
