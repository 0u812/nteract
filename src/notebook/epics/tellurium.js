import Rx from 'rxjs/Rx';

import {
  createCommOpenMessage,
} from './comm';

import * as uuid from 'uuid';

export function convertFileEpic(action$, store) {
  // console.log('convertFileEpic');
  return action$.ofType('CONVERT_FILE')
    .map((action) => {
      const state = store.getState();
      const channels = state.app.channels;
      if (!channels || !channels.iopub || !channels.shell) {
        throw new Error('kernel not connected');
      }

      // console.log('importFileEpic map');
      const identity = uuid.v4();
      const commOpen = createCommOpenMessage(identity, 'convert_file_comm', {target_format: 'antimony', path: '/Users/phantom/devel/models/elowitz/BIOMD0000000012.xml'});
      const childMessages = channels.iopub.childOf(commOpen);
      // console.log('commOpen');
      channels.shell.next(commOpen);
      // console.log('after send commOpen');
      return childMessages
        .ofMessageType(['comm_msg'])
        .do((message) => { console.log(`child msg: ${JSON.stringify(message)}`); });
    })
    .mergeAll()
    .filter(() => false);
}
