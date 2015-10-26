let server = '{{API_LOCATION}}';

// When deploying, api_location gets replaced to the server location.
if (server[0] === '{') {
  server = 'http://localhost'
}

export default {
  api: server + ':3000/'
};