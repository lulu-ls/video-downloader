import axios from 'axios';
import fs from 'fs';

export async function DownloadFile(
  url: string,
  filePath: string,
): Promise<any> {
  try {
    const response = await axios.get(url, {
      responseType: 'stream',
      headers: {
        'User-Agent': generateUa(),
      },
    });
    // Todo 创建目录
    // const filePath = `${fileName}`
    const fd = fs.openSync(filePath, 'w');
    fs.closeSync(fd);
    const writer = fs.createWriteStream(filePath);

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  } catch (error) {
    console.error('Error downloading file:', error);
    throw error;
  }
}

const generateUa = () => {
  const osTypes = ['Windows', 'Mac', 'Linux', 'iOS', 'Android'];
  const browsers = ['Chrome', 'Firefox', 'Safari', 'Edge', 'IE'];
  const versions = ['71', '70', '69', '68', '67', '66', '65']; // 以Chrome为例，随机选取版本

  // 随机选择操作系统类型
  const os = osTypes[Math.floor(Math.random() * osTypes.length)];

  // 随机选择浏览器
  const browser = browsers[Math.floor(Math.random() * browsers.length)];

  // 随机选择版本
  const version = versions[Math.floor(Math.random() * versions.length)];

  // 构造UA字符串
  let ua = `${browser}/${version} ${os} (KHTML, like Gecko) Version/${version}.0 Safari/${version}.0`;

  return ua;
};
