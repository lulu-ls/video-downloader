interface VideoInfo {
  title?: string;
  audioUrl?: string;
  cover?: string;
  duration?: number;
  fmtDuration?: string;
  blogger?: string;
  videoUrl?: string;
  orgUrl?: string;
}

interface Writer {
  getVideoInfo(videoUrl: string): Promise<VideoInfo>;
  download(params: downloadReq): Promise<downloadResp>;
}
