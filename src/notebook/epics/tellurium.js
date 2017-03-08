import Rx from 'rxjs/Rx';

import {
  createCommOpenMessage,
} from './comm';

import {
  createCellAfter,
  createCellBefore,
} from '../actions';

import * as uuid from 'uuid';

export function convertFileEpic(action$, store) {
  return action$.ofType('CONVERT_FILE')
    .map((action) => {
      const state = store.getState();
      const channels = state.app.channels;
      if (!channels || !channels.iopub || !channels.shell) {
        throw new Error('kernel not connected');
      }

      // console.log('importFileEpic map');
      const identity = uuid.v4();
      const target_format = action.filetype === 'sbml' ? 'antimony' :
        action.filetype === 'omex' ? 'omex' :
        () => {throw new Error('Source filetype not recognized')};
      const commOpen = createCommOpenMessage(identity, 'convert_file_comm', {target_format: target_format, path: action.path});
      const childMessages = channels.iopub.childOf(commOpen);
      channels.shell.next(commOpen);
      return childMessages
        .ofMessageType(['comm_msg'])
        .map((message) => {
          // TODO: throw here on error
          if (action.id) {
            // we have a cell id
            if (action.position === 'below') {
              return createCellAfter(target_format, action.id, message.content.data.content)
            } else if (action.position === 'above') {
              return createCellBefore(target_format, action.id, message.content.data.content)
            }
          } else {
            // we don't have a cell id - just append to end
            return createCellAppend(target_format, message.content.data.content)
          }
        });
    })
    .mergeAll()
    .filter(() => true);
}
