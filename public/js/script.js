document.addEventListener('DOMContentLoaded', function(){
  const darkModeToggle = document.getElementById("dark-mode-toggle");
  const body = document.body;
  if (darkModeToggle) {
    darkModeToggle.addEventListener("click", function() {
        body.classList.toggle("dark-mode");
        if (body.classList.contains("dark-mode")) {
          darkModeToggle.textContent = "Light Mode"; // Change button text for clarity
        } else {
          darkModeToggle.textContent = "Dark Mode"; // Revert button text
        }
    });
}

  const allButtons = document.querySelectorAll('.searchBtn');
  const searchBar = document.querySelector('.searchBar');
  const searchInput = document.getElementById('searchInput');
  const searchClose = document.getElementById('searchClose');

  
  for (var i = 0; i < allButtons.length; i++) {
    allButtons[i].addEventListener('click', function() {
      searchBar.style.visibility = 'visible';
      searchBar.classList.add('open');
      this.setAttribute('aria-expanded', 'true');
      searchInput.focus();
    });
  }

  searchClose.addEventListener('click', function() {
    searchBar.style.visibility = 'hidden';
    searchBar.classList.remove('open');
    this.setAttribute('aria-expanded', 'false');
  });


});