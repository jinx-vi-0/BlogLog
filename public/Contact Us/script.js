document.getElementById('contact-form').addEventListener('submit', function(event) {
    event.preventDefault();
    
    // Basic form validation
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;

    if (name && email && subject && message) {
        // Show the popup
        document.getElementById('popup').style.display = 'flex';
    } else {
        alert("Please fill out all fields.");
    }
});

document.getElementById('close-popup').addEventListener('click', function() {
    document.getElementById('popup').style.display = 'none';
});