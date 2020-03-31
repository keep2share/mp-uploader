import fs from 'fs'
import moment from 'moment'

class Log {
	constructor(props) {
		this.state = {
			pathToCsv: props.pathToCsv,
			stdoutJson: props.stdoutJson,
			text: undefined,
			forJson: undefined,
			dateFormat: 'DD-MM-YYYY::HH:mm:ss',
			origin: props.origin,
		};
	}

	generateLink(fileId) {
		const { origin } = this.state;
		return `${origin}/file/${fileId}`;
	}

	setLogText(log) {
		let text = `${moment().format(this.state.dateFormat)} ${log.message}:`;
		if (log.errorMessage) {
			text = `${text} ${log.errorMessage};`;
		}

		if (log.id) {
			text = `${text} id ${log.id};`;
		}

		if (log.name) {
			text = `${text} name ${log.name};`;
		}

		if (log.size) {
			text = `${text} size ${log.size};`;
		}

		if (log.link) {
			text = `${text} link ${log.link};`;
		}

		this.state.text = text;
	}

	setLogObject(data) {
		const log = { ...data, date: moment().format(this.state.dateFormat) };
		this.state.forJson = log;
	}

	selLogs(opts) {
		this.setLogText(opts);
		this.setLogObject(opts);
	}

	whriteLog(message) {
		const { stdoutJson, text, forJson } = this.state;
		if (message) {
			return console.log(message);
		}

		if (stdoutJson) {
			return console.log(JSON.stringify(forJson));
		}

		return console.log(text);
	}

	logToCsv(data) {
		const {
			pathToCsv,
		} = this.state;

		const opts = { ...data, date: moment().format(this.state.dateFormat) };
		fs.appendFileSync(pathToCsv, `${JSON.stringify(opts)}\n`);
	}

	logFileAlreadyUploaded(data) {
		const opts = {
			...data,
			message: 'File already exists',
			link: this.generateLink(data.id),
		};

		this.selLogs(opts);
		this.whriteLog();
		this.logToCsv(opts);
	}

	logFileWasCreatedByHash(data) {
		const opts = { ...data, message: 'File was successful created by hash' };
		this.selLogs(opts);
		this.whriteLog();
		this.logToCsv(opts);
	}

	logNewFileWasUploaded(data) {
		const opts = { ...data, message: 'New file was successful created' };
		this.selLogs(opts);
		this.whriteLog();
		this.logToCsv(opts);
	}

	logNewFileUploadStarted(data) {
		const opts = { ...data, message: 'New file start uploading' };
		this.selLogs(opts);
		this.whriteLog();
		this.logToCsv(opts);
	}

	logFileByHashStarted(data) {
		const opts = { ...data, message: 'New file start uploading' };
		this.selLogs(opts);
		this.whriteLog();
		this.logToCsv(opts);
	}

	stopped(data) {
		const opts = { ...data, message: `Uploader ${data.sourceFolder} stopped` };
		this.selLogs(opts);
		this.whriteLog();
		this.logToCsv(opts);
	}

	logError(data) {
		const opts = { ...data, message: 'error' };
		this.selLogs(opts);
		this.whriteLog();
		this.logToCsv(opts);
	}

	logUploadProgress() {
	}

	logBytesRead() {
	}
}

// TODO classes of messages implements Log { logFileAlreadyUploaded, logFileWasCreatedByHash ....}
export default Log;
