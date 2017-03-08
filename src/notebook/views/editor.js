// @flow
import React from 'react';
import CodeMirrorWrapper from '../components/cell/codemirror';

type Props = {
  children?: React.Element<*>,
  description?: string,
};

const EditorView = (props: Props): React.Element<*> => (
  <div className="input" title={props.description}>
    {props.children}
  </div>
);

export default CodeMirrorWrapper(EditorView);
