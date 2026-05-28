// js/articles.js – Dynamic Articles rendering from Supabase and Modal Expansion
// Uses global window.supabaseClient and currentLang

let allArticles = [];
let currentArticleOpen = null;

const articleImages = {
  compost: [
    'https://i.postimg.cc/13kxZKcC/518311798-24124635453822932-1679221572965788087-n.jpg',
    'https://i.postimg.cc/PdXkgkvY/518316442-24124630400490104-5393785229401845256-n.jpg',
    'https://i.postimg.cc/9m73dms5/519670010-24124630790490065-4571032062583763630-n.jpg',
    'https://i.postimg.cc/s2WnhXxT/image.png',
    'https://i.postimg.cc/ZJ4TJd29/518940920-24124623547157456-1018382966899199927-n.jpg'
  ]
};

document.addEventListener('DOMContentLoaded', () => {
  loadAndRenderArticles();
  setupModalEventListeners();
});

function loadAndRenderArticles() {
  const container = document.querySelector('.articles-grid');
  if (!container) return;

  // Ensure supabase client is ready
  if (!window.supabaseClient) {
    setTimeout(loadAndRenderArticles, 100);
    return;
  }

  container.innerHTML = '<div class="spinner"></div>';

  window.supabaseClient
    .from('articles')
    .select('*')
    .order('created_at', { ascending: false })
    .then(({ data, error }) => {
      if (error) {
        container.innerHTML = `<p class="empty-state">Error loading articles: ${error.message}</p>`;
        return;
      }
      allArticles = data || [];
      if (allArticles.length === 0) {
        container.innerHTML = `<div class="empty-state"><div class="icon">\u2639</div><p>No articles yet.</p></div>`;
        return;
      }
      renderArticles(allArticles);
    });
}

function renderArticles(articles) {
  const container = document.querySelector('.articles-grid');
  let html = '';
  articles.forEach(a => {
    const title = (window.currentLang || 'ge') === 'ge' ? a.title_ge : a.title_en;
    const content = (window.currentLang || 'ge') === 'ge' ? a.content_ge : a.content_en;
    const date = new Date(a.created_at).toLocaleDateString();
    const img = a.image_url ? a.image_url.split(',')[0].trim() : '';
    
    // Add semantic article class and markup exactly like the original HTML to prevent layout deformation
    html += `
      <article class="article-card" data-article="${a.id}" style="cursor: pointer;" onclick="openArticleModal('${a.id}')">
        ${img ? `<img class="article-preview-image" src="${img}" alt="${title}">` : ''}
        <div class="article-card-content">
          <div class="article-meta">
            <img class="article-avatar" src="https://i.postimg.cc/Lsww5VsK/photoshop-project34c213.png" alt="EduGarden" />
            <div class="article-author">EduGarden</div>
            <div class="article-date">${date}</div>
          </div>
          <h3 class="article-title">${title}</h3>
          <p class="article-preview-text">${(content || '').substring(0, 120)}${(content || '').length > 120 ? '...' : ''}</p>
          <a href="#" class="read-more-btn" onclick="event.preventDefault(); event.stopPropagation(); openArticleModal('${a.id}')" data-translate="learn_more">${translations[window.currentLang || 'ge']['learn_more'] || 'Read More'}</a>
        </div>
      </article>`;
  });
  container.innerHTML = html;
}

// Modal Expansion Implementation
function buildArticleData(articleId) {
  const a = allArticles.find(item => item.id === articleId);
  if (!a) return null;
  const lang = window.currentLang || 'ge';
  
  // If it's the compost bin article, use the rich images gallery
  const isCompost = a.title_en && a.title_en.toLowerCase().includes('compost');
  let images = [];
  if (isCompost) {
    images = articleImages.compost;
  } else if (a.image_url) {
    images = a.image_url.split(',').map(url => url.trim()).filter(url => !!url);
  }

  return {
    title: lang === 'ge' ? a.title_ge : a.title_en,
    date: new Date(a.created_at).toLocaleDateString(),
    content: lang === 'ge' ? a.content_ge : a.content_en,
    images: images
  };
}

function renderModal(data) {
  if (!data) return;
  const modalImg = document.getElementById('modalImage');
  const headerEl = document.querySelector('.article-modal-header');
  
  if (modalImg && data.images && data.images.length > 0) {
    modalImg.src = data.images[0];
    modalImg.alt = data.title;
    modalImg.style.display = 'block';
    
    // Ensure clicking main image opens lightbox
    modalImg.onclick = () => {
      const lightbox = document.getElementById('imageLightbox');
      const lightboxImg = document.getElementById('lightboxImage');
      if (lightbox && lightboxImg) {
        lightboxImg.src = data.images[0];
        lightboxImg.alt = data.title;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    };
  } else if (modalImg) {
    modalImg.style.display = 'none';
  }

  document.getElementById('modalDate').textContent = data.date;
  document.getElementById('modalTitle').textContent = data.title;
  document.getElementById('modalContent').innerHTML = data.content.replace(/\n/g, '<br>');

  const gallery = document.getElementById('modalGallery');
  if (gallery) {
    gallery.innerHTML = '';
    if (data.images && data.images.length > 1) {
      data.images.forEach(imgSrc => {
        const img = document.createElement('img');
        img.src = imgSrc;
        img.className = 'article-gallery-image';
        img.alt = data.title;
        img.addEventListener('click', () => {
          const lightbox = document.getElementById('imageLightbox');
          const lightboxImg = document.getElementById('lightboxImage');
          if (lightbox && lightboxImg) {
            lightboxImg.src = imgSrc;
            lightboxImg.alt = data.title;
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
          }
        });
        gallery.appendChild(img);
      });
    }
  }
}

function openArticleModal(articleId) {
  currentArticleOpen = articleId;
  const data = buildArticleData(articleId);
  if (!data) return;
  renderModal(data);
  const modal = document.getElementById('articleModal');
  if (modal) {
    document.querySelector('header').style.display = 'none';
    document.querySelector('footer').style.display = 'none';
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}
window.openArticleModal = openArticleModal;

function closeModalFunc() {
  const modal = document.getElementById('articleModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
    document.querySelector('header').style.display = '';
    document.querySelector('footer').style.display = '';
    currentArticleOpen = null;
  }
}

function setupModalEventListeners() {
  const closeModal = document.getElementById('closeModal');
  if (closeModal) {
    closeModal.addEventListener('click', closeModalFunc);
  }

  const modal = document.getElementById('articleModal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModalFunc();
      }
    });
  }

  // Lightbox close
  const lightbox = document.getElementById('imageLightbox');
  const closeLightbox = document.getElementById('closeLightbox');
  if (closeLightbox && lightbox) {
    closeLightbox.addEventListener('click', () => {
      lightbox.classList.remove('active');
      document.body.style.overflow = 'auto';
    });
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        lightbox.classList.remove('active');
        document.body.style.overflow = 'auto';
      }
    });
  }

  // Keyboard Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (lightbox && lightbox.classList.contains('active')) {
        lightbox.classList.remove('active');
        document.body.style.overflow = 'auto';
      } else if (modal && modal.classList.contains('active')) {
        closeModalFunc();
      }
    }
  });
}

// Re‑render when language changes
function onLanguageChange() {
  loadAndRenderArticles();
}

if (typeof window.registerLanguageChange === 'function') {
  window.registerLanguageChange(onLanguageChange);
}

// Expose for language.js
window.__articleModal__ = {
  renderModal,
  buildArticleData,
  get currentArticleOpen() { return currentArticleOpen; }
};
