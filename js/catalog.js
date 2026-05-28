// js/catalog.js – Render rose catalog with alphabet navigation and language support
// Expose globally as window.setupCatalogAlphabet

// Global variables
let allRoses = [];

function setupCatalogAlphabet() {
  const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const alphaDiv = document.getElementById('catalog-alpha');
  const sectionDiv = document.getElementById('catalog-section');
  // Clear previous content
  alphaDiv.innerHTML = '';
  sectionDiv.innerHTML = '';
  // Show alphabet view (section hidden by CSS initially)
  sectionDiv.classList.add('hidden');
  // Create alphabet buttons
  alpha.forEach(letter => {
    const btn = document.createElement('button');
    btn.className = 'catalog-btn';
    btn.textContent = letter;
    btn.onclick = () => renderRosesForLetter(letter);
    alphaDiv.appendChild(btn);
  });
}
window.setupCatalogAlphabet = setupCatalogAlphabet;

function loadRoses() {
  // Returns a promise resolving to data array
  return window.supabaseClient.from('roses').select('*');
}

function renderRosesForLetter(letter) {
  const alphaDiv = document.getElementById('catalog-alpha');
  const sectionDiv = document.getElementById('catalog-section');
  // Hide alphabet, show back button and roses
  alphaDiv.innerHTML = '';
  sectionDiv.classList.remove('hidden');

  // Back button
  const backBtn = document.createElement('button');
  backBtn.className = 'go-back-btn';
  backBtn.textContent = translations[currentLang]['catalog_go_back'] || translations['en']['catalog_go_back'];
  backBtn.onclick = () => setupCatalogAlphabet();
  sectionDiv.appendChild(backBtn);

  // Letter heading
  const heading = document.createElement('div');
  heading.className = 'letter-heading';
  heading.textContent = letter;
  heading.style.marginTop = '16px';
  heading.style.fontSize = '1.2rem';
  heading.style.fontWeight = '600';
  heading.style.color = 'var(--rose)';
  sectionDiv.appendChild(heading);

  // Filter roses
  const filtered = allRoses.filter(r => r.type_en !== 'ADR' && r.name && r.name[0].toUpperCase() === letter);
  if (filtered.length === 0) {
    const emptyDiv = document.createElement('div');
    emptyDiv.className = 'empty-state';
    emptyDiv.textContent = translations[currentLang]['catalog_no_items'] || translations['en']['catalog_no_items'];
    sectionDiv.appendChild(emptyDiv);
    return;
  }

  const grid = document.createElement('div');
  grid.className = 'catalog-grid';
  filtered.forEach(r => {
    const card = document.createElement('div');
    card.className = 'rose-card';
    if (r.image_url) {
      const img = document.createElement('img');
      img.src = r.image_url;
      img.alt = r.name;
      img.className = 'rose-img';
      card.appendChild(img);
    }
    const nameDiv = document.createElement('div');
    nameDiv.className = 'rose-name';
    nameDiv.textContent = r.name;
    card.appendChild(nameDiv);
    const typeDiv = document.createElement('div');
    typeDiv.className = 'rose-type';
    typeDiv.textContent = currentLang === 'ge' ? r.type_ge : r.type_en;
    card.appendChild(typeDiv);
    const descDiv = document.createElement('div');
    descDiv.className = 'rose-desc';
    descDiv.textContent = currentLang === 'ge' ? r.description_ge : r.description_en;
    card.appendChild(descDiv);
    grid.appendChild(card);
  });
  sectionDiv.appendChild(grid);
}

function renderAdrRoses() {
  const grid = document.getElementById('adr-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const adrRoses = allRoses.filter(r => r.type_en === 'ADR');
  if (adrRoses.length === 0) {
    grid.innerHTML = '<div class="empty-state">No ADR roses found.</div>';
    return;
  }

  adrRoses.forEach(r => {
    const card = document.createElement('div');
    card.className = 'adr-card';
    card.tabIndex = 0;

    const badge = document.createElement('div');
    badge.className = 'adr-badge';
    badge.textContent = window.currentLang === 'ge' ? 'სერტიფიცირებული' : 'ADR CERTIFIED';
    card.appendChild(badge);

    if (r.image_url) {
      const img = document.createElement('img');
      img.src = r.image_url;
      img.alt = `${r.name || ''} ADR Rose`;
      card.appendChild(img);
    }

    const title = document.createElement('div');
    title.className = 'adr-title';
    title.textContent = r.name || '';
    card.appendChild(title);

    const desc = document.createElement('div');
    desc.className = 'adr-desc';
    
    const specs = [];
    const mainDesc = window.currentLang === 'ge' ? r.description_ge : r.description_en;
    if (mainDesc) specs.push(mainDesc);
    if (r.height) specs.push((window.currentLang === 'ge' ? 'სიმაღლე: ' : 'Height: ') + r.height + (window.currentLang === 'ge' ? ' სმ' : ' cm'));
    if (r.width) specs.push((window.currentLang === 'ge' ? 'სიგანე: ' : 'Width: ') + r.width + (window.currentLang === 'ge' ? ' სმ' : ' cm'));
    if (r.breeder) specs.push((window.currentLang === 'ge' ? 'სელექციონერი: ' : 'Breeder: ') + r.breeder);
    if (r.year) specs.push((window.currentLang === 'ge' ? 'წელი: ' : 'Year: ') + r.year);
    
    desc.innerText = specs.join('\n');
    card.appendChild(desc);
    grid.appendChild(card);
  });
}

// Load roses on startup and init views
window.addEventListener('DOMContentLoaded', () => {
  function tryLoad() {
    if (!window.supabaseClient) {
      setTimeout(tryLoad, 100);
      return;
    }
    loadRoses().then(({ data, error }) => {
      if (error) {
        console.error('Failed to load roses:', error);
        return;
      }
      allRoses = data;
      if (document.getElementById('catalog')) {
        setupCatalogAlphabet();
      }
      renderAdrRoses();
    });
  }
  tryLoad();
});

// Re-render when language changes
function onLanguageChangeCatalog() {
  const backBtn = document.querySelector('.go-back-btn');
  if (backBtn) {
    const heading = document.querySelector('#catalog-section .letter-heading');
    const letter = heading ? heading.textContent.trim() : null;
    if (letter) renderRosesForLetter(letter);
  }
  renderAdrRoses();
}
if (typeof window.registerLanguageChange === 'function') {
  window.registerLanguageChange(onLanguageChangeCatalog);
}
window.setupCatalogAlphabet = setupCatalogAlphabet;
