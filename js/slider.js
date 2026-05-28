// js/slider.js – Dynamic Team Photos Slider using Supabase
// This script replaces the static image list with data fetched from the `team_photos` table.
// It preserves the existing arrow and dot navigation functionality.

let sliderImages = [];
let sliderDotsContainer = null;
let sliderIndex = 0;
let sliderTimer = null;

function initializeSlider(images) {
  sliderImages = images;
  const sliderContainer = document.getElementById('photo-slider');
  // Clear any existing images
  const existingImgs = sliderContainer.querySelectorAll('.slider-img');
  existingImgs.forEach(img => img.remove());
  
  // Set z-index inline on arrows and dots to guarantee they are on top of active images (which have z-index: 2 in CSS)
  const leftArrow = sliderContainer.querySelector('.slider-arrow.left');
  const rightArrow = sliderContainer.querySelector('.slider-arrow.right');
  if (leftArrow) leftArrow.style.zIndex = '10';
  if (rightArrow) rightArrow.style.zIndex = '10';
  if (sliderDotsContainer) sliderDotsContainer.style.zIndex = '10';

  // Add new images before the right arrow button to preserve DOM stack order
  images.forEach((url, i) => {
    const img = document.createElement('img');
    img.src = url;
    img.alt = `Slide ${i + 1}`;
    img.className = 'slider-img' + (i === 0 ? ' active' : '');
    img.setAttribute('aria-hidden', i === 0 ? 'false' : 'true');
    img.tabIndex = i === 0 ? 0 : -1;
    sliderContainer.insertBefore(img, rightArrow || sliderDotsContainer);
  });
  setupSliderDots();
  resetSliderTimer();
}

function loadTeamPhotos() {
  return window.supabaseClient.from('team_photos').select('photo_url').order('created_at');
}

function showSlider(idx) {
  sliderImages.forEach((_, i) => {
    const img = document.querySelectorAll('.slider-img')[i];
    if (img) {
      img.classList.toggle('active', i === idx);
      img.setAttribute('aria-hidden', i === idx ? 'false' : 'true');
      img.tabIndex = i === idx ? 0 : -1;
    }
  });
  const dots = sliderDotsContainer.children;
  Array.from(dots).forEach((dot, i) => {
    dot.classList.toggle('active', i === idx);
  });
  sliderIndex = idx;
}

function sliderPrev() {
  if (sliderImages.length === 0) return;
  showSlider((sliderIndex - 1 + sliderImages.length) % sliderImages.length);
  resetSliderTimer();
}

// Global functions for arrow navigation
window.sliderPrev = sliderPrev;

function sliderNext() {
  if (sliderImages.length === 0) return;
  showSlider((sliderIndex + 1) % sliderImages.length);
  resetSliderTimer();
}

window.sliderNext = sliderNext;

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

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  sliderDotsContainer = document.getElementById('slider-dots');
  
  function tryLoad() {
    if (!window.supabaseClient) {
      setTimeout(tryLoad, 100);
      return;
    }
    loadTeamPhotos().then(({ data, error }) => {
      if (error) {
        console.error('Error loading team photos:', error.message);
        // Fallback to no images
        initializeSlider([]);
      } else {
        const urls = data.map(row => row.photo_url).filter(url => !!url);
        initializeSlider(urls);
      }
    });
  }
  tryLoad();
});
