# 视频下载助手

#### 下载B站、抖音、快手、小红书视频的带图形界面的软件，提供Windows和Mac版本 ~~



#### 首页

![](https://github.com/lulu-ls/assets/blob/2d92c921a0ad679a6699a1ffa55df97448da702d/main2.jpg)

#### 下载

![](https://github.com/lulu-ls/assets/blob/2d92c921a0ad679a6699a1ffa55df97448da702d/main3.jpg)

## 使用方法

### 1. 你可以直接点击右侧 Releases 下载打包好的文件直接安装

- mac 用户下载 dmg 文件
- windows 用户下载 exe 文件

### 2. 你可以自己构建项目

```bash
# 先克隆本项目
git clone git@github.com:lulu-ls/video-downloader.git
# 进入项目目录
cd video-downloader
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

- 下载视频
- 下载音频
- 已支持平台 B站 抖音 快手 小红书

## 更新日志

- 2024/12/21 初始化上传软件

## 本项目参考以下资料

### 项目参考，感谢大佬~

- [BilibiliVideoDownload](https://github.com/BilibiliVideoDownload/BilibiliVideoDownload)
- [KS-Downloader](https://github.com/JoeanAmier/KS-Downloader)
- [TikTokDownload](https://github.com/Johnserf-Seed/TikTokDownload)

### 相关学习资料：

- [electronjs.org/docs](https://electronjs.org/docs) - all of Electron's documentation
- [electron-react-boilerplate](https://github.com/electron-react-boilerplate/electron-react-boilerplate) - sample starter apps created by the community

## 如果有任何疑问或者建议欢迎 ISSUE/PR，也可以加

QQ 群：853469710

## License

#### License [MIT](LICENSE.md)
