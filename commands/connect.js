const { resolveSession } = require('../core/session-resolver');
const { execSync } = require('child_process');

function execute(args) {
  const sessionResult = resolveSession(global.explicitSession, process.cwd(), true);

  if (sessionResult.error) {
    console.error(`Error: ${sessionResult.error}`);
    if (sessionResult.details) {
      console.error(`Details: ${sessionResult.details}`);
    }
    process.exit(1);
  }

  const sessionName = sessionResult.sessionName;

  // Execute tmux attach directly
  try {
    execSync(`tmux -L claude-dev attach -t ${sessionName}`, { stdio: 'inherit' });
  } catch (err) {
    console.error(`Failed to attach to session: ${err.message}`);
    process.exit(1);
  }
}

module.exports = { execute };
