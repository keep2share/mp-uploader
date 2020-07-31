import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import { createHashHistory } from 'history';
import Root from './containers/Root';
import './app.global.styl';
import './i18n';

const h = createHashHistory();

render(
  <AppContainer>
    <Root history={h} />
  </AppContainer>,
  document.getElementById('root')
);

if (module.hot) {
  module.hot.accept('./containers/Root', () => {
    // eslint-disable-next-line global-require
    const NextRoot = require('./containers/Root').default;
    render(
      <AppContainer>
        <NextRoot history={h} />
      </AppContainer>,
      document.getElementById('root')
    );
  });
}
