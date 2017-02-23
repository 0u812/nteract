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

const input_fields = {
  first_name: 'First Name',
  last_name: 'Last Name',
  email: 'Email',
  organization: 'Organization',
  orcid: 'ORCID'
}

class App extends React.Component {
   render() {
      return (
        <div>
          <VCard>
            {Object.keys(input_fields).map((key) =>
              <VCardField fieldName={input_fields[key]}/>)}
          </VCard>
          <br/>
          <div className='buttonbar'>
            <span className='diagbutton keep fadein octicon octicon-check'/>
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
