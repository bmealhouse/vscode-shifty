export declare interface ConnectionOptions {
  serverId: string;
  serverPath: string;
  lastColorThemeShiftTime: number;
  lastFontFamilyShiftTime: number;
  lastPauseTime: number;
}

export const defaultConnectionOptions: ConnectionOptions = {
  serverId: "shifty",
  serverPath: "/tmp/vscode.shifty",
  lastColorThemeShiftTime: 0,
  lastFontFamilyShiftTime: 0,
  lastPauseTime: 0,
};

export declare interface ClientConnection {
  id: string;
  statusMessagesReceived: number;
  lastUpdateStatusMessageReceived: UpdateStatusMessage;
  close: () => Promise<void>;
  pauseShiftInterval: () => Promise<void>;
  startShiftInterval: () => Promise<void>;
  resetShiftInterval: () => Promise<void>;
}

export declare interface ServerConnection {
  backupSocketServerId: string;
  connectedSockets: Array<{
    id: string;
    socket: any;
  }>;
  close: () => void;
  pauseShiftInterval: () => void;
  startShiftInterval: () => void;
  resetShiftInterval: () => void;
}

export const enum MessageTypes {
  REGISTER_SOCKET = "socket.register",
  REGISTER_BACKUP_SERVER_SOCKET = "socket.register-backup-server",
  REGISTER_SOCKET_COMPLETE = "socket.register-complete",
  CLOSE_SOCKET = "socket.close",
  CLOSE_SOCKET_COMPLETE = "socket.close-complete",
  UPDATE_STATUS = "status.update",
  PAUSE_INTERVAL = "interval.pause",
  PAUSE_INTERVAL_COMPLETE = "interval.pause-complete",
  START_INTERVAL = "interval.start",
  START_INTERVAL_COMPLETE = "interval.start-complete",
  RESET_INTERVAL = "interval.reset",
  RESET_INTERVAL_COMPLETE = "interval.reset-complete",
}

export declare interface UpdateStatusMessage {
  lastColorThemeShiftTime: number;
  lastFontFamilyShiftTime: number;
  lastPauseTime: number;
  text: string;
}
