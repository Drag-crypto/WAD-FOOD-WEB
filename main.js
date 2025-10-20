const supabaseUrl = 'https://rvlealemvurgmpflajbn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2bGVhbGVtdnVyZ21wZmxhamJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NjEwMDEsImV4cCI6MjA3MDEzNzAwMX0.TPmel2qGoG5R_hnFAB_pF9ZQob5wMkBhJVPbcqs9q8M';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// ===== Cache key (kept, no changes) =====
async function getCacheKey() {
  const { data: { user } } = await supabaseClient.auth.getUser();
  return user ? `cart_${user.id}` : 'cart_guest';
}

// ===== NAVIGATION (plain functions so inline onclick works) =====
function goToCart()         { location.href = 'Cart.html'; }
function goToSnack()        { location.href = 'Snack.html'; }
function goToSoup()         { location.href = 'Soup.html'; }
function goToContact()      { location.href = 'Contact me.html'; }
function goHome()           { location.href = 'index.html'; }
function goToProfile()      { location.href = 'UP.html'; }
function goToBuns()         { location.href = 'Buns.html'; }
function goToCake()         { location.href = 'Cakes.html'; }
function goToCookies()      { location.href = 'Cookies.html'; }
function goToChin()         { location.href = 'ChinChin.html'; }
function goToPuff()         { location.href = 'Puff.html'; }
function goToDoughnut()     { location.href = 'Doughnut.html'; }
function goToMeatpie()      { location.href = 'Meatpie.html'; }
function goToBurger()       { location.href = 'Burger.html'; }
function goToPizza()        { location.href = 'Pizza.html'; }
function goToOkro()         { location.href = 'Okro.html'; }
function goToEgusi()        { location.href = 'Egusi.html'; }
function goToAfang()        { location.href = 'AfangSoup.html'; }
function goToOgbonno()      { location.href = 'Ogbonno.html'; }
function goToWhiteSoup()    { location.href = 'WhiteSoup.html'; }
function goToBitterLeaf()   { location.href = 'BitterLeaf.html'; }
function goToVegetableSoup(){ location.href = 'Vegetable.html'; }

// (kept — your favicon injection)
const favicon = document.createElement('link');
favicon.rel = 'icon';
favicon.href = 'logo2.png.png';
document.head.appendChild(favicon);

// ===== Toast =====
function showToast(message, type = 'info') {
  try {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.style.fontFamily = "'Audiowide', cursive";
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  } catch (err) {
    console.warn('Toast failed:', err);
  }
}

// ===== Auth button =====
async function updateAuthButton() {
  const authButton = document.getElementById('auth-button');
  if (!authButton) return;
  const { data: { user } } = await supabaseClient.auth.getUser();
  authButton.textContent = user ? 'Logout' : 'Login';
  authButton.onclick = user
    ? logout
    : function () { location.href = 'login-email.html'; };
}

// ===== Logout (plain function) =====
async function logout() {
  async function logout() {
  try {
    console.log('Attempting logout...');
    const { error } = await supabaseClient.auth.signOut();

    if (error) {
      console.error('Supabase signOut error:', error);
      showToast('Logout failed. Try again.', 'error');
      return;
    }

    // Confirm that session cleared
    const { data: { user } } = await supabaseClient.auth.getUser();
    console.log('User after signOut:', user);
    showToast('Logged out successfully!', 'success');

    // Small delay for UX + redirect
    setTimeout(() => {
      location.href = 'index.html';
    }, 500);
  } catch (err) {
    console.error('Logout exception:', err);
    showToast('Unexpected logout error.', 'error');
  }
}


// ===== Cart counter (reads from Supabase) =====
async function updateCartCounter() {
  try {
    const el = document.getElementById('cart-count');
    if (!el) return;

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) { el.textContent = '0'; return; }

    const { data, error } = await supabaseClient
      .from('user_carts')
      .select('items')
      .eq('user_id', user.id)
      .single();

    if (error || !data?.items) { el.textContent = '0'; return; }

    const count = data.items.reduce((sum, i) => sum + (i.quantity || 0), 0);
    el.textContent = String(count);
  } catch (e) {
    console.error('updateCartCounter error:', e);
    const el = document.getElementById('cart-count');
    if (el) el.textContent = '0';
  }
}

// ===== Add to cart (plain function, works with inline onclick="addToCart(this)") =====
async function addToCart(button) {
  try {
    console.log('addToCart clicked', button);
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      location.href = 'login-email.html';
      return;
    }

    const productElement = button.closest('.product');
    if (!productElement) { console.error('No .product wrapper'); return; }

    const item = {
      id: productElement.dataset.id,
      name: productElement.dataset.name,
      price: parseFloat(productElement.dataset.price),
      image: productElement.dataset.image || 'placeholder.png',
      quantity: 1
    };
    console.log('Item to add:', item);

    // Get existing cart
    const { data, error } = await supabaseClient
      .from('user_carts')
      .select('items')
      .eq('user_id', user.id)
      .single();

    let items = Array.isArray(data?.items) ? data.items.slice() : [];
    const idx = items.findIndex(i => i.id == item.id);
    if (idx > -1) items[idx].quantity += 1;
    else items.push(item);

    // Save cart
    const { error: upsertErr } = await supabaseClient
      .from('user_carts')
      .upsert({ user_id: user.id, items });

    if (upsertErr) {
      console.error('Add to cart error:', upsertErr);
      showToast('Could not add to cart. Please try again.', 'error');
      return;
    }

    updateCartCounter();
    showToast(`${item.name} added to cart!`, 'success');
  } catch (err) {
    console.error('addToCart failed:', err);
    showToast('Something went wrong adding to cart.', 'error');
  }
}

// ===== Initial boot (NO top-level await) =====
document.addEventListener('DOMContentLoaded', function () {
  console.log('main.js loaded');
  // Welcome toast (no top-level await)
  supabaseClient.auth.getUser().then(({ data: { user } }) => {
    if (user && !window._toastShown) {
      const email = user.email || 'User';
      showToast(`You are logged in as ${email}`, 'info');
      window._toastShown = true;
    }
  }).catch(() => {});

  updateAuthButton();
  updateCartCounter();
});

// ===== Auth state -> refresh UI + clear per-user cache if you use it =====
supabaseClient.auth.onAuthStateChange(async function (event) {
  try {
    const cacheKey = await getCacheKey();
    localStorage.removeItem(cacheKey);
  } catch (_) {}

  if (event === 'SIGNED_OUT' || event === 'SIGNED_IN') {
    updateAuthButton();
    updateCartCounter();
  }
});


