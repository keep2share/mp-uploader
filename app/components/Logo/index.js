// @flow
import React, { Component } from 'react';
import clsx from 'clsx';

import logotype from './logo-brand-name.svg';
import styles from './style.styl';

type Props = {
	big: boolean
};

export default class Version extends Component<Props> {
	props: Props;

	render() {
		const { logo, big, left } = styles;
		const { big: isBig } = this.props;
		return (
			<div className={ clsx(logo, isBig ? big : left ) } >
				<img src={logotype} alt="Logo" />
				<h2>File uploader</h2>
			</div>
		);
	}
}
