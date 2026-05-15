async function loadActivities() {
  const body = document.getElementById('activities-body');
  const totalHoursCell = document.getElementById('total-hours');
  const detailOverlay = document.getElementById('activity-detail-overlay');
  const detailCloseButton = document.getElementById('detail-close');
  const detailTitle = document.getElementById('detail-title');
  const detailCategory = document.getElementById('detail-category');
  const detailHours = document.getElementById('detail-hours');
  const detailDescription = document.getElementById('detail-description');
  const detailImage = document.getElementById('detail-image');

  const closeDetailView = () => {
    if (!detailOverlay) {
      return;
    }
    detailOverlay.hidden = true;
    document.body.style.overflow = '';
  };

  const openDetailView = (activity) => {
    if (
      !detailOverlay ||
      !detailTitle ||
      !detailCategory ||
      !detailHours ||
      !detailDescription ||
      !detailImage
    ) {
      return;
    }

    detailTitle.textContent = activity.name;
    detailCategory.textContent = activity.category;
    detailHours.textContent = `${activity.hours} hour${activity.hours === 1 ? '' : 's'}`;
    detailDescription.textContent = activity.description;
    detailImage.src = activity.proofImage;
    detailImage.alt = activity.proofAlt || `Proof for ${activity.name}`;

    detailOverlay.hidden = false;
    document.body.style.overflow = 'hidden';
  };

  if (!body || !totalHoursCell) {
    return;
  }

  if (window.location.protocol === 'file:') {
    body.innerHTML =
      '<tr><td colspan="4">Le navigateur bloque la lecture de data/activities.json en mode file://. Lance un serveur local: <code>python3 -m http.server 8000</code> puis ouvre <code>http://localhost:8000/activities.html</code>.</td></tr>';
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

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
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
  const groupedActivities = new Map();

  activities.forEach((activity) => {
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
    const proofImage =
      typeof activity.proofImage === 'string' &&
      (activity.proofImage.startsWith('./assets/images/') ||
        activity.proofImage.startsWith('assets/images/'))
        ? activity.proofImage
        : './assets/images/workshop.svg';

    const normalizedActivity = {
      name,
      category,
      description,
      hours,
      proofImage,
      proofAlt: activity.proofAlt,
    };

    if (!groupedActivities.has(category)) {
      groupedActivities.set(category, []);
    }

    groupedActivities.get(category).push(normalizedActivity);

    totalHours += hours;
  });

  groupedActivities.forEach((categoryActivities, categoryName) => {
    const categoryRow = document.createElement('tr');
    categoryRow.className = 'category-row';

    const categoryCell = document.createElement('th');
    categoryCell.scope = 'colgroup';
    categoryCell.colSpan = 4;
    categoryCell.textContent = categoryName;

    categoryRow.appendChild(categoryCell);
    body.appendChild(categoryRow);

    categoryActivities.forEach((activity) => {
      const row = document.createElement('tr');

      const activityCell = document.createElement('td');
      activityCell.textContent = activity.name;

      const hoursCell = document.createElement('td');
      hoursCell.textContent = String(activity.hours);

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
      detailsButton.textContent = 'View details';
      detailsButton.addEventListener('click', () => openDetailView(activity));
      actionCell.appendChild(detailsButton);

      row.appendChild(activityCell);
      row.appendChild(hoursCell);
      row.appendChild(proofCell);
      row.appendChild(actionCell);
      body.appendChild(row);
    });
  });

  totalHoursCell.textContent = String(totalHours);
}

loadActivities().catch((error) => {
  const body = document.getElementById('activities-body');
  if (body) {
    body.innerHTML =
      '<tr><td colspan="4">Impossible de charger les activites pour le moment.</td></tr>';
  }
  console.error('Could not load activities:', error);
});
