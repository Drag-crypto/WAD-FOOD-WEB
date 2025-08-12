// Supabase Client Setup
const supabaseUrl = 'https://rvlealemvurgmpflajbn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2bGVhbGVtdnVyZ21wZmxhamJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NjEwMDEsImV4cCI6MjA3MDEzNzAwMX0.TPmel2qGoG5R_hnFAB_pF9ZQob5wMkBhJVPbcqs9q8M';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// ========== NAVIGATION FUNCTIONS ==========
function goToCart() { window.location.href = 'Cart.html'; }
function goToSnack() { window.location.href = 'Snack.html'; }
function goToSoup() { window.location.href = 'Soup.html'; }
function goToContact() { window.location.href = 'Contact me.html'; }
function goHome() { window.location.href = 'index.html'; }

// ========== USER-SPECIFIC CART SYSTEM ==========

// 1. FETCH USER'S CART FROM SUPABASE
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

// 2. UPDATE USER'S CART IN SUPABASE
async function updateCart(items) {
  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return false;
    
    const { error } = await supabaseClient
      .from('user_carts')
      .upsert({ 
        user_id: user.id, 
        items: items 
      });
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Update cart error:", error);
    return false;
  }
}

// 3. MIGRATE LOCALSTORAGE CART TO SUPABASE (ONE-TIME OPERATION)
async function migrateCartToSupabase() {
  const localCart = JSON.parse(localStorage.getItem('cartItems')) || [];
  if (localCart.length > 0) {
    const success = await updateCart(localCart);
    if (success) {
      localStorage.removeItem('cartItems');
      console.log("Cart migrated successfully from localStorage to Supabase");
    }
  }
}

// 4. LOAD CART ITEMS FROM SUPABASE
async function loadCartItems() {
  const cartItems = await fetchCart();
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

// 5. QUANTITY FUNCTIONS (UPDATES SUPABASE)
async function decreaseQuantity(index) {
  const cartItems = await fetchCart();
  if (cartItems[index].quantity > 1) {
    cartItems[index].quantity -= 1;
  } else {
    cartItems.splice(index, 1);
  }
  await updateCart(cartItems);
  loadCartItems();
}

async function increaseQuantity(index) {
  const cartItems = await fetchCart();
  cartItems[index].quantity += 1;
  await updateCart(cartItems);
  loadCartItems();
}

// 6. REMOVE ITEM (UPDATES SUPABASE)
async function removeItem(index) {
  const cartItems = await fetchCart();
  cartItems.splice(index, 1);
  await updateCart(cartItems);
  loadCartItems();
}

// 7. CLEAR CART (UPDATES SUPABASE)
async function clearCart() {
  const cartItems = await fetchCart();
  if (cartItems.length === 0) {
    alert("Your cart is already empty!");
    return;
  }
  if (confirm("Clear your entire cart?")) {
    await updateCart([]);
    loadCartItems();
  }
}

// 8. CHECKOUT FUNCTION
async function checkout() {
  try {
    const cartItems = await fetchCart();
    if (cartItems.length === 0) {
      alert("Your cart is empty!");
      window.location.href = "index.html";
      return;
    }

    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (confirm(`Proceed to checkout with ${cartItems.length} items (Total: ₦${total.toFixed(2)})?`)) {
      await updateCart([]); // Clear the cart in Supabase
      window.location.href = "Note.html";
    }
  } catch (error) {
    console.error("Checkout error:", error);
    alert("Checkout failed. Please try again.");
  }
}

// 9. UPDATE CART COUNT (FETCHES FROM SUPABASE)

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  const { data: { user } } = await supabaseClient.auth.getUser();
  
  // First migrate any localStorage cart to Supabase
  if (user) {
    await migrateCartToSupabase();
  
  
  await loadCartItems();
  
  } else {
    document.getElementById('cart-item-container').innerHTML = '<h2>Please sign in to view your cart</h2>';
    document.getElementById('cart-total').textContent = '0.00';
  }
  
  
});
supabaseClient.auth.onAuthStateChange(async (event) => {
  if (event === 'SIGNED_IN') {
    await migrateCartToSupabase();
    await loadCartItems();
  } else if (event === 'SIGNED_OUT') {
    document.getElementById('cart-item-container').innerHTML = '<h2>Please sign in to view your cart</h2>';
    document.getElementById('cart-total').textContent = '0.00';
  }
  
});
