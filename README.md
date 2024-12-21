# 视频下载助手

#### 下载B站、抖音、快手、小红书视频的带图形界面的软件，提供Windows和Mac版本 ~~



#### 首页

![](https://github.com/lulu-ls/assets/blob/2d92c921a0ad679a6699a1ffa55df97448da702d/main2.jpg)

#### 上传

![](https://github.com/lulu-ls/assets/edit/blob/main2.jpg?row=true)

## 使用方法

### 1. 你可以直接点击右侧 Releases 下载打包好的文件直接安装

- mac 用户下载 dmg 文件
- windows 用户下载 exe 文件

### 2. 你可以自己构建项目

```bash
# 先克隆本项目
git clone https://github.com/lulu-ls/cloud-uploader.git
# 进入项目目录
cd cloud-uploader
# 安装相关依赖，这里使用 npm
npm install
# 启动项目，或直接进行下边的构建
npm run start
# 为 mac 系统构建项目（使用的是 electron-builder 默认构建到 dist 目录下）
npm run package --mac
# 为 win 系统构建项目
npm run package --win

```

## 功能

- 
- 上传音乐至我的云盘
- 退出登录
- 每日自动签到
- 每日自动刷歌 300 首(大概 1-3 分钟完成)
- 账号密码登录（包含手机号和邮箱）

## 新增b/s程序
- 个人服务器地址：http://43.143.226.131:3000 （(服务器到期，暂不可用，近期正在准备恢复) 直接访问上传，无需下载软件，服务器资源有限，如果软件可以正常运行的，大家就先用软件上传 谢谢啦）

## 更新日志

- 5/14 新增选择文件夹批量上传，上传间隔随机（缓解批量上传部分可能错误的问题）
- 5/22 新增
- 1. 退出登录
- 2. 自动签到
- 3. 自动刷歌 300 首, 刷歌数据可能会有延迟, 完成后如果没更新, 可以稍后再查看  
     ** 每日自动签到及自动刷歌 300，想了想并没有引入第三方定时库（太大[少则几十到几百个个依赖]且没必要）去做这件事。而是在每次窗口激活，去检查配置及是否已完成操作  
     ** 每日刷歌逻辑，获取用户每日推荐歌单，默认听歌 500 首为止，虽然每日上限 300，因为存在已听歌曲，默认设置了 200 首的冗余，可在配置文件修改
- 6/4 新增账号密码登录  
  \*\* 账号密码登录，所有的密码在调用登录接口之前都会使用 md5 进行加密，但是还是推荐使用二维码登录
- 7.17 修复一些崩溃问题，列表覆盖问题
- 7.23 增加代理功能（目前没提供前端，需要的同学可以修改 const.js - PROXY-ADDRESS 来实现代理，后续如果有必要会加到前端配置），整理代码
- 8.10 增加快捷键 退出：command + q 、隐藏：command + h


- 2023-04-09 日 **重要更新**：直接浏览器访问 http://43.143.226.131:3000(服务器到期，暂不可用，近期正在准备恢复) 进行上传，无需下载软件

非常感谢大家的喜爱和反馈，这个软件也帮助到了非常多的人，因为兼容性问题，我的时间也有限，很多问题也没有环境能测试出来，类似M1的适配，一直得不到解决，个人这两天写了个 b/s 的程序，目前部署在我的服务器上，希望能帮助那些软件无法正常使用的同学，代码其实很简单，后边看大家有需求的话，我整理下放github上，鸣谢 每一位提出宝贵意见的朋友 谢谢！
- 2023-06-03 日 bs 项目整理好，已放下面的项目，顺便修复了 登录状态异常的问题，感兴趣的可以去看看，感谢 
  [bs 项目地址](https://github.com/lulu-ls/cloud-uploader-bs)
## 已知问题
 - M1 可能长时间等待，无法上传（多人反馈，不确定是否为 100%，而且目前还没找到原因）

## 本项目参考以下资料

### 写法思路和上传的 API 参考下面的项目，感谢大佬~

- [electronic-wechat](https://github.com/geeeeeeeeek/electronic-wechat)
- [NeteaseCloudMusicApi](https://github.com/Binaryify/NeteaseCloudMusicApi)

**刷歌思路参考下面项目**

- [netease-cloud-api](https://github.com/ZainCheung/netease-cloud-api)

### 相关学习资料：

- [electronjs.org/docs](https://electronjs.org/docs) - all of Electron's documentation
- [electronjs.org/community#boilerplates](https://electronjs.org/community#boilerplates) - sample starter apps created by the community
- [electron/electron-quick-start](https://github.com/electron/electron-quick-start) - a very basic starter Electron app
- [hokein/electron-sample-apps](https://github.com/hokein/electron-sample-apps) - small demo apps for the various Electron APIs

## 如果有任何疑问或者建议欢迎 ISSUE/PR，也可以加

QQ 群：853469710

## License

#### License [MIT](LICENSE.md)
