import * as vscode from 'vscode'
import {getColorTheme, DEFAULT_COLOR_THEME} from '../color-themes'
import {getFontFamily, DEFAULT_FONT_FAMILY} from '../font-families'
import {updateConfig, sleep, wait} from '../test/test-utils'
import * as ipcServer from './ipc-server'
import * as ipcClient from './ipc-client'
import {ConnectionOptions} from './ipc-types'

const connectionOptions: ConnectionOptions = {
  serverId: 'fake-id',
  serverPath: '/tmp/fake.path',
  lastColorThemeShiftTime: 0,
  lastFontFamilyShiftTime: 0,
  lastPauseTime: 0,
}

test('registers shift interval commands when VS Code starts up', async () => {
  const commands = await vscode.commands.getCommands()
  expect(commands).toContain('shifty.startShiftInterval')
  expect(commands).toContain('shifty.pauseShiftInterval')
})

test('registers client socket with node-ipc server', async () => {
  const server = await ipcServer.start(connectionOptions)
  const client = await ipcClient.connect(connectionOptions)

  const [socket] = server.connectedSockets
  expect(socket.id).toBe(client.id)

  await client.close()
  server.close()
})

test('should register multiple client sockets with node-ipc server', async () => {
  const server = await ipcServer.start(connectionOptions)
  const client1 = await ipcClient.connect(connectionOptions)
  const client2 = await ipcClient.connect(connectionOptions)
  const client3 = await ipcClient.connect(connectionOptions)

  const [socket1, socket2, socket3] = server.connectedSockets
  expect(socket1.id).toBe(client1.id)
  expect(socket2.id).toBe(client2.id)
  expect(socket3.id).toBe(client3.id)

  await client3.close()
  await client2.close()
  await client1.close()
  server.close()
})

test('should register first connected client socket as backup socket server', async () => {
  const server = await ipcServer.start(connectionOptions)
  const backupSocketServer = await ipcClient.connect(connectionOptions)
  const client = await ipcClient.connect(connectionOptions)

  expect(server.connectedSockets.length).toBe(2)
  expect(server.backupSocketServerId).toBe(backupSocketServer.id)

  await client.close()
  await backupSocketServer.close()
  server.close()
})

test('should receive status updates from node-ipc server', async () => {
  const server = await ipcServer.start(connectionOptions)
  const client = await ipcClient.connect(connectionOptions)

  await wait(() => {
    expect(client.statusMessagesReceived).toBeGreaterThan(2)
  })

  await client.close()
  server.close()
})

test('should close client socket and disconnect from node-ipc server', async () => {
  const server = await ipcServer.start(connectionOptions)
  const client = await ipcClient.connect(connectionOptions)

  expect(server.connectedSockets.length).toBe(1)
  await client.close()
  expect(server.connectedSockets.length).toBe(0)

  server.close()
})

test('should register new client socket as backup socket server when the current backup socket server has been closed', async () => {
  const server = await ipcServer.start(connectionOptions)
  const backupSocketServer = await ipcClient.connect(connectionOptions)
  const client = await ipcClient.connect(connectionOptions)

  expect(server.connectedSockets.length).toBe(2)
  expect(server.backupSocketServerId).toBe(backupSocketServer.id)

  await backupSocketServer.close()
  expect(server.connectedSockets.length).toBe(1)
  expect(server.backupSocketServerId).toBe(client.id)

  await client.close()
  server.close()
})

// Drop `node-ipc` and use `net` directly to support this test
test.todo(
  'should fallback to backup socket server when the current node-ipc server has been closed',
)

test('should start the shift interval on VS Code startup when "shifty.shiftInterval.automaticallyStartShiftInterval" setting is enabled', async () => {
  const server = await ipcServer.start(connectionOptions)
  const client = await ipcClient.connect(connectionOptions)

  await wait(() => {
    expect(client.statusMessagesReceived).toBeGreaterThan(0)
  })

  await client.close()
  server.close()
})

