import {
  loadDynamicContent,
  setBackgroundImage,
} from './utilities.mjs'

loadDynamicContent ();

// Background Image
document.addEventListener('DOMContentLoaded', function() {
  setBackgroundImage('main');
});
