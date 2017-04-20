import URI from 'urijs';

export function handleProtocolRequest(uristr) {
  console.log('handleProtocolRequest');
  const uri = new URI(uristr);
  console.log('uri');
  console.log(uristr);
  console.log('first segment');
  const segment = uri.segmentCoded(0);
  console.log(segment);
  console.log('uri query');
  console.log(uri.search(true));
}
