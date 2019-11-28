import { observable } from 'mobx';

export default class MetaStore {
	@observable version = '0.0.0';

	constructor({ ipc }) {
		ipc.on('version', (e, message) => {
			this.version = `v.${message}`;
		});
	}

}
