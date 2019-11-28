import i18n from 'i18next';
import { observable, action } from 'mobx';

export default class LangStore {
	@observable lang = 'en';

	constructor({ lang = 'en' } = {}) {
		this.current = lang;
	}

	@action switchTo(lang) {
		if (this.current === lang) {
			return;
		}
		i18n.changeLanguage(lang);
		this.current = lang;
	}
}
