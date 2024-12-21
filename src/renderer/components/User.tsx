import { useState } from 'react';
import { Drawer, Avatar, Tooltip } from 'antd';
import headImage from '../assets/head.png';

interface Props {
  show: boolean;
  onClose: () => void;
}

const App: React.FC<Props> = (props: Props) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [dirHover, setDirHover] = useState(false);

  const [userInfo, setUserInfo] = useState<getUserInfoResp>({
    defaultDir: '',
    downloadType: '',
  });

  const fetchData = async (): Promise<void> => {
    try {
      const info = await window.electron.getUserInfo();
      setUserInfo(info);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const onSetDefaultDir = async () => {
    try {
      await window.electron.setDefaultDir();
      await fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <Drawer
        closable
        destroyOnClose={true}
        title={<p>个人中心</p>}
        placement="right"
        open={props.show}
        loading={loading}
        onClose={props.onClose}
        afterOpenChange={(open: boolean) => {
          if (open) {
            fetchData();
          }
        }}
      >
        <div>
          <div>
            <Avatar
              shape="square"
              size={{ xs: 32, sm: 32, md: 40, lg: 64, xl: 80, xxl: 80 }}
              icon={<img src={headImage} />}
            />

            <div style={{ marginTop: '15px' }}>
              <b>导出文件夹：</b>

              <Tooltip title="点击设置" color="#69b1ff" placement="topRight">
                <div
                  onMouseEnter={() => setDirHover(true)}
                  onMouseLeave={() => setDirHover(false)}
                  style={{
                    maxWidth: '100%',
                    // overflow: 'hidden',
                    outline: dirHover ? '1px solid #1677ff' : '',
                    borderRadius: '5px',
                    padding: '5px',
                    marginTop: '10px',
                    cursor: 'pointer',
                    backgroundColor: dirHover ? '#bae0ff' : '',
                    transition: 'background-color 0.5s ease',
                  }}
                  onClick={onSetDefaultDir}
                >
                  {userInfo.defaultDir || '点击设置导出目录'}
                </div>
              </Tooltip>
            </div>

            {/* <div style={{ marginTop: '15px' }}>
              <b>导出资源设置：</b>

              {userInfo.defaultDir || '点击设置导出目录'}
            </div> */}
          </div>
        </div>
      </Drawer>
    </>
  );
};

export default App;
