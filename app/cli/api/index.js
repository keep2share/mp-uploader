import rp from 'request-promise'
import PromiseThrottle from 'promise-throttle'
import config from '../config'
import {
	ACCESS_TYPE_PUBLIC,
	FILE_ACCESS_PUBLIC,
	DEFAULT_REQUEST_PER_SECOND,
	CLI_CREATE_METHOD_FOR_PHP_API,
	CLI_CREATE_BY_HASH_METHOD_FOR_PHP_API,
} from '../consts'

class Api {
	constructor(props = {}) {
		const { apiUrl, logger, isDebug } = props;

		this.apiUrl = apiUrl;
		this.logger = logger;
		this.isDebug = isDebug;
		this.webapiBaseUrl = config.webapiHosts.k2s.api;
		this.headerJson = {
			'Content-Type': 'application/json',
		};

		this.headerFormData = {
			'Content-Type': 'multipart/form-data',
		};

		this.promiseThrottle = new PromiseThrottle({
			requestsPerSecond: DEFAULT_REQUEST_PER_SECOND,
			promiseImplementation: Promise,
		});

		this.requests = [];
	}

	stop () {
		this.requests.forEach((request) => {
			const { uri, body } = request;
			this.log({
				uri: uri.href,
				body,
				status: 'canceled',
			});
			request.cancel();
		});
	}

	getRequestsPerSecond () {
		return this.promiseThrottle.requestsPerSecond;
	}

	setRequestsPerSecond(value) {
		this.promiseThrottle.requestsPerSecond = value;
	}

	webApiRequest(method, endpoint, body = null) {
		const params = {
			method,
			headers: this.headerJson,
			uri: `${this.webapiBaseUrl}/${endpoint}`,
			resolveWithFullResponse: true,
			json: true,
			body,
			rejectUnauthorized: false,
		};

		if (body) {
			params.body = body;
		}

		return rp(params);
	}

	request(method, endpoint, body = null) {
		return this.promiseThrottle.add(this.phpApiRequest.bind(this, method, endpoint, body)) ;
	}

	log (opts) {
		if (this.isDebug) {
			this.logger.selLogs(opts);
			this.logger.whriteLog();
			this.logger.logToCsv(opts);
		}
	}

	phpApiRequest(method, endpoint, body = null) {
		const { apiUrl } = this;
		const uri = `${apiUrl}/${endpoint}`;
		const params = {
			method,
			headers: this.headerJson,
			uri,
			resolveWithFullResponse: true,
			json: true,
			body,
			rejectUnauthorized: false,
		};

		const promise = rp(params);
		this.requests.push(promise);
		this.log({ uri, body });

		const self = this;
		promise.then((response) => self.log(response.body))
			.catch((err) => {
				console.log({ errorMessage: err.message, code: err.code })
				throw err;
			});
		return promise;
	}

	requestFormData(uri, formData) {
		const params = {
			headers: this.headerFormData,
			method: 'POST',
			uri,
			json: true,
			formData,
			rejectUnauthorized: false,
		};

		this.log({ uri });
		const promise = rp(params);
		this.requests.push(promise);
		promise.catch((err) => {
			this.logger.logError({ errorMessage: err.message, code: err.code });
			throw err;
		});
		return promise;
	}

	async getAuthToken(username, password) {
		return this.request('POST', 'login', {
			username,
			password,
		});
	}

	async findByFirst5MbSha1Hash(sha1, accessToken) {
		return this.request('POST', 'findByFirst5MbSha1Hash', {
			sha1,
			access_token: accessToken,
		});
	}

	async findByMD5Hash(md5, accessToken) {
		return this.request('POST', 'findByFullMd5Hash', {
			md5,
			access_token: accessToken,
		});
	}

	async createFileByHash(accessToken, hash, name, parent = null, access = FILE_ACCESS_PUBLIC) {
		return this.request('POST', 'createFileByHash', {
			hash,
			parent,
			access,
			name,
			access_token: accessToken,
			create_method: CLI_CREATE_BY_HASH_METHOD_FOR_PHP_API,
		});
	}

	async getUploadFormData(accessToken, parent_id = null, preferred_node = null) {
		return this.request('POST', 'getUploadFormData', {
			access_token: accessToken,
			parent_id,
			preferred_node,
			create_method: CLI_CREATE_METHOD_FOR_PHP_API,
		});
	}

	async uploadFile(url, formData) {
		return this.requestFormData(url, formData);
	}

	async getFilesInFolder(accessToken, parentId) {
		return this.request('POST', 'getFilesList', {
			access_token: accessToken,
			parent: parentId,
		});
	}

	async createFolder(accessToken, { parentId, access, name }) {
		return this.request('POST', 'createFolder', {
			access_token: accessToken,
			parent: parentId,
			access: access || ACCESS_TYPE_PUBLIC,
			name,
			is_public: false,
		});
	}

	async accountInfo(accessToken) {
		return this.request('POST', 'accountinfo', {
			access_token: accessToken,
		});
	}

	async domains(accessToken) {
		return this.request('POST', 'getdomainslist', {
			access_token: accessToken,
		})
			.then(r => r.toJSON())
			.then(d => d.body.domains);
	}

	async folders(accessToken) {
		return this.request('POST', 'getfolderslist ', {
			access_token: accessToken,
		})
			.then(r => r.toJSON())
			.then(d => d.body);
	}
}

export default Api;
