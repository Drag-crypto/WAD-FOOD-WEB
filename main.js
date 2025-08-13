// ===== Supabase Client Setup =====
const supabaseUrl = 'https://rvlealemvurgmpflajbn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2bGVhbGVtdnVyZ21wZmxhamJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NjEwMDEsImV4cCI6MjA3MDEzNzAwMX0.TPmel2qGoG5R_hnFAB_pF9ZQob5wMkBhJVPbcqs9q8M';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// ===== NAVIGATION =====
function goToCart() { window.location.href = 'Cart.html'; }
function goToSnack() { window.location.href = 'Snack.html'; }
function goToSoup() { window.location.href = 'Soup.html'; }
function goToProfile() { window.location.href = 'UP.html'; }
function goToContact() { window.location.href = 'Contact me.html'; }
function goHome() { window.location.href = 'index.html'; }

// Individual product navigation
function goToBuns() { window.location.href= 'Buns.html'; }
function goToCake() { window.location.href= 'Cakes.html'; }
function goToCookies() { window.location.href= 'Cookies.html'; }
function goToChin() { window.location.href= 'ChinChin.html'; }
function goToPuff() { window.location.href= 'Puff.html'; }
function goToDoughnut() { window.location.href= 'Doughnut.html'; }
function goToMeatpie() { window.location.href = 'Meatpie.html'; }
function goToBurger() { window.location.href= 'Burger.html'; }
function goToPizza() { window.location.href= 'Pizza.html'; }
function goToOkro() { window.location.href='Okro.html'; }
function goToEgusi() { window.location.href='Egusi.html'; }
function goToAfang() { window.location.href='AfangSoup.html'; }
function goToOgbonno() { window.location.href='Ogbonno.html'; }
function goToWhiteSoup() { window.location.href='WhiteSoup.html'; }
function goToBitterLeaf() { window.location.href='BitterLeaf.html'; }
function goToVegetableSoup() { window.location.href='Vegetable.html'; }

// ===== CART (Supabase-only) =====

// Fetch user's cart items
async function fetchCart() {
  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return [];
    const { data, error } = await supabaseClient
      .from('user_carts')
      .select('items')
      .eq('user_id', user.id)
      .single();
    if (error) return [];
    return data?.items || [];
  } catch (err) {
    console.error('fetchCart error:', err);
    return [];
  }
}

// Update user's cart
async function updateCart(items) {
  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return false;
    const { error } = await supabaseClient
      .from('user_carts')
      .upsert({ user_id: user.id, items });
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('updateCart error:', err);
    return false;
  }
}

// Add item to cart
async function addToCart(button) {
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) {
    window.location.href = 'login-email.html';
    return;
  }

  const productElement = button.closest('.product');
  const item = {
    id: productElement.dataset.id,
    name: productElement.dataset.name,
    price: parseFloat(productElement.dataset.price),
    quantity: 1
  };

  let cartItems = await fetchCart();
  const existing = cartItems.find(i => i.id === item.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cartItems.push(item);
  }

  await updateCart(cartItems);
  await updateCartCounter();
  alert(`${item.name} added to cart!`);
}

// Update counter bubble in header
async function updateCartCounter() {
  try {
    const el = document.getElementById('cart-count');
    if (!el) return;
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) { el.textContent = '0'; return; }
    const items = await fetchCart();
    const total = items.reduce((s, it) => s + (it.quantity || 0), 0);
    el.textContent = String(total);
  } catch (err) {
    console.error('updateCartCounter error:', err);
  }
}

// Auth button (Login/Logout toggle)
async function updateAuthButton() {
  const authButton = document.getElementById('auth-button');
  if (!authButton) return;
  const { data: { user } } = await supabaseClient.auth.getUser();
  authButton.textContent = user ? 'Logout' : 'Login';
  authButton.onclick = user ? logout : () => window.location.href = 'login-email.html';
}

// Logout
async function logout() {
  try {
    const { error } = await supabaseClient.auth.signOut();
    if (error) throw error;
    window.location.href = 'index.html';
  } catch (error) {
    console.error('Logout error:', error);
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  updateCartCounter();
  updateAuthButton();
});

// Keep counter in sync when auth changes
supabaseClient.auth.onAuthStateChange(() => {
  updateCartCounter();
  updateAuthButton();
});
