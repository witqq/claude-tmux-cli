const windowManager = require('../core/window-manager');

function execute(args) {
  const windowName = args.length >= 1 ? args[0] : 'default';

  const result = windowManager.clearHistory(windowName, global.explicitSession);

  if (!result.success) {
    console.error(`Error: ${result.error}`);
    if (result.details) {
      console.error(`Details: ${result.details}`);
    }
    process.exit(1);
  }

  console.log(`Cleared history for window "${windowName}"`);
}

module.exports = { execute };
