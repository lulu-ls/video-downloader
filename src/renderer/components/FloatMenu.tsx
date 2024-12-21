import React, { useState } from 'react';
import { SettingTwoTone } from '@ant-design/icons';
import { FloatButton } from 'antd';
import User from './User';

const App: React.FC = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [settingSpin, setSettingSpin] = useState(true);

  const onFloatClick = () => {
    setOpen(true);
  };

  return (
    <>
      <FloatButton
        shape="square"
        onMouseLeave={() => setSettingSpin(true)}
        onMouseEnter={() => setSettingSpin(false)}
        icon={<SettingTwoTone spin={settingSpin} />}
        onClick={onFloatClick}
      />
      <User
        show={open}
        onClose={() => {
          setOpen(false);
        }}
      ></User>
    </>
  );
};

export default App;
