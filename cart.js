// ========================
// FOODIES WEB - Cart System
// Version 2.1 (Production)
// ========================

// Configuration
const config = {
  supabaseUrl: 'https://rvlealemvurgmpflajbn.supabase.co',
  supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2bGVhbGVtdnVyZ21wZmxhamJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NjEwMDEsImV4cCI6MjA3MDEzNzAwMX0.TPmel2qGoG5R_hnFAB_pF9ZQob5wMkBhJVPbcqs9q8M',
  maxQuantity: 99,
  cartChannel: 'realtime-cart',
  productImagePath: '/images/products/'
};

// Initialize Supabase
const supabaseClient = supabase.createClient(config.supabaseUrl, config.supabaseKey);

// State Management
const cart = {
  queue: [],
  isProcessing: false,
  retryCount: 0,
  lastUpdate: null,
  elements: {
    container: null,
    total: null,
    loading: null,
    error: null,
    checkoutBtn: null
  }
};

// DOM Elements
const elements = {
  cartContainer: document.getElementById('cart-item-container'),
  cartTotal: document.getElementById('cart-total'),
  loadingOverlay: document.getElementById('loading-overlay'),
  errorContainer: document.getElementById('cart-error-container'),
  checkoutButton: document.getElementById('checkout-button'),
  clearCartButton: document.getElementById('clear-cart-button')
};

// Initialize Cart System
function initCart() {
  setupEventListeners();
  setupRealtimeUpdates();
  loadCart();
}

// Event Listeners
function setupEventListeners() {
  window.addEventListener('online', handleConnectionChange);
  window.addEventListener('offline', handleConnectionChange);
  window.addEventListener('beforeunload', handleBeforeUnload);
  
  // Button event delegation
  document.addEventListener('click', function(e) {
    if (e.target.matches('.quantity-up')) {
      modifyQuantity(parseInt(e.target.dataset.index), 1);
    }
    if (e.target.matches('.quantity-down')) {
      modifyQuantity(parseInt(e.target.dataset.index), -1);
    }
    if (e.target.matches('.remove-item')) {
      removeItem(parseInt(e.target.dataset.index));
    }
  });
}

// Realtime Updates
function setupRealtimeUpdates() {
  supabaseClient
    .channel(config.cartChannel)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'user_carts'
    }, handleCartUpdate)
    .subscribe();
}

// Core Functions
async function loadCart() {
  try {
    showLoading();
    const items = await fetchCartItems();
    renderCartItems(items);
    cart.lastUpdate = new Date();
  } catch (error) {
    handleError(error);
  } finally {
    hideLoading();
  }
}

async function fetchCartItems() {
  const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
  if (authError || !user) throw new Error('Authentication required');

  const { data, error } = await supabaseClient
    .from('user_carts')
    .select('items')
    .eq('user_id', user.id)
    .single();

  if (error) throw error;
  return validateCartData(data?.items) || [];
}

async function saveCart(items) {
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) throw new Error('Authentication required');

  const { error } = await supabaseClient
    .from('user_carts')
    .upsert({
      user_id: user.id,
      items: validateCartData(items),
      updated_at: new Date()
    }, {
      onConflict: 'user_id'
    });

  if (error) throw error;
}

// Queue Management
function enqueue(operation) {
  cart.queue.push(operation);
  if (!cart.isProcessing) processQueue();
}

async function processQueue() {
  if (cart.queue.length === 0) return;

  cart.isProcessing = true;
  const operation = cart.queue[0];

  try {
    await operation();
    cart.queue.shift();
    cart.retryCount = 0;
  } catch (error) {
    if (cart.retryCount < 2) {
      cart.retryCount++;
      setTimeout(processQueue, 1000 * cart.retryCount);
      return;
    }
    handleError(error);
    cart.queue.shift();
    cart.retryCount = 0;
  } finally {
    cart.isProcessing = false;
    processQueue();
  }
}

// UI Rendering
function renderCartItems(items) {
  if (!items || items.length === 0) {
    renderEmptyState();
    return;
  }

  elements.cartContainer.innerHTML = '';
  let total = 0;

  items.forEach((item, index) => {
    const itemElement = createCartItemElement(item, index);
    elements.cartContainer.appendChild(itemElement);
    total += item.price * item.quantity;
  });

  elements.cartTotal.textContent = total.toFixed(2);
  toggleCheckoutButton(items.length > 0);
}

