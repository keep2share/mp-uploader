/* eslint-disable react/prop-types */
import React from 'react';
import ReactTable from "react-table";
import PropTypes from 'prop-types';
import clsx from 'clsx';
import 'react-table/react-table.css';
import './fix-table.css';
import { withTranslation } from "react-i18next";
import styles from './body.styl';

const propTypes = ({
  columnResizeHandler: PropTypes.func.isRequired,
  files: PropTypes.arrayOf(PropTypes.shape).isRequired,
  copied: PropTypes.bool.isRequired,
  getColRehydratedWidth: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
});

function Body({ columnResizeHandler, files, copied, getColRehydratedWidth, t }) {
  return (
    <ReactTable
      className={clsx({expand: true, copied})}
      onResizedChange={columnResizeHandler}
      data={files.slice()}
      columns={[
        {
          Header: t('log.name'),
          accessor: 'name',
          Cell: props => {
            const { value } = props;
            return (
              <span>
                {value}
              </span>
            )
          },
          width: getColRehydratedWidth('name'),
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
          width: getColRehydratedWidth('progress'),
        },
        {
          Header: t('log.size'),
          accessor: 'size',
          width: getColRehydratedWidth('size'),
          Cell: props => {
            const { value } = props;
            return (
              <div style={{ textAlign: 'right' }}>
                {value.toFixed(2)}
              </div>
            );
          },
        },
        {
          Header: t('log.date'),
          accessor: 'date',
          width: getColRehydratedWidth('date'),
        },
        {
          Header: t('log.id'),
          accessor: 'id',
          width: getColRehydratedWidth('id'),
        },
        {
          Header: t('log.link'),
          accessor: 'link',
          width: getColRehydratedWidth('link'),
        },
      ]}
      minRows={30}
      showPagination={false}
      noDataText={t('log.noFiles')}
    />
  );
}

Body.propTypes = propTypes;
Body.displayName = 'LogBody';

export default withTranslation()(Body);
