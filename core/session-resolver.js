const crypto = require('crypto');
const path = require('path');
const tmux = require('./tmux-wrapper');

/**
 * Hash path to session ID
 */
function hashPath(absolutePath) {
  return crypto.createHash('sha256')
    .update(absolutePath)
    .digest('hex')
    .substring(0, 12);
}

/**
 * Get session name from path
 */
function getSessionNameForPath(absolutePath) {
  const hash = hashPath(absolutePath);
  return `claude-session-${hash}`;
}

/**
 * Find parent directory session (search up tree)
 */
function findParentSession(currentDir) {
  let dir = currentDir;

  while (dir !== '/') {
    dir = path.dirname(dir);
    const sessionName = getSessionNameForPath(dir);

    if (tmux.sessionExists(sessionName)) {
      return { found: true, sessionName, directory: dir };
    }
  }

  return { found: false };
}

/**
 * Resolve session name (explicit or auto-detect)
 * @param {string|null} explicitSession - Explicit session name from --session flag
 * @param {string} cwd - Current working directory
 * @param {boolean} autoCreate - Auto-create session if not found
 * @returns {object} { sessionName, directory, created, fromParent }
 */
function resolveSession(explicitSession = null, cwd = process.cwd(), autoCreate = true) {
  // 1. Explicit override
  if (explicitSession) {
    const exists = tmux.sessionExists(explicitSession);

    if (!exists && autoCreate) {
      const result = tmux.createSession(explicitSession);
      if (!result.success) {
        return { error: 'Failed to create explicit session', details: result.error };
      }
      return { sessionName: explicitSession, directory: cwd, created: true, fromParent: false };
    }

    return { sessionName: explicitSession, directory: cwd, created: false, fromParent: false };
  }

  // 2. Auto-detect from current directory
  const sessionName = getSessionNameForPath(cwd);

  if (tmux.sessionExists(sessionName)) {
    return { sessionName, directory: cwd, created: false, fromParent: false };
  }

  // 3. Search parent directories
  const parentResult = findParentSession(cwd);
  if (parentResult.found) {
    return {
      sessionName: parentResult.sessionName,
      directory: parentResult.directory,
      created: false,
      fromParent: true
    };
  }

  // 4. Create new session for current directory
  if (autoCreate) {
    const result = tmux.createSession(sessionName);
    if (!result.success) {
      return { error: 'Failed to create session', details: result.error };
    }
    return { sessionName, directory: cwd, created: true, fromParent: false };
  }

  return { error: 'No session found and autoCreate disabled' };
}

module.exports = {
  hashPath,
  getSessionNameForPath,
  findParentSession,
  resolveSession
};
