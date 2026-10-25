import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SERVER_DATA_PATH = path.join(__dirname, '..', 'data.json');
const CLIENT_DEFAULT_DATA_PATH = path.join(__dirname, '..', '..', 'client', 'src', 'defaultData.json');

const serverData = JSON.parse(fs.readFileSync(SERVER_DATA_PATH, 'utf-8'));

// Exact AI product image mapping for all 73 products
const imageMap = {
  // Dairy (15)
  'dairy-amul-1': './images/products/amul_taaza.jpg',
  'dairy-amul-2': './images/products/amul_gold.jpg',
  'dairy-amul-3': './images/products/amul_butter.jpg',
  'dairy-amul-4': './images/products/amul_paneer.jpg',
  'dairy-amul-5': './images/products/amul_dahi.jpg',
  'dairy-amul-6': './images/products/desi_ghee.jpg',
  'dairy-amul-7': './images/products/amul_cheese.jpg',
  'dairy-namaste-1': './images/products/amul_taaza.jpg',
  'dairy-namaste-2': './images/products/amul_paneer.jpg',
  'dairy-namaste-3': './images/products/amul_dahi.jpg',
  'dairy-namaste-4': './images/products/desi_ghee.jpg',
  'dairy-namaste-5': './images/products/namaste_chaach.jpg',
  'dairy-amul-8': './images/products/amul_cheese.jpg',
  'dairy-ni-5': './images/products/amul_gold.jpg',
  'dairy-ni-6': './images/products/namaste_chaach.jpg',

  // Ice Cream (10)
  'ice-1': './images/products/ice_cassata.jpg',
  'ice-2': './images/products/ice_chocobar.jpg',
  'ice-3': './images/products/ice_kulfi.jpg',
  'ice-4': './images/products/ice_tub.jpg',
  'ice-5': './images/products/ice_cone.jpg',
  'ice-6': './images/products/ice_cassata.jpg',
  'icecream-amul-7': './images/products/ice_chocobar.jpg',
  'icecream-amul-8': './images/products/ice_chocobar.jpg',
  'icecream-kw-2': './images/products/ice_chocobar.jpg',
  'icecream-ni-2': './images/products/ice_kulfi.jpg',

  // Vegetables (13)
  'veg-1': './images/products/fresh_tomatoes.jpg',
  'veg-2': './images/products/fresh_potatoes.jpg',
  'veg-3': './images/products/fresh_onions.jpg',
  'veg-4': './images/products/fresh_spinach.jpg',
  'veg-5': './images/products/fresh_cauliflower.jpg',
  'veg-6': './images/products/fresh_chillies.jpg',
  'veg-7': './images/products/fresh_carrots.jpg',
  'veg-8': './images/products/fresh_spinach.jpg',
  'veg-9': './images/products/fresh_chillies.jpg',
  'veg-10': './images/products/fresh_potatoes.jpg',
  'veg-11': './images/products/fresh_onions.jpg',
  'veg-12': './images/products/fresh_chillies.jpg',
  'veg-13': './images/products/fresh_carrots.jpg',

  // Grocery (15)
  'groc-1': './images/products/chakki_atta.jpg',
  'groc-2': './images/products/basmati_rice.jpg',
  'groc-3': './images/products/toor_dal.jpg',
  'groc-4': './images/products/cooking_oil.jpg',
  'groc-5': './images/products/kadak_chai.jpg',
  'groc-6': './images/products/sugar_salt.jpg',
  'groc-7': './images/products/sugar_salt.jpg',
  'groc-8': './images/products/cooking_oil.jpg',
  'groc-9': './images/products/toor_dal.jpg',
  'groc-10': './images/products/moong_dal.jpg',
  'groc-11': './images/products/indian_spices.jpg',
  'groc-12': './images/products/indian_spices.jpg',
  'groc-13': './images/products/kadak_chai.jpg',
  'groc-14': './images/products/indian_spices.jpg',
  'groc-15': './images/products/ice_chocobar.jpg',

  // Stationery (10)
  'stat-1': './images/products/classmate_notebooks.jpg',
  'stat-2': './images/products/ballpoint_pens.jpg',
  'stat-3': './images/products/pencils_highlighters.jpg',
  'stat-4': './images/products/geometry_box.jpg',
  'stat-5': './images/products/pencils_highlighters.jpg',
  'stat-6': './images/products/sticky_notes.jpg',
  'stat-7': './images/products/ballpoint_pens.jpg',
  'stat-8': './images/products/art_colours.jpg',
  'stat-9': './images/products/sticky_notes.jpg',
  'stat-10': './images/products/classmate_notebooks.jpg',

  // General Store (10)
  'gen-1': './images/products/surf_excel.jpg',
  'gen-2': './images/products/herbal_toothpaste.jpg',
  'gen-3': './images/products/dettol_soap.jpg',
  'gen-4': './images/products/vim_dishwash.jpg',
  'gen-5': './images/products/surf_excel.jpg',
  'gen-6': './images/products/vim_dishwash.jpg',
  'gen-7': './images/products/dettol_soap.jpg',
  'gen-8': './images/products/shampoo_bottle.jpg',
  'gen-9': './images/products/toilet_cleaner.jpg',
  'gen-10': './images/products/herbal_toothpaste.jpg'
};

let updatedCount = 0;
serverData.products = serverData.products.map(p => {
  if (imageMap[p.id]) {
    updatedCount++;
    return { ...p, image: imageMap[p.id] };
  }
  return p;
});

fs.writeFileSync(SERVER_DATA_PATH, JSON.stringify(serverData, null, 2), 'utf-8');
console.log(`Updated ${updatedCount} products in ${SERVER_DATA_PATH}`);

// Also update client defaultData.json
const clientData = JSON.parse(fs.readFileSync(CLIENT_DEFAULT_DATA_PATH, 'utf-8'));
clientData.products = serverData.products;
fs.writeFileSync(CLIENT_DEFAULT_DATA_PATH, JSON.stringify(clientData, null, 2), 'utf-8');
console.log(`Synced ${clientData.products.length} products to ${CLIENT_DEFAULT_DATA_PATH}`);

