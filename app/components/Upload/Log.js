import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { withTranslation } from 'react-i18next';
import ReactTable from "react-table";
import clsx from 'clsx';

import 'react-table/react-table.css';
import './fix-table.css';
import styles from './style.styl';
import Spinner from '../Spinner';

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
			reflow: false,
			copied: false,
		};
		this.reflow = this.reflow.bind(this);
		this.copy = this.copy.bind(this);
	}

	componentDidMount(){
		window.addEventListener('resize', this.reflow);
	}

	componentWillUnmount () {
		window.removeEventListener('resize', this.reflow);
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

	reflow () {
		this.setState({ reflow: true });
		setTimeout(() => {
			this.setState({ reflow: false });
		}, 10);
	}

	render() {
		const { t, log } = this.props;
		const { reflow, copied } = this.state;
		return (
			<div className={ clsx('expand', reflow && styles.reflow ) }>
				<h3>{ t('upload.log') } — { t('upload.files', { count: log.uploaded }) }{
					log.inProgress && <Spinner />
				}</h3>
				<ReactTable className={ clsx({expand: true, copied}) }
					data={log.files.slice()}
					columns={[
						{
							Header: t('log.name'),
							accessor: 'name',
							Cell: props => {
								const { original } = props;
								return (
									<span>
										{original.status === 'uploading' && <Spinner size="18" />}
										{props.value}
									</span>
								)
							}
						},
						{
							Header: t('log.size'),
							accessor: 'size',
						},
						{
							Header: t('log.date'),
							accessor: 'date',
						},
						{
							Header: t('log.id'),
							accessor: 'id',
						},
						{
							Header: t('log.link'),
							accessor: 'link',
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
