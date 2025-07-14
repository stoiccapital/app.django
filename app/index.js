// index.js - Ensures sidebar toggling adds/removes sidebar-open class on <body>

document.addEventListener('DOMContentLoaded', function () {
  // Wait for sidebar to be loaded dynamically
  function setupSidebarToggle() {
    var sidebar = document.getElementById('sidebar');
    var hamburger = document.getElementById('hamburgerMenu');
    if (!sidebar || !hamburger) {
      setTimeout(setupSidebarToggle, 100); // Try again until loaded
      return;
    }
    
    function updateBodyClass() {
      if (sidebar.classList.contains('active')) {
        document.body.classList.add('sidebar-open');
      } else {
        document.body.classList.remove('sidebar-open');
      }
    }

    // Initial state
    updateBodyClass();

    // Listen for sidebar toggle
    hamburger.addEventListener('click', function () {
      setTimeout(updateBodyClass, 10); // Wait for class toggle
    });
  }
  setupSidebarToggle();
}); 