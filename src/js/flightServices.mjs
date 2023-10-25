import {
  flightCardTemplate,
} from './flightCard.mjs'

import {
  renderPagination,
} from './paginationHelper.mjs';

import {
  structureFlightData,
} from './flightUtilities.mjs'

// Constants
export const API_HOST = import.meta.env.VITE_API_HOST;
export const API_KEY = import.meta.env.VITE_API_KEY;

export const options = {
    method: 'GET',
    headers: {
        'X-RapidAPI-Key': API_KEY,
        'X-RapidAPI-Host': API_HOST
    }
};

let paginationContainer;
let hasRetried = false;
// let fetchedFlights = [];
const flightsContainer = document.getElementById('flightsContainer');
let currentPage = parseInt(sessionStorage.getItem('currentPage'), 10) || 1;
paginationContainer = document.querySelector('#pagination-container');

// Event listener for pagination links
paginationContainer.addEventListener('click', function(event) {
  if (event.target.tagName === 'A') {
      event.preventDefault();
      const pageNumber = parseInt(event.target.dataset.page, 10);
      currentPage = pageNumber;  // Update currentPage variable
      sessionStorage.setItem('currentPage', currentPage);
      // searchFlights click event to fetch data for new page
      document.getElementById('searchFlights').click();
  }
});
document.addEventListener('DOMContentLoaded', function() {
  paginationContainer = document.querySelector('#pagination-container');
  const storedCurrentPage = parseInt(sessionStorage.getItem('currentPage'), 10);
  const storedTotalPages = parseInt(sessionStorage.getItem('totalPages'), 10);

  // Retrieve the data from session storage
  const totalNumberOfFlights = sessionStorage.getItem('totalNumberOfFlights');
  const numberOfFlights = sessionStorage.getItem('numberOfFlights');

  // If the data exists, update the <h1> element
  if (totalNumberOfFlights && numberOfFlights) {
  document.querySelector('#flightsCount .count').textContent = `Showing ${numberOfFlights} of ${totalNumberOfFlights} Flights`;
  } else {
    document.querySelector('#flightsCount .count').textContent = 'None';
  }

  const storedFlights = JSON.parse(localStorage.getItem('fetchedFlights'));
  if (storedFlights) {
      handleFlights(storedFlights);
  }

  if (storedCurrentPage && storedTotalPages) {
      renderPagination(storedCurrentPage, storedTotalPages, paginationContainer);
  }
});

// Fetching airports
export async function fetchAndDisplayAirports(inputId, dropdownId) {
  const country = document.getElementById(inputId).value;
  const dropdown = document.getElementById(dropdownId);

  const url = `https://${API_HOST}/api/v1/flights/searchAirport?query=${country}`;

  try {
      const response = await fetch(url, options);
      const result = await response.json();
      console.log(result)

      dropdown.innerHTML = '';

      if (!result.data || result.data.length === 0) {
          dropdown.innerHTML = '<div>No Airport Found</div>';
          return;
      }

      // Populate the dropdown with airports
      for (const airport of result.data) {
        const airportDiv = document.createElement('div');
        airportDiv.textContent = airport.name;

        // Add click event to update the input when an airport is selected
        airportDiv.addEventListener('click', function() {
          document.getElementById(inputId).value = airport.airportCode;
          dropdown.innerHTML = '';
        });


        dropdown.appendChild(airportDiv);
    }
  } catch (error) {
      console.error('Error fetching airports:', error);
      dropdown.innerHTML = '<div>Error fetching results</div>';
  }
}

