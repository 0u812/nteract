import * as constants from './constants';

export function newKernel(kernelSpec, cwd) {
  return {
    type: constants.LAUNCH_KERNEL,
    kernelSpec,
    cwd,
  };
}

export function newKernelByName(kernelSpecName, cwd) {
  return {
    type: constants.LAUNCH_KERNEL_BY_NAME,
    kernelSpecName,
    cwd,
  };
}

export function setNotebookKernelInfo(kernelInfo) {
  return {
    type: constants.SET_KERNEL_INFO,
    kernelInfo,
  };
}

export function setExecutionState(executionState) {
  return {
    type: constants.SET_EXECUTION_STATE,
    executionState,
  };
}

export function updateCellSource(id, source) {
  return {
    type: constants.UPDATE_CELL_SOURCE,
    id,
    source,
  };
}

export function clearOutputs(id) {
  return {
    type: constants.CLEAR_OUTPUTS,
    id,
  };
}

export function moveCell(id, destinationId, above) {
  return {
    type: constants.MOVE_CELL,
    id,
    destinationId,
    above,
  };
}

export function removeCell(id) {
  return {
    type: constants.REMOVE_CELL,
    id,
  };
}

export function highlightCells(ids, status) {
  return {
    type: constants.HIGHLIGHT_CELLS,
    ids,
    status,
  };
}

export function createCellAfter(cellType, id, source) {
  return {
    type: constants.NEW_CELL_AFTER,
    source: source || '',
    cellType,
    id,
  };
}

export function createCellBefore(cellType, id, source) {
  return {
    type: constants.NEW_CELL_BEFORE,
    source: source || '',
    cellType,
    id,
  };
}

export function createCellAppend(cellType, source) {
  return {
    type: constants.NEW_CELL_APPEND,
    source: source || '',
    cellType,
  };
}

export function mergeCellAfter(id) {
  return {
    type: constants.MERGE_CELL_AFTER,
    id,
  };
}

export function updateCellExecutionCount(id, count) {
  return {
    type: constants.UPDATE_CELL_EXECUTION_COUNT,
    id,
    count,
  };
}

export function changeOutputVisibility(id) {
  return {
    type: constants.CHANGE_OUTPUT_VISIBILITY,
    id,
  };
}

export function changeInputVisibility(id) {
  return {
    type: constants.CHANGE_INPUT_VISIBILITY,
    id,
  };
}

export function updateCellPagers(id, pagers) {
  return {
    type: constants.UPDATE_CELL_PAGERS,
    id,
    pagers,
  };
}

export function updateCellStatus(id, status) {
  return {
    type: constants.UPDATE_CELL_STATUS,
    id,
    status,
  };
}

export function focusCell(id) {
  return {
    type: constants.FOCUS_CELL,
    id,
  };
}

export function focusNextCell(id, createCellIfUndefined, shouldWrap) {
  const wrap = shouldWrap || false;
  return {
    type: constants.FOCUS_NEXT_CELL,
    id,
    createCellIfUndefined,
    wrap,
  };
}

export function focusPreviousCell(id, shouldWrap) {
  const wrap = shouldWrap || false;
  return {
    type: constants.FOCUS_PREVIOUS_CELL,
    id,
    wrap,
  };
}

export function focusCellEditor(id) {
  return {
    type: constants.FOCUS_CELL_EDITOR,
    id,
  };
}

export function focusNextCellEditor(id, shouldWrap) {
  const wrap = shouldWrap || false;
  return {
    type: constants.FOCUS_NEXT_CELL_EDITOR,
    id,
    wrap,
  };
}

export function focusPreviousCellEditor(id, shouldWrap) {
  const wrap = shouldWrap || false;
  return {
    type: constants.FOCUS_PREVIOUS_CELL_EDITOR,
    id,
    wrap,
  };
}

export function toggleStickyCell(id) {
  return {
    type: constants.TOGGLE_STICKY_CELL,
    id,
  };
}

export function overwriteMetadata(field, value) {
  return {
    type: constants.OVERWRITE_METADATA_FIELD,
    field,
    value,
  };
}

export function deleteMetadata(field) {
  return {
    type: constants.DELETE_METADATA_FIELD,
    field,
  };
}

export const killKernel = {
  type: constants.KILL_KERNEL,
};

