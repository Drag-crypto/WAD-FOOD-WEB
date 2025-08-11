 const supabaseUrl = 'https://rvlealemvurgmpflajbn.supabase.co';
        const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2bGVhbGVtdnVyZ21wZmxhamJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NjEwMDEsImV4cCI6MjA3MDEzNzAwMX0.TPmel2qGoG5R_hnFAB_pF9ZQob5wMkBhJVPbcqs9q8M';
        const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

        function goToCart() { window.location.href = 'Cart.html'; }
        function goToSnack() { window.location.href = 'Snack.html'; }
        function goToSoup() { window.location.href = 'Soup.html'; }
        function goToContact() { window.location.href = 'Contact me.html'; }
        function goHome() { window.location.href = 'index.html'; }

        async function logout() {
            const { error } = await supabaseClient.auth.signOut();
            window.location.href = 'index.html';
        }

        async function loadCartItems() {
            document.getElementById('loading-overlay').style.display = 'flex';
            try {
                const { data: { user } } = await supabaseClient.auth.getUser();
                if (!user) throw new Error("Not authenticated");

                const { data: cart, error } = await supabaseClient
                    .from('user_carts')
                    .select('items')
                    .eq('user_id', user.id)
                    .single();

                if (error) throw error;
                renderCartItems(cart?.items || []);
            } catch (error) {
                console.error("Failed to load cart:", error);
                renderCartItems([]);
            } finally {
                document.getElementById('loading-overlay').style.display = 'none';
            }
        }

        function renderCartItems(items) {
            const container = document.getElementById('cart-item-container');
            const totalElement = document.getElementById('cart-total');
            let total = 0;

            container.innerHTML = items.length ? '' : '<h2>Your cart is empty</h2>';

            items.forEach((item, index) => {
                const itemTotal = item.price * item.quantity;
                total += itemTotal;
                
                container.innerHTML += `
                    <div class="product" data-id="${item.id}">
                        <h3>${item.name}</h3>
                        <p>Price: ₦${item.price.toFixed(2)}</p>
                        <p>
                            Quantity: 
                            <button onclick="modifyQuantity(${index}, -1)">-</button>
                            ${item.quantity}
                            <button onclick="modifyQuantity(${index}, 1)">+</button>
                        </p>
                        <p>Total: ₦${itemTotal.toFixed(2)}</p>
                        <button onclick="removeItem(${index})">Remove</button>
                    </div>
                    <hr>
                `;
            });

            totalElement.textContent = total.toFixed(2);
            updateCartCount(items);
        }

        async function modifyQuantity(index, delta) {
            try {
                const { data: { user } } = await supabaseClient.auth.getUser();
                if (!user) throw new Error("Not authenticated");

                const { data: cart, error: fetchError } = await supabaseClient
                    .from('user_carts')
                    .select('items')
                    .eq('user_id', user.id)
                    .single();

                if (fetchError) throw fetchError;

                const items = cart?.items || [];
                const newQty = items[index].quantity + delta;

                if (newQty < 1) {
                    items.splice(index, 1);
                } else {
                    items[index].quantity = newQty;
                }

                const { error: saveError } = await supabaseClient
                    .from('user_carts')
                    .upsert({
                        user_id: user.id,
                        items: items,
                        updated_at: new Date()
                    });

                if (saveError) throw saveError;

                renderCartItems(items);
            } catch (error) {
                console.error("Quantity update failed:", error);
                alert("Couldn't update quantity. Please try again.");
            }
        }

        async function removeItem(index) {
            if (!confirm("Remove this item from cart?")) return;
            
            try {
                const { data: { user } } = await supabaseClient.auth.getUser();
                if (!user) throw new Error("Not authenticated");

                const { data: cart, error: fetchError } = await supabaseClient
                    .from('user_carts')
                    .select('items')
                    .eq('user_id', user.id)
                    .single();

                if (fetchError) throw fetchError;

                const items = cart?.items || [];
                items.splice(index, 1);

                const { error: saveError } = await supabaseClient
                    .from('user_carts')
                    .upsert({
                        user_id: user.id,
                        items: items,
                        updated_at: new Date()
                    });

                if (saveError) throw saveError;

                renderCartItems(items);
            } catch (error) {
                console.error("Remove item failed:", error);
                alert("Failed to remove item. Please try again.");
            }
        }

        async function clearCart() {
            if (!confirm("Clear your entire cart?")) return;
            
            try {
                const { data: { user } } = await supabaseClient.auth.getUser();
                if (!user) throw new Error("Not authenticated");

                const { error } = await supabaseClient
                    .from('user_carts')
                    .upsert({
                        user_id: user.id,
                        items: [],
                        updated_at: new Date()
                    });

                if (error) throw error;

                renderCartItems([]);
            } catch (error) {
                console.error("Clear cart failed:", error);
                alert("Failed to clear cart. Please try again.");
            }
        }

        async function checkout() {
            try {
                const { data: { user } } = await supabaseClient.auth.getUser();
                if (!user) throw new Error("Not authenticated");

                const { data: cart, error: fetchError } = await supabaseClient
                    .from('user_carts')
                    .select('items')
                    .eq('user_id', user.id)
                    .single();

                if (fetchError) throw fetchError;

                if (!cart?.items || cart.items.length === 0) {
                    alert("Your cart is empty!");
                    return;
                }

                if (confirm("Proceed to checkout?")) {
                    window.location.href = "Note.html";
                }
            } catch (error) {
                console.error("Checkout failed:", error);
                alert("Checkout error. Please try again.");
            }
        }

        async function updateCartCount(items) {
            try {
                if (!items) {
                    const { data: { user } } = await supabaseClient.auth.getUser();
                    if (!user) {
                        document.getElementById('cart-count').textContent = '0';
                        return;
                    }

                    const { data: cart } = await supabaseClient
                        .from('user_carts')
                        .select('items')
                        .eq('user_id', user.id)
                        .single();

                    items = cart?.items || [];
                }

                const count = items.reduce((sum, item) => sum + item.quantity, 0);
                document.getElementById('cart-count').textContent = count;
            } catch (error) {
                console.error("Update count error:", error);
            }
        }

        document.addEventListener('DOMContentLoaded', () => {
            loadCartItems();
        });
