// @flow
/* eslint-disable class-methods-use-this */
import React, { PureComponent } from 'react';
import Rx from 'rxjs/Rx';
import CodeMirror from 'react-codemirror';
import CM from 'codemirror';

import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/hint/anyword-hint';
import 'codemirror/addon/search/search';
import 'codemirror/addon/search/searchcursor';
import 'codemirror/addon/search/match-highlighter.js';
import 'codemirror/addon/search/matchesonscrollbar.js';
import 'codemirror/addon/edit/matchbrackets';
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/addon/dialog/dialog';
import 'codemirror/addon/comment/comment.js';
import 'codemirror/addon/selection/mark-selection.js';

import 'codemirror/mode/python/python';
import 'codemirror/mode/ruby/ruby';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/css/css';
import 'codemirror/mode/julia/julia';
import 'codemirror/mode/r/r';
import 'codemirror/mode/clike/clike';
import 'codemirror/mode/shell/shell';
import 'codemirror/mode/sql/sql';
import 'codemirror/mode/markdown/markdown';
import 'codemirror/mode/gfm/gfm';

const oldFindNext = CM.commands.findNext;
CM.commands.findNext = (editor) => {
  const before = editor.getCursor();
  oldFindNext(editor);
  const after = editor.getCursor();

  if (before.line > after.line ||
      (before.line === after.line && before.char > after.char) ) {
    CM.signal(editor, 'wrapNext');
  }
};

const oldFindPrev = CM.commands.findPrev;
CM.commands.findPrev = (editor) => {
  const before = editor.getCursor();
  oldFindPrev(editor);
  const after = editor.getCursor();

  if (before.line < after.line ||
      (before.line === after.line && before.char < after.char) ) {
    CM.signal(editor, 'wrapPrev');
  }
};

import { findInNotebook } from '../../../actions';

CM.keyMap.default["Ctrl-H"] = "replace";
CM.keyMap.default["Cmd-H"] = "replace";
delete CM.keyMap.default["Shift-Ctrl-F"];

import './codemirror-ipython';
import excludedIntelliSenseTriggerKeys from './excludedIntelliSenseKeys';
import { codeComplete, pick } from './complete';

type WrapperProps = {
  id: string,
  input: any,
  editorFocused: boolean,
  setFocusedEditor: (editor) => void,
  cellFocused: boolean,
  completion: boolean,
  focusAbove: () => void,
  focusBelow: () => void,
  wrapNext: () => void,
  wrapPrev: () => void,
  theme: string,
  channels: any,
  cursorBlinkRate: number,
  executionState: 'idle' | 'starting' | 'not connected',
  language: string,
  onChange: (text: string) => void,
  onFocusChange: (focused: boolean) => void,
  searchText: string,
}

type FunctionalComponent<P> = (props: P) => React.Element<*>
type ClassComponent<P> = Class<React.Component<void, P, void>>

type CodeMirrorHOC = (
  E: ClassComponent<*> | FunctionalComponent<*>,
  C?: { [key: string]: any } | null
) => ClassComponent<WrapperProps>

