import { ipcRenderer } from 'electron';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import clsx from 'clsx';
import { withTranslation } from 'react-i18next';

import Logo from '../Logo';
import Version from '../Version';
import routes from '../../constants/routes';
import style from './style.styl'

type Props = {
	routing: object,
	lang: object,
	t: () => string,
	token: object
};

@inject('routing')
@inject('lang')
@inject('token')
@observer
class Header extends Component<Props> {
	props: Props;

	resize () {
		ipcRenderer.send('resize', 'home');
	}

	tokenDirty () {
		const { token } = this.props;
		token.makeDirty();
		this.resize();
	}

	render() {
		const { lang, t, routing } = this.props;
		const isAtHome = routing.location &&
			routing.location.pathname === routes.HOME ||
			routing.location.hash === `#${routes.HOME}`;

		return (
			<header className={ clsx(!isAtHome && style.line) }>
				{ !isAtHome && <Logo /> }
				<Version />
				<div className={style.menu}>
					{ !isAtHome &&
						<Link className={ style['change-token'] }
							onClick={ () => this.tokenDirty() }
							to={routes.HOME}>{ t('header.changeToken') }
						</Link>
					}
					<button type="button"
						className={ clsx( style.asLink, lang.current === 'en' && style.active) }
						onClick={() => lang.switchTo('en')}>en</button>&nbsp;|&nbsp;
					<button type="button"
						className={ clsx( style.asLink, lang.current === 'ru' && style.active) }
						onClick={() => lang.switchTo('ru')}>ru</button>
				</div>
			</header>
		);
	}
}

export default withTranslation()(Header);
