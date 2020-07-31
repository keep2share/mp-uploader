import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import clsx from 'clsx';
import 'react-table/react-table.css';
import './fix-table.css';
import { LOCAL_STORAGE_UPLOAD_LOG_COLUMNS_WIDTH_KEY } from '../constants/localStorage';
import Footer from '../components/Log/Footer';
import Header from '../components/Log/Header';
import Body from '../components/Log/Body';

const propTypes = ({
  log: PropTypes.shape({
    copy: PropTypes.func.isRequired,
    files: PropTypes.arrayOf(PropTypes.shape),
    uploaded: PropTypes.number,
    inProgress: PropTypes.bool,
    bytesRead: PropTypes.number,
    speed: PropTypes.number,
    clear: PropTypes.func.isRequired,
  }).isRequired,
})

@inject('log')
@observer
class Log extends Component {
  constructor(props) {
    super(props);

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
    this.getColRehydratedWidth = this.getColRehydratedWidth.bind(this);
  }

  copy() {
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

  columnResizeHandler(columns) {
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
    const {
      log: {
        uploaded,
        inProgress,
        bytesRead,
        speed,
        files,
        clear,
      },
    } = this.props;
    const { copied } = this.state;

    return (
      <div className={clsx('expand')}>
        <Header
          uploadedCount={uploaded}
          uploadInProgress={inProgress}
          bytesRead={bytesRead}
          speed={speed}
        />
        <Body
          columnResizeHandler={this.columnResizeHandler}
          files={files}
          copied={copied}
          getColRehydratedWidth={this.getColRehydratedWidth}
        />
        <Footer
          copyHandler={this.copy}
          uploadInProgress={inProgress}
          clearHandler={clear}
        />
      </div>
    );
  }
}

Log.wrappedComponent.propTypes = propTypes;
Log.wrappedComponent.displayName = 'LogContainer';

export default Log;
