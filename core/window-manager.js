const tmux = require('./tmux-wrapper');
const { resolveSession } = require('./session-resolver');

/**
 * Create new window (auto-init session if needed, command optional)
 */
function createWindow(windowName, command = null, explicitSession = null) {
  const sessionResult = resolveSession(explicitSession, process.cwd(), true);

  if (sessionResult.error) {
    return { success: false, error: sessionResult.error, details: sessionResult.details };
  }

  const sessionName = sessionResult.sessionName;

  // Check if window already exists
  if (tmux.windowExists(sessionName, windowName)) {
    return { success: false, error: `Window "${windowName}" already exists` };
  }

  // Create window with bash
  const result = tmux.createWindow(sessionName, windowName, command);
  if (!result.success) {
    return { success: false, error: 'Failed to create window', details: result.error };
  }

  // Get window info
  const windowsInfo = tmux.listWindows(sessionName);
  const windowInfo = windowsInfo.success
    ? windowsInfo.windows.find(w => w.name === windowName)
    : null;

  return {
    success: true,
    sessionName,
    directory: sessionResult.directory,
    windowName,
    window_index: windowInfo?.index
  };
}

/**
 * Kill specific window
 */
function killWindow(windowName, explicitSession = null) {
  const sessionResult = resolveSession(explicitSession, process.cwd(), false);

  if (sessionResult.error) {
    return { success: false, error: sessionResult.error };
  }

  const sessionName = sessionResult.sessionName;

  if (!tmux.windowExists(sessionName, windowName)) {
    return { success: false, error: `Window "${windowName}" does not exist` };
  }

  const result = tmux.killWindow(sessionName, windowName);
  return result;
}

/**
 * List all windows
 */
function listWindows(explicitSession = null) {
  const sessionResult = resolveSession(explicitSession, process.cwd(), false);

  if (sessionResult.error) {
    return { success: false, error: sessionResult.error, windows: [] };
  }

  const sessionName = sessionResult.sessionName;
  const result = tmux.listWindows(sessionName);

  if (!result.success) {
    return { success: false, error: 'Failed to list windows', windows: [] };
  }

  return {
    success: true,
    windows: result.windows,
    sessionName,
    directory: sessionResult.directory,
    fromParent: sessionResult.fromParent
  };
}

/**
 * Execute command in window (create window if doesn't exist)
 */
function execCommand(windowName, command, explicitSession = null) {
  const sessionResult = resolveSession(explicitSession, process.cwd(), true);

  if (sessionResult.error) {
    return { success: false, error: sessionResult.error };
  }

  const sessionName = sessionResult.sessionName;

  // Create window if doesn't exist
  if (!tmux.windowExists(sessionName, windowName)) {
    const windowsInfo = tmux.listWindows(sessionName);

    // Check if there's an unnamed initial window (bash/zsh) to rename
    if (windowsInfo.success && windowsInfo.windows.length === 1) {
      const firstWindow = windowsInfo.windows[0];
      // Rename if it's the default shell window (bash/zsh/sh)
      if (firstWindow.name === 'bash' || firstWindow.name === 'zsh' || firstWindow.name === 'sh') {
        const renameResult = tmux.renameWindow(sessionName, 0, windowName);
        if (!renameResult.success) {
          return { success: false, error: 'Failed to rename initial window', details: renameResult.error };
        }
      } else {
        // Already has a named window, create new one
        const createResult = tmux.createWindow(sessionName, windowName, null);
        if (!createResult.success) {
          return { success: false, error: 'Failed to create window', details: createResult.error };
        }
      }
    } else {
      // Session has multiple windows, create new one
      const createResult = tmux.createWindow(sessionName, windowName, null);
      if (!createResult.success) {
        return { success: false, error: 'Failed to create window', details: createResult.error };
      }
    }
  }

  const result = tmux.sendKeys(sessionName, windowName, command);
  return result;
}

/**
 * Send Ctrl+C to window
 */
function sendCtrlC(windowName, explicitSession = null) {
  const sessionResult = resolveSession(explicitSession, process.cwd(), false);

  if (sessionResult.error) {
    return { success: false, error: sessionResult.error };
  }

  const sessionName = sessionResult.sessionName;

  if (!tmux.windowExists(sessionName, windowName)) {
    return { success: false, error: `Window "${windowName}" does not exist` };
  }

  const result = tmux.sendCtrlC(sessionName, windowName);
  return result;
}

/**
 * Read output from window
 */
function readOutput(windowName, lines = 100, explicitSession = null) {
  const sessionResult = resolveSession(explicitSession, process.cwd(), false);

  if (sessionResult.error) {
    return { success: false, error: sessionResult.error };
  }

  const sessionName = sessionResult.sessionName;

  if (!tmux.windowExists(sessionName, windowName)) {
    return { success: false, error: `Window "${windowName}" does not exist` };
  }

  const result = tmux.capturePane(sessionName, windowName, lines);
  return result;
}

/**
 * Clear window history
 */
function clearHistory(windowName, explicitSession = null) {
  const sessionResult = resolveSession(explicitSession, process.cwd(), false);

  if (sessionResult.error) {
    return { success: false, error: sessionResult.error };
  }

  const sessionName = sessionResult.sessionName;

  if (!tmux.windowExists(sessionName, windowName)) {
    return { success: false, error: `Window "${windowName}" does not exist` };
  }

  const result = tmux.clearHistory(sessionName, windowName);
  return result;
}

/**
 * Get window status
 */
function getStatus(windowName, explicitSession = null) {
  const sessionResult = resolveSession(explicitSession, process.cwd(), false);

  if (sessionResult.error) {
    return { success: false, error: sessionResult.error };
  }

  const sessionName = sessionResult.sessionName;

  if (!tmux.windowExists(sessionName, windowName)) {
    return { success: false, error: `Window "${windowName}" does not exist` };
  }

  // Get window info from tmux
  const windowsInfo = tmux.listWindows(sessionName);
  const windowInfo = windowsInfo.success
    ? windowsInfo.windows.find(w => w.name === windowName)
    : null;

  if (!windowInfo) {
    return { success: false, error: 'Window not found in tmux' };
  }

  return {
    success: true,
    windowName: windowInfo.name,
    pid: windowInfo.pid,
    window_index: windowInfo.index,
    sessionName,
    directory: sessionResult.directory
  };
}

module.exports = {
  createWindow,
  killWindow,
  listWindows,
  execCommand,
  sendCtrlC,
  readOutput,
  clearHistory,
  getStatus
};
