import { BrowserWindow, ipcMain, IpcMainInvokeEvent } from 'electron';
import { SetDefaultDir } from './tool';
import { GetDict, SetDict } from '../core/store';
import { DictKeys } from '../core';

export default function InitUserIpc() {
  ipcMain.handle('setDefaultDir', async (e: IpcMainInvokeEvent) => {
    const dir = await SetDefaultDir(true);

    if (!dir) {
      BrowserWindow.getFocusedWindow()?.webContents.send('ipc-back-msg', {
        type: 'api-info',
        info: '未选择默认导出文件夹',
      });
      throw new Error('请选择默认导出文件夹');
    }
  });

  ipcMain.handle(
    'getUserInfo',
    async (e: IpcMainInvokeEvent): Promise<getUserInfoResp> => {
      const defaultDir = await GetDict(DictKeys.DefaultDir);
      const downloadType = await GetDict(DictKeys.DownloadType);
      return {
        defaultDir,
        downloadType,
      };
    },
  );

  ipcMain.handle(
    'setUserInfo',
    async (e: IpcMainInvokeEvent, key: string, val: string) => {
      await SetDict(key, val);
    },
  );
}
