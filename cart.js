// Standalone Supabase init for Cart.html (Cart.html does not load main.js)
const supabaseUrl = 'https://rvlealemvurgmpflajbn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2bGVhbGVtdnVyZ21wZmxhamJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NjEwMDEsImV4cCI6MjA3MDEzNzAwMX0.TPmel2qGoG5R_hnFAB_pF9ZQob5wMkBhJVPbcqs9q8M';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

function goToCart()        { window.location.href = 'Cart.html'; }
function goToSnack()       { window.location.href = 'Snack.html'; }
function goToSoup()        { window.location.href = 'Soup.html'; }
function goToContact()     { window.location.href = 'Contact me.html'; }
function goHome()          { window.location.href = 'index.html'; }
function goToProfile()     { window.location.href = 'UP.html'; }

const favicon = document.createElement('link');
favicon.rel = 'icon';
favicon.href = 'path/to/your-icon.png';
document.head.appendChild(favicon);


function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.style.fontFamily = "'Audiowide', cursive";
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.remove(), 3000);
}


// DOM
const cartContainer = document.getElementById('cart-item-container');
const cartTotalEl = document.getElementById('cart-total');
const overlay = document.getElementById('loading-overlay');

// Helper
async function getCacheKey() {
  const { data: { user } } = await supabaseClient.auth.getUser();
  return user ? `cached_cart_${user.id}` : 'cached_cart_guest';
}

// Render
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
      <div class="item-total">
        <strong>₦${itemTotal.toFixed(2)}</strong>
        <button class="remove-item" onclick="removeItem('${item.id}')">Remove</button>
      </div>
    `;
    cartContainer.appendChild(div);
  });

  cartTotalEl.textContent = total.toFixed(2);
}

// Load (cache first, then server)
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

  const { data, error } = await supabaseClient
    .from('user_carts')
    .select('items')
    .eq('user_id', user.id)
    .single();

  if (!error && Array.isArray(data?.items)) {
    renderCart(data.items);
    localStorage.setItem(cacheKey, JSON.stringify(data.items));
  }

  if (overlay) overlay.style.display = 'none';
}

// Quantity
async function updateQuantity(id, delta) {
  const cacheKey = await getCacheKey();
  let items = JSON.parse(localStorage.getItem(cacheKey) || '[]');
  const idx = items.findIndex(i => String(i.id) === String(id));
  if (idx === -1) return;

  items[idx].quantity += delta;
  if (items[idx].quantity <= 0) items.splice(idx, 1);

  localStorage.setItem(cacheKey, JSON.stringify(items));
  renderCart(items);

  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) return;

  await supabaseClient.from('user_carts').upsert({ user_id: user.id, items });
}

// Remove
async function removeItem(id) {
  const cacheKey = await getCacheKey();
  let items = JSON.parse(localStorage.getItem(cacheKey) || '[]');
  items = items.filter(i => String(i.id) !== String(id));

  localStorage.setItem(cacheKey, JSON.stringify(items));
  renderCart(items);

  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) return;

  await supabaseClient.from('user_carts').upsert({ user_id: user.id, items });
}

// Clear
async function clearCart() {
  const cacheKey = await getCacheKey();
  localStorage.removeItem(cacheKey);
  renderCart([]);

  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) return;

  await supabaseClient.from('user_carts').delete().eq('user_id', user.id);
}

// Checkout
function checkout() {
    let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    if (cartItems.length === 0) {
        showToast("You don't have any item in your cart. Browse and add items to your cart to checkout.");
        window.location.href = "index.html"
        return;

    }

     if(cartItems.length === 0){

    }

    const confirmation = confirm("Are you sure you want to proceed with the checkout? ");

    if (confirmation) {
        alert("Proceeding to checkout!");
        window.location.href = "note.html";
        loadCartItems();
        
        

    } else {
        alert("Checkout canceled. You can continue shopping.");
        window.location.href = 'index.html'
        loadCartItems();
        
        
        return
    }
}


// Init
document.addEventListener('DOMContentLoaded', loadCart);

