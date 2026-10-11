/**
 * Lahore Shahi Qila Restaurant - Supabase Client & Data Synchronization Layer
 * Restaurant Location: Grand Trunk Rd, Singhpura Lahore, 54000, Pakistan
 * Phone / WhatsApp: 03306863355
 */

const SUPABASE_CONFIG = {
    url: 'https://hrnimbbhjccixheydcom.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhybmltYmJoamNjaXhoZXlkY29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE3MDk1MDksImV4cCI6MjEwNzI4NTUwOX0.VSufmkf5u9KB_QvhDk1yCI2tE5RXCYIkv_eWTvr_fPE',
    whatsappNumber: '923306863355',
    formattedPhone: '03306863355',
    restaurantName: 'Lahore Shahi Qila Restaurant',
    restaurantAddress: 'Grand Trunk Rd, Singhpura Lahore, 54000, Pakistan'
};

// Initialize Supabase JS Client if library is available
let supabaseClient = null;
try {
    if (window.supabase && typeof window.supabase.createClient === 'function') {
        supabaseClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
        console.log('✨ Lahore Shahi Qila: Supabase Client initialized successfully.');
    }
} catch (e) {
    console.warn('Supabase JS initialization notice:', e);
}

// Local Storage Keys for offline fallback and backup
const STORAGE_KEYS = {
    ORDERS: 'lsq_orders_db',
    MENU: 'lsq_menu_db',
    CART: 'lsq_customer_cart',
    ADMIN_SESSION: 'lsq_admin_authenticated'
};

