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
  const { data: { session } } = await supabaseClient.auth.getSession();
  return session && session.user ? `cached_cart_${session.user.id}` : 'cached_cart_guest';
}

// ===== AUTH UI =====
async function updateAuthButton() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  const user = session ? session.user : null;

  const authButton = document.getElementById('auth-button');
  if (!authButton) return;

  if (user) {
    authButton.textContent = 'Logout';
    authButton.onclick = async () => { await logout(); };
  } else {
    authButton.textContent = 'Login';
    authButton.onclick = () => window.location.href = 'login-email.html';
  }
}

async function logout() {
  try {
    await supabaseClient.auth.signOut();
    window.location.href = 'index.html';
  } catch (err) {
    console.error('Logout error:', err);
  }
}

// ===== Add to Cart =====
async function addToCart(input) {
  try {
    const { data: { session } } = await supabaseClient.auth.getSession();
    const user = session ? session.user : null;
    if (!user) {
      window.location.href = 'login-email.html';
      return;
    }

    // Build product object (same as before)
    let product;
    if (input && typeof input === 'object' && input.closest) {
      const btn = input;
      const productElement = btn.closest('.product');
      product = {
        id: productElement.dataset.id,
        name: productElement.dataset.name,
        price: parseFloat(productElement.dataset.price),
        image: productElement.dataset.image || 'placeholder.png',
        quantity: 1
      };
    } else {
      product = { quantity: 1, image: 'placeholder.png', ...input };
    }

    // Update local cache instantly
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

    await updateCartCounter();
  } catch (err) {
    console.error('Error adding to cart:', err);
    alert('Failed to add item to cart. Please try again.');
  }
}

// ===== Cart counter =====
async function updateCartCounter() {
  const badge = document.getElementById('cart-count');
  if (!badge) return;

  const cacheKey = await getCacheKey();
  const cached = JSON.parse(localStorage.getItem(cacheKey) || '[]');
  badge.textContent = cached.reduce((sum, it) => sum + (it.quantity || 0), 0);

  const { data: { session } } = await supabaseClient.auth.getSession();
  const user = session ? session.user : null;
  if (!user) return;

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

// ===== Auth state handling =====
supabaseClient.auth.onAuthStateChange(async () => {
  await updateAuthButton();
  await updateCartCounter();
});

// ===== Init =====
document.addEventListener('DOMContentLoaded', () => {
  updateAuthButton();
  updateCartCounter();

  const buttons = document.querySelectorAll('.add-to-cart');
  buttons.forEach(btn => {
    if (!btn._wiredToCart) {
      btn.addEventListener('click', function () { addToCart(this); });
      btn._wiredToCart = true;
    }
  });
});

