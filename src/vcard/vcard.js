import React from 'react';
import ReactDOM from 'react-dom';

class VCardField extends React.Component {
   render() {
      return (
         <div className="input-container">
           <div className="prompt">{this.props.fieldName}</div>
           <input></input>
         </div>
      );
   }
}

class VCard extends React.Component {
   render() {
      return (
         <div>
            <h1>VCard Info</h1>
            <div className="cell">
              {this.props.children}
            </div>
         </div>
      );
   }
}

class App extends React.Component {
   render() {
      return (
        <VCard>
          <VCardField fieldName='First Name'/>
          <VCardField fieldName='Last Name' />
        </VCard>
      );
   }
}

ReactDOM.render(
  <App />,
  document.querySelector('#app')
);