// Default Menu items from Lahore Shahi Qila reference menu
const DEFAULT_MENU_ITEMS = [
    // STARTERS
    {
        id: 1,
        name: 'Plain Fries',
        name_urdu: 'پلین فرائز',
        category: 'starters',
        description: 'Crispy golden fried potato chips tossed with special house seasoning.',
        price: 250,
        serves: '1-2 persons',
        badge: '',
        is_featured: false,
        is_available: true,
        image_url: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=600&q=80'
    },
    {
        id: 2,
        name: 'Chicken Strips',
        name_urdu: 'چکن سٹرپس',
        category: 'starters',
        description: '4 crispy tender chicken strips served with special tandoori dipping sauce.',
        price: 480,
        serves: '4 Pcs',
        badge: 'Chef Special',
        is_featured: true,
        is_available: true,
        image_url: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=600&q=80'
    },
    {
        id: 3,
        name: 'Mexican Crispy Tacos',
        name_urdu: 'میکسیکن کرسپی ٹیکوز',
        category: 'starters',
        description: 'Crispy chicken, shredded iceberg lettuce & authentic spiced taco sauce.',
        price: 499,
        serves: '2 Pcs',
        badge: 'Popular',
        is_featured: false,
        is_available: true,
        image_url: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=600&q=80'
    },
    {
        id: 4,
        name: 'Nachos Bites',
        name_urdu: 'ناچوز بائٹس',
        category: 'starters',
        description: '8 pcs crunchy nachos loaded with chicken, melted cheese, sour cream & tangy salsa.',
        price: 480,
        serves: '8 Pcs',
        badge: 'Bestseller',
        is_featured: true,
        is_available: true,
        image_url: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=600&q=80'
    },
    {
        id: 5,
        name: 'Loaded Fries',
        name_urdu: 'لوڈڈ فرائز',
        category: 'starters',
        description: 'Crispy french fries generously layered with melted masala cheese & garlic cream sauce.',
        price: 650,
        serves: '2-3 persons',
        badge: 'Signature',
        is_featured: true,
        is_available: true,
        image_url: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=600&q=80'
    },
    {
        id: 6,
        name: 'Shahi Chicken 65',
        name_urdu: 'شاہی چکن ۶۵',
        category: 'starters',
        description: 'Spicy, deep-fried South Asian delicacy marinated in royal herbs and curry leaves.',
        price: 545,
        serves: '1-2 persons',
        badge: 'Royal Special',
        is_featured: true,
        is_available: true,
        image_url: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=600&q=80'
    },
    {
        id: 7,
        name: 'Fresh Raita',
        name_urdu: 'رائتہ',
        category: 'starters',
        description: 'Cool seasoned yogurt with roasted cumin and fresh mint.',
        price: 99,
        serves: '1 Bowl',
        badge: '',
        is_available: true,
        image_url: 'https://images.unsplash.com/photo-1594998893017-36147cbcae05?auto=format&fit=crop&w=600&q=80'
    },
    {
        id: 8,
        name: 'Fresh Salad',
        name_urdu: 'تازہ سلاد',
        category: 'starters',
        description: 'Crisp sliced garden fresh cucumbers, tomatoes, carrots and onions.',
        price: 120,
        serves: '1 Plate',
        badge: '',
        is_available: true,
        image_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80'
    },
    {
        id: 9,
        name: 'Kachumar Salad',
        name_urdu: 'کچومر سلاد',
        category: 'starters',
        description: 'Finely diced onion, tomato, green chillies tossed with lemon and chaat masala.',
        price: 150,
        serves: '1 Bowl',
        badge: '',
        is_available: true,
        image_url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80'
    },

    // SOUPS
    {
        id: 10,
        name: 'Cream of Chicken Soup',
        name_urdu: 'کریم آف چکن سوپ',
        category: 'soup',
        description: 'Rich velvety cream soup loaded with shredded chicken and fragrant herbs.',
        price: 375,
        serves: '1 Bowl',
        badge: 'Winter Special',
        is_available: true,
        image_url: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80'
    },
    {
        id: 11,
        name: 'Hot n Sour Soup',
        name_urdu: 'ہاٹ اینڈ سور سوپ',
        category: 'soup',
        description: 'Traditional spicy and tangy soup with egg drops, chicken shreds and Chinese vegetables.',
        price: 299,
        serves: '1 Bowl',
        badge: 'Classic',
        is_available: true,
        image_url: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=600&q=80'
    },
    {
        id: 12,
        name: 'Chicken Corn Soup',
        name_urdu: 'چکن کارن سوپ',
        category: 'soup',
        description: 'Classic comforting soup with sweet golden corn and shredded chicken breast.',
        price: 299,
        serves: '1 Bowl',
        badge: 'Favorite',
        is_available: true,
        image_url: 'https://images.unsplash.com/photo-1603105037880-880cd4edfb0d?auto=format&fit=crop&w=600&q=80'
    },
    {
        id: 13,
        name: 'Shahi Qila Special Soup',
        name_urdu: 'شاہی قلعہ اسپیشل سوپ',
        category: 'soup',
        description: 'Royal house soup crafted with prawns, tender chicken, mushrooms & royal secret spices.',
        price: 450,
        serves: '1 Bowl',
        badge: 'Chef Choice',
        is_featured: true,
        is_available: true,
        image_url: 'https://images.unsplash.com/photo-1607528971899-2e89e6c0ec69?auto=format&fit=crop&w=600&q=80'
    },

    // TANDOOR
    {
        id: 14,
        name: 'Cheese Naan',
        name_urdu: 'چیز نان',
        category: 'tandoor',
        description: 'Fluffy clay-oven tandoori naan stuffed with molten mozzarella & cheddar cheese.',
        price: 550,
        serves: '1 Pc',
        badge: 'Bestseller',
        is_featured: true,
        is_available: true,
        image_url: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80'
    },
    {
        id: 15,
        name: 'Sada Naan',
        name_urdu: 'سادہ نان',
        category: 'tandoor',
        description: 'Traditional freshly baked hot tandoori flatbread.',
        price: 65,
        serves: '1 Pc',
        badge: '',
        is_available: true,
        image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80'
    },
    {
        id: 16,
        name: 'Kalongi Naan',
        name_urdu: 'کلونجی نان',
        category: 'tandoor',
        description: 'Crispy tandoori naan sprinkled with aromatic black nigella seeds.',
        price: 85,
        serves: '1 Pc',
        badge: '',
        is_available: true,
        image_url: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80'
    },
    {
        id: 17,
        name: 'Garlic Naan',
        name_urdu: 'گارلک نان',
        category: 'tandoor',
        description: 'Tandoori naan infused with roasted garlic flakes and fresh cilantro butter.',
        price: 95,
        serves: '1 Pc',
        badge: 'Popular',
        is_available: true,
        image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80'
    },
    {
        id: 18,
        name: 'Chicken Cheese Naan',
        name_urdu: 'چکن چیز نان',
        category: 'tandoor',
        description: 'Stuffed with spiced minced chicken and loaded gooey cheese baked golden in clay oven.',
        price: 550,
        serves: '1 Pc',
        badge: 'Royal Must-Try',
        is_featured: true,
        is_available: true,
        image_url: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80'
    },
    {
        id: 19,
        name: 'Saada Roti',
        name_urdu: 'سادہ روٹی',
        category: 'tandoor',
        description: 'Whole wheat healthy roti baked directly on tandoor walls.',
        price: 50,
        serves: '1 Pc',
        badge: '',
        is_available: true,
        image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80'
    },
    {
        id: 20,
        name: 'Roghni Naan',
        name_urdu: 'روغنی نان',
        category: 'tandoor',
        description: 'Soft leavened royal bread brushed with desi ghee and sesame seeds.',
        price: 75,
        serves: '1 Pc',
        badge: 'Classic',
        is_available: true,
        image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80'
    },

    // BBQ PLATES
    {
        id: 21,
        name: 'Chicken Kabab',
        name_urdu: 'چکن کباب',
        category: 'bbq',
        description: '4 succulent skewers of spiced minced chicken flame grilled over charcoal.',
        price: 745,
        serves: '4 Pcs',
        badge: 'Popular',
        is_featured: true,
        is_available: true,
        image_url: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80'
    },
    {
        id: 22,
        name: 'Beef Kabab',
        name_urdu: 'بیف کباب',
        category: 'bbq',
        description: '4 skewers of tender spiced minced beef grilled to perfection over hot embers.',
        price: 845,
        serves: '4 Pcs',
        badge: 'Bestseller',
        is_featured: true,
        is_available: true,
        image_url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80'
    },
    {
        id: 23,
        name: 'Chicken Tikka Boti',
        name_urdu: 'چکن تکہ بوٹی',
        category: 'bbq',
        description: '12 juicy chunks of chicken marinated in Lahore Shahi Qila special tandoori masala.',
        price: 745,
        serves: '12 Pcs',
        badge: 'Traditional',
        is_featured: true,
        is_available: true,
        image_url: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=600&q=80'
    },
    {
        id: 24,
        name: 'Malai Boti',
        name_urdu: 'ملائی بوٹی',
        category: 'bbq',
        description: '12 melt-in-mouth chicken cubes marinated in rich fresh cream, cheese and mild spices.',
        price: 1150,
        serves: '12 Pcs',
        badge: 'Royal Favorite',
        is_featured: true,
        is_available: true,
        image_url: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80'
    },
    {
        id: 25,
        name: 'Reshmi Kabab',
        name_urdu: 'ریشمی کباب',
        category: 'bbq',
        description: '4 silken skewers of chicken mince blended with butter, cream and gentle spices.',
        price: 950,
        serves: '4 Pcs',
        badge: 'Deluxe',
        is_available: true,
        image_url: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80'
    },
    {
        id: 26,
        name: 'Boneless Tikka',
        name_urdu: 'بون لیس تکہ',
        category: 'bbq',
        description: '12 pcs succulent boneless breast fillet chargrilled over live charcoal.',
        price: 1150,
        serves: '12 Pcs',
        badge: 'Hot & Spicy',
        is_available: true,
        image_url: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=600&q=80'
    },
    {
        id: 27,
        name: 'Tikka Piece',
        name_urdu: 'تکہ پیس (لیگ/بریسٹ)',
        category: 'bbq',
        description: 'Choice of chicken leg or breast piece marinated overnight and flame roasted.',
        price: 399,
        serves: '1 Pc',
        badge: 'Street Classic',
        is_available: true,
        image_url: 'https://images.unsplash.com/photo-1527477378407-668566b55d8a?auto=format&fit=crop&w=600&q=80'
    },

    // BBQ PLATTERS
    {
        id: 28,
        name: 'B.B.Q Platter 1 (Grand Royal)',
        name_urdu: 'بی بی کیو پلیٹر ۱ (شاہی)',
        category: 'platters',
        description: 'Grand Feast: Tikka Leg/Breast 2 pcs, Chicken Kabab 2 pcs, Beef Kabab 2 pcs, Cheese Kabab 2 pcs, Achari Boti 4 pcs, Boneless Tikka 4 pcs, Malai Boti 4 pcs, Tikka Boti 4 pcs, Raita, Kachumar Salad & 6 Hot Naans.',
        price: 3850,
        serves: 'Serves 4 Persons',
        badge: 'Royal Feast',
        is_featured: true,
        is_available: true,
        image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80'
    },
    {
        id: 29,
        name: 'B.B.Q Platter 2 (Couple Supreme)',
        name_urdu: 'بی بی کیو پلیٹر ۲ (کپل اسپیشل)',
        category: 'platters',
        description: 'Couple Deluxe: Tikka Leg/Breast 1 pc, Chicken Kabab 2 pcs, Beef Kabab 2 pcs, Achari Boti 2 pcs, Boneless Tikka 4 pcs, Malai Boti 4 pcs, Raita & 3 Hot Naans.',
        price: 2050,
        serves: 'Serves 2 Persons',
        badge: 'Super Saver',
        is_featured: true,
        is_available: true,
        image_url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80'
    },

    // TRADITIONAL HANDI
    {
        id: 30,
        name: 'Lemon Chilli Chicken Handi',
        name_urdu: 'لیمن چلی چکن ہانڈی',
        category: 'handi',
        description: 'Boneless chicken cubes simmered in a zesty, fiery lemon-green chilli gravy inside a clay pot.',
        price: 1350,
        serves: '2-3 persons',
        badge: 'Signature',
        is_featured: true,
        is_available: true,
        image_url: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80'
    },
    {
        id: 31,
        name: 'Chicken Jalfrezi Handi',
        name_urdu: 'چکن جلفریزی ہانڈی',
        category: 'handi',
        description: 'Stir-fried chicken cooked with crisp bell peppers, onions, tomatoes and spicy tangy curry.',
        price: 1150,
        serves: '2-3 persons',
        badge: 'Popular',
        is_available: true,
        image_url: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80'
    },
    {
        id: 32,
        name: 'Ginger Chicken Handi',
        name_urdu: 'جنجر چکن ہانڈی',
        category: 'handi',
        description: 'Aromatic boneless chicken infused with freshly julienned ginger and slow-cooked in butter.',
        price: 1150,
        serves: '2-3 persons',
        badge: 'Classic',
        is_available: true,
        image_url: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80'
    },
    {
        id: 33,
        name: 'Rajasthani Chicken Handi',
        name_urdu: 'راجستھانی چکن ہانڈی',
        category: 'handi',
        description: 'Rich and royal mildly spiced yogurt curry preparation with royal dry fruits and spices.',
        price: 1150,
        serves: '2-3 persons',
        badge: 'Desi Royal',
        is_available: true,
        image_url: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80'
    },
    {
        id: 34,
        name: 'Peri Peri Chicken Handi',
        name_urdu: 'پیری پیری چکن ہانڈی',
        category: 'handi',
        description: 'Fiery fusion handi cooked with vibrant birds eye chilli and royal herbs.',
        price: 1150,
        serves: '2-3 persons',
        badge: 'Spicy',
        is_available: true,
        image_url: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80'
    },
    {
        id: 35,
        name: 'Shahi Signature Qeema Handi',
        name_urdu: 'شاہی سگنیچر قیمہ ہانڈی',
        category: 'handi',
        description: 'Fine minced meat sautéed in desi butter, whole spices and slow-simmered in clay handi.',
        price: 1150,
        serves: '2-3 persons',
        badge: 'House Pride',
        is_featured: true,
        is_available: true,
        image_url: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80'
    },

    // KARAHI (Supports Half / Full)
    {
        id: 36,
        name: 'Chicken Karahi',
        name_urdu: 'چکن کڑاہی',
        category: 'karahi',
        description: 'Authentic Lahore street style chicken karahi cooked in fresh tomatoes, ginger and green chillies on high flame.',
        price: 980,
        half_price: 980,
        full_price: 1650,
        has_variants: true,
        serves: 'Half (1-2) / Full (3-4)',
        badge: 'Evergreen',
        is_featured: true,
        is_available: true,
        image_url: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=600&q=80'
    },
    {
        id: 37,
        name: 'Shahi Mutton Karahi',
        name_urdu: 'شاہی مٹن کڑاہی',
        category: 'karahi',
        description: 'Tender cuts of mutton slow-cooked in traditional iron wok with fresh tomatoes, black pepper and butter.',
        price: 2250,
        half_price: 2250,
        full_price: 3450,
        has_variants: true,
        serves: 'Half (1-2) / Full (3-4)',
        badge: 'Royal Specialty',
        is_featured: true,
        is_available: true,
        image_url: 'https://images.unsplash.com/photo-1545247181-516773cae7be?auto=format&fit=crop&w=600&q=80'
    },
    {
        id: 38,
        name: 'Mutton Shinwari',
        name_urdu: 'مٹن شنواری',
        category: 'karahi',
        description: 'Khyber Shinwari style fresh mutton prepared in animal fat, salt, tomatoes and whole green chillies with zero dry spices.',
        price: 2250,
        half_price: 2250,
        full_price: 3450,
        has_variants: true,
        serves: 'Half (1-2) / Full (3-4)',
        badge: 'Authentic Shinwari',
        is_featured: true,
        is_available: true,
        image_url: 'https://images.unsplash.com/photo-1545247181-516773cae7be?auto=format&fit=crop&w=600&q=80'
    },
    {
        id: 39,
        name: 'Lemon Chilli Chicken Karahi',
        name_urdu: 'لیمن چلی چکن کڑاہی',
        category: 'karahi',
        description: 'Zesty spiced chicken wok stir-fry bursting with tangy fresh Lahore lemons and slit green chillies.',
        price: 1450,
        half_price: 1450,
        full_price: 2650,
        has_variants: true,
        serves: 'Half (1-2) / Full (3-4)',
        badge: 'Chef Special',
        is_available: true,
        image_url: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=600&q=80'
    },
    {
        id: 40,
        name: 'Lemon Chilli Mutton Karahi',
        name_urdu: 'لیمن چلی مٹن کڑاہی',
        category: 'karahi',
        description: 'Premium mutton wok cooked in high flame with refreshing citrus lemon reduction and crushed pepper.',
        price: 2250,
        half_price: 2250,
        full_price: 3650,
        has_variants: true,
        serves: 'Half (1-2) / Full (3-4)',
        badge: 'Mutton Deluxe',
        is_available: true,
        image_url: 'https://images.unsplash.com/photo-1545247181-516773cae7be?auto=format&fit=crop&w=600&q=80'
    },

    // CHINESE
    {
        id: 41,
        name: 'Dry Chilli Chicken / Beef',
        name_urdu: 'ڈرائے چلی چکن / بیف',
        category: 'chinese',
        description: 'Crispy strips tossed with bell peppers, green chillies & dark soya sauce. Served with Egg Fried or Garlic Rice.',
        price: 950,
        serves: 'Served with Rice',
        badge: 'Popular',
        is_featured: true,
        is_available: true,
        image_url: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=600&q=80'
    },
    {
        id: 42,
        name: 'Cashew Nut Chicken',
        name_urdu: 'کاجو چکن',
        category: 'chinese',
        description: 'Stir-fried chicken with crunchy roasted cashews, mushrooms and seasonal veggies. Served with Rice.',
        price: 1350,
        serves: 'Served with Rice',
        badge: 'Deluxe',
        is_featured: true,
        is_available: true,
        image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'
    },
    {
        id: 43,
        name: 'Chicken Manchurian',
        name_urdu: 'چکن منچورین',
        category: 'chinese',
        description: 'Succulent chicken balls glazed in classic sweet and spicy tomato-garlic gravy. Served with Fried Rice.',
        price: 950,
        serves: 'Served with Rice',
        badge: 'Classic',
        is_available: true,
        image_url: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=600&q=80'
    },
    {
        id: 44,
        name: 'Chicken Shashlik',
        name_urdu: 'چکن شاشلک',
        category: 'chinese',
        description: 'Chicken cubes skewered with capsicum and onion cooked in red sauce. Served with Fried Rice.',
        price: 950,
        serves: 'Served with Rice',
        badge: 'Favorite',
        is_available: true,
        image_url: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=600&q=80'
    },

    // BURGERS HUB
    {
        id: 45,
        name: 'Chicken Tickle Pickle Burger',
        name_urdu: 'ٹکل پکل چکن برگر',
        category: 'burgers',
        description: 'Juicy seasoned chicken patty, crispy iceberg, melted cheese slice, cucumber, pickled gherkins, fresh tomato & golden fries.',
        price: 545,
        serves: 'Includes Fries',
        badge: 'House Burger',
        is_featured: true,
        is_available: true,
        image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80'
    }
];

