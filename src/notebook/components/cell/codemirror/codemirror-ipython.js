// https://github.com/nteract/nteract/issues/389
import CodeMirror from 'codemirror';

import 'codemirror/mode/meta';
import 'codemirror/mode/python/python';

CodeMirror.defineMode('ipython', (conf, parserConf) => {
  const ipythonConf = Object.assign({}, parserConf, {
    name: 'python',
    singleOperators: new RegExp('^[\\+\\-\\*/%&|@\\^~<>!\\?]'),
    identifiers: new RegExp('^[_A-Za-z\u00A1-\uFFFF][_A-Za-z0-9\u00A1-\uFFFF]*'), // Technically Python3
  });
  return CodeMirror.getMode(conf, ipythonConf);
}, 'python');

CodeMirror.defineMIME('text/x-ipython', 'ipython');

// omex

function wordRegexp(words) {
  return new RegExp('^((' + words.join(')|(') + '))\\b');
}

const wordOperators = wordRegexp(['a', 'is']);
const commonKeywords = [
  // antimony
  'model', 'end', 'species', 'var', 'const', 'compartment', 'substanceOnly', 'function', 'unit',
  // phrasedml
  'simulate', 'run', 'repeat', 'plot', 'report', 'for', 'in', 'with'
  ];
const commonBuiltins = [];

CodeMirror.defineMode('omex', function() {
  const myKeywords = commonKeywords, myBuiltins = commonBuiltins;

  const keywords = wordRegexp(myKeywords);
  const builtins = wordRegexp(myBuiltins);
  const identifiers = /^[_A-Za-z\u00A1-\uFFFF][_A-Za-z0-9\u00A1-\uFFFF]*/;
  const boundary_species = /^\$[_A-Za-z\u00A1-\uFFFF][_A-Za-z0-9\u00A1-\uFFFF]*/;

  return {
    startState: function() {return {inString: false};},
    token: function(stream, state) {
      // Handle comments
      if (!state.inString && (stream.peek() == '#' || stream.match('//'))) {
        stream.skipToEnd();
        return 'comment';
      }

      // Handle line magics
      if (!state.inString && (stream.peek() == '%')) {
        stream.skipToEnd();
        return 'string';
      }

      // Handle strings
      if (!state.inString && stream.peek() == '"') {
        stream.next();            // Skip quote
        state.inString = true;    // Update state
      }

      if (state.inString) {
        if (stream.skipTo('"')) { // Quote found on this line
          stream.next();          // Skip quote
          state.inString = false; // Clear flag
        } else {
          stream.skipToEnd();    // Rest of line is string
        }
        return 'string';          // Token style
      }

      // Handle Number Literals
      if (stream.match(/^[0-9\.]/, false)) {
        let floatLiteral = false;
        // Floats
        if (stream.match(/^[\d_]*\.\d+(e[\+\-]?\d+)?/i)) { floatLiteral = true; }
        if (stream.match(/^[\d_]+\.\d*/)) { floatLiteral = true; }
        if (stream.match(/^\.\d+/)) { floatLiteral = true; }
        if (floatLiteral) {
          // Float literals may be 'imaginary'
          stream.eat(/J/i);
          return 'number';
        }
        // Integers
        let intLiteral = false;
        // Hex
        if (stream.match(/^0x[0-9a-f_]+/i)) intLiteral = true;
        // Binary
        if (stream.match(/^0b[01_]+/i)) intLiteral = true;
        // Octal
        if (stream.match(/^0o[0-7_]+/i)) intLiteral = true;
        // Decimal
        if (stream.match(/^[1-9][\d_]*(e[\+\-]?[\d_]+)?/)) {
          // Decimal literals may be 'imaginary'
          stream.eat(/J/i);
          // TODO - Can you have imaginary longs?
          intLiteral = true;
        }
        // Zero by itself with no other piece of number.
        if (stream.match(/^0(?![\dx])/i)) intLiteral = true;
        if (intLiteral) {
          // Integer literals may be 'long'
          stream.eat(/L/i);
          return 'number';
        }
      }

      // Handle keywords
      if (stream.match(keywords)) {
        return 'keyword';
      }

      // Handle identifiers
      if (stream.match(identifiers)) {
        stream.eatSpace()
        if (stream.peek() == ':') {
          // reaction
          return 'def'
        }
        return 'variable';
      }
      if (stream.match(boundary_species)) {
        return 'variable-2';
      }

      // Handle reaction arrows
      if (stream.match('->') || stream.match('=>')) {
        return 'operator';
      }

      // Handle operators
      if (stream.match(/[*/+-]/)) {
        return 'operator';
      }

      stream.next();
      return null; // Unstyled token
    }
  };
});

CodeMirror.registerHelper('hintWords', 'antimony', commonKeywords.concat(commonBuiltins));