test('should not start the shift interval on VS Code startup when "shifty.shiftInterval.automaticallyStartShiftInterval" setting is disabled', async () => {
  await updateConfig(
    'shifty.shiftInterval.automaticallyStartShiftInterval',
    false,
  )

  const server = await ipcServer.start(connectionOptions)
  const client = await ipcClient.connect(connectionOptions)
  await sleep(25)

  expect(client.statusMessagesReceived).toBe(0)

  await client.close()
  server.close()
})

test('should not start the shift interval on VS Code startup when "shifty.shiftInterval.shiftColorThemeIntervalMin" and "shifty.shiftInterval.shiftFontFamilyIntervalMin" settings are null', async () => {
  await updateConfig('shifty.shiftInterval.shiftColorThemeIntervalMin', null)
  await updateConfig('shifty.shiftInterval.shiftFontFamilyIntervalMin', null)

  const server = await ipcServer.start(connectionOptions)
  const client = await ipcClient.connect(connectionOptions)
  await sleep(25)

  expect(client.statusMessagesReceived).toBe(0)

  await client.close()
  server.close()
})

test('should not start the shift interval on VS Code startup when "shifty.shiftInterval.shiftColorThemeIntervalMin" and "shifty.shiftInterval.shiftFontFamilyIntervalMin" settings are 0', async () => {
  await updateConfig('shifty.shiftInterval.shiftColorThemeIntervalMin', 0)
  await updateConfig('shifty.shiftInterval.shiftFontFamilyIntervalMin', 0)

  const server = await ipcServer.start(connectionOptions)
  const client = await ipcClient.connect(connectionOptions)
  await sleep(25)

  expect(client.statusMessagesReceived).toBe(0)

  await client.close()
  server.close()
})

test('should pause the shift interval on the server when running the "shifty.pauseShiftInterval" command', async () => {
  const server = await ipcServer.start(connectionOptions)
  const client = await ipcClient.connect(connectionOptions)
  await sleep(25)

  server.pauseShiftInterval() // FIXME: would be nice to be able to await this
  await sleep(25)

  const previousStatusMessagesReceived = client.statusMessagesReceived
  await sleep(25)

  expect(client.statusMessagesReceived).toEqual(previousStatusMessagesReceived)

  await client.close()
  server.close()
})

test('should pause the shift interval on the client when running the "shifty.pauseShiftInterval" command', async () => {
  const server = await ipcServer.start(connectionOptions)
  const client = await ipcClient.connect(connectionOptions)
  await sleep(25)

  await client.pauseShiftInterval()
  await sleep(25)

  const previousStatusMessagesReceived = client.statusMessagesReceived
  await sleep(25)

  expect(client.statusMessagesReceived).toEqual(previousStatusMessagesReceived)

  await client.close()
  server.close()
})

test('should start the shift interval on the server when running the "shifty.startShiftInterval" command', async () => {
  const server = await ipcServer.start(connectionOptions)
  const client = await ipcClient.connect(connectionOptions)
  await sleep(25)

  server.pauseShiftInterval()
  await sleep(25)

  const previousStatusMessagesReceived = client.statusMessagesReceived
  await sleep(25)

  expect(client.statusMessagesReceived).toEqual(previousStatusMessagesReceived)

  server.startShiftInterval()
  await sleep(25)

  expect(client.statusMessagesReceived).toBeGreaterThan(
    previousStatusMessagesReceived,
  )

  await client.close()
  server.close()
})

test('should start the shift interval on the client when running the "shifty.startShiftInterval" command', async () => {
  const server = await ipcServer.start(connectionOptions)
  const client = await ipcClient.connect(connectionOptions)
  await sleep(25)

  await client.pauseShiftInterval()
  await sleep(25)

  const previousStatusMessagesReceived = client.statusMessagesReceived
  await sleep(25)

  expect(client.statusMessagesReceived).toEqual(previousStatusMessagesReceived)

  await client.startShiftInterval()
  await sleep(25)

  expect(client.statusMessagesReceived).toBeGreaterThan(
    previousStatusMessagesReceived,
  )

  await client.close()
  server.close()
})

