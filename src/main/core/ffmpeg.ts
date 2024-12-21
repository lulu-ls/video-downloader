import ffmpeg from 'fluent-ffmpeg';

import pathToFfmpeg from 'ffmpeg-static';

const isDevelopment = process.env.NODE_ENV !== 'production';

const fp = pathToFfmpeg as string;
if (isDevelopment) {
  ffmpeg.setFfmpegPath(fp);
} else {
  // see: https://github.com/electron/electron-packager/issues/740
  ffmpeg.setFfmpegPath(fp.replace('app.asar', 'app.asar.unpacked'));
}

export default ffmpeg;
