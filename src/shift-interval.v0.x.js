/* eslint-disable */
const vscode = require('vscode');
const {IPC} = require('node-ipc');
const shortid = require('shortid');
const {shiftColorTheme} = require('./color-themes');
const {shiftFontFamily} = require('./font-families');
const {updateStatusBarText} = require('./status-bar');

const IPC_SERVER_ID = 'shifty-leader';
const IPC_SERVER_PATH = '/tmp/vscode.shifty';

let ipc = null;
let broadcastIntervalId = null;
let epochStartTime = null;
let epochPauseTime = null;
let shiftIntervalDelayMs = null;
let sockets = [];

module.exports = {
  activateShiftInterval,
  deactivateShiftInterval,
  startShiftInterval,
  getRemainingTimeForShiftIntervals,
};

function activateShiftInterval(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'shifty.pauseShiftInterval',
      pauseShiftInterval,
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'shifty.playShiftInterval',
      playShiftInterval,
    ),
  );

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(event => {
      if (event.affectsConfiguration('shifty.shiftIntervalDelayMin')) {
        epochStartTime = Date.now();
        const {shiftIntervalDelayMin} = vscode.workspace.getConfiguration(
          'shifty',
        );
        shiftIntervalDelayMs = shiftIntervalDelayMin * 60 * 1000;
      }
    }),
  );

  establishConnection();
}

function establishConnection() {
  const id = shortid.generate();

  ipc = new IPC();
  ipc.config.id = id;
  ipc.config.silent = false;
  ipc.config.maxRetries = 3;

  let lastEpochStartTime = null;
  let isFallbackSocket = false;

  ipc.connectTo(IPC_SERVER_ID, IPC_SERVER_PATH, () => {
    const client = ipc.of[IPC_SERVER_ID];

    client.on('connect', () => {
      client.emit('socket.register', id);
    });

    client.on('socket.setFallback', () => {
      isFallbackSocket = true;
      ipc.config.stopRetrying = true;
    });

    client.on('status.update', ({epochStartTime, remainingTime}) => {
      lastEpochStartTime = epochStartTime;
      updateStatusBarText(remainingTime);
    });

    client.on('destroy', () => {
      if (isFallbackSocket) {
        createServer(lastEpochStartTime);
      } else if (lastEpochStartTime) {
        establishConnection();
      } else {
        createServer();
      }
    });
  });
}

function createServer(lastEpochStartTime) {
  ipc = new IPC();
  ipc.config.id = IPC_SERVER_ID;
  ipc.config.silent = false;

  let fallbackSocketId = null;

  ipc.serve(IPC_SERVER_PATH, () => {
    const {shiftIntervalDelayMin} = vscode.workspace.getConfiguration('shifty');

    epochStartTime = lastEpochStartTime || Date.now();
    shiftIntervalDelayMs = shiftIntervalDelayMin * 60 * 1000;
    updateStatusBarText(
      calculateRemainingTime(epochStartTime, shiftIntervalDelayMs),
    );

    startShiftInterval();

    ipc.server.on('socket.register', (id, socket) => {
      sockets.push({id, socket});

      ipc.server.emit(socket, 'status.update', {
        epochStartTime,
        remainingTime: calculateRemainingTime(
          epochStartTime,
          shiftIntervalDelayMs,
        ),
      });

      if (!fallbackSocketId) {
        fallbackSocketId = id;
        ipc.server.emit(socket, 'socket.setFallback');
      }
    });

    ipc.server.on('socket.kill', id => {
      sockets = sockets.filter(socket => socket.id !== id);

      if (fallbackSocketId === id) {
        fallbackSocketId = null;

        if (sockets.length > 0) {
          const [{id, socket}] = sockets;
          fallbackSocketId = id;
          ipc.server.emit(socket, 'socket.setFallback');
        }
      }
    });
  });

  ipc.server.start();
}

