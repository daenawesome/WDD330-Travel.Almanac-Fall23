import {
  loadDynamicContent,
  setBackgroundImage,
} from './utilities.mjs'

import {
  toggleReturnDate,
  loadCurrencyData,
} from './flightUtilities.mjs'

import {
  fetchAndDisplayAirports,
  handleFlights,
} from './flightServices.mjs'

import {
  addToFavorites,
  removeFromFavorites,
} from './flightCard.mjs'

loadDynamicContent ();
toggleReturnDate();
let currencyData = [];

// Load currency data and set up the event listener
loadCurrencyData().then(data => {
currencyData = data;

const flightsContainer = document.getElementById('flightsContainer');

window.addEventListener('load', function() {
  console.log('Window loaded');

  const searchParameters = JSON.parse(sessionStorage.getItem('searchParameters'));
  console.log('Retrieved searchParameters:', searchParameters);

  if (searchParameters) {
    // Populate form elements with the stored values
    document.getElementById('sourceAirport').value = searchParameters.sourceCode || '';
    document.getElementById('destinationAirport').value = searchParameters.destinationCode || '';
    document.getElementById('departure-date').value = searchParameters.departureDate || '';

    // Handle the itinerary type radio buttons
    if (searchParameters.itineraryType === 'ROUND_TRIP') {
      document.querySelector('input[name="trip-type"][value="ROUND_TRIP"]').checked = true;
    } else {
        document.querySelector('input[name="trip-type"][value="ONE_WAY"]').checked = true;
    }

    // Handle roundtrip value
    if (searchParameters.itineraryType === 'ROUND_TRIP') {
        document.getElementById('return-date').value = searchParameters.returnDate || '';
    }

    document.getElementById('currency').value = searchParameters.currencyCode || '';
    console.log('Populating form fields now...');
  }
});

// Hide/Unhide flights toggle
flightsContainer.addEventListener('click', function(event) {
  if (event.target.classList.contains('toggle-flight-details')) {
      const content = event.target.nextElementSibling;
      if (content.style.display === 'none' || content.style.display === '') {
          content.style.display = 'block';
      } else {
          content.style.display = 'none';
      }
  }
});
// Add event listener for trip type radio buttons
document.querySelectorAll('input[name="trip-type"]').forEach(radio => {
radio.addEventListener('change', toggleReturnDate);
});

// Event listener for the Airports button
document.getElementById('searchSource').addEventListener('click', function(event) {
  // Prevent the form from submitting
  event.preventDefault();
  // Call the function to fetch and display airports
  fetchAndDisplayAirports('sourceAirport', 'airportDropdownSource');
});
// Event listener for the Airports button
document.getElementById('searchDestination').addEventListener('click', function(event) {
  event.preventDefault();
  // Call the function to fetch and display airports
  fetchAndDisplayAirports('destinationAirport', 'airportDropdownDestination');
});
// Event listener for the Airports button for currency update
document.getElementById('searchSource').addEventListener('click', function() {
const locationInput = document.getElementById('sourceAirport').value.toLowerCase();

// Search for a matching location in the JSON data
const matchingCountry = currencyData.find(item =>
    item.countryName.toLowerCase() === locationInput ||
    item.capital.toLowerCase() === locationInput
);

// Update the currency dropdown if a match is found
if (matchingCountry) {
    document.getElementById('currency').value = matchingCountry.currencyCode;
} else {
    document.getElementById('currency').value = 'USD';  // Default to USD if no match is found
}
});

// Event listener for the Airports button
document.getElementById('searchSource').addEventListener('click', function() {
    const locationInput = document.getElementById('sourceAirport').value.toLowerCase();

    // Search for a matching location in the JSON data
    const matchingCountry = currencyData.find(item =>
        item.countryName.toLowerCase() === locationInput ||
        item.capital.toLowerCase() === locationInput
    );

    // Update the currency dropdown if a match is found
    if (matchingCountry) {
        document.getElementById('currency').value = matchingCountry.currencyCode;
    } else {
        document.getElementById('currency').value = 'USD';  // Default to USD if no match is found
    }
});
});

// Background Image
document.addEventListener('DOMContentLoaded', function() {
setBackgroundImage('main');
});

// Event listener for the favorite button
document.addEventListener('click', function(event) {
  if (event.target.matches('.favorite-button')) {
    console.log(event.target);

    const uniqueID = event.target.getAttribute('data-unique-id');

    console.log('uniqueID clicked:', uniqueID);

    // Retrieve the list of flights from storage
    const allFlights = JSON.parse(localStorage.getItem('fetchedFlights')) || [];

    console.log('fetchedFlights:', allFlights);

    // Find the specific flight with the uniqueID
    const flightData = allFlights.find(flight => flight.uniqueID === uniqueID);

    if (!flightData) {
      console.error('Flight not found');
      return;
    }

    // Check the current state of the button (favorited or not) to decide the action.
    if (event.target.textContent === '\u{1F90D} Add to Favorites') {
      addToFavorites(flightData);  // Pass the whole flight data object
      event.target.textContent = '\u{1F49A} Remove from Favorites';  // Indicate it's a favorite
    } else {
      removeFromFavorites(uniqueID);
      event.target.textContent = '\u{1F90D} Add to Favorites';  // Indicate it's no longer a favorite
    }
  }
});




// Fetch from Storage
document.addEventListener('DOMContentLoaded', function() {
  const storedFlights = JSON.parse(localStorage.getItem('fetchedFlights'));

  if (storedFlights) {
      handleFlights(storedFlights);
  }
});
