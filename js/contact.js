document.addEventListener('DOMContentLoaded', function() {
  var form = document.querySelector('.contact-form');
  if (!form) return;
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    var name = form.elements['name'].value.trim();
    var email = form.elements['email'].value.trim();
    var message = form.elements['message'].value.trim();
    if (!name || !email || !message) {
      window.showToast('Please fill all fields', 'error');
      return;
    }
    try {
      var result = await window.supabaseClient.from('contact_messages').insert([{ name: name, email: email, message: message }]);
      if (result.error) {
        window.showToast('Error sending message: ' + result.error.message, 'error');
      } else {
        window.showToast('Message sent!', 'success');
        form.reset();
      }
    } catch(e) {
      window.showToast('Error: ' + e.message, 'error');
    }
  });
});
