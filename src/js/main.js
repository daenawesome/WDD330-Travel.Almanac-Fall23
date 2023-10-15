import { loadDynamicContent, toggleReturnDate, fetchAndDisplayAirports } from './utilities.mjs'

loadDynamicContent ();
toggleReturnDate();

const sourceInput = document.getElementById('sourceAirport');
const destinationInput = document.getElementById('destinationAirport');
const departureDateInput = document.getElementById('departure-date');
const returnDateInput = document.getElementById('return-date');
const searchButton = document.getElementById('searchFlights');


searchButton.addEventListener('click', async function() {
    const sourceCode = sourceInput.value;
    const destinationCode = destinationInput.value;
    const departureDate = departureDateInput.value;
    let returnDate = '';
    const itineraryType = document.querySelector('input[name="trip-type"]:checked').value;
    const currencyCode  = document.getElementById('currency').value

    // Fetch return date for round trips
    if (itineraryType === 'roundtrip') {
        returnDate = returnDateInput.value;
    }

    const sortOrder = 'ML_BEST_VALUE'; // default
    const classOfService = 'ECONOMY'; // default

    // Log the search parameters
    const searchParameters = {
      sourceCode: sourceCode,
      destinationCode: destinationCode,
      departureDate: departureDate,
      returnDate: returnDate,
      itineraryType: itineraryType,
      sortOrder: sortOrder,
      classOfService: classOfService,
      currencyCode: currencyCode,
    };
    sessionStorage.setItem('searchParameters', JSON.stringify(searchParameters));
    console.log('Search Parameters:', searchParameters);

    const url = `https://tripadvisor16.p.rapidapi.com/api/v1/flights/searchFlights?sourceAirportCode=${sourceCode}&destinationAirportCode=${destinationCode}&date=${departureDate}&itineraryType=${itineraryType}&sortOrder=${sortOrder}&numAdults=1&numSeniors=0&classOfService=${classOfService}&pageNumber=1&currencyCode=${currencyCode}`;
    console.log('API Request URL:', url);

    try {
      const response = await fetch(url, {
          headers: {
              'X-RapidAPI-Key': '4955cfa1e9msh3b2611741f0de71p13af46jsn59bec143a4f3',
              'X-RapidAPI-Host': 'tripadvisor16.p.rapidapi.com'
          }
      });

      if (!response.ok) {
          throw new Error(`API returned status: ${response.status}`);
      }

      const result = await response.json();

      if (result.data && result.data.flights) {
          const structuredFlights = result.data.flights.map((flight, flightIndex) => {
              const flightId = `flight_${flightIndex}`;
              const segments = flight.segments.map((segment, segmentIndex) => {
                  const segmentId = `${flightId}_segment_${segmentIndex}`;
                  const legs = segment.legs.map(leg => ({
                      id: `${segmentId}_leg`,
                      originStationCode: leg.originStationCode,
                      destinationStationCode: leg.destinationStationCode,
                      departureDateTime: leg.departureDateTime,
                      arrivalDateTime: leg.arrivalDateTime,
                      classOfService: leg.classOfService,
                      equipmentId: leg.equipmentId,
                      flightNumber: leg.flightNumber,
                      distanceInKM: leg.distanceInKM,
                      isInternational: leg.isInternational,
                      operatingCarrier: leg.operatingCarrier,
                      marketingCarrier: leg.marketingCarrier
                  }));

                  const layovers = segment.layovers && segment.layovers.length > 0 ? segment.layovers.map(layover => ({
                      durationType: layover.durationType,
                      durationInMinutes: layover.durationInMinutes
                  })) : [{ durationType: 'No Layover', durationInMinutes: 0 }];

                  return {
                      id: segmentId,
                      legs: legs,
                      layovers: layovers
                  };
              });

              const purchaseLinks = flight.purchaseLinks.map(link => ({
                  providerId: link.providerId,
                  partnerSuppliedProvider: link.partnerSuppliedProvider,
                  currency: link.currency,
                  originalCurrency: link.originalCurrency,
                  totalPrice: link.totalPrice,
                  totalPricePerPassenger: link.totalPricePerPassenger,
                  url: link.url
              }));

              return {
                  id: flightId,
                  segments: segments,
                  purchaseLinks: purchaseLinks
              };
          });

          sessionStorage.setItem('fetchedFlights', JSON.stringify(structuredFlights));
          window.location.href = './page-list/flight-list.html';
      } else {
          console.error('No flights found or unexpected data structure:', result);
      }

  } catch (error) {
      console.error('Error fetching flights:', error);
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
let addedCurrencies = new Set();
fetch('/json/currency.json')
    .then(response => response.json())
    .then(data => {
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
    });
