import { Routes, Route } from 'react-router-dom';
import { HomePage, FloatMenu } from './components';
import { message, Modal } from 'antd';
import { useEffect, useState } from 'react';

import './App.css';

// import { ipcRenderer } from 'electron';

message.config({
  maxCount: 1,
  rtl: true,
  duration: 5,

  // prefixCls: 'my-message',
});

export default function App() {
  useEffect(() => {
    window.electron.ipcRenderer.on('ipc-back-msg', async (...params) => {
      const value = params[0] as ipcBackMsg;
      switch (value.type) {
        case 'api-error':
          message.warning(value.info);
          break;
        case 'api-info':
          message.info(value.info);
          break;
        case 'api-success':
          message.success(value.info);
          break;
        // window.open('/login', '_self');
        default:
          console.log('ipcBackMsg not have handle', value);
      }
    });

    return () => {
      return window.electron.ipcRenderer.remove('ipc-back-msg');
    };
  });

  const [modal, contextHolder] = Modal.useModal();
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>

      <FloatMenu></FloatMenu>

      {contextHolder}
    </>
  );
}
