// @flow
import { shell } from 'electron';
import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { withTranslation } from 'react-i18next';
import Logo from '../Logo';

import styles from './style.styl';

type Props = {
	t: () => string,
	token: object
};


@inject('token')
@observer
class Home extends Component<Props> {
	props: Props;

	constructor (props) {
		super(props);

		this.token = props.token;
	}

	handleChange (newToken) {
		this.token.makeDirty();
		this.token.setToken(newToken);
	}

	auth () {
		this.token.auth();
	}

	render() {
		const { t } = this.props;
		const partnersLink = 'https://moneyplatform.biz/token/api.html';
		const releaseLink = 'https://github.com/keep2share/api';
		return (
			<div className={styles.container} data-tid="container">
				<Logo big />
				<div className={ styles.description }>
					<p>{ t('home.p1') }</p>
					<p>{ t('home.p2prefix') } <a href="#" onClick={() => shell.openExternal(partnersLink)}>{ t('home.partnersLink') }</a> { t('home.p2postfix') }</p>
				</div>
				<div className={ styles.token }>
					<div>
						<input type="text"
							onChange={(e) => this.handleChange(e.target.value)}
							value={this.token.apiToken}
							placeholder={t('home.placeholder')}
						/>
					</div>
					{ this.token.errorMessage && <div><span className={ styles.error } >{ t(this.token.errorMessage) }</span></div> }
					<button type="button" onClick={() => this.auth()}>{ t('Enter') }</button>
				</div>
				<p className={ styles.footer }>
					{ t('home.p3prefix') } <a href="#" onClick={() => shell.openExternal(releaseLink)}>{ t('home.releaseLink') }</a> { t('home.p3postfix') }
				</p>
			</div>
		);
	}
}

export default withTranslation()(Home);
