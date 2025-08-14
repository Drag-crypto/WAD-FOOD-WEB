// Assumes main.js is loaded before this file
const cartContainer = document.getElementById('cart-item-container');
const cartTotalEl = document.getElementById('cart-total');
const overlay = document.getElementById('loading-overlay');

async function getCacheKey() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  return session?.user ? `cached_cart_${session.user.id}` : 'cached_cart_guest';
}

function renderCart(items) {
  cartContainer.innerHTML = '';

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
    const itemTotal = (item.price || 0) * (item.quantity || 0);
    total += itemTotal;

    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <img src="${item.image || 'placeholder.png'}" class="product-image" alt="${item.name}">
      <div>
        <h4>${item.name}</h4>
        <p>₦${Number(item.price).toFixed(2)}</p>
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

async function loadCart() {
  if (overlay) overlay.style.display = 'flex';

  const cacheKey = await getCacheKey();
  const cached = JSON.parse(localStorage.getItem(cacheKey) || '[]');
  renderCart(cached);

  const { data: { session } } = await supabaseClient.auth.getSession();
  const user = session?.user || null;
  if (user) {
    const { data, error } = await supabaseClient
      .from('user_carts')
      .select('items')
      .eq('user_id', user.id)
      .single();

    if (!error && data?.items) {
      renderCart(data.items);
      localStorage.setItem(cacheKey, JSON.stringify(data.items));
    }
  }

  if (overlay) overlay.style.display = 'none';
}

async function updateQuantity(id, delta) {
  const cacheKey = await getCacheKey();
  let items = JSON.parse(localStorage.getItem(cacheKey) || '[]');
  const idx = items.findIndex(i => i.id === id);
  if (idx === -1) return;

  items[idx].quantity += delta;
  if (items[idx].quantity <= 0) items.splice(idx, 1);

  localStorage.setItem(cacheKey, JSON.stringify(items));
  renderCart(items);

  const { data: { session } } = await supabaseClient.auth.getSession();
  const user = session?.user || null;
  if (user) {
    await supabaseClient.from('user_carts').upsert({ user_id: user.id, items });
  }
}

async function removeItem(id) {
  const cacheKey = await getCacheKey();
  let items = JSON.parse(localStorage.getItem(cacheKey) || '[]');
  items = items.filter(i => i.id !== id);

  localStorage.setItem(cacheKey, JSON.stringify(items));
  renderCart(items);

  const { data: { session } } = await supabaseClient.auth.getSession();
  const user = session?.user || null;
  if (user) {
    await supabaseClient.from('user_carts').upsert({ user_id: user.id, items });
  }
}

async function clearCart() {
  const cacheKey = await getCacheKey();
  localStorage.removeItem(cacheKey);
  renderCart([]);

  const { data: { session } } = await supabaseClient.auth.getSession();
  const user = session?.user || null;
  if (user) {
    await supabaseClient.from('user_carts').delete().eq('user_id', user.id);
  }
}

function checkout() {
  alert("Checkout is not yet implemented.");
}

document.addEventListener('DOMContentLoaded', loadCart);
