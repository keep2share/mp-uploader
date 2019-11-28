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
import { app } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';

// Custom config loader
// Entry point for cli
import * as Config from './cli/extend/config'

import Meta from './cli/commands/meta'
import upload from './cli/commands/upload'

import runui from './ui'

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
		config.runCommand(cmd, argv.slice(1))
			.catch(require('@oclif/errors/handle'));
		return;
	}

	runui(AppUpdater);

});
