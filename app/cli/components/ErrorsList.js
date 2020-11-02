import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import styles from './errorsList.styl';

const propTypes = {
  errors: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  clearErrors: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

const defaultProps = {
};

function ErrorsList({ errors, clearErrors, t }) {
  return (
    <div className={styles.errorsContainer}>
      <div>{t('errorsList.uploadFailed')}:</div>
      <ul>
        {errors.map(err => (<li key={err.name}>{err.name}</li>))}
      </ul>

      <button
        type="button"
        onClick={clearErrors}
        className={styles.clearErrors}
      >
        {t('errorsList.clearErrors')}
      </button>
    </div>
  )
}

ErrorsList.displayName = 'ErrorsList';
ErrorsList.propTypes = propTypes;
ErrorsList.defaultProps = defaultProps;

export default withTranslation()(ErrorsList);
