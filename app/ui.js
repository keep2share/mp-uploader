import path from 'path'
import {
	app,
	BrowserWindow,
	ipcMain,
	screen,
	Menu,
	Tray,
	nativeImage,
} from 'electron';
import runner from './shared/runner'
import IPCLog from './IPCLog'

global.sharedObject = {
	isQuiting: false,
	uploadParams: null,
}

// do not touch
// https://electronjs.org/docs/faq#my-apps-windowtray-disappeared-after-a-few-minutes
let tray = null;

function setTrayMenu (mainWindow) {
	const image = nativeImage.createFromPath(`${__dirname}/icon.png`);
	tray = new Tray(image);
	const contextMenu = Menu.buildFromTemplate([
		{ label: 'Show App', click: () => {
			mainWindow.show();
		} },
		{ label: 'Quit', click: () => {
			sharedObject.isQuiting = true;
			tray.destroy();
			app.quit();
		} }
	]);

	tray.setToolTip('Moneyplatform File Uploader');
	tray.setContextMenu(contextMenu);
	tray.on('double-click', () => mainWindow.show());
}

export default function runui (AppUpdater) {

	const sizes = {
		width: 826,
		home: {
			height: 600,
		},
		upload: {
			height: 946,
		}
	}

	const mainWindow = new BrowserWindow({
		show: false,
		width: sizes.width,
		height: sizes.home.height,
		webPreferences: {
			nodeIntegration: true
		},
	});
	setTrayMenu (mainWindow);

	ipcMain.on('resize', (event, page) => {
		const pos = mainWindow.getPosition();
		const { height } = sizes[page];
		const screenHeight = screen.getPrimaryDisplay().workAreaSize.height;
		const top = Math.floor((screenHeight - height)/2);
		mainWindow.setSize(sizes.width, height, true);
		mainWindow.setPosition(pos[0], top, true);
	});

	let uploader;

	ipcMain.on('start', async () => {
		const {
			accessToken,
			sourceFolder,
			destinationFolder,
			origin,
			isDebug,
		} = sharedObject.uploadParams;
		const pathToCsv = path.join(path.dirname(process.argv0), 'debug-mode.log');
		const stdoutJson = isDebug;
		const ipc = mainWindow.webContents;
		const logger = new IPCLog({ pathToCsv, stdoutJson, origin, ipc, isDebug });
		try {
			uploader = await runner({
				apiUrl: `${origin}/api/v2`,
				sourceFolder,
				destinationFolder: destinationFolder || null,
				accessToken,
				origin,
				logger,
				isDebug,
			})
			uploader.on('folder-upload-end', () => {
				mainWindow.webContents.send('stopped', 'true');
			});
			mainWindow.webContents.send('started', 'true');
		} catch (err) {
			mainWindow.webContents.send('started', 'false');
			logger.logError({ errorMessage: err.message, code: err.code });
		}
		sharedObject.uploadParams = null;
	});

	ipcMain.on('stop', () => {
		if (!uploader) {
			return;
		}
		uploader.emit('stop');
		uploader.api.stop();
		mainWindow.webContents.send('stopped', 'true');
		uploader = null;
	});

	mainWindow.removeMenu();
	mainWindow.loadURL(`file://${__dirname}/app.html#/`);

	// @TODO: Use 'ready-to-show' event
	//        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
	mainWindow.webContents.on('did-finish-load', () => {
		if (!mainWindow) {
			throw new Error('"mainWindow" is not defined');
		}

		mainWindow.webContents.send('version', app.getVersion());
		if (process.env.START_MINIMIZED) {
			mainWindow.minimize();
		} else {
			mainWindow.show();
			mainWindow.focus();
		}
	});

	// Remove this if your app does not use auto updates
	// eslint-disable-next-line
	new AppUpdater();

}
