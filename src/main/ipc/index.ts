import { ipcMain, IpcMainInvokeEvent } from 'electron';
import { AxiosRequestConfig } from 'axios';
import initWriterIpc from './writer';
import initUserIpc from './user';

export default function initMainIpc() {
  ipcMain.on('ipc-example', async (event, arg) => {
    const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
    console.log(msgTemplate(arg));
    event.reply('ipc-example', msgTemplate('pong'));
  });
}

export { initWriterIpc, initMainIpc, initUserIpc };
