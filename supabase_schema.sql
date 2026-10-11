-- ==============================================================================
-- LAHORE SHAHI QILA RESTAURANT (لاہور شاہی قلعہ)
-- SUPABASE DATABASE INITIALIZATION SCHEMA
-- Project Reference: hrnimbbhjccixheydcom
-- Location: Grand Trunk Rd, Singhpura Lahore, 54000, Pakistan
-- Phone / WhatsApp: 03306863355
-- ==============================================================================

-- 1. DROP EXISTING TABLES IF NEEDED (Optional, run with caution)
-- DROP TABLE IF EXISTS order_items CASCADE;
-- DROP TABLE IF EXISTS orders CASCADE;
-- DROP TABLE IF EXISTS menu_items CASCADE;

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CREATE MENU ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.menu_items (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    name_urdu TEXT,
    category TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    half_price NUMERIC(10, 2),
    full_price NUMERIC(10, 2),
    image_url TEXT,
    is_available BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    serves TEXT,
    badge TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CREATE ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT NOT NULL UNIQUE,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    delivery_address TEXT,
    order_type TEXT NOT NULL DEFAULT 'delivery', -- 'delivery' or 'takeaway'
    payment_method TEXT NOT NULL DEFAULT 'cash', -- 'cash', 'jazzcash', 'easypaisa', 'bank'
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0,
    delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
    discount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ENABLE ROW LEVEL SECURITY (RLS) & SET PERMISSIVE POLICIES FOR STORE DEMO
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Menu Items Policies (Anyone can read; anon can read & manage for admin dashboard)
DROP POLICY IF EXISTS "Public can view menu items" ON public.menu_items;
CREATE POLICY "Public can view menu items" 
    ON public.menu_items FOR SELECT 
    USING (true);

DROP POLICY IF EXISTS "Allow anon insert menu items" ON public.menu_items;
CREATE POLICY "Allow anon insert menu items" 
    ON public.menu_items FOR INSERT 
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon update menu items" ON public.menu_items;
CREATE POLICY "Allow anon update menu items" 
    ON public.menu_items FOR UPDATE 
    USING (true);

DROP POLICY IF EXISTS "Allow anon delete menu items" ON public.menu_items;
CREATE POLICY "Allow anon delete menu items" 
    ON public.menu_items FOR DELETE 
    USING (true);

-- Orders Policies (Anyone can insert orders; anyone can read orders to track status; admin can update)
DROP POLICY IF EXISTS "Public can place orders" ON public.orders;
CREATE POLICY "Public can place orders" 
    ON public.orders FOR INSERT 
    WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view orders" ON public.orders;
CREATE POLICY "Public can view orders" 
    ON public.orders FOR SELECT 
    USING (true);

DROP POLICY IF EXISTS "Public can update order status" ON public.orders;
CREATE POLICY "Public can update order status" 
    ON public.orders FOR UPDATE 
    USING (true);

-- 5. REALTIME REPLICATION (Allows Admin Panel to receive instant orders without refreshing)
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.menu_items;

-- 6. POPULATE INITIAL AUTHENTIC DISHES FROM THE SHAHI QILA MENU CARD
INSERT INTO public.menu_items (name, name_urdu, category, description, price, half_price, full_price, serves, badge, is_featured, image_url) VALUES
-- STARTERS
('Plain Fries', 'پلین فرائز', 'starters', 'Crispy golden fried potato chips tossed with special house seasoning.', 250, NULL, NULL, '1-2 persons', NULL, false, 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=600&q=80'),
('Chicken Strips', 'چکن سٹرپس', 'starters', '4 crispy tender chicken strips served with special tandoori dipping sauce.', 480, NULL, NULL, '4 Pcs', 'Chef Special', true, 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=600&q=80'),
('Mexican Crispy Tacos', 'میکسیکن کرسپی ٹیکوز', 'starters', 'Crispy chicken, shredded iceberg lettuce & authentic spiced taco sauce.', 499, NULL, NULL, '2 Pcs', 'Popular', false, 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=600&q=80'),
('Nachos Bites', 'ناچوز بائٹس', 'starters', '8 pcs crunchy nachos loaded with chicken, melted cheese, sour cream & tangy salsa.', 480, NULL, NULL, '8 Pcs', 'Bestseller', true, 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=600&q=80'),
('Loaded Fries', 'لوڈڈ فرائز', 'starters', 'Crispy french fries generously layered with melted masala cheese & garlic cream sauce.', 650, NULL, NULL, '2-3 persons', 'Signature', true, 'https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=600&q=80'),
('Shahi Chicken 65', 'شاہی چکن ۶۵', 'starters', 'Spicy, deep-fried South Asian delicacy marinated in royal herbs and curry leaves.', 545, NULL, NULL, '1-2 persons', 'Royal Special', true, 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=600&q=80'),
('Fresh Raita', 'رائتہ', 'starters', 'Cool seasoned yogurt with roasted cumin and fresh mint.', 99, NULL, NULL, '1 Bowl', NULL, false, 'https://images.unsplash.com/photo-1594998893017-36147cbcae05?auto=format&fit=crop&w=600&q=80'),
('Fresh Salad', 'تازہ سلاد', 'starters', 'Crisp sliced garden fresh cucumbers, tomatoes, carrots and onions.', 120, NULL, NULL, '1 Plate', NULL, false, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80'),
('Kachumar Salad', 'کچومر سلاد', 'starters', 'Finely diced onion, tomato, green chillies tossed with lemon and chaat masala.', 150, NULL, NULL, '1 Bowl', NULL, false, 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80'),

-- SOUPS
('Cream of Chicken Soup', 'کریم آف چکن سوپ', 'soup', 'Rich velvety cream soup loaded with shredded chicken and fragrant herbs.', 375, NULL, NULL, '1 Bowl', 'Winter Special', false, 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80'),
('Hot n Sour Soup', 'ہاٹ اینڈ سور سوپ', 'soup', 'Traditional spicy and tangy soup with egg drops, chicken shreds and Chinese vegetables.', 299, NULL, NULL, '1 Bowl', 'Classic', false, 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=600&q=80'),
('Chicken Corn Soup', 'چکن کارن سوپ', 'soup', 'Classic comforting soup with sweet golden corn and shredded chicken breast.', 299, NULL, NULL, '1 Bowl', 'Favorite', false, 'https://images.unsplash.com/photo-1603105037880-880cd4edfb0d?auto=format&fit=crop&w=600&q=80'),
('Shahi Qila Special Soup', 'شاہی قلعہ اسپیشل سوپ', 'soup', 'Royal house soup crafted with prawns, tender chicken, mushrooms & royal secret spices.', 450, NULL, NULL, '1 Bowl', 'Chef Choice', true, 'https://images.unsplash.com/photo-1607528971899-2e89e6c0ec69?auto=format&fit=crop&w=600&q=80'),

-- TANDOOR
('Cheese Naan', 'چیز نان', 'tandoor', 'Fluffy clay-oven tandoori naan stuffed with molten mozzarella & cheddar cheese.', 550, NULL, NULL, '1 Pc', 'Bestseller', true, 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80'),
('Sada Naan', 'سادہ نان', 'tandoor', 'Traditional freshly baked hot tandoori flatbread.', 65, NULL, NULL, '1 Pc', NULL, false, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80'),
('Kalongi Naan', 'کلونجی نان', 'tandoor', 'Crispy tandoori naan sprinkled with aromatic black nigella seeds.', 85, NULL, NULL, '1 Pc', NULL, false, 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80'),
('Garlic Naan', 'گارلک نان', 'tandoor', 'Tandoori naan infused with roasted garlic flakes and fresh cilantro butter.', 95, NULL, NULL, '1 Pc', 'Popular', false, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80'),
('Chicken Cheese Naan', 'چکن چیز نان', 'tandoor', 'Stuffed with spiced minced chicken and loaded gooey cheese baked golden in clay oven.', 550, NULL, NULL, '1 Pc', 'Royal Must-Try', true, 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80'),
('Saada Roti', 'سادہ روٹی', 'tandoor', 'Whole wheat healthy roti baked directly on tandoor walls.', 50, NULL, NULL, '1 Pc', NULL, false, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80'),
('Roghni Naan', 'روغنی نان', 'tandoor', 'Soft leavened royal bread brushed with desi ghee and sesame seeds.', 75, NULL, NULL, '1 Pc', 'Classic', false, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80'),

-- BBQ PLATES
('Chicken Kabab', 'چکن کباب', 'bbq', '4 succulent skewers of spiced minced chicken flame grilled over charcoal.', 745, NULL, NULL, '4 Pcs', 'Popular', true, 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80'),
('Beef Kabab', 'بیف کباب', 'bbq', '4 skewers of tender spiced minced beef grilled to perfection over hot embers.', 845, NULL, NULL, '4 Pcs', 'Bestseller', true, 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80'),
('Chicken Tikka Boti', 'چکن تکہ بوٹی', 'bbq', '12 juicy chunks of chicken marinated in Lahore Shahi Qila special tandoori masala.', 745, NULL, NULL, '12 Pcs', 'Traditional', true, 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=600&q=80'),
('Malai Boti', 'ملائی بوٹی', 'bbq', '12 melt-in-mouth chicken cubes marinated in rich fresh cream, cheese and mild spices.', 1150, NULL, NULL, '12 Pcs', 'Royal Favorite', true, 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80'),
('Reshmi Kabab', 'ریشمی کباب', 'bbq', '4 silken skewers of chicken mince blended with butter, cream and gentle spices.', 950, NULL, NULL, '4 Pcs', 'Deluxe', false, 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80'),
('Boneless Tikka', 'بون لیس تکہ', 'bbq', '12 pcs succulent boneless breast fillet chargrilled over live charcoal.', 1150, NULL, NULL, '12 Pcs', 'Hot & Spicy', false, 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=600&q=80'),
('Tikka Piece', 'تکہ پیس (لیگ/بریسٹ)', 'bbq', 'Choice of chicken leg or breast piece marinated overnight and flame roasted.', 399, NULL, NULL, '1 Pc', 'Street Classic', false, 'https://images.unsplash.com/photo-1527477378407-668566b55d8a?auto=format&fit=crop&w=600&q=80'),

-- BBQ PLATTERS
('B.B.Q Platter 1 (Grand Royal)', 'بی بی کیو پلیٹر ۱ (شاہی)', 'platters', 'Grand Feast: Tikka Leg/Breast 2 pcs, Chicken Kabab 2 pcs, Beef Kabab 2 pcs, Cheese Kabab 2 pcs, Achari Boti 4 pcs, Boneless Tikka 4 pcs, Malai Boti 4 pcs, Tikka Boti 4 pcs, Raita, Kachumar Salad & 6 Hot Naans.', 3850, NULL, NULL, 'Serves 4 Persons', 'Royal Feast', true, 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80'),
('B.B.Q Platter 2 (Couple Supreme)', 'بی بی کیو پلیٹر ۲ (کپل اسپیشل)', 'platters', 'Couple Deluxe: Tikka Leg/Breast 1 pc, Chicken Kabab 2 pcs, Beef Kabab 2 pcs, Achari Boti 2 pcs, Boneless Tikka 4 pcs, Malai Boti 4 pcs, Raita & 3 Hot Naans.', 2050, NULL, NULL, 'Serves 2 Persons', 'Super Saver', true, 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80'),

-- TRADITIONAL HANDI
('Lemon Chilli Chicken Handi', 'لیمن چلی چکن ہانڈی', 'handi', 'Boneless chicken cubes simmered in a zesty, fiery lemon-green chilli gravy inside a clay pot.', 1350, NULL, NULL, '2-3 persons', 'Signature', true, 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80'),
('Chicken Jalfrezi Handi', 'چکن جلفریزی ہانڈی', 'handi', 'Stir-fried chicken cooked with crisp bell peppers, onions, tomatoes and spicy tangy curry.', 1150, NULL, NULL, '2-3 persons', 'Popular', false, 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80'),
('Ginger Chicken Handi', 'جنجر چکن ہانڈی', 'handi', 'Aromatic boneless chicken infused with freshly julienned ginger and slow-cooked in butter.', 1150, NULL, NULL, '2-3 persons', 'Classic', false, 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80'),
('Rajasthani Chicken Handi', 'راجستھانی چکن ہانڈی', 'handi', 'Rich and royal mildly spiced yogurt curry preparation with royal dry fruits and spices.', 1150, NULL, NULL, '2-3 persons', 'Desi Royal', false, 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80'),
('Peri Peri Chicken Handi', 'پیری پیری چکن ہانڈی', 'handi', 'Fiery fusion handi cooked with vibrant birds eye chilli and royal herbs.', 1150, NULL, NULL, '2-3 persons', 'Spicy', false, 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80'),
('Shahi Signature Qeema Handi', 'شاہی سگنیچر قیمہ ہانڈی', 'handi', 'Fine minced meat sautéed in desi butter, whole spices and slow-simmered in clay handi.', 1150, NULL, NULL, '2-3 persons', 'House Pride', true, 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80'),

-- KARAHI (Available in Half & Full)
('Chicken Karahi', 'چکن کڑاہی', 'karahi', 'Authentic Lahore street style chicken karahi cooked in fresh tomatoes, ginger and green chillies on high flame.', 980, 980, 1650, 'Half / Full', 'Evergreen', true, 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=600&q=80'),
('Shahi Mutton Karahi', 'شاہی مٹن کڑاہی', 'karahi', 'Tender cuts of mutton slow-cooked in traditional iron wok with fresh tomatoes, black pepper and butter.', 2250, 2250, 3450, 'Half / Full', 'Royal Specialty', true, 'https://images.unsplash.com/photo-1545247181-516773cae7be?auto=format&fit=crop&w=600&q=80'),
('Mutton Shinwari', 'مٹن شنواری', 'karahi', 'Khyber Shinwari style fresh mutton prepared in animal fat, salt, tomatoes and whole green chillies with zero dry spices.', 2250, 2250, 3450, 'Half / Full', 'Authentic Shinwari', true, 'https://images.unsplash.com/photo-1545247181-516773cae7be?auto=format&fit=crop&w=600&q=80'),
('Lemon Chilli Chicken Karahi', 'لیمن چلی چکن کڑاہی', 'karahi', 'Zesty spiced chicken wok stir-fry bursting with tangy fresh Lahore lemons and slit green chillies.', 1450, 1450, 2650, 'Half / Full', 'Chef Special', false, 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=600&q=80'),
('Lemon Chilli Mutton Karahi', 'لیمن چلی مٹن کڑاہی', 'karahi', 'Premium mutton wok cooked in high flame with refreshing citrus lemon reduction and crushed pepper.', 2250, 2250, 3650, 'Half / Full', 'Mutton Deluxe', false, 'https://images.unsplash.com/photo-1545247181-516773cae7be?auto=format&fit=crop&w=600&q=80'),

-- CHINESE
('Dry Chilli Chicken / Beef', 'ڈرائے چلی چکن / بیف', 'chinese', 'Crispy strips tossed with bell peppers, green chillies & dark soya sauce. Served with Egg Fried or Garlic Rice.', 950, NULL, NULL, 'Served with Rice', 'Popular', true, 'https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=600&q=80'),
('Cashew Nut Chicken', 'کاجو چکن', 'chinese', 'Stir-fried chicken with crunchy roasted cashews, mushrooms and seasonal veggies. Served with Rice.', 1350, NULL, NULL, 'Served with Rice', 'Deluxe', true, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'),
('Chicken Manchurian', 'چکن منچورین', 'chinese', 'Succulent chicken balls glazed in classic sweet and spicy tomato-garlic gravy. Served with Fried Rice.', 950, NULL, NULL, 'Served with Rice', 'Classic', false, 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=600&q=80'),
('Chicken Shashlik', 'چکن شاشلک', 'chinese', 'Chicken cubes skewered with capsicum and onion cooked in red sauce. Served with Fried Rice.', 950, NULL, NULL, 'Served with Rice', 'Favorite', false, 'https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=600&q=80'),

-- BURGERS HUB
('Chicken Tickle Pickle Burger', 'ٹکل پکل چکن برگر', 'burgers', 'Juicy seasoned chicken patty, crispy iceberg, melted cheese slice, cucumber, pickled gherkins, fresh tomato & golden fries.', 545, NULL, NULL, 'Includes Fries', 'House Burger', true, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80');

-- END OF SCHEMA
