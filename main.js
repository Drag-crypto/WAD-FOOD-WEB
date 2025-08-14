// ===== SUPABASE INITIALIZATION (same project you asked to use yesterday) =====
const { createClient } = supabase;
const supabaseClient = createClient(
  'https://qszwotxjykynqtwrglxq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzendvdHhqeWt5bnF0d3JnbHhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjMyODAwMDUsImV4cCI6MjAzODg1NjAwNX0.pG-5fbv3N78EOC2mRQyp4sm66HPnnDQ_XSY25v23c_s'
);

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
async function getCacheKey() {
  const { data: { user } } = await supabaseClient.auth.getUser();
  return user ? `cached_cart_${user.id}` : 'cached_cart_guest';
}

// ===== AUTH UI (restored) =====
async function updateAuthButton() {
  const { data: { user } } = await supabaseClient.auth.getUser();
  const authButton = document.getElementById('auth-button');
  if (!authButton) return;

  if (user) {
    authButton.textContent = 'Logout';
    authButton.onclick = async () => { await logout(); };
  } else {
    authButton.textContent = 'Login';
    // Match your original redirect target
    authButton.onclick = () => window.location.href = 'login-email.html'; // :contentReference[oaicite:3]{index=3}
  }
}

async function logout() {
  try {
    const { error } = await supabaseClient.auth.signOut();
    if (error) throw error;
    window.location.href = 'index.html';
  } catch (err) {
    console.error('Logout error:', err);
  }
}

// ===== ADD TO CART (supports both inline onclick="addToCart(this)" and programmatic calls) =====
async function addToCart(input) {
  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      // Match your original behavior
      window.location.href = 'login-email.html'; // :contentReference[oaicite:4]{index=4}
      return;
    }

    // Build product object from either a DOM element or a plain object
    let product;
    if (input && typeof input === 'object' && input.closest) {
      const btn = input;
      const productElement = btn.closest('.product');
      if (!productElement) {
        console.error('No .product element found for button');
        return;
      }
      product = {
        id: productElement.dataset.id,
        name: productElement.dataset.name,
        price: parseFloat(productElement.dataset.price),
        image: productElement.dataset.image || 'placeholder.png',
        quantity: 1
      };
    } else {
      // Assume already a {id,name,price,image?,quantity?} object
      product = { quantity: 1, image: 'placeholder.png', ...input };
    }

    // 1) Instant local cache update
    const cacheKey = await getCacheKey();
    let items = JSON.parse(localStorage.getItem(cacheKey) || '[]');
    const idx = items.findIndex(i => i.id === product.id);
    if (idx > -1) items[idx].quantity += 1;
    else items.push(product);
    localStorage.setItem(cacheKey, JSON.stringify(items));

    // 2) Persist to Supabase (source of truth)
    const { error } = await supabaseClient
      .from('user_carts')
      .upsert({ user_id: user.id, items });
    if (error) throw error;

    // 3) Counter refresh
    await updateCartCounter();
  } catch (err) {
    console.error('Error adding to cart:', err);
    alert('Failed to add item to cart. Please try again.');
  }
}

// ===== CART COUNTER (fast cache, then refresh from Supabase) =====
async function updateCartCounter() {
  const badge = document.getElementById('cart-count'); // matches your HTML id  :contentReference[oaicite:5]{index=5}
  if (!badge) return;

  // Instant from cache
  const cacheKey = await getCacheKey();
  const cached = JSON.parse(localStorage.getItem(cacheKey) || '[]');
  badge.textContent = cached.reduce((sum, it) => sum + (it.quantity || 0), 0);

  // Background refresh from Supabase to stay accurate across devices
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) { badge.textContent = '0'; return; }

  const { data, error } = await supabaseClient
    .from('user_carts')
    .select('items')
    .eq('user_id', user.id)
    .single();

  if (!error && data && Array.isArray(data.items)) {
    const count = data.items.reduce((sum, it) => sum + (it.quantity || 0), 0);
    badge.textContent = count;
    localStorage.setItem(cacheKey, JSON.stringify(data.items));
  }
}

// ===== Auth state wiring =====
supabaseClient.auth.onAuthStateChange(async () => {
  await updateAuthButton();
  await updateCartCounter();
});

// ===== Page init =====
document.addEventListener('DOMContentLoaded', () => {
  updateAuthButton();
  updateCartCounter();

  // Also wire up any .add-to-cart buttons present without inline handlers
  const buttons = document.querySelectorAll('.add-to-cart');
  buttons.forEach(btn => {
    // If page already uses onclick="addToCart(this)" we won't double-bind
    if (!btn._wiredToCart) {
      btn.addEventListener('click', function () { addToCart(this); });
      btn._wiredToCart = true;
    }
  });
});
