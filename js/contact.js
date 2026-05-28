// Contact form
document.addEventListener('DOMContentLoaded', function() {
  var form = document.querySelector('.contact-form');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const name = form.elements['name'].value.trim();
      const email = form.elements['email'].value.trim();
      const message = form.elements['message'].value.trim();
      window.supabaseClient
        .from('contact_messages')
        .insert([{ name, email, message, created_at: new Date().toISOString() }])
        .then(({ data, error }) => {
          if (error) {
            window.showToast('Error sending message: ' + error.message, 'error');
          } else {
            window.showToast('Message sent!', 'success');
            form.reset();
          }
        });
    });
  }
});
