import {
  loadDynamicContent,
  setBackgroundImage,
} from './utilities.mjs'

import {
  fetchAndDisplayAirports,
  toggleReturnDate,
  loadCurrencyData,
  fetchFlights,
  API_HOST,
  structureFlightData,
} from './flightServices.mjs'

import {
  flightCardTemplate,
} from './flightCard.mjs'

import {
  renderPagination,
} from './paginationHelper.mjs';

loadDynamicContent ();
toggleReturnDate();
let currencyData = [];
let fetchedFlights = [];
const flightsContainer = document.getElementById('flightsContainer');

// Initialization (Assuming the page starts with the first page)
let currentPage = parseInt(sessionStorage.getItem('currentPage'), 10) || 1;
console.log('Current Page on load:', currentPage);
document.getElementById('searchFlights').click();
let paginationContainer;

// Retrieving and Rendering Pagination on Page Load
document.addEventListener('DOMContentLoaded', function() {
  const h1Tag = document.querySelector('h1');
  paginationContainer = document.createElement('div');
  paginationContainer.className = 'pagination';
  h1Tag.insertAdjacentElement('afterend', paginationContainer);

  const storedCurrentPage = parseInt(sessionStorage.getItem('currentPage'), 10);
  const storedTotalPages = parseInt(sessionStorage.getItem('totalPages'), 10);

  if (storedCurrentPage && storedTotalPages) {
      renderPagination(storedCurrentPage, storedTotalPages, paginationContainer);
  }
  // Event listener for pagination links
  paginationContainer.addEventListener('click', function(event) {
    if (event.target.tagName === 'A') {
        event.preventDefault();
        const pageNumber = parseInt(event.target.dataset.page, 10);
        currentPage = pageNumber;  // Update the currentPage variable
        sessionStorage.setItem('currentPage', currentPage);
        // Trigger the searchFlights click event to fetch data for the new page
        document.getElementById('searchFlights').click();
    }
  });
});

// Helper function to get input values
function getInputValue(id) {
  return document.getElementById(id).value;
}

// Helper function to construct the API URL
function constructApiURL(searchParameters) {
  const {
    sourceCode,
    destinationCode,
    departureDate,
    returnDate,
    itineraryType,
    sortFlights,
    numAdults,
    numSeniors,
    classOfService,
    nonstop,
    currencyCode,
  } = searchParameters;

  const returnDateParam = itineraryType === 'ROUND_TRIP' && returnDate ? `&returnDate=${encodeURIComponent(returnDate)}` : '';
  return `https://${API_HOST}/api/v1/flights/searchFlights?sourceAirportCode=${sourceCode}&destinationAirportCode=${destinationCode}&date=${encodeURIComponent(departureDate)}${returnDateParam}&itineraryType=${itineraryType}&sortOrder=${sortFlights}&numAdults=${numAdults}&numSeniors=${numSeniors}&classOfService=${classOfService}&pageNumber=${currentPage.toString()}&nonstop=${nonstop}&currencyCode=${currencyCode}`;
}

// Event listener for form submission
document.getElementById('searchFlights').addEventListener('click', async function (event) {
  event.preventDefault();  // Prevent form submission

  // Capture input values
  const sourceCode = getInputValue('sourceAirport');
  const destinationCode = getInputValue('destinationAirport');
  const departureDate = getInputValue('departure-date');
  const returnDate = getInputValue('return-date');
  const itineraryType = document.querySelector('input[name="trip-type"]:checked').value;
  const numAdults = getInputValue('numAdults');
  const numSeniors = getInputValue('numSeniors');
  const nonstop = getInputValue('Nonstop');
  const sortFlights = getInputValue('sort-flights');
  const classOfService = getInputValue('cabin-class');
  const currencyCode = getInputValue('currency');

  const searchParameters = {
    sourceCode,
    destinationCode,
    departureDate,
    returnDate: itineraryType === 'ROUND_TRIP' ? returnDate : '',
    itineraryType,
    numAdults,
    numSeniors,
    nonstop,
    sortFlights,
    classOfService,
    currencyCode,
    pageNumber: currentPage.toString(),
  };

  console.log('Search parameters:', searchParameters);

  // Save the search parameters in session storage
  sessionStorage.setItem('searchParameters', JSON.stringify(searchParameters));

  // Construct the API request URL
  const apiURL = constructApiURL(searchParameters);

  try {
    // Fetch new flight data
    // const fetchedFlights = await fetchFlights(apiURL);
    fetchedFlights = await fetchFlights(apiURL);
    console.log('fetchedFlights:', fetchedFlights);
    console.log('Total number of flights:', fetchedFlights.data.totalNumResults);
    console.log('Number of flights in the current response:', fetchedFlights.data.flights.length);

    if (fetchedFlights && fetchedFlights.status === true && Array.isArray(fetchedFlights.data.flights)) {
      const structuredFlights = structureFlightData(fetchedFlights.data.flights, currentPage);
      sessionStorage.setItem('fetchedFlights', JSON.stringify(structuredFlights));

      // Display the new flight data in the DOM
      handleFlights(structuredFlights);

      // Render pagination based on current page and total pages
      const totalPages = Math.ceil(fetchedFlights.data.totalNumResults / fetchedFlights.data.flights.length);
      renderPagination(currentPage, totalPages, paginationContainer);
    } else if (fetchedFlights && fetchedFlights.message) {
      // Handle error messages from the API
      alert(fetchedFlights.message[0].returnDate || 'An error occurred.');
    } else {
      console.error('Unexpected flight data format:', fetchedFlights);
    }
  } catch (error) {
    console.error('Error fetching flight data:', error);
  }
});

// Container where the flight cards will be appended
function handleFlights(flights) {

  // Clear any previous flights
  // flightsContainer.innerHTML = '';

  flights.forEach((flight, index) => {
      // Generate the flight card using the template
      const flightCard = flightCardTemplate(flight, index);

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

// Background Image
document.addEventListener('DOMContentLoaded', function() {
  setBackgroundImage('main');
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
