import {IPC} from 'node-ipc';
import * as shortid from 'shortid';
import {updateStatusBarText} from '../status-bar';
import * as ipcServer from './ipc-server';
import {
  ConnectionOptions,
  defaultConnectionOptions,
  ClientConnection,
  MessageTypes,
  UpdateStatusMessage,
} from './ipc-types';
import {setConnection} from '.';

export async function connect({
  serverId,
  serverPath,
  lastColorThemeShiftTime,
  lastFontFamilyShiftTime,
  lastPauseTime,
} = defaultConnectionOptions): Promise<ClientConnection> {
  return new Promise(resolve => {
    let messagesReceived = 0;
    let isBackupSocketServer = false;
    let lastUpdateStatusMessageReceived: UpdateStatusMessage;

    let closingSocket = false;
    let resolveCloseSocket = (): void => {};
    let resolvePauseShiftInterval = (): void => {};
    let resolveStartShiftInterval = (): void => {};

    const ipc = new IPC();
    ipc.config.id = shortid.generate();
    ipc.config.silent = true;
    ipc.config.retry = process.env.NODE_ENV === 'test' ? 0 : 500;
    ipc.config.maxRetries = 0;

    // 2. Connect to node-ipc server.
    ipc.connectTo(serverId, serverPath, () => {
      const socket = ipc.of[serverId];

      // 3a. Connection established. Register client socket with
      // node-ipc server.
      socket.on('connect', () => {
        socket.emit(MessageTypes.REGISTER_SOCKET, ipc.config.id);
      });

      // 4.2. Assigned as "backup socket server" from node-ipc server.
      socket.on(MessageTypes.REGISTER_BACKUP_SERVER_SOCKET, () => {
        isBackupSocketServer = true;
        ipc.config.stopRetrying = true;
        ipc.config.maxRetries = 0;
      });

      // 6. Client socket registration complete.
      socket.on(MessageTypes.REGISTER_SOCKET_COMPLETE, () => {
        ipc.config.maxRetries = isBackupSocketServer ? 0 : 10;

        const connection: ClientConnection = {
          id: ipc.config.id,
          get statusMessagesReceived() {
            return messagesReceived;
          },
          get lastUpdateStatusMessageReceived() {
            return lastUpdateStatusMessageReceived;
          },
          async close() {
            return new Promise(resolve => {
              closingSocket = true;
              resolveCloseSocket = resolve;
              socket.emit(MessageTypes.CLOSE_SOCKET, ipc.config.id);
            });
          },
          async pauseShiftInterval() {
            return new Promise(resolve => {
              if (lastPauseTime > 0) {
                return resolve();
              }

              resolvePauseShiftInterval = resolve;
              socket.emit(MessageTypes.PAUSE_INTERVAL);
            });
          },
          async startShiftInterval() {
            return new Promise(resolve => {
              if (
                lastPauseTime === 0 &&
                (lastColorThemeShiftTime > 0 || lastFontFamilyShiftTime > 0)
              ) {
                return resolve();
              }

              resolveStartShiftInterval = resolve;
              socket.emit(MessageTypes.START_INTERVAL);
            });
          },
        };

        resolve(connection);
      });

      // ?. Receive status bar update message
      socket.on(MessageTypes.UPDATE_STATUS, (message: UpdateStatusMessage) => {
        messagesReceived++;
        lastUpdateStatusMessageReceived = message;
        lastColorThemeShiftTime = message.lastColorThemeShiftTime;
        lastFontFamilyShiftTime = message.lastFontFamilyShiftTime;
        lastPauseTime = message.lastPauseTime;
        updateStatusBarText(message.text);
      });

      // ?. Lost connection with server,
      socket.on('destroy', async () => {
        if (closingSocket) {
          return;
        }

        const connectionOptions: ConnectionOptions = {
          serverId,
          serverPath,
          lastColorThemeShiftTime,
          lastFontFamilyShiftTime,
          lastPauseTime,
        };

        if (isBackupSocketServer) {
          const connection = await ipcServer.start(connectionOptions);
          setConnection(connection);
          return;
        }

        if (lastColorThemeShiftTime > 0 || lastFontFamilyShiftTime > 0) {
          const connection = await connect(connectionOptions);
          setConnection(connection);
          return;
        }

        const connection = await ipcServer.start({
          ...connectionOptions,
          lastColorThemeShiftTime: 0,
          lastFontFamilyShiftTime: 0,
          lastPauseTime: 0,
        });

        setConnection(connection);
      });

      // ?. Client socket close complete.
      socket.on(MessageTypes.CLOSE_SOCKET_COMPLETE, () => {
        ipc.disconnect(serverId);
        resolveCloseSocket();
      });

      socket.on(MessageTypes.PAUSE_INTERVAL_COMPLETE, () => {
        resolvePauseShiftInterval();
      });

      socket.on(MessageTypes.START_INTERVAL_COMPLETE, () => {
        resolveStartShiftInterval();
      });
    });
  });
}
