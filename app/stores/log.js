import { observable, action } from 'mobx';

export default class LogStore {

	@observable files = [];

	@observable inProgress = false;

	@observable isDebug = false;

	@observable uploaded = 0;

	@observable bytesRead = 0;

	@observable speed = 0;

	@observable lastBytesRead = 0;

	constructor({ ipc }) {
		const $self = this;
		this.ipc = ipc;

		ipc.on('logFileWasCreatedByHash', (e, data) => $self.acceptEvent(data));
		ipc.on('logFileAlreadyUploaded', (e, data) => $self.acceptEvent(data));
		ipc.on('logNewFileWasUploaded', (e, data) => $self.acceptEvent(data));
		ipc.on('logNewFileUploadStarted', (e, data) => $self.acceptEvent(data));
		ipc.on('logFileByHashStarted', (e, data) => $self.acceptEvent(data));
		ipc.on('logUploadProgress', (e, data) => $self.acceptEvent(data));
		ipc.on('logBytesRead', (e, data) => $self.updateBytesRead(data));


		ipc.on('started', (e, flag) => {
			if (flag === 'false'){
				this.setInProgress(false);
			}
		});
		ipc.on('stopped', () => {
			this.setInProgress(false);
		});

		this.startSpeedCheck();
	}

	@action
	startSpeedCheck() {
		setInterval(() => {
			this.speed = this.bytesRead - this.lastBytesRead;
			this.lastBytesRead = this.bytesRead;
		}, 1000);
	}

	acceptEvent (data) {
		if (!this.inProgress) {
			return;
		}
		try {
			const eventFile = JSON.parse(data);
			const existing = this.files.find(file => file.id && file.id === eventFile.id || file.name === eventFile.name);
			eventFile.size /= 1000000;
			if (existing) {
				this.update(existing, eventFile);
			} else {
				this.add(eventFile);
			}
		} catch (error) {
			console.error(error);
		}
	}

	@action
	updateBytesRead(data) {
		this.bytesRead += data;
	}

	@action
	setInProgress (flag) {
		this.inProgress = flag;
		if (!this.inProgress) {
			this.files.forEach((file) => {
				// eslint-disable-next-line
				file.status = 'stopped'
			});
		}
	}

	@action
	setDebug (flag) {
		this.isDebug = flag;
	}

	copy () {
		const links = this.files.map(file => file.link)
			.filter(link => !!link)
			.join('\n');
		try {
			navigator.clipboard.writeText(links);
		} catch (error) {
			console.error(error);
		}
	}

	formatDate (dateString) {
		const date = dateString && new Date(dateString);
		const formatted = date ? `${date.toLocaleDateString()} ${date.toLocaleTimeString()}` : '';
		return formatted;
	}

	@action
	add (newFile) {
		const dateCreated = newFile.date_created;
		const date = this.formatDate(dateCreated);
		const file = { ...newFile, date };
		this.files.unshift(file);
	}

	@action
	update (existing, file) {
		const dateCreated = file.date_created;
		const date = existing.date || this.formatDate(dateCreated);
		if (existing.status !== 'ready' && file.status === 'ready') {
			this.uploaded = this.uploaded + 1;
		}
		Object.assign(existing, file, { date });
	}

	@action
	clear () {
		this.files = [];
		this.uploaded = 0;
	}
}
