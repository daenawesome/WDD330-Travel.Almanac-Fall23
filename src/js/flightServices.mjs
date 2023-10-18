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

// Function to fetch flights data from the API
export async function fetchFlights(url) {
  try {
      const response = await fetch(url, options);

      if (!response.ok) {
          throw new Error(`API returned status: ${response.status}`);
      }
      return await response.json();
  } catch (error) {
      console.error('Error fetching flights:', error);
      return null;
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
