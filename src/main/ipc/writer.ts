import { BrowserWindow, ipcMain, IpcMainInvokeEvent, shell } from 'electron';
import axios, { AxiosProgressEvent } from 'axios';
import path from 'node:path';
import fs from 'node:fs';
import { v4 as uuidv4 } from 'uuid';
import { GetVideoType, VideoType } from '../../renderer/utils';
import writer from '../core';
import { SetDefaultDir } from './tool';

export default function initWriterIpc() {
  ipcMain.handle(
    'getVideoInfo',
    async (e: IpcMainInvokeEvent, videoUrl: string) => {
      // 先获取视频信息
      const videoType = GetVideoType(videoUrl);
      if (videoType.t == VideoType.VideoTypeUnknown) {
        return {};
      }

      const typeClass = writer[videoType.text];
      const info = await typeClass.getVideoInfo(videoUrl);

      return info;
    },
  );

  ipcMain.handle(
    'download',
    async (
      e: IpcMainInvokeEvent,
      params: downloadReq,
    ): Promise<downloadResp> => {
      // 先获取视频信息
      const videoType = GetVideoType(params.orgUrl);
      if (videoType.t == VideoType.VideoTypeUnknown) {
        throw new Error('不支持的链接');
      }

      const defaultDir = await SetDefaultDir(false);

      if (!defaultDir) {
        BrowserWindow.getFocusedWindow()?.webContents.send('ipc-back-msg', {
          type: 'api-info',
          info: '请选择默认导出文件夹',
        });
        throw new Error('请选择默认导出文件夹');
      }

      params.defaultDir = defaultDir;
      const typeClass = writer[videoType.text];
      const info = await typeClass.download(params);

      return info;
    },
  );

  ipcMain.handle(
    'openDirectory',
    async (e: IpcMainInvokeEvent, directoryPath: string) => {
      try {
        await shell.openPath(directoryPath);
      } catch (err) {
        console.error('Failed to open directory:', err);
      }
    },
  );

  // ipcMain.handle(
  //   'download',
  //   async (
  //     e: IpcMainInvokeEvent,
  //     textUrl: string,
  //     title: string,
  //   ): Promise<apiDownloadResp> => {
  //     const defaultDir = await SetDefaultDir(false);

  //     if (!defaultDir) {
  //       BrowserWindow.getFocusedWindow()?.webContents.send('ipc-back-msg', {
  //         type: 'api-info',
  //         info: '请选择默认导出文件夹',
  //       });
  //       throw new Error('请选择默认导出文件夹');
  //     }

  //     const filename = `${title}${uuidv4()}.txt`;
  //     const txtPath = path.join(defaultDir, filename);
  //     const writer = fs.createWriteStream(txtPath);

  //     const resp = await axios({
  //       method: 'get',
  //       url: textUrl,
  //       responseType: 'stream',
  //       onDownloadProgress: (progressEvent: AxiosProgressEvent) => {
  //         const percentCompleted = Math.round(
  //           (progressEvent.loaded * 100) / (progressEvent.total as number),
  //         );
  //         console.log(`下载进度: ${percentCompleted}%`);
  //       },
  //     });

  //     resp.data.pipe(writer);

  //     return new Promise((resolve, reject) => {
  //       writer.on('finish', () => {
  //         BrowserWindow.getFocusedWindow()?.webContents.send('ipc-back-msg', {
  //           type: 'api-success',
  //           info: `文案已成功导出`,
  //         });
  //         resolve({
  //           default_dir: defaultDir,
  //           full_file_path: txtPath,
  //           filename: filename,
  //         });
  //       });
  //       writer.on('error', reject);
  //     });
  //   },
  // );
}