export async function fetchFlights(apiURL) {
  // show the spinner on network request
  document.getElementById('loadingSpinner').style.display = 'flex';
  // console.log('Fetching flights from URL:', apiURL, options);  // Log the API Request URL

  try {
    // make a request to the provided URL
    const response = await fetch(apiURL, options);

    console.log('API Response:', response);  // Log the raw API response
    console.log('Response Status Code:', response.status);  // Log the status code

    // if (!response.ok) {
    //     const responseBody = await response.text();  // Convert response body to text if there's an error
    //     console.log('API Response Body:', responseBody);  // Log the response body
    //     throw new Error(`API returned status: ${response.status}`);
    // }

    if (!response.ok) {
      const errorResult = await response.json();
      throw {
          message: 'API Error',
          errorDetail: errorResult.message || 'An error occurred',
      };
    }

    // If the response OK, parse JSON
    const data = await response.json();

    console.log('API Response Body:', data);

    alert(`API Responded: ${data.message}`);
    // After the request completes, hide the spinner
    document.getElementById('loadingSpinner').style.display = 'none';
    return data;  // Parsed data is returned

  } catch (error) {
    console.error('Error fetching flights:', error);  // Log any errors
    document.getElementById('loadingSpinner').style.display = 'none';
    throw error;
  }
}

// fetching logic in a separate async function for retry
const executeFetch = async (searchParameters) => {
  // The URL for the API request is constructed
  const apiURL = constructApiURL(searchParameters);
  try {
    // retrieve flight data, and data is stored
    const fetchedFlights = await fetchFlights(apiURL);

    const numberOfFlights = fetchedFlights.data.flights.length;
    const totalNumberOfFlights = fetchedFlights.data.totalNumResults
    // console.log('fetchedFlights:', fetchedFlights);
    // console.log('Total number of flights:', totalNumberOfFlights);
    // console.log('Number of flights in the current response:', numberOfFlights);

    // show fetched flights count
    document.getElementById('flightsCount').textContent = `Flights Available: Showing ${numberOfFlights} of ${totalNumberOfFlights} Flights`;

    // If less than 5 flights and no retries yet, inform the user and trigger a retry
    if (numberOfFlights < 5 && !hasRetried) {
      alert('Oops, seems like there were not enough flights on this search. Let us try that again. Re-fetching flights...');
      hasRetried = true; // prevent multiple retries
      return await executeFetch(searchParameters);
    }
    return fetchedFlights;

  } catch (error) {
    console.error('Error fetching flight data:', error);
    throw error;
  }
};

// creates a complete URL for the API request, including query parameters
const constructApiURL = (params) => {
  const baseURL = `https://${API_HOST}/api/v1/flights/searchFlights`;
  const queryParams = new URLSearchParams({
    sourceAirportCode: params.sourceCode,
    destinationAirportCode: params.destinationCode,
    date: params.departureDate,
    itineraryType: params.itineraryType,
    sortOrder: params.sortFlights,
    numAdults: params.numAdults,
    numSeniors: params.numSeniors || '0',
    classOfService: params.classOfService,
    pageNumber: currentPage,
    nonstop: params.nonstop,
    currencyCode: params.currencyCode,
  });
  // Check if the itinerary type is a round trip.
  // If so, add the return date to the query parameters
  if (params.itineraryType === 'ROUND_TRIP' && params.returnDate) {
    queryParams.append('returnDate', params.returnDate);
  }
  return `${baseURL}?${queryParams.toString()}`; // The full URL
};

