// ===== SUPABASE INITIALIZATION (single source of truth) =====
const SUPABASE_URL = 'https://rvlealemvurgmpflajbn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2bGVhbGVtdnVyZ21wZmxhamJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NjEwMDEsImV4cCI6MjA3MDEzNzAwMX0.TPmel2qGoG5R_hnFAB_pF9ZQob5wMkBhJVPbcqs9q8M';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ===== NAVIGATION BUTTON HANDLERS =====
function goToCart()        { location.href = 'Cart.html'; }
function goToSnack()       { location.href = 'Snack.html'; }
function goToSoup()        { location.href = 'Soup.html'; }
function goToContact()     { location.href = 'Contact me.html'; }
function goHome()          { location.href = 'index.html'; }
function goToProfile()     { location.href = 'UP.html'; }
function goToBuns()        { location.href = 'Buns.html'; }
function goToCake()        { location.href = 'Cakes.html'; }
function goToCookies()     { location.href = 'Cookies.html'; }
function goToChin()        { location.href = 'ChinChin.html'; }
function goToPuff()        { location.href = 'Puff.html'; }
function goToDoughnut()    { location.href = 'Doughnut.html'; }
function goToMeatpie()     { location.href = 'Meatpie.html'; }
function goToBurger()      { location.href = 'Burger.html'; }
function goToPizza()       { location.href = 'Pizza.html'; }
function goToOkro()        { location.href = 'Okro.html'; }
function goToEgusi()       { location.href = 'Egusi.html'; }
function goToAfang()       { location.href = 'AfangSoup.html'; }
function goToOgbonno()     { location.href = 'Ogbonno.html'; }
function goToWhiteSoup()   { location.href = 'WhiteSoup.html'; }
function goToBitterLeaf()  { location.href = 'BitterLeaf.html'; }
function goToVegetableSoup(){ location.href = 'Vegetable.html'; }

// ===== Helper: per-user cache key =====
async function getCacheKey() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  return session?.user ? `cached_cart_${session.user.id}` : 'cached_cart_guest';
}

// ===== AUTH UI =====
async function updateAuthButton() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  const user = session?.user || null;
  const authBtn = document.getElementById('auth-button');
  if (!authBtn) return;

  if (user) {
    authBtn.textContent = 'Logout';
    authBtn.onclick = logout; // always call unified logout()
  } else {
    authBtn.textContent = 'Login';
    authBtn.onclick = () => location.href = 'login-email.html';
  }
}

async function logout() {
  try {
    await supabaseClient.auth.signOut();
    // Force UI refresh to ensure state is updated
    location.href = 'index.html';
  } catch (err) {
    console.error('Logout error:', err);
  }
}

// ===== ADD TO CART =====
async function addToCart(trigger) {
  const { data: { session } } = await supabaseClient.auth.getSession();
  const user = session?.user || null;
  if (!user) {
    location.href = 'login-email.html';
    return;
  }

  let product;
  if (trigger && trigger.closest) {
    const el = trigger.closest('.product');
    if (!el) { console.error('No .product wrapper for button'); return; }
    product = {
      id: el.dataset.id,
      name: el.dataset.name,
      price: parseFloat(el.dataset.price),
      image: el.dataset.image || 'placeholder.png',
      quantity: 1
    };
  } else {
    product = { quantity: 1, image: 'placeholder.png', ...trigger };
  }

  const cacheKey = await getCacheKey();
  let items = JSON.parse(localStorage.getItem(cacheKey) || '[]');
  const idx = items.findIndex(i => i.id === product.id);
  if (idx > -1) items[idx].quantity += 1; else items.push(product);
  localStorage.setItem(cacheKey, JSON.stringify(items));

  await supabaseClient.from('user_carts').upsert({ user_id: user.id, items });

  updateCartCounter();
}

// ===== CART COUNTER =====
async function updateCartCounter() {
  const badge = document.getElementById('cart-count');
  if (!badge) return;

  const cacheKey = await getCacheKey();
  const cached = JSON.parse(localStorage.getItem(cacheKey) || '[]');
  badge.textContent = cached.reduce((s, i) => s + (i.quantity || 0), 0);

  const { data: { session } } = await supabaseClient.auth.getSession();
  const user = session?.user || null;
  if (!user) return;

  const { data, error } = await supabaseClient
    .from('user_carts')
    .select('items')
    .eq('user_id', user.id)
    .single();

  if (!error && data?.items) {
    const count = data.items.reduce((s, i) => s + (i.quantity || 0), 0);
    badge.textContent = count;
    localStorage.setItem(cacheKey, JSON.stringify(data.items));
  }
}

// ===== AUTH STATE CHANGES =====
supabaseClient.auth.onAuthStateChange(() => {
  updateAuthButton();
  updateCartCounter();
});

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  updateAuthButton();
  updateCartCounter();

  document.querySelectorAll('.add-to-cart').forEach(btn => {
    if (!btn._wired) {
      btn.addEventListener('click', function () { addToCart(this); });
      btn._wired = true;
    }
  });
});

