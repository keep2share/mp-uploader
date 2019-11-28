// @flow
import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

type Props = {
	meta: object
};

@inject('meta')
@observer
export default class Version extends Component<Props> {
	props: Props;

	render() {
		const { meta } = this.props;
		return (
			<span>{ meta.version }</span>
		);
	}
}
