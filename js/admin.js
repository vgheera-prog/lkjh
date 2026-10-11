/**
 * Lahore Shahi Qila Restaurant - Admin Panel Logic
 * Location: Grand Trunk Rd, Singhpura Lahore, 54000, Pakistan
 * Phone: 03306863355
 */

document.addEventListener('DOMContentLoaded', async () => {
    // State
    let orders = [];
    let menuItems = [];
    let activeFilter = 'all';
    let previousOrdersCount = 0;
    let soundEnabled = true;

    // Elements
    const loginOverlay = document.getElementById('loginOverlay');
    const loginForm = document.getElementById('loginForm');
    const adminPinInput = document.getElementById('adminPinInput');
    const logoutBtn = document.getElementById('logoutBtn');

    const ordersTableBody = document.getElementById('ordersTableBody');
    const statTotalRevenue = document.getElementById('statTotalRevenue');
    const statTotalOrders = document.getElementById('statTotalOrders');
    const statActiveOrders = document.getElementById('statActiveOrders');
    const statDeliveredOrders = document.getElementById('statDeliveredOrders');
    const dbStatusPill = document.getElementById('dbStatusPill');

    const orderFilterTabs = document.querySelectorAll('.order-tab-btn');
    const navButtons = document.querySelectorAll('.sidebar-nav-item button');
    const tabPanes = document.querySelectorAll('.admin-tab-pane');
    const soundToggleBtn = document.getElementById('soundToggleBtn');

    // Menu Manager Elements
    const adminMenuGrid = document.getElementById('adminMenuGrid');
    const adminMenuSearch = document.getElementById('adminMenuSearch');
    const btnSeedMenu = document.getElementById('btnSeedMenu');
    const btnTestDb = document.getElementById('btnTestDb');
    const btnCopySql = document.getElementById('btnCopySql');

    // Authentication Check
    function checkAuth() {
        const isAuth = localStorage.getItem('lsq_admin_authenticated');
        if (isAuth === 'true') {
            loginOverlay.style.display = 'none';
            initDashboard();
        } else {
            loginOverlay.style.display = 'flex';
        }
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const pin = adminPinInput.value.trim();
            // Default PIN is 1234
            if (pin === '1234') {
                localStorage.setItem('lsq_admin_authenticated', 'true');
                loginOverlay.style.display = 'none';
                initDashboard();
            } else {
                alert('Invalid Admin PIN! (Default demo PIN is 1234)');
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('lsq_admin_authenticated');
            location.reload();
        });
    }

    // Sound Notification Synthesizer (using Web Audio API for guaranteed cross-browser chime)
    function playOrderChime() {
        if (!soundEnabled) return;
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
            osc.frequency.setValueAtTime(880.00, ctx.currentTime + 0.15); // A5
            osc.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.3); // D6

            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.8);
        } catch (e) {
            console.warn('Audio chime notice:', e);
        }
    }

    if (soundToggleBtn) {
        soundToggleBtn.addEventListener('click', () => {
            soundEnabled = !soundEnabled;
            soundToggleBtn.innerHTML = soundEnabled 
                ? `<i class="fas fa-volume-up"></i> Sound Alerts: ON`
                : `<i class="fas fa-volume-mute"></i> Sound Alerts: OFF`;
        });
    }

    // Sidebar navigation tabs
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const targetTab = btn.dataset.tab;
            tabPanes.forEach(pane => {
                pane.classList.remove('active');
                if (pane.id === `${targetTab}Tab`) {
                    pane.classList.add('active');
                }
            });

            if (targetTab === 'menu') {
                renderAdminMenu();
            }
        });
    });

    // Orders Filter Tabs
    orderFilterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            orderFilterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            activeFilter = tab.dataset.status;
            renderOrders();
        });
    });

    // Initialize Dashboard
    async function initDashboard() {
        await checkDbConnection();
        await refreshOrders();
        await loadMenuItems();

        // Auto polling every 8 seconds for live kitchen updates
        setInterval(async () => {
            await refreshOrders(false);
        }, 8000);
    }

    // Check Supabase DB Connection
    async function checkDbConnection() {
        const res = await window.LSQ_DB.testConnection();
        if (dbStatusPill) {
            if (res.ok) {
                dbStatusPill.className = 'db-status-pill';
                dbStatusPill.innerHTML = `<i class="fas fa-database"></i> Supabase Live: Connected`;
            } else {
                dbStatusPill.className = 'db-status-pill warning';
                dbStatusPill.innerHTML = `<i class="fas fa-exclamation-circle"></i> Local DB Mode (Run SQL)`;
            }
        }
    }

    // Refresh Orders from Supabase / Local
    async function refreshOrders(notifyOnNew = true) {
        try {
            const res = await window.LSQ_DB.getOrders();
            const newOrders = res.data || [];

            // Detect new orders and chime
            if (previousOrdersCount > 0 && newOrders.length > previousOrdersCount && notifyOnNew) {
                playOrderChime();
            }
            previousOrdersCount = newOrders.length;
            orders = newOrders;

            updateStats();
            renderOrders();
        } catch (err) {
            console.error('Error refreshing orders:', err);
        }
    }

    // Update Statistics
    function updateStats() {
        const totalRev = orders
            .filter(o => o.status !== 'cancelled')
            .reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

        const totalCount = orders.length;
        const activeCount = orders.filter(o => o.status === 'pending' || o.status === 'preparing' || o.status === 'out_for_delivery').length;
        const deliveredCount = orders.filter(o => o.status === 'delivered').length;

        if (statTotalRevenue) statTotalRevenue.textContent = `Rs. ${totalRev.toLocaleString()}`;
        if (statTotalOrders) statTotalOrders.textContent = totalCount;
        if (statActiveOrders) statActiveOrders.textContent = activeCount;
        if (statDeliveredOrders) statDeliveredOrders.textContent = deliveredCount;
    }

    // Render Orders Table
    function renderOrders() {
        let filtered = orders;
        if (activeFilter !== 'all') {
            filtered = orders.filter(o => o.status === activeFilter);
        }

        if (filtered.length === 0) {
            ordersTableBody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align:center; padding:50px; color:var(--text-muted);">
                        <i class="fas fa-inbox" style="font-size:2rem; color:var(--gold); margin-bottom:12px; display:block;"></i>
                        No orders in this status category.
                    </td>
                </tr>
            `;
            return;
        }

        ordersTableBody.innerHTML = filtered.map(order => {
            const dateStr = new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const itemsSummary = (order.items || []).map(i => `${i.name}${i.variant ? ` (${i.variant})` : ''} x${i.qty}`).join(', ');
            const whatsappCustLink = `https://wa.me/92${(order.customer_phone || '').replace(/\D/g, '').replace(/^0/, '')}?text=Hello%20${encodeURIComponent(order.customer_name)},%20Lahore%20Shahi%20Qila%20Restaurant%20regarding%20Order%20${order.order_number}:`;

            return `
                <tr>
                    <td>
                        <strong style="color:var(--gold-light); font-family:'Cinzel',serif;">${order.order_number}</strong>
                        <div style="font-size:0.75rem; color:var(--text-muted);">${dateStr}</div>
                    </td>
                    <td>
                        <div style="font-weight:700; color:#FFF;">${order.customer_name}</div>
                        <div style="font-size:0.8rem; color:var(--text-muted); display:flex; align-items:center; gap:6px;">
                            <span>${order.customer_phone}</span>
                            <a href="${whatsappCustLink}" target="_blank" style="color:#25D366; text-decoration:none;" title="Chat Customer WhatsApp">
                                <i class="fab fa-whatsapp"></i>
                            </a>
                        </div>
                    </td>
                    <td style="max-width:200px;">
                        <span style="font-size:0.75rem; background:rgba(255,255,255,0.06); padding:2px 8px; border-radius:4px; text-transform:uppercase;">
                            ${order.order_type}
                        </span>
                        <div style="font-size:0.82rem; color:#AAA; margin-top:4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                            ${order.delivery_address || 'Takeaway'}
                        </div>
                    </td>
                    <td style="max-width:240px; font-size:0.85rem; color:#DDD;">
                        ${itemsSummary}
                    </td>
                    <td>
                        <strong style="color:var(--gold-light); font-family:'Cinzel',serif; font-size:1.05rem;">
                            Rs. ${Number(order.total_amount).toLocaleString()}
                        </strong>
                        <div style="font-size:0.75rem; color:#888; text-transform:uppercase;">${order.payment_method}</div>
                    </td>
                    <td>
                        <select class="status-changer-select" onchange="window.updateOrderStatus('${order.id}', this.value)">
                            <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>⏳ Pending</option>
                            <option value="preparing" ${order.status === 'preparing' ? 'selected' : ''}>🔥 Preparing (Kitchen)</option>
                            <option value="out_for_delivery" ${order.status === 'out_for_delivery' ? 'selected' : ''}>🚗 Out for Delivery</option>
                            <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>✅ Delivered</option>
                            <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>❌ Cancelled</option>
                        </select>
                    </td>
                    <td>
                        <button type="button" class="btn-kot-print" onclick="window.printKOT('${order.order_number}')">
                            <i class="fas fa-print"></i> KOT Print
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // Expose status update to window
    window.updateOrderStatus = async (orderId, newStatus) => {
        try {
            await window.LSQ_DB.updateOrderStatus(orderId, newStatus);
            await refreshOrders(false);
        } catch (e) {
            console.error(e);
        }
    };

    // Kitchen Order Ticket (KOT / Receipt) Print
    window.printKOT = (orderNumber) => {
        const order = orders.find(o => o.order_number === orderNumber);
        if (!order) return;

        let kotArea = document.getElementById('kotPrintArea');
        if (!kotArea) {
            kotArea = document.createElement('div');
            kotArea.id = 'kotPrintArea';
            document.body.appendChild(kotArea);
        }

        const dateStr = new Date(order.created_at).toLocaleString();

        let itemsHtml = (order.items || []).map(i => `
            <tr>
                <td style="padding:4px 0;">${i.name} ${i.variant ? `(${i.variant})` : ''}</td>
                <td style="text-align:center;">${i.qty}</td>
                <td style="text-align:right;">Rs. ${(i.price * i.qty).toLocaleString()}</td>
            </tr>
        `).join('');

        kotArea.innerHTML = `
            <div style="text-align:center; border-bottom:1px dashed #000; padding-bottom:8px; margin-bottom:8px;">
                <h2 style="font-size:16px; margin:0;">LAHORE SHAHI QILA</h2>
                <div style="font-size:11px;">Grand Trunk Rd, Singhpura Lahore</div>
                <div style="font-size:11px;">Helpline: 03306863355</div>
                <h3 style="font-size:14px; margin:6px 0 0;">KITCHEN ORDER TICKET (KOT)</h3>
            </div>
            <div style="font-size:11px; margin-bottom:8px;">
                <div><strong>Order #:</strong> ${order.order_number}</div>
                <div><strong>Date:</strong> ${dateStr}</div>
                <div><strong>Customer:</strong> ${order.customer_name} (${order.customer_phone})</div>
                <div><strong>Type:</strong> ${order.order_type.toUpperCase()}</div>
                <div><strong>Address:</strong> ${order.delivery_address}</div>
                <div><strong>Payment:</strong> ${order.payment_method.toUpperCase()}</div>
            </div>
            <table style="width:100%; border-collapse:collapse; font-size:11px; border-bottom:1px dashed #000; padding-bottom:8px; margin-bottom:8px;">
                <thead>
                    <tr style="border-bottom:1px solid #000;">
                        <th style="text-align:left;">Item</th>
                        <th>Qty</th>
                        <th style="text-align:right;">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
            </table>
            <div style="font-size:12px; font-weight:bold; text-align:right; margin-bottom:12px;">
                <div>Subtotal: Rs. ${Number(order.subtotal).toLocaleString()}</div>
                <div>Delivery Fee: Rs. ${Number(order.delivery_fee).toLocaleString()}</div>
                <div style="font-size:14px; margin-top:4px;">TOTAL: Rs. ${Number(order.total_amount).toLocaleString()}</div>
            </div>
            ${order.notes ? `<div style="font-size:11px; border:1px solid #000; padding:4px; margin-bottom:8px;"><strong>SPECIAL INSTRUCTIONS:</strong> ${order.notes}</div>` : ''}
            <div style="text-align:center; font-size:10px; border-top:1px dashed #000; padding-top:6px;">
                *** SHAHI QILA KITCHEN COPY ***
            </div>
        `;

        window.print();
    };

    // Load Menu Items for Admin
    async function loadMenuItems() {
        const res = await window.LSQ_DB.getMenuItems();
        menuItems = res.data || [];
    }

    // Render Menu Items in Admin Tab
    function renderAdminMenu() {
        if (!adminMenuGrid) return;
        const q = (adminMenuSearch ? adminMenuSearch.value : '').toLowerCase();

        const filtered = menuItems.filter(i => {
            return (i.name || '').toLowerCase().includes(q) || (i.category || '').toLowerCase().includes(q);
        });

        adminMenuGrid.innerHTML = filtered.map(item => `
            <div style="background:#151A27; border:1px solid rgba(212,175,55,0.25); border-radius:10px; padding:16px; display:flex; gap:16px; align-items:center;">
                <img src="${item.image_url}" style="width:70px; height:70px; border-radius:8px; object-fit:cover;" onerror="this.src='https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80'">
                <div style="flex:1;">
                    <div style="font-size:0.75rem; color:var(--gold-light); text-transform:uppercase;">${item.category}</div>
                    <h4 style="color:#FFF; font-size:1rem; margin-bottom:4px;">${item.name}</h4>
                    <div style="color:var(--gold-light); font-weight:700;">Rs. ${Number(item.price).toLocaleString()}</div>
                </div>
                <div>
                    <label style="display:flex; align-items:center; gap:8px; font-size:0.85rem; cursor:pointer;">
                        <input type="checkbox" ${item.is_available !== false ? 'checked' : ''} onchange="window.toggleDishStock(${item.id}, this.checked)">
                        <span style="color:${item.is_available !== false ? '#10B981' : '#EF4444'};">
                            ${item.is_available !== false ? 'In Stock' : 'Out of Stock'}
                        </span>
                    </label>
                </div>
            </div>
        `).join('');
    }

    window.toggleDishStock = async (id, isAvailable) => {
        const item = menuItems.find(i => i.id == id);
        if (item) {
            item.is_available = isAvailable;
            await window.LSQ_DB.saveMenuItem(item);
            renderAdminMenu();
        }
    };

    if (adminMenuSearch) {
        adminMenuSearch.addEventListener('input', renderAdminMenu);
    }

    // Seed Menu to Supabase Button
    if (btnSeedMenu) {
        btnSeedMenu.addEventListener('click', async () => {
            btnSeedMenu.disabled = true;
            btnSeedMenu.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Seeding Dishes to Supabase...`;
            const res = await window.LSQ_DB.seedSupabaseMenu();
            if (res.ok) {
                alert(`✅ Success! Seeded ${res.count} authentic dishes directly into your Supabase 'menu_items' table!`);
                await checkDbConnection();
                await loadMenuItems();
                renderAdminMenu();
            } else {
                alert(`Notice: ${res.error}\n\nMake sure you have run the 'supabase_schema.sql' in your Supabase SQL Editor first.`);
            }
            btnSeedMenu.disabled = false;
            btnSeedMenu.innerHTML = `<i class="fas fa-cloud-upload-alt"></i> Seed 45 Menu Dishes to Supabase`;
        });
    }

    // Test DB Button
    if (btnTestDb) {
        btnTestDb.addEventListener('click', async () => {
            btnTestDb.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Testing Connection...`;
            const res = await window.LSQ_DB.testConnection();
            alert(res.ok ? '✅ Supabase Connected Successfully! Orders table is responsive.' : `⚠️ Supabase Status: ${res.error || res.message}`);
            btnTestDb.innerHTML = `<i class="fas fa-plug"></i> Test Supabase Connection`;
            checkDbConnection();
        });
    }

    // Copy SQL Schema Button
    if (btnCopySql) {
        btnCopySql.addEventListener('click', async () => {
            try {
                const response = await fetch('supabase_schema.sql');
                const sqlText = await response.text();
                await navigator.clipboard.writeText(sqlText);
                alert('📋 Full Supabase SQL Schema copied to your clipboard!\n\nOpen your Supabase Dashboard -> SQL Editor -> New Query -> Paste & Run!');
            } catch (e) {
                alert('Please open supabase_schema.sql directly from the project directory to copy it.');
            }
        });
    }

    // Start
    checkAuth();
});
