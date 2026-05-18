require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_ANON_KEY || 'placeholder'
);

app.get('/api/meals/random', async (req, res) => {
  try {
    const response = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch random meal' });
  }
});

app.get('/api/meals', async (req, res) => {
  const { ingredient } = req.query;
  if (!ingredient) return res.status(400).json({ error: 'ingredient query param required' });
  try {
    const response = await fetch('https://www.themealdb.com/api/json/v1/1/filter.php?i=' + encodeURIComponent(ingredient));
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch meals' });
  }
});

app.get('/api/meals/:id', async (req, res) => {
  try {
    const response = await fetch('https://www.themealdb.com/api/json/v1/1/lookup.php?i=' + req.params.id);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch meal detail' });
  }
});

app.get('/api/breweries', async (req, res) => {
  const { city } = req.query;
  if (!city) return res.status(400).json({ error: 'city query param required' });
  try {
    const response = await fetch('https://api.openbrewerydb.org/v1/breweries?by_city=' + encodeURIComponent(city) + '&per_page=10');
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch breweries' });
  }
});

app.get('/api/cocktails', async (req, res) => {
  const { ingredient } = req.query;
  if (!ingredient) return res.status(400).json({ error: 'ingredient query param required' });
  try {
    const response = await fetch('https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=' + encodeURIComponent(ingredient));
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch cocktails' });
  }
});

app.get('/api/cocktails/:id', async (req, res) => {
  try {
    const response = await fetch('https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=' + req.params.id);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch cocktail detail' });
  }
});

app.post('/api/favorites', async (req, res) => {
  const { type, item_id, item_name, item_image } = req.body;
  if (!type || !item_id || !item_name) return res.status(400).json({ error: 'type, item_id, and item_name are required' });
  try {
    const { data, error } = await supabase.from('favorites').insert([{ type, item_id: String(item_id), item_name, item_image }]).select();
    if (error) throw error;
    res.status(201).json({ success: true, favorite: data[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save favorite' });
  }
});

app.get('/api/favorites', async (req, res) => {
  const { type } = req.query;
  try {
    let query = supabase.from('favorites').select('*').order('created_at', { ascending: false });
    if (type) query = query.eq('type', type);
    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

app.delete('/api/favorites/:id', async (req, res) => {
  try {
    const { error } = await supabase.from('favorites').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete favorite' });
  }
});

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/meals', (req, res) => res.sendFile(path.join(__dirname, 'public', 'meals.html')));
app.get('/breweries', (req, res) => res.sendFile(path.join(__dirname, 'public', 'breweries.html')));
app.get('/cocktails', (req, res) => res.sendFile(path.join(__dirname, 'public', 'cocktails.html')));
app.get('/about', (req, res) => res.sendFile(path.join(__dirname, 'public', 'about.html')));
app.get('/favorites', (req, res) => res.sendFile(path.join(__dirname, 'public', 'favorites.html')));

app.listen(PORT, () => console.log('EatEasy server running on http://localhost:' + PORT));
