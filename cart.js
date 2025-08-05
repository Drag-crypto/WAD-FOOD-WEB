



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
function loadCartItems() {
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
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

function decreaseQuantity(index) {
    let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    if (cartItems[index].quantity > 1 ) {
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
    cartItems.quantity += 1;
    localStorage.setItem('cartItems', JSON.stringify(cartItems)) || [];
    
    loadCartItems();
    
}





function clearCart() {

   
    let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    
    if(cartItems.length === 0){
        alert(`You don't have any items in your Cart. Browse to add items to your cart`)
       window.location.href = `index.html`
       return
    }
    const confirmation2 =  confirm("Do you really want to clear your cart?")

    if (confirmation2){
        alert("All Items have been cleared, Keep on shopping.")
        window.location.href = 'index.html'
        localStorage.removeItem('cartItems') || [];
    }
       
       


        loadCartItems();
    
    

}



function removeItem(index) {
    let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    cartItems.splice(index, 1);
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    loadCartItems();
    
    

}



function checkout() {
    let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
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
        window.location.href = "note.html";
        loadCartItems();
        
        

    } else {
        alert("Checkout canceled. You can continue shopping.");
        window.location.href = 'index.html'
        loadCartItems();
        
        
        return
    }




}


document.addEventListener('DOMContentLoaded', loadCartItems, setTimeout(() => console.log(`You can change digits in the Elements tab for education purposes, but it won't change the cart Items and specfications. It may seem like some ordinary website, but is encrypted alongside`)), 1000  )





