const cocktailInput = document.getElementById('cocktailInput');
const searchBtn = document.getElementById('searchBtn');
const sliderWrap = document.getElementById('sliderWrap');
const sliderList = document.getElementById('sliderList');
const sliderTitle = document.getElementById('sliderTitle');
const detailPanel = document.getElementById('detailPanel');
const status = document.getElementById('status');
const loader = document.getElementById('loader');
const toast = document.getElementById('toast');

let splideInstance = null;
let currentCocktail = null;

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2800);
}

function setLoader(on) {
  loader.style.display = on ? 'block' : 'none';
}

async function searchCocktails(ingredient) {
  setLoader(true);
  sliderWrap.style.display = 'none';
  detailPanel.classList.remove('visible');
  status.textContent = '';
  try {
    const res = await fetch(`/api/cocktails?ingredient=${encodeURIComponent(ingredient)}`);
    const data = await res.json();
    const drinks = data.drinks || [];
    if (!drinks.length) {
      status.textContent = `No cocktails found with "${ingredient}".`;
      setLoader(false);
      return;
    }
    status.textContent = `Showing ${drinks.length} cocktail${drinks.length > 1 ? 's' : ''} with "${ingredient}"`;
    sliderTitle.textContent = `Cocktails with ${ingredient}`;
    renderSlider(drinks.slice(0, 16));
  } catch (e) {
    status.textContent = 'Error fetching cocktails.';
  } finally {
    setLoader(false);
  }
}

function renderSlider(drinks) {
  if (splideInstance) {
    splideInstance.destroy();
    splideInstance = null;
  }

  sliderList.innerHTML = drinks.map(d => `
    <li class="splide__slide">
      <div class="cocktail-thumb" onclick="loadCocktailDetail('${d.idDrink}', this)">
        <img src="${d.strDrinkThumb}" alt="${d.strDrink}" loading="lazy">
        <p>${d.strDrink}</p>
      </div>
    </li>
  `).join('');

  sliderWrap.style.display = 'block';

  splideInstance = new Splide('#cocktailSlider', {
    perPage: 4,
    gap: '1rem',
    pagination: false,
    breakpoints: {
      900: { perPage: 3 },
      640: { perPage: 2 },
      400: { perPage: 1 }
    }
  }).mount();

  if (drinks.length) loadCocktailDetail(drinks[0].idDrink, null);
}

async function loadCocktailDetail(id, thumbEl) {
  document.querySelectorAll('.cocktail-thumb').forEach(el => el.classList.remove('selected'));
  if (thumbEl) thumbEl.classList.add('selected');

  try {
    const res = await fetch(`/api/cocktails/${id}`);
    const data = await res.json();
    const drink = data.drinks?.[0];
    if (drink) showDetailPanel(drink);
  } catch (e) {
    showToast('Could not load cocktail details.');
  }
}

function showDetailPanel(drink) {
  currentCocktail = drink;
  document.getElementById('detailImg').src = drink.strDrinkThumb;
  document.getElementById('detailName').textContent = drink.strDrink;
  document.getElementById('detailCategory').textContent = drink.strCategory || '';
  document.getElementById('detailAlcoholic').textContent = drink.strAlcoholic || '';
  document.getElementById('detailGlass').textContent = drink.strGlass || '';
  document.getElementById('cocktailInstructions').textContent = drink.strInstructions || '';

  const ingredients = [];
  for (let i = 1; i <= 15; i++) {
    const ing = drink[`strIngredient${i}`];
    const meas = drink[`strMeasure${i}`];
    if (ing && ing.trim()) ingredients.push(`${(meas || '').trim()} ${ing.trim()}`.trim());
  }

  document.getElementById('cocktailIngredients').innerHTML = ingredients
    .map(x => `<li>${x}</li>`)
    .join('');

  detailPanel.classList.add('visible');
  detailPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

document.getElementById('saveCocktailBtn').addEventListener('click', async () => {
  if (!currentCocktail) return;
  try {
    const res = await fetch('/api/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'cocktail',
        item_id: currentCocktail.idDrink,
        item_name: currentCocktail.strDrink,
        item_image: currentCocktail.strDrinkThumb
      })
    });
    if (res.ok) showToast('Saved to Favorites!');
    else showToast('Could not save. Check Supabase config.');
  } catch {
    showToast('Could not save favorite.');
  }
});

searchBtn.addEventListener('click', () => {
  const val = cocktailInput.value.trim();
  if (val) searchCocktails(val);
});

cocktailInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const val = cocktailInput.value.trim();
    if (val) searchCocktails(val);
  }
});

searchCocktails('vodka');
