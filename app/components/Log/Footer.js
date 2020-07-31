import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { withTranslation } from 'react-i18next';
import styles from './footer.styl';

const propTypes = ({
  copyHandler: PropTypes.func.isRequired,
  clearHandler: PropTypes.func.isRequired,
  uploadInProgress: PropTypes.bool,
  t: PropTypes.func.isRequired,
});

function Footer(props) {
  const { copyHandler, uploadInProgress, clearHandler, t } = props;

  return (
    <div className={styles.footer}>
      <button
        type="button"
        onClick={copyHandler}
      >
        { t('upload.copy') }
      </button>

      <button
        type="button"
        className={ clsx(styles.darkgray, 'right') }
        disabled={uploadInProgress}
        onClick={clearHandler}
      >
        { t('upload.clearlog') }
      </button>
    </div>
  );
};

Footer.displayName = 'Footer';
Footer.propTypes = propTypes;

export default withTranslation()(Footer);
