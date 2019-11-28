import { observable, action } from 'mobx';

export default class TokenStore {
	@observable apiToken;

	@observable isValid = false;

	@observable isClean = false;

	@observable errorMessage = '';

	constructor(api) {
		this.apiToken = localStorage.apiToken || '';
		this.api = api;

		if (this.apiToken) {
			this.auth();
		}
	}

	@action makeDirty () {
		this.isClean = false;
		this.errorMessage = '';
	}

	@action setToken (token) {
		if (this.apiToken === token) {
			return;
		}
		this.isValid = false;
		this.apiToken = token;
		localStorage.setItem('apiToken', token);
	}

	@action async auth () {
		try {
			await this.api.accountInfo(this.apiToken);
			this.isValid = true;
			this.errorMessage = '';
		} catch (error) {
			this.isValid = false;
			if (error.statusCode === 403) {
				this.errorMessage = 'home.invalidToken';
			} else {
				this.errorMessage = error.error.message;
			}
		}
		this.isClean = true;
	}
}
