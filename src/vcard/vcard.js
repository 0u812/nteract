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
        <div>
          <VCard>
            <VCardField fieldName='First Name'  />
            <VCardField fieldName='Last Name'   />
            <VCardField fieldName='Email'       />
            <VCardField fieldName='Organization'/>
            <VCardField fieldName='ORCID'       />
          </VCard>
          <br/>
          <div>
            <span className="octicon octicon-check"/>
            <span className="octicon octicon-x"/>
          </div>
        </div>
      );
   }
}

ReactDOM.render(
  <App />,
  document.querySelector('#app')
);
