/* eslint global-require: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 *
 * @flow
 */
import { app, ipcMain, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';

// Custom config loader
// Entry point for cli
import * as Config from './cli/extend/config'

import Meta from './cli/commands/meta'
import upload from './cli/commands/upload'

import runui from './ui'

import { setAppMode, CONSOLE_MODE, setAppQuit } from './cli/components/uploaderContext';

ipcMain.on('open-file-dialog', function openFileDialog(event) {
	dialog.showOpenDialog({
		properties: ['openFile', 'multiSelections'],
		filters: { extensions: ['*']},
	}, function sendFiles(files) {
  	if (files) {
			event.sender.send('selected-file', { files, type: 'files' })
		}
	});
})

ipcMain.on('open-folder-dialog', function openFolderDialog(event) {
	dialog.showOpenDialog({
		properties: ['openDirectory']
	}, function sendFiles(files) {
		if (files) event.sender.send('selected-file', { files, type: 'folder' })
	});
})

export default class AppUpdater {
	constructor() {
		log.transports.file.level = 'info';
		autoUpdater.logger = log;
		autoUpdater.checkForUpdatesAndNotify();
	}
}

if (process.env.NODE_ENV === 'production') {
	const sourceMapSupport = require('source-map-support');
	sourceMapSupport.install();
}

if (
	process.env.NODE_ENV === 'development' ||
	process.env.DEBUG_PROD === 'true'
) {
	require('electron-debug')();
}

const installExtensions = async () => {
	const installer = require('electron-devtools-installer');
	const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
	const extensions = ['REACT_DEVELOPER_TOOLS'];

	return Promise.all(
		extensions.map(extName =>
			installer.default(installer[extName], forceDownload)
		)
	).catch(console.log);
};

let singleAppWindow = null
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
	app.quit()
} else {
	app.on('second-instance', () => {
		// Кто-то пытался запустить второй экземпляр, мы должны сфокусировать наше окно.
		if (singleAppWindow) {
			if (singleAppWindow.isMinimized()) singleAppWindow.restore()
			singleAppWindow.focus()
		}
	})

	// Создать singleAppWindow, загрузить остальную часть приложения, и т.д.
	app.on('ready', async () => {
		if (
			process.env.NODE_ENV === 'development' ||
			process.env.DEBUG_PROD === 'true'
		) {
			await installExtensions();
		}

		const ARGV = process.env.ARGV ? process.env.ARGV.split(/\b\s+/gi) : [];
		const argv = (process.env.NODE_ENV === 'production' ? process.argv.slice(1) : ARGV).map(s => s.replace(/\\\s/g, ' '));
		if (argv.length){
			const config = await Config.load({
				corePlugins: ['@oclif/plugin-help'],
				commands: {
					'': Meta,
					upload,
				},
				root: __dirname,
			});

			let cmd = argv[0];
			if (argv.length === 1 && (/^-/).test(cmd)){
				cmd = '';
				argv.unshift('');
			}
			setAppMode(CONSOLE_MODE);
			setAppQuit(app.quit);
			config.runCommand(cmd, argv.slice(1))
				.then(require('@oclif/command/flush'))
				.catch(require('@oclif/errors/handle'))

			return;
		}

		singleAppWindow = runui(AppUpdater);
	});
}
