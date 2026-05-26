// Handles light/dark theme switching and icon/state synchronization.
function initializeThemeToggle() {
  const themeToggleButton = document.getElementById('theme-toggle');
  const moonIcon = themeToggleButton
    ? themeToggleButton.querySelector('.theme-icon-moon')
    : null;
  const sunIcon = themeToggleButton
    ? themeToggleButton.querySelector('.theme-icon-sun')
    : null;
  const themeStorageKey = 'preferred-theme';

  const getStoredTheme = () => {
    try {
      const storedTheme = localStorage.getItem(themeStorageKey);
      return storedTheme === 'dark' || storedTheme === 'light'
        ? storedTheme
        : null;
    } catch (error) {
      return null;
    }
  };

  const saveTheme = (theme) => {
    try {
      localStorage.setItem(themeStorageKey, theme);
    } catch (error) {
      // Ignore storage failures and keep in-memory theme behavior.
    }
  };

  const applyTheme = (theme) => {
    const activeTheme = theme === 'dark' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', activeTheme);

    if (moonIcon && sunIcon && themeToggleButton) {
      const isDark = activeTheme === 'dark';
      moonIcon.hidden = isDark;
      sunIcon.hidden = !isDark;
      moonIcon.style.display = isDark ? 'none' : 'block';
      sunIcon.style.display = isDark ? 'block' : 'none';
      moonIcon.setAttribute('aria-hidden', isDark ? 'true' : 'false');
      sunIcon.setAttribute('aria-hidden', isDark ? 'false' : 'true');
      themeToggleButton.setAttribute(
        'aria-label',
        isDark ? 'Activer le mode clair' : 'Activer le mode sombre'
      );
    }

    return activeTheme;
  };

  // Restore saved preference, falling back to light mode.
  let currentTheme = applyTheme(getStoredTheme() || 'light');

  if (!themeToggleButton) {
    return;
  }

  themeToggleButton.addEventListener('click', () => {
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    currentTheme = applyTheme(nextTheme);
    saveTheme(currentTheme);
  });
}

