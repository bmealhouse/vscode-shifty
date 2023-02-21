import vscode from "vscode";
import { Socket } from "net";
import { IPC } from "node-ipc";
import { shiftColorTheme } from "../color-themes";
import { shiftFontFamily } from "../font-families";
import { updateStatusBarText } from "../status-bar";
import {
  defaultConnectionOptions,
  ServerConnection,
  MessageTypes,
  UpdateStatusMessage,
} from "./ipc-types";

export async function start({
  serverId,
  serverPath,
  lastColorThemeShiftTime,
  lastFontFamilyShiftTime,
  lastPauseTime,
} = defaultConnectionOptions): Promise<ServerConnection> {
  return new Promise((resolve) => {
    let backupSocketServerId = "";
    let connectedSockets: Array<{ id: string; socket: any }> = [];
    let shiftInProgress = false;

    const ipc = new IPC();
    ipc.config.id = serverId;
    ipc.config.silent = true;

    ipc.serve(serverPath, () => {
      // 4. Register client socket.
      ipc.server.on(
        MessageTypes.REGISTER_SOCKET,
        (id: string, socket: Socket) => {
          connectedSockets.push({ id, socket });

          // 4.1. Register client socket as backup if we don't already have one.
          if (!backupSocketServerId) {
            ipc.server.emit(socket, MessageTypes.REGISTER_BACKUP_SERVER_SOCKET);
            backupSocketServerId = id;
          }

          const initialStatusMessage: UpdateStatusMessage = {
            lastColorThemeShiftTime,
            lastFontFamilyShiftTime,
            lastPauseTime,
            text: calculateRemainingTime(Date.now()),
          };

          // 5. Client socket registration complete.
          ipc.server.emit(
            socket,
            MessageTypes.REGISTER_SOCKET_COMPLETE,
            initialStatusMessage
          );
        }
      );

      // ?. Close client socket.
      ipc.server.on(MessageTypes.CLOSE_SOCKET, (id: string, socket: Socket) => {
        connectedSockets = connectedSockets.filter(
          (socket) => socket.id !== id
        );

        // ?. Register new client socket as backup if the previous backup socket
        // server has been closed.
        if (backupSocketServerId === id) {
          backupSocketServerId = "";
          if (connectedSockets.length > 0) {
            const [{ id, socket }] = connectedSockets;
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
          if (lastColorThemeShiftTime > 0) {
            lastColorThemeShiftTime =
              now - (lastPauseTime - lastColorThemeShiftTime);
          }

          if (lastFontFamilyShiftTime > 0) {
            lastFontFamilyShiftTime =
              now - (lastPauseTime - lastFontFamilyShiftTime);
          }

          lastPauseTime = 0;
        }

        intervalId = setInterval(
          async () => {
            const {
              shiftColorThemeIntervalMin,
              shiftFontFamilyIntervalMin,
            } = vscode.workspace.getConfiguration("shifty.shiftInterval");

            const now = Date.now();

            const remainingTime = calculateRemainingTime(now);
            updateStatusBarText(remainingTime);

            // if (process.env.SHIFTY_DEBUG === "true") {
            //   console.debug(
            //     "SHIFTY_DEBUG: updated status bar text",
            //     JSON.stringify(
            //       {
            //         now,
            //         shiftInProgress,
            //         lastColorThemeShiftTime,
            //         lastFontFamilyShiftTime,
            //         lastPauseTime,
            //         text: remainingTime,
            //       },
            //       null,
            //       2
            //     )
            //   );
            // }

            if (connectedSockets.length > 0) {
              const updateStatusMessage: UpdateStatusMessage = {
                lastColorThemeShiftTime,
                lastFontFamilyShiftTime,
                lastPauseTime,
                text: remainingTime,
              };

              ipc.server.broadcast(
                MessageTypes.UPDATE_STATUS,
                updateStatusMessage
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
            }
          },
          process.env.NODE_ENV === "test" ? 0 : 1000
        );

        void vscode.commands.executeCommand(
          "setContext",
          "shifty.isShiftIntervalRunning",
          true
        );
      };

      ipc.server.on(MessageTypes.START_INTERVAL, (_, socket) => {
        void internalStartShiftInterval();
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

        void vscode.commands.executeCommand(
          "setContext",
          "shifty.isShiftIntervalRunning",
          false
        );
      };

      ipc.server.on(MessageTypes.PAUSE_INTERVAL, (_, socket) => {
        internalPauseShiftInterval();
        ipc.server.emit(socket, MessageTypes.PAUSE_INTERVAL_COMPLETE);
      });

      const internalRestartShiftInterval = (): void => {
        const now = Date.now();
        lastColorThemeShiftTime = now;
        lastFontFamilyShiftTime = now;
      };

      ipc.server.on(MessageTypes.RESTART_INTERVAL, (_, socket) => {
        internalRestartShiftInterval();
        ipc.server.emit(socket, MessageTypes.RESTART_INTERVAL_COMPLETE);
      });

      const {
        automaticallyStartShiftInterval,
        shiftColorThemeIntervalMin,
        shiftFontFamilyIntervalMin,
      } = vscode.workspace.getConfiguration("shifty.shiftInterval");

      if (
        automaticallyStartShiftInterval &&
        (shiftColorThemeIntervalMin > 0 || shiftFontFamilyIntervalMin > 0)
      ) {
        void internalStartShiftInterval();
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

          void internalStartShiftInterval();
        },
        restartShiftInterval() {
          if (lastPauseTime > 0) {
            return;
          }

          internalRestartShiftInterval();
        },
      };

      resolve(connection);
    });

    function calculateRemainingTime(now: number): string {
      const {
        shiftColorThemeIntervalMin,
        shiftFontFamilyIntervalMin,
      } = vscode.workspace.getConfiguration("shifty.shiftInterval");

      const shiftColorThemeIntervalEnabled = shiftColorThemeIntervalMin > 0;
      const shiftFontFamilyIntervalEnabled = shiftFontFamilyIntervalMin > 0;

      let shiftColorThemeIntervalMs = 0;
      let shiftColorThemeRemainingSeconds = 0;
      let shiftFontFamilyIntervalMs = 0;
      let shiftFontFamilyRemainingSeconds = 0;

      if (shiftColorThemeIntervalEnabled) {
        shiftColorThemeIntervalMs = shiftColorThemeIntervalMin * 60 * 1000;
        shiftColorThemeRemainingSeconds = Math.ceil(
          (lastColorThemeShiftTime + shiftColorThemeIntervalMs - now) / 1000
        );
      }

      if (shiftFontFamilyIntervalEnabled) {
        shiftFontFamilyIntervalMs = shiftFontFamilyIntervalMin * 60 * 1000;
        shiftFontFamilyRemainingSeconds = Math.ceil(
          (lastFontFamilyShiftTime + shiftFontFamilyIntervalMs - now) / 1000
        );
      }

      let min = Math.max(0, Math.floor(shiftColorThemeRemainingSeconds / 60));
      let sec = Math.max(0, shiftColorThemeRemainingSeconds % 60);
      const pad0 = (number: number): string => String(number).padStart(2, "0");

      let calculationResult = `${pad0(min)}:${pad0(sec)}${
        lastPauseTime > 0 ? " (paused)" : ""
      }`;

      if (shiftColorThemeIntervalEnabled && shiftFontFamilyIntervalEnabled) {
        if (shiftColorThemeRemainingSeconds < shiftFontFamilyRemainingSeconds) {
          calculationResult = `${pad0(min)}:${pad0(sec)} (${
            lastPauseTime > 0 ? "paused" : "color theme"
          })`;
        } else if (
          shiftFontFamilyRemainingSeconds < shiftColorThemeRemainingSeconds
        ) {
          min = Math.max(0, Math.floor(shiftFontFamilyRemainingSeconds / 60));
          sec = Math.max(0, shiftFontFamilyRemainingSeconds % 60);
          calculationResult = `${pad0(min)}:${pad0(sec)} (${
            lastPauseTime > 0 ? "paused" : "font family"
          })`;
        }
      }

      // if (
      //   process.env.SHIFTY_DEBUG === "true" &&
      //   shiftColorThemeIntervalMin === shiftFontFamilyIntervalMin &&
      //   lastColorThemeShiftTime !== lastFontFamilyShiftTime
      // ) {
      //   console.debug(
      //     "SHIFTY_DEBUG: last shift time values have diverged",
      //     JSON.stringify(
      //       {
      //         now,
      //         lastColorThemeShiftTime,
      //         lastFontFamilyShiftTime,
      //         shiftColorThemeRemainingSeconds,
      //         shiftFontFamilyRemainingSeconds,
      //         calculationResult,
      //       },
      //       null,
      //       2
      //     )
      //   );
      // }

      return calculationResult;
    }

    ipc.server.start();
  });
}
