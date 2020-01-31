import fs from 'fs'
import { promisify } from 'util'
import crypto from 'crypto'
import path from 'path'
import { EventEmitter } from 'events'
import readChunk from 'read-chunk'
import urijs from 'urijs'
import { CHUNK_HASH_SIZE } from '../consts'

class Uploader extends EventEmitter {
	static getSha1(buffer) {
		return crypto.createHash('sha1').update(buffer).digest('hex');
	}

	static async getFileMd5(filePath) {
		return new Promise((resolve) => {
			const fd = fs.createReadStream(filePath);
			const hash = crypto.createHash('md5');
			hash.setEncoding('hex');

			fd.on('end', () => {
				hash.end();
				resolve(hash.read());
			});

			// read all file and pipe it (write it) to the hash object
			fd.pipe(hash);
		});
	}

	static async isFile(pathToFile) {
		const fileStatAsync = promisify(fs.stat);
		const fileStat = await fileStatAsync(pathToFile);
		return fileStat.isFile();
	}

	static async fileStat(pathToFile) {
		const fileStatAsync = promisify(fs.stat);
		const fileStat = await fileStatAsync(pathToFile);
		return fileStat;
	}

	constructor(props) {
		super();

		const {
			sourceFolder,
			destinationFolder,
			accessToken,
			api,
			logger,
			hostname,
			origin,
		} = props;

		this.logger = logger;
		this.api = api;
		this.state = {
			sourceFolder,
			destinationFolder: destinationFolder || null,
			accessToken,
			filesArray: [],
			filesInDestinationFolder: [],
			hostname,
			origin,
			uploadsInProcess: 0,
			currentFileIndex: 0,
		};

		this.maxUploadsCount = 5;
		this.massUpload = this.massUpload.bind(this);
		this.on('stop', () => {
			const { state } = this;
			state.currentFileIndex = Number.MAX_SAFE_INTEGER;
			state.filesArray.length = 0;
			if (this.isDebug) {
				this.logger.stopped({
					sourceFolder: this.sourceFolder,
				});
			}
		});

	}

	async getFilesArray() {
		const { sourceFolder } = this.state;
		const isFile = await Uploader.isFile(sourceFolder);
		let files;
		if (isFile) {
			files = [path.basename(sourceFolder)];
			this.state.sourceFolder = path.parse(sourceFolder).dir;
		} else {
			const readDirAsync = promisify(fs.readdir);
			files = await readDirAsync(sourceFolder);
		}

		this.state.filesArray = files;
		return files;
	}

	async getFilesFromDestinationFolder() {
		const {
			destinationFolder,
			accessToken,
		} = this.state;
		const { api } = this;
		const response = await api.getFilesInFolder(accessToken, destinationFolder);
		this.state.filesInDestinationFolder = (response.body && response.body.files) || [];
	}

	async setCurrentFile(filename) {
		const {
			sourceFolder,
		} = this.state;

		const filePath = `${sourceFolder}/${filename}`;
		const filestat = await Uploader.fileStat(filePath);

		const isFolder = !filestat.isFile();
		let sha1;
		if (!isFolder){
			const first5mbFile5Buffer = await readChunk(filePath, 0, CHUNK_HASH_SIZE);
			sha1 = Uploader.getSha1(first5mbFile5Buffer);
		}

		return {
			name: filename,
			path: filePath,
			size: filestat.size.toString(),
			isFolder,
			sha1,
		};
	}

	async readAndUploadFiles() {
		await this.getFilesArray();
		await this.getFilesFromDestinationFolder();
		this.massUpload();
		return this;
	}

	async massUpload() {
		const {
			filesArray,
		} = this.state;

		const { maxUploadsCount } = this;

		while (this.state.currentFileIndex < filesArray.length) {
			if (this.state.uploadsInProcess >= maxUploadsCount) {
				break;
			}

			const file = filesArray[this.state.currentFileIndex];
			this.uploadFile(file);
			this.onUploadFileStart();
		}
	}

	onUploadFileStart() {
		this.incrementCurrentFileIndex();
		this.incrementUploadInProcessCount();
	}

	onUploadFileEnd() {
		const {
			filesArray,
			currentFileIndex,
		} = this.state;
		this.decrementUploadInProcessCount();

		if(currentFileIndex >= filesArray.length && !this.state.uploadsInProcess) {
			return this.emit('folder-upload-end');
		}
		this.massUpload();
	}

	incrementCurrentFileIndex() {
		this.state.currentFileIndex = this.state.currentFileIndex + 1;
	}

	incrementUploadInProcessCount() {
		this.state.uploadsInProcess = this.state.uploadsInProcess + 1;
	}

	decrementUploadInProcessCount() {
		this.state.uploadsInProcess = this.state.uploadsInProcess - 1;
	}

