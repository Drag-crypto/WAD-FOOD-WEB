// ===== SUPABASE INITIALIZATION (same project you asked to use yesterday) =====
const supabaseUrl = 'https://rvlealemvurgmpflajbn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2bGVhbGVtdnVyZ21wZmxhamJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NjEwMDEsImV4cCI6MjA3MDEzNzAwMX0.TPmel2qGoG5R_hnFAB_pF9ZQob5wMkBhJVPbcqs9q8M';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// ===== NAVIGATION BUTTON HANDLERS (restored + complete) =====
function goToCart()        { window.location.href = 'Cart.html'; }
function goToSnack()       { window.location.href = 'Snack.html'; }
function goToSoup()        { window.location.href = 'Soup.html'; }
function goToContact()     { window.location.href = 'Contact me.html'; }
function goHome()          { window.location.href = 'index.html'; }
function goToProfile()     { window.location.href = 'UP.html'; }

function goToBuns()        { window.location.href = 'Buns.html'; }
function goToCake()        { window.location.href = 'Cakes.html'; }
function goToCookies()     { window.location.href = 'Cookies.html'; }
function goToChin()        { window.location.href = 'ChinChin.html'; }
function goToPuff()        { window.location.href = 'Puff.html'; }
function goToDoughnut()    { window.location.href = 'Doughnut.html'; }
function goToMeatpie()     { window.location.href = 'Meatpie.html'; }
function goToBurger()      { window.location.href = 'Burger.html'; }
function goToPizza()       { window.location.href = 'Pizza.html'; }

function goToOkro()        { window.location.href = 'Okro.html'; }
function goToEgusi()       { window.location.href = 'Egusi.html'; }
function goToAfang()       { window.location.href = 'AfangSoup.html'; }
function goToOgbonno()     { window.location.href = 'Ogbonno.html'; }
function goToWhiteSoup()   { window.location.href = 'WhiteSoup.html'; }
function goToBitterLeaf()  { window.location.href = 'BitterLeaf.html'; }
function goToVegetableSoup(){ window.location.href = 'Vegetable.html'; }

// ===== HELPER: per-user cache key =====
function goToCart() { window.location.href = 'Cart.html'; }
function goToSnack() { window.location.href = 'Snack.html'; }
function goToSoup() { window.location.href = 'Soup.html'; }
function goToContact() { window.location.href = 'Contact me.html'; }
function goHome() { window.location.href = 'index.html'; }

// ===== Helper for per-user cache =====
async function getCacheKey() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  return session && session.user ? `cached_cart_${session.user.id}` : 'cached_cart_guest';
}

// ===== AUTH BUTTON =====
async function updateAuthButton() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  const user = session ? session.user : null;

  const authBtn = document.getElementById('auth-button');
  if (!authBtn) return;

  if (user) {
    authBtn.textContent = 'Logout';
    authBtn.onclick = async () => { await supabaseClient.auth.signOut(); window.location.reload(); };
  } else {
    authBtn.textContent = 'Login';
    authBtn.onclick = () => window.location.href = 'login-email.html';
  }
}

// ===== ADD TO CART =====
async function addToCart(trigger) {
  const { data: { session } } = await supabaseClient.auth.getSession();
  const user = session ? session.user : null;
  if (!user) {
    window.location.href = 'login-email.html';
    return;
  }

  // Get product info
  let product;
  if (trigger && trigger.closest) {
    const el = trigger.closest('.product');
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
  if (idx > -1) items[idx].quantity += 1;
  else items.push(product);
  localStorage.setItem(cacheKey, JSON.stringify(items));

  // Push to Supabase
  await supabaseClient
    .from('user_carts')
    .upsert({ user_id: user.id, items });

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
  const user = session ? session.user : null;
  if (!user) return;

  const { data, error } = await supabaseClient
    .from('user_carts')
    .select('items')
    .eq('user_id', user.id)
    .single();

  if (!error && data && Array.isArray(data.items)) {
    const count = data.items.reduce((s, i) => s + (i.quantity || 0), 0);
    badge.textContent = count;
    localStorage.setItem(cacheKey, JSON.stringify(data.items));
  }
}

// ===== AUTH STATE =====
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
      btn.addEventListener('click', function() { addToCart(this); });
      btn._wired = true;
    }
  });
});

