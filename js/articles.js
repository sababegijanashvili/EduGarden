document.addEventListener('DOMContentLoaded', () => {
          const modal = document.getElementById('articleModal');
          const closeModal = document.getElementById('closeModal');
          const articleCards = document.querySelectorAll('.article-card');

          // Images per article (shared for all languages)
          const articleImages = {
            compost: [
              'https://i.postimg.cc/13kxZKcC/518311798-24124635453822932-1679221572965788087-n.jpg',
              'https://i.postimg.cc/PdXkgkvY/518316442-24124630400490104-5393785229401845256-n.jpg',
              'https://i.postimg.cc/9m73dms5/519670010-24124630790490065-4571032062583763630-n.jpg',
              'https://i.postimg.cc/s2WnhXxT/image.png',
              'https://i.postimg.cc/ZJ4TJd29/518940920-24124623547157456-1018382966899199927-n.jpg'
            ]
          };

          // Track currently opened article to re-render on language switch
          let currentArticleOpen = null;

          function buildArticleData(articleType) {
            if (articleType === 'compost') {
              return {
                title: translations[currentLang]['article1_title'] || '—',
                date: translations[currentLang]['article1_date'] || '',
                content: translations[currentLang]['article1_full'] || '',
                images: articleImages.compost
              };
            }
            return null;
          }

          function renderModal(data) {
            if (!data) return;
            const modalImg = document.getElementById('modalImage');
            const headerEl = document.querySelector('.article-modal-header');
            modalImg.src = data.images[0];
            modalImg.alt = data.title;
            // Improve clarity: avoid contrast/brightness filters that can soften images
            modalImg.style.filter = '';
            // Hint browser to prioritize this image without layout changes
            modalImg.loading = 'eager';
            modalImg.decoding = 'async';
            modalImg.setAttribute('fetchpriority', 'high');

            // After load, avoid upscaling which causes blur
            modalImg.onload = () => {
              const headerWidth = headerEl.clientWidth || 800;
              const nW = modalImg.naturalWidth || 0;
              const nH = modalImg.naturalHeight || 0;
              if (nW && nH) {
                if (nW < headerWidth) {
                  // Would upscale -> use contain and set appropriate header height
                  const scale = headerWidth / nW;
                  const scaledH = Math.min(300, Math.round(nH * scale));
                  headerEl.style.height = scaledH + 'px';
                  modalImg.style.objectFit = 'contain';
                } else {
                  // Plenty of resolution -> use cover at 300px height
                  headerEl.style.height = '300px';
                  modalImg.style.objectFit = 'cover';
                }
              }
            };

            // Ensure clicking the main image opens lightbox with full-res image
            modalImg.onclick = () => {
              const lightbox = document.getElementById('imageLightbox');
              const lightboxImg = document.getElementById('lightboxImage');
              lightboxImg.src = data.images[0];
              lightboxImg.alt = data.title;
              lightboxImg.style.width = '90vw';
              lightboxImg.style.height = '90vh';
              lightboxImg.style.objectFit = 'contain';
              lightbox.classList.add('active');
              document.body.style.overflow = 'hidden';
            };

            document.getElementById('modalDate').textContent = data.date;
            document.getElementById('modalTitle').textContent = data.title;
            document.getElementById('modalContent').innerHTML = data.content;

            const gallery = document.getElementById('modalGallery');
            gallery.innerHTML = '';
            data.images.forEach(imgSrc => {
              const img = document.createElement('img');
              img.src = imgSrc;
              img.className = 'article-gallery-image';
              img.alt = data.title;
              img.addEventListener('click', () => {
                img.style.transform = 'scale(0.95)';
                setTimeout(() => {
                  img.style.transform = 'scale(1.02)';
                  setTimeout(() => {
                    img.style.transform = 'scale(1)';
                    const lightbox = document.getElementById('imageLightbox');
                    const lightboxImg = document.getElementById('lightboxImage');
                    lightboxImg.src = imgSrc;
                    lightboxImg.alt = data.title;
                    lightboxImg.style.width = '90vw';
                    lightboxImg.style.height = '90vh';
                    lightboxImg.style.objectFit = 'contain';
                    lightbox.classList.add('active');
                    document.body.style.overflow = 'hidden';
                  }, 150);
                }, 100);
              });
              gallery.appendChild(img);
            });
          }

          // Open modal function
          function openModal(articleType) {
            currentArticleOpen = articleType;
            const data = buildArticleData(articleType);
            if (!data) return;
            renderModal(data);
            document.querySelector('header').style.display = 'none';
            document.querySelector('footer').style.display = 'none';
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
          }

          // Close modal function
          function closeModalFunc() {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
            document.querySelector('header').style.display = '';
            document.querySelector('footer').style.display = '';
            currentArticleOpen = null;
            // Reset hero sizing back to defaults for next open
            const headerEl = document.querySelector('.article-modal-header');
            const modalImg = document.getElementById('modalImage');
            if (headerEl) headerEl.style.height = '300px';
            if (modalImg) modalImg.style.objectFit = 'cover';
          }

          // Event listeners
          articleCards.forEach(card => {
            card.addEventListener('click', (e) => {
              e.preventDefault();
              const articleType = card.getAttribute('data-article');
              openModal(articleType);
            });
          });

          closeModal.addEventListener('click', closeModalFunc);

          modal.addEventListener('click', (e) => {
            if (e.target === modal) {
              closeModalFunc();
            }
          });

          // Lightbox event listeners
          const lightbox = document.getElementById('imageLightbox');
          const closeLightbox = document.getElementById('closeLightbox');

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

          // Add keyboard support for lightbox and modal
          document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
              if (lightbox.classList.contains('active')) {
                lightbox.classList.remove('active');
                document.body.style.overflow = 'auto';
              } else if (modal.classList.contains('active')) {
                closeModalFunc();
              }
            }
          });

          // Expose for language switch update
          window.__articleModal__ = { renderModal, buildArticleData, get currentArticleOpen(){ return currentArticleOpen; } };
        });
