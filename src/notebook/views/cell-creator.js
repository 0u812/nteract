// @flow
import { remote } from 'electron';
import React, { PureComponent } from 'react';
import { throttle } from 'lodash';
const log = require('electron-log');

type Props = {
  above: boolean,
  id: string|null,
  createCell: (type: string) => void,
  mergeCell: () => void,
};

type State = {|
  show: boolean,
|};

// https://github.com/sindresorhus/electron-context-menu/blob/master/index.js
// https://github.com/electron/electron/issues/5794#issuecomment-222687713
const makeTelluriumMenuTemplate = () => [{
    id: 'importsbml',
    label: 'Import SBML...',
    // accelerator: 'CmdOrCtrl+Z',
    click: (item, win) => alert('sbml'),
    enabled: true
  },{
    id: 'importomex',
    label: 'Import OMEX...',
    // accelerator: 'CmdOrCtrl+Z',
    click: (item, win) => alert('omex'),
    enabled: true
  }];

const telluriumPopup = () => {
  const menu = remote.Menu.buildFromTemplate(makeTelluriumMenuTemplate());
  menu.popup(remote.BrowserWindow.getFocusedWindow());
}

const renderActionButtons = ({ above, createCell, mergeCell }: Props) => (
  <div className="cell-creator">
    <button
      onClick={() => createCell('markdown')}
      title="create text cell"
      className="add-text-cell"
    >
      <span className="octicon octicon-markdown" />
    </button>
    <button onClick={() => createCell('code')} title="create code cell" className="add-code-cell">
      <span className="octicon octicon-code" />
    </button>
    <button onClick={() => telluriumPopup()} title="tellurium" className="tellurium-helper">
      <span className="octicon octicon-alert" />
    </button>
    { above ? null :
    <button onClick={() => mergeCell()} title="merge cells" className="merge-cell">
      <span className="octicon octicon-arrow-up" />
    </button> }
  </div>
);

export default class CellCreator extends PureComponent {
  props: Props;
  state: State;
  updateVisibility: (mouseEvent: MouseEvent) => void;
  hoverElement: HTMLElement;

  constructor(): void {
    super();

    this.state = {
      show: false,
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
    if (this.hoverElement) {
      const { clientX: x, clientY: y } = mouseEvent;
      const { left, right, top, bottom } = this.hoverElement.getBoundingClientRect();
      const show = (left < x && x < right) && (top < y && y < bottom);
      this.setState({ show });
    }
  }

  render(): React.Element<any> {
    return (
      <div className="creator-hover-mask">
        <div className="creator-hover-region" ref={(ref) => { this.hoverElement = ref; }}>
          { this.state.show || !this.props.id
            ? renderActionButtons(this.props)
            : null }
        </div>
      </div>
    );
  }
}
