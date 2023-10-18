import {
  loadDynamicContent,
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

loadDynamicContent ();
toggleReturnDate();
let currencyData = [];
const flightsContainer = document.getElementById('flightsContainer');

const h1Tag = document.querySelector('h1');
const paginationContainer = document.createElement('div');
paginationContainer.className = 'pagination';
h1Tag.insertAdjacentElement('afterend', paginationContainer);

// Initialization (Assuming the page starts with the first page)
let currentPage = parseInt(sessionStorage.getItem('currentPage'), 10) || 1;
console.log('Current Page on load:', currentPage);
document.getElementById('searchFlights').click();


// Render Pagination Function
function renderPagination(page, totalPg) {
  paginationContainer.innerHTML = '';

  let pages = [1];
  for (let i = page - 2; i <= page + 2; i++) {
      if (i > 1 && i < totalPg) {
          pages.push(i);
      }
  }
  if (totalPg !== 1) {
      pages.push(totalPg);
  }

  if (page > 1) {
      let prevLink = document.createElement('a');
      prevLink.href = '#';
      prevLink.innerText = 'Previous';
      prevLink.dataset.page = page - 1;
      paginationContainer.appendChild(prevLink);
  }

  let lastPageRendered = 0;
  for (let p of pages) {
      if (lastPageRendered < p - 1) {
          let ellipsis = document.createElement('span');
          ellipsis.innerText = '...';
          paginationContainer.appendChild(ellipsis);
      }

      let pageLink = document.createElement('a');
      pageLink.href = '#';
      pageLink.innerText = p;
      pageLink.dataset.page = p;

      if (p === page) {
          pageLink.classList.add('current');
      }

      paginationContainer.appendChild(pageLink);
      lastPageRendered = p;
  }

  if (page < totalPg) {
      let nextLink = document.createElement('a');
      nextLink.href = '#';
      nextLink.innerText = 'Next';
      nextLink.dataset.page = page + 1;
      paginationContainer.appendChild(nextLink);
  }
  // Store pagination data in sessionStorage
  sessionStorage.setItem('currentPage', page.toString());
  sessionStorage.setItem('totalPages', totalPg.toString());
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

// Retrieving and Rendering Pagination on Page Load
document.addEventListener('DOMContentLoaded', function() {
  const storedCurrentPage = parseInt(sessionStorage.getItem('currentPage'), 10);
  const storedTotalPages = parseInt(sessionStorage.getItem('totalPages'), 10);

  if (storedCurrentPage && storedTotalPages) {
      renderPagination(storedCurrentPage, storedTotalPages);
  }
});

// Capture form inputs, fetch new flight data, and store it in session storage
document.getElementById('searchFlights').addEventListener('click', async function(event) {
  event.preventDefault();  // Prevent form submission

  // Capture input values
  const sourceAirport = document.getElementById('sourceAirport').value;
  const destinationAirport = document.getElementById('destinationAirport').value;
  const departureDate = document.getElementById('departure-date').value;
  const returnDate = document.getElementById('return-date').value;
  const itineraryType = document.querySelector('input[name="trip-type"]:checked').value;
  const numAdults = document.getElementById('numAdults').value;
  const numSeniors = document.getElementById('numSeniors').value;
  const nonstop = document.getElementById('Nonstop').value;
  const sortFlights = document.getElementById('sort-flights').value;
  const classOfService = document.getElementById('cabin-class').value;
  const currency = document.getElementById('currency').value;

  // Construct search parameters
  const searchParameters = {
      sourceCode: sourceAirport,
      destinationCode: destinationAirport,
      departureDate: departureDate,
      returnDate: (itineraryType === 'ROUND_TRIP') ? returnDate : '',
      itineraryType: itineraryType,
      numAdults: numAdults,
      numSeniors: numSeniors,
      nonstop: nonstop,
      sortFlights: sortFlights,
      classOfService: classOfService,
      currencyCode: currency,
      pageNumber: currentPage.toString()
  };

  // Save the search parameters in session storage
  sessionStorage.setItem('searchParameters', JSON.stringify(searchParameters));

  let returnDateParam = '';
  if (searchParameters.itineraryType === 'ROUND_TRIP' && searchParameters.returnDate) {
      returnDateParam = `&returnDate=${encodeURIComponent(searchParameters.returnDate)}`;
  }
  // Construct the API request URL
  const apiURL = `https://${API_HOST}/api/v1/flights/searchFlights?sourceAirportCode=${searchParameters.sourceCode}&destinationAirportCode=${searchParameters.destinationCode}&date=${encodeURIComponent(searchParameters.departureDate)}${returnDateParam}&itineraryType=${searchParameters.itineraryType}&sortOrder=${searchParameters.sortFlights}&numAdults=${searchParameters.numAdults}&numSeniors=${searchParameters.numSeniors}&classOfService=${searchParameters.classOfService}&pageNumber=${searchParameters.pageNumber}&nonstop=${searchParameters.nonstop}&currencyCode=${searchParameters.currencyCode}`;

  // Fetch new flight data
  const fetchedFlights = await fetchFlights(apiURL);
  console.log('Raw fetched flights:', fetchedFlights);
  console.log('Total number of flights:', fetchedFlights.data.totalNumResults);
  console.log('Number of flights in current response:', fetchedFlights.data.flights.length);


  // Check if the API response is valid and contains flight data
  if (fetchedFlights && fetchedFlights.status === true && Array.isArray(fetchedFlights.data.flights)) {
    const structuredFlights = structureFlightData(fetchedFlights.data.flights);
    sessionStorage.setItem('fetchedFlights', JSON.stringify(structuredFlights));

    // Display the new flight data in the DOM
    handleFlights(structuredFlights);

    // Render pagination based on current page and total pages
    const totalPages = Math.ceil(fetchedFlights.data.totalNumResults / fetchedFlights.data.flights.length);
    renderPagination(currentPage, totalPages);

  } else if (fetchedFlights && fetchedFlights.message) {
    // Handle error messages from the API
    alert(fetchedFlights.message[0].returnDate || 'An error occurred.');
  } else {
    console.error('Unexpected flight data format:', fetchedFlights);
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




