async function loadActivities() {
  const body = document.getElementById('activities-body');
  const totalHoursCell = document.getElementById('total-hours');

  if (!body || !totalHoursCell) {
    return;
  }

  const response = await fetch('/data/activities.json');
  if (!response.ok) {
    console.error(
      `Activities request failed: ${response.status} ${response.statusText}`
    );
    throw new Error('Failed to load activities data.');
  }
  const activities = await response.json();

  let totalHours = 0;

  activities.forEach((activity) => {
    const name =
      typeof activity.name === 'string' && activity.name.trim()
        ? activity.name.trim()
        : 'Unnamed activity';
    const hours = Number(activity.hours) || 0;
    const proofImage =
      typeof activity.proofImage === 'string' &&
      activity.proofImage.startsWith('/assets/images/')
        ? activity.proofImage
        : '/assets/images/workshop.svg';
    const row = document.createElement('tr');

    const activityCell = document.createElement('td');
    activityCell.textContent = name;

    const hoursCell = document.createElement('td');
    hoursCell.textContent = String(hours);

    const proofCell = document.createElement('td');
    const image = document.createElement('img');
    image.className = 'proof-image';
    image.src = proofImage;
    image.alt = activity.proofAlt || `Proof for ${name}`;
    proofCell.appendChild(image);

    row.appendChild(activityCell);
    row.appendChild(hoursCell);
    row.appendChild(proofCell);
    body.appendChild(row);

    totalHours += hours;
  });

  totalHoursCell.textContent = String(totalHours);
}

loadActivities().catch((error) => {
  const body = document.getElementById('activities-body');
  if (body) {
    body.innerHTML =
      '<tr><td colspan="3">Unable to load activities data right now.</td></tr>';
  }
  console.error('Could not load activities:', error);
});
