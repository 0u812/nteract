/* eslint class-methods-use-this: 0 */
// @flow
import React from 'react';
import Dropdown, { DropdownTrigger, DropdownContent } from 'react-simple-dropdown';
import { executeCellInNotebook, preExecuteCellChecks } from '../notebook';
import { remote } from 'electron';
const dialog = remote.dialog;
import * as path from 'path';

import {
  executeCell,
  removeCell,
  toggleStickyCell,
  clearOutputs,
  changeOutputVisibility,
  changeInputVisibility,
  changeCellType,
  changeCodeCellType,
  toggleOutputExpansion,
  saveFileFromString,
} from '../../actions';

import {
  defaultPathFallback,
} from '../../path';

type Props = {
  cell: any,
  id: string,
  type: string,
}

export default class Toolbar extends React.PureComponent {
  removeCell: () => void;
  executeCell: () => void;
  saveSBML: () => void;
  saveOmex: () => void;
  clearOutputs: () => void;
  toggleStickyCell: () => void;
  changeInputVisibility: () => void;
  changeOutputVisibility: () => void;
  changeCellType: () => void;
  changeCodeCellType: () => void;
  dropdown: Dropdown;
  toggleOutputExpansion: () => void;

  static contextTypes = {
    store: React.PropTypes.object,
  };

  constructor(props: Props): void {
    super(props);
    this.removeCell = this.removeCell.bind(this);
    this.executeCell = this.executeCell.bind(this);
    this.saveSBML = this.saveSBML.bind(this);
    this.saveOmex = this.saveOmex.bind(this);
    this.clearOutputs = this.clearOutputs.bind(this);
    this.toggleStickyCell = this.toggleStickyCell.bind(this);
    this.changeInputVisibility = this.changeInputVisibility.bind(this);
    this.changeOutputVisibility = this.changeOutputVisibility.bind(this);
    this.changeCellType = this.changeCellType.bind(this);
    this.changeCodeCellType = this.changeCodeCellType.bind(this);
    this.toggleOutputExpansion = this.toggleOutputExpansion.bind(this);
  }

  toggleStickyCell(): void {
    this.context.store.dispatch(toggleStickyCell(this.props.id));
  }

  removeCell(): void {
    this.context.store.dispatch(removeCell(this.props.id));
  }

  executeCell(): void {
    if (preExecuteCellChecks(this.context.store, this.props.id, this.props.cell)) {
      executeCellInNotebook(this.context.store, this.props.id, this.props.cell);
    }
  }

  saveSBML(): void {
    if (preExecuteCellChecks(this.context.store, this.props.id, this.props.cell)) {
      const opts = Object.assign({
        title: 'Save SBML file',
        filters: [{ name: 'SBML', extensions: ['xml'] }],
      }, defaultPathFallback());

      let filename = dialog.showSaveDialog(opts);
      if (filename) {
        if (path.extname(filename) === '') {
          filename = `${filename}.xml`;
        }

        this.context.store.dispatch(saveFileFromString(
          'antimony', // source_format
          'sbml',     // target_format
          this.props.cell.get('source'), // source content
          filename // path of file to write
        ));
      }
    }
  }

  saveOmex(): void {
    if (preExecuteCellChecks(this.context.store, this.props.id, this.props.cell)) {
      const opts = Object.assign({
        title: 'Save Combine archive / OMEX',
        filters: [{ name: 'Combine archive', extensions: ['omex'] }],
      }, defaultPathFallback());

      let filename = dialog.showSaveDialog(opts);
      if (filename) {
        if (path.extname(filename) === '') {
          filename = `${filename}.omex`;
        }

        this.context.store.dispatch(saveFileFromString(
          'omex', // source_format
          'omex', // target_format
          this.props.cell.get('source'), // source content
          filename // path of file to write
        ));
      }
    }
  }

  clearOutputs(): void {
    this.dropdown.hide();
    this.context.store.dispatch(clearOutputs(this.props.id));
  }

  changeInputVisibility(): void {
    this.dropdown.hide();
    this.context.store.dispatch(changeInputVisibility(this.props.id));
  }

  changeOutputVisibility(): void {
    this.dropdown.hide();
    this.context.store.dispatch(changeOutputVisibility(this.props.id));
  }

