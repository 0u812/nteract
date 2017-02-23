import React from 'react';
import ReactDOM from 'react-dom';

class MyComp extends React.Component {
   render() {
      return (
         <div>
            hi
         </div>
      );
   }
}

class VCardField extends React.Component {
   render() {
      return (
         <div>
            vcard field
         </div>
      );
   }
}

class VCard extends React.Component {
   render() {
      return (
         <div>
            vcard
         </div>
      );
   }
}

class App extends React.Component {
   render() {
      return (
         <div>
            app
         </div>
      );
   }
}

ReactDOM.render(
  <App />,
  document.querySelector('#app')
);