function createCartItemElement(item, index) {
  const element = document.createElement('div');
  element.className = 'cart-item';
  element.innerHTML = `
    <img src="${config.productImagePath}${item.id}.webp" 
         alt="${escapeHtml(item.name)}"
         class="product-image">
    <div class="item-details">
      <h3>${escapeHtml(item.name)}</h3>
      <p class="price">₦${item.price.toFixed(2)}</p>
      <div class="quantity-control">
        <button class="quantity-down" data-index="${index}" 
                ${item.quantity <= 1 ? 'disabled' : ''}>
          −
        </button>
        <span>${item.quantity}</span>
        <button class="quantity-up" data-index="${index}"
                ${item.quantity >= config.maxQuantity ? 'disabled' : ''}>
          +
        </button>
      </div>
    </div>
    <p class="item-total">₦${(item.price * item.quantity).toFixed(2)}</p>
    <button class="remove-item" data-index="${index}">
      <img src="/images/trash-icon.svg" alt="Remove" width="20">
    </button>
  `;
  return element;
}

// Event Handlers
function handleCartUpdate(payload) {
  if (payload.new.user_id !== supabaseClient.auth.user()?.id) return;
  enqueue(async () => {
    const items = validateCartData(payload.new?.items) || [];
    renderCartItems(items);
    cart.lastUpdate = new Date();
  });
}

function handleConnectionChange() {
  if (navigator.onLine) {
    showToast('Reconnected. Syncing cart...', 'info');
    enqueue(loadCart);
  }
}

function handleBeforeUnload(event) {
  if (cart.queue.length > 0) {
    event.preventDefault();
    event.returnValue = 'You have pending cart changes. Leave anyway?';
  }
}

// Public API
window.modifyQuantity = function(index, delta) {
  enqueue(async () => {
    showLoading();
    try {
      const items = await fetchCartItems();
      const newQty = items[index].quantity + delta;

      if (newQty < 1) {
        items.splice(index, 1);
      } else if (newQty > config.maxQuantity) {
        showToast(`Maximum quantity is ${config.maxQuantity}`, 'warning');
        return;
      } else {
        items[index].quantity = newQty;
      }

      await saveCart(items);
      renderCartItems(items);
    } catch (error) {
      handleError(error);
    } finally {
      hideLoading();
    }
  });
};

window.removeItem = function(index) {
  enqueue(async () => {
    showLoading();
    try {
      const items = await fetchCartItems();
      items.splice(index, 1);
      await saveCart(items);
      renderCartItems(items);
      showToast('Item removed', 'success');
    } catch (error) {
      handleError(error);
    } finally {
      hideLoading();
    }
  });
};

window.clearCart = function() {
  if (confirm('Clear your entire cart?')) {
    enqueue(async () => {
      showLoading();
      try {
        await saveCart([]);
        renderCartItems([]);
        showToast('Cart cleared', 'success');
      } catch (error) {
        handleError(error);
      } finally {
        hideLoading();
      }
    });
  }
};

window.checkout = function() {
  enqueue(async () => {
    showLoading();
    try {
      const items = await fetchCartItems();
      if (items.length === 0) {
        showToast('Your cart is empty', 'error');
        return;
      }

      const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      if (confirm(`Proceed to checkout with ${items.length} items (₦${total.toFixed(2)})?`)) {
        await saveCart([]);
        window.location.href = 'Note.html';
      }
    } catch (error) {
      handleError(error);
    } finally {
      hideLoading();
    }
  });
};

// Helper Functions
function validateCartData(items) {
  if (!Array.isArray(items)) return [];
  return items.filter(item => 
    item?.id && 
    item?.name &&
    !isNaN(item?.price) && 
    !isNaN(item?.quantity)
  );
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showLoading() {
  elements.loadingOverlay.style.display = 'flex';
}

function hideLoading() {
  elements.loadingOverlay.style.display = 'none';
}

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function handleError(error) {
  console.error('Cart Error:', error);
  elements.errorContainer.innerHTML = `
    <div class="error">
      <p>${error.message || 'An error occurred'}</p>
      <button onclick="loadCart()">Retry</button>
    </div>
  `;
  elements.errorContainer.style.display = 'block';
}

function toggleCheckoutButton(enable) {
  elements.checkoutButton.disabled = !enable;
}

function renderEmptyState() {
  elements.cartContainer.innerHTML = `
    <div class="empty-cart">
      <img src="/images/empty-cart.svg" alt="Empty cart">
      <h3>Your cart is empty</h3>
      <button onclick="window.location.href='index.html'">Browse Products</button>
    </div>
  `;
  toggleCheckoutButton(false);
}

// Initialize
document.addEventListener('DOMContentLoaded', initCart);