// Drop `node-ipc` and use `net` directly to support this test
test.todo(
  'should pause the shift interval and fallback to backup socket server keeping the paused state when the current node-ipc server has been closed',
)

test('should display remaining time "##:##" when both shift iterval min settings are the same', async () => {
  const server = await ipcServer.start(connectionOptions)
  const client = await ipcClient.connect(connectionOptions)
  await sleep(25)

  expect(client.lastUpdateStatusMessageReceived.text).toMatch(/^\d{2}:\d{2}$/)

  await client.close()
  server.close()
})

test('should display remaining time "##:## (color theme)" when the color theme will shift next', async () => {
  await updateConfig('shifty.shiftInterval.shiftColorThemeIntervalMin', 5)
  await updateConfig('shifty.shiftInterval.shiftFontFamilyIntervalMin', 10)

  const server = await ipcServer.start(connectionOptions)
  const client = await ipcClient.connect(connectionOptions)

  await wait(() => {
    expect(client.lastUpdateStatusMessageReceived.text).toMatch(
      /^\d{2}:\d{2} \(color theme\)$/,
    )
  })

  await client.close()
  server.close()
})

test('should display remaining time "##:## (font family)" when the font family will shift next', async () => {
  await updateConfig('shifty.shiftInterval.shiftColorThemeIntervalMin', 10)
  await updateConfig('shifty.shiftInterval.shiftFontFamilyIntervalMin', 5)

  const server = await ipcServer.start(connectionOptions)
  const client = await ipcClient.connect(connectionOptions)
  await sleep(25)

  expect(client.lastUpdateStatusMessageReceived.text).toMatch(
    /^\d{2}:\d{2} \(font family\)$/,
  )

  await client.close()
  server.close()
})

test('should display remaining time "##:## (paused)" when the shift interval is paused', async () => {
  const server = await ipcServer.start(connectionOptions)
  const client = await ipcClient.connect(connectionOptions)
  await sleep(25)

  server.pauseShiftInterval()
  await sleep(25)

  expect(client.lastUpdateStatusMessageReceived.text).toMatch(
    /^\d{2}:\d{2} \(paused\)$/,
  )

  await client.close()
  server.close()
})

test('should display remaining time "##:##" when the font family shift interval has been disabled', async () => {
  await updateConfig('shifty.shiftInterval.shiftColorThemeIntervalMin', 10)
  await updateConfig('shifty.shiftInterval.shiftFontFamilyIntervalMin', null)

  const server = await ipcServer.start(connectionOptions)
  const client = await ipcClient.connect(connectionOptions)
  await sleep(25)

  expect(client.lastUpdateStatusMessageReceived.text).toMatch(/^\d{2}:\d{2}$/)

  await client.close()
  server.close()
})

test('should display remaining time "##:##" when the color theme shift interval has been disabled', async () => {
  await updateConfig('shifty.shiftInterval.shiftColorThemeIntervalMin', null)
  await updateConfig('shifty.shiftInterval.shiftFontFamilyIntervalMin', 10)

  const server = await ipcServer.start(connectionOptions)
  const client = await ipcClient.connect(connectionOptions)
  await sleep(25)

  expect(client.lastUpdateStatusMessageReceived.text).toMatch(/^\d{2}:\d{2}$/)

  await client.close()
  server.close()
})

test('should shift the color theme when the remaining time is <= 0', async () => {
  await updateConfig('shifty.shiftInterval.shiftColorThemeIntervalMin', 0.01)
  await updateConfig('shifty.shiftInterval.shiftFontFamilyIntervalMin', 10)

  // change any shifty.colorThemes config to prime the cache
  await updateConfig('shifty.colorThemes.favoriteColorThemes', [])

  const server = await ipcServer.start(connectionOptions)
  const client = await ipcClient.connect(connectionOptions)

  await wait(() => {
    expect(getColorTheme()).not.toBe(DEFAULT_COLOR_THEME.id)
  })

  await client.close()
  server.close()
})

