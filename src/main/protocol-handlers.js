import URI from 'urijs';
import { launch, getNotebookWindow } from './launch';

export function handleProtocolRequest(uristr) {
  const uri = new URI(uristr);
  const tld = uri.tld();
  if (tld === 'tellurium2') {
    const segment = uri.segmentCoded(0);
    if (segment === 'update-personal-info') {
      const keys = uri.search(true);
      const notebookWindow = getNotebookWindow();
      if (notebookWindow) {
        notebookWindow.webContents.send('update-personal-info', keys);
      }
    } else if (segment === 'launch') {
      const keys = uri.search(true);
      if ('url' in keys) {
        const notebook_url = keys['url'];
        console.log('Open notebook at ', notebook_url);
        launch(notebook_url);
      }
    }
  }
}
