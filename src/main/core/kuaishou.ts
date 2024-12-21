import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import ffmpeg from './ffmpeg';
import { DownloadFile } from './download';
import { FormatSeconed, GetLikeKeyValue } from './common';
import path from 'path';
import { getDownloadPath } from '../util';

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';

const appHeaders = {
  Accept: '*/*',
  Connection: 'keep-alive',
  Cookie:
    'kpf=PC_WEB; kpn=KUAISHOU_VISION; clientid=3; did=web_1cbdbb77ef77e32f6679ce4567faaf3f',
  'User-Agent': UA,
};

const AuthorDict = 'VisionVideoDetailAuthor:';
const VideoDict = 'VisionVideoDetailPhoto:';

class KuaiShou implements Writer {
  constructor() {}

  async getVideoInfo(videoUrl: string): Promise<VideoInfo> {
    const { data: html, request } = await axios.get(videoUrl, {
      headers: {
        ...appHeaders,
        'Content-Type': 'text/html; charset=utf-8',
        Referer: videoUrl,
      },
      timeout: 5000,
    });

    //匹配 photoId
    const photoId = this.getPhotoId(videoUrl);

    const dataInfo = this.paresTreeHtml(html);
    const defaultData = dataInfo?.defaultClient;

    const AuthorInfo = GetLikeKeyValue(AuthorDict, defaultData);
    const VideoInfo = GetLikeKeyValue(VideoDict, defaultData);
    const duration = Math.ceil(VideoInfo.duration / 1000);
    return {
      title: VideoInfo.caption,
      // audioUrl: video?.download_addr?.url_list[0],
      audioUrl: VideoInfo.photoUrl,
      cover: VideoInfo.coverUrl,
      duration: duration,
      fmtDuration: FormatSeconed(duration),
      blogger: AuthorInfo?.name,
      videoUrl: VideoInfo.photoUrl,
    };
  }

  async download(params: downloadReq): Promise<downloadResp> {
    const savePath = path.join(
      params.defaultDir as string,
      `${params.title}${uuidv4()}`,
    );

    const res: downloadResp = {
      audioName: '',
      videoName: '',
      defaultDir: params.defaultDir as string,
    };

    // 下载视频
    let mp4Path: string = '';
    if (params.type === 'all' || params.type === 'video') {
      mp4Path = `${savePath}.mp4`;
      await DownloadFile(params.videoUrl as string, mp4Path);
      res.videoName = path.basename(mp4Path);
    }

    // 下载音频 转为 mp3
    if (params.type === 'all' || params.type === 'audio') {
      const mp3Path = `${savePath}.mp3`;

      // 如果没有下载视频 则先下载
      if (!mp4Path) {
        mp4Path = path.join(getDownloadPath(), `${uuidv4()}.mp4`);
        await DownloadFile(params.videoUrl as string, mp4Path);
      }

      await this.mp4ToMp3(mp4Path as string, mp3Path);
      res.audioName = path.basename(mp3Path);
    }

    // 返回地址
    return res;
  }

  async mp4ToMp3(mp4FilePath: string, mp3Path: string) {
    return new Promise((resolve, reject) => {
      // 转换格式
      ffmpeg(mp4FilePath)
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

  paresTreeHtml(html: string) {
    try {
      const videoInfo = html.match(
        /window\.__APOLLO_STATE__=([\s\S]*?);\(function\(\)\{var s;\(s=document\.currentScript\|\|document\.scripts\[document\.scripts\.length-1\]\)\.parentNode\.removeChild\(s\);\}\(\)\);/,
      );
      if (!videoInfo) throw new Error('parse html error');
      const data = JSON.parse(videoInfo[1]);
      return data;
    } catch (error) {
      throw new Error('parse info error');
    }
  }

  getPhotoId(videUrl: string): string {
    const res = new URL(videUrl);

    if (videUrl.includes('chenzhongtech')) {
      return res.searchParams.get('photoId') as string;
    }

    if (videUrl.includes('short-video') || videUrl.includes('f')) {
      return res.pathname.split('/').pop() as string;
    }

    console.log('解析 url 失败');
    return '';
    // throw new Error('解析 url 失败');
  }
}

export default new KuaiShou();
