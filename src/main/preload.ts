// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { AxiosRequestConfig } from 'axios';

export type Channels = 'ipc-example' | 'ipc-back-msg';

const electronHandler = {
  ipcRenderer: {
    sendMessage(channel: Channels, ...args: unknown[]) {
      ipcRenderer.send(channel, ...args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    remove(channel: Channels) {
      ipcRenderer.removeAllListeners(channel);
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },
  async axios(url: string, conf: AxiosRequestConfig) {
    try {
      await ipcRenderer.invoke('axios', url, conf);
    } catch (error) {
      console.error(error);
      return {};
    }
    return {};
  },
  async getVideoInfo(url: string): Promise<VideoInfo> {
    return await ipcRenderer.invoke('getVideoInfo', url);
  },
  async download(params: downloadReq): Promise<downloadResp> {
    return await ipcRenderer.invoke('download', params);
  },
  async openDirectory(url: string) {
    return await ipcRenderer.invoke('openDirectory', url);
  },
  async setDefaultDir() {
    return await ipcRenderer.invoke('setDefaultDir');
  },
  async getUserInfo(): Promise<getUserInfoResp> {
    return await ipcRenderer.invoke('getUserInfo');
  },
  async setUserInfo(key: string, val: string) {
    return await ipcRenderer.invoke('setUserInfo');
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