export const interruptKernel = {
  type: constants.INTERRUPT_KERNEL,
};

export function findKernelsReply(specs, uid) {
  return {
    type: constants.FIND_KERNELS_REPLY,
    specs,
    uid,
  };
}

export function findDialog() {
  return {
    type: constants.FIND_DIALOG,
  };
}

export function findInNotebook(find_string, regex, match_case) {
  return {
    type: constants.FIND_IN_NOTEBOOK,
    find_string,
    regex,
    match_case,
  };
}

export function replaceInNotebook(find_string, replace_string, regex, match_case) {
  return {
    type: constants.REPLACE_IN_NOTEBOOK,
    find_string,
    replace_string,
    regex,
    match_case
  };
}

export function setCellSource(cell_id, source) {
  return {
    type: constants.SET_CELL_SOURCE,
    cell_id,
    source,
  };
}

export function setFocusedCellEditor(editor) {
  return {
    type: constants.SET_FOCUSED_CELL_EDITOR,
    editor,
  };
}

export function setNotificationSystem(notificationSystem) {
  return {
    type: constants.SET_NOTIFICATION_SYSTEM,
    notificationSystem,
  };
}

export function setForwardCheckpoint(documentState) {
  return {
    type: constants.SET_FORWARD_CHECKPOINT,
    documentState,
  };
}

export function setBackwardCheckpoint(documentState, clearFutureStack) {
  return {
    type: constants.SET_BACKWARD_CHECKPOINT,
    documentState,
    clearFutureStack,
  };
}

export function copyCell(id) {
  return {
    type: constants.COPY_CELL,
    id,
  };
}

export function cutCell(id) {
  return {
    type: constants.CUT_CELL,
    id,
  };
}

export function pasteCell() {
  return {
    type: constants.PASTE_CELL,
  };
}

export function changeCellType(id, to) {
  return {
    type: constants.CHANGE_CELL_TYPE,
    id,
    to,
  };
}

export function changeCodeCellType(id, to) {
  return {
    type: constants.CHANGE_CODE_CELL_TYPE,
    id,
    to,
  };
}

export function setGithubToken(githubToken) {
  return {
    type: constants.SET_GITHUB_TOKEN,
    githubToken,
  };
}

export function setConfigKey(key, value) {
  return {
    type: constants.SET_CONFIG_KEY,
    key,
    value,
  };
}

export function setTheme(theme) {
  return setConfigKey('theme', theme);
}

export function setCursorBlink(value) {
  return setConfigKey('cursorBlinkRate', value);
}

export function toggleOutputExpansion(id) {
  return {
    type: constants.TOGGLE_OUTPUT_EXPANSION,
    id,
  };
}

/**
 * Execute Cell action.
 *
 * @param {String} id - Universally Unique Identifier of cell to be executed.
 * @param {Object} source - Source code to executed.
 * @return {Object} executeCellAction - Action to be dispatched to reducer.
 */
export function executeCell(id, source) {
  return {
    type: constants.EXECUTE_CELL,
    id,
    source,
  };
}

/**
 * Import file action.
 *
 * @param {String} id - Universally Unique Identifier of cell to create new cell next to (empty for append).
 * @param {String} path - The path to the file to import.
 * @param {String} content - The raw content of the file (exclusive with path).
 * @param {String} filetype - Source file type to import.
 * @param {String} position - Position relative to cell: can be 'above', 'inside', or 'below'
 * @return {Object} importFileIntoNotebookAction - Action to be dispatched to convertFileEpic.
 */
export function importFileIntoNotebook(id, path, content, filetype, position) {
  return {
    type: constants.CONVERT_FILE,
    id,
    path,
    content,
    filetype,
    position
  };
}


export function changeFilename(filename) {
  return {
    type: constants.CHANGE_FILENAME,
    filename
  };
}

export function save(filename, notebook) {
  return {
    type: constants.SAVE,
    filename,
    notebook
  };
}

export function saveAs(filename, notebook) {
  return {
    type: constants.SAVE_AS,
    filename,
    notebook };
}

export function saveFileFromString(source_format, target_format, source_str, path) {
  return {
    type: constants.SAVE_FILE_FROM_STRING,
    source_format,
    target_format,
    source_str,
    path
  };
}

export function doneSaving() {
  return {
    type: constants.DONE_SAVING
  };
}
