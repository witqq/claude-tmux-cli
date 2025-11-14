const sessionManager = require('../core/session-manager');
const { resolveSession } = require('../core/session-resolver');

function execute(args) {
  const sessionResult = resolveSession(global.explicitSession, process.cwd(), false);

  if (sessionResult.error) {
    console.error(`Error: ${sessionResult.error}`);
    process.exit(1);
  }

  const result = sessionManager.killSession(sessionResult.sessionName);

  if (!result.success) {
    console.error(`Error: ${result.error}`);
    if (result.details) {
      console.error(`Details: ${result.details}`);
    }
    process.exit(1);
  }

  console.log(`Killed session: ${sessionResult.sessionName}`);
  console.log(`Directory: ${sessionResult.directory}`);
}

module.exports = { execute };
