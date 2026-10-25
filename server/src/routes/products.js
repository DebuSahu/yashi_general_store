import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase, saveDatabase } from '../db.js';
import { authenticateAdmin } from './auth.js';

const router = express.Router();

// Canonical Category Normalizer
export function canonicalCategory(cat) {
  if (!cat) return '';
  const clean = cat.toLowerCase().replace(/[\s-_]+/g, '');
  if (clean === 'dairy' || clean === 'dairyproducts' || clean === 'diairy') return 'dairy';
  if (clean === 'icecream' || clean === 'icecreams' || clean === 'ice') return 'icecream';
  if (clean === 'vegetable' || clean === 'vegetables' || clean === 'veggies') return 'vegetables';
  if (clean === 'grocery' || clean === 'groceries') return 'grocery';
  if (clean === 'stationery' || clean === 'stationary' || clean === 'stationaries') return 'stationery';
  if (clean === 'generalstore' || clean === 'general') return 'general store';
  return cat.toLowerCase().trim();
}

const validCategories = ['dairy', 'icecream', 'vegetables', 'grocery', 'stationery', 'general store'];

// 1. Get all products (Public - for users and admin)
router.get('/', (req, res) => {
  const { category, search } = req.query;
  const db = getDatabase();
  let products = db.products || [];

  if (category && category !== 'all') {
    const target = canonicalCategory(category);
    products = products.filter(
      p => canonicalCategory(p.category) === target
    );
  }

  if (search) {
    const q = search.toLowerCase();
    products = products.filter(
      p =>
        p.name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
    );
  }

  return res.json({
    success: true,
    count: products.length,
    products
  });
});

// 2. Get single product by ID
router.get('/:id', (req, res) => {
  const db = getDatabase();
  const product = (db.products || []).find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  return res.json({ success: true, product });
});

// 3. Admin: Add new product
router.post('/', authenticateAdmin, (req, res) => {
  const { name, category, price, unit, stock, image, description } = req.body;

  if (!name || !category || price === undefined || !unit) {
    return res.status(400).json({ error: 'Name, category, price, and unit are required.' });
  }

  const normCategory = canonicalCategory(category);
  if (!validCategories.includes(normCategory)) {
    return res.status(400).json({
      error: `Invalid category. Must be one of: dairy, icecream, vegetables, grocery, stationery, general store`
    });
  }

  const db = getDatabase();
  const newProduct = {
    id: `prod-${uuidv4().substring(0, 8)}`,
    name: name.trim(),
    category: normCategory,
    price: Number(price),
    unit: unit.trim(),
    stock: stock !== undefined ? Number(stock) : 50,
    inStock: stock !== undefined ? Number(stock) > 0 : true,
    image: image?.trim() || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80",
    description: description?.trim() || ""
  };

  db.products = db.products || [];
  db.products.unshift(newProduct);
  saveDatabase(db);

  return res.status(201).json({
    success: true,
    message: 'Product added successfully to inventory!',
    product: newProduct
  });
});

// 4. Admin: Update product
router.put('/:id', authenticateAdmin, (req, res) => {
  const db = getDatabase();
  const index = (db.products || []).findIndex(p => p.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const existing = db.products[index];
  const { name, category, price, unit, stock, image, description, inStock } = req.body;

  const updatedProduct = {
    ...existing,
    name: name !== undefined ? name.trim() : existing.name,
    category: category !== undefined ? category.toLowerCase() : existing.category,
    price: price !== undefined ? Number(price) : existing.price,
    unit: unit !== undefined ? unit.trim() : existing.unit,
    stock: stock !== undefined ? Number(stock) : existing.stock,
    inStock: inStock !== undefined ? Boolean(inStock) : (stock !== undefined ? Number(stock) > 0 : existing.inStock),
    image: image !== undefined ? image.trim() : existing.image,
    description: description !== undefined ? description.trim() : existing.description
  };

  db.products[index] = updatedProduct;
  saveDatabase(db);

  return res.json({
    success: true,
    message: 'Product updated successfully',
    product: updatedProduct
  });
});

// 5. Admin: Delete product
router.delete('/:id', authenticateAdmin, (req, res) => {
  const db = getDatabase();
  const initialLength = (db.products || []).length;
  db.products = (db.products || []).filter(p => p.id !== req.params.id);

  if (db.products.length === initialLength) {
    return res.status(404).json({ error: 'Product not found' });
  }

  saveDatabase(db);
  return res.json({
    success: true,
    message: 'Product deleted from catalog'
  });
});

export default router;

