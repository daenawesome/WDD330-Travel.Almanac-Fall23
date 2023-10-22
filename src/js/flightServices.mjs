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

export async function fetchFlights(apiURL) {
  console.log('Fetching flights from URL:', apiURL);  // Log the API Request URL

  try {
      const response = await fetch(apiURL, options);

      console.log('API Response:', response);  // Log the raw API response
      console.log('Response Status Code:', response.status);  // Log the status code

      if (!response.ok) {
          const responseBody = await response.text();  // Convert response body to text
          console.log('API Response Body:', responseBody);  // Log the response body
          throw new Error(`API returned status: ${response.status}`);
      }

      const data = await response.json();
      return data;

  } catch (error) {
      console.error('Error fetching flights:', error);  // Log any errors
      throw error;
  }
}

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

// Function to toggle the return date input and its label based on trip type
export function toggleReturnDate() {
  const tripType = document.querySelector('input[name="trip-type"]:checked').value;
  const returnDateInput = document.querySelector('.return-date');
  const returnDateLabel = document.querySelector('label[for="return-date"]');

  if (tripType === 'ROUND_TRIP') {
      returnDateInput.hidden = false;
      returnDateLabel.hidden = false;
  } else {
      // Clear the value of the return date input when selecting one-way
      returnDateInput.value = '';
      returnDateInput.hidden = true;
      returnDateLabel.hidden = true;
  }
}

// Load JSON data for currency
export async function loadCurrencyData() {
  let currencyData = [];
  let addedCurrencies = new Set();

  const response = await fetch('/json/currency.json');
  const data = await response.json();
  currencyData = data.countries.country;

  // Create an array of unique currency codes
  currencyData.forEach(item => {
      if (item.currencyCode && !addedCurrencies.has(item.currencyCode)) {
          addedCurrencies.add(item.currencyCode);
      }
  });

  // Convert the Set to an array and sort it
  const sortedCurrencies = [...addedCurrencies].sort();

  // Populate the currency dropdown
  const currencyDropdown = document.getElementById('currency');
  sortedCurrencies.forEach(currencyCode => {
      const option = document.createElement('option');
      option.value = currencyCode;
      option.textContent = currencyCode;
      currencyDropdown.appendChild(option);
  });

  // Set default currency to USD
  currencyDropdown.value = 'USD';

  // Return the currencyData for further usage
  return currencyData;
}

// Function to structure flight data for sessionStorage
export function structureFlightData(flights, currentPage) {
  return flights.map((flight, flightIndex) => {
      const flightId = `flight_${flightIndex}`;

      const segments = flight.segments.map((segment, segmentIndex) => {
          const segmentId = `${flightId}_segment_${segmentIndex}`;

          const legs = segment.legs.map(leg => ({
              id: `${segmentId}_leg`,
              ...leg
          }));

          const layovers = segment.layovers && segment.layovers.length
              ? segment.layovers.map(layover => ({
                  durationType: layover.durationType,
                  durationInMinutes: layover.durationInMinutes
              }))
              : [{ durationType: 'No Layover', durationInMinutes: 0 }];

          return {
              id: segmentId,
              page: currentPage,
              legs,
              layovers
          };
      });

      const purchaseLinks = flight.purchaseLinks.map(link => ({
          ...link
      }));

      return {
          id: flightId,
          segments,
          purchaseLinks
      };
  });
}
