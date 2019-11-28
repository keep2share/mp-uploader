// @flow
import * as React from 'react';
import { inject, observer } from 'mobx-react';

type Props = {
	children: React.Node
};

@inject('routing')
@observer
export default class App extends React.Component<Props> {
	props: Props;

	render() {
		const { children } = this.props;
		return <React.Fragment>{children}</React.Fragment>;
	}
}
