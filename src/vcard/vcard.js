import React from 'react';
import ReactDOM from 'react-dom';
const path = require('path');
import username from 'username';

class VCardField extends React.Component {
   render() {
      return (
         <div className="input-container">
           <div className="prompt">{this.props.fieldLabel}</div>
           <input id={this.props.fieldName}></input>
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

const input_fields = {
  first_name: 'First Name',
  last_name: 'Last Name',
  email: 'Email',
  organization: 'Organization',
  orcid: 'ORCID'
}

function jsonifyVCard(): String {
  let vcard = {};
  Object.keys(input_fields).map((key) => {
    vcard[key] = document.getElementById(key).value;
  });
  return JSON.stringify(vcard);
}

function getTelluriumDataDir(): String {
  return path.join(app.getPath('userData'), 'telocal');
}

export function getVCardPath() {
  return path.join(getTelluriumDataDir(),username.sync()+'.vcard');
}

function saveVCard(): void {
  const vcard = jsonifyVCard();
}

class App extends React.Component {
   render() {
      return (
        <div>
          <VCard>
            {Object.keys(input_fields).map((key) =>
              <VCardField fieldName={key} fieldLabel={input_fields[key]}/>)}
          </VCard>
          <br/>
          <div className='buttonbar'>
            <span onClick={saveVCard} className='diagbutton keep fadein octicon octicon-check'/>
            <span className='diagbutton discard fadein octicon octicon-x'/>
          </div>
        </div>
      );
   }
}

ReactDOM.render(
  <App />,
  document.querySelector('#app')
);
