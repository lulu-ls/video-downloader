// 字典
export enum DictKeys {
  Token = 'token',
  DefaultDir = 'default_dir',
  DownloadType = 'download_type',
}

// 格式化时间
export const FormatSeconed = (duration: number) => {
  const hours = Math.floor(duration / 3600);
  const minus = Math.floor((duration - hours * 3600) / 60);
  const secends = Math.floor(duration - minus * 60 - hours * 3600);
  return `${hours > 9 ? hours : '0' + hours}:${minus > 9 ? minus : '0' + minus}:${secends > 9 ? secends : '0' + secends}`;
};

// 模糊匹配 key
export const GetLikeKeyValue = (likeKey: string, obj: any): any => {
  for (let key in obj) {
    if (key.includes(likeKey)) {
      return obj[key];
    }
  }
};
