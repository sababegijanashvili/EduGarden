document.addEventListener('DOMContentLoaded', function() {
  var form = document.querySelector('.contact-form');
  if (!form) return;
  window._lastContactSubmit = 0;
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    var name = form.elements['name'].value.trim();
    var email = form.elements['email'].value.trim();
    var message = form.elements['message'].value.trim();
    if (!name || !email || !message) {
      window.showToast('Please fill all fields', 'error');
      return;
    }
    if (name.length > 100 || email.length > 200 || message.length > 2000) {
      window.showToast('Input too long', 'error');
      return;
    }
    var now = Date.now();
    if (now - window._lastContactSubmit < 30000) {
      window.showToast('Please wait 30 seconds between messages', 'error');
      return;
    }
    try {
      var result = await window.supabaseClient.from('contact_messages').insert([{ name: name, email: email, message: message }]);
      if (result.error) {
        window.showToast('Error sending message: ' + result.error.message, 'error');
      } else {
        window._lastContactSubmit = now;
        window.showToast('Message sent!', 'success');
        form.reset();
      }
    } catch(e) {
      window.showToast('Error: ' + e.message, 'error');
    }
  });
});
