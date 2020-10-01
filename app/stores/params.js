import { observable, action, computed } from 'mobx';
import { persist } from 'mobx-persist';
import config from '../cli/config';

const FIRST = 0;

const defaultFolders = [{
  label: '/',
  id: null,
}];

function defaultDomains() {
  return Object.entries(config.phpApiHosts).map(entry => entry[1].origin);
}

export default class UploadParams {

  @observable sourceFolder = '';

  @observable folders = defaultFolders;

  @observable selectedFolder = defaultFolders[FIRST];

  @observable domains = defaultDomains();

  @observable origin = this.domains[FIRST];

  @observable filesToUpload = [];

  @persist @observable threadsCount = 5;

  constructor (token, api) {
    this.token = token;
    this.api = api;
  }

  @computed
  get destinationFolder () {
    return this.selectedFolder.id;
  }

  @action
  selectFolder (id) {
    this.selectedFolder = this.folders.find(f => f.id === id);
  }

  @action
  setDomain (newVal) {
    this.origin = newVal;
  }

  @action.bound
  setThreadsCount (threadsCount) {
    this.threadsCount = threadsCount;
  }

  @action
  async refreshDomains () {
    try {
      this.domains = (await this.api.domains(this.token.apiToken)).map(hostname => `https://${hostname}`);
      if (!this.domains.length){
        this.domains = defaultDomains();
      }
    } catch (error) {
      this.domains = defaultDomains();
    }
    this.origin = this.domains[FIRST];
  }

  @action
  async refreshFolders () {
    try {
      const body = await this.api.folders(this.token.apiToken);
      const nativeArray = body.foldersIds.map((id, i) => ({ id, label: body.foldersList[i] }));
      nativeArray.unshift(defaultFolders[FIRST]);

      // use single asignment instead of push to a observable folders.
      this.folders = nativeArray;
    } catch (error) {
      this.folders = defaultFolders;
    }
    this.selectedFolder = this.folders[FIRST];
  }

  @action
  setSource(path) {
    this.sourceFolder = path;
  }

  @action
  setFilesToUpload(filesPaths) {
    this.filesToUpload = filesPaths;
  }
}
