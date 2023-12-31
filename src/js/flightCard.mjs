// check if a flight is already favorited
export function isFlightFavorited(uniqueID) {
  // Retrieve the current list from storage
  const favorites = JSON.parse(localStorage.getItem('favoriteFlights')) || [];

  // Check if any flight in favorites has the same unique ID
  return favorites.some(favFlight => favFlight.uniqueID === uniqueID);
}

// Main function to construct the flight card HTML
export function flightCardTemplate(flight) {
  // Calculating total distance of the flight
  const totalDistance = flight.segments[0].legs.reduce((sum, leg) => sum + leg.distanceInKM, 0);
  const totalDistanceMiles = Math.round(totalDistance * 0.621371).toLocaleString(); // Convert total distance to miles

  // Get the flight sequence (origin → destination for all segments)
  const flightSequence = getFlightSequence(flight);

  // Get layover durations for all segments
  const layoverDurations = flight.segments.map(getLayoverDurations);
  // Remove duplicates from layover durations
  const uniqueLayoverDurations = [...new Set(layoverDurations)];

  // Map over each segment to construct the HTML for flight details
  const flightDetails = flight.segments.map((segment, segmentIndex) => {
      const segmentType = segmentIndex === 0 ? 'Outbound' : 'Return';
      const segmentLegSequence = segment.legs.map(leg => `${leg.originStationCode} <span class="planeSymbol">&#9992;</span> ${leg.destinationStationCode}`).join(' & ');

      return `
          <div class="segment-details">
              <h2 class="toggle-flight-details">${segmentLegSequence} | ${segmentType} Flight</h2>
              <div class="flight-details-content">
                  ${segment.legs.map(getLegDetailTemplate).join('')}
              </div>
          </div>`;
  }).join('');

  // Check if the current flight is in favorites
  const isFavorited = isFlightFavorited(flight.uniqueID);
  // Create the button text based on the favorite status
  // const favoriteButtonText = isFavorited ? 'Unfavorite' : 'Favorite';
  const favoriteButtonText = isFavorited ? '&#x1F49A; Remove from Favorites' : '&#x1F90D; Add to Favorites';
  // Construct the favorite button
  const favoriteButton = `<button class="favorite-button" data-unique-id="${flight.uniqueID}">${favoriteButtonText}</button>`;

  return `
      <div class="flight-card">
          <div>
              <div class="flightHeader">
                  <h1>${flightSequence}</h1>
                  <div class="layover-info">
                      <h3>Layover Durations: ${uniqueLayoverDurations.join(' & ')}</h3>
                  </div>
                  <h3>Total Distance: ${totalDistance.toLocaleString()} KM (~${totalDistanceMiles.toLocaleString()} miles)</h3>
              </div>
              <div class="flight-details">
                  <section class="flight-wrapper">
                      ${flightDetails}
                  </section>
              </div>
              <div class="flightFooter">
              <div class="purchase-link">
                  <span><a href="${flight.purchaseLinks[0].url}" target="_blank">Book Now for ${flight.purchaseLinks[0].currency} ${flight.purchaseLinks[0].totalPricePerPassenger} | ${flight.purchaseLinks[0].providerId}</a></span>
              </div>
              ${favoriteButton}
          </div>
      </div>`;
}

// Helper function to generate the flight sequence string
function getFlightSequence(flight) {
  // Map over each segment and create a string of origin → destination
  return flight.segments.map(segment => {
      // Destructuring to get the first leg of each segment
      const [firstLeg] = segment.legs;
      // Getting the last leg of the segment
      const lastLeg = segment.legs[segment.legs.length - 1];
      // Returning a string containing the origin and destination station codes
      return `${firstLeg.originStationCode} <span class="planeSymbol"> &#x2708; </span> ${lastLeg.destinationStationCode}`;
  }).join(' & '); // Join all segment strings with ' & '.
}

// Helper function to get layover durations, if available
function getLayoverDurations(segment) {
  // Check if there are layovers and if the first one isn't a "No Layover"
  if (segment.layovers && segment.layovers.length > 0 && segment.layovers[0].durationType !== 'No Layover') {
      // If there's a layover, format the duration
      return formatDuration(segment.layovers[0].durationInMinutes);
  }
  // If there's no layover, return 'No Layover'
  return 'No Layover';
}

// Helper function to construct the HTML for each leg of a flight
function getLegDetailTemplate(leg) {
  // Format distances for readability
  const formattedDistanceKM = leg.distanceInKM.toLocaleString();
  const formattedDistanceMiles = Math.round(leg.distanceInKM * 0.621371).toLocaleString(); // Convert KM to Miles

  // Return the HTML string for each leg, containing details
  return `
      <div class="leg-details">
          <div class="logo-detail">
            <!-- Display airline details with logo -->
            <div class="airline-details">
            <div class="img-wrapper"><img src="${leg.operatingCarrier.logoUrl}" alt="Airline Logo" class="airline-logo"></div>
                <p class="airline-name">${leg.operatingCarrier.displayName}</p>
            </div>

            <div class="flight-info">
            <!-- Display origin and destination station codes -->
            <h3>${leg.originStationCode} <span class="planeSymbol">&#9992;</span> ${leg.destinationStationCode} Details:</h3>
            <!-- Display flight number -->
            <p class="flight-number">Flight #${leg.flightNumber}</p>
            <!-- Display departure and arrival times -->
            <div class="flight-time">
                <p class="departure-time">Departure: ${formatDateToCustomFormat(new Date(leg.departureDateTime))} ${new Date(leg.departureDateTime).toLocaleTimeString()}</p>
                <p class="arrival-time">Arrival: ${formatDateToCustomFormat(new Date(leg.arrivalDateTime))} ${new Date(leg.arrivalDateTime).toLocaleTimeString()}</p>
            </div>
            </div>
          </div>
          <!-- Display flight distance in KM and miles -->
          <div class="flight-distance">
              <p>Distance: ${formattedDistanceKM} KM (~${formattedDistanceMiles} miles)</p>
          </div>
          <!-- Display class of service -->
          <div class="flight-service">
              <p>Service: ${leg.classOfService}</p>
          </div>
          <!-- Display equipment ID -->
          <div class="flight-plane">
              <p>${leg.equipmentId}</p>
          </div>
      </div>`;
}

// Helper function to format the date
export function formatDateToCustomFormat(dateObj) {
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                     'July', 'August', 'September', 'October', 'November', 'December'];
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = monthNames[dateObj.getMonth()];
  const year = dateObj.getFullYear();
  return `${month} ${day}, ${year}`;
}

// Helper function to format minutes into "Xhr & Ymins"
export function formatDuration(minutes) {
  if (minutes === 0) return '';
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}hr & ${remainingMinutes}mins`;
}

// Function to add a flight to favorites
export function addToFavorites(flightData) {
  const currentFavorites = JSON.parse(localStorage.getItem('favoriteFlights')) || [];

  // Check if the flight is not already in the favorites
  if (!currentFavorites.some(favFlight => favFlight.uniqueID === flightData.uniqueID)) {
    currentFavorites.push(flightData); // only the new flight in list
    localStorage.setItem('favoriteFlights', JSON.stringify(currentFavorites)); // Store
  }
}

// Function to remove a flight from favorites
export function removeFromFavorites(uniqueID) {
  let currentFavorites = JSON.parse(localStorage.getItem('favoriteFlights')) || [];

  // Filter out the flight with the given unique ID
  currentFavorites = currentFavorites.filter(favFlight => favFlight.uniqueID !== uniqueID);

  // Store the updated list back in storage
  localStorage.setItem('favoriteFlights', JSON.stringify(currentFavorites));
}
