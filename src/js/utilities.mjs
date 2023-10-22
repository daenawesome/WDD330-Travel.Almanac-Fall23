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

// Function to set a background image based on the current time
export function setBackgroundImage(selector) {
  // Array of background images you'd like to cycle through
  const images = [
      '/images/backdrop1.jpg',
      '/images/backdrop2.jpg',
      '/images/backdrop3.jpg',
      '/images/backdrop4.jpg',
  ];

  const hour = new Date().getHours();
  const mainElement = document.querySelector(selector);

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
