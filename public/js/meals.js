const ingredientInput = document.getElementById('ingredientInput');
const searchBtn = document.getElementById('searchBtn');
const randomBtn = document.getElementById('randomBtn');
const mealGrid = document.getElementById('mealGrid');
const detailPanel = document.getElementById('detailPanel');
const status = document.getElementById('status');
const loader = document.getElementById('loader');
const toast = document.getElementById('toast');

let currentMeal = null;
let ingredientChart = null;

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2800);
}

function setLoader(on) {
  loader.style.display = on ? 'block' : 'none';
  mealGrid.style.display = on ? 'none' : 'grid';
}

async function searchMeals(ingredient) {
  setLoader(true);
  detailPanel.classList.remove('visible');
  try {
    const res = await fetch(`/api/meals?ingredient=${encodeURIComponent(ingredient)}`);
    const data = await res.json();
    const meals = data.meals || [];
    status.textContent = meals.length
      ? `Showing ${meals.length} meal${meals.length > 1 ? 's' : ''} with "${ingredient}"`
      : `No meals found for "${ingredient}"`;
    renderMealGrid(meals.slice(0, 12));
  } catch (e) {
    status.textContent = 'Error fetching meals.';
  } finally {
    setLoader(false);
  }
}

async function getRandomMeal() {
  setLoader(true);
  detailPanel.classList.remove('visible');
  status.textContent = '';
  try {
    const res = await fetch('/api/meals/random');
    const data = await res.json();
    const meal = data.meals?.[0];
    if (meal) {
      status.textContent = 'Here\'s a random meal for you!';
      renderSingleMeal(meal);
    }
  } catch (e) {
    status.textContent = 'Error fetching random meal.';
  } finally {
    setLoader(false);
  }
}

function renderMealGrid(meals) {
  if (!meals.length) {
    mealGrid.innerHTML = '<div class="empty-state"><div class="icon">🍽️</div><p>No meals found. Try another ingredient.</p></div>';
    return;
  }
  mealGrid.innerHTML = meals.map(m => `
    <div class="card" onclick="loadMealDetail('${m.idMeal}')">
      <img src="${m.strMealThumb}" alt="${m.strMeal}" loading="lazy">
      <div class="card-body">
        <h3>${m.strMeal}</h3>
        <p>Tap to view full recipe</p>
      </div>
    </div>
  `).join('');
}

function renderSingleMeal(meal) {
  mealGrid.innerHTML = `
    <div class="card" style="cursor:default">
      <img src="${meal.strMealThumb}" alt="${meal.strMeal}" loading="lazy">
      <div class="card-body">
        <h3>${meal.strMeal}</h3>
        <span class="tag tag-navy">${meal.strCategory}</span>
        <span class="tag tag-gold" style="margin-left:4px;">${meal.strArea}</span>
      </div>
    </div>
  `;
  showDetailPanel(meal);
}

async function loadMealDetail(id) {
  try {
    const res = await fetch(`/api/meals/${id}`);
    const data = await res.json();
    const meal = data.meals?.[0];
    if (meal) showDetailPanel(meal);
  } catch (e) {
    showToast('Could not load meal details.');
  }
}

function showDetailPanel(meal) {
  currentMeal = meal;
  document.getElementById('detailImg').src = meal.strMealThumb;
  document.getElementById('detailName').textContent = meal.strMeal;
  document.getElementById('detailCategory').textContent = meal.strCategory;
  document.getElementById('detailArea').textContent = meal.strArea;
  document.getElementById('detailInstructions').textContent = meal.strInstructions;

  const ytLink = document.getElementById('youtubeLink');
  if (meal.strYoutube) {
    ytLink.href = meal.strYoutube;
    ytLink.style.display = 'inline-flex';
  } else {
    ytLink.style.display = 'none';
  }

  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ing = meal[`strIngredient${i}`];
    const meas = meal[`strMeasure${i}`];
    if (ing && ing.trim()) ingredients.push({ ing: ing.trim(), meas: (meas || '').trim() });
  }

  document.getElementById('ingredientList').innerHTML = ingredients
    .map(x => `<span class="tag tag-gray">${x.meas ? x.meas + ' ' : ''}${x.ing}</span>`)
    .join('');

  const ctx = document.getElementById('ingredientChart').getContext('2d');
  if (ingredientChart) ingredientChart.destroy();
  ingredientChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ingredients.slice(0, 8).map(x => x.ing),
      datasets: [{
        data: ingredients.slice(0, 8).map(() => 1),
        backgroundColor: ['#1a2744','#e8a020','#2d7a4f','#243156','#f5c060','#5c5c52','#c0392b','#2a4a8a'],
        borderWidth: 2,
        borderColor: '#fff'
      }]
    },
    options: {
      plugins: { legend: { position: 'right', labels: { font: { size: 11 }, boxWidth: 14 } } },
      cutout: '60%',
      responsive: true
    }
  });

  detailPanel.classList.add('visible');
  detailPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

document.getElementById('saveMealBtn').addEventListener('click', async () => {
  if (!currentMeal) return;
  try {
    const res = await fetch('/api/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'meal',
        item_id: currentMeal.idMeal,
        item_name: currentMeal.strMeal,
        item_image: currentMeal.strMealThumb
      })
    });
    if (res.ok) showToast('Saved to Favorites!');
    else showToast('Could not save. Check Supabase config.');
  } catch {
    showToast('Could not save favorite.');
  }
});

searchBtn.addEventListener('click', () => {
  const val = ingredientInput.value.trim();
  if (val) searchMeals(val);
});

randomBtn.addEventListener('click', getRandomMeal);

ingredientInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const val = ingredientInput.value.trim();
    if (val) searchMeals(val);
  }
});

getRandomMeal();
