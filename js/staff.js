// js/staff.js – Fetch and render staff members dynamically
(function () {
  var rolesLibrary = [];

  function getCurrentLang() {
    return document.body.classList.contains('georgian') ? 'ge' : 'en';
  }

  function formatRoleLabel(role, lang) {
    if (!role) return lang === 'ge' ? 'სხვა' : 'Other';
    if (lang === 'ge') return (role.role_ge || '').trim() || (role.role_en || '').trim() || 'სხვა';
    return (role.role_en || '').trim() || (role.role_ge || '').trim() || 'Other';
  }

  function formatRoleBadgeText(role, lang) {
    if (!role) return '';
    if (lang === 'ge') return (role.role_ge || '').trim() || (role.role_en || '').trim();
    return (role.role_en || '').trim() || (role.role_ge || '').trim();
  }

  function getMemberRoleIds(member) {
    if (!member.roles) return [];
    if (Array.isArray(member.roles)) {
      return member.roles.map(function (entry) {
        if (typeof entry === 'string') return entry;
        if (entry && entry.id) return entry.id;
        return null;
      }).filter(Boolean);
    }
    return [];
  }

  function getMemberRolesResolved(member) {
    var lang = getCurrentLang();
    var ids = getMemberRoleIds(member);
    var resolved = [];

    if (ids.length) {
      ids.forEach(function (id) {
        var role = rolesLibrary.find(function (r) { return r.id === id; });
        if (role) resolved.push(role);
      });
    }

    if (!resolved.length && (member.role_en || member.role_ge)) {
      var roleEn = (member.role_en || '').split('|')[0].trim();
      var roleGe = (member.role_ge || '').split('|')[0].trim();
      var match = rolesLibrary.find(function (r) { return r.role_en === roleEn; });
      if (match) {
        resolved.push(match);
      } else {
        resolved.push({
          id: null,
          role_en: roleEn,
          role_ge: roleGe,
          badge_color: member.badge_color || '#8d6e63',
          badge_text_color: member.badge_text_color || '#ffffff',
          priority: member.role_priority != null ? member.role_priority : 999
        });
      }
    }

    resolved.sort(function (a, b) {
      return (a.priority != null ? a.priority : 999) - (b.priority != null ? b.priority : 999);
    });
    return resolved;
  }

  function getPrimaryRole(member) {
    var roles = getMemberRolesResolved(member);
    return roles.length ? roles[0] : null;
  }

  function getPrimaryRoleId(member) {
    var primary = getPrimaryRole(member);
    return primary && primary.id ? primary.id : (primary ? primary.role_en : 'Other');
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

    var lang = getCurrentLang();
    var memberRoles = getMemberRolesResolved(member);
    var popover = document.createElement('div');
    popover.className = 'staff-popover';

    var header = document.createElement('div');
    header.className = 'staff-popover-header';

    var avatarWrap = document.createElement('div');
    avatarWrap.className = 'staff-popover-avatar-wrap';
    var img = document.createElement('img');
    img.src = member.photo_url || '';
    img.alt = member.name || '';
    img.className = 'staff-popover-avatar';
    avatarWrap.appendChild(img);
    header.appendChild(avatarWrap);

    var details = document.createElement('div');
    details.className = 'staff-popover-details';

    var name = document.createElement('div');
    name.className = 'staff-popover-name';
    name.textContent = member.name || '';
    details.appendChild(name);

    var badges = document.createElement('div');
    badges.className = 'staff-popover-badges';

    memberRoles.forEach(function (role) {
      var roleBadge = document.createElement('span');
      roleBadge.className = 'staff-popover-badge role-badge';
      roleBadge.textContent = formatRoleBadgeText(role, lang);
      roleBadge.style.backgroundColor = role.badge_color || '#8d6e63';
      roleBadge.style.color = role.badge_text_color || '#ffffff';
      badges.appendChild(roleBadge);
    });

    var teamBadge = document.createElement('span');
    teamBadge.className = 'staff-popover-badge staff-member-badge';
    teamBadge.textContent = lang === 'ge' ? 'გუნდის წევრი' : 'Team Member';
    badges.appendChild(teamBadge);
    details.appendChild(badges);

    header.appendChild(details);
    popover.appendChild(header);

    var bioVal = (lang === 'ge' ? member.bio_ge : member.bio_en) || bioText;
    if (bioVal) {
      var bio = document.createElement('div');
      bio.className = 'staff-popover-bio';
      bio.textContent = bioVal;
      popover.appendChild(bio);
    }

    var stats = document.createElement('div');
    stats.className = 'staff-popover-stats';

    var yearsVal = member.years_at !== null && member.years_at !== undefined ? member.years_at : '-';
    var specVal = lang === 'ge' ? (member.specialization_ge || '-') : (member.specialization_en || '-');
    var locVal = member.location || '-';

    var statData = [
      { label: lang === 'ge' ? 'წლები' : 'Years', val: yearsVal },
      { label: lang === 'ge' ? 'სპეციალიზაცია' : 'Specialization', val: specVal },
      { label: lang === 'ge' ? 'მდებარეობა' : 'Location', val: locVal }
    ];

    statData.forEach(function (item) {
      var statItem = document.createElement('div');
      statItem.className = 'staff-popover-stat-item';
      var statLabel = document.createElement('span');
      statLabel.className = 'staff-popover-stat-label';
      statLabel.textContent = item.label;
      var statValue = document.createElement('span');
      statValue.className = 'staff-popover-stat-value';
      var statValueText = document.createElement('span');
      statValueText.className = 'stat-value-text';
      statValueText.textContent = item.val;
      statValue.appendChild(statValueText);
      statValue.addEventListener('mouseenter', function() { statValueText.classList.remove('stat-value-text'); });
      statValue.addEventListener('mouseleave', function() { statValueText.classList.add('stat-value-text'); });
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
      var rect = card.getBoundingClientRect();
      var popoverWidth = popover.offsetWidth;
      var popoverHeight = popover.offsetHeight;
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      var scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
      var cardCenterX = rect.left + scrollLeft + rect.width / 2;
      var popoverTop = rect.top + scrollTop - popoverHeight - 12;
      var popoverLeft = cardCenterX - popoverWidth / 2;
      var windowMargin = 10;
      var maxLeft = window.innerWidth - popoverWidth - windowMargin;
      if (popoverLeft < windowMargin) popoverLeft = windowMargin;
      else if (popoverLeft > maxLeft) popoverLeft = maxLeft;
      popover.style.setProperty('--arrow-left', (cardCenterX - popoverLeft) + 'px');
      popover.style.top = popoverTop + 'px';
      popover.style.left = popoverLeft + 'px';
    }

    updatePosition();
    popover.addEventListener('click', function (e) { e.stopPropagation(); });
  }

  document.addEventListener('click', function (e) {
    if (activePopover) {
      var clickedCard = e.target.closest('.staff-compact-card');
      if (!clickedCard && !e.target.closest('.staff-popover')) {
        closeActivePopover();
      }
    }
  });

  window.addEventListener('resize', closeActivePopover);
  window.addEventListener('scroll', closeActivePopover, { passive: true });

  function renderStaff() {
    closeActivePopover();
    var container = document.getElementById('staff-section');
    if (!container) return;

    if (!window.supabaseClient) {
      setTimeout(renderStaff, 300);
      return;
    }

    container.innerHTML = '<div class="loading">Loading staff...</div>';

    Promise.all([
      window.supabaseClient.from('roles').select('*').order('priority', { ascending: true }),
      window.supabaseClient.from('staff').select('*').order('order_index', { ascending: true })
    ]).then(function (results) {
      var rolesResult = results[0];
      var staffResult = results[1];
      container.innerHTML = '';

      if (rolesResult.error) {
        container.innerHTML = '<div style="color:red">Error loading roles: ' + rolesResult.error.message + '</div>';
        return;
      }
      if (staffResult.error) {
        container.innerHTML = '<div style="color:red">Error loading staff: ' + staffResult.error.message + '</div>';
        return;
      }

      rolesLibrary = rolesResult.data || [];
      var data = staffResult.data || [];
      var lang = getCurrentLang();

      if (!data.length) {
        container.textContent = 'No staff members found.';
        return;
      }

      var groups = {};
      data.forEach(function (member) {
        var groupKey = getPrimaryRoleId(member);
        if (!groups[groupKey]) groups[groupKey] = [];
        groups[groupKey].push(member);
      });

      var orderedRoles = rolesLibrary.slice();
      var groupedKeys = Object.keys(groups);

      groupedKeys.forEach(function (key) {
        if (!orderedRoles.some(function (r) { return r.id === key || r.role_en === key; })) {
          var sample = getPrimaryRole(groups[key][0]);
          if (sample) orderedRoles.push(sample);
        }
      });

      orderedRoles.sort(function (a, b) {
        return (a.priority != null ? a.priority : 999) - (b.priority != null ? b.priority : 999);
      });

      orderedRoles.forEach(function (roleMeta) {
        var roleKey = roleMeta.id || roleMeta.role_en;
        if (!groups[roleKey] || !groups[roleKey].length) return;

        var groupCard = document.createElement('div');
        groupCard.className = 'staff-group-panel';

        var roleHeader = document.createElement('h3');
        roleHeader.className = 'staff-group-header';
        roleHeader.textContent = formatRoleLabel(roleMeta, lang);
        groupCard.appendChild(roleHeader);

        var cardsContainer = document.createElement('div');
        cardsContainer.className = 'staff-group-cards';

        groups[roleKey].forEach(function (member) {
          var primaryRole = getPrimaryRole(member);
          var roleName = formatRoleBadgeText(primaryRole, lang);
          var bioText = (member.role_en || '').split('|')[1] || '';
          var hasBio = member.bio_en || member.bio_ge || bioText;

          var card = document.createElement('div');
          card.className = 'staff-compact-card';

          if (hasBio) {
            card.classList.add('has-bio');
            card.title = lang === 'ge' ? 'დააწკაპუნეთ მეტი ინფორმაციისთვის' : 'Click to learn more';
            card.onclick = function (e) {
              e.stopPropagation();
              showPopover(card, member, bioText);
            };
          }

          var topDiv = document.createElement('div');
          topDiv.className = 'staff-card-top';

          var cardImg = document.createElement('img');
          cardImg.src = member.photo_url || '';
          cardImg.alt = member.name || '';
          cardImg.className = 'staff-compact-photo';
          topDiv.appendChild(cardImg);

          var infoDiv = document.createElement('div');
          infoDiv.className = 'staff-compact-info';

          var nameDiv = document.createElement('div');
          nameDiv.className = 'staff-compact-name';
          nameDiv.textContent = member.name || '';
          infoDiv.appendChild(nameDiv);

          var roleDiv = document.createElement('div');
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