	async uploadFile(filename) {
		try {
			const currentFile = await this.setCurrentFile(filename);
			if (currentFile.isFolder) {
				return this.uploadFolder(currentFile);
			}

			const { sha1, name, size } = currentFile;
			const foundedFile = this.searchFileInDestinationFolder(currentFile);
			if (foundedFile) {
				this.logger.logFileAlreadyUploaded({
					id: foundedFile.id,
					size: currentFile.size,
					name: foundedFile.name,
					path: currentFile.path,
					date_created: foundedFile.date_created,
					link: this.generateLinkFromId(foundedFile.id),
				});
				this.onUploadFileEnd();
				return
			}

			const uploadedByHashFile = await this.uploadFileByHash(currentFile);
			if (uploadedByHashFile) {
				this.logger.logFileWasCreatedByHash({
					sha1,
					name,
					size,
					id: uploadedByHashFile.body.id,
					link: this.generateLinkForDomain(uploadedByHashFile.body.link, name),
					date_created: new Date().toISOString(),
				});
				this.onUploadFileEnd();
				return
			}

			const newFile = await this.uploadNewFile(currentFile);
			if (newFile) {
				this.logger.logNewFileWasUploaded({
					sha1,
					name,
					size,
					id: newFile.user_file_id,
					link: this.generateLinkForDomain(newFile.link, name),
					date_created: new Date().toISOString(),
				});
				this.onUploadFileEnd();
				return
			}

			this.onUploadFileEnd();
			return this.logger.logError({ errorMessage: 'empty response from filestore', name: filename });
		} catch (err) {
			this.onUploadFileEnd();
			return this.logger.logError({ errorMessage: err.message, name: filename });
		}
	}

	generateLinkFromId(id) {
		return `${this.state.origin}/file/${id}`;
	}

	generateLinkForDomain(link, name = null) {
		const { hostname } = this.state;
		const domainLink = urijs(link).protocol('http').hostname(hostname).toString();

		if (name) {
			return `${domainLink}/${name}`;
		}

		return domainLink;
	}

	async uploadFolder(currentFile) {
		try {
			const {
				sourceFolder,
				destinationFolder,
				accessToken,
				hostname,
			} = this.state;
			const { api, logger } = this;
			const foundedFile = this.searchFileInDestinationFolder(currentFile);
			let destination = destinationFolder;

			if (foundedFile && foundedFile.is_folder) {
				destination = foundedFile.id;
			} else {
				const response = await api.createFolder(accessToken, {
					name: currentFile.name,
					parentId: destinationFolder === null ? '/' : destinationFolder,
				});

				destination = response.body.id;
			}

			const self = this;
			const uploader = new Uploader({
				sourceFolder: `${sourceFolder}/${currentFile.name}`,
				destinationFolder: destination,
				accessToken,
				api,
				logger,
				hostname,
			});
			uploader.on('folder-upload-end', () => {
				self.onUploadFileEnd();
			});
			self.on('stop', () => {
				uploader.emit('stop');
			});

			return uploader.readAndUploadFiles();
		} catch (err) {
			return this.logger.logError({ errorMessage: err.message, name: currentFile.name });
		}
	}

	searchFileInDestinationFolder(currentFile) {
		const {
			filesInDestinationFolder,
		} = this.state;

		return filesInDestinationFolder
			.filter(file => file.name === currentFile.name)
			.shift();
	}

	async uploadFileByHash(currentFile) {
		const {
			destinationFolder,
			accessToken,
		} = this.state;
		const { api } = this;

		// trying to find file by first 5 mb of sha1
		const findByFirst5MbSha1HashResponse = await api
			.findByFirst5MbSha1Hash(currentFile.sha1, accessToken);

		if (!(findByFirst5MbSha1HashResponse.body && findByFirst5MbSha1HashResponse.body.exists)) {
			return false;
		}

		// trying to find file in filestore by md5
		const fileMd5 = await Uploader.getFileMd5(currentFile.path);
		const findByMD5HashResponse = await api.findByMD5Hash(fileMd5, accessToken);
		if (!(findByMD5HashResponse.body && findByMD5HashResponse.body.exists)) {
			return false;
		}

		// if file was found, creates a new file by hash
		this.logger.logFileByHashStarted(currentFile);
		return api.createFileByHash(
			accessToken, findByMD5HashResponse.body.md5, currentFile.name, destinationFolder,
		);
	}

	async uploadNewFile(currentFile) {
		const {
			destinationFolder,
			accessToken,
		} = this.state;
		const { api } = this;
		const uploadData = await api.getUploadFormData(accessToken, destinationFolder, null);
		if (!(uploadData && uploadData.body && uploadData.body.status === 'success')) {
			return false;
		}

		// Prepare formData for Upload
		const formData = {};
		Object.keys(uploadData.body.form_data)
			.forEach((key) => {
				// key of formData must be string or buffer
				formData[key] = uploadData.body.form_data[key].toString();
			});

		const fileStream = fs.createReadStream(currentFile.path);
		fileStream.on('data', (chunk) => {
			// eslint-disable-next-line no-param-reassign
			currentFile.uploadedBytes = currentFile.uploadedBytes ? currentFile.uploadedBytes + chunk.length : chunk.length;
			// eslint-disable-next-line no-param-reassign
			currentFile.progress = currentFile.uploadedBytes / parseInt(currentFile.size, 10) * 100;
			this.logger.logUploadProgress(currentFile);
			this.logger.logBytesRead(chunk.length);
		});
		formData[uploadData.body.file_field] = fileStream;
		if (!currentFile.isFolder) {
			this.logger.logNewFileUploadStarted({
				sha1: currentFile.sha1,
				name: currentFile.name,
				size: currentFile.size,
			});
		}
		return api.uploadFile(uploadData.body.form_action, formData);
	}
}

export default Uploader;
