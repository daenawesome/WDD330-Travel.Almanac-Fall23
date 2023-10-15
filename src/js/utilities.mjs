// Constants
export const API_HOST = 'tripadvisor16.p.rapidapi.com';
export const API_KEY = '4955cfa1e9msh3b2611741f0de71p13af46jsn59bec143a4f3';

export const options = {
    method: 'GET',
    headers: {
        'X-RapidAPI-Key': API_KEY,
        'X-RapidAPI-Host': API_HOST
    }
};

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

  if (tripType === 'roundtrip') {
      returnDateInput.hidden = false;
      returnDateLabel.hidden = false;
  } else {
      // Clear the value of the return date input when selecting one-way
      returnDateInput.value = '';
      returnDateInput.hidden = true;
      returnDateLabel.hidden = true;
  }
}

// Hamburger menu logic for mobile view
export function initializeDynamicContentListeners() {
  document.querySelector('.menu-icon').addEventListener('click', () => {
    const navLinks = document.querySelector('.nav-links');
    navLinks.classList.add('active');
    document.body.classList.add('nav-open'); // Add class to body to show the overlay
  });

  // Close button logic
  document.querySelector('.close-nav').addEventListener('click', () => {
    const navLinks = document.querySelector('.nav-links');
    navLinks.classList.remove('active');
    document.body.classList.remove('nav-open'); // Remove class from body to hide the overlay
  });
}

// Function to load an external file and insert its content into a target element
export function loadDynamicContent() {
  function loadFileIntoElement(filePath, targetElementId) {
      fetch(filePath)
          .then(response => response.text())
          .then(data => {
              const targetElement = document.getElementById(targetElementId);
              if (targetElement) {
                  targetElement.innerHTML = data;
                  initializeDynamicContentListeners();
              }
          });
  }

  // Load the header and footer into their placeholders
  loadFileIntoElement('/partials/header.html', 'dynamic-header');
  loadFileIntoElement('/partials/footer.html', 'dynamic-footer');
}
