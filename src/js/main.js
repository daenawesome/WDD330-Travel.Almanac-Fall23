import {
  loadDynamicContent,
  setBackgroundImage,
} from './utilities.mjs'

loadDynamicContent ();

// Background Image
document.addEventListener('DOMContentLoaded', function() {
  setBackgroundImage('main');
});

// Function to close toast and hide overlay
function closeToast() {
  var toast = document.getElementById('toast');
  var overlay = document.getElementById('overlay');
  toast.style.visibility = 'hidden';
  overlay.style.display = 'none';
}

function showToast(serviceName) {
  var toast = document.getElementById('toast');
  var overlay = document.getElementById('overlay');

  toast.innerHTML = '';

  var message = document.createElement('div');

  message.innerHTML = '<span class="notice">🚧 Service Under Construction 🚧</span>' +
                      '<br>' +
                      '<h3>Dear valued user,</h3>' +
                      '<br>' +
                      '<p>We\'re currently in the midst of refining and enhancing the ' + serviceName + ' service to ensure it meets the high standards of convenience and satisfaction that you expect and deserve.</p>' +
                      '<p>In the meantime, we invite you to explore and utilize our "Search Flights" feature, designed to offer you seamless travel planning experiences.</p>' +
                      '<p>Thank you for your understanding and patience. Your satisfaction is our priority, and we\'re excited to share the improvements with you soon!</p>' +
                      '<br>' +
                      '<h3>From Team Travel Almanac</h3>' +
                      '<p>(fake company & imaginary team)</p>' +
                      '<br>' +
                      '<span class="notice">🚧 Service Under Construction 🚧</span>';

  // close button
  var closeButton = document.createElement('span');
  closeButton.textContent = '×';
  closeButton.classList.add('close-toast');
  closeButton.addEventListener('click', closeToast);

  // Append message and close button to the toast div
  toast.appendChild(message);
  toast.appendChild(closeButton);

  // Show toast and overlay
  overlay.style.display = 'block';
  toast.style.visibility = 'visible';

  // After 3 mins, close toast
  setTimeout(function() {
      closeToast();
  }, 180000);
}

// Event listeners for buttons
document.getElementById('searchCruisesBtn').onclick = function(){ showToast('Cruises'); }
document.getElementById('searchRestaurantsBtn').onclick = function(){ showToast('Restaurants'); }
document.getElementById('searchRentalCarsBtn').onclick = function(){ showToast('Rental Cars'); }
document.getElementById('overlay').addEventListener('click', closeToast);
