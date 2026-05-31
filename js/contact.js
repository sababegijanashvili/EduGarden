// Contact form
document.addEventListener('DOMContentLoaded', function() {
  var form = document.querySelector('.contact-form');
  if (!form) return;

  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    var name = form.elements['name'].value.trim();
    var email = form.elements['email'].value.trim();
    var message = form.elements['message'].value.trim();
    if (!name || !email || !message) return;

    if (!window.supabaseClient) {
      if (typeof window.showToast === 'function') {
        window.showToast('Error: connection not ready. Please try again.', 'error');
      }
      return;
    }

    var submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    try {
      var result = await window.supabaseClient
        .from('contact_messages')
        .insert([{ name: name, email: email, message: message }]);

      if (result.error) {
        if (typeof window.showToast === 'function') {
          window.showToast('Error sending message: ' + result.error.message, 'error');
        }
      } else {
        window.showToast('Message sent!', 'success');
        form.reset();
      }
    } catch (err) {
      if (typeof window.showToast === 'function') {
        window.showToast('Error sending message: ' + err.message, 'error');
      }
    }

    if (submitBtn) submitBtn.disabled = false;
  });
});
