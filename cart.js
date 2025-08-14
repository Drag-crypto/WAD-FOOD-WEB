// ===== NAVIGATION (unchanged) =====

console.log('cart.js loaded')
function goToCart() { window.location.href = 'Cart.html'; }
function goToSnack() { window.location.href = 'Snack.html'; }
function goToSoup() { window.location.href = 'Soup.html'; }
function goToContact() { window.location.href = 'Contact me.html'; }
function goHome() { window.location.href = 'index.html'; }

// ===== HELPER: Get user-specific cache key =====
async function getCacheKey() {
  const { data: { user } } = await supabaseClient.auth.getUser();
  return user ? `cached_cart_${user.id}` : 'cached_cart_guest';
}

// ===== SUPABASE FUNCTIONS =====

// Fetch from Supabase (source of truth)
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
    console.error('Fetch cart error:', err);
    return [];
  }
}

// Update Supabase and also cache locally per user
async function updateCart(items) {
  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return false;
    const { error } = await supabaseClient
      .from('user_carts')
      .upsert({ user_id: user.id, items });
    if (error) throw error;

    const cacheKey = await getCacheKey();
    localStorage.setItem(cacheKey, JSON.stringify(items));
    return true;
  } catch (err) {
    console.error('Update cart error:', err);
    return false;
  }
}

// ===== RENDERING =====
function renderCartItems(items) {
  const container = document.getElementById('cart-item-container');
  const totalElement = document.getElementById('cart-total');
  if (!container || !totalElement) return;

  let total = 0;
  container.innerHTML = '';

  if (!items.length) {
    container.innerHTML = `
      <div class="empty-cart">
        <img src="Cart.png" alt="Empty Cart">
        <h2>Your cart is empty</h2>
      </div>
    `;
    totalElement.textContent = '0.00';
    return;
  }

  items.forEach((item, index) => {
    const itemTotal = (item.price || 0) * (item.quantity || 0);
    total += itemTotal;

    container.innerHTML += `
      <div class="cart-item" data-id="${item.id}">
        <img src="${item.image || 'placeholder.png'}" class="product-image" alt="${item.name}">
        <div>
          <h3>${item.name}</h3>
          <p>Price: ₦${item.price}</p>
          <div class="quantity-control">
            <button onclick="decreaseQuantity(${index})">-</button>
            <span>${item.quantity}</span>
            <button onclick="increaseQuantity(${index})">+</button>
          </div>
          <p>Total: ₦${itemTotal}</p>
        </div>
        <button class="remove-item" onclick="removeItem(${index})">Remove</button>
      </div>
    `;
  });

  totalElement.textContent = total.toFixed(2);
  if (typeof updateCartCounter === 'function') updateCartCounter();
}

// ===== MAIN LOADER WITH CACHING =====
async function loadCartItems() {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) overlay.style.display = "flex";

  // 1. Show cached cart instantly (if available)
  const cacheKey = await getCacheKey();
  const cached = JSON.parse(localStorage.getItem(cacheKey) || '[]');
  if (cached.length) renderCartItems(cached);

  // 2. Fetch latest cart from Supabase
  const freshItems = await fetchCart();
  renderCartItems(freshItems);

  // Update cache with fresh data
  localStorage.setItem(cacheKey, JSON.stringify(freshItems));

  if (overlay) overlay.style.display = "none";
}

// ===== QUANTITY AND REMOVE =====
async function decreaseQuantity(index) {
  const cacheKey = await getCacheKey();
  const items = JSON.parse(localStorage.getItem(cacheKey) || '[]');
  if (!(index in items)) return;
  if (items[index].quantity > 1) {
    items[index].quantity -= 1;
  } else {
    items.splice(index, 1);
  }
  await updateCart(items);
  renderCartItems(items);
}

async function increaseQuantity(index) {
  const cacheKey = await getCacheKey();
  const items = JSON.parse(localStorage.getItem(cacheKey) || '[]');
  if (!(index in items)) return;
  items[index].quantity += 1;
  await updateCart(items);
  renderCartItems(items);
}

async function removeItem(index) {
  const cacheKey = await getCacheKey();
  const items = JSON.parse(localStorage.getItem(cacheKey) || '[]');
  if (!(index in items)) return;
  items.splice(index, 1);
  await updateCart(items);
  renderCartItems(items);
}

async function clearCart() {
  const cacheKey = await getCacheKey();
  const items = JSON.parse(localStorage.getItem(cacheKey) || '[]');
  if (!items.length) {
    alert('Your cart is already empty!');
    return;
  }
  if (confirm('Clear your entire cart?')) {
    await updateCart([]);
    renderCartItems([]);
  }
}

async function checkout() {
  const cacheKey = await getCacheKey();
  const items = JSON.parse(localStorage.getItem(cacheKey) || '[]');
  if (!items.length) {
    alert('Your cart is empty!');
    window.location.href = 'index.html';
    return;
  }
  const total = items.reduce((sum, it) => sum + (it.price * it.quantity), 0);
  if (confirm(`Proceed to checkout with ${items.length} items (Total: ₦${total.toFixed(2)})?`)) {
    await updateCart([]);
    renderCartItems([]);
    window.location.href = 'Note.html';
  }
}

// ===== INITIALIZE =====
document.addEventListener('DOMContentLoaded', loadCartItems);

supabaseClient.auth.onAuthStateChange(async (event) => {
  if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
    await loadCartItems();
  }
});
