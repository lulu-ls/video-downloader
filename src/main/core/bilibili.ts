import axios from 'axios';
import { FormatSeconed } from './common';
import { DownloadFile } from '../core/download';
import ffmpeg from './ffmpeg';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { getDownloadPath } from '../util';

enum VideoCategory {
  'video/av' = 'BV',
  'video/BV' = 'BV',
  'play/ss' = 'ss',
  'play/ep' = 'ep',
}

const alphabet =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36';

// const VideoCategory = [{'video/av':'BV'},{'video/BV':'BV'},{'video/ss':'ss'},{'video/ep':'ep'}]

class BiliBili implements Writer {
  constructor() {}

  async getVideoInfo(videoUrl: string): Promise<VideoInfo> {
    await checkLogin('');

    const { html, redirect } = await checkUrlRedirect(videoUrl);

    // (https://www.bilibili.com/video/BV1hT42167Z3/?spm_id_from=333.1007.tianma.3-3-9.click&vd_source=c916eadc6f66c6eb6ddfb88ed1e5b669)
    const videoCategory = checkUrl(redirect);
    if (videoCategory === '') {
      throw new Error('请检查视频地址');
    }

    const res = await parseHtml(html, videoCategory, redirect);
    if (res === -1) {
      throw new Error('视频解析失败');
    }
    return {
      title: res.title,
      audioUrl: res.audio[0]?.url,
      cover: res.cover,
      duration: res.duration,
      fmtDuration: FormatSeconed(res.duration),
      blogger: res.up[0]?.name,
      videoUrl: res.video[0]?.url,
      orgUrl: videoUrl,
    };
  }

  async download(params: downloadReq): Promise<downloadResp> {
    const downloadPath = getDownloadPath();
    const savePath = path.join(
      params.defaultDir as string,
      `${params.title}${uuidv4()}`,
    );

    const res: downloadResp = {
      audioName: '',
      videoName: '',
      defaultDir: params.defaultDir as string,
    };

    // 下载音频
    const downloadAudioPath = `${downloadPath}${uuidv4()}.m4s`;
    await DownloadFile(params.audioUrl as string, downloadAudioPath);

    // 下载视频
    if (params.type === 'all' || params.type === 'video') {
      const downLoadVideoPath = `${downloadPath}${uuidv4()}.m4s`;
      const mergeVideoPath = `${savePath}.mp4`;
      await DownloadFile(params.videoUrl as string, downLoadVideoPath);
      // 视频需要合并
      await this.mergeVideoAudio(
        downLoadVideoPath,
        downloadAudioPath,
        mergeVideoPath,
      );

      res.videoName = path.basename(mergeVideoPath);
    }

    // 转为 mp3
    if (params.type === 'all' || params.type === 'audio') {
      const mp3Path = `${savePath}.mp3`;
      await this.m4sToMp3(downloadAudioPath, mp3Path);
      res.audioName = path.basename(mp3Path);
    }

    // 返回地址
    return res;
  }

  mergeVideoAudio(videoPath: string, audioPath: string, out: string) {
    return new Promise((resolve, reject) => {
      ffmpeg()
        .input(videoPath)
        .audioCodec('copy')
        .input(audioPath)
        .videoCodec('copy')
        .format('mp4')
        .on('end', () => {
          resolve(out);
        })
        .on('error', (err: any) => {
          console.log(err);
          reject(err);
        })
        .save(out);
    });
  }

  async m4sToMp3(m4sFilePath: string, mp3Path: string): Promise<string> {
    return new Promise((resolve, reject) => {
      // 转换格式
      ffmpeg(m4sFilePath)
        // .audioBitrate('1k') // 设置音频比特率为96kbps
        .audioCodec('libmp3lame') // 设置音频编码器为libmp3lame
        .format('mp3') // 输出格式为mp3
        .on('error', (err) => {
          console.error('转换错误: ', err.message);
          return reject(err.message);
        })
        .on('end', () => {
          console.log('音频转换成MP3并压缩完成');
          return resolve(mp3Path);
        })
        .save(mp3Path);
    });
  }
}

export default new BiliBili();

/**
 *
 * @returns 0: 游客，未登录 1：普通用户 2：大会员
 */
const checkLogin = async (SESSDATA: string) => {
  const { data } = await axios('https://api.bilibili.com/x/web-interface/nav', {
    headers: {
      'User-Agent': `${UA}`,
      cookie: `SESSDATA=${SESSDATA}`,
    },
  });
  if (data.data.isLogin && !data.data.vipStatus) {
    return 1;
  } else if (data.data.isLogin && data.data.vipStatus) {
    return 2;
  } else {
    return 0;
  }
};

// 检查url合法
const checkUrl = (url: string): string => {
  for (const key in VideoCategory) {
    if (url.includes(key)) {
      return key;
    }
  }
  return '';
};

