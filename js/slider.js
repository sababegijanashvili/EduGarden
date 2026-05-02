// --- Modern Photo Slider Logic ---
    const sliderImages = Array.from(document.querySelectorAll('.slider-img'));
    const sliderDotsContainer = document.getElementById('slider-dots');
    let sliderIndex = 0;
    let sliderTimer = null;
    function showSlider(idx) {
      sliderImages.forEach((img, i) => {
        img.classList.toggle('active', i === idx);
        img.setAttribute('aria-hidden', i === idx ? 'false' : 'true');
        img.tabIndex = i === idx ? 0 : -1;
      });
      Array.from(sliderDotsContainer.children).forEach((dot, i) => {
        dot.classList.toggle('active', i === idx);
      });
      sliderIndex = idx;
    }
    function sliderPrev() {
      showSlider((sliderIndex - 1 + sliderImages.length) % sliderImages.length);
      resetSliderTimer();
    }
    function sliderNext() {
      showSlider((sliderIndex + 1) % sliderImages.length);
      resetSliderTimer();
    }
    function resetSliderTimer() {
      if (sliderTimer) clearInterval(sliderTimer);
      sliderTimer = setInterval(() => sliderNext(), 8000);
    }
    function setupSliderDots() {
      sliderDotsContainer.innerHTML = '';
      sliderImages.forEach((_, i) => {
        const dot = document.createElement('span');
        dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
        dot.onclick = () => { showSlider(i); resetSliderTimer(); };
        sliderDotsContainer.appendChild(dot);
      });
    }
    // Single initialization: Georgian is default
    document.addEventListener('DOMContentLoaded', () => {
  switchLanguage('ge');
  document.getElementById('lang-ge').classList.add('active');
  document.getElementById('lang-en').classList.remove('active');
  showPage('home');
  document.querySelectorAll('nav a, .lang-btn, .catalog-btn, .go-back-btn, .hero-btn, .form-btn').forEach(el => {
    el.setAttribute('tabindex', '0');
  });
  setupSliderDots();
  resetSliderTimer();
});
