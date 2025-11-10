// server.js

const express = require('express');


const app = express();
const port = 3000;

// Middleware to parse JSON
app.use(express.json());

//  Logging Middleware 
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log('Body:', req.body);
  }
  next();
});

const { body, validationResult } = require('express-validator');

//  Validation Middleware 
const validateMenuItem = [
  body('name').isString().isLength({ min: 3 }).withMessage('Name must be at least 3 characters'),
  body('description').isString().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('price').isFloat({ gt: 0 }).withMessage('Price must be a number greater than 0'),
  body('category').isIn(['appetizer','entree','dessert','beverage']).withMessage('Category must be one of appetizer, entree, dessert, beverage'),
  body('ingredients').isArray({ min: 1 }).withMessage('Ingredients must be an array with at least 1 item'),
  body('available').optional().isBoolean().withMessage('Available must be boolean'),
];

// In-memory data
let menuItems = [
  { id: 1, name: "Classic Burger", description: "Beef patty with lettuce, tomato, and cheese on a sesame seed bun", price: 12.99, category: "entree", ingredients: ["beef","lettuce","tomato","cheese","bun"], available: true },
  { id: 2, name: "Chicken Caesar Salad", description: "Grilled chicken breast over romaine lettuce with parmesan and croutons", price: 11.50, category: "entree", ingredients: ["chicken","romaine lettuce","parmesan cheese","croutons","caesar dressing"], available: true },
  { id: 3, name: "Mozzarella Sticks", description: "Crispy breaded mozzarella served with marinara sauce", price: 8.99, category: "appetizer", ingredients: ["mozzarella cheese","breadcrumbs","marinara sauce"], available: true },
  { id: 4, name: "Chocolate Lava Cake", description: "Warm chocolate cake with molten center, served with vanilla ice cream", price: 7.99, category: "dessert", ingredients: ["chocolate","flour","eggs","butter","vanilla ice cream"], available: true },
  { id: 5, name: "Fresh Lemonade", description: "House-made lemonade with fresh lemons and mint", price: 3.99, category: "beverage", ingredients: ["lemons","sugar","water","mint"], available: true },
  { id: 6, name: "Fish and Chips", description: "Beer-battered cod with seasoned fries and coleslaw", price: 14.99, category: "entree", ingredients: ["cod","beer batter","potatoes","coleslaw","tartar sauce"], available: false }
];



// GET all menu items
app.get('/api/menu', (req, res) => {
  res.status(200).json(menuItems);
});

// GET menu item by ID
app.get('/api/menu/:id', (req, res) => {
  const item = menuItems.find(i => i.id === parseInt(req.params.id));
  if (!item) return res.status(404).json({ error: 'Menu item not found' });
  res.status(200).json(item);
});

// POST new menu item
app.post('/api/menu', validateMenuItem, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const newItem = {
    id: menuItems.length ?  menuItems[menuItems.length - 1].id + 1 : 1,
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    category: req.body.category,
    ingredients: req.body.ingredients,
    available: req.body.available !== undefined ? req.body.available : true
  };
  menuItems.push(newItem);
  res.status(201).json(newItem);
});

// PUT update menu item
app.put('/api/menu/:id', validateMenuItem, (req, res) => {
  const item = menuItems.find(i => i.id === parseInt(req.params.id));
  if (!item) return res.status(404).json({ error: 'Menu item not found' });

  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  item.name = req.body.name;
  item.description = req.body.description;
  item.price = req.body.price;
  item.category = req.body.category;
  item.ingredients = req.body.ingredients;
  item.available = req.body.available !== undefined ? req.body.available : item.available;

  res.status(200).json(item);
});

// DELETE menu item
app.delete('/api/menu/:id', (req, res) => {
  const index = menuItems.findIndex(i => i.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Menu item not found' });

  const deletedItem = menuItems.splice(index, 1);
  res.status(200).json(deletedItem[0]);
});

// Start server
app.listen(port, () => {
  console.log(`Restaurant API running at http://localhost:${port}`);
});

