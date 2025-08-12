// Supabase Client Setup
const supabaseUrl = 'https://rvlealemvurgmpflajbn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2bGVhbGVtdnVyZ21wZmxhamJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NjEwMDEsImV4cCI6MjA3MDEzNzAwMX0.TPmel2qGoG5R_hnFAB_pF9ZQob5wMkBhJVPbcqs9q8M';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// ========== YOUR ORIGINAL NAVIGATION FUNCTIONS ==========
function goToCart() { window.location.href = 'Cart.html'; }
function goToSnack() { window.location.href = 'Snack.html'; }
function goToSoup() { window.location.href = 'Soup.html'; }
function goToContact() { window.location.href = 'Contact me.html'; }
function goHome() { window.location.href = 'index.html'; }

// ========== COMPLETE CART SYSTEM ==========

// 1. FETCH CART (now properly defined)
async function fetchCart() {
  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabaseClient
      .from('user_carts')
      .select('items')
      .eq('user_id', user.id)
      .single();

    return error ? [] : (data?.items || []);
  } catch (error) {
    console.error("Fetch cart error:", error);
    return [];
  }
}

// 2. YOUR ORIGINAL LOAD FUNCTION (now with correct fetchCart call)
async function loadCartItems() {
  const cartItems = await fetchCart(); // Now using the properly defined function
  const container = document.getElementById('cart-item-container');
  const totalElement = document.getElementById('cart-total');
  let total = 0;

  container.innerHTML = '';
  
  if (cartItems.length === 0) {
    container.innerHTML = '<h2>Your cart is empty</h2>';
    totalElement.textContent = '0.00';
    return;
  }

  cartItems.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    
    container.innerHTML += `
      <div class="product" data-id="${item.id}">
        <h3>${item.name}</h3>
        <p>Price: ₦${item.price}</p>
        <p>
          Quantity: 
          <button onclick="decreaseQuantity(${index})">-</button>
          ${item.quantity}
          <button onclick="increaseQuantity(${index})">+</button>
        </p>
        <p>Total: ₦${itemTotal}</p>
        <button onclick="removeItem(${index})">Remove</button>
      </div>
      <hr>
    `;
  });

  totalElement.textContent = total.toFixed(2);
}

// 3. YOUR QUANTITY FUNCTIONS (unchanged)
function decreaseQuantity(index) {
  let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
  if (cartItems[index].quantity > 1) {
    cartItems[index].quantity -= 1;
  } else {
    cartItems.splice(index, 1);
  }
  localStorage.setItem('cartItems', JSON.stringify(cartItems));
  loadCartItems();
}

function increaseQuantity(index) {
  let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
  cartItems[index].quantity += 1;
  localStorage.setItem('cartItems', JSON.stringify(cartItems));
  loadCartItems();
}

// 4. YOUR REMOVE FUNCTION (unchanged)
function removeItem(index) {
  let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
  cartItems.splice(index, 1);
  localStorage.setItem('cartItems', JSON.stringify(cartItems));
  loadCartItems();
}

// 5. YOUR CLEAR CART FUNCTION (unchanged)
function clearCart() {
  let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
  if (cartItems.length === 0) {
    alert("Your cart is already empty!");
    return;
  }
  if (confirm("Clear your entire cart?")) {
    localStorage.removeItem('cartItems');
    loadCartItems();
  }
}

// 6. COMPLETE CHECKOUT FUNCTION (fixed)
async function checkout() {
  try {
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    if (cartItems.length === 0) {
      alert("Your cart is empty!");
      window.location.href = "index.html";
      return;
    }

    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (confirm(`Proceed to checkout with ${cartItems.length} items (Total: ₦${total.toFixed(2)})?`)) {
      // Clear both localStorage AND Supabase cart
      localStorage.removeItem('cartItems');
      
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (user) {
        await supabaseClient
          .from('user_carts')
          .upsert({ user_id: user.id, items: [] });
      }
      
      window.location.href = "Note.html";
    }
  } catch (error) {
    console.error("Checkout error:", error);
    alert("Checkout failed. Please try again.");
  }
}

// 7. UPDATE CART COUNT (unchanged)
function updateCartCount() {
  const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
  const count = cartItems.reduce((total, item) => total + item.quantity, 0);
  document.getElementById('cart-count').textContent = count;
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadCartItems();
  updateCartCount();
});
