
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

function constructLegUniqueID(leg) {
  const components = [
      leg.originStationCode,
      leg.operatingCarrierCode,
      leg.destinationStationCode,
      leg.equipmentId,
      leg.departureDateTime,
      leg.flightNumber,
      leg.arrivalDateTime,
      leg.flightNumber
  ];

  let uniqueID = components.join('');

  // remove non-alphanumeric characters (spaces and special characters)
  uniqueID = uniqueID.replace(/[^a-zA-Z0-9]/g, '');

  return uniqueID;
}

// Function to structure flight data for Storage
export function structureFlightData(flights, currentPage) {
  return flights.map((flight, flightIndex) => {
      const flightId = `flight_${flightIndex}`;

      let combinedLegsUniqueID = '';

      const segments = flight.segments.map((segment, segmentIndex) => {
          const segmentId = `${flightId}_segment_${segmentIndex}`;

          const legs = segment.legs.map(leg => {
              combinedLegsUniqueID += constructLegUniqueID(leg);
              return {
                  id: `${segmentId}_leg`,
                  ...leg
              };
          });

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
          uniqueID: combinedLegsUniqueID + `_${flightId}_page_${currentPage}`,
          id: flightId,
          segments,
          purchaseLinks,
          page: currentPage,
      };
  });
}

