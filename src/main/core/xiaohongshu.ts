import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import ffmpeg from './ffmpeg';
import { DownloadFile } from './download';
import { FormatSeconed } from './common';
import { getDownloadPath } from '../util';
import path from 'path';

const OtherParseUrl =
  'https://api.douyin.wtf/api/hybrid/video_data?url=${url}&minimal=false';
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';

const appHeaders = {
  Accept: '*/*',
  Connection: 'keep-alive',
  Cookie:
    'bRequestId=0b2a4522-5357-5924-8080-e2eb554a4a58; a1=18faa2d80fdj0ai5bdm3ljxlkm62y9ty5r95g8ekg50000148967; webId=157e6fcd7f321156abca9fae9075d07f; web_session=030037a16339850bda13bd2b28214a48b63dfe; gid=yYi00JfWDf28yYi00JfY8FYdifV8032Df6q1jTkVC1T6K228Jvj9vk888y4YjKW8qiDyiJ2i; xsecappid=xhs-pc-web; webBuild=4.46.0; websectiga=a9bdcaed0af874f3a1431e94fbea410e8f738542fbb02df1e8e30c29ef3d91ac; sec_poison_id=a9e5f89a-35d7-494e-93a6-fa5c88d99568; acw_tc=0a0bb32017337163734021107e32a892927d1392cf24bec4fa596c66333d24; unread={%22ub%22:%2267369e56000000001b01309a%22%2C%22ue%22:%22672832dd000000001901a2c9%22%2C%22uc%22:25}',
  'User-Agent': UA,
  Origin: 'https://www.xiaohongshu.com',
};

class XiaoHongShu implements Writer {
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

    //匹配 videoIdhttps://www.xiaohongshu.com/discovery/item/647b1e04000000001203d04e?source=webshare&xhsshare=pc_web&xsec_token=ABZyaWimmkDjbNeUSizpXLDBpu-ZCJNRrkSaashSa8Iag=&xsec_source=pc_share
    const noteId = this.getNoteId(videoUrl);
    console.log(noteId);
    const dataInfo = this.paresTreeHtml(html);
    console.log(dataInfo);
    const noteData = dataInfo?.note?.noteDetailMap;
    const noteDetail = noteData[noteId];
    const note = noteDetail.note;
    const video = note.video;
    const user = note.user;

    const duration = video?.capa?.duration;
    return {
      title: note.title || note.desc,
      audioUrl: decodeURIComponent(video?.media?.stream?.h264[0]?.masterUrl),
      cover: decodeURIComponent(note?.imageList[0]?.urlDefault),
      duration: duration,
      fmtDuration: FormatSeconed(duration),
      blogger: user?.nickname,
      videoUrl: decodeURIComponent(video?.media?.stream?.h264[0]?.masterUrl),
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
    const videoInfo = html.match(
      /\<script\>window\.__INITIAL_STATE__=([\s\S]*?)\<\/script\>/,
    );
    if (!videoInfo) throw new Error('parse html error');

    // 处理字符串中的 undefined 避免 JSON.parse 错误
    const str = videoInfo[1].replace(/undefined/g, '""');

    const data = JSON.parse(str);
    return data;
  }

  getNoteId(videUrl: string): string {
    const res = new URL(videUrl);

    if (videUrl.includes('xiaohongshu.com') || videUrl.includes('f')) {
      return res.pathname.split('/').pop() as string;
    }

    console.log('解析 url 失败');
    return '';
    // throw new Error('解析 url 失败');
  }
}

export default new XiaoHongShu();
