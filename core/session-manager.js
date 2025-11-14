const tmux = require('./tmux-wrapper');
const { resolveSession } = require('./session-resolver');

/**
 * Initialize session (auto-resolve or explicit)
 */
function initSession(explicitSession = null, cwd = process.cwd()) {
  const result = resolveSession(explicitSession, cwd, true);

  if (result.error) {
    return { success: false, error: result.error, details: result.details };
  }

  return {
    success: true,
    sessionName: result.sessionName,
    directory: result.directory,
    created: result.created,
    fromParent: result.fromParent
  };
}

/**
 * Kill session by name
 */
function killSession(sessionName) {
  if (!tmux.sessionExists(sessionName)) {
    return { success: false, error: 'Session does not exist' };
  }

  const result = tmux.killSession(sessionName);
  return result;
}

/**
 * Get session info
 */
function getSessionInfo(sessionName) {
  const exists = tmux.sessionExists(sessionName);

  if (!exists) {
    return { exists: false, sessionName };
  }

  const windowsResult = tmux.listWindows(sessionName);
  return {
    exists: true,
    sessionName,
    windows: windowsResult.success ? windowsResult.windows : []
  };
}

module.exports = {
  initSession,
  killSession,
  getSessionInfo
};
