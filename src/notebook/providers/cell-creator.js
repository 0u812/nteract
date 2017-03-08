// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';

import {
  createCellAfter,
  createCellAppend,
  createCellBefore,
  mergeCellAfter,
  importFileIntoNotebook,
} from '../actions';
import CellCreatorView from '../views/cell-creator';

type Props = {|
  above: boolean,
  dispatch: Dispatch<*>,
  id: string|null,
|}

class CellCreator extends Component {
  props: Props;
  createCell: (type: string) => void;
  mergeCell: () => void;

  constructor(): void {
    super();
    this.createCell = this.createCell.bind(this);
    this.importFile = this.importFile.bind(this);
    this.mergeCell = this.mergeCell.bind(this);
    this.importFile = this.importFile.bind(this); // not sure if this is necessary
    this.importSBML = this.importSBML.bind(this);
    this.importOMEX = this.importOMEX.bind(this);
  }

  createCell(type: string): void {
    const { dispatch, above, id } = this.props;

    if (!id) {
      dispatch(createCellAppend(type));
      return;
    }

    above ? dispatch(createCellBefore(type, id)) : dispatch(createCellAfter(type, id));
  }

  importFile(type: string): void {
    const { dispatch, above, id } = this.props;

    if (!id) {
      dispatch(createCellAppend(type));
      return;
    }

    above ? dispatch(createCellBefore(type, id)) : dispatch(createCellAfter(type, id));
  }

  importSBML(): void {
    const type = 'antimony';
    const { dispatch, above, id } = this.props;

    if (!id) {
      dispatch(importFileIntoNotebook('', '/Users/phantom/devel/models/elowitz/BIOMD0000000012.xml', '', 'sbml', above));
      return;
    }

    console.log('importSBML dispatch')
    dispatch(importFileIntoNotebook(id, '/Users/phantom/devel/models/elowitz/BIOMD0000000012.xml', '', 'sbml', above));
  }

  importOMEX(): void {
    const type = 'omex';
    const { dispatch, above, id } = this.props;

    if (!id) {
      dispatch(createCellAppend(type));
      return;
    }

    above ? dispatch(createCellBefore(type, id)) : dispatch(createCellAfter(type, id, 'OMEX'));
  }

  mergeCell(): void {
    const { dispatch, id } = this.props;

    dispatch(mergeCellAfter(id));
  }

  render(): React.Element<any> {
    const props = {
      ...this.props,
      createCell: this.createCell,
      mergeCell: this.mergeCell,
      importSBML: this.importSBML,
      importOMEX: this.importOMEX,
    };

    return (
      <CellCreatorView {...props} />
    );
  }
}

export default connect()(CellCreator);
