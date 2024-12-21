interface ipcBackMsg {
  type: string;
  info: any;
}

type DwonLoadType = 'all' | 'video' | 'audio';
interface downloadReq {
  type: DwonLoadType;
  title: string;
  audioUrl?: string;
  videoUrl?: string;
  orgUrl: string;
  defaultDir?: string;
}

interface downloadResp {
  audioName: string;
  videoName: string;
  defaultDir: string;
}

interface getUserInfoResp {
  defaultDir?: string;
  downloadType: string;
}