  changeCellType(): void {
    this.dropdown.hide();
    const to = this.props.type === 'markdown' ? 'code' : 'markdown';
    this.context.store.dispatch(changeCellType(this.props.id, to));
  }

  changeCodeCellType(to): void {
    this.dropdown.hide();
    this.context.store.dispatch(changeCodeCellType(this.props.id, to));
  }

  toggleOutputExpansion(): void {
    this.context.store.dispatch(toggleOutputExpansion(this.props.id));
  }

  render(): ?React.Element<any> {
    const showPlay = this.props.type !== 'markdown';
    const isAntimony = this.props.cell.getIn(['metadata', 'tellurium', 'te_cell_type']) === 'antimony';
    const isOmex     = this.props.cell.getIn(['metadata', 'tellurium', 'te_cell_type']) === 'omex';
    const showSave = isAntimony || isOmex;
    return (
      <div className="cell-toolbar-mask">
        <div className="cell-toolbar">
          {showPlay &&
          <span>
            <button
              onClick={this.executeCell}
              title="execute cell"
              className="executeButton"
            >
              <span className="octicon octicon-triangle-right" />
            </button>
          </span>}
          {showSave &&
          <span>
            <button
              onClick={isAntimony ? this.saveSBML : this.saveOmex}
              title={isAntimony ? "Save SBML" : "Save Combine archive"}
            >
              <span className="teicon">
                <svg>
                  <use xlinkHref="../static/assets/symbol-defs.svg#teicon-floppy"></use>
                </svg>
              </span>
            </button>
          </span>}
          <button
            onClick={this.toggleStickyCell}
            title="pin cell"
            className="stickyButton"
          >
            <span className="octicon octicon-pin" />
          </button>
          <Dropdown ref={(dropdown) => { this.dropdown = dropdown; }}>
            <DropdownTrigger>
              <button title="show additional actions">
                <span className="octicon octicon-chevron-down" />
              </button>
            </DropdownTrigger>
            <DropdownContent>
              {
              (this.props.type === 'code') ?
                <ul>
                  <li onClick={this.clearOutputs} className="clearOutput" >
                    <a>Clear Cell Output</a>
                  </li>
                  <li onClick={this.changeInputVisibility} className="inputVisibility" >
                    <a>Toggle Input Visibility</a>
                  </li>
                  <li onClick={this.changeOutputVisibility} className="outputVisibility" >
                    <a>Toggle Output Visibility</a>
                  </li>
                  <li onClick={this.toggleOutputExpansion} className="outputExpanded" >
                    <a>Toggle Expanded Output</a>
                  </li>
                    {
                      (this.props.cell.hasIn(['metadata', 'tellurium', 'te_cell_type']) && this.props.cell.getIn(['metadata', 'tellurium', 'te_cell_type']) !== 'python') ?
                      <li onClick={() => this.changeCodeCellType('python')} className="changeCodeType" >
                        <a>Convert to Python Cell</a>
                      </li>
                      : null
                    }
                    {
                      this.props.cell.getIn(['metadata', 'tellurium', 'te_cell_type']) !== 'omex' ?
                      <li onClick={() => this.changeCodeCellType('omex')} className="changeCodeType" >
                        <a>Convert to OMEX Cell</a>
                      </li>
                      : null
                    }
                    {
                      this.props.cell.getIn(['metadata', 'tellurium', 'te_cell_type']) !== 'antimony' ?
                      <li onClick={() => this.changeCodeCellType('antimony')} className="changeCodeType" >
                        <a>Convert to Model Cell</a>
                      </li>
                      : null
                    }
                </ul> : null
              }
              <ul>
                <li onClick={this.changeCellType} className="changeType" >
                  <a>
                    Convert to {this.props.type === 'markdown' ? 'Code' : 'Markdown'} Cell
                  </a>
                </li>
              </ul>
            </DropdownContent>
          </Dropdown>
          <button
            onClick={this.removeCell}
            title="delete cell"
            className="deleteButton"
          >
            <span className="redbutton octicon octicon-trashcan" />
          </button>
        </div>
      </div>
    );
  }
}
