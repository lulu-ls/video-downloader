import { useState } from 'react';
import {
  Button,
  Descriptions,
  Input,
  Card,
  Row,
  Col,
  message,
  Progress,
  ProgressProps,
  Tag,
  Tooltip,
  Checkbox,
  GetProp,
  Popover,
} from 'antd';
import { DownloadOutlined, MoreOutlined } from '@ant-design/icons';
import { HandleUrl, IsProtocol, GetUrlByShareText } from '../utils';
import { motion } from 'motion/react';

function Home() {
  const [videoUrl, setVideoUrl] = useState('');
  const [displayVideoUrl, setDisplayVideoUrl] = useState('');
  const [displayInfo, setDisplayInfo] = useState(false);
  // let info: VideoInfo;
  const [info, setInfo]: [
    VideoInfo,
    React.Dispatch<React.SetStateAction<VideoInfo>>,
  ] = useState({});

  const [getInfoLoading, setGetInfoLoading] = useState(false);
  const [stepText, setStepText] = useState('');
  const [stepLoading, setStepLoading] = useState(false);
  const [stepPercent, setStepPercent] = useState(0);
  const [stepStatus, setStepStatus] =
    useState<ProgressProps['status']>('active');
  const [showPercent, setShowPercent] = useState(false);

  //default_dir full_fill_path filename
  const [defaultDir, setDefaultDir] = useState('');
  const [videoFilename, setVideoFilename] = useState('');
  const [audioFilename, setAudioFilename] = useState('');

  const [downloadType, setDownloadType] = useState('video');

  function handleVideoUrlChange(e: React.ChangeEvent<HTMLInputElement>) {
    setDisplayVideoUrl(e.currentTarget.value);
  }

  async function handleClick() {
    const vUrl = GetUrlByShareText(displayVideoUrl);
    setDisplayVideoUrl(vUrl);
    const realUrl = HandleUrl(vUrl);
    setVideoUrl(realUrl);

    if (!realUrl || !IsProtocol(realUrl)) {
      message.error('请输入合法的视频地址，【b站、抖音、快手、小红书】');
      return;
    }

    try {
      setGetInfoLoading(true);
      setStepText('等待导出');
      setStepLoading(false);
      setStepPercent(0);
      setStepStatus('active');
      setShowPercent(false);
      setDefaultDir('');
      setVideoFilename('');
      setAudioFilename('');
      setDisplayInfo(false);
      const resp = await window.electron.getVideoInfo(realUrl);
      setDisplayInfo(true);
      setInfo(resp);
    } catch (error) {
      message.error('解析视频失败，请检查链接【目前可能不支持该资源】');
    } finally {
      setGetInfoLoading(false);
    }
  }

  async function handleGetClick() {
    // return;
    try {
      setShowPercent(true);
      setStepLoading(true);

      // 调用查询
      setStepText('解析资源信息中...');
      setStepPercent(30);

      const cleTime = setTimeout(() => {
        setStepText('资源下载中...');
        setStepPercent(60);
      }, 3000);

      const downloadResp = await window.electron.download({
        type: downloadType as DwonLoadType,
        title: info.title as string,
        audioUrl: info.audioUrl,
        videoUrl: info.videoUrl,
        orgUrl: videoUrl,
      });

      clearTimeout(cleTime);
      setDefaultDir(downloadResp.defaultDir);
      setVideoFilename(downloadResp.videoName);
      setAudioFilename(downloadResp.audioName);
      setStepText('导出成功');
      setStepPercent(100);
      setStepStatus('success');
    } catch (error) {
      console.error(error);
      setStepStatus('exception');
      setStepText('导出资源失败');
    } finally {
      setStepLoading(false);
    }
  }

  async function openDirectory() {
    await window.electron.openDirectory(defaultDir);
  }

  const onChange: GetProp<typeof Checkbox.Group, 'onChange'> = (
    checkedValues,
  ) => {
    if (checkedValues.length == 1) {
      setDownloadType(checkedValues[0] as string);
      window.electron.setUserInfo('download_type', checkedValues[0] as string);
      return;
    }

    if (checkedValues.length == 2) {
      setDownloadType('all');
      window.electron.setUserInfo('download_type', 'all');
      return;
    }

    message.error('请选择需要下载的类型');
    setDownloadType('');
    window.electron.setUserInfo('download_type', '');
  };

  const ContentDesc: React.FC = () => {
    return (
      <Descriptions title="视频信息" layout="horizontal" column={3}>
        <Descriptions.Item label="标题" span={3}>
          {info.title}
        </Descriptions.Item>
        <Descriptions.Item label="作者" span={3}>
          {info.blogger}
        </Descriptions.Item>
        <Descriptions.Item label="时间" span={3}>
          {info.duration} / s
        </Descriptions.Item>
        <Descriptions.Item label="状态" span={3}>
          <Tag color="#2db7f5">{stepText}</Tag>
        </Descriptions.Item>
        {!!videoFilename && (
          <Descriptions.Item label="视频文件" span={3}>
            {videoFilename}
          </Descriptions.Item>
        )}
        {!!audioFilename && (
          <Descriptions.Item label="音频文件" span={3}>
            {audioFilename}
          </Descriptions.Item>
        )}
        {!!defaultDir && (
          <Descriptions.Item label="目录" span={3}>
            <Button type="link" size="small" onClick={openDirectory}>
              打开文件所在目录
            </Button>
          </Descriptions.Item>
        )}
      </Descriptions>
    );
  };

  return (
    <div style={{ marginTop: '15%' }}>
      <Row justify="center">
        <Col xs={20} sm={20} md={12} lg={12}>
          <div style={{ display: 'flex' }}>
            <Tooltip color="gold" title="目前支持B站、抖音、快手、小红书">
              <Input
                placeholder="请输入视频地址或分享链接"
                value={displayVideoUrl}
                onChange={handleVideoUrlChange}
              ></Input>
            </Tooltip>
            <Button
              style={{ marginLeft: '10px' }}
              type="primary"
              onClick={handleClick}
              loading={getInfoLoading}
            >
              获取视频信息
            </Button>
          </div>
        </Col>
        <Col></Col>
      </Row>

      <motion.div
        animate={{
          opacity: displayInfo ? 1 : 0,
          height: displayInfo ? 'auto' : 0,
        }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      >
        <Row
          justify="center"
          style={{
            marginTop: '20px',
          }}
        >
          <Col xs={20} sm={20} md={15} lg={12}>
            <Card>
              <ContentDesc></ContentDesc>

              {showPercent && (
                <Progress
                  style={{ marginTop: '15px' }}
                  percent={stepPercent}
                  status={stepStatus}
                  strokeColor={{ from: '#108ee9', to: '#87d068' }}
                />
              )}

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  marginTop: '15px',
                }}
              >
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  onClick={handleGetClick}
                  loading={stepLoading}
                  disabled={!downloadType}
                >
                  点击开始下载
                </Button>
                <div
                  style={{
                    marginLeft: '15px',
                    paddingTop: '5px',
                    cursor: 'pointer',
                  }}
                >
                  <Popover
                    mouseLeaveDelay={2}
                    content={
                      <Checkbox.Group
                        options={[
                          { label: '视频', value: 'video' },
                          { label: '音频', value: 'audio' },
                        ]}
                        defaultValue={['video']}
                        onChange={onChange}
                      />
                    }
                    title="下载类型"
                  >
                    <MoreOutlined />
                  </Popover>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </motion.div>
    </div>
  );
}

export default Home;
