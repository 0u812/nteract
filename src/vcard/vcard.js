import React from 'react';
import ReactDOM from 'react-dom';
const path = require('path');
import username from 'username';
import { openSync, readFileSync, writeFileSync, closeSync, existsSync } from 'fs';
import { remote } from 'electron';

const input_fields = {
  first_name: 'First Name',
  last_name: 'Last Name',
  email: 'Email',
  organization: 'Organization',
  orcid: 'ORCID'
}

function jsonifyVCard(): String {
  let vcard = {version: '1.0.0'};
  Object.keys(input_fields).map((key) => {
    vcard[key] = document.getElementById(key).value;
  });
  return JSON.stringify(vcard);
}

function getTelluriumDataDir(): String {
  return path.join(remote.app.getPath('userData'), 'telocal');
}

export function getVCardPath() {
  return path.join(getTelluriumDataDir(),username.sync()+'.vcard');
}

function saveVCard(): void {
  const vcard = jsonifyVCard();
  const fd = openSync(getVCardPath(), 'w');
  writeFileSync(fd, vcard);
  closeSync(fd);
  remote.getCurrentWindow().close();
}

function closeAndDiscard(): void {
  remote.getCurrentWindow().close();
}

function checkVCardExists(): Boolean {
  return existsSync(getVCardPath());
}

function readVCard(): String {
  return JSON.parse(readFileSync(getVCardPath()));
}

class VCardField extends React.Component {
  constructor(props) {
    super(props);
    this.state = {value: this.props.initialValue};

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  render() {
    return (
       <div className="input-container">
         <div className="prompt">{this.props.fieldLabel}</div>
         <input id={this.props.fieldName} type='text' value={this.state.value} onChange={this.handleChange}/>
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
      const vcard = checkVCardExists() ? readVCard() : null;
      return (
        <div>
          <VCard>
            {Object.keys(input_fields).map((key) =>
              <VCardField fieldName={key} fieldLabel={input_fields[key]} initialValue={vcard ? vcard[key] : ''}/>)}
          </VCard>
          <br/>
          <div className='buttonbar'>
            <span onClick={saveVCard} className='diagbutton keep fadein octicon octicon-check'/>
            <span onClick={closeAndDiscard} className='diagbutton discard fadein octicon octicon-x'/>
          </div>
        </div>
      );
   }
}

ReactDOM.render(
  <App />,
  document.querySelector('#app')
);
