// @flow
import { ipcRenderer, remote } from 'electron';
import React, { Component } from 'react';
import { Provider } from 'mobx-react';
import { createBrowserHistory } from 'history';
import { RouterStore, syncHistoryWithStore } from 'mobx-react-router';
import { HashRouter } from 'react-router-dom';
import Routes from '../Routes';
import Api from '../cli/api';
import config from '../cli/config'
import {
	MetaStore,
	LangStore,
	TokenStore,
	UploadParams,
	LogStore,
} from '../stores';

const browserHistory = createBrowserHistory();
const routing = new RouterStore();
const meta = new MetaStore({ ipc: ipcRenderer });
const lang = new LangStore();
const log = new LogStore({ ipc: ipcRenderer });

const api = new Api({ apiUrl: config.phpApiHosts.k2s.api });
const token = new TokenStore(api);
const params = new UploadParams(token, api);
const stores = {
	routing,
	meta,
	lang,
	token,
	params,
	log,
};

const syncHistory = syncHistoryWithStore(browserHistory, routing);

window.sharedObject = remote.getGlobal('sharedObject');
window.addEventListener('beforeunload', (e) => {
	if (!sharedObject.isQuiting) {
		e.preventDefault();
		e.returnValue = false;
		const osWindow = remote.BrowserWindow.getAllWindows()[0];
		osWindow.hide();
	}
});

export default class Root extends Component<Props> {
	render() {
		return (
			<Provider {...stores}>
				<HashRouter history={syncHistory}>
					<Routes />
				</HashRouter>
			</Provider>
		);
	}
}
