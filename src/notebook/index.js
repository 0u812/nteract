// @flow
import React from 'react';
import ReactDOM from 'react-dom';

import { Provider } from 'react-redux';

import { Map as ImmutableMap } from 'immutable';

import NotificationSystem from 'react-notification-system';

import Popup from 'react-popup';

import configureStore from './store';
import { reducers } from './reducers';
import Notebook from './components/notebook';

import {
  setNotificationSystem,
} from './actions';

import { initMenuHandlers } from './menu';
import { initNativeHandlers } from './native-window';
import { initGlobalHandlers } from './global-events';

import {
  AppRecord,
  DocumentRecord,
  MetadataRecord,
  CommsRecord,
} from './records';

const store = configureStore({
  app: AppRecord(),
  metadata: MetadataRecord(),
  document: DocumentRecord(),
  comms: CommsRecord(),
  config: ImmutableMap({
    theme: 'light',
  }),
}, reducers);

// Register for debugging
window.store = store;

initNativeHandlers(store);
initMenuHandlers(store);
initGlobalHandlers(store);

class App extends React.PureComponent {
  props: Object;
  state: Object;
  notificationSystem: NotificationSystem;

  componentDidMount(): void {
    store.dispatch(setNotificationSystem(this.notificationSystem));
    const notificationSystem = this.notificationSystem;
    const xhttp = new XMLHttpRequest();
    const receive = function() {
      // if (this.readyState == 4 && this.status == 200) {
      // }
      notificationSystem.addNotification({
        title: 'Update to Cellurium',
        level: 'info',
        autoDismiss: 0,
        position: 'tc',
        children: (
            <div>
              <p>Tellurium Notebook has been renamed to <a href="https://www.cellurium.com">Cellurium Notebook</a>.
              Please visit <a href="https://www.cellurium.com">www.cellurium.com</a> to obtain the latest version.</p>
            </div>
          ),
      });
    };
    const error = function() {
      // if (this.readyState == 4 && this.status == 200) {
      // }
      console.log('xhr error');
    };
    xhttp.addEventListener('load', receive);
    xhttp.addEventListener('error', error);
    xhttp.open("GET", "https://www.cellurium.com/teping", true);
    // xhttp.open("GET", "https://www.google.com", true);
    xhttp.send();
  }

  render(): ?React.Element<any> { // eslint-disable-line class-methods-use-this
    return (
      <Provider store={store}>
        <div>
          <Notebook />
          <NotificationSystem
            ref={(notificationSystem) => { this.notificationSystem = notificationSystem; }}
          />
          <Popup/>
          <link rel="stylesheet" href="../static/styles/main.css" />
          <link rel="stylesheet" href="../node_modules/pretty-checkbox/dist/pretty-checkbox.min.css" />
        </div>
      </Provider>
    );
  }
}

ReactDOM.render(
  <App />,
  document.querySelector('#app')
);
