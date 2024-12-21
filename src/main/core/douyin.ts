import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import ffmpeg from './ffmpeg';
import { DownloadFile } from '../core/download';
import { FormatSeconed } from './common';
import path from 'path';
import { getDownloadPath } from '../util';

const OtherParseUrl =
  'https://api.douyin.wtf/api/hybrid/video_data?url=${url}&minimal=false';
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36';
const SuccessCode = 200;

class DouYin implements Writer {
  constructor() {}

  async getVideoInfo(videoUrl: string): Promise<VideoInfo> {
    const url = OtherParseUrl.replace('${url}', videoUrl);
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': `${UA}`,
      },
    });

    if (data.code !== SuccessCode) {
      throw new Error('解析抖音视频地址失败');
    }

    const res = data.data;
    const video = res.video;

    // 返回的是毫秒转为秒
    const duration = Math.ceil(res.duration / 1000);
    return {
      title: res.item_title || res.caption || res.preview_title,
      // audioUrl: video?.download_addr?.url_list[0],
      audioUrl: res.music?.play_url?.uri,
      videoUrl: video.download_addr?.url_list[0],
      cover: video.cover.url_list[0],
      duration: duration,
      fmtDuration: FormatSeconed(duration),
      blogger: res.author?.nickname,
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

    if (params.type === 'all' || params.type === 'video') {
      const mp4Path = `${savePath}.mp4`;
      await DownloadFile(params.videoUrl as string, mp4Path);
      res.videoName = path.basename(mp4Path);
    }

    //    转为 mp3
    if (params.type === 'all' || params.type === 'audio') {
      const mp3Path = `${savePath}.mp3`;
      await DownloadFile(params.videoUrl as string, mp3Path);

      res.audioName = path.basename(mp3Path);
    }

    // 返回地址
    return res;
  }

  // async mp4ToMp3(mp4FilePath: string, mp3Path: string) {
  //   return new Promise((resolve, reject) => {
  //     // 转换格式
  //     ffmpeg(mp4FilePath)
  //       // .audioBitrate('1k') // 设置音频比特率为96kbps
  //       .audioCodec('libmp3lame') // 设置音频编码器为libmp3lame
  //       .format('mp3') // 输出格式为mp3
  //       .on('error', (err) => {
  //         console.error('转换错误: ', err.message);
  //         return reject(err.message);
  //       })
  //       .on('end', () => {
  //         console.log('音频转换成MP3并压缩完成');
  //         return resolve(mp3Path);
  //       })
  //       .save(mp3Path);
  //   });
  // }
}

export default new DouYin();
