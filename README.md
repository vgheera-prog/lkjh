# 👑 Lahore Shahi Qila Restaurant (لاہور شاہی قلعہ ریسٹورنٹ)
### Premium Food Ordering Web Application with Supabase PostgreSQL Backend & Admin Panel

---

## 📍 Restaurant Details & Configuration
- **Restaurant Name:** Lahore Shahi Qila Restaurant (لاہور شاہی قلعہ ریسٹورنٹ)
- **Location:** Grand Trunk Rd, Singhpura Lahore, 54000, Pakistan
- **Helpline & WhatsApp:** 03306863355 (`+923306863355`)
- **Theme & Aesthetics:** Elegant Pastel Rosey Pink (`#F5CAD3`), Rose Gold (`#EAA9B7`), and Rich Warm Brown / Mocha (`#24161C`, `#4E2830`) inspired by the authentic brick entrance and Mughal rose heritage.
- **Real Restaurant Entrance:** Features the physical restaurant entrance with the illuminated neon arch sign ("لاہور شاہی قلعہ RESTAURANT") at Grand Trunk Road, Singhpura Lahore.
- **Currency:** Pakistani Rupee (`PKR` / `Rs.`)
- **Mughal Culinary Specialties:** Live Charcoal BBQ, Handi in Clay Pots, Karahi in Woks, Fresh Tandoori Naan & Platters.

---

## 🗄️ Supabase Cloud Database Configuration
- **Supabase Project Reference:** `hrnimbbhjccixheydcom`
- **Supabase REST URL:** `https://hrnimbbhjccixheydcom.supabase.co`
- **Anonymous Public Key:** Configured in `js/supabase-client.js`
- **SQL Initialization Schema:** Available in `supabase_schema.sql`

