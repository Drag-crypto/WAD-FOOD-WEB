const supabaseUrl = 'https://rvlealemvurgmpflajbn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2bGVhbGVtdnVyZ21wZmxhamJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NjEwMDEsImV4cCI6MjA3MDEzNzAwMX0.TPmel2qGoG5R_hnFAB_pF9ZQob5wMkBhJVPbcqs9q8M';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

async function loadCart() {
  try {
    console.log("Attempting to load cart...");
    
    // 1. Check authentication
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.log("No user logged in");
      return [];
    }

    // 2. Fetch cart from Supabase
    const { data, error } = await supabaseClient
      .from('user_carts')
      .select('items')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error("Supabase fetch error:", error);
      // Create cart if doesn't exist
      if (error.code === 'PGRST116') { // Item not found
        console.log("Creating new cart for user");
        const { error: createError } = await supabaseClient
          .from('user_carts')
          .insert({ user_id: user.id, items: [] });
        
        if (createError) throw createError;
        return [];
      }
      throw error;
    }

    console.log("Cart loaded successfully:", data.items);
    return data.items || [];
  } catch (error) {
    console.error("Failed to load cart:", error);
    return [];
  }
 if (error) {
  console.log("Using localStorage fallback");
  return JSON.parse(localStorage.getItem('cartItems')) || [];
}
}

async function renderCart() {
  const cartItems = await loadCart();
  const container = document.getElementById('cart-item-container');
  const totalElement = document.getElementById('cart-total');
  
  container.innerHTML = '';
  let total = 0;

  if (cartItems.length === 0) {
    container.innerHTML = '<p>Your cart is empty</p>';
    totalElement.textContent = '0.00';
    return;
  }

  cartItems.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    
    container.innerHTML += `
      <div class="cart-item">
        <h3>${item.name}</h3>
        <p>Price: ₦${item.price.toFixed(2)}</p>
        <div class="quantity-control">
          <button onclick="updateQuantity(${index}, -1)">-</button>
          <span>${item.quantity}</span>
          <button onclick="updateQuantity(${index}, 1)">+</button>
        </div>
        <p>Total: ₦${itemTotal.toFixed(2)}</p>
        <button onclick="removeItem(${index})">Remove</button>
      </div>
    `;
  });

  totalElement.textContent = total.toFixed(2);
  updateCartCount(cartItems);
}

async function updateQuantity(index, change) {
  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error("Not logged in");

    const { data: cart, error: fetchError } = await supabaseClient
      .from('user_carts')
      .select('items')
      .eq('user_id', user.id)
      .single();

    if (fetchError) throw fetchError;

    const items = cart.items || [];
    const newQuantity = items[index].quantity + change;

    if (newQuantity < 1) {
      items.splice(index, 1);
    } else {
      items[index].quantity = newQuantity;
    }

    const { error: updateError } = await supabaseClient
      .from('user_carts')
      .upsert({ user_id: user.id, items: items });

    if (updateError) throw updateError;

    renderCart();
  } catch (error) {
    console.error("Error updating quantity:", error);
    alert("Failed to update quantity. Please try again.");
  }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
  renderCart();
});
