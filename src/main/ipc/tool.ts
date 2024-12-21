import { dialog } from 'electron';
import { DictKeys } from '../core/common';
import { GetDict, SetDict } from '../core/store';

export async function SetDefaultDir(force: boolean): Promise<string> {
  // 如果不是强制设置 则先查询是否已设置过
  if (!force) {
    const defaultDir = await GetDict(DictKeys.DefaultDir);
    if (defaultDir) {
      return defaultDir;
    }
  }

  const res = await dialog.showOpenDialog({
    title: '请选择导出的默认文件夹',
    properties: ['openDirectory'],
  });

  if (res.canceled) {
    return '';
  }

  const defaultDir = res.filePaths[0]; // 用户选择的文件夹路径

  // 保存默认路径
  await SetDict(DictKeys.DefaultDir, defaultDir);

  return defaultDir;
}
