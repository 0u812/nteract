import Rx from 'rxjs/Rx';

import React from 'react';

import key from 'keymaster';

import {
  createCommOpenMessage,
  createCommMessage,
} from './comm';

import {
  createCellAfter,
  createCellBefore,
  createCellAppend,
} from '../actions';

import Popup from 'react-popup';

import {
  TelluriumError,
} from '../middlewares';

import * as uuid from 'uuid';

export function convertFileEpic(action$, store) {
  return action$.ofType('CONVERT_FILE')
    .map((action) => {
      const state = store.getState();
      const channels = state.app.channels;
      if (!channels || !channels.iopub || !channels.shell) {
        throw new Error('kernel not connected');
      }

      const identity = uuid.v4();

      const source_format = action.filetype === 'python' ? 'python' : action.filetype === 'sbml' ? 'antimony' :
        action.filetype === 'omex' ? 'omex' : action.filetype === 'cellml' ? 'cellml' :
        () => {throw new TelluriumError('Source filetype not recognized.', 'ERROR IMPORTING ARCHIVE')};
      let target_format = action.filetype === 'python' ? 'python' : action.filetype === 'sbml' ? 'antimony' :
        action.filetype === 'omex' ? 'omex' : action.filetype === 'cellml' ? 'antimony' :
        () => {throw new TelluriumError('Source filetype not recognized.', 'ERROR IMPORTING ARCHIVE')};

      const commOpen = createCommOpenMessage(identity, 'convert_file_comm', {target_format: source_format, path: action.path});
      const childMessages = channels.iopub.childOf(commOpen);

      channels.shell.next(commOpen);
      return childMessages
        .ofMessageType(['comm_msg'])
        .map((message) => {
          if (message.content.data.status === 'error') {
            const notificationSystem = state.app.get('notificationSystem');
            // notificationSystem.addNotification({
            //   title: message.content.data.error,
            //   autoDismiss: 4,
            //   level: 'error',
            // });
            if (source_format === 'antimony') {
              throw new TelluriumError(message.content.data.error, 'ERROR IMPORTING SBML');
            } else {
              throw new TelluriumError(message.content.data.error, 'ERROR IMPORTING ARCHIVE');
            }
            // return Rx.Observable.throw(new Error('Unable to import archive.'));
            // return Rx.Observable.of({
            //   type: ERROR_GENERAL,
            //   payload: message.content.data.error,
            //   error: true,
            // });
          }
          // no error - add cells to notebook
          const cells = message.content.data.content.cells;
          if (cells) {
            if (cells.length === 0) {
              throw new TelluriumError('Failed to import any COMBINE archive entries', 'ERROR IMPORTING ARCHIVE');
            }
            if (cells.length > 1) {
              throw new TelluriumError('Multiple cells returned - operation not supported', 'ERROR IMPORTING ARCHIVE');
            }
            const cell = cells[0];
            // for combine archives containing only SBML
            if (cell.type === 'antimony') {
              target_format = 'antimony';
            }
            if (action.id) {
              // we have a cell id
              if (action.position === 'below') {
                return createCellAfter(target_format, action.id, cell.source)
              } else if (action.position === 'above') {
                return createCellBefore(target_format, action.id, cell.source)
              }
            } else {
              // we don't have a cell id - just append to end
              return createCellAppend(target_format, cell.source)
            }
          } else {
            throw new TelluriumError('Could not import file - internal error', 'ERROR IMPORTING ARCHIVE');
          }
        });
    })
    .mergeAll();
}