// Helper: Format Price in PKR
function formatPKR(amount) {
    if (isNaN(amount)) return 'Rs. 0';
    return 'Rs. ' + Number(amount).toLocaleString('en-PK');
}

// Data Store Layer
const LSQ_DB = {
    // Check if Supabase REST is reachable
    async testConnection() {
        try {
            if (!supabaseClient) {
                return { ok: false, message: 'Supabase client not loaded, using Local Storage mode' };
            }
            const { data, error } = await supabaseClient.from('orders').select('id').limit(1);
            if (error) {
                return { ok: false, error: error.message, code: error.code };
            }
            return { ok: true, message: 'Connected to Supabase PostgreSQL' };
        } catch (err) {
            return { ok: false, error: err.message };
        }
    },

    // Load Menu Items (Supabase -> LocalStorage fallback)
    async getMenuItems() {
        // Try Supabase first if available
        if (supabaseClient) {
            try {
                const { data, error } = await supabaseClient
                    .from('menu_items')
                    .select('*')
                    .order('id', { ascending: true });

                if (!error && data && data.length > 0) {
                    localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(data));
                    return { success: true, source: 'supabase', data };
                }
            } catch (err) {
                console.warn('Supabase menu fetch fell back to local cache:', err);
            }
        }

        // Check local storage
        const cached = localStorage.getItem(STORAGE_KEYS.MENU);
        if (cached) {
            try {
                const parsed = JSON.parse(cached);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return { success: true, source: 'localStorage', data: parsed };
                }
            } catch (e) {
                // Ignore parse error
            }
        }

        // Initialize with default menu
        localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(DEFAULT_MENU_ITEMS));
        return { success: true, source: 'default', data: DEFAULT_MENU_ITEMS };
    },

    // Save or Update a Menu Item
    async saveMenuItem(item) {
        let savedInSupabase = false;
        if (supabaseClient) {
            try {
                if (item.id && typeof item.id === 'number') {
                    const { error } = await supabaseClient
                        .from('menu_items')
                        .upsert(item);
                    if (!error) savedInSupabase = true;
                }
            } catch (e) {
                console.warn('Could not sync menu item to Supabase:', e);
            }
        }

        // Always update local cache
        const items = (await this.getMenuItems()).data;
        const index = items.findIndex(i => i.id == item.id);
        if (index >= 0) {
            items[index] = { ...items[index], ...item };
        } else {
            item.id = Date.now();
            items.push(item);
        }
        localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(items));
        return { success: true, savedInSupabase, item };
    },

    // Create an Order
    async createOrder(orderPayload) {
        // Generate memorable Lahore Shahi Qila Order Number: LSQ-XXXX
        const orderNumber = 'LSQ-' + Math.floor(1000 + Math.random() * 9000);
        const newOrder = {
            order_number: orderNumber,
            customer_name: orderPayload.customer_name,
            customer_phone: orderPayload.customer_phone,
            delivery_address: orderPayload.delivery_address || 'Takeaway Counter',
            order_type: orderPayload.order_type || 'delivery',
            payment_method: orderPayload.payment_method || 'cash',
            items: orderPayload.items || [],
            subtotal: orderPayload.subtotal || 0,
            delivery_fee: orderPayload.delivery_fee || 0,
            discount: orderPayload.discount || 0,
            total_amount: orderPayload.total_amount || 0,
            status: 'pending',
            notes: orderPayload.notes || '',
            created_at: new Date().toISOString()
        };

        let supabaseSuccess = false;
        let finalOrder = { ...newOrder, id: 'local_' + Date.now() };

        // 1. Try Supabase
        if (supabaseClient) {
            try {
                const { data, error } = await supabaseClient
                    .from('orders')
                    .insert([newOrder])
                    .select()
                    .single();

                if (!error && data) {
                    supabaseSuccess = true;
                    finalOrder = data;
                } else if (error) {
                    console.warn('Supabase order insert note:', error.message);
                }
            } catch (err) {
                console.warn('Network issue during Supabase insert:', err);
            }
        }

        // 2. Always store in LocalStorage for 100% data reliability
        const existingOrders = this.getLocalOrders();
        existingOrders.unshift(finalOrder);
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(existingOrders));

        return {
            success: true,
            order: finalOrder,
            syncedWithSupabase: supabaseSuccess
        };
    },

    // Get all orders (for Admin & Tracker)
    async getOrders() {
        if (supabaseClient) {
            try {
                const { data, error } = await supabaseClient
                    .from('orders')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (!error && Array.isArray(data)) {
                    // Update local cache
                    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(data));
                    return { success: true, source: 'supabase', data };
                }
            } catch (err) {
                console.warn('Error fetching orders from Supabase:', err);
            }
        }

        // Return local fallback
        const local = this.getLocalOrders();
        return { success: true, source: 'localStorage', data: local };
    },

    // Update order status (Pending -> Preparing -> Out for Delivery -> Delivered -> Cancelled)
    async updateOrderStatus(orderId, newStatus) {
        let supabaseSuccess = false;
        if (supabaseClient) {
            try {
                // If it's a UUID or standard ID
                const { error } = await supabaseClient
                    .from('orders')
                    .update({ status: newStatus, updated_at: new Date().toISOString() })
                    .eq('id', orderId);

                if (!error) supabaseSuccess = true;
            } catch (err) {
                console.warn('Could not update status in Supabase:', err);
            }
        }

        // Update local cache
        const orders = this.getLocalOrders();
        const target = orders.find(o => o.id === orderId || o.order_number === orderId);
        if (target) {
            target.status = newStatus;
            target.updated_at = new Date().toISOString();
            localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
        }

        return { success: true, syncedWithSupabase: supabaseSuccess };
    },

    // Helper: Get orders directly from local storage
    getLocalOrders() {
        try {
            const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            return [];
        }
    },

    // Find order by Order Number or Phone (for Customer Order Tracking)
    async trackOrder(query) {
        const cleanQuery = query.trim().toUpperCase();
        const ordersRes = await this.getOrders();
        const orders = ordersRes.data || [];

        return orders.filter(o => {
            const matchesNum = o.order_number && o.order_number.toUpperCase().includes(cleanQuery);
            const matchesPhone = o.customer_phone && o.customer_phone.replace(/\D/g, '').includes(query.replace(/\D/g, ''));
            return matchesNum || matchesPhone;
        });
    },

    // Seed default items into Supabase
    async seedSupabaseMenu() {
        if (!supabaseClient) {
            return { ok: false, error: 'Supabase client is not available.' };
        }
        try {
            const itemsToInsert = DEFAULT_MENU_ITEMS.map(item => ({
                name: item.name,
                name_urdu: item.name_urdu,
                category: item.category,
                description: item.description,
                price: item.price,
                half_price: item.half_price || null,
                full_price: item.full_price || null,
                serves: item.serves || null,
                badge: item.badge || null,
                is_featured: !!item.is_featured,
                is_available: true,
                image_url: item.image_url
            }));

            const { data, error } = await supabaseClient
                .from('menu_items')
                .insert(itemsToInsert)
                .select();

            if (error) {
                return { ok: false, error: error.message };
            }
            return { ok: true, count: data.length };
        } catch (err) {
            return { ok: false, error: err.message };
        }
    },

    // Generate WhatsApp Order Message
    generateWhatsAppUrl(order) {
        let msg = `👑 *ORDER FROM LAHORE SHAHI QILA RESTAURANT*\n`;
        msg += `-----------------------------------------\n`;
        msg += `*Order #:* ${order.order_number}\n`;
        msg += `*Customer:* ${order.customer_name}\n`;
        msg += `*Phone:* ${order.customer_phone}\n`;
        msg += `*Type:* ${order.order_type === 'delivery' ? '🚗 Home Delivery' : '🛍️ Takeaway / Pickup'}\n`;
        if (order.order_type === 'delivery') {
            msg += `*Address:* ${order.delivery_address}\n`;
        }
        msg += `*Payment:* ${order.payment_method.toUpperCase()}\n`;
        msg += `-----------------------------------------\n`;
        msg += `*ITEMS ORDERED:*\n`;
        
        order.items.forEach((item, index) => {
            const variantText = item.variant ? ` (${item.variant})` : '';
            msg += `${index + 1}. ${item.name}${variantText} x ${item.qty} = Rs. ${(item.price * item.qty).toLocaleString()}\n`;
            if (item.notes) msg += `   _Note: ${item.notes}_\n`;
        });

        msg += `-----------------------------------------\n`;
        msg += `*Subtotal:* Rs. ${Number(order.subtotal).toLocaleString()}\n`;
        if (order.delivery_fee > 0) {
            msg += `*Delivery Fee:* Rs. ${Number(order.delivery_fee).toLocaleString()}\n`;
        }
        if (order.discount > 0) {
            msg += `*Discount:* -Rs. ${Number(order.discount).toLocaleString()}\n`;
        }
        msg += `*TOTAL BILL:* Rs. ${Number(order.total_amount).toLocaleString()}\n`;
        msg += `-----------------------------------------\n`;
        if (order.notes) {
            msg += `*Special Instructions:* ${order.notes}\n`;
        }
        msg += `📍 *Restaurant:* Grand Trunk Rd, Singhpura Lahore\n`;
        msg += `📞 *Helpline:* 03306863355\n`;
        msg += `_Thank you for ordering with Lahore Shahi Qila!_`;

        const encoded = encodeURIComponent(msg);
        return `https://wa.me/${SUPABASE_CONFIG.whatsappNumber}?text=${encoded}`;
    }
};

// Export to window
window.LSQ_DB = LSQ_DB;
window.SUPABASE_CONFIG = SUPABASE_CONFIG;
window.formatPKR = formatPKR;
