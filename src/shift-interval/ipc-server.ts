import * as vscode from 'vscode';
import {Socket} from 'net';
import {IPC} from 'node-ipc';
import {shiftColorTheme} from '../color-themes';
import {shiftFontFamily} from '../font-families';
import {updateStatusBarText} from '../status-bar';
import {
  defaultConnectionOptions,
  ServerConnection,
  MessageTypes,
  UpdateStatusMessage,
} from './ipc-types';

export async function start({
  serverId,
  serverPath,
  lastColorThemeShiftTime,
  lastFontFamilyShiftTime,
  lastPauseTime,
} = defaultConnectionOptions): Promise<ServerConnection> {
  return new Promise(resolve => {
    let backupSocketServerId = '';
    let connectedSockets: Array<{id: string; socket: any}> = [];
    let shiftInProgress = false;

    const ipc = new IPC();
    ipc.config.id = serverId;
    ipc.config.silent = true;

    const {automaticallyStartShiftInterval} = vscode.workspace.getConfiguration(
      'shifty.shiftInterval',
    );

    ipc.serve(serverPath, () => {
      // 4. Register client socket.
      ipc.server.on(
        MessageTypes.REGISTER_SOCKET,
        (id: string, socket: Socket) => {
          connectedSockets.push({id, socket});

          // 4.1. Register client socket as backup if we don't already have one.
          if (!backupSocketServerId) {
            ipc.server.emit(socket, MessageTypes.REGISTER_BACKUP_SERVER_SOCKET);
            backupSocketServerId = id;
          }

          // 5. Client socket registration complete.
          ipc.server.emit(socket, MessageTypes.REGISTER_SOCKET_COMPLETE);
        },
      );

      // ?. Close client socket.
      ipc.server.on(MessageTypes.CLOSE_SOCKET, (id: string, socket: Socket) => {
        connectedSockets = connectedSockets.filter(socket => socket.id !== id);

        // ?. Register new client socket as backup if the previous backup socket
        // server has been closed.
        if (backupSocketServerId === id) {
          backupSocketServerId = '';
          if (connectedSockets.length > 0) {
            const [{id, socket}] = connectedSockets;
            ipc.server.emit(socket, MessageTypes.REGISTER_BACKUP_SERVER_SOCKET);
            backupSocketServerId = id;
          }
        }

        // ?. Client socket close complete.
        ipc.server.emit(socket, MessageTypes.CLOSE_SOCKET_COMPLETE);
      });

      let intervalId: NodeJS.Timeout;
      const internalStartShiftInterval = async (): Promise<void> => {
        const now = Date.now();

        lastColorThemeShiftTime = lastColorThemeShiftTime || now;
        lastFontFamilyShiftTime = lastFontFamilyShiftTime || now;

        if (lastPauseTime > 0) {
          if (process.env.SHIFTY_DEBUG === 'true') {
            console.log(
              'SHIFTY_DEBUG: unpause shift interval (before)',
              JSON.stringify({
                lastPauseTime,
                now,
                lastColorThemeShiftTime,
                lastFontFamilyShiftTime,
              }),
            );
          }

          if (lastColorThemeShiftTime > 0) {
            lastColorThemeShiftTime =
              now - (lastPauseTime - lastColorThemeShiftTime);
          }

          if (lastFontFamilyShiftTime > 0) {
            lastFontFamilyShiftTime =
              now - (lastPauseTime - lastFontFamilyShiftTime);
          }

          lastPauseTime = 0;

          if (process.env.SHIFTY_DEBUG === 'true') {
            console.log(
              'SHIFTY_DEBUG: unpause shift interval (after)',
              JSON.stringify(
                {
                  lastPauseTime,
                  now,
                  lastColorThemeShiftTime,
                  lastFontFamilyShiftTime,
                },
                null,
                2,
              ),
            );
          }
        }

        intervalId = setInterval(
          async () => {
            const {
              shiftColorThemeIntervalMin,
              shiftFontFamilyIntervalMin,
            } = vscode.workspace.getConfiguration('shifty.shiftInterval');

            const now = Date.now();

            const remainingTime = calculateRemainingTime(now);
            updateStatusBarText(remainingTime);

            if (connectedSockets.length > 0) {
              const updateStatusMessage: UpdateStatusMessage = {
                lastColorThemeShiftTime,
                lastFontFamilyShiftTime,
                lastPauseTime,
                text: remainingTime,
              };

              ipc.server.broadcast(
                MessageTypes.UPDATE_STATUS,
                updateStatusMessage,
              );
            }

            const shiftColorThemeIntervalEnabled =
              shiftColorThemeIntervalMin > 0;

            const shiftFontFamilyIntervalEnabled =
              shiftFontFamilyIntervalMin > 0;

            const shiftColorThemeIntervalMs =
              shiftColorThemeIntervalMin * 60 * 1000;

            const shiftFontFamilyIntervalMs =
              shiftFontFamilyIntervalMin * 60 * 1000;

            if (!shiftInProgress) {
              if (process.env.SHIFTY_DEBUG === 'true') {
                console.log(
                  'SHIFTY_DEBUG: shifting color theme & font family (before)',
                  JSON.stringify(
                    {
                      now,
                      shiftInProgress,
                      lastColorThemeShiftTime,
                      lastFontFamilyShiftTime,
                    },
                    null,
                    2,
                  ),
                );
              }

              if (
                shiftColorThemeIntervalEnabled &&
                lastColorThemeShiftTime + shiftColorThemeIntervalMs - now <= 0
              ) {
                shiftInProgress = true;
                await shiftColorTheme();
                lastColorThemeShiftTime = now;
              }

              if (
                shiftFontFamilyIntervalEnabled &&
                lastFontFamilyShiftTime + shiftFontFamilyIntervalMs - now <= 0
              ) {
                shiftInProgress = true;
                await shiftFontFamily();
                lastFontFamilyShiftTime = now;
              }

              shiftInProgress = false;

              if (process.env.SHIFTY_DEBUG === 'true') {
                console.log(
                  'SHIFTY_DEBUG: shifting color theme & font family (after)',
                  JSON.stringify(
                    {
                      now,
                      shiftInProgress,
                      lastColorThemeShiftTime,
                      lastFontFamilyShiftTime,
                    },
                    null,
                    2,
                  ),
                );
              }
            }
          },
          process.env.NODE_ENV === 'test' ? 0 : 1000,
        );
      };

      ipc.server.on(MessageTypes.START_INTERVAL, (_, socket) => {
        internalStartShiftInterval();
        ipc.server.emit(socket, MessageTypes.START_INTERVAL_COMPLETE);
      });

      const internalPauseShiftInterval = (): void => {
        clearInterval(intervalId);
        lastPauseTime = Date.now();

        const remainingTime = calculateRemainingTime(lastPauseTime);
        updateStatusBarText(remainingTime);

        if (connectedSockets.length > 0) {
          const updateStatusMessage: UpdateStatusMessage = {
            lastColorThemeShiftTime,
            lastFontFamilyShiftTime,
            lastPauseTime,
            text: remainingTime,
          };

          ipc.server.broadcast(MessageTypes.UPDATE_STATUS, updateStatusMessage);
        }
      };

      ipc.server.on(MessageTypes.PAUSE_INTERVAL, (_, socket) => {
        internalPauseShiftInterval();
        ipc.server.emit(socket, MessageTypes.PAUSE_INTERVAL_COMPLETE);
      });

      if (automaticallyStartShiftInterval) {
        const {
          shiftColorThemeIntervalMin,
          shiftFontFamilyIntervalMin,
        } = vscode.workspace.getConfiguration('shifty.shiftInterval');

        if (shiftColorThemeIntervalMin > 0 || shiftFontFamilyIntervalMin > 0) {
          internalStartShiftInterval();
        }
      }

      const connection: ServerConnection = {
        get backupSocketServerId() {
          return backupSocketServerId;
        },
        get connectedSockets() {
          return connectedSockets;
        },
        close() {
          clearInterval(intervalId);
          ipc.server.stop();
        },
        pauseShiftInterval() {
          if (lastPauseTime > 0) {
            return;
          }
          internalPauseShiftInterval();
        },
        startShiftInterval() {
          if (
            lastPauseTime === 0 &&
            (lastColorThemeShiftTime > 0 || lastFontFamilyShiftTime > 0)
          ) {
            return;
          }
          internalStartShiftInterval();
        },
      };

      resolve(connection);
    });

    function calculateRemainingTime(now: number): string {
      const {
        shiftColorThemeIntervalMin,
        shiftFontFamilyIntervalMin,
      } = vscode.workspace.getConfiguration('shifty.shiftInterval');

      const shiftColorThemeIntervalEnabled = shiftColorThemeIntervalMin > 0;
      const shiftFontFamilyIntervalEnabled = shiftFontFamilyIntervalMin > 0;

      let shiftColorThemeIntervalMs = 0;
      let shiftColorThemeRemainingSeconds = 0;
      let shiftFontFamilyIntervalMs = 0;
      let shiftFontFamilyRemainingSeconds = 0;

      if (shiftColorThemeIntervalEnabled) {
        shiftColorThemeIntervalMs = shiftColorThemeIntervalMin * 60 * 1000;
        shiftColorThemeRemainingSeconds = Math.ceil(
          (lastColorThemeShiftTime + shiftColorThemeIntervalMs - now) / 1000,
        );
      }

      if (shiftFontFamilyIntervalEnabled) {
        shiftFontFamilyIntervalMs = shiftFontFamilyIntervalMin * 60 * 1000;
        shiftFontFamilyRemainingSeconds = Math.ceil(
          (lastFontFamilyShiftTime + shiftFontFamilyIntervalMs - now) / 1000,
        );
      }

      let min = Math.max(0, Math.floor(shiftColorThemeRemainingSeconds / 60));
      let sec = Math.max(0, shiftColorThemeRemainingSeconds % 60);
      const pad0 = (number: number): string => String(number).padStart(2, '0');

      let calculationResult: string;

      if (shiftColorThemeIntervalEnabled && shiftFontFamilyIntervalEnabled) {
        if (shiftColorThemeRemainingSeconds < shiftFontFamilyRemainingSeconds) {
          calculationResult = `${pad0(min)}:${pad0(sec)} (${
            lastPauseTime > 0 ? 'paused' : 'color theme'
          })`;
          // return `${pad0(min)}:${pad0(sec)} (${
          //   lastPauseTime > 0 ? 'paused' : 'color theme'
          // })`;
        } else if (
          shiftFontFamilyRemainingSeconds < shiftColorThemeRemainingSeconds
        ) {
          min = Math.max(0, Math.floor(shiftFontFamilyRemainingSeconds / 60));
          sec = Math.max(0, shiftFontFamilyRemainingSeconds % 60);
          calculationResult = `${pad0(min)}:${pad0(sec)} (${
            lastPauseTime > 0 ? 'paused' : 'font family'
          })`;
        }
      }

      calculationResult = `${pad0(min)}:${pad0(sec)}${
        lastPauseTime > 0 ? ' (paused)' : ''
      }`;

      if (
        process.env.SHIFTY_DEBUG === 'true' &&
        shiftColorThemeIntervalMin === shiftFontFamilyIntervalMin &&
        lastColorThemeShiftTime !== lastFontFamilyShiftTime
      ) {
        console.log(
          'SHIFTY_DEBUG: last shift time values have diverged',
          JSON.stringify(
            {
              now,
              lastColorThemeShiftTime,
              lastFontFamilyShiftTime,
              shiftColorThemeRemainingSeconds,
              shiftFontFamilyRemainingSeconds,
              calculationResult,
            },
            null,
            2,
          ),
        );
      }

      return calculationResult;
    }

    ipc.server.start();
  });
}
