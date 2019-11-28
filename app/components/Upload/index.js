// @flow
import { ipcRenderer, shell } from 'electron';
import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Trans, withTranslation } from 'react-i18next';
import clsx from 'clsx';
import path from 'path'
import Log from './Log';
import styles from './style.styl';

type Props = {
	params: object,
	token: object,
	log: object,
	t: () => string
};

const debugLogFilename = 'debug-mode.log';

@inject('params')
@inject('token')
@inject('log')
@observer
class Upload extends Component<Props> {
	props: Props;

	constructor (props) {
		super(props)
		this.state = {
			menu: false,
		};

		this.hideMenu = this.hideMenu.bind(this);
		this.toggleMenu = this.toggleMenu.bind(this);
		this.openLog = this.openLog.bind(this);
	}

	componentDidMount () {
		const { params } = this.props;
		params.refreshDomains();
		params.refreshFolders();

		window.addEventListener('click', this.hideMenu);
	}

	componentWillUnmount () {
		window.removeEventListener('click', this.hideMenu);
	}

	start () {
		const { params, token, log } = this.props;
		const { sourceFolder, destinationFolder } = params;

		sharedObject.uploadParams = {
			accessToken: token.apiToken,
			sourceFolder,
			destinationFolder,
			origin: params.origin,
			isDebug: log.isDebug,
		};
		log.setInProgress(true);
		ipcRenderer.send('start');
	}

	stop () {
		ipcRenderer.send('stop');
	}

	pathChange (newPath) {
		const { params } = this.props;
		params.sourceFolder = newPath;
	}

	folderDialog () {
		document.getElementById('sourceFolderDialog').click();
	}

	toggleMenu (e) {
		const { menu } = this.state;
		this.setState((previousState) => {
			return { ...previousState, menu: !menu };
		});
		e.stopPropagation();
	}

	hideMenu () {
		this.setState({ menu: false });
	}

	setDebug (f) {
		const { log } = this.props;
		log.setDebug(f);
		this.start();
	}

	openLog () {
		shell.openExternal(path.join(path.dirname(process.argv0), debugLogFilename));
	}

	render() {
		function optionFromObj(obj) {
			return <option key={obj.id} value={obj.id}>{obj.label}</option>
		}
		function option(str, i) {
			return <option key={i} value={str}>{str}</option>
		}

		const { t, params, log } = this.props;
		const { menu } = this.state;
		const folders = params.folders.map(optionFromObj);
		const domains = params.domains.map(option);
		return (
			<div className="expand">
				<div className={styles.form}>
					<label htmlFor="sourceFolder">{ t('upload.selectSourceFolder') }</label>
					<div className={styles.field}>
						<input id="sourceFolder" type="text"
							onChange={(e) => this.pathChange(e.target.value)}
							value={params.sourceFolder}
						/>
						<input id="sourceFolderDialog"
							type="file"
							webkitdirectory="true"
							hidden
							onChange={(e) => this.pathChange(e.nativeEvent?.target?.files[0]?.path)}
						/>
						<button type="button"
							className={ clsx(styles.small, styles.gray) }
							onClick={() => this.folderDialog() }
						>{ t('Browse') }</button>
					</div>
					<label htmlFor="destFolder">{ t('upload.selectDestFolder') }</label>
					<div className={styles.field}>
						<select id="destFolder" onChange={(e) => params.selectFolder(e.currentTarget.value)} >
							{folders}
						</select>
					</div>
					<label htmlFor="domain">{ t('upload.selectDomain') }</label>
					<div className={styles.field}>
						<select id="domain" defaultValue={params.origin} onChange={(e) => params.setDomain(e.currentTarget.value)} >
							{domains}
						</select>
					</div>
					<div style={{ display: 'flex' }}>
						<button type="button"
							onClick={() => this.start()}
							disabled={log.inProgress}
						>{ t('upload.start') }</button>
						<button type="button"
							className={styles.debug}
							disabled={log.inProgress}
							onClick={this.toggleMenu}>&#x25BE;</button>
						{ menu && <ul className="menu">
							<li><button type="button" onClick={() => this.setDebug(false)}>{ t('upload.start') }</button></li>
							<li><button type="button" onClick={() => this.setDebug(true)}>{ t('upload.startDebug') }</button></li>
						</ul> }
						<button type="button"
							className={ clsx(styles.yellow, 'right') }
							onClick={() => this.stop()}
							disabled={!log.inProgress}
						>{ t('upload.stop') }</button>
					</div>
				</div>
				<Log />
				{ log.isDebug &&
				<p style={{color: 'red'}}>
					<Trans i18nKey="upload.debugAttention">
						Attention! Yau are uploading files in the debug mode. After finish process you can find
						<a href="#" onClick={this.openLog}>{{name: debugLogFilename}}</a>
						in the same folder where FileUploader is located
					</Trans>
				</p>}
			</div>
		);
	}
}

export default withTranslation()(Upload);
