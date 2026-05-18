const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const breweryGrid = document.getElementById('breweryGrid');
const status = document.getElementById('status');
const loader = document.getElementById('loader');
const chartWrap = document.getElementById('chartWrap');
const toast = document.getElementById('toast');

let breweryChart = null;

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2800);
}

function setLoader(on) {
  loader.style.display = on ? 'block' : 'none';
}

async function searchBreweries(city) {
  setLoader(true);
  breweryGrid.innerHTML = '';
  chartWrap.style.display = 'none';
  status.textContent = '';
  try {
    const res = await fetch(`/api/breweries?city=${encodeURIComponent(city)}`);
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      status.textContent = `No breweries found in "${city}". Try another city.`;
      setLoader(false);
      return;
    }
    status.textContent = `Showing ${data.length} brewer${data.length > 1 ? 'ies' : 'y'} in ${city}`;
    renderBreweries(data);
    renderBreweryChart(data);
  } catch (e) {
    status.textContent = 'Error fetching breweries.';
  } finally {
    setLoader(false);
  }
}

function renderBreweries(breweries) {
  breweryGrid.innerHTML = breweries.map(b => {
    const address = [b.street, b.city, b.state].filter(Boolean).join(', ');
    const type = b.brewery_type || 'unknown';
    const typeColor = { micro: 'tag-gold', brewpub: 'tag-green', regional: 'tag-navy', large: 'tag-navy' }[type] || 'tag-gray';
    return `
      <div class="brewery-card">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:0.5rem;">
          <h3>${b.name}</h3>
          <span class="tag ${typeColor}">${type}</span>
        </div>
        ${address ? `<p>📍 ${address}</p>` : ''}
        ${b.phone ? `<p>📞 ${b.phone}</p>` : ''}
        ${b.website_url ? `<p><a href="${b.website_url}" target="_blank">🔗 ${b.website_url.replace(/^https?:\/\//, '')}</a></p>` : ''}
      </div>
    `;
  }).join('');
}

function renderBreweryChart(breweries) {
  const typeCounts = {};
  breweries.forEach(b => {
    const t = b.brewery_type || 'unknown';
    typeCounts[t] = (typeCounts[t] || 0) + 1;
  });

  const labels = Object.keys(typeCounts);
  const values = Object.values(typeCounts);
  const colors = ['#1a2744','#e8a020','#2d7a4f','#243156','#f5c060','#c0392b','#5c5c52'];

  const ctx = document.getElementById('breweryChart').getContext('2d');
  if (breweryChart) breweryChart.destroy();
  breweryChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Count',
        data: values,
        backgroundColor: colors.slice(0, labels.length),
        borderRadius: 6,
        borderWidth: 0
      }]
    },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: '#ebebе6' } },
        x: { grid: { display: false } }
      },
      responsive: true
    }
  });

  chartWrap.style.display = 'block';
}

searchBtn.addEventListener('click', () => {
  const val = cityInput.value.trim();
  if (val) searchBreweries(val);
});

cityInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const val = cityInput.value.trim();
    if (val) searchBreweries(val);
  }
});

searchBreweries('Baltimore');
