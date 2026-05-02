function setupCatalogAlphabet() {
      const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
      const alphaDiv = document.getElementById('catalog-alpha');
      const sectionDiv = document.getElementById('catalog-section');
      alphaDiv.innerHTML = '';
      sectionDiv.classList.add('hidden');
      alpha.forEach(letter => {
        const btn = document.createElement('button');
        btn.className = 'catalog-btn';
        btn.textContent = letter;
        btn.onclick = () => {
          sectionDiv.innerHTML = `<button class='go-back-btn' onclick='setupCatalogAlphabet()'>${translations[currentLang]['catalog_go_back'] || translations['en']['catalog_go_back']}</button><div style='margin-top:16px;font-size:1.2rem;font-weight:600;color:var(--rose);'>${letter}</div><div style='margin-top:8px;color:#444;'>${translations[currentLang]['catalog_no_items'] || translations['en']['catalog_no_items']}</div>`;
          alphaDiv.innerHTML = '';
          sectionDiv.classList.remove('hidden');
        };
        alphaDiv.appendChild(btn);
      });
    }
