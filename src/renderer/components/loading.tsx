import { Space, Spin } from 'antd';

interface LoadingProps {
  spinning: boolean;
  fullscreen?: boolean;
  content?: string;
}

const AppLoading: React.FC<LoadingProps> = (props: LoadingProps) => (
  <Space size="middle">
    <Spin size="large" spinning={props.spinning} fullscreen={props.fullscreen}>
      {props.content}
    </Spin>
  </Space>
);

export default AppLoading;
