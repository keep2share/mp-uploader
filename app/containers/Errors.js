import React from 'react';
import { useObserver } from 'mobx-react';
import { useStores } from '../stores';
import ErrorsList from '../cli/components/ErrorsList';

function Errors() {
  return useObserver(() => {
    const { log } = useStores();
    if (log.errors.length === 0) {
      return null;
    }

    function clearErrors() {
      log.clearErrors();
    }

    return (
      <ErrorsList
        clearErrors={clearErrors}
        errors={log.errors}
      />
    );
  });
}

Errors.displayName = 'Errors';

export default Errors;
