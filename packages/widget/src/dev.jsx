import './main.jsx';

window.DigitalBridge.mount(document.getElementById('root'), {
  api: 'http://localhost:3000/api',
  assets: 'http://localhost:3000',
  lang: 'en',
});
