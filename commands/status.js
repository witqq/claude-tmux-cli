const windowManager = require('../core/window-manager');
const { resolveSession } = require('../core/session-resolver');

function execute(args) {
  // If window name provided - show window status
  if (args.length >= 1) {
    const windowName = args[0];
    const result = windowManager.getStatus(windowName, global.explicitSession);

    if (!result.success) {
      console.error(`Error: ${result.error}`);
      process.exit(1);
    }

    console.log(`Window: ${result.windowName}`);
    console.log(`  PID: ${result.pid || 'unknown'}`);
    console.log(`  Window Index: ${result.window_index}`);
    console.log(`  Session: ${result.sessionName}`);
    console.log(`  Directory: ${result.directory}`);
    return;
  }

  // Otherwise show session status
  const sessionResult = resolveSession(global.explicitSession, process.cwd(), false);

  if (sessionResult.error) {
    console.error(`Error: ${sessionResult.error}`);
    process.exit(1);
  }

  console.log(`Session: ${sessionResult.sessionName}`);
  console.log(`Directory: ${sessionResult.directory}`);
  if (sessionResult.fromParent) {
    console.log('Using parent directory session');
  }

  const listResult = windowManager.listWindows(global.explicitSession);
  if (listResult.success) {
    console.log(`Windows: ${listResult.windows.length}`);
  }
}

module.exports = { execute };
