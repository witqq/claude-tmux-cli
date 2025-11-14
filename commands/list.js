const windowManager = require('../core/window-manager');

function execute(args) {
  const result = windowManager.listWindows(global.explicitSession);

  if (!result.success) {
    console.error(`Error: ${result.error}`);
    process.exit(1);
  }

  if (result.windows.length === 0) {
    console.log('No windows in session');
    return;
  }

  console.log(`Session: ${result.sessionName}`);
  console.log(`Directory: ${result.directory}`);
  if (result.fromParent) {
    console.log('(Using parent directory session)');
  }
  console.log();
  result.windows.forEach(w => {
    console.log(`  ${w.index}: ${w.name} (PID: ${w.pid || 'unknown'})`);
  });
}

module.exports = { execute };
