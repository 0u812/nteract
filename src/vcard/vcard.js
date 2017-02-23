import React from 'react';
import ReactDOM from 'react-dom';

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
      return <VCard/>;
   }
}

ReactDOM.render(
  <App />,
  document.querySelector('#app')
);
