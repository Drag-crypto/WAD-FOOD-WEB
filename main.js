

const canvas = document.getElementById('canvas1')


function toggleDropdown() {
    document.getElementById("mydpdmenu").classList.toggle("show");
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
                            

window.onclick = function(event) {
    if (!event.target.matches('.dpdbtn')) {
        var dropdowns = document.getElementsByClassName("dpd-content");
        for (var i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
                }
    }
} 


function addToCart(button){
    
        
        
        const productElement = button.closest('.product');
        
    
    
    
         item = {
                     
                     id: productElement.dataset.id,
                     name: productElement.dataset.name,
                     price: parseFloat(productElement.dataset.price),
                     quantity: 1 
        
           
        }
        
    
    
        
    

        let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];

        const existingItem = cartItems.find(i => i.id === item.id);
        
        

        if (existingItem) {
            existingItem.quantity += 1;
    
        } else {
            cartItems.push(item);
    
    
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
    
        
        updateCartCounter();
    
        }
    }

   



function updateCartCounter() {
    const cartCount = document.getElementById('cart-count');
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    cartCount.textContent = cartItems.length;


}













document.addEventListener('DOMContentLoaded', updateCartCounter, setTimeout(() => console.log(`You can change digits in the Elements tab for educational purposes, but it won't change the cart Items and specfications. It may seem like some ordinary website, but is encrypted alongside`)), 1000 )
