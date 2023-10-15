import {loadDynamicContent, toggleReturnDate, fetchAndDisplayAirports  } from './utilities.mjs'

loadDynamicContent ();
toggleReturnDate();

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

function flightCardTemplate(flight) {
  // Get the origin and destination from the first and last leg respectively
  const origin = flight.segments[0].legs[0].originStationCode;
  const destination = flight.segments[0].legs[flight.segments[0].legs.length - 1].destinationStationCode;
  const flightSequence = flight.segments[0].legs.map(leg => `${leg.originStationCode} → ${leg.destinationStationCode}`).join(' & ');
  const totalDistance = flight.segments[0].legs.reduce((sum, leg) => sum + leg.distanceInKM, 0);
  const totalDistanceMiles = Math.round(totalDistance * 0.621371).toLocaleString();


  // Determine the durationType and durationInMinutes for the flight
  let durationType = 'Direct Flight'; // Default value
  let formattedDuration = '';
  if (flight.segments[0].layovers && flight.segments[0].layovers.length > 0) {
      durationType = flight.segments[0].layovers[0].durationType;
      formattedDuration = formatDuration(flight.segments[0].layovers[0].durationInMinutes);
  }

  // Construct the main header for the flight card
  let flightHeader = `
  <div class="flight-card">
      <div>
          <!-- Flight Origin to Destination -->
          <!-- <h1>${origin}→${destination}</h1> -->
          <h1>${flightSequence}</h1>
          <!-- Duration Type -->
          <div class="layover-info">
          <h3>${durationType}</h3>${formattedDuration ? `<h3>${formattedDuration}</h3>` : ''}
          </div>
          <!-- Total Flight Distance -->
          <h3>Total Distance: ${totalDistance.toLocaleString()} KM (~${totalDistanceMiles.toLocaleString()} miles)</h3>
          <div class="flight-details">`;

  // Loop through each segment's legs and construct the flight details
  let flightDetails = '';
  for (let segment of flight.segments) {
    for (let leg of segment.legs) {
      const formattedDistanceKM = leg.distanceInKM.toLocaleString();
      const formattedDistanceMiles = Math.round(leg.distanceInKM * 0.621371).toLocaleString(); // Convert KM to Miles

      flightDetails += `
      <div class="leg-details">
          <!-- Leg Origin to Destination with Flight Number -->
          <h4>${leg.originStationCode} → ${leg.destinationStationCode} Details:</h4>
          <span class="flight-number">Flight #${leg.flightNumber}</span>
          <!-- Departure and Arrival Details -->
          <div class="flight-time">
              <span class="departure-time">Departure: ${formatDateToCustomFormat(new Date(leg.departureDateTime))} ${new Date(leg.departureDateTime).toLocaleTimeString()}</span>
              <span class="arrival-time">Arrival: ${formatDateToCustomFormat(new Date(leg.arrivalDateTime))} ${new Date(leg.arrivalDateTime).toLocaleTimeString()}</span>
          </div>
          <div class="airline-details">
              <img src="${leg.operatingCarrier.logoUrl}" alt="Airline Logo" class="airline-logo">
              <span class="airline-name">${leg.operatingCarrier.displayName}</span>
          </div>
          <div class="flight-distance">
              <span>Distance: ${formattedDistanceKM} KM (~${formattedDistanceMiles} miles)</span>
          </div>
          <div class="flight-service">
              <span>Service: ${leg.classOfService}</span>
          </div>
          <div class="flight-plane">
              <span>${leg.equipmentId}</span>
          </div>
      </div>`;
  }
  }

  // Construct purchase link details
  const purchaseDetails = `
      <!-- Purchase Link -->
      <div class="purchase-link">
          <a href="${flight.purchaseLinks[0].url}" target="_blank">Book Now for ${flight.purchaseLinks[0].currency} ${flight.purchaseLinks[0].totalPricePerPassenger} | ${flight.purchaseLinks[0].providerId}</a>
      </div>
  </div>
  </div>
  </div>`;

  // Combine all parts to form the full flight card
  return flightHeader + flightDetails + purchaseDetails;
}

// Helper function to format the date
function formatDateToCustomFormat(dateObj) {
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                     'July', 'August', 'September', 'October', 'November', 'December'];
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = monthNames[dateObj.getMonth()];
  const year = dateObj.getFullYear();
  return `${month} ${day}, ${year}`;
}

// Helper function to format minutes into "Xhr & Ymins"
function formatDuration(minutes) {
  if (minutes === 0) return '';
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}hr & ${remainingMinutes}mins`;
}

// Fetch from sessionStorage
document.addEventListener('DOMContentLoaded', function() {
  const storedFlights = JSON.parse(sessionStorage.getItem('fetchedFlights'));

  if (storedFlights) {
      handleFlights(storedFlights);
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

      // Handle roundtrip value
      if (searchParameters.itineraryType === 'roundtrip') {
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

// Load JSON data for currency
let currencyData = [];
let addedCurrencies = new Set();  // Set to keep track of added currencies
fetch('/json/currency.json')  // Adjust the path accordingly
    .then(response => response.json())
    .then(data => {
        currencyData = data.countries.country;  // Extract the array using the correct keys

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
    });
