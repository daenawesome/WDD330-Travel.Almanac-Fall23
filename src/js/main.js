import {
  loadDynamicContent,
} from './utilities.mjs'

import {
  fetchAndDisplayAirports,
  toggleReturnDate,
  loadCurrencyData,
  fetchFlights,
  structureFlightData,
} from './flightServices.mjs'

loadDynamicContent ();
toggleReturnDate();
let currencyData = [];

// Constants for DOM elements
const elements = {
  sourceInput: document.getElementById('sourceAirport'),
  destinationInput: document.getElementById('destinationAirport'),
  departureDateInput: document.getElementById('departure-date'),
  returnDateInput: document.getElementById('return-date'),
  searchButton: document.getElementById('searchFlights'),
  // Using arrow functions to ensure these values are fetched only when called
  itineraryType: () => document.querySelector('input[name="trip-type"]:checked').value,
  currencyCode: () => document.getElementById('currency').value
};

// Add event listener to the search button
elements.searchButton.addEventListener('click', async function() {

  // Destructuring elements for easier access
  const {
      sourceInput,
      destinationInput,
      departureDateInput,
      returnDateInput,
      itineraryType,
      currencyCode
  } = elements;

  // Construct search parameters
  const searchParameters = {
      sourceCode: sourceInput.value,
      destinationCode: destinationInput.value,
      departureDate: departureDateInput.value,
      returnDate: (itineraryType() === 'ROUND_TRIP') ? returnDateInput.value : '',
      itineraryType: itineraryType(),
      sortOrder: 'ML_BEST_VALUE',
      classOfService: 'ECONOMY',
      currencyCode: currencyCode()
  };

  // Construct the URL for API request
  const baseURL = `https://tripadvisor16.p.rapidapi.com/api/v1/flights/searchFlights`;
  const queryParams = new URLSearchParams({
      sourceAirportCode: searchParameters.sourceCode,
      destinationAirportCode: searchParameters.destinationCode,
      date: searchParameters.departureDate,
      itineraryType: searchParameters.itineraryType,
      sortOrder: searchParameters.sortOrder,
      numAdults: '1',
      numSeniors: '0',
      classOfService: searchParameters.classOfService,
      pageNumber: '1',
      currencyCode: searchParameters.currencyCode
  });
  if (searchParameters.itineraryType === 'ROUND_TRIP') {
      queryParams.append('returnDate', searchParameters.returnDate);
  }
  const url = `${baseURL}?${queryParams.toString()}`;
  sessionStorage.setItem('searchParameters', JSON.stringify(searchParameters));

  // Fetch flight data using the constructed URL
  const result = await fetchFlights(url);
  if (result && result.data && result.data.flights) {

      // Extract and structure the flight data
      const structuredFlights = structureFlightData(result.data.flights);
      sessionStorage.setItem('fetchedFlights', JSON.stringify(structuredFlights));

      window.location.href = './pages-flight/flight-list.html';
  } else {
      console.error('No flights found or unexpected data structure:', result);
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
