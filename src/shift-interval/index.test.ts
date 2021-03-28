import expect from "expect";
import vscode from "vscode";

import {
  commandMap,
  DEFAULT_COLOR_THEME,
  DEFAULT_FONT_FAMILY,
} from "../constants";
import { getColorTheme } from "../color-themes";
import { getFontFamily } from "../font-families";
import { updateConfig, sleep, wait } from "../test/utils";
import * as ipcServer from "./ipc-server";
import * as ipcClient from "./ipc-client";
import { ConnectionOptions } from "./ipc-types";

const connectionOptions: ConnectionOptions = {
  serverId: "fake-id",
  serverPath: "/tmp/fake.path",
  lastColorThemeShiftTime: 0,
  lastFontFamilyShiftTime: 0,
  lastPauseTime: 0,
};

suite("shift-interval/index.test.ts", () => {
  test("registers shift interval commands at vscode start up", async () => {
    // arrange
    // act
    const commands = await vscode.commands.getCommands();

    // assert
    expect(commands).toContain(commandMap.START_SHIFT_INTERVAL);
    expect(commands).toContain(commandMap.PAUSE_SHIFT_INTERVAL);
    expect(commands).toContain(commandMap.RESET_SHIFT_INTERVAL);
  });

  test("registers client socket with node-ipc server", async () => {
    // arrage
    const server = await ipcServer.start(connectionOptions);

    // act
    const client = await ipcClient.connect(connectionOptions);

    // assert
    const [socket] = server.connectedSockets;
    expect(socket.id).toBe(client.id);

    // cleanup
    await client.close();
    server.close();
  });

  test("should register multiple client sockets with node-ipc server", async () => {
    // arrange
    const server = await ipcServer.start(connectionOptions);

    // act
    const client1 = await ipcClient.connect(connectionOptions);
    const client2 = await ipcClient.connect(connectionOptions);
    const client3 = await ipcClient.connect(connectionOptions);

    // assert
    const [socket1, socket2, socket3] = server.connectedSockets;
    expect(socket1.id).toBe(client1.id);
    expect(socket2.id).toBe(client2.id);
    expect(socket3.id).toBe(client3.id);

    // cleanup
    await client3.close();
    await client2.close();
    await client1.close();
    server.close();
  });

  test("should register first connected client socket as backup socket server", async () => {
    // arrange
    const server = await ipcServer.start(connectionOptions);

    // act
    const client1 = await ipcClient.connect(connectionOptions);
    const client2 = await ipcClient.connect(connectionOptions);

    // assert
    expect(server.connectedSockets.length).toBe(2);
    expect(server.backupSocketServerId).toBe(client1.id);

    // cleanup
    await client2.close();
    await client1.close();
    server.close();
  });

  test("should receive status updates from node-ipc server", async () => {
    // arrange
    // act
    const server = await ipcServer.start(connectionOptions);
    const client = await ipcClient.connect(connectionOptions);

    // assert
    await wait(() => {
      expect(client.statusMessagesReceived).toBeGreaterThan(2);
    });

    // cleanup
    await client.close();
    server.close();
  });

  test("should close client socket and disconnect from node-ipc server", async () => {
    // arrange
    const server = await ipcServer.start(connectionOptions);
    const client = await ipcClient.connect(connectionOptions);
    expect(server.connectedSockets.length).toBe(1);

    // act
    await client.close();

    // assert
    expect(server.connectedSockets.length).toBe(0);

    // cleanup
    server.close();
  });

  test("should register new client socket as backup socket server when the current backup socket server has been closed", async () => {
    // arrange
    const server = await ipcServer.start(connectionOptions);
    const client1 = await ipcClient.connect(connectionOptions);
    const client2 = await ipcClient.connect(connectionOptions);
    expect(server.connectedSockets.length).toBe(2);
    expect(server.backupSocketServerId).toBe(client1.id);

    // act
    await client1.close();

    // assert
    expect(server.connectedSockets.length).toBe(1);
    expect(server.backupSocketServerId).toBe(client2.id);

    // cleanup
    await client2.close();
    server.close();
  });

  // Drop `node-ipc` and use `net` directly to support this test
  test.skip(
    "should fallback to backup socket server when the current node-ipc server has been closed"
  );

  test('should start the shift interval on VS Code startup when "shifty.shiftInterval.automaticallyStartShiftInterval" setting is enabled', async () => {
    // arrange
    // act
    const server = await ipcServer.start(connectionOptions);
    const client = await ipcClient.connect(connectionOptions);

    // assert
    await wait(() => {
      expect(client.statusMessagesReceived).toBeGreaterThan(0);
    });

    // cleanup
    await client.close();
    server.close();
  });

  test('should not start the shift interval on VS Code startup when "shifty.shiftInterval.automaticallyStartShiftInterval" setting is disabled', async () => {
    // arrange
    await updateConfig(
      "shifty.shiftInterval.automaticallyStartShiftInterval",
      false
    );

    // act
    const server = await ipcServer.start(connectionOptions);
    const client = await ipcClient.connect(connectionOptions);
    await sleep(50);

    // assert
    expect(client.statusMessagesReceived).toBe(0);

    // cleanup
    await client.close();
    server.close();
  });

  test('should not start the shift interval on VS Code startup when "shifty.shiftInterval.shiftColorThemeIntervalMin" and "shifty.shiftInterval.shiftFontFamilyIntervalMin" settings are null', async () => {
    // arrange
    await updateConfig("shifty.shiftInterval.shiftColorThemeIntervalMin", null);
    await updateConfig("shifty.shiftInterval.shiftFontFamilyIntervalMin", null);

    // act
    const server = await ipcServer.start(connectionOptions);
    const client = await ipcClient.connect(connectionOptions);
    await sleep(50);

    // assert
    expect(client.statusMessagesReceived).toBe(0);

    // cleanup
    await client.close();
    server.close();
  });

  test('should not start the shift interval on VS Code startup when "shifty.shiftInterval.shiftColorThemeIntervalMin" and "shifty.shiftInterval.shiftFontFamilyIntervalMin" settings are 0', async () => {
    // arrange
    await updateConfig("shifty.shiftInterval.shiftColorThemeIntervalMin", 0);
    await updateConfig("shifty.shiftInterval.shiftFontFamilyIntervalMin", 0);

    // act
    const server = await ipcServer.start(connectionOptions);
    const client = await ipcClient.connect(connectionOptions);
    await sleep(50);

    // assert
    expect(client.statusMessagesReceived).toBe(0);

    // cleanup
    await client.close();
    server.close();
  });

  test('should pause the shift interval on the server when running the "PAUSE_SHIFT_INTERVAL" command', async () => {
    // arrange
    const server = await ipcServer.start(connectionOptions);
    const client = await ipcClient.connect(connectionOptions);
    await sleep(50);

    // act
    server.pauseShiftInterval(); // FIXME: would be nice to be able to await this
    await sleep(50);
    const previousStatusMessagesReceived = client.statusMessagesReceived;
    await sleep(50);

    // assert
    expect(client.statusMessagesReceived).toEqual(
      previousStatusMessagesReceived
    );

    // cleanup
    await client.close();
    server.close();
  });

  test('should pause the shift interval on the client when running the "PAUSE_SHIFT_INTERVAL" command', async () => {
    // arrange
    const server = await ipcServer.start(connectionOptions);
    const client = await ipcClient.connect(connectionOptions);
    await sleep(50);

    // act
    await client.pauseShiftInterval();
    await sleep(50);
    const previousStatusMessagesReceived = client.statusMessagesReceived;
    await sleep(50);

    // assert
    expect(client.statusMessagesReceived).toEqual(
      previousStatusMessagesReceived
    );

    // cleanup
    await client.close();
    server.close();
  });

  test('should start the shift interval on the server when running the "START_SHIFT_INTERVAL" command', async () => {
    // arrange
    const server = await ipcServer.start(connectionOptions);
    const client = await ipcClient.connect(connectionOptions);
    await sleep(50);

    server.pauseShiftInterval();
    await sleep(50);

    const previousStatusMessagesReceived = client.statusMessagesReceived;
    await sleep(50);

    expect(client.statusMessagesReceived).toEqual(
      previousStatusMessagesReceived
    );

    // act
    server.startShiftInterval();
    await sleep(50);

    // assert
    expect(client.statusMessagesReceived).toBeGreaterThan(
      previousStatusMessagesReceived
    );

    // cleanup
    await client.close();
    server.close();
  });

  test('should start the shift interval on the client when running the "START_SHIFT_INTERVAL" command', async () => {
    // arrange
    const server = await ipcServer.start(connectionOptions);
    const client = await ipcClient.connect(connectionOptions);
    await sleep(50);

    await client.pauseShiftInterval();
    await sleep(50);

    const previousStatusMessagesReceived = client.statusMessagesReceived;
    await sleep(50);

    expect(client.statusMessagesReceived).toEqual(
      previousStatusMessagesReceived
    );

    // act
    await client.startShiftInterval();
    await sleep(50);

    // assert
    expect(client.statusMessagesReceived).toBeGreaterThan(
      previousStatusMessagesReceived
    );

    // cleanup
    await client.close();
    server.close();
  });

  test('should reset the shift interval on the server when running the "RESET_SHIFT_INTERVAL" command', async () => {
    // arrange
    const server = await ipcServer.start(connectionOptions);
    const client = await ipcClient.connect(connectionOptions);
    await sleep(50);

    const previousLastUpdateStatusMessageReceived =
      client.lastUpdateStatusMessageReceived;

    // act
    server.resetShiftInterval();
    await sleep(50);

    // assert
    expect(
      client.lastUpdateStatusMessageReceived.lastColorThemeShiftTime
    ).toBeGreaterThan(
      previousLastUpdateStatusMessageReceived.lastColorThemeShiftTime
    );
    expect(
      client.lastUpdateStatusMessageReceived.lastFontFamilyShiftTime
    ).toBeGreaterThan(
      previousLastUpdateStatusMessageReceived.lastFontFamilyShiftTime
    );

    // cleanup
    await client.close();
    server.close();
  });

  test('should reset the shift interval on the client when running the "RESET_SHIFT_INTERVAL" command', async () => {
    // arrange
    const server = await ipcServer.start(connectionOptions);
    const client = await ipcClient.connect(connectionOptions);
    await sleep(50);

    const previousLastUpdateStatusMessageReceived =
      client.lastUpdateStatusMessageReceived;

    // act
    await client.resetShiftInterval();
    await sleep(50);

    // assert
    expect(
      client.lastUpdateStatusMessageReceived.lastColorThemeShiftTime
    ).toBeGreaterThan(
      previousLastUpdateStatusMessageReceived.lastColorThemeShiftTime
    );
    expect(
      client.lastUpdateStatusMessageReceived.lastFontFamilyShiftTime
    ).toBeGreaterThan(
      previousLastUpdateStatusMessageReceived.lastFontFamilyShiftTime
    );

    // cleanup
    await client.close();
    server.close();
  });

  // Drop `node-ipc` and use `net` directly to support this test
  test.skip(
    "should pause the shift interval and fallback to backup socket server keeping the paused state when the current node-ipc server has been closed"
  );

  test('should display remaining time "##:##" when both shift iterval min settings are the same', async () => {
    // arrange
    // act
    const server = await ipcServer.start(connectionOptions);
    const client = await ipcClient.connect(connectionOptions);
    await sleep(50);

    // assert
    expect(client.lastUpdateStatusMessageReceived.text).toMatch(
      /^\d{2}:\d{2}$/
    );

    // cleanup
    await client.close();
    server.close();
  });

  test('should display remaining time "##:## (color theme)" when the color theme will shift next', async () => {
    // arrange
    await updateConfig("shifty.shiftInterval.shiftColorThemeIntervalMin", 5);
    await updateConfig("shifty.shiftInterval.shiftFontFamilyIntervalMin", 10);

    // act
    const server = await ipcServer.start(connectionOptions);
    const client = await ipcClient.connect(connectionOptions);

    // assert
    await wait(() => {
      expect(client.lastUpdateStatusMessageReceived.text).toMatch(
        /^\d{2}:\d{2} \(color theme\)$/
      );
    });

    // cleanup
    await client.close();
    server.close();
  });

  test('should display remaining time "##:## (font family)" when the font family will shift next', async () => {
    // arrange
    await updateConfig("shifty.shiftInterval.shiftColorThemeIntervalMin", 10);
    await updateConfig("shifty.shiftInterval.shiftFontFamilyIntervalMin", 5);

    // act
    const server = await ipcServer.start(connectionOptions);
    const client = await ipcClient.connect(connectionOptions);
    await sleep(50);

    // assert
    expect(client.lastUpdateStatusMessageReceived.text).toMatch(
      /^\d{2}:\d{2} \(font family\)$/
    );

    // cleanup
    await client.close();
    server.close();
  });

  test('should display remaining time "##:## (paused)" when the shift interval is paused', async () => {
    // arrange
    const server = await ipcServer.start(connectionOptions);
    const client = await ipcClient.connect(connectionOptions);
    await sleep(50);

    // act
    server.pauseShiftInterval();
    await sleep(50);

    // assert
    expect(client.lastUpdateStatusMessageReceived.text).toMatch(
      /^\d{2}:\d{2} \(paused\)$/
    );

    // cleanup
    await client.close();
    server.close();
  });

  test('should display remaining time "##:##" when the font family shift interval has been disabled', async () => {
    // arrange
    await updateConfig("shifty.shiftInterval.shiftColorThemeIntervalMin", 10);
    await updateConfig("shifty.shiftInterval.shiftFontFamilyIntervalMin", null);

    // act
    const server = await ipcServer.start(connectionOptions);
    const client = await ipcClient.connect(connectionOptions);
    await sleep(50);

    // assert
    expect(client.lastUpdateStatusMessageReceived.text).toMatch(
      /^\d{2}:\d{2}$/
    );

    // cleanup
    await client.close();
    server.close();
  });

  test('should display remaining time "##:##" when the color theme shift interval has been disabled', async () => {
    // arrange
    await updateConfig("shifty.shiftInterval.shiftColorThemeIntervalMin", null);
    await updateConfig("shifty.shiftInterval.shiftFontFamilyIntervalMin", 10);

    // act
    const server = await ipcServer.start(connectionOptions);
    const client = await ipcClient.connect(connectionOptions);
    await sleep(50);

    // assert
    expect(client.lastUpdateStatusMessageReceived.text).toMatch(
      /^\d{2}:\d{2}$/
    );

    // cleanup
    await client.close();
    server.close();
  });

  test("should shift the color theme when the remaining time is <= 0", async () => {
    // arrange
    await updateConfig("shifty.shiftInterval.shiftColorThemeIntervalMin", 0.01);
    await updateConfig("shifty.shiftInterval.shiftFontFamilyIntervalMin", 10);
    await updateConfig("shifty.colorThemes.favoriteColorThemes", []); // prime the cache

    // act
    const server = await ipcServer.start(connectionOptions);
    const client = await ipcClient.connect(connectionOptions);

    // assert
    await wait(() => {
      expect(getColorTheme()).not.toBe(DEFAULT_COLOR_THEME);
    });

    // cleanup
    await client.close();
    server.close();
  });

  test("should shift the font family when the remaining time is <= 0", async () => {
    // arrage
    await updateConfig("shifty.shiftInterval.shiftColorThemeIntervalMin", 10);
    await updateConfig("shifty.shiftInterval.shiftFontFamilyIntervalMin", 0.01);
    await updateConfig("shifty.fontFamilies.fallbackFontFamily", ""); // prime the cache

    // act
    const server = await ipcServer.start(connectionOptions);
    const client = await ipcClient.connect(connectionOptions);

    // assert
    await wait(() => {
      expect(getFontFamily()).not.toBe(DEFAULT_FONT_FAMILY);
    });

    // cleanup
    await client.close();
    server.close();
  });

  test("should shift the color theme & font family when the remaining time is <= 0", async () => {
    // arrange
    await updateConfig("shifty.shiftInterval.shiftColorThemeIntervalMin", 0.01);
    await updateConfig("shifty.shiftInterval.shiftFontFamilyIntervalMin", 0.01);
    await updateConfig("shifty.colorThemes.favoriteColorThemes", []); // prime the cache
    await updateConfig("shifty.fontFamilies.fallbackFontFamily", ""); // prime the cache

    // act
    const server = await ipcServer.start(connectionOptions);
    const client = await ipcClient.connect(connectionOptions);

    // assert
    await wait(() => {
      expect(getColorTheme()).not.toBe(DEFAULT_COLOR_THEME);
      expect(getFontFamily()).not.toBe(DEFAULT_FONT_FAMILY);
    });

    // cleanup
    await client.close();
    server.close();
  });

  test('should pause the shift interval from the server and do nothing when running the "shifty.pauseShiftInterval" command from the server', async () => {
    // arrange
    const server = await ipcServer.start(connectionOptions);
    const client = await ipcClient.connect(connectionOptions);
    await sleep(50);

    server.pauseShiftInterval();
    await sleep(50);

    const statusBarText = client.lastUpdateStatusMessageReceived.text;

    // act
    server.pauseShiftInterval();
    await sleep(50);

    // assert
    expect(statusBarText).toBe(client.lastUpdateStatusMessageReceived.text);

    // cleanup
    await client.close();
    server.close();
  });

  test('should pause the shift interval from the server and do nothing when running the "shifty.pauseShiftInterval" command from the client', async () => {
    // arrange
    const server = await ipcServer.start(connectionOptions);
    const client = await ipcClient.connect(connectionOptions);
    await sleep(50);

    server.pauseShiftInterval();
    await sleep(50);

    const statusBarText = client.lastUpdateStatusMessageReceived.text;

    // act
    await client.pauseShiftInterval();
    await sleep(50);

    // assert
    expect(statusBarText).toBe(client.lastUpdateStatusMessageReceived.text);

    // cleanup
    await client.close();
    server.close();
  });

  test('should pause the shift interval from the client and do nothing when running the "shifty.pauseShiftInterval" command from the client', async () => {
    // arrange
    const server = await ipcServer.start(connectionOptions);
    const client = await ipcClient.connect(connectionOptions);
    await sleep(50);

    await client.pauseShiftInterval();
    await sleep(50);

    const statusBarText = client.lastUpdateStatusMessageReceived.text;

    // act
    await client.pauseShiftInterval();
    await sleep(50);

    // assert
    expect(statusBarText).toBe(client.lastUpdateStatusMessageReceived.text);

    // cleanup
    await client.close();
    server.close();
  });

  test('should pause the shift interval from the client and do nothing when running the "shifty.pauseShiftInterval" command from the server', async () => {
    // arrange
    const server = await ipcServer.start(connectionOptions);
    const client = await ipcClient.connect(connectionOptions);
    await sleep(50);

    await client.pauseShiftInterval();
    await sleep(50);

    const statusBarText = client.lastUpdateStatusMessageReceived.text;

    // act
    server.pauseShiftInterval();
    await sleep(50);

    // assert
    expect(statusBarText).toBe(client.lastUpdateStatusMessageReceived.text);

    // cleanup
    await client.close();
    server.close();
  });
});
