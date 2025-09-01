// ===== SUPABASE (same project as in your files) =====
const supabaseUrl = 'https://rvlealemvurgmpflajbn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2bGVhbGVtdnVyZ21wZmxhamJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NjEwMDEsImV4cCI6MjA3MDEzNzAwMX0.TPmel2qGoG5R_hnFAB_pF9ZQob5wMkBhJVPbcqs9q8M';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// ===== NAVIGATION (kept) =====
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

const favicon = document.createElement('link');
favicon.rel = 'icon';
favicon.href = 'logo2.png.png';
document.head.appendChild(favicon);

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.style.fontFamily = "'Audiowide', cursive";
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.remove(), 3000);
}
(async () => {
const {data: {user} } = await supabaseClient.auth.getUser();
if (user) {
  const email = user.email || 'User';
  if (!window._toastShown) {
    showToast(`You are logged in as ${email}`, 'info');
    window._toastShown = true;
  }
}
})();



// ===== Auth button (your original intent preserved) =====
async function updateAuthButton() {
  const authButton = document.getElementById('auth-button');
  if (!authButton) return;

  const { data: { user } } = await supabaseClient.auth.getUser();
  authButton.textContent = user ? 'Logout' : 'Login';
  authButton.onclick = user
    ? logout
    : () => window.location.href = 'login-email.html';
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

// ===== Add to cart (keeps your dataset extraction) =====
async function addToCart(button) {
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) { window.location.href = 'login-email.html'; return; }

  const productElement = button.closest('.product');
  if (!productElement) { console.error('No .product wrapper'); return; }

  

  const item = {
    id: productElement.dataset.id,
    name: productElement.dataset.name,
    price: parseFloat(productElement.dataset.price),
    image: productElement.dataset.image || 'placeholder.png',
    quantity: 1
  };
  if (!productElement.dataset.image) {
  console.warn(`No image specified for product "${item.name}". Using fallback image.`);
}

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
    showToast('Could not add to cart. Please try again.');
    return;
  }

  updateCartCounter();
  showToast(`${item.name} added to cart!`);
}

// ===== Init =====
document.addEventListener('DOMContentLoaded', () => {
  updateAuthButton();
  updateCartCounter();
  // Your HTML already uses onclick="addToCart(this)" so no extra wiring needed.
});

supabaseClient.auth.onAuthStateChange(async (event) => {
    const cacheKey = await getCacheKey();
    localStorage.removeItem(cacheKey);

    if(event === 'SIGNED_OUT' || event === 'SIGNED_IN') {
       const cacheKey = await getCacheKey();
        localStorage.removeItem(cacheKey);
    }
});


