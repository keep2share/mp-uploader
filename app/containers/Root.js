// @flow
import { ipcRenderer, remote } from 'electron';
import React, { Component } from 'react';
import { Provider } from 'mobx-react';
import { createBrowserHistory } from 'history';
import { RouterStore, syncHistoryWithStore } from 'mobx-react-router';
import { HashRouter } from 'react-router-dom';
import { create } from 'mobx-persist'
import Routes from '../Routes';
import Api from '../cli/api';
import config from '../cli/config'
import {
  MetaStore,
  LangStore,
  TokenStore,
  UploadParams,
  LogStore,
  createStoresContext,
} from '../stores';

const hydrate = create();

const browserHistory = createBrowserHistory();
const api = new Api({ apiUrl: config.phpApiHosts.k2s.api });
const routing = new RouterStore();
const meta = new MetaStore({ ipc: ipcRenderer, api });
const lang = new LangStore();
const log = new LogStore({ ipc: ipcRenderer });
const token = new TokenStore(api);
const params = new UploadParams(token, api);


hydrate('params', params);

const stores = {
  routing,
  meta,
  lang,
  token,
  params,
  log,
};

createStoresContext(stores);
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

export default class Root extends Component {
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
