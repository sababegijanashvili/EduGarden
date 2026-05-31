// js/staff.js – Fetch and render staff members dynamically
(function () {
  function getCurrentLang() {
    return document.body.classList.contains('georgian') ? 'ge' : 'en';
  }

  function getMemberRoles(member) {
    if (member.roles && Array.isArray(member.roles) && member.roles.length) {
      return member.roles.map(function (r) {
        return {
          role_en: (r.role_en || '').trim(),
          role_ge: (r.role_ge || '').trim(),
          badge_color: r.badge_color || '#8d6e63',
          badge_text_color: r.badge_text_color || '#ffffff',
          role_priority: r.role_priority != null ? r.role_priority : 999
        };
      }).sort(function (a, b) { return a.role_priority - b.role_priority; });
    }
    var roleEn = (member.role_en || '').split('|')[0].trim();
    var roleGe = (member.role_ge || '').split('|')[0].trim();
    if (!roleEn && !roleGe) return [];
    var isFounder = roleEn === 'Founder' || roleGe === 'დამფუძნებელი';
    return [{
      role_en: roleEn,
      role_ge: roleGe,
      badge_color: member.badge_color || (isFounder ? '#b24060' : '#8d6e63'),
      badge_text_color: member.badge_text_color || '#ffffff',
      role_priority: member.role_priority != null ? member.role_priority : 999
    }];
  }

  function getPrimaryRole(member) {
    var roles = getMemberRoles(member);
    return roles.length ? roles[0] : null;
  }

  function getPrimaryRoleKey(member) {
    var primary = getPrimaryRole(member);
    return primary && primary.role_en ? primary.role_en : (getCurrentLang() === 'ge' ? 'სხვა' : 'Other');
  }

  function formatRoleLabel(role, lang) {
    if (!role) return lang === 'ge' ? 'სხვა' : 'Other';
    var roleEn = role.role_en || '';
    var roleGe = role.role_ge || '';
    if (lang === 'ge') {
      return roleGe || roleEn || (lang === 'ge' ? 'სხვა' : 'Other');
    }
    return roleEn || roleGe || 'Other';
  }

  function collectRoleRegistry(data) {
    var registry = {};
    data.forEach(function (member) {
      getMemberRoles(member).forEach(function (role) {
        var key = role.role_en || 'Other';
        if (!registry[key] || role.role_priority < registry[key].role_priority) {
          registry[key] = {
            role_en: key,
            role_ge: role.role_ge,
            role_priority: role.role_priority
          };
        }
      });
    });
    return Object.keys(registry)
      .map(function (key) { return registry[key]; })
      .sort(function (a, b) { return a.role_priority - b.role_priority; });
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

  function showPopover(card, member, bioText) {
    if (activeCard === card) {
      closeActivePopover();
      return;
    }
    closeActivePopover();

    const lang = getCurrentLang();
    const popover = document.createElement('div');
    popover.className = 'staff-popover';

    const name = document.createElement('div');
    name.className = 'staff-popover-name';
    name.textContent = member.name || '';
    popover.appendChild(name);

    const badges = document.createElement('div');
    badges.className = 'staff-popover-badges';

    getMemberRoles(member).forEach(function (role) {
      const roleBadge = document.createElement('span');
      roleBadge.className = 'staff-popover-badge role-badge';
      roleBadge.textContent = formatRoleLabel(role, lang);
      roleBadge.style.backgroundColor = role.badge_color || '#8d6e63';
      roleBadge.style.color = role.badge_text_color || '#ffffff';
      badges.appendChild(roleBadge);
    });

    const teamBadge = document.createElement('span');
    teamBadge.className = 'staff-popover-badge staff-member-badge';
    teamBadge.textContent = lang === 'ge' ? 'გუნდის წევრი' : 'Team Member';
    badges.appendChild(teamBadge);
    popover.appendChild(badges);

    const bioVal = (lang === 'ge' ? member.bio_ge : member.bio_en) || bioText;
    if (bioVal) {
      const bio = document.createElement('div');
      bio.className = 'staff-popover-bio';
      bio.textContent = bioVal;
      popover.appendChild(bio);
    }

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

    statData.forEach(function (item) {
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
      const popoverTop = rect.top + scrollTop - popoverHeight - 12;
      let popoverLeft = cardCenterX - popoverWidth / 2;

      const windowMargin = 10;
      const maxLeft = window.innerWidth - popoverWidth - windowMargin;
      if (popoverLeft < windowMargin) {
        popoverLeft = windowMargin;
      } else if (popoverLeft > maxLeft) {
        popoverLeft = maxLeft;
      }

      const relativeArrowLeft = cardCenterX - popoverLeft;
      popover.style.setProperty('--arrow-left', relativeArrowLeft + 'px');
      popover.style.top = popoverTop + 'px';
      popover.style.left = popoverLeft + 'px';
    }

    updatePosition();
    popover.addEventListener('click', function (e) { e.stopPropagation(); });
  }

  document.addEventListener('click', function (e) {
    if (activePopover) {
      const clickedCard = e.target.closest('.staff-compact-card');
      if (!clickedCard && !e.target.closest('.staff-popover')) {
        closeActivePopover();
      }
    }
  });

  window.addEventListener('resize', closeActivePopover);
  window.addEventListener('scroll', closeActivePopover, { passive: true });

  function renderStaff() {
    closeActivePopover();
    const container = document.getElementById('staff-section');
    if (!container) return;

    if (!window.supabaseClient) {
      setTimeout(renderStaff, 300);
      return;
    }

    container.innerHTML = '<div class="loading">Loading staff...</div>';

    window.supabaseClient
      .from('staff')
      .select('*')
      .order('role_priority', { ascending: true })
      .order('order_index', { ascending: true })
      .then(function (result) {
        const data = result.data;
        const error = result.error;
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
        const roleRegistry = collectRoleRegistry(data);
        const groups = {};

        data.forEach(function (member) {
          const roleKey = getPrimaryRoleKey(member);
          if (!groups[roleKey]) groups[roleKey] = [];
          groups[roleKey].push(member);
        });

        roleRegistry.forEach(function (roleMeta) {
          const roleKey = roleMeta.role_en;
          if (!groups[roleKey] || !groups[roleKey].length) return;

          const groupCard = document.createElement('div');
          groupCard.className = 'staff-group-panel';

          const roleHeader = document.createElement('h3');
          roleHeader.className = 'staff-group-header';
          if (roleMeta.role_ge && roleMeta.role_en) {
            roleHeader.textContent = roleMeta.role_ge + ' (' + roleMeta.role_en + ')';
          } else {
            roleHeader.textContent = roleMeta.role_en || roleMeta.role_ge || roleKey;
          }
          groupCard.appendChild(roleHeader);

          const cardsContainer = document.createElement('div');
          cardsContainer.className = 'staff-group-cards';

          groups[roleKey].forEach(function (member) {
            const primaryRole = getPrimaryRole(member);
            const roleName = formatRoleLabel(primaryRole, lang);
            const bioText = (member.role_en || '').split('|')[1] || '';
            const hasBio = member.bio_en || member.bio_ge || bioText;

            const card = document.createElement('div');
            card.className = 'staff-compact-card';

            if (hasBio) {
              card.classList.add('has-bio');
              card.title = lang === 'ge' ? 'დააწკაპუნეთ მეტი ინფორმაციისთვის' : 'Click to learn more';
              card.onclick = function (e) {
                e.stopPropagation();
                showPopover(card, member, bioText);
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

  document.addEventListener('DOMContentLoaded', renderStaff);
  if (typeof window.registerLanguageChange === 'function') {
    window.registerLanguageChange(renderStaff);
  }
})();
