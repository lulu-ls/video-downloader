import {
  app,
  Menu,
  shell,
  BrowserWindow,
  MenuItemConstructorOptions,
} from 'electron';

interface DarwinMenuItemConstructorOptions extends MenuItemConstructorOptions {
  selector?: string;
  submenu?: DarwinMenuItemConstructorOptions[] | Menu;
}

export default class MenuBuilder {
  mainWindow: BrowserWindow;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
  }

  buildMenu(): Menu {
    if (
      process.env.NODE_ENV === 'development' ||
      process.env.DEBUG_PROD === 'true'
    ) {
      this.setupDevelopmentEnvironment();
    }

    const template =
      process.platform === 'darwin'
        ? this.buildDarwinTemplate()
        : this.buildDefaultTemplate();

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    return menu;
  }

  setupDevelopmentEnvironment(): void {
    this.mainWindow.webContents.on('context-menu', (_, props) => {
      const { x, y } = props;

      Menu.buildFromTemplate([
        {
          label: 'Inspect element',
          click: () => {
            this.mainWindow.webContents.inspectElement(x, y);
          },
        },
      ]).popup({ window: this.mainWindow });
    });
  }

  buildDarwinTemplate(): MenuItemConstructorOptions[] {
    const subMenuViewProd: MenuItemConstructorOptions = {
      label: 'View',
      submenu: [
        {
          label: 'Toggle Full Screen',
          accelerator: 'Ctrl+Command+F',
          click: () => {
            this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
          },
        },
        // {
        //   label: 'Toggle &Developer Tools',
        //   accelerator: 'Alt+Ctrl+I',
        //   click: () => {
        //     this.mainWindow.webContents.toggleDevTools();
        //   },
        // },

        {
          label: '全选',
          role: 'selectAll',
        },
        {
          label: '复制',
          role: 'copy',
        },
        {
          label: '粘贴',
          role: 'paste',
        },
        {
          label: '剪切',
          role: 'cut',
        },
      ],
    };

    const subMenuView =
      process.env.NODE_ENV === 'development' ||
      process.env.DEBUG_PROD === 'true'
        ? subMenuViewProd
        : subMenuViewProd;

    return [subMenuView];
  }

  buildDefaultTemplate() {
    const templateDefault: Electron.MenuItemConstructorOptions[] = [
      // {
      //   label: '&View',
      //   submenu:
      //     process.env.NODE_ENV === 'development' ||
      //     process.env.DEBUG_PROD === 'true'
      //       ? [
      //           // {
      //           //   label: 'Toggle &Developer Tools',
      //           //   accelerator: 'Alt+Ctrl+I',
      //           //   click: () => {
      //           //     this.mainWindow.webContents.toggleDevTools();
      //           //   },
      //           // },
      //         ]
      //       : [
      //           // {
      //           //   label: 'Toggle &Full Screen',
      //           //   accelerator: 'F11',
      //           //   click: () => {
      //           //     this.mainWindow.setFullScreen(
      //           //       !this.mainWindow.isFullScreen(),
      //           //     );
      //           //   },
      //           // },
      //           // {
      //           //   label: 'Toggle &Developer Tools',
      //           //   accelerator: 'Alt+Ctrl+I',
      //           //   click: () => {
      //           //     this.mainWindow.webContents.toggleDevTools();
      //           //   },
      //           // },
      //         ],
      // },
      // {
      //   label: 'Help',
      //   submenu: [
      //     {
      //       label: 'Learn More',
      //       click() {
      //         shell.openExternal('https://electronjs.org');
      //       },
      //     },
      //     {
      //       label: 'Documentation',
      //       click() {
      //         shell.openExternal(
      //           'https://github.com/electron/electron/tree/main/docs#readme',
      //         );
      //       },
      //     },
      //     {
      //       label: 'Community Discussions',
      //       click() {
      //         shell.openExternal('https://www.electronjs.org/community');
      //       },
      //     },
      //     {
      //       label: 'Search Issues',
      //       click() {
      //         shell.openExternal('https://github.com/electron/electron/issues');
      //       },
      //     },
      //   ],
      // },
    ];

    return templateDefault;
  }
}
