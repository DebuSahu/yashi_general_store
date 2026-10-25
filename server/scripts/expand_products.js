import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, '..', 'data.json');
const CLIENT_DB_PATH = path.join(__dirname, '..', '..', 'client', 'src', 'defaultData.json');

const newProducts = [
  // --- DAIRY PRODUCTS ---
  {
    id: "dairy-amul-7",
    name: "Amul Kool Kesar Badam Flavoured Milk",
    brand: "Amul",
    category: "dairy",
    price: 35,
    unit: "180 ml can",
    stock: 55,
    inStock: true,
    image: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=600&auto=format&fit=crop&q=80",
    description: "Delicious sterilized flavoured milk enriched with natural saffron (kesar) and almonds (badam). Best served chilled."
  },
  {
    id: "dairy-amul-8",
    name: "Amul Mithai Mate Sweetened Condensed Milk",
    brand: "Amul",
    category: "dairy",
    price: 130,
    unit: "400g tin",
    stock: 35,
    inStock: true,
    image: "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=600&auto=format&fit=crop&q=80",
    description: "Rich, creamy sweetened condensed milk ideal for making traditional homemade Indian sweets, kheer, cakes, and desserts."
  },
  {
    id: "dairy-ni-5",
    name: "Namaste India Thick Fresh Cow Milk",
    brand: "Namaste India",
    category: "dairy",
    price: 32,
    unit: "500 ml pouch",
    stock: 65,
    inStock: true,
    image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=600&auto=format&fit=crop&q=80",
    description: "100% pure, natural cow milk packed with natural calcium, proteins, and vitamins. Delivered fresh every morning."
  },
  {
    id: "dairy-ni-6",
    name: "Namaste India Masala Buttermilk Chaach",
    brand: "Namaste India",
    category: "dairy",
    price: 15,
    unit: "250 ml pack",
    stock: 80,
    inStock: true,
    image: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=600&auto=format&fit=crop&q=80",
    description: "Refreshing digestive spiced buttermilk spiced with roasted cumin (jeera), fresh mint, and Himalayan black salt."
  },

  // --- ICE CREAM ---
  {
    id: "icecream-amul-7",
    name: "Amul Frostik Rich Dark Chocobar",
    brand: "Amul",
    category: "icecream",
    price: 35,
    unit: "70 ml bar",
    stock: 45,
    inStock: true,
    image: "https://images.unsplash.com/photo-1505394033641-40c6ad1178d7?w=600&auto=format&fit=crop&q=80",
    description: "Velvety smooth vanilla cream ice cream dipped in a thick, crunchy coating of rich dark chocolate."
  },
  {
    id: "icecream-amul-8",
    name: "Amul Epic Belgian Chocolate Feast Bar",
    brand: "Amul",
    category: "icecream",
    price: 50,
    unit: "90 ml bar",
    stock: 30,
    inStock: true,
    image: "https://images.unsplash.com/photo-1582716401301-b2407dc7563d?w=600&auto=format&fit=crop&q=80",
    description: "Decadent Belgian chocolate ice cream coated with crispy wafer crunch and roasted California almond nuts."
  },
  {
    id: "icecream-kw-2",
    name: "Kwality Wall's Feast Chocolate Crunch Bar",
    brand: "Kwality Wall's",
    category: "icecream",
    price: 45,
    unit: "75 ml bar",
    stock: 35,
    inStock: true,
    image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&auto=format&fit=crop&q=80",
    description: "Solid chocolate core encased in smooth chocolate cream ice cream and coated with crispy biscuit crunchies."
  },
  {
    id: "icecream-ni-2",
    name: "Namaste India Alphonso Mango Dolly Stick",
    brand: "Namaste India",
    category: "icecream",
    price: 25,
    unit: "60 ml stick",
    stock: 50,
    inStock: true,
    image: "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=600&auto=format&fit=crop&q=80",
    description: "Natural fruit ice candy stick made from sun-ripened Alphonso mango pulp for a burst of tropical refreshment."
  },

  // --- VEGETABLES ---
  {
    id: "veg-8",
    name: "Fresh Green Peas / Hari Matar",
    brand: "Farm Fresh",
    category: "vegetables",
    price: 45,
    unit: "500g pack",
    stock: 40,
    inStock: true,
    image: "https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=600&auto=format&fit=crop&q=80",
    description: "Sweet, juicy, and tender whole green peas freshly picked from local farms. Perfect for matar paneer and aloo matar."
  },
  {
    id: "veg-9",
    name: "Fresh Green Capsicum / Shimla Mirch",
    brand: "Farm Fresh",
    category: "vegetables",
    price: 35,
    unit: "500g",
    stock: 35,
    inStock: true,
    image: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=600&auto=format&fit=crop&q=80",
    description: "Crunchy, glossy bell peppers / green capsicum, ideal for kadai paneer, pizzas, noodles, and vegetable stir fry."
  },
  {
    id: "veg-10",
    name: "Fresh Indian Ginger / Desi Adrak",
    brand: "Farm Fresh",
    category: "vegetables",
    price: 30,
    unit: "250g",
    stock: 50,
    inStock: true,
    image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&auto=format&fit=crop&q=80",
    description: "Intensely aromatic and spicy fresh Indian ginger root, essential for daily masala chai, curries, and immunity teas."
  },
  {
    id: "veg-11",
    name: "Fresh Desi Garlic Bulbs / Lehsun",
    brand: "Farm Fresh",
    category: "vegetables",
    price: 45,
    unit: "250g",
    stock: 45,
    inStock: true,
    image: "https://images.unsplash.com/photo-1588615419957-4629d6f6e522?w=600&auto=format&fit=crop&q=80",
    description: "Firm, pungent desi garlic with tight papery skins. Adds deep flavour to dals, curries, and garlic tadka."
  },
  {
    id: "veg-12",
    name: "Fresh Lady Finger / Tender Bhindi",
    brand: "Farm Fresh",
    category: "vegetables",
    price: 32,
    unit: "500g",
    stock: 40,
    inStock: true,
    image: "https://images.unsplash.com/photo-1425543103986-22abb7d7e8d2?w=600&auto=format&fit=crop&q=80",
    description: "Bright green, crisp and tender okra / bhindi, free of blemishes and stringiness. Best for crispy bhindi fry."
  },
  {
    id: "veg-13",
    name: "Fresh Crisp Cucumber / Desi Kheera",
    brand: "Farm Fresh",
    category: "vegetables",
    price: 30,
    unit: "1 kg",
    stock: 50,
    inStock: true,
    image: "https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=600&auto=format&fit=crop&q=80",
    description: "Cooling, crunchy and refreshing farm fresh cucumbers, great for everyday salads, sandwiches, and raita."
  },

  // --- GROCERY & PANTRY ---
  {
    id: "groc-8",
    name: "Fortune Kachi Ghani Pure Mustard Oil",
    brand: "Fortune",
    category: "grocery",
    price: 155,
    unit: "1 Litre bottle",
    stock: 45,
    inStock: true,
    image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop&q=80",
    description: "Cold-pressed traditional mustard oil with authentic strong pungency, ideal for pickling and North Indian curries."
  },
  {
    id: "groc-9",
    name: "Tata Sampann Unpolished Chana Dal",
    brand: "Tata Sampann",
    category: "grocery",
    price: 110,
    unit: "1 kg pack",
    stock: 40,
    inStock: true,
    image: "https://images.unsplash.com/photo-1585994192701-f1a505c817ea?w=600&auto=format&fit=crop&q=80",
    description: "100% unpolished split Bengal gram lentils retaining their natural protein, dietary fiber, and authentic nutty taste."
  },
  {
    id: "groc-10",
    name: "Tata Sampann Moong Dal Dhuli (Yellow)",
    brand: "Tata Sampann",
    category: "grocery",
    price: 145,
    unit: "1 kg pack",
    stock: 35,
    inStock: true,
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80",
    description: "Yellow split moong dal, easy on the stomach, highly nutritious, and unpolished for superior health."
  },
  {
    id: "groc-11",
    name: "MDH Deggi Mirch Natural Red Chilli Powder",
    brand: "MDH",
    category: "grocery",
    price: 95,
    unit: "100g pack",
    stock: 60,
    inStock: true,
    image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80",
    description: "Unique blend of special red chillies that gives dishes a glowing natural red colour with gentle, flavorful warmth."
  },
  {
    id: "groc-12",
    name: "Everest Pure Turmeric / Haldi Powder",
    brand: "Everest",
    category: "grocery",
    price: 42,
    unit: "100g pack",
    stock: 65,
    inStock: true,
    image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&auto=format&fit=crop&q=80",
    description: "Finely ground high-curcumin turmeric powder with deep golden hue and natural healing antiseptic properties."
  },
  {
    id: "groc-13",
    name: "Tata Tea Gold Kadak Chai",
    brand: "Tata Tea",
    category: "grocery",
    price: 150,
    unit: "500g pack",
    stock: 50,
    inStock: true,
    image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80",
    description: "Master blend of rich Assam CTC teas with 15% gently rolled long leaves for an unbeatable aroma and kadak strength."
  },
  {
    id: "groc-14",
    name: "Nestle Maggi 2-Minute Masala Noodles",
    brand: "Nestle Maggi",
    category: "grocery",
    price: 56,
    unit: "Pack of 4 (280g)",
    stock: 75,
    inStock: true,
    image: "https://images.unsplash.com/photo-1612927601601-6638404737ce?w=600&auto=format&fit=crop&q=80",
    description: "India's beloved 2-minute instant noodles cooked with the signature tastemaker masala blend of 10 roasted spices."
  },
  {
    id: "groc-15",
    name: "Cadbury Dairy Milk Silk Chocolate Bar",
    brand: "Cadbury",
    category: "grocery",
    price: 85,
    unit: "60g bar",
    stock: 45,
    inStock: true,
    image: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=600&auto=format&fit=crop&q=80",
    description: "Premium smooth milk chocolate with a decadent, creamy melt-in-mouth texture."
  },

  // --- STATIONERY ---
  {
    id: "stat-7",
    name: "Cello Gripper Smooth Ballpoint Pens",
    brand: "Cello",
    category: "stationery",
    price: 50,
    unit: "Pack of 5 (Blue)",
    stock: 60,
    inStock: true,
    image: "https://images.unsplash.com/photo-1585336261026-77cc7 balance?w=600&auto=format&fit=crop&q=80",
    description: "Reliable ballpoint pens featuring a soft elastic comfort grip and low-viscosity ink for fatigue-free exam writing."
  },
  {
    id: "stat-8",
    name: "Camlin Kokuyo Oil Pastels Colour Kit",
    brand: "Camlin",
    category: "stationery",
    price: 65,
    unit: "Pack of 15 Shades",
    stock: 35,
    inStock: true,
    image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&auto=format&fit=crop&q=80",
    description: "Rich, vivid inter-mixable oil pastels providing brilliant colour blending for young artists and students."
  },
  {
    id: "stat-9",
    name: "Pidilite Fevicol MR Squeeze Craft Glue",
    brand: "Pidilite",
    category: "stationery",
    price: 25,
    unit: "100g bottle",
    stock: 50,
    inStock: true,
    image: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600&auto=format&fit=crop&q=80",
    description: "Clean non-staining white adhesive with precision dispenser nozzle for paper crafts, school charts, and cardboard."
  },
  {
    id: "stat-10",
    name: "Solo Clear Document Folder File (A4)",
    brand: "Solo",
    category: "stationery",
    price: 40,
    unit: "Pack of 3",
    stock: 45,
    inStock: true,
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
    description: "Transparent waterproof polypropylene folders with push-button closure for organizing certificates and bills."
  },

  // --- GENERAL STORE & HOUSEHOLD ---
  {
    id: "gen-5",
    name: "Surf Excel Easy Wash Detergent Powder",
    brand: "Surf Excel",
    category: "general store",
    price: 135,
    unit: "1 kg pack",
    stock: 40,
    inStock: true,
    image: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=600&auto=format&fit=crop&q=80",
    description: "Advanced super-fine detergent powder engineered to dissolve quickly and lift tough collar stains effortlessly."
  },
  {
    id: "gen-6",
    name: "Vim Lemon Dishwash Bar Combo",
    brand: "Vim",
    category: "general store",
    price: 35,
    unit: "Pack of 3 bars (300g)",
    stock: 65,
    inStock: true,
    image: "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=600&auto=format&fit=crop&q=80",
    description: "Powerful concentrated lemon extract formula that removes greasy oils and burnt stains from cookware."
  },
  {
    id: "gen-7",
    name: "Dettol Original Germ Protection Soap",
    brand: "Dettol",
    category: "general store",
    price: 155,
    unit: "Pack of 4 bars (125g each)",
    stock: 50,
    inStock: true,
    image: "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=600&auto=format&fit=crop&q=80",
    description: "Trusted 99.9% antibacterial protection soap with nourishing moisturizers and iconic fresh pine fragrance."
  },
  {
    id: "gen-8",
    name: "Clinic Plus Strong & Long Health Shampoo",
    brand: "Clinic Plus",
    category: "general store",
    price: 120,
    unit: "340 ml bottle",
    stock: 35,
    inStock: true,
    image: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=600&auto=format&fit=crop&q=80",
    description: "Infused with milk protein formula to strengthen hair fiber and stimulate healthy hair growth."
  },
  {
    id: "gen-9",
    name: "Harpic Power Plus 10X Toilet Cleaner",
    brand: "Harpic",
    category: "general store",
    price: 115,
    unit: "1 Litre bottle",
    stock: 30,
    inStock: true,
    image: "https://images.unsplash.com/photo-1584813470613-5b1c1cad3d69?w=600&auto=format&fit=crop&q=80",
    description: "Thick disinfectant liquid that clings to bowl surfaces, removes yellow calcification, and kills 99.9% germs."
  },
  {
    id: "gen-10",
    name: "Good Knight Gold Flash Liquid Mosquito Refill",
    brand: "Good Knight",
    category: "general store",
    price: 140,
    unit: "Twin Pack (45 ml x 2)",
    stock: 40,
    inStock: true,
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80",
    description: "Dual-mode mosquito vaporiser refill providing non-stop protection against disease-causing mosquitoes."
  }
];

// Read existing DB
const dbRaw = fs.readFileSync(DB_PATH, 'utf-8');
const db = JSON.parse(dbRaw);

// Merge new products without duplicating by ID
const existingIds = new Set(db.products.map(p => p.id));
let addedCount = 0;

for (const prod of newProducts) {
  if (!existingIds.has(prod.id)) {
    db.products.push(prod);
    existingIds.add(prod.id);
    addedCount++;
  }
}

fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');

// Update client defaultData.json as well
const clientData = JSON.parse(JSON.stringify(db));
// Ensure password hash is not present in client defaultData
if (clientData.settings) {
  delete clientData.settings.adminPasswordHash;
  delete clientData.settings.adminUsername;
}
if (clientData.admins) {
  clientData.admins = clientData.admins.map(a => ({
    id: a.id,
    username: a.username,
    name: a.name,
    role: a.role,
    createdAt: a.createdAt
  }));
}
fs.writeFileSync(CLIENT_DB_PATH, JSON.stringify(clientData, null, 2), 'utf-8');

console.log(`Successfully added ${addedCount} new products! Total catalog now: ${db.products.length} products.`);

