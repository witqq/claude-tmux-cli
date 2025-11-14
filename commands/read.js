const windowManager = require('../core/window-manager');

function execute(args) {
  let windowName = 'default';
  let lines = 100;

  // Parse arguments
  if (args.length >= 1 && args[0] !== '--lines') {
    windowName = args[0];
  }

  // Parse --lines flag
  const linesIndex = args.indexOf('--lines');
  if (linesIndex !== -1 && args[linesIndex + 1]) {
    lines = parseInt(args[linesIndex + 1]);
    if (isNaN(lines) || lines <= 0) {
      console.error('Error: --lines must be a positive number');
      process.exit(1);
    }
  }

  const result = windowManager.readOutput(windowName, lines, global.explicitSession);

  if (!result.success) {
    console.error(`Error: ${result.error}`);
    if (result.details) {
      console.error(`Details: ${result.details}`);
    }
    process.exit(1);
  }

  console.log(result.output);
}

module.exports = { execute };
