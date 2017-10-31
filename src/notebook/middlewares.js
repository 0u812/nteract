import { createEpicMiddleware, combineEpics } from 'redux-observable';

import epics from './epics';

const rootEpic = combineEpics(...epics);

export class TelluriumError extends Error {
  constructor(message, banner) {
    super(message);
    this.name = 'MyError';
    this.banner = banner;
  }
}

export const errorMiddleware = store => next => (action) => {
  if (!action.type.includes('ERROR')) {
    return next(action);
  }
  // console.error(action);
  let errorText;
  let bannerText = action.type;
  if (action.payload) {
    errorText = action.payload.message;
    if(action.payload.banner)
      bannerText = action.payload.banner;
    // errorText = JSON.stringify(action.payload, 2, 2);
  } else {
    errorText = JSON.stringify(action, 2, 2);
  }
  if (action.type === 'ERROR_EXECUTING') {
    bannerText = 'KERNEL NOT READY';
    errorText = 'Cannot process request yet.';
  }
  const state = store.getState();
  const notificationSystem = state.app.get('notificationSystem');
  if (notificationSystem) {
    notificationSystem.addNotification({
      title: bannerText,
      message: errorText,
      dismissible: true,
      position: 'tr',
      level: 'error',
    });
  }
  return next(action);
};

const middlewares = [
  createEpicMiddleware(rootEpic),
  errorMiddleware,
];

export default middlewares;
