import Log from './cli/components/Log'

export default class IPCLog extends Log {
	constructor (props) {
		super(props);

		this.ipc = props.ipc;
		this.isDebug = props.isDebug;
	}

	logFileAlreadyUploaded(data) {
		if (this.isDebug) {
			super.logFileAlreadyUploaded(data);
		}
		this.ipc.send('logFileAlreadyUploaded', JSON.stringify({...data, status: 'ready'}));
	}

	logFileWasCreatedByHash(data) {
		if (this.isDebug) {
			super.logFileWasCreatedByHash(data);
		}
		this.ipc.send('logFileWasCreatedByHash', JSON.stringify({...data, status: 'ready'}));
	}

	logNewFileWasUploaded(data) {
		if (this.isDebug) {
			super.logNewFileWasUploaded(data);
		}
		this.ipc.send('logNewFileWasUploaded', JSON.stringify({...data, status: 'ready'}));
	}

	logNewFileUploadStarted(data) {
		if (this.isDebug) {
			super.logNewFileUploadStarted(data);
		}
		this.ipc.send('logNewFileUploadStarted', JSON.stringify({...data, status: 'uploading'}));
	}

	logFileByHashStarted(data) {
		if (this.isDebug) {
			super.logFileByHashStarted(data);
		}
		this.ipc.send('logFileByHashStarted', JSON.stringify({...data, status: 'uploading'}));
	}
	
	logUploadProgress(data) {
		this.ipc.send('logUploadProgress', JSON.stringify({...data, status: 'uploading'}));
	}

	logBytesRead(data) {
		this.ipc.send('logBytesRead', data);
	}

	stopped(data) {
		if (this.isDebug) {
			super.stopped(data);
		}
	}

	logError(data) {
		if (this.isDebug) {
			super.logError(data);
		}
		this.ipc.send('logError', JSON.stringify({...data, status: 'error'}));
	}
}
