import { createRoot } from 'react-dom/client';
import { MemoryRouter as Router, Route } from 'react-router-dom';
import App from './App';

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(
  <Router>
    <App />
  </Router>,
);

// calling IPC exposed from preload script
window.electron.ipcRenderer.once('ipc-example', (arg) => {
  // eslint-disable-next-line no-console
  console.log(arg);
});
window.electron.ipcRenderer.sendMessage('ipc-example', ['ping']);

// 在渲染进程中，通常是在index.html或通过某个JavaScript文件
window.onerror = function (message, source, lineno, colno, error) {
  const detailedMessage = {
    message: message,
    source: source,
    lineno: lineno,
    colno: colno,
    stack: error ? error.stack : null,
  };

  // // 发送错误报告到服务器
  // fetch('https://your-error-tracking-service.com/report', {
  //   method: 'POST',
  //   body: JSON.stringify(detailedMessage),
  //   headers: {
  //     'Content-Type': 'application/json'
  //   }
  // });

  // 显示用户友好的错误信息
  alert('发生了一个错误，我们已经记录并上报。请尝试刷新页面或联系支持。');

  // 可以选择重新加载页面
  // window.location.reload();

  // 返回true以阻止错误冒泡
  return true;
};

window.addEventListener('unhandledrejection', (event) => {
  // event.promise - 被拒绝的 Promise
  // event.reason - 拒绝的原因（通常是一个错误对象）

  console.error('Unhandled rejection:', event?.reason);

  // 如果你想阻止默认行为（例如，浏览器显示的默认错误消息），可以调用 preventDefault
  event.preventDefault();
});
