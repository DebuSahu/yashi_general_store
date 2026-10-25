import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, '..', 'data.json');

// Haversine formula to calculate distance between two coordinates in km
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 100) / 100; // Return rounded to 2 decimal places
}

export const initialData = {
  settings: {
    storeName: "Yashi General Store",
    acronym: "YGS",
    tagline: "Your Daily Grocery, Fresh Vegetables, Amul & Namaste India Dairy & Household Essentials",
    phone: "+91 98765 43210",
    email: "contact@yashigeneralstore.com",
    address: "510, Elliot Lane, Near Water Tank, Mirpur Cantonment, Kanpur, Uttar Pradesh - 208004",
    // Shop coordinates from Google Maps (26.4519124, 80.3537057)
    latitude: 26.4519124,
    longitude: 80.3537057,
    mapsUrl: "https://maps.app.goo.gl/36DwR1dGU2bfv7KD9",
    maxDeliveryRadiusKm: 5,
    minOrderAmount: 100,
    deliveryFee: 0, // Free delivery within 5km!
    adminUsername: "admin",
    adminPasswordHash: "$2a$10$w3.G3rO8gJ2m0yQhC.y2aOK6k0ZkO/99jIe8wRsl4W0wX2Z3A5eE2" // hashed 'admin123'
  },
  products: [
    // ==========================================
    // --- DAIRY PRODUCTS (AMUL & NAMASTE INDIA) ---
    // ==========================================
    {
      id: "dairy-amul-1",
      name: "Amul Taaza Toned Fresh Milk",
      brand: "Amul",
      category: "dairy",
      price: 27,
      unit: "500 ml pouch",
      stock: 60,
      inStock: true,
      image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop&q=80",
      description: "Pasteurized, homogenized toned fresh milk (3.0% Fat, 8.5% SNF) from Amul. Freshly delivered every morning."
    },
    {
      id: "dairy-amul-2",
      name: "Amul Gold Full Cream Fresh Milk",
      brand: "Amul",
      category: "dairy",
      price: 33,
      unit: "500 ml pouch",
      stock: 50,
      inStock: true,
      image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=600&auto=format&fit=crop&q=80",
      description: "Thick and creamy full-cream milk (6.0% Fat, 9.0% SNF) by Amul, ideal for rich tea, coffee, and homemade sweets."
    },
    {
      id: "dairy-amul-3",
      name: "Amul Pasteurized Salted Butter",
      brand: "Amul",
      category: "dairy",
      price: 58,
      unit: "100g pack",
      stock: 45,
      inStock: true,
      image: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=600&auto=format&fit=crop&q=80",
      description: "The classic iconic Amul Butter made from fresh cream. Delicious spread on toast, parathas, and snacks."
    },
    {
      id: "dairy-amul-4",
      name: "Amul Fresh Malai Paneer",
      brand: "Amul",
      category: "dairy",
      price: 92,
      unit: "200g pack",
      stock: 40,
      inStock: true,
      image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80",
      description: "Soft, uniform, high-protein fresh cottage cheese (Paneer) by Amul. Perfect for Shahi Paneer, curries, and tikka."
    },
    {
      id: "dairy-amul-5",
      name: "Amul Masti Dahi (Fresh Curd)",
      brand: "Amul",
      category: "dairy",
      price: 35,
      unit: "400g pouch",
      stock: 35,
      inStock: true,
      image: "https://images.unsplash.com/photo-1571212515416-fef01fc43637?w=600&auto=format&fit=crop&q=80",
      description: "Thick, creamy set natural curd prepared from pasteurized milk. Cooling and healthy probiotic for daily meals."
    },
    {
      id: "dairy-amul-6",
      name: "Amul Pure Desi Ghee",
      brand: "Amul",
      category: "dairy",
      price: 590,
      unit: "1 Litre carton",
      stock: 30,
      inStock: true,
      image: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=600&auto=format&fit=crop&q=80",
      description: "Aromatic pure desi ghee with rich granular texture made from pure fresh milk fat by Amul."
    },
    {
      id: "dairy-amul-7",
      name: "Amul Processed Cheese Cubes",
      brand: "Amul",
      category: "dairy",
      price: 135,
      unit: "200g pack (8 cubes)",
      stock: 40,
      inStock: true,
      image: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=600&auto=format&fit=crop&q=80",
      description: "Wholesome cheese cubes made from 100% natural milk. Great for quick sandwiches, kids tiffin, and pasta."
    },
    {
      id: "dairy-namaste-1",
      name: "Namaste India Standardized Fresh Milk",
      brand: "Namaste India",
      category: "dairy",
      price: 30,
      unit: "500 ml pouch",
      stock: 50,
      inStock: true,
      image: "https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?w=600&auto=format&fit=crop&q=80",
      description: "Pure, fresh pasteurized homogenized milk from Namaste India Dairy, fortified with essential vitamins."
    },
    {
      id: "dairy-namaste-2",
      name: "Namaste India Fresh Desi Paneer",
      brand: "Namaste India",
      category: "dairy",
      price: 88,
      unit: "200g pack",
      stock: 35,
      inStock: true,
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80",
      description: "Melt-in-mouth traditional desi paneer prepared from pure cows and buffalo milk by Namaste India."
    },
    {
      id: "dairy-namaste-3",
      name: "Namaste India Natural Dahi",
      brand: "Namaste India",
      category: "dairy",
      price: 32,
      unit: "400g pouch",
      stock: 40,
      inStock: true,
      image: "https://images.unsplash.com/photo-1577906096429-f73c2c312435?w=600&auto=format&fit=crop&q=80",
      description: "Homestyle creamy pure curd without artificial preservatives from Namaste India."
    },
    {
      id: "dairy-namaste-4",
      name: "Namaste India Pure Cow Desi Ghee",
      brand: "Namaste India",
      category: "dairy",
      price: 620,
      unit: "1 Litre jar",
      stock: 25,
      inStock: true,
      image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&auto=format&fit=crop&q=80",
      description: "Golden aromatic pure cow ghee made using traditional slow cooking methods by Namaste India."
    },
    {
      id: "dairy-namaste-5",
      name: "Namaste India Masala Chhach (Spiced Buttermilk)",
      brand: "Namaste India",
      category: "dairy",
      price: 18,
      unit: "500 ml pouch",
      stock: 55,
      inStock: true,
      image: "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=600&auto=format&fit=crop&q=80",
      description: "Refreshing digestive spiced buttermilk with jeera, black salt, and pudina from Namaste India."
    },

    // ==========================================
    // --- ICE CREAM ---
    // ==========================================
    {
      id: "ice-1",
      name: "Amul Vanilla Magic Ice Cream Cup",
      brand: "Amul",
      category: "icecream",
      price: 20,
      unit: "100 ml cup",
      stock: 45,
      inStock: true,
      image: "https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=600&auto=format&fit=crop&q=80",
      description: "Creamy classic rich vanilla ice cream made from pure fresh cream and real milk."
    },
    {
      id: "ice-2",
      name: "Amul Choco Crunch Ice Cream Bar",
      brand: "Amul",
      category: "icecream",
      price: 30,
      unit: "70 ml bar",
      stock: 50,
      inStock: true,
      image: "https://images.unsplash.com/photo-1505394033641-40c6ad1178d7?w=600&auto=format&fit=crop&q=80",
      description: "Crunchy chocolate outer shell covering rich velvety chocolate cream bar."
    },
    {
      id: "ice-3",
      name: "Amul Shahi Kulfi (Alphonso Mango & Rabdi)",
      brand: "Amul",
      category: "icecream",
      price: 30,
      unit: "60 ml stick",
      stock: 40,
      inStock: true,
      image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&auto=format&fit=crop&q=80",
      description: "Traditional Indian stick kulfi loaded with real alphonso mango pulp and cardamom rabdi."
    },
    {
      id: "ice-4",
      name: "Amul Real Butterscotch Ice Cream Tub",
      brand: "Amul",
      category: "icecream",
      price: 160,
      unit: "700 ml tub",
      stock: 30,
      inStock: true,
      image: "https://images.unsplash.com/photo-1560008581-09826d1de69e?w=600&auto=format&fit=crop&q=80",
      description: "Golden crunch praline cashew bits embedded in rich butterscotch cream."
    },
    {
      id: "ice-5",
      name: "Amul Tri-Cone Chocolate & Vanilla Cone",
      brand: "Amul",
      category: "icecream",
      price: 45,
      unit: "120 ml cone",
      stock: 35,
      inStock: true,
      image: "https://images.unsplash.com/photo-1549395156-e0c1fe6fc7a5?w=600&auto=format&fit=crop&q=80",
      description: "Crispy wafer cone filled with dual vanilla chocolate cream topped with roasted nuts and chocolate disk."
    },
    {
      id: "ice-6",
      name: "Kwality Wall's Cassata Slice Ice Cream",
      brand: "Kwality Walls",
      category: "icecream",
      price: 65,
      unit: "150 ml slice",
      stock: 25,
      inStock: true,
      image: "https://images.unsplash.com/photo-1587314168485-3236d6710814?w=600&auto=format&fit=crop&q=80",
      description: "Classic multi-layered rainbow sponge cake slice with strawberry, pistachio, and vanilla ice cream."
    },

    // ==========================================
    // --- FRESH VEGETABLES ---
    // ==========================================
    {
      id: "veg-1",
      name: "Fresh Hybrid Red Tomatoes",
      category: "vegetables",
      price: 35,
      unit: "1 kg",
      stock: 45,
      inStock: true,
      image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80",
      description: "Farm-fresh ripe red juicy tomatoes, perfect for daily curries, gravies, and fresh salads."
    },
    {
      id: "veg-2",
      name: "Farm Fresh Potatoes (Desi Aloo)",
      category: "vegetables",
      price: 28,
      unit: "1 kg",
      stock: 80,
      inStock: true,
      image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop&q=80",
      description: "Premium quality firm potatoes with thin skins, ideal for frying, curries, and sabzi."
    },
    {
      id: "veg-3",
      name: "Fresh Nasik Red Onions (Pyaz)",
      category: "vegetables",
      price: 45,
      unit: "1 kg",
      stock: 60,
      inStock: true,
      image: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop&q=80",
      description: "Crisp and pungent quality red onions, an absolute essential for everyday Indian cooking."
    },
    {
      id: "veg-4",
      name: "Fresh Green Spinach (Desi Palak)",
      category: "vegetables",
      price: 25,
      unit: "1 bunch (250g)",
      stock: 30,
      inStock: true,
      image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&auto=format&fit=crop&q=80",
      description: "Tender, iron-rich fresh green leafy spinach harvested daily from local farms."
    },
    {
      id: "veg-5",
      name: "Fresh Cauliflower (Phool Gobhi)",
      category: "vegetables",
      price: 40,
      unit: "1 pc (approx 600g)",
      stock: 25,
      inStock: true,
      image: "https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=600&auto=format&fit=crop&q=80",
      description: "Clean, spotless tight white florets fresh from morning vegetable mandis."
    },
    {
      id: "veg-6",
      name: "Green Chillies & Fresh Coriander (Dhaniya-Mirchi)",
      category: "vegetables",
      price: 20,
      unit: "200g combo",
      stock: 50,
      inStock: true,
      image: "https://images.unsplash.com/photo-1525607551316-4a8e16d1f9ba?w=600&auto=format&fit=crop&q=80",
      description: "Spicy pungent green chillies paired with fragrant fresh green coriander leaves."
    },
    {
      id: "veg-7",
      name: "Sweet Orange Carrots (Gajar)",
      category: "vegetables",
      price: 45,
      unit: "1 kg",
      stock: 35,
      inStock: true,
      image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600&auto=format&fit=crop&q=80",
      description: "Sweet, crunchy and Vitamin A rich carrots, great for salads, stir fries, and halwa."
    },

    // ==========================================
    // --- DAILY GROCERY PROVISIONS ---
    // ==========================================
    {
      id: "groc-1",
      name: "Sharbati Whole Wheat Atta",
      category: "grocery",
      price: 240,
      unit: "5 kg pack",
      stock: 40,
      inStock: true,
      image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80",
      description: "100% pure whole wheat chakki-fresh atta for soft, fluffy, and nourishing rotis."
    },
    {
      id: "groc-2",
      name: "Royal Basmati Rice (Extra Long Grain)",
      category: "grocery",
      price: 185,
      unit: "1 kg pack",
      stock: 50,
      inStock: true,
      image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80",
      description: "Aged long-grain aromatic royal basmati rice that elongates beautifully upon cooking."
    },
    {
      id: "groc-3",
      name: "Desi Toor / Arhar Dal (Unpolished)",
      category: "grocery",
      price: 165,
      unit: "1 kg pack",
      stock: 45,
      inStock: true,
      image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80",
      description: "High-protein unpolished nutritious yellow pigeon peas for authentic daily dal tadka."
    },
    {
      id: "groc-4",
      name: "Refined Sunflower Cooking Oil",
      category: "grocery",
      price: 145,
      unit: "1 Litre pouch",
      stock: 60,
      inStock: true,
      image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop&q=80",
      description: "Light, healthy, and vitamin-fortified refined sunflower oil for everyday cooking."
    },
    {
      id: "groc-5",
      name: "Premium Assam CTC Tea (Kadak Chai)",
      category: "grocery",
      price: 130,
      unit: "500g pack",
      stock: 35,
      inStock: true,
      image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80",
      description: "Rich amber color and invigorating strong aroma tea leaves for authentic morning tea."
    },
    {
      id: "groc-6",
      name: "Vacuum Evaporated Iodized Salt",
      category: "grocery",
      price: 25,
      unit: "1 kg pack",
      stock: 90,
      inStock: true,
      image: "https://images.unsplash.com/photo-1518110903416-836d5fc2810a?w=600&auto=format&fit=crop&q=80",
      description: "Pure, white, free-flowing vacuum evaporated salt with essential iodine."
    },
    {
      id: "groc-7",
      name: "Refined White Sugar Crystals (Cheeni)",
      category: "grocery",
      price: 48,
      unit: "1 kg pack",
      stock: 75,
      inStock: true,
      image: "https://images.unsplash.com/photo-1581441363689-1f3c3c414635?w=600&auto=format&fit=crop&q=80",
      description: "Sparkling clean refined sugar crystals, sulfur-free and hygienic."
    },

    // ==========================================
    // --- GENERAL STORE & HOUSEHOLD ITEMS ---
    // ==========================================
    {
      id: "gen-1",
      name: "Active Detergent Washing Powder",
      category: "general store",
      price: 110,
      unit: "1 kg pack",
      stock: 40,
      inStock: true,
      image: "https://images.unsplash.com/photo-1585421514738-01798e348b17?w=600&auto=format&fit=crop&q=80",
      description: "Tough stain removal formula with fabric conditioners and fresh lavender fragrance."
    },
    {
      id: "gen-2",
      name: "Herbal Toothpaste with Neem & Clove",
      category: "general store",
      price: 75,
      unit: "150g tube",
      stock: 55,
      inStock: true,
      image: "https://images.unsplash.com/photo-1559591937-e109d949cfeb?w=600&auto=format&fit=crop&q=80",
      description: "Herbal gum protection and fresh breath with natural neem, babool, and clove oils."
    },
    {
      id: "gen-3",
      name: "Moisturizing Bathing Soap (Pack of 4)",
      category: "general store",
      price: 140,
      unit: "4 x 100g bars",
      stock: 35,
      inStock: true,
      image: "https://images.unsplash.com/photo-1607006314647-750d481b285d?w=600&auto=format&fit=crop&q=80",
      description: "Mild moisturizing soap bars enriched with natural oils for soft, glowing skin."
    },
    {
      id: "gen-4",
      name: "Dishwash Gel (Lemon Fresh Anti-Grease)",
      category: "general store",
      price: 95,
      unit: "500 ml bottle",
      stock: 50,
      inStock: true,
      image: "https://images.unsplash.com/photo-1585842378054-ee2e52f94ba2?w=600&auto=format&fit=crop&q=80",
      description: "Instant grease-cutting lemon power leaves utensils and glasses shining and clean."
    },

    // ==========================================
    // --- STATIONERY ---
    // ==========================================
    {
      id: "stat-1",
      name: "Classmate Ruled Long Notebooks (Set of 3)",
      brand: "Classmate",
      category: "stationery",
      price: 120,
      unit: "Set of 3 books",
      stock: 30,
      inStock: true,
      image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
      description: "Superior white paper notebooks with sturdy binding for school, college, and office."
    },
    {
      id: "stat-2",
      name: "Smooth Flow Ballpoint Pens (Pack of 5)",
      brand: "Reynolds",
      category: "stationery",
      price: 50,
      unit: "Pack of 5 pens",
      stock: 65,
      inStock: true,
      image: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600&auto=format&fit=crop&q=80",
      description: "Ergonomic grip and waterproof smudge-resistant blue ink for effortless handwriting."
    },
    {
      id: "stat-3",
      name: "Apsara Platinum Extra Dark Pencils Kit",
      brand: "Apsara",
      category: "stationery",
      price: 65,
      unit: "Pack of 10 + Eraser & Sharpener",
      stock: 50,
      inStock: true,
      image: "https://images.unsplash.com/photo-1585336261026-4074ee969f6e?w=600&auto=format&fit=crop&q=80",
      description: "Smooth extra-dark bonded lead pencils complete with non-dust eraser and precision sharpener."
    },
    {
      id: "stat-4",
      name: "Camlin Scholar Mathematical Geometry Box",
      brand: "Camlin",
      category: "stationery",
      price: 110,
      unit: "1 metal box",
      stock: 30,
      inStock: true,
      image: "https://images.unsplash.com/photo-1580584126903-c17d41830450?w=600&auto=format&fit=crop&q=80",
      description: "Self-centering compass, divider, protractor, set squares, and transparent scale in sturdy tin case."
    },
    {
      id: "stat-5",
      name: "Faber-Castell Textliner Pastel Highlighters",
      brand: "Faber-Castell",
      category: "stationery",
      price: 90,
      unit: "Set of 5 colors",
      stock: 40,
      inStock: true,
      image: "https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=600&auto=format&fit=crop&q=80",
      description: "Soft eye-friendly pastel colors for highlighting notes and study textbooks without bleeding."
    },
    {
      id: "stat-6",
      name: "Colorful Sticky Notes Memo Pad (3x3 inch)",
      brand: "Post-it",
      category: "stationery",
      price: 45,
      unit: "100 sheets pad",
      stock: 45,
      inStock: true,
      image: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=600&auto=format&fit=crop&q=80",
      description: "Removable repositionable self-adhesive note pad for reminders, study bookmarks, and memos."
    }
  ],
  orders: [
    {
      id: "ORD-1001",
      customerName: "Rahul Sharma",
      customerPhone: "9876543210",
      address: "Flat 302, Green Valley Apartments, Near City Park",
      latitude: 21.2580,
      longitude: 81.6320,
      distanceKm: 0.77,
      items: [
        { id: "veg-1", name: "Fresh Hybrid Red Tomatoes", price: 35, unit: "1 kg", quantity: 2 },
        { id: "dairy-amul-1", name: "Amul Taaza Toned Fresh Milk", price: 27, unit: "500 ml pouch", quantity: 2 },
        { id: "groc-1", name: "Sharbati Whole Wheat Atta", price: 240, unit: "5 kg pack", quantity: 1 }
      ],
      totalAmount: 364,
      status: "Delivered",
      createdAt: "2026-10-25T14:30:00.000Z",
      statusHistory: [
        { status: "Pending", timestamp: "2026-10-25T14:30:00.000Z" },
        { status: "Accepted", timestamp: "2026-10-25T14:35:00.000Z" },
        { status: "Out for Delivery", timestamp: "2026-10-25T14:50:00.000Z" },
        { status: "Delivered", timestamp: "2026-10-25T15:15:00.000Z" }
      ]
    }
  ],
  otps: {}
};

export function getDatabase() {
  try {
    let data;
    if (!fs.existsSync(DATA_FILE)) {
      data = initialData;
      fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    } else {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      data = JSON.parse(raw);
    }

    // Ensure admins list exists and is populated
    if (!data.admins || !Array.isArray(data.admins) || data.admins.length === 0) {
      data.admins = [
        {
          id: 'admin-primary',
          username: data.settings?.adminUsername || 'admin',
          name: 'Store Owner',
          role: 'superadmin',
          passwordHash: data.settings?.adminPasswordHash || '$2a$10$w3.G3rO8gJ2m0yQhC.y2aOK6k0ZkO/99jIe8wRsl4W0wX2Z3A5eE2',
          createdAt: new Date().toISOString()
        }
      ];
      // Clean sensitive credentials from public settings
      if (data.settings) {
        delete data.settings.adminPasswordHash;
        delete data.settings.adminUsername;
      }
      saveDatabase(data);
    }

    return data;
  } catch (err) {
    console.error("Error reading database file, using in-memory:", err);
    return initialData;
  }
}

export function saveDatabase(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error("Error saving database file:", err);
    return false;
  }
}