// used for saving non-notebook files
export function saveFileEpic(action$, store) {
  return action$.ofType('SAVE_FILE_FROM_STRING')
    .map((action) => {
      const state = store.getState();
      const channels = state.app.channels;
      if (!channels || !channels.iopub || !channels.shell) {
        throw new Error('kernel not connected');
      }

      const identity = uuid.v4();

      const source_format = action.source_format;
      const target_format = action.target_format;
      const source_str = action.source_str;
      const path = action.path;

      const commOpen = createCommOpenMessage(identity, 'save_file_comm', {
        source_format: source_format,
        target_format: target_format,
        source_str:    source_str,
        path: path});

      const childMessages = channels.iopub.childOf(commOpen);

      channels.shell.next(commOpen);

      return childMessages
        .ofMessageType(['comm_msg'])
        .map((message) => {
          // TODO: throw here on error
          if (message.content.data.status === 'okay') {
            // success
            const notificationSystem = state.app.get('notificationSystem');
            notificationSystem.addNotification({
              title: `Saved ${message.content.data.file}`,
              autoDismiss: 2,
              level: 'success',
            });
            return Rx.Observable.of({
              type: 'ERROR_SAVING',
              payload: 'error saving',
              error: true,
            });
          } else {
            throw new TelluriumError(message.content.data.error, 'ERROR SAVING');
          }
        }); // TODO: add take until
    })
    .mergeAll()
    .filter(() => false);
}

// used for saving non-notebook files
export function getNotebookPathEpic(action$, store) {
  return action$.ofType('COMM_OPEN')
    .filter((message) => message.target_name == "get_notebook_location")
    .map((message) => {
      const state = store.getState();
      const channels = state.app.channels;
      if (!channels || !channels.iopub || !channels.shell) {
        throw new Error('kernel not connected');
      }
      // console.log('open ', message.comm_id);
      // console.log('filename ', state.metadata.get('filename'));

      const reply = createCommMessage(message.comm_id, {location: state.metadata.get('filename') || ''});
      channels.shell.next(reply);
      // console.log('sent reply');
      return reply;
    })
    .filter(() => false);
}

/** The prompt content component */
class Prompt extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            value: this.props.defaultValue
        };

        this.onChange = (e) => this._onChange(e);
    }

    // https://stackoverflow.com/questions/28889826/react-set-focus-on-input-after-render
    componentDidMount() {
      this.inputElt.focus();
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.value !== this.state.value) {
            this.props.onChange(this.state.value);
        }
    }

    componentWillUnmount() {
      key.unbind('esc');
      key.unbind('enter');
    }

    _onChange(e) {
        let value = e.target.value;

        this.setState({value: value});
    }

    render() {
        return <input type="text" placeholder={this.props.placeholder}
          className="mm-popup__input"
          defaultValue={this.state.value}
          onChange={this.onChange}
          ref={(input) => {this.inputElt = input;}} />;
    }
}

// key('esc', () => {
//   Popup.close();
// });

/** Prompt plugin */
Popup.registerPlugin('prompt', function (defaultValue, placeholder, find_callback, replace_callback) {
    let promptValue = null;
    let promptChange = function (value) {
        promptValue = value;
    };

    key('esc', () => {
      Popup.close();
    });

    key('enter', () => {
      console.log('enter key');
      if (promptValue !== null && promptValue !== '') {
        find_callback(promptValue);
        Popup.close();
      }
    });

    key.filter = (event) => true;

    this.create({
        title: 'Find in Notebook',
        content: <Prompt onChange={promptChange} placeholder={placeholder} value={defaultValue} />,
        buttons: {
            left: [
              {
                text: 'cancel',
                action: () => { Popup.close() },
              }
            ],
            right: [
              {
                text: 'Replace All',
                className: 'danger',
                action: () => {
                    replace_callback(promptValue);
                    Popup.close();
                }
              },
              {
                text: 'Find All',
                action: () => {
                    find_callback(promptValue);
                    Popup.close();
                }
            },
            ]
        }
    });
});

// find in notebook feature
export function findInNotebookEpic(action$, store) {
  return action$.ofType('FIND_IN_NOTEBOOK')
    .do(() => {
      Popup.plugins().prompt('default', 'Find in Notebook',
        (value) => {
          Popup.alert('Find ' + value)
        },
        (value) => {
          Popup.alert('Replace ' + value)
        },
        );
    })
    .filter(() => false);
}
