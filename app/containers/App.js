// @flow
import * as React from 'react';
import { remote } from 'electron';
import { inject, observer } from 'mobx-react';
import { LOCAL_STORAGE_WINDOW_BOUNDS_KEY, LOCAL_STORAGE_LANGUAGE_KEY } from '../constants/localStorage';

type Props = {
	children: React.Node,
	lang: object
};

@inject('routing', 'lang')
@observer
export default class App extends React.Component<Props> {
	props: Props;

	componentDidMount() {
		const mainWindow = remote.getCurrentWindow();
		mainWindow.on('resize', () => {
			localStorage.setItem(LOCAL_STORAGE_WINDOW_BOUNDS_KEY, JSON.stringify(mainWindow.getBounds()));
		});

		const hydratedBounds = localStorage.getItem(LOCAL_STORAGE_WINDOW_BOUNDS_KEY);
		if (hydratedBounds) {
			try {
				mainWindow.setBounds(JSON.parse(hydratedBounds));
			} catch (err) {
				return false;
			}
		}

		const hydratedLanguage = localStorage.getItem(LOCAL_STORAGE_LANGUAGE_KEY);
		if (hydratedLanguage) {
			const { lang } = this.props;
			lang.switchTo(hydratedLanguage);
		}
	}

	render() {
		const { children } = this.props;
		return <>{children}</>;
	}
}