// 检查url是否有重定向
const checkUrlRedirect = async (videoUrl: string) => {
  const params = {
    videoUrl,
    config: {
      headers: {
        'User-Agent': `${UA}`,
        'Content-Type': 'application/json; charset=utf-8',
        // cookie: `SESSDATA=` //${store.settingStore(pinia).SESSDATA},
      },
    },
  };
  const { data, request } = await axios.get(params.videoUrl, params.config);
  // const {body} = await got.get(params.videoUrl, params.config)
  // const data = await axios.get('https://www.bilibili.com/video/BV1hT42167Z3/?spm_id_from=333.1007.tianma.3-3-9.click&vd_source=c916eadc6f66c6eb6ddfb88ed1e5b669')
  // const url = redirectUrls[0] ? redirectUrls[0] : videoUrl

  return {
    html: data,
    redirect: request.res.responseUrl,
    // url
  };
};

const parseHtml = (html: string, videoCategory: string, url: string) => {
  switch (videoCategory) {
    case 'video/av':
      return parseBV(html, url);
    case 'video/BV':
      return parseBV(html, url);
    case 'play/ss':
      return parseSS(html);
    case 'play/ep':
      return parseEP(html, url);
    default:
      return -1;
  }
};

const parseBV = async (html: string, url: string) => {
  try {
    // const videoInfo = html.match(
    //   /\<\/script\>\<script\>window\.\_\_INITIAL\_STATE\_\_\=([\s\S]*?)\;\(function\(\)/,
    // );
    const videoInfo = html.match(
      /<script>.*?window\.__INITIAL_STATE__=([\s\S]*?);\(function\(\)\{var s;\(s=document/,
    );

    // 使用异步方法写入文件
    if (!videoInfo) throw new Error('parse bv error');
    const { videoData } = JSON.parse(videoInfo[1], (key, val) => {
      if (typeof val === 'string') {
        // 对字符串进行处理
        return val.slice(0, 100); // 只取前 100 个字符
      }
      return val;
    });

    // 获取视频下载地址
    let acceptQuality = null;
    try {
      let downLoadData: any = html.match(
        /\<script\>window\.\_\_playinfo\_\_\=([\s\S]*?)\<\/script\>\<script\>window\.\_\_INITIAL\_STATE\_\_\=/,
      );
      if (!downLoadData) throw new Error('parse bv error');
      downLoadData = JSON.parse(downLoadData[1]);
      acceptQuality = {
        accept_quality: downLoadData.data.accept_quality,
        video: downLoadData.data.dash.video,
        audio: downLoadData.data.dash.audio,
      };
    } catch (error) {
      acceptQuality = await getAcceptQuality(videoData.cid, videoData.bvid);
    }

    const obj: VideoData = {
      id: '',
      title: videoData.title,
      url,
      bvid: videoData.bvid,
      cid: videoData.cid,
      cover: videoData.pic,
      createdTime: -1,
      quality: -1,
      view: videoData.stat.view,
      danmaku: videoData.stat.danmaku,
      reply: videoData.stat.reply,
      duration: videoData.duration,
      up: videoData.hasOwnProperty('staff')
        ? videoData.staff.map((item: any) => ({
            name: item.name,
            mid: item.mid,
          }))
        : [{ name: videoData.owner.name, mid: videoData.owner.mid }],
      // qualityOptions: acceptQuality.accept_quality.map((item: any) => ({ label: qualityMap[item], value: item })),
      // page: parseBVPageData(videoData, url),
      subtitle: [],
      // video: acceptQuality.video ? acceptQuality.video.map((item: any) => ({ id: item.id, cid: videoData.cid, url: item.baseUrl })) : [],
      audio: acceptQuality.audio
        ? acceptQuality.audio.map((item: any) => ({
            id: item.id,
            cid: videoData.cid,
            url: item.baseUrl,
          }))
        : [],
      video: acceptQuality.video
        ? acceptQuality.video.map((item: any) => {
            return {
              id: item.id,
              cid: videoData.cid,
              url: item.baseUrl,
            };
          })
        : [],
      filePathList: [],
      fileDir: '',
      size: -1,
      downloadUrl: { video: '', audio: '' },
    };
    console.log('bv');

    return obj;
  } catch (error: any) {
    throw new Error(error);
  }
};

const parseEP = async (html: string, url: string) => {
  try {
    // const videoInfo = html.match(
    //   /\<script\>window\.\_\_INITIAL\_STATE\_\_\=([\s\S]*?)\;\(function\(\)\{var s\;/,
    // );
    const videoInfo = html.match(
      /\<script\>window\.\_\_INITIAL\_STATE\_\_\=([\s\S]*?);\(function\(\)\{var s\;/,
    );
    if (!videoInfo) throw new Error('parse ep error');
    const { h1Title, mediaInfo, epInfo, epList } = JSON.parse(videoInfo[1]);
    // 获取视频下载地址
    let acceptQuality = null;
    try {
      let downLoadData: any = html.match(
        /\<script\>window\.\_\_playinfo\_\_\=([\s\S]*?)\<\/script\>\<script\>window\.\_\_INITIAL\_STATE\_\_\=/,
      );

      if (!downLoadData) throw new Error('parse ep error');
      downLoadData = JSON.parse(downLoadData[1]);

      acceptQuality = {
        accept_quality: downLoadData.data.accept_quality,
        video: downLoadData.data.dash.video,
        audio: downLoadData.data.dash.audio,
      };
    } catch (error) {
      acceptQuality = await getAcceptQuality(epInfo.cid, epInfo.bvid);
    }
    const obj: VideoData = {
      id: '',
      title: h1Title,
      url,
      bvid: epInfo.bvid,
      cid: epInfo.cid,
      cover: `http:${mediaInfo.cover}`,
      createdTime: -1,
      quality: -1,
      view: mediaInfo.stat.views,
      danmaku: mediaInfo.stat.danmakus,
      reply: mediaInfo.stat.reply,
      duration: epInfo.duration / 1000,
      up: [{ name: mediaInfo.upInfo.name, mid: mediaInfo.upInfo.mid }],
      // qualityOptions: acceptQuality.accept_quality.map((item: any) => ({ label: qualityMap[item], value: item })),
      // page: parseEPPageData(epList),
      subtitle: [],
      // video: acceptQuality.video ? acceptQuality.video.map((item: any) => ({ id: item.id, cid: epInfo.cid, url: item.baseUrl })) : [],
      audio: acceptQuality.audio
        ? acceptQuality.audio.map((item: any) => ({
            id: item.id,
            cid: epInfo.cid,
            url: item.baseUrl,
          }))
        : [],
      video: acceptQuality.video
        ? acceptQuality.video.map((item: any) => {
            return {
              id: item.id,
              cid: epInfo.cid,
              url: item.baseUrl,
            };
          })
        : [],
      filePathList: [],
      fileDir: '',
      size: -1,
      downloadUrl: { video: '', audio: '' },
    };
    console.log('ep');

    return obj;
  } catch (error: any) {
    throw new Error(error);
  }
};

const parseSS = async (html: string) => {
  try {
    const videoInfo = html.match(
      /\<script\>window\.\_\_INITIAL\_STATE\_\_\=([\s\S]*?)\;\(function\(\)\{var s\;/,
    );

    if (!videoInfo) throw new Error('parse ss error');
    const { mediaInfo } = JSON.parse(videoInfo[1]);
    const params = {
      url: `https://www.bilibili.com/bangumi/play/ep${mediaInfo.newestEp.id}`,
      config: {
        headers: {
          'User-Agent': `${UA}`,
          cookie: `SESSDATA=`, // ${store.settingStore(pinia).SESSDATA}
        },
      },
    };
    // const { body } = await window.electron.got(params.url, params.config)
    const { data } = await axios.get(params.url, params.config);
    return parseEP(data, params.url);
  } catch (error: any) {
    throw new Error(error);
  }
};

// 获取码率最高的audio
const getHighQualityAudio = (audioArray: any[]) => {
  return audioArray.sort((a, b) => b.id - a.id)[0];
};

// 获取视频清晰度列表
const getAcceptQuality = async (cid: string, bvid: string) => {
  const config = {
    headers: {
      'User-Agent': `${UA}`,
      cookie: `SESSDATA=`, // ${SESSDATA};bfe_id=${bfeId}
    },
  };
  const resp = await axios.get(
    `https://api.bilibili.com/x/player/playurl?cid=${cid}&bvid=${bvid}&qn=127&type=&otype=json&fourk=1&fnver=0&fnval=80&session=68191c1dc3c75042c6f35fba895d65b0`,
    config,
  );
  // console.log(resp);
  return {
    // accept_quality,
    // video,
    // audio
    video: '',
    audio: '',
  };
};

interface VideoData {
  id: string;
  title: string;
  url: string;
  bvid: string;
  cid: number;
  cover: string;
  createdTime: number;
  quality: number;
  view: number;
  danmaku: number;
  reply: number;
  duration: number;
  up: UP[];
  // qualityOptions: QualityItem[],
  // page: Page[],
  subtitle: Subtitle[];
  // video: Video[],
  audio: Audio[];
  video: Video[];
  filePathList: string[];
  fileDir: string;
  size: number;
  downloadUrl: DownloadUrl;
}

export interface Video {
  id: number;
  cid: number;
  url: string;
}

export interface Audio {
  id: number;
  cid: number;
  url: string;
}

export interface DownloadUrl {
  video: string;
  audio: string;
}

export interface Subtitle {
  title: string;
  url: string;
}

export interface UP {
  name: string;
  mid: number;
}

export { checkLogin, checkUrl, checkUrlRedirect, parseHtml };
