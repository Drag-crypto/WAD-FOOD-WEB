// ===== Supabase Client Setup (shared) =====

console.log("cart.js loaded");

// ===== NAVIGATION =====
function goToCart() { window.location.href = 'Cart.html'; }
function goToSnack() { window.location.href = 'Snack.html'; }
function goToSoup() { window.location.href = 'Soup.html'; }
function goToContact() { window.location.href = 'Contact me.html'; }
function goHome() { window.location.href = 'index.html'; }

// ===== CART (Supabase-only) =====
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
    console.error('Update cart error:', err);
    return false;
  }
}

async function loadCartItems() {
  const container = document.getElementById('cart-item-container');
  const totalElement = document.getElementById('cart-total');
  const overlay = document.getElemenyById('loading-overlay');

  console.log("Loading cart items...");
  if (!container || !totalElement) {
    console.error("Cart container or total element not found!");
    return;
  }
   if (overlay) overlay.style.display = "flex";
  container.innerHTML = "<p>Loading your cart...</p>";

  const items = await fetchCart();
  console.log("Fetched items:", items);

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
  } catch (err) {
    console.error("Error loading cart:", err);
    container.innerHTML = "<p class='error'>Failed to load cart. Please try again.</p>";
  } finally {
    // Hide overlay after everything finishes
    if (overlay) overlay.style.display = "none";
  }
  console.log("Cart rendered successfully");
}
 
async function decreaseQuantity(index) {
  const items = await fetchCart();
  if (!(index in items)) return;
  if (items[index].quantity > 1) {
    items[index].quantity -= 1;
  } else {
    items.splice(index, 1);
  }
  await updateCart(items);
  await loadCartItems();
}

async function increaseQuantity(index) {
  const items = await fetchCart();
  if (!(index in items)) return;
  items[index].quantity += 1;
  await updateCart(items);
  await loadCartItems();
}

async function removeItem(index) {
  const items = await fetchCart();
  if (!(index in items)) return;
  items.splice(index, 1);
  await updateCart(items);
  await loadCartItems();
}

async function clearCart() {
  const items = await fetchCart();
  if (!items.length) {
    alert('Your cart is already empty!');
    return;
  }
  if (confirm('Clear your entire cart?')) {
    await updateCart([]);
    await loadCartItems();
  }
}

async function checkout() {
  try {
    const items = await fetchCart();
    if (!items.length) {
      alert('Your cart is empty!');
      window.location.href = 'index.html';
      return;
    }
    const total = items.reduce((sum, it) => sum + (it.price * it.quantity), 0);
    if (confirm(`Proceed to checkout with ${items.length} items (Total: ₦${total.toFixed(2)})?`)) {
      await updateCart([]);
      window.location.href = 'Note.html';
    }
  } catch (error) {
    console.error('Checkout error:', error);
    alert('Checkout failed. Please try again.');
  }
}

// Initialize only when on Cart.html
document.addEventListener('DOMContentLoaded', async () => {
  await loadCartItems();
});

supabaseClient.auth.onAuthStateChange(async (event) => {
  if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
    await loadCartItems();
  }
});




