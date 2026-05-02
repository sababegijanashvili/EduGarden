// Contact form
document.addEventListener('DOMContentLoaded', function() {
  var form = document.querySelector('.contact-form');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      alert('Message sent!');
    });
  }
});
