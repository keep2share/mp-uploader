import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { withTranslation } from 'react-i18next';
import ReactTable from "react-table";
import clsx from 'clsx';
import filesize from 'filesize';
import 'react-table/react-table.css';
import './fix-table.css';
import styles from './style.styl';
import Spinner from '../Spinner';
import { LOCAL_STORAGE_UPLOAD_LOG_COLUMNS_WIDTH_KEY } from '../../constants/localStorage';

type Props = {
	t: () => string,
	log: object
};

@inject('log')
@observer
class Upload extends Component<Props> {
	props: Props;

	constructor (props) {
		super(props)
		this.state = {
			copied: false,
			rehydratedColumns: (() => {
				const columns = localStorage.getItem(LOCAL_STORAGE_UPLOAD_LOG_COLUMNS_WIDTH_KEY);
				try {
					return JSON.parse(columns) || [];
				} catch {
					return [];
				}
			})(),
		};

		this.copy = this.copy.bind(this);
		this.columnResizeHandler = this.columnResizeHandler.bind(this);
	}

	copy () {
		const { log } = this.props;
		if (!log.files.length) {
			return;
		}
		this.setState({ copied: true });
		setTimeout(() => {
			this.setState({ copied: false });
		}, 800);
		log.copy();
	}

	columnResizeHandler(columns: $ReadOnlyArray<{id: number, value: number}>) {
		const { rehydratedColumns } = this.state;
		const toHydrate = [...rehydratedColumns];
		columns.forEach(col => {
			const index = toHydrate.findIndex(r => r.id === col.id);
			if (index > -1) {
				toHydrate[index] = { ...col }
			} else {
				toHydrate.push(col);
			}
		});

		this.setState({ rehydratedColumns: toHydrate });
		localStorage.setItem(LOCAL_STORAGE_UPLOAD_LOG_COLUMNS_WIDTH_KEY, JSON.stringify(toHydrate));
	}

	getColRehydratedWidth(colId) {
		const { rehydratedColumns } = this.state;
		if (rehydratedColumns.length === 0) {
			return;
		}

		const column = rehydratedColumns.find(col => col.id === colId);
		if (!column) {
			return;
		}

		return column.value;
	}

	render() {
		const { t, log } = this.props;
		const { copied } = this.state;

		return (
			<div className={clsx('expand')}>
				<h3>{ t('upload.log') } — { t('upload.files', { count: log.uploaded }) }{
					log.inProgress && <Spinner />
				}</h3>
				<div
					className={styles.bytesRead}
				>
					{t('upload.bytesRead')}: {filesize(log.bytesRead)} {` (${filesize(log.speed)}/s)`}
				</div>
				<ReactTable
					className={clsx({expand: true, copied})}
					onResizedChange={this.columnResizeHandler}
					data={log.files.slice()}
					columns={[
						{
							Header: t('log.name'),
							accessor: 'name',
							Cell: props => {
								return (
									<span>
										{props.value}
									</span>
								)
							},
							width: this.getColRehydratedWidth('name'),
						},
						{
							Header: t('log.progress'),
							accessor: 'progress',
							Cell: props => {
								const { original } = props;
								return (
									<div className={styles.progressContainer}>
										<div className={styles.progressBar} style={{ width: `${Math.ceil(original.progress)}%` }} />
									</div>
								);
							},
							width: this.getColRehydratedWidth('progress'),
						},
						{
							Header: t('log.size'),
							accessor: 'size',
							width: this.getColRehydratedWidth('size'),
						},
						{
							Header: t('log.date'),
							accessor: 'date',
							width: this.getColRehydratedWidth('date'),
						},
						{
							Header: t('log.id'),
							accessor: 'id',
							width: this.getColRehydratedWidth('id'),
						},
						{
							Header: t('log.link'),
							accessor: 'link',
							width: this.getColRehydratedWidth('link'),
						},
					]}
					minRows={30}
					showPagination={false}
					noDataText={t('log.noFiles')}
					manual
				/>
				<div className={styles.footer}>
					<button type="button"
						onClick={this.copy}
					>{ t('upload.copy') }</button>
					<button type="button"
						className={ clsx(styles.gray, 'right') }
						disabled={log.inProgress}
						onClick={() => log.clear()}
					>{ t('upload.clearlog') }</button>
				</div>
			</div>
		);
	}
}

export default withTranslation()(Upload);
