import React from 'react';
import { ipcRenderer, shell } from 'electron';
import { useObserver } from 'mobx-react';
import path from 'path'
import { useStores } from '../stores';
import Upload from '../components/Upload';

const propTypes = {
};

const defaultProps = {
};

const debugLogFilename = 'debug-mode.log';

function UploadContainer() {
  function openFileDialog() {
    ipcRenderer.send('open-file-dialog');
  }

  function openFolderDialog() {
    ipcRenderer.send('open-folder-dialog');
  }

  const [isMenuVisible, setIsMenuVisible] = React.useState(false);
  const {
    params,
    token,
    log,
  } = useStores();

  function start() {
    const { sourceFolder, destinationFolder, filesToUpload } = params;

    sharedObject.uploadParams = {
      accessToken: token.apiToken,
      sourceFolder,
      destinationFolder,
      origin: params.origin,
      isDebug: log.isDebug,
      filesToUpload,
      threadsCount: params.threadsCount || 5,
    };

    log.startSpeedCheck();
    log.setInProgress(true);
    ipcRenderer.send('start');
  }

  function cancelUploadHanlder() {
    log.stopSpeedCheck();
    log.abortUpload();
    ipcRenderer.send('stop');
  }

  function pathChange(newPath, type) {
    switch(type) {
    case 'folder': {
      params.setSource(newPath[0]);
      params.setFilesToUpload([]);
      break;
    }

    case 'files': {
      if (newPath.length === 1) {
        params.setSource(newPath[0]);
        params.setFilesToUpload([]);
        break;
      }

      const folderPath = (newPath.length && path.dirname(newPath[0])) || "";
      params.setSource(folderPath);
      params.setFilesToUpload(newPath);
      break;
    }

    default: {
      params.setSource(newPath);
      params.setFilesToUpload([]);
    }
    }
  }

  function toggleMenu(e) {
    setIsMenuVisible(!isMenuVisible);
    e.stopPropagation();
  }

  function hideMenu() {
    setIsMenuVisible(false);
  }

  function setDebug(f) {
    log.setDebug(f);
    start();
  }

  function openLog() {
    shell.openExternal(path.join(path.dirname(process.argv0), debugLogFilename));
  }

  function threadsChangeHandler(val) {
    const { setThreadsCount, threadsCount } = params;
    const newCount = threadsCount + val;
    if (newCount > 5) {
      setThreadsCount(5);
    } else if (newCount < 1) {
      setThreadsCount(1);
    } else {
      setThreadsCount(newCount);
    }
  }

  React.useEffect(
    () => {
      params.refreshDomains();
      params.refreshFolders();

      window.addEventListener('click', hideMenu);

      ipcRenderer.on('selected-file', (event, { files: filepath, type }) => {
        pathChange(filepath, type);
      });

      return () => window.removeEventListener('click', hideMenu);
    },
    [],
  );

  return useObserver(() => (
    <Upload
      pathChange={pathChange}
      params={params}
      log={log}
      openFileDialog={openFileDialog}
      openFolderDialog={openFolderDialog}
      threadsChangeHandler={threadsChangeHandler}
      start={start}
      toggleMenu={toggleMenu}
      isMenuVisible={isMenuVisible}
      cancelUploadHanlder={cancelUploadHanlder}
      openLog={openLog}
      debugLogFilename={debugLogFilename}
      setDebug={setDebug}
    />
  ));
}

UploadContainer.displayName = 'UploadContainer';
UploadContainer.propTypes = propTypes;
UploadContainer.defaultProps = defaultProps;

export default UploadContainer;
