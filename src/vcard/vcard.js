import React from 'react';
import ReactDOM from 'react-dom';
const path = require('path');
import username from 'username';
import { openSync, readFileSync, writeFileSync, closeSync, existsSync } from 'fs';
import { remote, shell } from 'electron';
import { ipcRenderer } from 'electron';

const input_fields = {
  first_name: 'First Name',
  last_name: 'Last Name',
  email: 'Email',
  organization: 'Organization',
  orcid: 'ORCID'
}

// http://stackoverflow.com/questions/31856712/update-component-state-from-outside-react-on-server-response
const components = {};

let validated_orcid = '';

ipcRenderer.on('update-personal-info', (e, keys) => {
  Object.keys(keys).map((key) => {
    if (key === 'orcid') {
      validated_orcid = keys[key];
    }
    if (key in components) {
      components[key].setState({value: keys[key]});
    } else {
      console.error('No such field: ', key);
    }
  });
});

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

function connectOrcid(): void {
  // shell.openExternal('org.analogmachine.tellurium://abc');
  shell.openExternal(
    'https://orcid.org/oauth/authorize?'+
    'client_id=APP-VPVYI4C8LVACISNZ&'+
    'response_type=code&scope=/authenticate&'+
    'redirect_uri=http://128.208.17.254/');
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
    // FIXME: setState?
    this.state = {value: this.props.initialValue};
    // bind functions
    this.handleChange = this.handleChange.bind(this);

    // add to components
    components[this.props.fieldName] = this;
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

class VCardORCID extends VCardField {
  constructor(props) {
    super(props);
    this.state = {value: this.props.initialValue};

    this.handleChange = this.handleChange.bind(this);

    // add to components
    components[this.props.fieldName] = this;
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  render() {
    return (
       <div className="input-container">
         <div className="prompt">{this.props.fieldLabel+(validated_orcid.length > 0 && this.state.value === validated_orcid ? ' (verified)' : '')}</div>
         <input id={this.props.fieldName} type='text' value={this.state.value} onChange={this.handleChange}/>
       </div>
    );
  }
}

class VCard extends React.Component {
   render() {
      return (
         <div>
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
          <h3>Tellurium can retrieve your info from ORCID, or you can enter it manually</h3>
          <div className='buttonbar'>
            <span onClick={connectOrcid} className='connect-orcid-button'>
              <svg className='orcid-id-logo'>
                <use xlinkHref="./assets/symbol-defs.svg#teicon-orcid"></use>
              </svg>
              Create or Connect your ORCID iD
            </span>
          </div>
          <h3>Personal Info (Used in Combine Archives)</h3>
          <VCard>
            {Object.keys(input_fields).map((key) =>
              key === 'orcid' ?
              <VCardORCID fieldName={key} fieldLabel={input_fields[key]} initialValue={vcard ? vcard[key] : ''}/>
              :
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