// Loads activities data and renders grouped rows with a detail modal.
async function loadActivities() {
  const body = document.getElementById('activities-body');
  const totalHoursCell = document.getElementById('total-hours');
  const totalHoursSpentCell = document.getElementById('total-hours-spent');
  const detailOverlay = document.getElementById('activity-detail-overlay');
  const detailCloseButton = document.getElementById('detail-close');
  const detailTitle = document.getElementById('detail-title');
  const detailCategory = document.getElementById('detail-category');
  const detailHours = document.getElementById('detail-hours');
  const detailDescription = document.getElementById('detail-description');
  const detailImages = document.getElementById('detail-images');
  const imageViewerOverlay = document.getElementById('image-viewer-overlay');
  const imageViewerClose = document.getElementById('image-viewer-close');
  const imageViewerContent = document.getElementById('image-viewer-content');

  const closeDetailView = () => {
    if (!detailOverlay) {
      return;
    }
    detailOverlay.hidden = true;
    document.body.style.overflow = '';
  };

  const closeImageViewer = () => {
    if (!imageViewerOverlay) return;
    imageViewerOverlay.hidden = true;
  };

  const openImageViewer = (src, alt) => {
    if (!imageViewerOverlay || !imageViewerContent) return;
    imageViewerContent.src = src;
    imageViewerContent.alt = alt || '';
    imageViewerOverlay.hidden = false;
  };

  const openDetailView = (activity) => {
    if (
      !detailOverlay ||
      !detailTitle ||
      !detailCategory ||
      !detailHours ||
      !detailDescription ||
      !detailImages
    ) {
      return;
    }

    detailTitle.textContent = activity.name;
    detailCategory.textContent = activity.category;
    detailHours.textContent = `Hours: ${activity.hours} h - Hours spent: ${activity.hoursSpent} h`;
    detailDescription.textContent = activity.description;
    
    // Clear previous images and render all images for this activity.
    detailImages.innerHTML = '';
    const imagesToDisplay = activity.images && activity.images.length > 0 
      ? activity.images 
      : [{ src: activity.proofImage, alt: activity.proofAlt || `Proof for ${activity.name}` }];
    
    imagesToDisplay.forEach((img) => {
      const imgElement = document.createElement('img');
      imgElement.className = 'detail-image';
      imgElement.src = img.src;
      imgElement.alt = img.alt || '';
      imgElement.addEventListener('click', () => openImageViewer(img.src, img.alt));
      detailImages.appendChild(imgElement);
    });

    detailOverlay.hidden = false;
    document.body.style.overflow = 'hidden';
  };

  if (!body || !totalHoursCell || !totalHoursSpentCell) {
    return;
  }

  if (window.location.protocol === 'file:') {
    body.innerHTML =
      '<tr><td colspan="5">Le navigateur bloque la lecture de data/activities.json en mode file://. Lance un serveur local: <code>python3 -m http.server 8000</code> puis ouvre <code>http://localhost:8000/activities.html</code>.</td></tr>';
    return;
  }

  if (detailOverlay) {
    detailOverlay.hidden = true;
  }

  if (detailCloseButton) {
    detailCloseButton.addEventListener('click', closeDetailView);
  }

  if (detailOverlay) {
    detailOverlay.addEventListener('click', (event) => {
      if (event.target === detailOverlay) {
        closeDetailView();
      }
    });
  }

  if (imageViewerClose) {
    imageViewerClose.addEventListener('click', closeImageViewer);
  }

  if (imageViewerOverlay) {
    imageViewerOverlay.addEventListener('click', (event) => {
      if (event.target === imageViewerOverlay) {
        closeImageViewer();
      }
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeImageViewer();
      closeDetailView();
    }
  });

  const response = await fetch('./data/activities.json');
  if (!response.ok) {
    console.error(
      `Activities request failed: ${response.status} ${response.statusText}`
    );
    throw new Error('Failed to load activities data.');
  }
  const activities = await response.json();

  let totalHours = 0;
  let totalHoursSpent = 0;
  const groupedActivities = new Map();

  activities.forEach((activity) => {
    // Normalize incoming data so rendering stays robust.
    const name =
      typeof activity.name === 'string' && activity.name.trim()
        ? activity.name.trim()
        : 'Unnamed activity';
    const category =
      typeof activity.category === 'string' && activity.category.trim()
        ? activity.category.trim()
        : 'Other';
    const description =
      typeof activity.description === 'string' && activity.description.trim()
        ? activity.description.trim()
        : 'No additional details available for this activity.';
    const hours = Number(activity.hours) || 0;
    const hoursSpent = Number(activity.hoursSpend);
    const normalizedHoursSpent = Number.isFinite(hoursSpent) ? hoursSpent : hours;
    const proofImage =
      typeof activity.proofImage === 'string' &&
      (activity.proofImage.startsWith('./assets/images/') ||
        activity.proofImage.startsWith('assets/images/'))
        ? activity.proofImage
        : './assets/images/workshop.svg';

    const images = Array.isArray(activity.images) 
      ? activity.images.filter(img => img && img.src)
      : [];
    
    const normalizedActivity = {
      name,
      category,
      description,
      hours,
      hoursSpent: normalizedHoursSpent,
      proofImage,
      proofAlt: activity.proofAlt,
      images,
    };

    if (!groupedActivities.has(category)) {
      groupedActivities.set(category, []);
    }

    groupedActivities.get(category).push(normalizedActivity);

    totalHours += hours;
    totalHoursSpent += normalizedHoursSpent;
  });

  groupedActivities.forEach((categoryActivities, categoryName) => {
    // Insert a category header row before each category's activities.
    const categoryRow = document.createElement('tr');
    categoryRow.className = 'category-row';

    const categoryCell = document.createElement('th');
    categoryCell.scope = 'colgroup';
    categoryCell.colSpan = 5;
    categoryCell.textContent = categoryName;

    categoryRow.appendChild(categoryCell);
    body.appendChild(categoryRow);

    categoryActivities.forEach((activity) => {
      const row = document.createElement('tr');

      const activityCell = document.createElement('td');
      activityCell.textContent = activity.name;

      const hoursCell = document.createElement('td');
      hoursCell.textContent = `${activity.hours} h`;

      const hoursSpentCell = document.createElement('td');
      hoursSpentCell.textContent = `${activity.hoursSpent} h`;

      const proofCell = document.createElement('td');
      const image = document.createElement('img');
      image.className = 'proof-image';
      image.src = activity.proofImage;
      image.alt = activity.proofAlt || `Proof for ${activity.name}`;
      proofCell.appendChild(image);

      const actionCell = document.createElement('td');
      actionCell.className = 'actions-cell';
      const detailsButton = document.createElement('button');
      detailsButton.type = 'button';
      detailsButton.className = 'details-button';
      detailsButton.textContent = 'Voir détail';
      detailsButton.addEventListener('click', () => openDetailView(activity));
      actionCell.appendChild(detailsButton);

      row.appendChild(activityCell);
      row.appendChild(hoursCell);
      row.appendChild(hoursSpentCell);
      row.appendChild(proofCell);
      row.appendChild(actionCell);
      body.appendChild(row);
    });
  });

  totalHoursCell.textContent = String(totalHours) + " h";
  totalHoursSpentCell.textContent = String(totalHoursSpent) + " h";
}

initializeThemeToggle();

loadActivities().catch((error) => {
  // Fallback message when JSON loading fails.
  const body = document.getElementById('activities-body');
  if (body) {
    body.innerHTML =
      '<tr><td colspan="5">Impossible de charger les activites pour le moment.</td></tr>';
  }
  console.error('Could not load activities:', error);
});