// executes only after the full HTML document has been loaded and parsed
document.addEventListener('DOMContentLoaded', () => {
	// holds references to various HTML elements needed for input
	const elements = {
		sourceInput: document.getElementById('sourceAirport'),
		destinationInput: document.getElementById('destinationAirport'),
		departureDateInput: document.getElementById('departure-date'),
		returnDateInput: document.getElementById('return-date'),
		numAdultsInput: document.getElementById('numAdults'),
		numSeniorsInput: document.getElementById('numSeniors'),
		nonstopInput: document.getElementById('Nonstop'),
		sortFlightsInput: document.getElementById('sort-flights'),
		classOfServiceInput: document.getElementById('cabin-class'),
		currencyInput: document.getElementById('currency'),
		searchButton: document.getElementById('searchFlights'),
		// method to retrieve the value of the selected radio input for trip type
		itineraryType: () => document.querySelector('input[name="trip-type"]:checked').value,
	};

	// Destructuring elements for easier access
	const {
		sourceInput,
		destinationInput,
		departureDateInput,
		returnDateInput,
		numAdultsInput,
		numSeniorsInput,
		nonstopInput,
		sortFlightsInput,
		classOfServiceInput,
		currencyInput,
		itineraryType,
		searchButton,
	} = elements;

	// Add event listener to the search button
	searchButton.addEventListener('click', async (event) => {
		event.preventDefault();
		hasRetried = false;

		// Construct search parameters object
		const searchParameters = {
			sourceCode: sourceInput.value,
			destinationCode: destinationInput.value,
			departureDate: departureDateInput.value,
			returnDate: itineraryType() === 'ROUND_TRIP' ? returnDateInput.value : '',
			itineraryType: itineraryType(),
			numAdults: numAdultsInput.value,
			numSeniors: numSeniorsInput.value,
			nonstop: nonstopInput.value,
			sortFlights: sortFlightsInput.value,
			classOfService: classOfServiceInput.value,
			currencyCode: currencyInput.value,
		};

		console.log('Search parameters:', searchParameters);

		sessionStorage.setItem('searchParameters', JSON.stringify(searchParameters));
		try {
			// retrieve flight data, and data is stored
			const fetchedFlights = await executeFetch(searchParameters);

			// checks if valid data returned
			if (fetchedFlights && fetchedFlights.status === true && Array.isArray(fetchedFlights.data.flights)) {
				// If no flights were found, the script handles this case specifically
				if (fetchedFlights.data.flights.length === 0) {
					paginationContainer.innerHTML = ''; // pagination is cleared if no results
				} else {
					// the data is processed and stored, and UI is updated
					const structuredFlights = structureFlightData(fetchedFlights.data.flights, currentPage);
					localStorage.setItem('fetchedFlights', JSON.stringify(structuredFlights));
          const numberOfFlights = fetchedFlights.data.flights.length;
          const totalNumberOfFlights = fetchedFlights.data.totalNumResults

					// Display the new flight data in the DOM
					handleFlights(structuredFlights);

					// Calculate total pages based on results
					const totalPages = Math.ceil(totalNumberOfFlights / numberOfFlights);

					// Render pagination based on current page and total pages
					renderPagination(currentPage, totalPages, paginationContainer);

					// Store the pages in session storage
					sessionStorage.setItem('totalPages', totalPages.toString());
					sessionStorage.setItem('currentPage', currentPage.toString());

          // Store the number of flights in session storage
          sessionStorage.setItem('totalNumberOfFlights', totalNumberOfFlights);
          sessionStorage.setItem('numberOfFlights', numberOfFlights);

				}
			} else if (fetchedFlights && fetchedFlights.message) {
				// Handle error messages from the API
				alert(fetchedFlights.message[0].returnDate || 'An error occurred.');
			} else {
				// data returned from the API doesn't match the expected format
				console.error('Unexpected flight data format:', fetchedFlights);
			}
		} catch (error) {
      console.error('Error fetching flight data:', error);

      let alertMessage = 'There was a problem retrieving the flight data. Please try again later.';

      if (error && error.errorDetail) {
          alertMessage = `Error: ${error.errorDetail}`; // contains actual API error message
      } else if (error instanceof TypeError && error.message === 'Failed to fetch') {
          alertMessage = 'Network error, please check your internet connection.';
      }

      alert(alertMessage); // Show the error message
		}
	});
});

// Helper function to get input values
export function handleFlights(flights) {
  flightsContainer.innerHTML = '';
  if (flights.length === 0) {
    // If there are no flights, display message
    const messageDiv = document.createElement('div');
    messageDiv.className = 'no-flights-message';
    messageDiv.textContent = 'No flights available based on your search criteria.';
    messageDiv.style.display = 'flex';
    flightsContainer.appendChild(messageDiv);
  } else {
    flights.forEach((flight, index) => {
      const flightCard = flightCardTemplate(flight, index);
      flightsContainer.innerHTML += flightCard;
    });
  }
}
