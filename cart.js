// ===== Use the same Supabase client as main.js =====
// Assumes main.js already loaded on page OR include initialization here if standalone:


// ===== DOM helpers =====
const cartContainer = document.getElementById('cart-item-container');
const cartTotalEl = document.getElementById('cart-total');
const overlay = document.getElementById('loading-overlay');

// ===== Helper: per-user cache key =====
async function getCacheKey() {
  const { data: { user } } = await supabaseClient.auth.getUser();
  return user ? `cached_cart_${user.id}` : 'cached_cart_guest';
}

// ===== Render cart items =====
function renderCart(items) {
  cartContainer.innerHTML = ''; // clear old content

  if (!items || items.length === 0) {
    cartContainer.innerHTML = `
      <div class="empty-cart">
        <img src="empty-cart.png" alt="Empty Cart">
        <p>Your cart is empty</p>
      </div>`;
    cartTotalEl.textContent = '0';
    return;
  }

  let total = 0;
  items.forEach(item => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;

    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <img src="${item.image || 'placeholder.png'}" class="product-image" alt="${item.name}">
      <div>
        <h4>${item.name}</h4>
        <p>₦${item.price.toFixed(2)}</p>
        <div class="quantity-control">
          <button onclick="updateQuantity('${item.id}', -1)">-</button>
          <span>${item.quantity}</span>
          <button onclick="updateQuantity('${item.id}', 1)">+</button>
        </div>
      </div>
      <div>
        <strong>₦${itemTotal.toFixed(2)}</strong>
        <button class="remove-item" onclick="removeItem('${item.id}')">Remove</button>
      </div>
    `;
    cartContainer.appendChild(div);
  });

  cartTotalEl.textContent = total.toFixed(2);
}

// ===== Load cart from cache (fast) and then sync from Supabase =====
async function loadCart() {
  if (overlay) overlay.style.display = 'flex';

  const cacheKey = await getCacheKey();
  const cached = JSON.parse(localStorage.getItem(cacheKey) || '[]');
  renderCart(cached);

  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) {
    if (overlay) overlay.style.display = 'none';
    return;
  }

  // Sync from Supabase
  const { data, error } = await supabaseClient
    .from('user_carts')
    .select('items')
    .eq('user_id', user.id)
    .single();

  if (!error && data && Array.isArray(data.items)) {
    renderCart(data.items);
    localStorage.setItem(cacheKey, JSON.stringify(data.items));
  }

  if (overlay) overlay.style.display = 'none';
}

// ===== Update item quantity =====
async function updateQuantity(id, delta) {
  const cacheKey = await getCacheKey();
  let items = JSON.parse(localStorage.getItem(cacheKey) || '[]');
  const idx = items.findIndex(i => i.id === id);
  if (idx === -1) return;

  items[idx].quantity += delta;
  if (items[idx].quantity <= 0) {
    items.splice(idx, 1);
  }
  localStorage.setItem(cacheKey, JSON.stringify(items));
  renderCart(items);

  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) return;

  await supabaseClient
    .from('user_carts')
    .upsert({ user_id: user.id, items });
}

// ===== Remove item =====
async function removeItem(id) {
  const cacheKey = await getCacheKey();
  let items = JSON.parse(localStorage.getItem(cacheKey) || '[]');
  items = items.filter(i => i.id !== id);
  localStorage.setItem(cacheKey, JSON.stringify(items));
  renderCart(items);

  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) return;

  await supabaseClient
    .from('user_carts')
    .upsert({ user_id: user.id, items });
}

// ===== Clear cart =====
async function clearCart() {
  const cacheKey = await getCacheKey();
  localStorage.removeItem(cacheKey);
  renderCart([]);

  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) return;

  await supabaseClient
    .from('user_carts')
    .delete()
    .eq('user_id', user.id);
}

// ===== Checkout placeholder =====
function checkout() {
  alert("Checkout is not yet implemented.");
}

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', loadCart);

