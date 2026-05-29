// js/staff.js – Fetch and render staff members dynamically
(function () {
  // Helper to determine current language ('en' or 'ge')
  function getCurrentLang() {
    return document.body.classList.contains('georgian') ? 'ge' : 'en';
  }

  let activePopover = null;
  let activeCard = null;

  function closeActivePopover() {
    if (activePopover) {
      activePopover.remove();
      activePopover = null;
      activeCard = null;
    }
  }

  function showPopover(card, member, bioText, roleName) {
    if (activeCard === card) {
      closeActivePopover();
      return;
    }
    closeActivePopover();

    const lang = getCurrentLang();
    const popover = document.createElement('div');
    popover.className = 'staff-popover';
    
    // Header
    const header = document.createElement('div');
    header.className = 'staff-popover-header';

    const avatarWrap = document.createElement('div');
    avatarWrap.className = 'staff-popover-avatar-wrap';
    const img = document.createElement('img');
    img.src = member.photo_url || '';
    img.alt = member.name || '';
    img.className = 'staff-popover-avatar';
    avatarWrap.appendChild(img);
    header.appendChild(avatarWrap);

    const details = document.createElement('div');
    details.className = 'staff-popover-details';

    // Name FIRST
    const name = document.createElement('div');
    name.className = 'staff-popover-name';
    name.textContent = member.name || '';
    details.appendChild(name);

    // Badges block (role from DB + fixed team badge)
    const badges = document.createElement('div');
    badges.className = 'staff-popover-badges';

    const roleBadge = document.createElement('span');
    roleBadge.className = 'staff-popover-badge role-badge';
    roleBadge.textContent = roleName;
    roleBadge.style.backgroundColor = member.badge_color || '#8d6e63';
    roleBadge.style.color = member.badge_text_color || '#ffffff';
    badges.appendChild(roleBadge);

    const teamBadge = document.createElement('span');
    teamBadge.className = 'staff-popover-badge staff-member-badge';
    teamBadge.textContent = lang === 'ge' ? 'გუნდის წევრი' : 'Team Member';
    badges.appendChild(teamBadge);
    details.appendChild(badges);

    // Subtext
    const subtext = document.createElement('div');
    subtext.className = 'staff-popover-subtext';
    subtext.textContent = lang === 'ge' ? 'EduGarden-ის გუნდი' : 'EduGarden Team';
    details.appendChild(subtext);

    header.appendChild(details);
    popover.appendChild(header);

    // Bio (displayed after header, before stats)
    const bioVal = (lang === 'ge' ? member.bio_ge : member.bio_en) || bioText;
    if (bioVal) {
      const bio = document.createElement('div');
      bio.className = 'staff-popover-bio';
      bio.textContent = bioVal;
      popover.appendChild(bio);
    }

    // Stats grid at the very bottom
    const stats = document.createElement('div');
    stats.className = 'staff-popover-stats';

    const yearsVal = member.years_at !== null && member.years_at !== undefined ? member.years_at : '-';
    const specVal = lang === 'ge' ? (member.specialization_ge || '-') : (member.specialization_en || '-');
    const locVal = member.location || '-';

    const statData = [
      { label: lang === 'ge' ? 'წლები EduGarden-ში' : 'Years at EduGarden', val: yearsVal },
      { label: lang === 'ge' ? 'სპეციალიზაცია' : 'Specialization', val: specVal },
      { label: lang === 'ge' ? 'მდებარეობა' : 'Location', val: locVal }
    ];

    statData.forEach(item => {
      const statItem = document.createElement('div');
      statItem.className = 'staff-popover-stat-item';
      const statLabel = document.createElement('span');
      statLabel.className = 'staff-popover-stat-label';
      statLabel.textContent = item.label;
      const statValue = document.createElement('span');
      statValue.className = 'staff-popover-stat-value';
      statValue.textContent = item.val;
      statItem.appendChild(statLabel);
      statItem.appendChild(statValue);
      stats.appendChild(statItem);
    });
    popover.appendChild(stats);

    document.body.appendChild(popover);
    activePopover = popover;
    activeCard = card;

    function updatePosition() {
      if (!activePopover || activeCard !== card) return;
      const rect = card.getBoundingClientRect();
      const popoverWidth = popover.offsetWidth;
      const popoverHeight = popover.offsetHeight;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

      const cardCenterX = rect.left + scrollLeft + rect.width / 2;
      const popoverTop = rect.top + scrollTop - popoverHeight - 12; // 12px gap
      let popoverLeft = cardCenterX - popoverWidth / 2;

      const windowMargin = 10;
      const maxLeft = window.innerWidth - popoverWidth - windowMargin;
      if (popoverLeft < windowMargin) {
        popoverLeft = windowMargin;
      } else if (popoverLeft > maxLeft) {
        popoverLeft = maxLeft;
      }

      const relativeArrowLeft = cardCenterX - popoverLeft;
      popover.style.setProperty('--arrow-left', `${relativeArrowLeft}px`);

      popover.style.top = `${popoverTop}px`;
      popover.style.left = `${popoverLeft}px`;
    }

    updatePosition();
    popover.addEventListener('click', (e) => e.stopPropagation());
  }

  // Dismiss listeners
  document.addEventListener('click', (e) => {
    if (activePopover) {
      const clickedCard = e.target.closest('.staff-compact-card');
      if (!clickedCard && !e.target.closest('.staff-popover')) {
        closeActivePopover();
      }
    }
  });

  window.addEventListener('resize', closeActivePopover);
  window.addEventListener('scroll', closeActivePopover, { passive: true });

  // Render staff grid into #staff-section
  function renderStaff() {
    closeActivePopover();
    const container = document.getElementById('staff-section');
    if (!container) return;

    // Ensure supabase client is ready
    if (!window.supabaseClient) {
      // retry after short delay
      setTimeout(renderStaff, 300);
      return;
    }

    // Show loading placeholder
    container.innerHTML = '<div class="loading">Loading staff...</div>';

    window.supabaseClient
      .from('staff')
      .select('*')
      .order('role_priority', { ascending: true })
      .order('order_index', { ascending: true })
      .then(({ data, error }) => {
        container.innerHTML = '';
        if (error) {
          const errDiv = document.createElement('div');
          errDiv.textContent = 'Error loading staff: ' + error.message;
          errDiv.style.color = 'red';
          container.appendChild(errDiv);
          return;
        }
        if (!data || data.length === 0) {
          const emptyDiv = document.createElement('div');
          emptyDiv.textContent = 'No staff members found.';
          container.appendChild(emptyDiv);
          return;
        }
        
        const lang = getCurrentLang();
        
        // Group staff by their role
        const groups = {};
        const roleOrder = [];
        data.forEach(member => {
          const rawRole = member.role_en || '';
          const roleKey = rawRole.split('|')[0].trim() || (lang === 'ge' ? 'სხვა' : 'Other');
          if (!groups[roleKey]) {
            groups[roleKey] = [];
            roleOrder.push(roleKey);
          }
          groups[roleKey].push(member);
        });

        // Render each group
        roleOrder.forEach(roleKey => {
          const firstMember = groups[roleKey][0];
          const rawRoleGe = firstMember.role_ge || '';
          const displayRole = lang === 'ge' ? (rawRoleGe.split('|')[0].trim() || roleKey) : roleKey;

          const groupCard = document.createElement('div');
          groupCard.className = 'staff-group-panel';
          
          const roleHeader = document.createElement('h3');
          roleHeader.className = 'staff-group-header';
          roleHeader.textContent = displayRole;
          groupCard.appendChild(roleHeader);

          const cardsContainer = document.createElement('div');
          cardsContainer.className = 'staff-group-cards';

          groups[roleKey].forEach(member => {
            const roleParts = (lang === 'ge' ? (member.role_ge || member.role_en || '') : (member.role_en || '')).split('|');
            const roleName = roleParts[0] || '';
            const bioText = roleParts[1] || '';
            const hasBio = member.bio_en || member.bio_ge || bioText;

            const card = document.createElement('div');
            card.className = 'staff-compact-card';
            
            if (hasBio) {
              card.classList.add('has-bio');
              card.title = lang === 'ge' ? 'დააწკაპუნეთ მეტი ინფორმაციისთვის' : 'Click to learn more';
              card.onclick = function(e) {
                e.stopPropagation();
                showPopover(card, member, bioText, roleName);
              };
            }

            const topDiv = document.createElement('div');
            topDiv.className = 'staff-card-top';

            const img = document.createElement('img');
            img.src = member.photo_url || '';
            img.alt = member.name || '';
            img.className = 'staff-compact-photo';
            topDiv.appendChild(img);

            const infoDiv = document.createElement('div');
            infoDiv.className = 'staff-compact-info';

            const nameDiv = document.createElement('div');
            nameDiv.className = 'staff-compact-name';
            nameDiv.textContent = member.name || '';
            infoDiv.appendChild(nameDiv);

            const roleDiv = document.createElement('div');
            roleDiv.className = 'staff-compact-role';
            roleDiv.textContent = roleName;
            infoDiv.appendChild(roleDiv);

            topDiv.appendChild(infoDiv);
            card.appendChild(topDiv);
            cardsContainer.appendChild(card);
          });

          groupCard.appendChild(cardsContainer);
          container.appendChild(groupCard);
        });
      });
  }

  // Initial render on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', renderStaff);
  // Re-render on language change if function exists
  if (typeof window.registerLanguageChange === 'function') {
    window.registerLanguageChange(renderStaff);
  }
})();
