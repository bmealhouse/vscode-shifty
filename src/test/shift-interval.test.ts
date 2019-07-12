import * as assert from 'assert';
import * as vscode from 'vscode';
import {getColorTheme, DEFAULT_COLOR_THEME} from '../color-themes';
import {getFontFamily, DEFAULT_FONT_FAMILY} from '../font-families';
import * as ipcClient from '../shift-interval/ipc-client';
import * as ipcServer from '../shift-interval/ipc-server';
import {ConnectionOptions} from '../shift-interval/ipc-types';
import {setupTest, teardownTest, setConfig, wait, sleep} from './test-utils';

const connectionOptions: ConnectionOptions = {
  serverId: 'fake-id',
  serverPath: '/tmp/fake.path',
  lastColorThemeShiftTime: 0,
  lastFontFamilyShiftTime: 0,
  lastPauseTime: 0,
};

suite('shift-interval.test.ts', () => {
  setup(async () => {
    await setupTest();
  });

  teardown(async () => {
    await teardownTest();
  });

  test('should register shift interval commands when VS Code starts up', async () => {
    const commands = await vscode.commands.getCommands();
    assert.ok(commands.includes('shifty.startShiftInterval'));
    assert.ok(commands.includes('shifty.pauseShiftInterval'));
  });

  test('should register client socket with node-ipc server', async () => {
    const server = await ipcServer.start(connectionOptions);
    const client = await ipcClient.connect(connectionOptions);

    const [socket] = server.connectedSockets;
    assert.strictEqual(socket.id, client.id);

    await client.close();
    server.close();
  });

  test('should register multiple client sockets with node-ipc server', async () => {
    const server = await ipcServer.start(connectionOptions);
    const client1 = await ipcClient.connect(connectionOptions);
    const client2 = await ipcClient.connect(connectionOptions);
    const client3 = await ipcClient.connect(connectionOptions);

    const [socket1, socket2, socket3] = server.connectedSockets;
    assert.strictEqual(socket1.id, client1.id);
    assert.strictEqual(socket2.id, client2.id);
    assert.strictEqual(socket3.id, client3.id);

    await client3.close();
    await client2.close();
    await client1.close();
    server.close();
  });

  test('should register first connected client socket as backup socket server', async () => {
    const server = await ipcServer.start(connectionOptions);
    const backupSocketServer = await ipcClient.connect(connectionOptions);
    const client = await ipcClient.connect(connectionOptions);

    assert.strictEqual(server.connectedSockets.length, 2);
    assert.strictEqual(server.backupSocketServerId, backupSocketServer.id);

    await client.close();
    await backupSocketServer.close();
    server.close();
  });

  test('should receive status updates from node-ipc server', async () => {
    const server = await ipcServer.start(connectionOptions);
    const client = await ipcClient.connect(connectionOptions);

    await wait(() => {
      assert.ok(client.statusMessagesReceived > 2);
    });

    await client.close();
    server.close();
  });

  test('should close client socket and disconnect from node-ipc server', async () => {
    const server = await ipcServer.start(connectionOptions);
    const client = await ipcClient.connect(connectionOptions);

    assert.strictEqual(server.connectedSockets.length, 1);
    await client.close();
    assert.strictEqual(server.connectedSockets.length, 0);

    server.close();
  });

  test('should register new client socket as backup socket server when the current backup socket server has been closed', async () => {
    const server = await ipcServer.start(connectionOptions);
    const backupSocketServer = await ipcClient.connect(connectionOptions);
    const client = await ipcClient.connect(connectionOptions);

    assert.strictEqual(server.connectedSockets.length, 2);
    assert.strictEqual(server.backupSocketServerId, backupSocketServer.id);

    await backupSocketServer.close();
    assert.strictEqual(server.connectedSockets.length, 1);
    assert.strictEqual(server.backupSocketServerId, client.id);

    await client.close();
    server.close();
  });

  // Drop `node-ipc` and use `net` directly to support this test
  test(
    'should fallback to backup socket server when the current node-ipc server has been closed',
  );

  test('should start the shift interval on VS Code startup when "shifty.shiftInterval.automaticallyStartShiftInterval" setting is enabled', async () => {
    const client = await ipcClient.connect();

    await wait(() => {
      assert.ok(client.statusMessagesReceived > 0);
    });

    await client.close();
  });

  test('should not start the shift interval on VS Code startup when "shifty.shiftInterval.automaticallyStartShiftInterval" setting is disabled', async () => {
    await setConfig(
      'shifty.shiftInterval.automaticallyStartShiftInterval',
      false,
    );

    const server = await ipcServer.start(connectionOptions);
    const client = await ipcClient.connect(connectionOptions);
    await sleep(25);

    assert.strictEqual(client.statusMessagesReceived, 0);

    await client.close();
    server.close();
  });

  test('should not start the shift interval on VS Code startup when "shifty.shiftInterval.shiftColorThemeIntervalMin" and "shifty.shiftInterval.shiftFontFamilyIntervalMin" settings are null', async () => {
    await setConfig('shifty.shiftInterval.shiftColorThemeIntervalMin', null);
    await setConfig('shifty.shiftInterval.shiftFontFamilyIntervalMin', null);

    const server = await ipcServer.start(connectionOptions);
    const client = await ipcClient.connect(connectionOptions);
    await sleep(25);

    assert.strictEqual(client.statusMessagesReceived, 0);

    await client.close();
    server.close();
  });

  test('should not start the shift interval on VS Code startup when "shifty.shiftInterval.shiftColorThemeIntervalMin" and "shifty.shiftInterval.shiftFontFamilyIntervalMin" settings are 0', async () => {
    await setConfig('shifty.shiftInterval.shiftColorThemeIntervalMin', 0);
    await setConfig('shifty.shiftInterval.shiftFontFamilyIntervalMin', 0);

    const server = await ipcServer.start(connectionOptions);
    const client = await ipcClient.connect(connectionOptions);
    await sleep(25);

    assert.strictEqual(client.statusMessagesReceived, 0);

    await client.close();
    server.close();
  });

  test('should pause the shift interval on the server when running the "shifty.pauseShiftInterval" command', async () => {
    const server = await ipcServer.start(connectionOptions);
    const client = await ipcClient.connect(connectionOptions);

    await sleep(25);

    server.pauseShiftInterval();
    await sleep(25);

    const previousStatusMessagesReceived = client.statusMessagesReceived;
    await sleep(25);

    assert.deepStrictEqual(
      client.statusMessagesReceived,
      previousStatusMessagesReceived,
    );

    server.close();
  });

  test('should pause the shift interval on the client when running the "shifty.pauseShiftInterval" command', async () => {
    const client = await ipcClient.connect();

    await sleep(25);

    await client.pauseShiftInterval();
    await sleep(25);

    const previousStatusMessagesReceived = client.statusMessagesReceived;
    await sleep(25);

    assert.deepStrictEqual(
      client.statusMessagesReceived,
      previousStatusMessagesReceived,
    );

    await client.close();
  });

  test('should start the shift interval on the server when running the "shifty.startShiftInterval" command', async () => {
    const server = await ipcServer.start(connectionOptions);
    const client = await ipcClient.connect(connectionOptions);

    await sleep(25);

    server.pauseShiftInterval();
    await sleep(25);

    const previousStatusMessagesReceived = client.statusMessagesReceived;
    await sleep(25);

    assert.deepStrictEqual(
      client.statusMessagesReceived,
      previousStatusMessagesReceived,
    );

    server.startShiftInterval();
    await sleep(25);

    assert.ok(client.statusMessagesReceived > previousStatusMessagesReceived);

    server.close();
  });

  test('should start the shift interval on the client when running the "shifty.startShiftInterval" command', async () => {
    const client = await ipcClient.connect();

    await sleep(25);

    await client.pauseShiftInterval();
    await sleep(25);

    const previousStatusMessagesReceived = client.statusMessagesReceived;
    await sleep(25);

    assert.deepStrictEqual(
      client.statusMessagesReceived,
      previousStatusMessagesReceived,
    );

    await client.startShiftInterval();
    await sleep(25);

    assert.ok(client.statusMessagesReceived > previousStatusMessagesReceived);

    await client.close();
  });

  // Drop `node-ipc` and use `net` directly to support this test
  test(
    'should pause the shift interval and fallback to backup socket server keeping the paused state when the current node-ipc server has been closed',
  );

  test('should display remaining time "##:##" when both shift iterval min settings are the same', async () => {
    const client = await ipcClient.connect();
    await sleep(25);

    assert.ok(
      /^\d{2}:\d{2}$/.exec(client.lastUpdateStatusMessageReceived.text),
      `The regular expression evaluated to a falsy for "${
        client.lastUpdateStatusMessageReceived.text
      }"`,
    );

    await client.close();
  });

  test('should display remaining time "##:## (color theme)" when the color theme will shift next', async () => {
    await setConfig('shifty.shiftInterval.shiftColorThemeIntervalMin', 5);
    await setConfig('shifty.shiftInterval.shiftFontFamilyIntervalMin', 10);

    const client = await ipcClient.connect();
    await sleep(25);

    assert.ok(
      /^\d{2}:\d{2} \(color theme\)$/.exec(
        client.lastUpdateStatusMessageReceived.text,
      ),
      `The regular expression evaluated to a falsy for "${
        client.lastUpdateStatusMessageReceived.text
      }"`,
    );

    await client.close();
  });

  test('should display remaining time "##:## (font family)" when the font family will shift next', async () => {
    await setConfig('shifty.shiftInterval.shiftColorThemeIntervalMin', 10);
    await setConfig('shifty.shiftInterval.shiftFontFamilyIntervalMin', 5);

    const client = await ipcClient.connect();
    await sleep(25);

    assert.ok(
      /^\d{2}:\d{2} \(font family\)$/.exec(
        client.lastUpdateStatusMessageReceived.text,
      ),
      `The regular expression evaluated to a falsy for "${
        client.lastUpdateStatusMessageReceived.text
      }"`,
    );

    await client.close();
  });

  test('should display remaining time "##:##" when the font family shift interval has been disabled', async () => {
    await setConfig('shifty.shiftInterval.shiftColorThemeIntervalMin', 10);
    await setConfig('shifty.shiftInterval.shiftFontFamilyIntervalMin', null);

    const client = await ipcClient.connect();
    await sleep(25);

    assert.ok(
      /^\d{2}:\d{2}$/.exec(client.lastUpdateStatusMessageReceived.text),
      `The regular expression evaluated to a falsy for "${
        client.lastUpdateStatusMessageReceived.text
      }"`,
    );

    await client.close();
  });

  test('should display remaining time "##:##" when the color theme shift interval has been disabled', async () => {
    await setConfig('shifty.shiftInterval.shiftColorThemeIntervalMin', null);
    await setConfig('shifty.shiftInterval.shiftFontFamilyIntervalMin', 10);

    const client = await ipcClient.connect();
    await sleep(25);

    assert.ok(
      /^\d{2}:\d{2}$/.exec(client.lastUpdateStatusMessageReceived.text),
      `The regular expression evaluated to a falsy for "${
        client.lastUpdateStatusMessageReceived.text
      }"`,
    );

    await client.close();
  });

  test('should shift the color theme when the remaining time is <= 0', async () => {
    await setConfig('shifty.shiftInterval.shiftColorThemeIntervalMin', 0.01);
    await setConfig('shifty.shiftInterval.shiftFontFamilyIntervalMin', 10);

    const client = await ipcClient.connect();
    await wait(() => {
      assert.notStrictEqual(getColorTheme(), DEFAULT_COLOR_THEME.id);
    });

    await client.close();
  });

  test('should shift the font family when the remaining time is <= 0', async () => {
    await setConfig('shifty.shiftInterval.shiftColorThemeIntervalMin', 10);
    await setConfig('shifty.shiftInterval.shiftFontFamilyIntervalMin', 0.01);

    const client = await ipcClient.connect();
    await wait(() => {
      assert.notStrictEqual(getFontFamily(), DEFAULT_FONT_FAMILY.id);
    });

    await client.close();
  });

  test('should shift the color theme & font family when the remaining time is <= 0', async () => {
    await setConfig('shifty.shiftInterval.shiftColorThemeIntervalMin', 0.01);
    await setConfig('shifty.shiftInterval.shiftFontFamilyIntervalMin', 0.01);

    const client = await ipcClient.connect();
    await wait(() => {
      assert.notStrictEqual(getColorTheme(), DEFAULT_COLOR_THEME.id);
      assert.notStrictEqual(getFontFamily(), DEFAULT_FONT_FAMILY.id);
    });

    await client.close();
  });

  test('should pause the shift interval from the server and do nothing when running the "shifty.pauseShiftInterval" command from the server', async () => {
    const server = await ipcServer.start(connectionOptions);
    const client = await ipcClient.connect(connectionOptions);

    await sleep(25);

    server.pauseShiftInterval();
    await sleep(25);

    const statusBarText = client.lastUpdateStatusMessageReceived.text;

    server.pauseShiftInterval();
    await sleep(25);

    assert.deepStrictEqual(
      statusBarText,
      client.lastUpdateStatusMessageReceived.text,
    );

    await client.close();
    server.close();
  });

  test('should pause the shift interval from the server and do nothing when running the "shifty.pauseShiftInterval" command from the client', async () => {
    const server = await ipcServer.start(connectionOptions);
    const client = await ipcClient.connect(connectionOptions);

    await sleep(25);

    server.pauseShiftInterval();
    await sleep(25);

    const statusBarText = client.lastUpdateStatusMessageReceived.text;

    await client.pauseShiftInterval();
    await sleep(25);

    assert.deepStrictEqual(
      statusBarText,
      client.lastUpdateStatusMessageReceived.text,
    );

    await client.close();
    server.close();
  });

  test('should pause the shift interval from the client and do nothing when running the "shifty.pauseShiftInterval" command from the client', async () => {
    const server = await ipcServer.start(connectionOptions);
    const client = await ipcClient.connect(connectionOptions);

    await sleep(25);

    await client.pauseShiftInterval();
    await sleep(25);

    const statusBarText = client.lastUpdateStatusMessageReceived.text;

    await client.pauseShiftInterval();
    await sleep(25);

    assert.deepStrictEqual(
      statusBarText,
      client.lastUpdateStatusMessageReceived.text,
    );

    await client.close();
    server.close();
  });

  test('should pause the shift interval from the client and do nothing when running the "shifty.pauseShiftInterval" command from the server', async () => {
    const server = await ipcServer.start(connectionOptions);
    const client = await ipcClient.connect(connectionOptions);

    await sleep(25);

    await client.pauseShiftInterval();
    await sleep(25);

    const statusBarText = client.lastUpdateStatusMessageReceived.text;

    server.pauseShiftInterval();
    await sleep(25);

    assert.deepStrictEqual(
      statusBarText,
      client.lastUpdateStatusMessageReceived.text,
    );

    await client.close();
    server.close();
  });
});
