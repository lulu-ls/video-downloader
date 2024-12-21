import { TimeStringToSeconds } from './time';
import { Sleep } from './sleep';
import { IsProtocol } from './reg';

// export {
//   http
// };

enum VideoType {
  VideoTypeUnknown = 0, // 未知类型
  VideoTypeBSite = 1, // b站
  VideoTypeDouYin = 2, // 抖音
  VideoTypeKuaiShou = 3, // 快手
  VideoTypeXiaoHongShu = 4, // 小红书
}

enum VideoTypeText {
  VideoTypeUnknown = 'unknown', // 未知类型
  VideoTypeBSite = 'bilibili', // b站
  VideoTypeDouYin = 'douyin', // 抖音
  VideoTypeKuaiShou = 'kuaishou', // 快手
  VideoTypeXiaoHongShu = 'xiaohongshu', // 小红书
}

interface VideoTypeInfo {
  t: VideoType;
  text: VideoTypeText;
}

// 获取视频类型
const GetVideoType = (videoUrl: string): VideoTypeInfo => {
  const bSite = /bilibili.com/;
  const bSiteShort = /b23.tv/;
  const douYin = /douyin.com/;
  const kuaiShou = /kuaishou.com/;
  const xiaoHongShu = /xiaohongshu.com/;
  if (bSite.test(videoUrl) || bSiteShort.test(videoUrl)) {
    return {
      t: VideoType.VideoTypeBSite,
      text: VideoTypeText.VideoTypeBSite,
    };
  }

  if (douYin.test(videoUrl)) {
    return {
      t: VideoType.VideoTypeDouYin,
      text: VideoTypeText.VideoTypeDouYin,
    };
  }

  if (kuaiShou.test(videoUrl)) {
    return {
      t: VideoType.VideoTypeKuaiShou,
      text: VideoTypeText.VideoTypeKuaiShou,
    };
  }

  if (xiaoHongShu.test(videoUrl)) {
    return {
      t: VideoType.VideoTypeXiaoHongShu,
      text: VideoTypeText.VideoTypeXiaoHongShu,
    };
  }

  return {
    t: VideoType.VideoTypeUnknown,
    text: VideoTypeText.VideoTypeUnknown,
  };
};

const HandleUrl = (url: string): string => {
  // 从分享中截取url

  const typeInfo = GetVideoType(url);
  switch (typeInfo.t) {
    case VideoType.VideoTypeBSite: // 处理 B站链接问题
      return url.replace(/(spm_id_from=.*click)/, ''); // 替换掉这个点击追踪的 因为随机导致音频资源重复获取
  }
  return url;
};

// 从分享的文字中提取链接
const GetUrlByShareText = (text: string): string => {
  const reg = /(https|http):\/\/[^\s]+/g;
  const res = text.match(reg);
  if (!res) {
    return '';
  }
  return res[0];
};

export {
  GetVideoType,
  TimeStringToSeconds,
  HandleUrl,
  Sleep,
  VideoType,
  VideoTypeInfo,
  IsProtocol,
  GetUrlByShareText,
};
