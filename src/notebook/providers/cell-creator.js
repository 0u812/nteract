import { remote } from 'electron';
const dialog = remote.dialog;

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
    this.importPython = this.importPython.bind(this);
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
    // const { dispatch, above, id } = this.props;
    //
    // if (!id) {
    //   dispatch(createCellAppend(type));
    //   return;
    // }
    //
    // above ? dispatch(createCellBefore(type, id)) : dispatch(createCellAfter(type, id));
  }

  importPython(): void {
    const { dispatch, above, id } = this.props;

    const dialog_opts = {
      title: 'Import a Python script',
      filters: [{ name: 'Python files', extensions: ['py'] }],
      properties: ['openFile'],
    };
    dialog.showOpenDialog(dialog_opts, (fname) => {
      if (fname) {
        const f = fname[0];
        if (!id)
          dispatch(importFileIntoNotebook('', f, '', 'python', above ? 'above' : 'below'));
        else
          dispatch(importFileIntoNotebook(id, f, '', 'python', above ? 'above' : 'below'));
      }
    });
  }

  importSBML(): void {
    const { dispatch, above, id } = this.props;

    const dialog_opts = {
      title: 'Import an SBML file',
      filters: [{ name: 'SBML files', extensions: ['xml', 'sbml'] }],
      properties: ['openFile'],
    };
    dialog.showOpenDialog(dialog_opts, (fname) => {
      if (fname) {
        const f = fname[0];
        if (!id)
          dispatch(importFileIntoNotebook('', f, '', 'sbml', above ? 'above' : 'below'));
        else
          dispatch(importFileIntoNotebook(id, f, '', 'sbml', above ? 'above' : 'below'));
      }
    });
  }

  importOMEX(): void {
    const { dispatch, above, id } = this.props;

    // filetypes .omex, .sedx, .sbex, .cmex, .sbox, .neux, .phex

    const dialog_opts = {
      title: 'Import a COMBINE archive',
      filters: [{ name: 'COMBINE archives', extensions: ['omex', 'sedx', 'sbex', 'cmex', 'sbox', 'neux', 'phex', 'zip'] }],
      properties: ['openFile'],
    };
    dialog.showOpenDialog(dialog_opts, (fname) => {
      if (fname) {
        const f = fname[0];
        if (!id)
          dispatch(importFileIntoNotebook('', f, '', 'omex', above ? 'above' : 'below'));
        else
          dispatch(importFileIntoNotebook(id, f, '', 'omex', above ? 'above' : 'below'));
      }
    });
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
      importPython: this.importPython,
      importSBML: this.importSBML,
      importOMEX: this.importOMEX,
    };

    return (
      <CellCreatorView {...props} />
    );
  }
}

export default connect()(CellCreator);
