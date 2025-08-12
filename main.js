// Add this at the top of main.js (after canvas declaration)
const supabaseUrl = 'https://rvlealemvurgmpflajbn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2bGVhbGVtdnVyZ21wZmxhamJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NjEwMDEsImV4cCI6MjA3MDEzNzAwMX0.TPmel2qGoG5R_hnFAB_pF9ZQob5wMkBhJVPbcqs9q8M';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

function goToCart() {
    window.location.href = 'Cart.html';
}
function goToSnack() {
    window.location.href = 'Snack.html';
}
function goToSoup() {
    window.location.href = 'Soup.html';
}

function goToContact(){
    window.location.href = 'Contact me.html';
}
function goHome(){
    window.location.href = 'index.html';
}


        function goToBuns(){
            window.location.href= 'Buns.html'
       }
        function goToCake(){
            window.location.href= 'Cakes.html'
       }
            function goToCookies(){
                window.location.href= 'Cookies.html'
            }
            function goToChin(){
                window.location.href= 'ChinChin.html'
            }
            function goToPuff(){
                window.location.href= 'Puff.html'
            }
                function goToDoughnut(){
                    window.location.href= 'Doughnut.html'
                }

                    function goToMeatpie(){
                        window.location.href = 'Meatpie.html'
                    }
    
                    function goToBurger(){
                        window.location.href= 'Burger.html'
                    }
    
                        function goToPizza(){
                            window.location.href= 'Pizza.html'
                        }
                        
                        function goToOkro(){
                            window.location.href='Okro.html';
                        }
                function goToEgusi(){
                            window.location.href='Egusi.html'
                        }
                function goToAfang(){
                            window.location.href='AfangSoup.html';
                        }

                function goToOgbonno(){
                            window.location.href='Ogbonno.html';
                        }
                function goToWhiteSoup(){
                            window.location.href='WhiteSoup.html';
                        }
                function goToBitterLeaf(){
                            window.location.href='BitterLeaf.html';
                        }
                function goToVegetableSoup(){
                            window.location.href='Vegetable.html';
                        }

// Replace the existing addToCart function with this:
async function addToCart(button) {
    try {
        // Get user session
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) {
            alert("Please sign in to add items to your cart");
            window.location.href = 'login-email.html';
            return;
        }

        const productElement = button.closest('.product');
        const newItem = {
            id: productElement.dataset.id,
            name: productElement.dataset.name,
            price: parseFloat(productElement.dataset.price),
            quantity: 1
        };

        // Get current cart from Supabase
        const { data: cartData } = await supabaseClient
            .from('user_carts')
            .select('items')
            .eq('user_id', user.id)
            .single();

        let currentItems = cartData?.items || [];
        
        // Check if item already exists
        const existingItemIndex = currentItems.findIndex(item => item.id === newItem.id);
        
        if (existingItemIndex !== -1) {
            // Update quantity if exists
            currentItems[existingItemIndex].quantity += 1;
        } else {
            // Add new item if doesn't exist
            currentItems.push(newItem);
        }

        // Update cart in Supabase
        const { error } = await supabaseClient
            .from('user_carts')
            .upsert({
                user_id: user.id,
                items: currentItems
            });

        if (error) throw error;

        // Update UI
        updateCartCounter();
        alert(`${newItem.name} added to cart!`);
    } catch (error) {
        console.error("Error adding to cart:", error);
        alert("Failed to add item to cart. Please try again.");
    }
}

async function updateAuthButton() {
    const authButton = document.getElementById('auth-button');
    const { data: { user } } = await supabaseClient.auth.getUser();
    
    authButton.textContent = user ? 'Logout' : 'Login';
    authButton.onclick = user ? logout : () => window.location.href = 'login-email.html';
}

// Replace the existing updateCartCounter function with this:
async function updateCartCounter() {
    try {
        const cartCount = document.getElementById('cart-count');
        const { data: { user } } = await supabaseClient.auth.getUser();
        
        if (!user) {
            cartCount.textContent = '0';
            return;
        }

        // Get cart from Supabase
        const { data } = await supabaseClient
            .from('user_carts')
            .select('items')
            .eq('user_id', user.id)
            .single();

        const itemCount = data?.items?.reduce((total, item) => total + item.quantity, 0) || 0;
        cartCount.textContent = itemCount;
    } catch (error) {
        console.error("Error updating cart counter:", error);
        document.getElementById('cart-count').textContent = '0';
    }
}

// Add this logout function (replace if exists)
async function logout() {
  try {
    const { error } = await supabaseClient.auth.signOut();
    if (error) throw error;
    window.location.href = 'index.html'; // Redirect after logout
  } catch (error) {
    console.error('Logout error:', error);
  }
}
// Add auth state listener to handle cart updates on login/logout
supabaseClient.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        updateCartCounter();
        updateAuthButton();
    }
});

// Initialize cart counter when page loads
document.addEventListener('DOMContentLoaded', () => {
    updateCartCounter();
    updateAuthButton();
});


