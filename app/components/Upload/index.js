import React from 'react';
import PropTypes from 'prop-types';
import { Trans, withTranslation } from 'react-i18next';
import { useObserver } from 'mobx-react';
import clsx from 'clsx';
import Log from '../../containers/Log';
import { IconPlus1, IconMinus1 } from './icons';
import styles from './style.styl';
import Errors from '../../containers/Errors';

const propTypes = {
  t: PropTypes.func.isRequired,
  pathChange: PropTypes.func.isRequired,
  openFileDialog: PropTypes.func.isRequired,
  openFolderDialog: PropTypes.func.isRequired,
  threadsChangeHandler: PropTypes.func.isRequired,
  toggleMenu: PropTypes.func.isRequired,
  start: PropTypes.func.isRequired,
  cancelUploadHanlder: PropTypes.func.isRequired,
  openLog: PropTypes.func.isRequired,
  setDebug: PropTypes.func.isRequired,
  params: PropTypes.shape().isRequired,
  log: PropTypes.shape().isRequired,
  isMenuVisible: PropTypes.bool.isRequired,
  debugLogFilename: PropTypes.string.isRequired,
};

function Upload({
  t,
  pathChange,
  params,
  log,
  openFileDialog,
  openFolderDialog,
  threadsChangeHandler,
  start,
  toggleMenu,
  isMenuVisible,
  cancelUploadHanlder,
  openLog,
  debugLogFilename,
  setDebug,
}) {
  function optionFromObj(obj) {
    return <option key={obj.id} value={obj.id}>{obj.label}</option>;
  }

  function option(str, i) {
    return <option key={i} value={str}>{str}</option>;
  }

  const folders = params.folders.map(optionFromObj);
  const domains = params.domains.map(option);

  return useObserver(() => (
    <div className="expand">
      <div className={styles.form}>
        <div className={styles.container}>
          <div className={styles.uploadPath}>
            <label htmlFor="sourceFolder">{ t('upload.selectSourceFolder') }</label>
            <div className={styles.field}>
              <input id="sourceFolder" type="text"
                onChange={(e) => pathChange(e.target.value)}
                value={params.sourceFolder || ''}
              />

              <button type="button"
                className={ clsx(styles.small, styles.gray) }
                onClick={openFileDialog}
              >
                { t('fileOpenDialog') }
              </button>

              <button type="button"
                className={ clsx(styles.small, styles.gray, styles.marginLeft) }
                onClick={openFolderDialog}
              >
                { t('folderOpenDialog') }
              </button>
            </div>
          </div>

          <div className={styles.uploadSettings}>
            <label htmlFor="uploadsCount">{ t('upload.uploadsCount') }</label>
            <div className={styles.field}>
              <span
                className={styles.threadsCount}
                name="uploadsCount"
              >
                {params.threadsCount}
              </span>

              <button
                type="button"
                className={styles.increaseButton}
                onClick={() => threadsChangeHandler(1)}
              >
                <span className={styles.iconBox}>
                  <IconPlus1 />
                </span>
              </button>

              <button
                type="button"
                className={styles.decreaseButton}
                onClick={() => threadsChangeHandler(-1)}
              >
                <span className={styles.iconBox}>
                  <IconMinus1 />
                </span>
              </button>
            </div>
          </div>
        </div>

        {params.filesToUpload && params.filesToUpload.length !== 0 && (
          <>
            <div className={styles.field}>Files to upload ({params.filesToUpload.length}): </div>
            <ul className={styles.filesToUpload}>
              {params.filesToUpload.map(file => <li key={file}>{file}</li>)}
            </ul>
          </>
        )}

        <div className={styles.shortWidth}>
          <label htmlFor="destFolder">{ t('upload.selectDestFolder') }</label>
          <div className={styles.field}>
            <select id="destFolder" onChange={(e) => params.selectFolder(e.currentTarget.value)} >
              {folders}
            </select>
          </div>

          <label htmlFor="domain">{ t('upload.selectDomain') }</label>
          <div className={styles.field}>
            <select id="domain" defaultValue={params.origin} onChange={(e) => params.setDomain(e.currentTarget.value)} >
              {domains}
            </select>
          </div>
          <div style={{ display: 'flex' }}>
            <button type="button"
              onClick={start}
              disabled={log.inProgress}
            >
              { t('upload.start') }
            </button>
            <button type="button"
              className={styles.debug}
              disabled={log.inProgress}
              onClick={toggleMenu}>
								&#x25BE;
            </button>

            {isMenuVisible && (
              <ul className="menu">
                <li>
                  <button type="button" onClick={() => setDebug(false)}>
                    { t('upload.start') }
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => setDebug(true)}>
                    { t('upload.startDebug') }
                  </button>
                </li>
              </ul>
            )}

            <button type="button"
              className={ clsx(styles.yellow, 'right') }
              onClick={cancelUploadHanlder}
              disabled={!log.inProgress || log.isAborting}
            >
              {log.isAborting ? t('upload.aborting') : t('upload.stop')}
            </button>

          </div>
        </div>
      </div>

      <Errors />
      <Log />
      { log.isDebug &&
			<p style={{color: 'red'}}>
			  <Trans i18nKey="upload.debugAttention">
					Attention! Yau are uploading files in the debug mode. After finish process you can find
			    <a href="#" onClick={openLog}>{{name: debugLogFilename}}</a>
					in the same folder where FileUploader is located
			  </Trans>
			</p>}
    </div>
  ));
}

Upload.propTypes = propTypes;

export default withTranslation()(Upload);
