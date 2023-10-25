
import {
  loadDynamicContent,
  setBackgroundImage,
} from './utilities.mjs'

import {
  flightCardTemplate,
  addToFavorites,
  removeFromFavorites,
} from './flightCard.mjs'

loadDynamicContent ();

document.addEventListener('DOMContentLoaded', () => {
  displayFavoriteFlights();
});

function getFavoriteFlights() {
  // Retrieve favorite flights from local storage
  const favorites = JSON.parse(localStorage.getItem('favoriteFlights')) || [];
  return favorites;
}

function displayFavoriteFlights() {
  const favoriteFlights = getFavoriteFlights();
  const flightsContainers = document.getElementById('flightsContainers');
  const noFlightsContainer = document.getElementById('noFlightsContainer');

  // Clear the existing flights display
  flightsContainers.innerHTML = '';

  if (favoriteFlights.length === 0) {
    // No favorite flights Show styled error message
    noFlightsContainer.innerHTML = `
      <div class="failed"><div class="failed-message">
        <h1>Oops! You haven't favorited anything yet?</h1>
        <h1>Try Adding Flights at the Search page..</h1>
      </div>
      <div class="cat">
        <div class="ear ear--left"></div>
        <div class="ear ear--right"></div>
        <div class="face">
          <div class="eye eye--left">
            <div class="eye-pupil"></div>
          </div>
          <div class="eye eye--right">
            <div class="eye-pupil"></div>
          </div>
          <div class="muzzle"></div>
        </div>
      </div></div>`;
      noFlightsContainer.style.display = 'flex';
  } else {
    // same function to create flight cards for favorite flights
    noFlightsContainer.innerHTML = '';
    favoriteFlights.forEach((flight) => {
      const flightCard = flightCardTemplate(flight);
      flightsContainers.innerHTML += flightCard;
      flightsContainers.style.display = 'grid';
    });
  }
}

// Event listener for the favorite button
document.addEventListener('click', function(event) {
  if (event.target.matches('.favorite-button')) {
    console.log(event.target);

    const uniqueID = event.target.getAttribute('data-unique-id');

    console.log('uniqueID clicked:', uniqueID);

    // Retrieve the list of flights from storage.
    const allFlights = JSON.parse(localStorage.getItem('fetchedFlights')) || [];

    console.log('fetchedFlights:', allFlights);

    // Find the specific flight with the uniqueID.
    const flightData = allFlights.find(flight => flight.uniqueID === uniqueID);

    if (!flightData) {
      console.error('Flight not found');
      return;
    }

    // Check the current state of the button (favorited or not) to decide the action.
    if (event.target.textContent === '\u{1F90D} Add to Favorites') {
      addToFavorites(flightData);  // Pass the whole flight data object
      event.target.textContent = '\u{1F49A} Remove from Favorites';  // Indicate it's a favorite
    } else {
      removeFromFavorites(uniqueID);
      event.target.textContent = '\u{1F90D} Add to Favorites';  // Indicate it's no longer a favorite
    }
  }
  displayFavoriteFlights();
});

// Background Image
document.addEventListener('DOMContentLoaded', function() {
  setBackgroundImage('main');
  });
