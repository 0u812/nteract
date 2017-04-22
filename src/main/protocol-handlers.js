import URI from 'urijs';
import { getNotebookWindow } from './launch';

export function handleProtocolRequest(uristr) {
  const uri = new URI(uristr);
  const tld = uri.tld();
  if (tld === 'tellurium2') {
    const segment = uri.segmentCoded(0);
    if (segment === 'update-personal-info') {
      const keys = uri.search(true);
      getNotebookWindow().webContents.send('update-personal-info', keys);
    }
  }
}
