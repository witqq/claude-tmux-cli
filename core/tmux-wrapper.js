const { execSync, spawn } = require('child_process');

const SOCKET_NAME = 'claude-dev';

/**
 * Execute tmux command synchronously
 */
function exec(args, options = {}) {
  const cmd = `tmux -L ${SOCKET_NAME} ${args}`;
  try {
    const result = execSync(cmd, {
      encoding: 'utf8',
      ...options
    });
    return { success: true, output: result };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      stderr: error.stderr?.toString() || '',
      stdout: error.stdout?.toString() || ''
    };
  }
}

/**
 * Check if session exists
 */
function sessionExists(sessionName) {
  const result = exec('list-sessions -F "#{session_name}"', { stdio: ['pipe', 'pipe', 'pipe'] });
  if (!result.success) {
    return false;
  }
  const sessions = result.output.split('\n').filter(s => s.trim());
  return sessions.includes(sessionName);
}

/**
 * Create new tmux session without initial window
 */
function createSession(sessionName) {
  // Create session with initial window, then we'll manage windows ourselves
  return exec(`new-session -d -s "${sessionName}"`);
}

/**
 * Kill tmux session
 */
function killSession(sessionName) {
  return exec(`kill-session -t "${sessionName}"`);
}

/**
 * Rename window
 */
function renameWindow(sessionName, windowIndex, newName) {
  return exec(`rename-window -t "${sessionName}:${windowIndex}" "${newName}"`);
}

/**
 * Create new window in session
 */
function createWindow(sessionName, windowName, command) {
  // Create window with name and start bash
  const result = exec(`new-window -t "${sessionName}" -n "${windowName}" bash`);
  if (!result.success) {
    return result;
  }

  // Send command to the window
  if (command) {
    return sendKeys(sessionName, windowName, command);
  }

  return result;
}

/**
 * Send keys (command) to window
 */
function sendKeys(sessionName, windowName, command) {
  return exec(`send-keys -t "${sessionName}:${windowName}" "${command}" Enter`);
}

/**
 * Send Ctrl+C to window
 */
function sendCtrlC(sessionName, windowName) {
  return exec(`send-keys -t "${sessionName}:${windowName}" C-c`);
}

/**
 * Kill specific window
 */
function killWindow(sessionName, windowName) {
  return exec(`kill-window -t "${sessionName}:${windowName}"`);
}

/**
 * List all windows in session
 */
function listWindows(sessionName) {
  const result = exec(`list-windows -t "${sessionName}" -F "#{window_index}:#{window_name}:#{pane_pid}"`,
    { stdio: ['pipe', 'pipe', 'pipe'] });

  if (!result.success) {
    return { success: false, windows: [] };
  }

  const windows = result.output
    .split('\n')
    .filter(line => line.trim())
    .map(line => {
      const [index, name, pid] = line.split(':');
      return {
        index: parseInt(index),
        name: name,
        pid: parseInt(pid)
      };
    });

  return { success: true, windows };
}

/**
 * Read output from window (capture-pane)
 */
function capturePane(sessionName, windowName, lines = 100) {
  const result = exec(`capture-pane -t "${sessionName}:${windowName}" -p -S -${lines}`,
    { stdio: ['pipe', 'pipe', 'pipe'] });
  return result;
}

/**
 * Clear window history
 */
function clearHistory(sessionName, windowName) {
  return exec(`clear-history -t "${sessionName}:${windowName}"`);
}

/**
 * Check if window exists in session
 */
function windowExists(sessionName, windowName) {
  const result = listWindows(sessionName);
  if (!result.success) {
    return false;
  }
  return result.windows.some(w => w.name === windowName);
}

module.exports = {
  sessionExists,
  createSession,
  killSession,
  renameWindow,
  createWindow,
  sendKeys,
  sendCtrlC,
  killWindow,
  listWindows,
  capturePane,
  clearHistory,
  windowExists,
  exec
};
