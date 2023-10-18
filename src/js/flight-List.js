import {
  loadDynamicContent,
} from './utilities.mjs'

import {
  fetchAndDisplayAirports,
  toggleReturnDate,
  loadCurrencyData,
} from './flightServices.mjs'

import {
  flightCardTemplate,
} from './flightCard.mjs'

loadDynamicContent ();
toggleReturnDate();
let currencyData = [];

// Container where the flight cards will be appended
function handleFlights(flights) {
  const flightsContainer = document.getElementById('flightsContainer');

  // Clear any previous flights
  flightsContainer.innerHTML = '';

  flights.forEach(flight => {
      // Generate the flight card using the template
      const flightCard = flightCardTemplate(flight);

      // Append the card to the container
      flightsContainer.innerHTML += flightCard;
  });
}

// Fetch from sessionStorage
document.addEventListener('DOMContentLoaded', function() {
  const storedFlights = JSON.parse(sessionStorage.getItem('fetchedFlights'));

  if (storedFlights) {
      handleFlights(storedFlights);
  }
});

// Hide/Unhide flights toggle
document.addEventListener('DOMContentLoaded', function() {
  const toggles = document.querySelectorAll('.toggle-flight-details');
  toggles.forEach(toggle => {
      toggle.addEventListener('click', function() {
          const content = this.nextElementSibling;
          if (content.style.display === 'none' || content.style.display === '') {
              content.style.display = 'block';
          } else {
              content.style.display = 'none';
          }
      });
  });
});

// Retrieve searchParameters from sessionStorage
document.addEventListener('DOMContentLoaded', function() {
  const searchParameters = JSON.parse(sessionStorage.getItem('searchParameters'));

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
  }
});

// Add event listener for trip type radio buttons
document.querySelectorAll('input[name="trip-type"]').forEach(radio => {
  radio.addEventListener('change', toggleReturnDate);
});

// Add event listener for source dropdown Airport search
document.getElementById('searchSource').addEventListener('click', function() {
  fetchAndDisplayAirports('sourceAirport', 'airportDropdownSource');
});

// Add event listener for destination dropdown Airport search
document.getElementById('searchDestination').addEventListener('click', function() {
  fetchAndDisplayAirports('destinationAirport', 'airportDropdownDestination');
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

// Load currency data and set up the event listener
loadCurrencyData().then(data => {
  currencyData = data;

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

// Background
document.addEventListener('DOMContentLoaded', function() {
  const images = [
      '/images/backdrop1.jpg',
      '/images/backdrop2.jpg',
      '/images/backdrop3.jpg',
      '/images/backdrop4.jpg',
  ];

  function setBackgroundImageBasedOnTime() {
      const hour = new Date().getHours();
      const mainElement = document.querySelector('main');

      let imageUrl;

      if (hour >= 0 && hour < 6) {
          imageUrl = images[0];
      } else if (hour >= 6 && hour < 12) {
          imageUrl = images[1];
      } else if (hour >= 12 && hour < 18) {
          imageUrl = images[2];
      } else {
          imageUrl = images[3];
      }

      mainElement.style.backgroundImage = `url('${imageUrl}')`;
  }

  // Set the background image when the page loads
  setBackgroundImageBasedOnTime();
});
