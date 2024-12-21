/* eslint import/prefer-default-export: off */
import { URL } from 'url';
import path from 'path';
import { mkdirp } from 'mkdirp';

export function resolveHtmlPath(htmlFileName: string) {
  if (process.env.NODE_ENV === 'development') {
    const port = process.env.PORT || 1212;
    const url = new URL(`http://localhost:${port}`);
    url.pathname = htmlFileName;
    return url.href;
  }
  return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`;
}

export async function InitDownloadDir() {
  const downloadPath = path.join(getAppDataPath(), 'downloads');

  mkdirp.sync(getAppDataPath());
  console.log('init download dir success');
}

export const getDownloadPath = () => {
  const downloadPath = path.join(getAppDataPath(), 'downloads');
  mkdirp.sync(downloadPath);
  return downloadPath;
};

export const getDBPath = () => {
  const dbPath = path.join(getAppDataPath(), 'db.db');
  mkdirp.sync(dbPath);
  return dbPath;
};

export const getAppDataPath = () => {
  const appName = 'VideoDownloader';
  switch (process.platform) {
    case 'darwin': {
      return path.join(
        process.env['HOME'] as string,
        'Library',
        'Application Support',
        appName,
      );
    }
    case 'win32': {
      return path.join(process.env.APPDATA as string, appName);
    }
    case 'linux': {
      return path.join(process.env['HOME'] as string, appName);
    }
    default: {
      console.log('Unsupported platform!');
      return './';
    }
  }
};
