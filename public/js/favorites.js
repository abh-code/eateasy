const favGrid = document.getElementById('favGrid');
const emptyState = document.getElementById('emptyState');
const loader = document.getElementById('loader');
const toast = document.getElementById('toast');

let allFavs = [];
let currentFilter = 'all';

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2800);
}

async function loadFavorites() {
  loader.style.display = 'block';
  favGrid.innerHTML = '';
  emptyState.style.display = 'none';
  try {
    const res = await fetch('/api/favorites');
    allFavs = await res.json();
    renderFavorites(allFavs);
  } catch (e) {
    favGrid.innerHTML = '<p style="color:var(--gray-400);">Could not load favorites. Check Supabase configuration.</p>';
  } finally {
    loader.style.display = 'none';
  }
}

function renderFavorites(favs) {
  const filtered = currentFilter === 'all' ? favs : favs.filter(f => f.type === currentFilter);
  if (!filtered.length) {
    emptyState.style.display = 'block';
    favGrid.innerHTML = '';
    return;
  }
  emptyState.style.display = 'none';
  favGrid.innerHTML = filtered.map(f => `
    <div class="card fav-card" style="position:relative;">
      ${f.item_image ? `<img src="${f.item_image}" alt="${f.item_name}" loading="lazy">` : `<div style="height:180px;background:var(--gray-100);display:flex;align-items:center;justify-content:center;font-size:3rem;">${f.type === 'meal' ? '🍲' : '🍹'}</div>`}
      <div class="card-body">
        <span class="tag ${f.type === 'meal' ? 'tag-navy' : 'tag-gold'}" style="margin-bottom:0.4rem;">${f.type}</span>
        <h3>${f.item_name}</h3>
        <p style="font-size:0.75rem;color:var(--gray-400);">Saved ${new Date(f.created_at).toLocaleDateString()}</p>
      </div>
      <button class="remove-btn" onclick="removeFavorite('${f.id}', this)" title="Remove">✕</button>
    </div>
  `).join('');
}

async function removeFavorite(id, btn) {
  btn.disabled = true;
  try {
    const res = await fetch(`/api/favorites/${id}`, { method: 'DELETE' });
    if (res.ok) {
      allFavs = allFavs.filter(f => f.id !== id);
      renderFavorites(allFavs);
      showToast('Removed from favorites.');
    } else {
      showToast('Could not remove. Check Supabase config.');
    }
  } catch {
    showToast('Error removing favorite.');
  }
}

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.type;
    renderFavorites(allFavs);
  });
});

loadFavorites();