function calculateRemainingTime(epochStartTime, shiftIntervalDelayMs) {
  const totalRemainingSeconds = Math.ceil(
    (epochStartTime + shiftIntervalDelayMs - Date.now()) / 1000,
  );

  const min = Math.floor(totalRemainingSeconds / 60);
  const sec = totalRemainingSeconds % 60;

  return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

function deactivateShiftInterval() {
  if (ipc && ipc.of[IPC_SERVER_ID]) {
    ipc.of[IPC_SERVER_ID].emit('socket.kill', ipc.config.id);
    ipc.disconnect(IPC_SERVER_ID);
    ipc = null;
  }

  if (broadcastIntervalId) {
    clearInterval(broadcastIntervalId);
    broadcastIntervalId = null;
  }
}

async function startShiftInterval() {
  broadcastIntervalId = setInterval(async () => {
    if (epochStartTime + shiftIntervalDelayMs - Date.now() < 0) {
      await shiftFontFamily();
      await shiftColorTheme();
      epochStartTime = Date.now();
    }

    const remainingTime = calculateRemainingTime(
      epochStartTime,
      shiftIntervalDelayMs,
    );

    updateStatusBarText(remainingTime);

    if (sockets.length > 0) {
      ipc.server.broadcast('status.update', {
        epochStartTime,
        remainingTime,
      });
    }
  }, 1000);
  //   const {
  //     shiftColorThemeIntervalMin,
  //     shiftFontFamilyIntervalMin,
  //   } = vscode.workspace.getConfiguration('shifty.shiftInterval')
  //   const startTime = Date.now()
  //   const shouldSyncStartTime =
  //     shiftColorThemeIntervalMin === shiftFontFamilyIntervalMin
  //   if (shiftColorThemeIntervalId === null && shiftColorThemeIntervalMin > 0) {
  //     shiftColorThemeIntervalStartTime = startTime
  //     shiftColorThemeIntervalId = setInterval(async () => {
  //       const nextStartTime = Date.now()
  //       await shiftColorTheme()
  //       shiftColorThemeIntervalStartTime = nextStartTime
  //       if (shouldSyncStartTime) {
  //         shiftFontFamilyIntervalStartTime = nextStartTime
  //       }
  //     }, shiftColorThemeIntervalMin * 60 * 1000)
  //   }
  //   if (shiftFontFamilyIntervalId === null && shiftFontFamilyIntervalMin > 0) {
  //     shiftFontFamilyIntervalStartTime = startTime
  //     shiftFontFamilyIntervalId = setInterval(async () => {
  //       const nextStartTime = Date.now()
  //       await shiftFontFamily()
  //       shiftFontFamilyIntervalStartTime = nextStartTime
  //       if (shouldSyncStartTime) {
  //         shiftColorThemeIntervalStartTime = nextStartTime
  //       }
  //     }, shiftFontFamilyIntervalMin * 60 * 1000)
  //   }
}

function pauseShiftInterval() {
  if (!broadcastIntervalId) return;
  clearInterval(broadcastIntervalId);
  broadcastIntervalId = null;
  epochPauseTime = Date.now();
  // epochStartTime + shiftIntervalDelayMs - Date.now()
}

function playShiftInterval() {
  if (!epochPauseTime || broadcastIntervalId) return;
  const pausedDuration = epochPauseTime - epochStartTime;
  epochStartTime = Date.now() - pausedDuration;
}

function getRemainingTimeForShiftIntervals() {
  // return {
  //   shiftBothRemainingTime: calculateRemainingTime(
  //     shiftBothIntervalStartTime,
  //     shiftBothIntervalId,
  //   ),
  //   shiftColorThemeRemainingTime: calculateRemainingTime(
  //     shiftColorThemeIntervalStartTime,
  //     shiftColorThemeIntervalId,
  //   ),
  //   shiftFontFamilyRemainingTime: calculateRemainingTime(
  //     shiftFontFamilyIntervalStartTime,
  //     shiftFontFamilyIntervalId,
  //   ),
  // }
}
