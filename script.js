async function loadActivities() {
  const body = document.getElementById('activities-body');
  const totalHoursCell = document.getElementById('total-hours');

  if (!body || !totalHoursCell) {
    return;
  }

  const response = await fetch('/data/activities.json');
  const activities = await response.json();

  let totalHours = 0;

  activities.forEach((activity) => {
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

    row.appendChild(activityCell);
    row.appendChild(hoursCell);
    row.appendChild(proofCell);
    body.appendChild(row);

    totalHours += Number(activity.hours) || 0;
  });

  totalHoursCell.textContent = String(totalHours);
}

loadActivities().catch((error) => {
  console.error('Could not load activities:', error);
});
