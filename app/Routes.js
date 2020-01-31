import React, { Component } from 'react';
import { Switch, Route } from 'react-router';
import { Redirect } from 'react-router-dom';
import { computed } from 'mobx';
import { inject, observer } from 'mobx-react';
import routes from './constants/routes';
import App from './containers/App';
import Header from './components/Header'
import HomePage from './containers/HomePage';
import UploadPage from './containers/UploadPage';


type Props = {
	token: object
};

@inject('token')
@observer
export default class Routes extends Component {
	props: Props;

	@computed get isRedirect () {
		const { token } = this.props;
		return token.apiToken && token.isValid && token.isClean;
	}

	render () {
		return (
			<App>
				<Header />
				<Switch>
					<Route path={routes.HOME} exact component={HomePage} >
						{ this.isRedirect && <Redirect to={routes.UPLOAD} /> }
					</Route>
					<Route path={routes.UPLOAD} exact component={UploadPage} />
				</Switch>
			</App>
		)
	};
}