### ⚡ 1-Minute Supabase Database Setup
1. Log into your [Supabase Dashboard](https://supabase.com/dashboard/project/hrnimbbhjccixheydcom).
2. Go to the **SQL Editor** tab from the left sidebar.
3. Click **New query**, open `supabase_schema.sql` (or click **"Copy Full SQL Setup Script"** in the Admin Portal), and paste the entire script.
4. Click **Run**.
5. Both `orders` and `menu_items` tables are created with public access policies, real-time replication, and all 45 authentic dishes from the reference image pre-seeded!

> 💡 **Resilient Fallback Mode:** The website and admin panel feature a dual-layer local caching system. Even before running the SQL script or if your network drops, customers can place orders and the kitchen admin sees them immediately in real time without errors!

---

## 🚀 Features Overview

### 1. 🍽️ Customer Website (`index.html`)
- **Royal Mughal Aesthetic:** Deep royal burgundy and dark obsidian backgrounds, imperial gold accents, ornate arches matching the restaurant's menu card photo.
- **Complete Authentic Menu with Pakistani Rupee (PKR):**
  - **Starters & Soups:** Plain Fries, Chicken Strips (Rs. 480), Mexican Crispy Tacos (Rs. 499), Nachos Bites (Rs. 480), Loaded Fries (Rs. 650), Shahi Chicken 65 (Rs. 545), Cream of Chicken Soup (Rs. 375), Hot n Sour (Rs. 299), Shahi Qila Special (Rs. 450).
  - **Clay Tandoor:** Stuffed Cheese Naan (Rs. 550), Sada Naan (Rs. 65), Kalongi Naan (Rs. 85), Garlic Naan (Rs. 95), Chicken Cheese Naan (Rs. 550), Saada Roti (Rs. 50), Roghni Naan (Rs. 75).
  - **B.B.Q Plates:** Chicken Kabab (4 pcs - Rs. 745), Beef Kabab (4 pcs - Rs. 845), Chicken Tikka Boti (12 pcs - Rs. 745), Malai Boti (12 pcs - Rs. 1,150), Reshmi Kabab (Rs. 950), Boneless Tikka (Rs. 1,150), Tikka Piece (Rs. 399).
  - **Grand BBQ Platters:**
    - **B.B.Q Platter 1 (4 Persons - Rs. 3,850):** 2 Tikka pcs, 2 Chicken Kabab, 2 Beef Kabab, 2 Cheese Kabab, 4 Achari Boti, 4 Boneless Tikka, 4 Malai Boti, 4 Tikka Boti, Raita, Kachumar Salad & 6 Hot Naans.
    - **B.B.Q Platter 2 (2 Persons - Rs. 2,050):** 1 Tikka pc, 2 Chicken Kabab, 2 Beef Kabab, 2 Achari Boti, 4 Boneless Tikka, 4 Malai Boti, Raita & 3 Hot Naans.
  - **Traditional Handi:** Lemon Chilli Handi (Rs. 1,350), Jalfrezi (Rs. 1,150), Ginger Handi (Rs. 1,150), Rajasthani (Rs. 1,150), Peri Peri (Rs. 1,150), Shahi Signature Qeema (Rs. 1,150).
  - **Karahi (Half & Full selector):** Chicken Karahi (Half Rs. 980 / Full Rs. 1,650), Shahi Mutton Karahi (Half Rs. 2,250 / Full Rs. 3,450), Mutton Shinwari (Half Rs. 2,250 / Full Rs. 3,450), Lemon Chilli Chicken Karahi, Lemon Chilli Mutton Karahi.
  - **Chinese & Burgers:** Dry Chilli Chicken/Beef (Rs. 950), Cashew Nut (Rs. 1,350), Manchurian (Rs. 950), Chicken Tickle Pickle Burger with fries (Rs. 545).
- **Interactive Tray / Cart Drawer:** Quantity +/- controls, variant selector (Half/Full), delivery charges calculation, free delivery over Rs. 2,500.
- **Checkout Modal:** Name, Pakistani mobile number validation, delivery address or takeaway, payment methods (Cash on Delivery, JazzCash, EasyPaisa, Direct Bank Transfer).
- **Instant WhatsApp Integration:** Directly formats the entire order breakdown and launches WhatsApp to `03306863355` so the kitchen desk gets the instant ping!
- **Live Order Tracking:** Customers can enter their Order Number (e.g. `LSQ-4921`) to check the order status in real time.

---

### 2. 🛡️ Kitchen & Operations Admin Portal (`admin.html`)
- **Security Access:** Protected with PIN (Default demo PIN: `1234`).
- **Live Dashboard Stats:** Today's Sales in PKR, Total Orders, Active Kitchen Orders, Delivered Orders.
- **Live Kitchen Orders Board:** Auto-polls every 8 seconds with audio chime alerts when a new order arrives.
- **Instant Order Status Updater:** Pending ➔ Preparing (In Kitchen) ➔ Out for Delivery ➔ Delivered / Cancelled.
- **1-Click WhatsApp Customer Contact:** Opens chat with the customer for delivery coordination.
- **KOT (Kitchen Order Ticket) Thermal Printing:** Formatted 80mm receipt printing with items list, customer phone, and special instructions.
- **Menu Stock Manager:** Toggle items in stock / out of stock instantly.
- **Supabase Sync Tools:** Test connection, seed dishes, and copy SQL schema directly.

---

## 📁 File Structure
```
website/
├── index.html              # Customer ordering website
├── admin.html              # Kitchen operations & admin portal
├── supabase_schema.sql     # PostgreSQL database creation script & seed
├── README.md               # Documentation & setup guide
├── css/
│   ├── style.css           # Customer website styles (Dark gold Mughal theme)
│   └── admin.css           # Admin dashboard & KOT print styles
└── js/
    ├── supabase-client.js  # Supabase client & resilient storage layer
    ├── app.js              # Customer store logic & WhatsApp dispatches
    └── admin.js            # Admin panel logic, audio alerts & KOT printer
```

---

## 🌐 How to Run Locally
Double-click `index.html` to open the customer website in any browser, or open `admin.html` (PIN: `1234`) to access the kitchen admin panel!