test('should shift the font family when the remaining time is <= 0', async () => {
  await updateConfig('shifty.shiftInterval.shiftColorThemeIntervalMin', 10)
  await updateConfig('shifty.shiftInterval.shiftFontFamilyIntervalMin', 0.01)

  // change any shifty.fontFamilies config to prime the cache
  await updateConfig('shifty.fontFamilies.fallbackFontFamily', '')

  const server = await ipcServer.start(connectionOptions)
  const client = await ipcClient.connect(connectionOptions)

  await wait(() => {
    expect(getFontFamily()).not.toBe(DEFAULT_FONT_FAMILY.id)
  })

  await client.close()
  server.close()
})

test('should shift the color theme & font family when the remaining time is <= 0', async () => {
  await updateConfig('shifty.shiftInterval.shiftColorThemeIntervalMin', 0.01)
  await updateConfig('shifty.shiftInterval.shiftFontFamilyIntervalMin', 0.01)

  // change any shifty.colorThemes & shifty.fontFamilies config to prime the cache
  await updateConfig('shifty.colorThemes.favoriteColorThemes', [])
  await updateConfig('shifty.fontFamilies.fallbackFontFamily', '')

  const server = await ipcServer.start(connectionOptions)
  const client = await ipcClient.connect(connectionOptions)

  await wait(() => {
    expect(getColorTheme()).not.toBe(DEFAULT_COLOR_THEME.id)
    expect(getFontFamily()).not.toBe(DEFAULT_FONT_FAMILY.id)
  })

  await client.close()
  server.close()
})

test('should pause the shift interval from the server and do nothing when running the "shifty.pauseShiftInterval" command from the server', async () => {
  const server = await ipcServer.start(connectionOptions)
  const client = await ipcClient.connect(connectionOptions)
  await sleep(25)

  server.pauseShiftInterval()
  await sleep(25)

  const statusBarText = client.lastUpdateStatusMessageReceived.text

  server.pauseShiftInterval()
  await sleep(25)

  expect(statusBarText).toBe(client.lastUpdateStatusMessageReceived.text)

  await client.close()
  server.close()
})

test('should pause the shift interval from the server and do nothing when running the "shifty.pauseShiftInterval" command from the client', async () => {
  const server = await ipcServer.start(connectionOptions)
  const client = await ipcClient.connect(connectionOptions)
  await sleep(25)

  server.pauseShiftInterval()
  await sleep(25)

  const statusBarText = client.lastUpdateStatusMessageReceived.text

  await client.pauseShiftInterval()
  await sleep(25)

  expect(statusBarText).toBe(client.lastUpdateStatusMessageReceived.text)

  await client.close()
  server.close()
})

test('should pause the shift interval from the client and do nothing when running the "shifty.pauseShiftInterval" command from the client', async () => {
  const server = await ipcServer.start(connectionOptions)
  const client = await ipcClient.connect(connectionOptions)
  await sleep(25)

  await client.pauseShiftInterval()
  await sleep(25)

  const statusBarText = client.lastUpdateStatusMessageReceived.text

  await client.pauseShiftInterval()
  await sleep(25)

  expect(statusBarText).toBe(client.lastUpdateStatusMessageReceived.text)

  await client.close()
  server.close()
})

test('should pause the shift interval from the client and do nothing when running the "shifty.pauseShiftInterval" command from the server', async () => {
  const server = await ipcServer.start(connectionOptions)
  const client = await ipcClient.connect(connectionOptions)
  await sleep(25)

  await client.pauseShiftInterval()
  await sleep(25)

  const statusBarText = client.lastUpdateStatusMessageReceived.text

  server.pauseShiftInterval()
  await sleep(25)

  expect(statusBarText).toBe(client.lastUpdateStatusMessageReceived.text)

  await client.close()
  server.close()
})
