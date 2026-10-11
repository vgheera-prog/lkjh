/**
 * Lahore Shahi Qila Restaurant - Customer Front-end Application
 * Location: Grand Trunk Rd, Singhpura Lahore, 54000, Pakistan
 * Phone / WhatsApp: 03306863355
 */

document.addEventListener('DOMContentLoaded', async () => {
    // App State
    let menuItems = [];
    let cart = [];
    let currentCategory = 'all';
    let searchQuery = '';
    let sortFilter = 'default';
    let activeCheckoutType = 'delivery';
    let activePaymentMethod = 'cash';

    // DOM Elements
    const dishesGrid = document.getElementById('dishesGrid');
    const categoryTabs = document.querySelectorAll('.category-tab-btn');
    const searchInput = document.getElementById('searchMenuInput');
    const sortSelect = document.getElementById('sortMenuSelect');
    
    // Cart Elements
    const cartDrawer = document.getElementById('cartDrawer');
    const modalOverlay = document.getElementById('modalOverlay');
    const cartNavBtn = document.getElementById('cartNavBtn');
    const floatingCartPill = document.getElementById('floatingCartPill');
    const closeCartBtn = document.getElementById('closeCartBtn');
    const cartItemsContainer = document.getElementById('cartItemsContainer');
    const cartEmptyState = document.getElementById('cartEmptyState');
    const cartSubtotalEl = document.getElementById('cartSubtotal');
    const cartDeliveryEl = document.getElementById('cartDelivery');
    const cartGrandTotalEl = document.getElementById('cartGrandTotal');
    const cartNavCount = document.getElementById('cartNavCount');
    const floatingCartCount = document.getElementById('floatingCartCount');
    const floatingCartTotal = document.getElementById('floatingCartTotal');
    const checkoutBtn = document.getElementById('checkoutBtn');

    // Checkout Modal Elements
    const checkoutModal = document.getElementById('checkoutModal');
    const closeCheckoutBtn = document.getElementById('closeCheckoutBtn');
    const checkoutForm = document.getElementById('checkoutForm');
    const orderTypeBtns = document.querySelectorAll('.order-type-btn');
    const addressGroup = document.getElementById('addressGroup');
    const paymentOptions = document.querySelectorAll('.payment-option-card');
    const checkoutSummaryItems = document.getElementById('checkoutSummaryItems');
    const checkoutTotalAmount = document.getElementById('checkoutTotalAmount');

    // Success Modal Elements
    const successModal = document.getElementById('successModal');
    const closeSuccessBtn = document.getElementById('closeSuccessBtn');
    const successOrderNumber = document.getElementById('successOrderNumber');
    const successWhatsAppBtn = document.getElementById('successWhatsAppBtn');
    const successTrackBtn = document.getElementById('successTrackBtn');

    // Track Order Modal Elements
    const trackModal = document.getElementById('trackModal');
    const trackNavBtn = document.getElementById('trackNavBtn');
    const closeTrackBtn = document.getElementById('closeTrackBtn');
    const trackForm = document.getElementById('trackForm');
    const trackQueryInput = document.getElementById('trackQueryInput');
    const trackResultContainer = document.getElementById('trackResultContainer');

    // Load Cart from localStorage
    function loadSavedCart() {
        try {
            const saved = localStorage.getItem('lsq_customer_cart');
            if (saved) {
                cart = JSON.parse(saved);
            }
        } catch (e) {
            cart = [];
        }
        updateCartUI();
    }

    function saveCart() {
        localStorage.setItem('lsq_customer_cart', JSON.stringify(cart));
        updateCartUI();
    }

    // Load Menu Data from Supabase / Local Fallback
    async function loadMenu() {
        dishesGrid.innerHTML = `
            <div class="menu-empty-state">
                <i class="fas fa-spinner fa-spin"></i>
                <h3>Loading Shahi Dastarkhwan...</h3>
                <p>Fetching authentic royal delicacies from Lahore Shahi Qila kitchen...</p>
            </div>
        `;

        try {
            const res = await window.LSQ_DB.getMenuItems();
            menuItems = res.data || [];
            updateCategoryCounts();
            renderDishes();
        } catch (err) {
            console.error('Failed to load menu:', err);
            dishesGrid.innerHTML = `
                <div class="menu-empty-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Menu temporarily unavailable</h3>
                    <p>Please check your internet connection or call directly at 03306863355.</p>
                </div>
            `;
        }
    }

    // Update Category Badge Counters
    function updateCategoryCounts() {
        categoryTabs.forEach(tab => {
            const cat = tab.dataset.category;
            const counter = tab.querySelector('.badge-counter');
            if (counter) {
                if (cat === 'all') {
                    counter.textContent = menuItems.length;
                } else if (cat === 'platters') {
                    const count = menuItems.filter(i => i.category === 'platters' || i.category === 'bbq').length;
                    counter.textContent = count;
                } else {
                    const count = menuItems.filter(i => i.category === cat).length;
                    counter.textContent = count;
                }
            }
        });
    }

    // Filter and Render Dishes
    function renderDishes() {
        let filtered = menuItems.filter(item => {
            // Category filter
            let matchesCategory = true;
            if (currentCategory !== 'all') {
                if (currentCategory === 'platters') {
                    matchesCategory = item.category === 'platters' || item.category === 'bbq';
                } else {
                    matchesCategory = item.category === currentCategory;
                }
            }

            // Search filter
            let matchesSearch = true;
            if (searchQuery.trim() !== '') {
                const q = searchQuery.toLowerCase();
                const name = (item.name || '').toLowerCase();
                const urdu = (item.name_urdu || '').toLowerCase();
                const desc = (item.description || '').toLowerCase();
                matchesSearch = name.includes(q) || urdu.includes(q) || desc.includes(q);
            }

            return matchesCategory && matchesSearch;
        });

        // Sorting
        if (sortFilter === 'price-low') {
            filtered.sort((a, b) => a.price - b.price);
        } else if (sortFilter === 'price-high') {
            filtered.sort((a, b) => b.price - a.price);
        } else if (sortFilter === 'featured') {
            filtered.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
        }

        if (filtered.length === 0) {
            dishesGrid.innerHTML = `
                <div class="menu-empty-state">
                    <i class="fas fa-utensils"></i>
                    <h3>No royal dishes found</h3>
                    <p>We couldn't find any dishes matching "${searchQuery}". Try selecting another category.</p>
                </div>
            `;
            return;
        }

        dishesGrid.innerHTML = filtered.map(item => createDishCardHTML(item)).join('');

        // Attach variant listeners and add to cart buttons
        attachDishCardEvents();
    }

    // Dish Card HTML Template
    function createDishCardHTML(item) {
        const hasVariants = item.has_variants || (item.half_price && item.full_price);
        const displayPrice = item.price;
        const servesTag = item.serves ? `<span class="dish-serves-tag"><i class="fas fa-user-friends"></i> ${item.serves}</span>` : '';
        const badgeTag = item.badge ? `<span class="dish-badge-tag">${item.badge}</span>` : '';

        return `
            <div class="dish-card" data-dish-id="${item.id}">
                <div class="dish-image-wrapper">
                    <img src="${item.image_url}" alt="${item.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80'">
                    ${badgeTag}
                    ${servesTag}
                </div>
                <div class="dish-content-body">
                    ${item.name_urdu ? `<div class="dish-urdu-header">${item.name_urdu}</div>` : ''}
                    <h3 class="dish-title">${item.name}</h3>
                    <p class="dish-description">${item.description || 'Prepared with royal Mughal spices and fresh ingredients.'}</p>
                    
                    ${hasVariants ? `
                        <div class="dish-variant-selector" data-item-id="${item.id}">
                            <button type="button" class="variant-btn active" data-variant="Half" data-price="${item.half_price || item.price}">Half (Rs. ${Number(item.half_price || item.price).toLocaleString()})</button>
                            <button type="button" class="variant-btn" data-variant="Full" data-price="${item.full_price}">Full (Rs. ${Number(item.full_price).toLocaleString()})</button>
                        </div>
                    ` : ''}

                    <div class="dish-footer-row">
                        <div class="dish-price-box">
                            <span class="price-label">Price in PKR</span>
                            <span class="dish-price-pkr" id="dish-price-${item.id}">Rs. ${Number(displayPrice).toLocaleString()}</span>
                        </div>
                        <button type="button" class="btn-add-cart" data-id="${item.id}">
                            <i class="fas fa-plus"></i> Add
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Attach Dish Card Events
    function attachDishCardEvents() {
        // Variant button toggles
        document.querySelectorAll('.dish-variant-selector').forEach(selector => {
            const itemId = selector.dataset.itemId;
            const buttons = selector.querySelectorAll('.variant-btn');
            const priceEl = document.getElementById(`dish-price-${itemId}`);

            buttons.forEach(btn => {
                btn.addEventListener('click', () => {
                    buttons.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    const newPrice = btn.dataset.price;
                    if (priceEl) {
                        priceEl.textContent = `Rs. ${Number(newPrice).toLocaleString()}`;
                    }
                });
            });
        });

        // Add to Cart Buttons
        document.querySelectorAll('.btn-add-cart').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const dishId = btn.dataset.id;
                const dish = menuItems.find(i => i.id == dishId);
                if (!dish) return;

                // Check if card has active variant
                const card = btn.closest('.dish-card');
                const activeVariantBtn = card ? card.querySelector('.variant-btn.active') : null;
                
                let selectedVariant = null;
                let selectedPrice = dish.price;

                if (activeVariantBtn) {
                    selectedVariant = activeVariantBtn.dataset.variant;
                    selectedPrice = Number(activeVariantBtn.dataset.price);
                }

                addToCart(dish, selectedVariant, selectedPrice);

                // Quick bounce visual
                btn.innerHTML = `<i class="fas fa-check"></i> Added`;
                btn.style.background = '#10B981';
                setTimeout(() => {
                    btn.innerHTML = `<i class="fas fa-plus"></i> Add`;
                    btn.style.background = '';
                }, 1200);
            });
        });
    }

    // Add Item to Cart
    function addToCart(dish, variant, price) {
        const itemKey = variant ? `${dish.id}_${variant}` : `${dish.id}`;
        const existing = cart.find(i => i.key === itemKey);

        if (existing) {
            existing.qty += 1;
        } else {
            cart.push({
                key: itemKey,
                id: dish.id,
                name: dish.name,
                name_urdu: dish.name_urdu || '',
                variant: variant || '',
                price: price || dish.price,
                qty: 1,
                notes: ''
            });
        }

        saveCart();
        showToast(`Added ${dish.name} ${variant ? `(${variant})` : ''} to royal tray!`);
    }

    // Modify Cart Item Qty
    function changeCartQty(itemKey, delta) {
        const item = cart.find(i => i.key === itemKey);
        if (!item) return;

        item.qty += delta;
        if (item.qty <= 0) {
            cart = cart.filter(i => i.key !== itemKey);
        }
        saveCart();
    }

    // Remove Item from Cart
    function removeCartItem(itemKey) {
        cart = cart.filter(i => i.key !== itemKey);
        saveCart();
        showToast('Item removed from tray.');
    }

    // Update Cart UI, Drawers, and Totals
    function updateCartUI() {
        const totalItemsCount = cart.reduce((sum, item) => sum + item.qty, 0);
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
        
        // Delivery fee rule: Free delivery above Rs. 2,500, else Rs. 150 (if delivery selected)
        let deliveryFee = 0;
        if (cart.length > 0) {
            if (activeCheckoutType === 'takeaway') {
                deliveryFee = 0;
            } else {
                deliveryFee = subtotal >= 2500 ? 0 : 150;
            }
        }
        const grandTotal = subtotal + deliveryFee;

        // Update badge counters
        if (cartNavCount) cartNavCount.textContent = totalItemsCount;
        if (floatingCartCount) floatingCartCount.textContent = totalItemsCount;
        if (floatingCartTotal) floatingCartTotal.textContent = `Rs. ${subtotal.toLocaleString()}`;

        // Toggle floating pill
        if (floatingCartPill) {
            if (totalItemsCount > 0) {
                floatingCartPill.style.display = 'flex';
            } else {
                floatingCartPill.style.display = 'none';
            }
        }

        // Render Cart Drawer list
        if (cart.length === 0) {
            if (cartItemsContainer) cartItemsContainer.style.display = 'none';
            if (cartEmptyState) cartEmptyState.style.display = 'block';
            if (checkoutBtn) checkoutBtn.disabled = true;
        } else {
            if (cartEmptyState) cartEmptyState.style.display = 'none';
            if (cartItemsContainer) {
                cartItemsContainer.style.display = 'flex';
                cartItemsContainer.innerHTML = cart.map(item => `
                    <div class="cart-item-row" data-key="${item.key}">
                        <div class="cart-item-main">
                            <div class="cart-item-info">
                                <h4>${item.name}</h4>
                                ${item.variant ? `<span class="cart-item-variant">Variant: ${item.variant}</span>` : ''}
                            </div>
                            <div class="cart-item-price">Rs. ${(item.price * item.qty).toLocaleString()}</div>
                        </div>
                        <div class="cart-item-controls">
                            <div class="qty-counter">
                                <button type="button" class="qty-btn" onclick="window.changeCartQty('${item.key}', -1)">-</button>
                                <span class="qty-value">${item.qty}</span>
                                <button type="button" class="qty-btn" onclick="window.changeCartQty('${item.key}', 1)">+</button>
                            </div>
                            <button type="button" class="btn-remove-item" onclick="window.removeCartItem('${item.key}')">
                                <i class="fas fa-trash-alt"></i> Remove
                            </button>
                        </div>
                    </div>
                `).join('');
            }
            if (checkoutBtn) checkoutBtn.disabled = false;
        }

        // Update Summary Row numbers
        if (cartSubtotalEl) cartSubtotalEl.textContent = `Rs. ${subtotal.toLocaleString()}`;
        if (cartDeliveryEl) cartDeliveryEl.textContent = deliveryFee === 0 ? 'FREE' : `Rs. ${deliveryFee.toLocaleString()}`;
        if (cartGrandTotalEl) cartGrandTotalEl.textContent = `Rs. ${grandTotal.toLocaleString()}`;
    }

    // Expose functions to window for inline onclicks
    window.changeCartQty = changeCartQty;
    window.removeCartItem = removeCartItem;

    // Open / Close Cart Drawer
    function openCart() {
        cartDrawer.classList.add('active');
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeCart() {
        cartDrawer.classList.remove('active');
        modalOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Category Tabs Switching
    categoryTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            categoryTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentCategory = tab.dataset.category;
            renderDishes();
        });
    });

    // Search and Sort
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            renderDishes();
        });
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            sortFilter = e.target.value;
            renderDishes();
        });
    }

    // Quick Add button for Special Items in Hero
    document.querySelectorAll('.mini-quick-add').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.dishId;
            const item = menuItems.find(i => i.id == id);
            if (item) {
                addToCart(item, null, item.price);
                openCart();
            }
        });
    });

    // Cart Drawer Triggers
    if (cartNavBtn) cartNavBtn.addEventListener('click', openCart);
    if (floatingCartPill) floatingCartPill.addEventListener('click', openCart);
    if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
    if (modalOverlay) {
        modalOverlay.addEventListener('click', () => {
            closeCart();
            closeCheckout();
            closeSuccess();
            closeTrack();
        });
    }

    // Open Checkout Modal
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) return;
            closeCart();
            openCheckout();
        });
    }

    function openCheckout() {
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
        let deliveryFee = activeCheckoutType === 'takeaway' ? 0 : (subtotal >= 2500 ? 0 : 150);
        const grandTotal = subtotal + deliveryFee;

        // Render Checkout Summary
        if (checkoutSummaryItems) {
            checkoutSummaryItems.innerHTML = cart.map(i => `
                <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:0.9rem; color:#DDD;">
                    <span>${i.name} ${i.variant ? `(${i.variant})` : ''} x ${i.qty}</span>
                    <span style="font-weight:700; color:var(--pink-pastel);">Rs. ${(i.price * i.qty).toLocaleString()}</span>
                </div>
            `).join('');
        }

        if (checkoutTotalAmount) {
            checkoutTotalAmount.textContent = `Rs. ${grandTotal.toLocaleString()}`;
        }

        checkoutModal.classList.add('active');
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeCheckout() {
        checkoutModal.classList.remove('active');
        modalOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (closeCheckoutBtn) closeCheckoutBtn.addEventListener('click', closeCheckout);

    // Order Type Switching (Delivery vs Takeaway)
    orderTypeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            orderTypeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeCheckoutType = btn.dataset.type;

            if (activeCheckoutType === 'takeaway') {
                if (addressGroup) addressGroup.style.display = 'none';
            } else {
                if (addressGroup) addressGroup.style.display = 'block';
            }
            updateCartUI();
            openCheckout(); // recompute total summary
        });
    });

    // Payment Option Switching
    paymentOptions.forEach(opt => {
        opt.addEventListener('click', () => {
            paymentOptions.forEach(o => o.classList.remove('active'));
            opt.classList.add('active');
            activePaymentMethod = opt.dataset.payment;
        });
    });

    // Handle Order Submission
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = checkoutForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Placing Royal Order...`;

            const customerName = document.getElementById('custName').value.trim();
            const customerPhone = document.getElementById('custPhone').value.trim();
            const customerAddress = activeCheckoutType === 'delivery' 
                ? document.getElementById('custAddress').value.trim() 
                : 'Takeaway Counter - Lahore Shahi Qila';
            const orderNotes = document.getElementById('custNotes').value.trim();

            const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
            let deliveryFee = activeCheckoutType === 'takeaway' ? 0 : (subtotal >= 2500 ? 0 : 150);
            const totalAmount = subtotal + deliveryFee;

            const orderPayload = {
                customer_name: customerName,
                customer_phone: customerPhone,
                delivery_address: customerAddress,
                order_type: activeCheckoutType,
                payment_method: activePaymentMethod,
                items: cart,
                subtotal: subtotal,
                delivery_fee: deliveryFee,
                discount: 0,
                total_amount: totalAmount,
                notes: orderNotes
            };

            try {
                // Place order into Supabase & Local Database
                const result = await window.LSQ_DB.createOrder(orderPayload);
                const orderData = result.order;

                // Close checkout modal
                closeCheckout();

                // Clear customer cart
                cart = [];
                saveCart();

                // Generate WhatsApp URL
                const whatsappUrl = window.LSQ_DB.generateWhatsAppUrl(orderData);

                // Show Success Modal
                if (successOrderNumber) {
                    successOrderNumber.textContent = orderData.order_number;
                }

                if (successWhatsAppBtn) {
                    successWhatsAppBtn.href = whatsappUrl;
                }

                if (successTrackBtn) {
                    successTrackBtn.onclick = () => {
                        closeSuccess();
                        openTrack(orderData.order_number);
                    };
                }

                successModal.classList.add('active');
                modalOverlay.classList.add('active');

                // Proactively trigger notification
                showToast(`Order #${orderData.order_number} confirmed! WhatsApp alert ready.`);

            } catch (err) {
                console.error('Order creation error:', err);
                alert('There was an issue processing your order. Please call 03306863355 directly.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = `Confirm & Place Royal Order`;
            }
        });
    }

    // Success Modal Close
    function closeSuccess() {
        successModal.classList.remove('active');
        modalOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (closeSuccessBtn) closeSuccessBtn.addEventListener('click', closeSuccess);

    // Track Order Modal
    function openTrack(orderNumToSearch = '') {
        trackModal.classList.add('active');
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';

        if (orderNumToSearch) {
            trackQueryInput.value = orderNumToSearch;
            searchAndRenderTrack(orderNumToSearch);
        }
    }

    function closeTrack() {
        trackModal.classList.remove('active');
        modalOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (trackNavBtn) trackNavBtn.addEventListener('click', () => openTrack());
    if (closeTrackBtn) closeTrackBtn.addEventListener('click', closeTrack);

    if (trackForm) {
        trackForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const query = trackQueryInput.value.trim();
            if (!query) return;
            searchAndRenderTrack(query);
        });
    }

    async function searchAndRenderTrack(query) {
        trackResultContainer.innerHTML = `
            <div style="text-align:center; padding:30px;">
                <i class="fas fa-spinner fa-spin" style="font-size:2rem; color:var(--gold-primary);"></i>
                <p style="margin-top:10px; color:var(--text-muted);">Tracking your order in the royal kitchen...</p>
            </div>
        `;

        const foundOrders = await window.LSQ_DB.trackOrder(query);

        if (foundOrders.length === 0) {
            trackResultContainer.innerHTML = `
                <div style="text-align:center; padding:30px; border:1px dashed var(--royal-border); border-radius:12px;">
                    <i class="fas fa-search" style="font-size:2rem; color:var(--text-muted); margin-bottom:10px;"></i>
                    <h4 style="color:#FFF;">No orders found</h4>
                    <p style="color:var(--text-muted); font-size:0.9rem;">No active order matching "${query}". Please check your order number or phone, or contact us at 03306863355.</p>
                </div>
            `;
            return;
        }

        const order = foundOrders[0];
        const statusSteps = [
            { key: 'pending', label: 'Order Placed' },
            { key: 'preparing', label: 'In Tandoor & Wok' },
            { key: 'out_for_delivery', label: 'Out for Delivery' },
            { key: 'delivered', label: 'Delivered' }
        ];

        let activeIndex = 0;
        if (order.status === 'preparing') activeIndex = 1;
        else if (order.status === 'out_for_delivery') activeIndex = 2;
        else if (order.status === 'delivered') activeIndex = 3;

        trackResultContainer.innerHTML = `
            <div style="background:#161B27; border:1px solid rgba(212,175,55,0.3); border-radius:12px; padding:20px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                    <div>
                        <span style="font-size:0.8rem; color:var(--text-muted);">Order Number</span>
                        <h4 style="color:var(--gold-light); font-family:'Cinzel',serif; font-size:1.25rem;">${order.order_number}</h4>
                    </div>
                    <span style="background:var(--royal-crimson); color:#FFF; font-size:0.8rem; padding:4px 12px; border-radius:12px; text-transform:uppercase; font-weight:700;">
                        ${order.status.replace(/_/g, ' ')}
                    </span>
                </div>

                <div class="tracking-timeline">
                    ${statusSteps.map((step, idx) => `
                        <div class="timeline-step ${idx <= activeIndex ? (idx === activeIndex ? 'active' : 'completed') : ''}">
                            <div class="step-node">
                                ${idx < activeIndex ? '<i class="fas fa-check"></i>' : idx + 1}
                            </div>
                            <span class="step-title">${step.label}</span>
                        </div>
                    `).join('')}
                </div>

                <div style="border-top:1px dashed rgba(212,175,55,0.25); padding-top:14px; margin-top:14px; font-size:0.88rem; color:#CCC;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                        <span>Customer Name:</span>
                        <strong style="color:#FFF;">${order.customer_name}</strong>
                    </div>
                    <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                        <span>Address / Type:</span>
                        <strong style="color:#FFF;">${order.delivery_address}</strong>
                    </div>
                    <div style="display:flex; justify-content:space-between;">
                        <span>Total Bill:</span>
                        <strong style="color:var(--gold-light); font-family:'Cinzel',serif; font-size:1.05rem;">Rs. ${Number(order.total_amount).toLocaleString()}</strong>
                    </div>
                </div>
            </div>
        `;
    }

    // Toast Notification helper
    function showToast(msg) {
        let toast = document.getElementById('globalToast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'globalToast';
            toast.style.cssText = `
                position: fixed;
                bottom: 24px;
                left: 24px;
                background: linear-gradient(135deg, #2D161F, #4A2631);
                color: #FFF;
                border: 1px solid var(--rose-gold);
                padding: 12px 20px;
                border-radius: 8px;
                box-shadow: 0 8px 30px rgba(0,0,0,0.85);
                z-index: 2000;
                font-size: 0.9rem;
                display: flex;
                align-items: center;
                gap: 10px;
                transform: translateY(100px);
                opacity: 0;
                transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            `;
            document.body.appendChild(toast);
        }

        toast.innerHTML = `<i class="fas fa-crown" style="color:var(--pink-pastel);"></i> ${msg}`;
        toast.style.transform = 'translateY(0)';
        toast.style.opacity = '1';

        setTimeout(() => {
            toast.style.transform = 'translateY(100px)';
            toast.style.opacity = '0';
        }, 3200);
    }

    // Initialize application
    loadSavedCart();
    await loadMenu();
});