const CodeMirrorWrapper: CodeMirrorHOC = (EditorView, customOptions = null) =>
  class CodeMirrorEditor extends PureComponent<void, WrapperProps, void> {
    codemirror: Object;
    getCodeMirrorOptions: (p: WrapperProps) => Object;
    goLineUpOrEmit: (editor: Object) => void;
    goLineDownOrEmit: (editor: Object) => void;
    hint: (editor: Object, cb: Function) => void;

    static contextTypes = {
      store: React.PropTypes.object,
    };

    constructor(): void {
      super();

      this.hint = this.completions.bind(this);
      this.hint.async = true;
      this.clearSearchInNotebook = this.clearSearchInNotebook.bind(this);
    }

    componentDidMount(): void {
      const { editorFocused, executionState, focusAbove, focusBelow, wrapNext, wrapPrev } = this.props;
      const cm = this.codemirror.getCodeMirror();

      // On first load, if focused, set codemirror to focus
      if (editorFocused) {
        this.codemirror.focus();
        this.props.setFocusedEditor(cm);
      }

      cm.on('topBoundary', focusAbove);
      cm.on('bottomBoundary', focusBelow);
      cm.on('wrapNext', wrapNext);
      cm.on('wrapPrev', wrapPrev);
//       this.codemirror.commands.findNext = this.findNextOrEmit;
//       cm.commands.findNext = this.findNextOrEmit;
//       cm.commands.findNext1 = null;
//       cm.commands.xyz = null;

      const keyupEvents = Rx.Observable.fromEvent(cm, 'keyup', (editor, ev) => ({ editor, ev }));

      keyupEvents
        .switchMap(i => Rx.Observable.of(i))
        .subscribe(({ editor, ev }) => {
          const cursor = editor.getDoc().getCursor();
          const token = editor.getTokenAt(cursor);

          if (!editor.state.completionActive &&
              !excludedIntelliSenseTriggerKeys[(ev.keyCode || ev.which).toString()] &&
              (token.type === 'tag' || token.type === 'variable' || token.string === ' ' ||
               token.string === '<' || token.string === '/' || token.string === '.') && executionState === 'idle') {
            editor.execCommand('autocomplete', { completeSingle: false });
          }
        });
    }

    componentDidUpdate(prevProps: WrapperProps): void {
      const cm = this.codemirror.getCodeMirror();
      const { cursorBlinkRate, editorFocused, theme, searchText } = this.props;

      if (prevProps.theme !== theme) {
        cm.refresh();
      }

      if (prevProps.searchText !== searchText) {
        if (searchText && searchText.length > 0) {
//           cm.markText({line: 0, ch: 0}, {line: 0, ch: 4}, {className: "text-highlight-background"});
//           cm.addOverlay({token: (stream) => {
//               if (stream.match(searchText))
//                 return 'matchhighlight';
//               stream.next();
//               stream.skipTo(searchText.charAt(0)) || stream.skipToEnd();
//             }
//           });
          const queryCaseInsensitive = (query) => (typeof query == "string" && query == query.toLowerCase());
          if (cm.state.search && cm.state.search.overlay) {
            cm.removeOverlay(cm.state.search.overlay, queryCaseInsensitive(searchText));
          }

          let query;
          const caseInsensitive = false;
          // https://codemirror.net/addon/search/search.js
          if (true) // is string query
            query = new RegExp(searchText.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"), caseInsensitive ? "gi" : "g");
          else // regex query
            query = new RegExp(searchText.source, searchText.ignoreCase ? "gi" : "g");
          cm.state.search = {
            posFrom: null,
            posTo: null,
            lastQuery: query,
            query: query,
            queryText: searchText,
            overlay: {token: (stream) => {
              query.lastIndex = stream.pos;
              const match = query.exec(stream.string);
              if (match && match.index == stream.pos) {
                stream.pos += match[0].length || 1;
                return "searching";
              } else if (match) {
                stream.pos = match.index;
              } else {
                stream.skipToEnd();
              }
            }},
          };
          cm.addOverlay(cm.state.search.overlay);
//           cm.execCommand('findPersistent');
//           cm.execCommand('findPersistentNext');
//           cm.execCommand('find');
          cm.state.search.posFrom = cm.state.search.posTo = cm.getCursor();
          cm.execCommand('findNext');
        } else {
          // clear the search
          cm.execCommand('clearSearch');
        }
      }

      if (prevProps.editorFocused !== editorFocused) {
        if (editorFocused) {
          this.codemirror.focus();
          this.props.setFocusedEditor(cm);
        } else {
          cm.getInputField().blur();
        }
      }

      if (prevProps.cursorBlinkRate !== cursorBlinkRate) {
        cm.setOption('cursorBlinkRate', cursorBlinkRate);
        if (editorFocused) {
          // code mirror doesn't change the blink rate immediately, we have to
          // move the cursor, or unfocus and refocus the editor to get the blink
          // rate to update - so here we do that (unfocus and refocus)
          cm.getInputField().blur();
          cm.focus();
        }
      }
    }

    completions(editor: Object, callback: Function): void {
      const { completion, channels } = this.props;
      if (completion) {
        codeComplete(channels, editor)
          .subscribe(callback);
      }
    }

    getCodeMirrorOptions({ cursorBlinkRate, language }: WrapperProps): Object {
      return {
        autoCloseBrackets: true,
        mode: language || 'python',
        lineNumbers: false,
        lineWrapping: true,
        matchBrackets: true,
        theme: 'composition',
        autofocus: false,
        hintOptions: {
          hint: this.hint,
          completeSingle: false, // In automatic autocomplete mode we don't want override
          extraKeys: {
            Right: pick,
          },
        },
        extraKeys: {
          'Ctrl-Space': 'autocomplete',
          Tab: editor => editor.execCommand('insertSoftTab'),
          Up: this.goLineUpOrEmit,
          Down: this.goLineDownOrEmit,
          'Cmd-/': 'toggleComment',
          'Ctrl-/': 'toggleComment',
          'Esc': this.clearSearchInNotebook,
        },
        indentUnit: 4,
        cursorBlinkRate,
        ...customOptions
      };
    }

    goLineDownOrEmit(editor: Object): void {
      const cursor = editor.getCursor();
      const lastLineNumber = editor.lastLine();
      const lastLine = editor.getLine(lastLineNumber);
      if (cursor.line === lastLineNumber &&
          cursor.ch === lastLine.length &&
          !editor.somethingSelected()) {
        CM.signal(editor, 'bottomBoundary');
      } else {
        editor.execCommand('goLineDown');
      }
    }

    goLineUpOrEmit(editor: Object): void {
      const cursor = editor.getCursor();
      if (cursor.line === 0 && cursor.ch === 0 && !editor.somethingSelected()) {
        CM.signal(editor, 'topBoundary');
      } else {
        editor.execCommand('goLineUp');
      }
    }

    clearSearchInNotebook(editor: Object): void {
      this.context.store.dispatch(findInNotebook());
      // clear search in case it was a local in-cell search
      editor.execCommand('clearSearch');
    }

    render(): React.Element<*> {
      const { input, onChange, onFocusChange } = this.props;
      const options = this.getCodeMirrorOptions(this.props);

      return (
        <EditorView {...this.props}>
          <CodeMirror
            value={input}
            ref={(el) => { this.codemirror = el; }}
            className="cell_cm"
            options={options}
            onChange={onChange}
            onClick={() => {this.codemirror.focus(); this.props.setFocusedEditor(this.codemirror.getCodeMirror());}}
            onFocusChange={onFocusChange}
          />
        </EditorView>
      );
    }
  };

export default CodeMirrorWrapper;
