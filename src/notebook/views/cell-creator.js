// @flow
import { remote } from 'electron';
import React, { PureComponent } from 'react';
import { throttle } from 'lodash';
const log = require('electron-log');

import {
  highlightCells,
} from '../actions';

type Props = {
  above: boolean,
  id: string|null,
  createCell: (type: string) => void,
  mergeCell: () => void,
  importPython: () => void,
  importSBML: () => void,
  importCellML: () => void,
  importOMEX: () => void,
};

type State = {|
  show: boolean,
  showMerge: boolean, // highlight cells about to be merged
|};

// https://github.com/sindresorhus/electron-context-menu/blob/master/index.js
// https://github.com/electron/electron/issues/5794#issuecomment-222687713
const makeTelluriumMenuTemplate = (importPythonAct, importSbmlAct, importCellMLAct, importOmexAct) => [
  {
    id: 'importpython',
    label: 'Import Python script...',
    // accelerator: 'CmdOrCtrl+Z',
    click: (item, win) => importPythonAct(),
    enabled: true
  },
  {
    id: 'importsbml',
    label: 'Import SBML...',
    // accelerator: 'CmdOrCtrl+Z',
    click: (item, win) => importSbmlAct(),
    enabled: true
  },
  {
    id: 'importcellml',
    label: 'Import CellML...',
    // accelerator: 'CmdOrCtrl+Z',
    click: (item, win) => importCellMLAct(),
    enabled: true
  },
  {
    id: 'importomex',
    label: 'Import COMBINE archive (OMEX)...',
    // accelerator: 'CmdOrCtrl+Z',
    click: (item, win) => importOmexAct(),
    enabled: true
  }];

const importPopup = (importPythonAct, importSbmlAct, importCellMLAct, importOmexAct) => {
  const menu = remote.Menu.buildFromTemplate(makeTelluriumMenuTemplate(importPythonAct, importSbmlAct, importCellMLAct, importOmexAct));
  menu.popup(remote.BrowserWindow.getFocusedWindow());
}

const makeNewCellMenuTemplate = (newPythonCell, newMarkdownCell, newModelCell, newOmexCell) => [
  {
    id: 'newpython',
    label: 'New Python Cell',
    click: (item, win) => newPythonCell(),
    enabled: true
  },
  {
    id: 'newmarkdown',
    label: 'New Markdown Cell',
    click: (item, win) => newMarkdownCell(),
    enabled: true
  },
  {
    id: 'newmodel',
    label: 'New Model Cell',
    click: (item, win) => newModelCell(),
    enabled: true
  },
  {
    id: 'newomex',
    label: 'New OMEX Cell',
    click: (item, win) => newOmexCell(),
    enabled: true
  }];

const newCellPopup = (newPythonCell, newMarkdownCell, newModelCell, newOmexCell) => {
  const menu = remote.Menu.buildFromTemplate(makeNewCellMenuTemplate(newPythonCell, newMarkdownCell, newModelCell, newOmexCell));
  menu.popup(remote.BrowserWindow.getFocusedWindow());
}

export default class CellCreator extends PureComponent {
  props: Props;
  state: State;
  updateVisibility: (mouseEvent: MouseEvent) => void;
  hoverElement: HTMLElement;
  mergeElement: HTMLElement;
  cellAbove = null;
  cellBelow = null;

  static contextTypes = {
    store: React.PropTypes.object,
  };

  constructor(): void {
    super();

    this.state = {
      show: false,
      showMerge: false,
    };

    this.updateVisibility = throttle(this.updateVisibility.bind(this), 200);
  }

  componentDidMount(): void {
    // Listen to the page level mouse move event and manually check for
    // intersection because we don't want the hover region to actually capture
    // any mouse events.  The hover region is an invisible element that
    // describes the "hot region" that toggles the creator buttons.
    document.addEventListener('mousemove', this.updateVisibility, false);
  }

  componentWillUnmount(): void {
    document.removeEventListener('mousemove', this.updateVisibility);
  }

  updateVisibility(mouseEvent: MouseEvent): void {
    let showMerge = false;
    if (this.hoverElement) {
      const { clientX: x, clientY: y } = mouseEvent;
      const { left, right, top, bottom } = this.hoverElement.getBoundingClientRect();
      const show = (left < x && x < right) && (top < y && y < bottom);
      this.setState({ show });

      // console.log('this.props.above ', this.props.above);
      if (!this.props.above && this.mergeElement) {
        const { left, right, top, bottom } = this.mergeElement.getBoundingClientRect();
        showMerge = (left < x && x < right) && (top < y && y < bottom);
      }
    }
    if (showMerge != this.state.showMerge) {
      this.setState({ showMerge });
      if (showMerge) {
        this.context.store.dispatch(highlightCells([this.props.id], 'ok'));
      }
    }
  }

  renderActionButtons({ above, createCell, mergeCell, importPython, importSBML, importCellML, importOMEX }: Props): React.Element<any> {
    return (
      <div className="cell-creator">
        <button
          onClick={() => newCellPopup(() => createCell('code'), () => createCell('markdown'), () => createCell('antimony'), () => createCell('omex'))}
          title="New cell..."
          className="add-text-cell"
        >
          <span className="teicon">New &nbsp;
            <span className="octicon octicon-triangle-down" />
          </span>
        </button>
        <button onClick={() => importPopup(() => importPython(), () => importSBML(), () => importCellML(), () => importOMEX())} title="Import file..." className="tellurium-helper">
          <span className="teicon">Import &nbsp;
            <span className="octicon octicon-triangle-down" />
          </span>
        </button>
        { above ? null :
        <button ref={(ref) => { this.mergeElement = ref; }} onClick={() => mergeCell()} title="Merge cells" className="merge-cell">
          <span className="teicon">Merge
          </span>
        </button> }
      </div>
    );
  }

  render(): React.Element<any> {
    return (
      <div className="creator-hover-mask">
        <div className="creator-hover-region" ref={(ref) => { this.hoverElement = ref; }}>
          { this.state.show || !this.props.id
            ? this.renderActionButtons(this.props)
            : null }
        </div>
      </div>
    );
  }
}
