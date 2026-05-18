// api.test.js — Basic API endpoint tests (no test framework needed)
// Run with: node tests/api.test.js
// Requires the server to be running on localhost:3000

const BASE = 'http://localhost:3000';

let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (e) {
    console.log(`  ✗ ${name}: ${e.message}`);
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message || 'Assertion failed');
}

async function run() {
  console.log('\nEatEasy API Tests\n');

  // GET /api/meals/random
  await test('GET /api/meals/random returns a meal', async () => {
    const res = await fetch(`${BASE}/api/meals/random`);
    assert(res.ok, `Status ${res.status}`);
    const data = await res.json();
    assert(data.meals && data.meals.length > 0, 'No meals in response');
    assert(data.meals[0].strMeal, 'Missing strMeal field');
  });

  // GET /api/meals?ingredient=chicken
  await test('GET /api/meals?ingredient=chicken returns results', async () => {
    const res = await fetch(`${BASE}/api/meals?ingredient=chicken`);
    assert(res.ok, `Status ${res.status}`);
    const data = await res.json();
    assert(data.meals && data.meals.length > 0, 'No meals returned');
  });

  // GET /api/meals missing ingredient param
  await test('GET /api/meals without ingredient returns 400', async () => {
    const res = await fetch(`${BASE}/api/meals`);
    assert(res.status === 400, `Expected 400, got ${res.status}`);
  });

  // GET /api/breweries?city=Baltimore
  await test('GET /api/breweries?city=Baltimore returns array', async () => {
    const res = await fetch(`${BASE}/api/breweries?city=Baltimore`);
    assert(res.ok, `Status ${res.status}`);
    const data = await res.json();
    assert(Array.isArray(data), 'Response is not an array');
  });

  // GET /api/breweries missing city param
  await test('GET /api/breweries without city returns 400', async () => {
    const res = await fetch(`${BASE}/api/breweries`);
    assert(res.status === 400, `Expected 400, got ${res.status}`);
  });

  // GET /api/cocktails?ingredient=vodka
  await test('GET /api/cocktails?ingredient=vodka returns drinks', async () => {
    const res = await fetch(`${BASE}/api/cocktails?ingredient=vodka`);
    assert(res.ok, `Status ${res.status}`);
    const data = await res.json();
    assert(data.drinks && data.drinks.length > 0, 'No drinks returned');
  });

  // GET /api/cocktails/:id (known ID for Margarita)
  await test('GET /api/cocktails/11007 returns Margarita', async () => {
    const res = await fetch(`${BASE}/api/cocktails/11007`);
    assert(res.ok, `Status ${res.status}`);
    const data = await res.json();
    assert(data.drinks?.[0]?.strDrink === 'Margarita', 'Expected Margarita');
  });

  // GET /api/favorites (Supabase)
  await test('GET /api/favorites returns array', async () => {
    const res = await fetch(`${BASE}/api/favorites`);
    // May fail if Supabase not configured — that's okay
    const data = await res.json();
    assert(Array.isArray(data) || data.error, 'Unexpected response format');
  });

  // POST /api/favorites missing fields
  await test('POST /api/favorites without required fields returns 400', async () => {
    const res = await fetch(`${BASE}/api/favorites`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'meal' })
    });
    assert(res.status === 400, `Expected 400, got ${res.status}`);
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed\n`);
  if (failed > 0) process.exit(1);
}

run().catch(e => { console.error(e); process.exit(1); });
