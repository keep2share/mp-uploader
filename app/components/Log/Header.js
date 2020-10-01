import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import filesize from 'filesize';
import styles from './header.styl';
import Spinner from '../Spinner';

const propTypes = ({
  uploadedCount: PropTypes.number.isRequired,
  uploadInProgress: PropTypes.bool.isRequired,
  bytesRead: PropTypes.number.isRequired,
  speed: PropTypes.number.isRequired,
  t: PropTypes.func.isRequired,
})

function Header({ uploadedCount, uploadInProgress, bytesRead, speed, t }) {
  return (
    <>
      <h3>
        { t('upload.log') } — { t('upload.files', { count: uploadedCount }) }
        {uploadInProgress && <Spinner />}
      </h3>
      <div
        className={styles.bytesRead}
      >
        {t('upload.bytesRead')}: {filesize(bytesRead)} {` (${filesize(speed)}/s)`} {speed}
      </div>
    </>
  );
};

Header.propTypes = propTypes;
Header.displayName = 'LogHeader';

export default withTranslation()(Header);
