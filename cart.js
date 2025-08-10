const supabaseUrl = 'https://rvlealemvurgmpflajbn.supabase.co';
const supabaseKey = 'your-supabase-key-here'; // Replace with your actual key
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// Add these NEW helper functions (place them after the navigation functions)
async function getUserCart() {
    const { data: { user }, error } = await supabaseClient.auth.getUser();
    if (error || !user) {
        window.location.href = 'login-email.html';
        throw new Error('Not Authenticated');
        return [];
    }
    const { data } = await supabaseClient
        .from('user_carts')
        .select('items')
        .eq('user_id', user.id)
        .single();
    return data?.items || [];
}

async function saveUserCart(items) {
    try {
        const {error} = await supabaseClient.from('user_carts').upsert(...);
        if (error) throw error;
    } catch (e) {
        console.error("Cart Save Failed:", e);
        alert("Failed to save cart. Working offline (changes may not persist)");
    }
    
    
    const { data: { user } } = await supabaseClient.auth.getUser();
    await supabaseClient
        .from('user_carts')
        .upsert({
            user_id: user.id,
            items: items,
            updated_at: new Date()
        });
}




function goToCart() {
    window.location.href = 'Cart.html';
}
function goToSnack() {
    window.location.href = 'Snack.html';
}
function goToSoup() {
    window.location.href = 'Soup.html';
}

function goToContact() {
    window.location.href = 'Contact me.html';
}
function goHome() {
    window.location.href = 'index.html';
}



//* START THE CART PROCESS*  *WAD-FOOD-WEB* 
async function loadCartItems() {
    try {
        const cartItems = await getUserCart();
        if (cartItems.length === 0) {
            document.getElementById('cart-item-container').innerHTML = 
                '<h2>Your cart is empty</h2>';
            return;
        
        }
    }    catch(e)
    
    const cartItems = await getUserCart();
    const cartItemsContainer = document.getElementById('cart-item-container');
    const cartTotal = document.getElementById('cart-total');
    let total = 0;


    cartItemsContainer.innerHTML = '';


    cartItems.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
       

        cartItemsContainer.innerHTML += `
                <div class="product">
               
                   <h3>${item.name}</h3>
                    <p>Price: ₦${item.price}</p>
                    <p>
                        Quantity: 
                        <button onclick="decreaseQuantity(${index})">-</button>
                        ${item.quantity}
                        <button onclick="increaseQuantity(${index})">+</button>
                    </p>
                    <p>Total: ₦${itemTotal}</p>
                    <button class="header-button" onclick="removeItem(${index})">Remove</button>
                </div>
                
                
                <hr>
            `
            if (cartItems    === 0){
                cartItemsContainer.innerHTML+= `<h2>You do not have any item in your cart at the moment. Go to any of the pages to browse and add items to your cart</h2>`
                console.log('Done')
            }

    });

    cartTotal.textContent = total.toFixed(2);

    
}

async function decreaseQuantity(index) {
    let cartItems = await getUserCart();
    if (cartItems[index].quantity > 1 ) {
        cartItems[index].quantity -= 1;
    } else {
        cartItems.splice(index, 1);
    }
    await saveUserCart(cartItems);
    loadCartItems();
    
    
}

async function increaseQuantity(index) {
    let cartItems = await getUserCart();
    cartItems[index].quantity += 1;
    cartItems.quantity += 1;
    await saveUserCart(cartItems);
    
    loadCartItems();
    
}





async function clearCart() {

   
    let cartItems = await getUserCart();
    
    if(cartItems.length === 0){
        alert(`You don't have any items in your Cart. Browse to add items to your cart`)
       window.location.href = `index.html`
       return
    }
    const confirmation2 =  confirm("Do you really want to clear your cart?")

    if (confirmation2){
        alert("All Items have been cleared, Keep on shopping.")
        window.location.href = 'index.html'
        await saveUserCart([]);
    }
       
       


        loadCartItems();
    
    

}



async function removeItem(index) {
    let cartItems = await getUserCart();
    cartItems.splice(index, 1);
    await saveUserCart(cartItems);
    loadCartItems();
    
    

}



async function checkout() {
    let cartItems = await getUserCart();
    if (cartItems.length === 0) {
        alert("You don't have any item in your cart. Browse and add items to your cart to checkout.");
        window.location.href = "index.html"
        return;

    }

     if(cartItems.length === 0){

    }

    const confirmation = confirm("Are you sure you want to proceed with the checkout? ");

    if (confirmation) {
        alert("Proceeding to checkout!");
        window.location.href = "Note.html";
        loadCartItems();
        
        

    } else {
        alert("Checkout canceled. You can continue shopping.");
        window.location.href = 'index.html'
        loadCartItems();
        
        
        return
    }




}


document.addEventListener('DOMContentLoaded', async ()  =>{ console.log(`You can change digits in the Elements tab for education purposes, but it won't change the cart Items and specfications. It may seem like some ordinary website, but is encrypted alongside`)), 1000  )}







