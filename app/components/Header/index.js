import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import clsx from 'clsx';
import { withTranslation } from 'react-i18next';

import Logo from '../Logo';
import Version from '../Version';
import routes from '../../constants/routes.json';
import style from './style.styl'
import { LOCAL_STORAGE_LANGUAGE_KEY } from '../../constants/localStorage';
import { LANGUAGE_EN, LANGUAGE_RU } from '../../constants/common';

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

	constructor(props) {
	  super(props);

	  this.setRu = this.setRu.bind(this);
	  this.setEn = this.setEn.bind(this);
	  this.changeLanguage = this.changeLanguage.bind(this);
	}

	tokenDirty () {
	  const { token } = this.props;
	  token.makeDirty();
	}

	setRu() {
	  this.changeLanguage(LANGUAGE_RU);
	}

	setEn() {
	  this.changeLanguage(LANGUAGE_EN);
	}

	changeLanguage(language) {
	  const { lang } = this.props;
	  lang.switchTo(language);
	  localStorage.setItem(LOCAL_STORAGE_LANGUAGE_KEY, lang.current);
	}

	render() {
	  const { lang, t, routing } = this.props;
	  const isAtHome = routing.location &&
			routing.location.pathname === routes.HOME ||
			routing.location.hash === `#${routes.HOME}`;

	  return (
	    <header className={ clsx(!isAtHome && style.line) }>
	      {!isAtHome && <Logo />}
	      <Version />
	      <div className={style.menu}>
	        {!isAtHome &&
						<Link className={style['change-token']}
						  onClick={() => this.tokenDirty()}
						  to={routes.HOME}>{ t('header.changeToken') }
						</Link>
	        }
	        <button
	          type="button"
	          className={clsx(style.asLink, lang.current === LANGUAGE_EN && style.active)}
	          onClick={this.setEn}
	        >
						en
	        </button>
						&nbsp;|&nbsp;
	        <button
	          type="button"
	          className={clsx(style.asLink, lang.current === LANGUAGE_RU && style.active)}
	          onClick={this.setRu}
	        >
						ru
	        </button>
	      </div>
	    </header>
	  );
	}
}

export default withTranslation()(Header);
