import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';

PouchDB.plugin(PouchDBFind);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // Middleware to enable CORS
app.use(express.json()); // Middleware to parse JSON bodies

// Initialize a new PouchDB database
const db = new PouchDB('mydatabase');

// Define initial items to seed the database
const initialItems = [
    { _id: 'item_1', type: 'item', name: 'Item 1', description: 'Description of Item 1' },
    { _id: 'item_2', type: 'item', name: 'Item 2', description: 'Description of Item 2' },
];

// Define initial cart items
const initialCartItems = [
    { _id: 'cart_1', type: 'cart', itemId: 'item_1', quantity: 1 },
];

// Function to seed initial data into the database
async function seedDatabase() {
    try {
        const info = await db.info();
        if (info.doc_count === 0) {
            for (const item of [...initialItems, ...initialCartItems]) {
                await db.put(item);
            }
            console.log('Database seeded successfully.');
        }
    } catch (err) {
        console.error('Error seeding database:', err);
    }
}

app.use(express.static(path.join(__dirname, '..', 'public')));

// CRUD Operations for 'items'
app.get('/items', async (req, res) => {
    try {
        const result = await db.find({ selector: { type: 'item' } });
        res.json(result.docs);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/items', async (req, res) => {
    const newItem = { ...req.body, type: 'item' };
    try {
        const result = await db.post(newItem);
        res.status(201).json(result);
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: 'Bad Request' });
    }
});

app.put('/items/:id', async (req, res) => {
    try {
        const item = await db.get(req.params.id);
        const result = await db.put({ ...item, ...req.body, _id: req.params.id, _rev: item._rev });
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(404).json({ error: 'Not Found' });
    }
});

app.delete('/items/:id', async (req, res) => {
    try {
        const item = await db.get(req.params.id);
        const result = await db.remove(item);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(404).json({ error: 'Not Found' });
    }
});

// CRUD Operations for 'cart'
// GET all cart items
app.post('/cart', async (req, res) => {
    console.log('Received cart item:', req.body);
    try {
      const newCartItem = {
        _id: `cart_${Date.now()}`,
        ...req.body
      };
      console.log('Saving cart item:', newCartItem);
      const result = await db.put(newCartItem);
      console.log('Save result:', result);
      res.status(201).json(result);
    } catch (err) {
      console.error('Error adding item to cart:', err);
      res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
  });

app.get('/cart', async (req, res) => {
    try {
      const result = await db.allDocs({
        include_docs: true,
        startkey: 'cart_',
        endkey: 'cart_\ufff0'
      });
      const cartItems = result.rows.map(row => row.doc);
      res.json(cartItems);
    } catch (err) {
      console.error('Error fetching cart:', err);
      res.status(500).json({error: 'Internal Server Error', details: err.message});
    }
  });
  
  // DELETE a cart item
  app.delete('/cart', async (req, res) => {
    try {
      const { id } = req.body;
      const doc = await db.get(id);
      await db.remove(doc);
      res.json({message: 'Item removed from cart'});
    } catch (err) {
      console.error('Error removing item from cart:', err);
      res.status(500).json({error: 'Internal Server Error', details: err.message});
    }
  });
  
  // Clear cart (remove all cart items)
  app.delete('/cart/cleanup', async (req, res) => {
    try {
      const result = await db.allDocs({
        include_docs: true,
        startkey: 'cart_',
        endkey: 'cart_\ufff0'
      });
      await Promise.all(result.rows.map(row => db.remove(row.doc)));
      res.json({message: 'Cart cleared successfully'});
    } catch (err) {
      console.error('Error clearing cart:', err);
      res.status(500).json({error: 'Internal Server Error', details: err.message});
    }
  });

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Call the seeding function
seedDatabase().then(() => {
    // Modified server start logic
    const server = app.listen(PORT, () => {
        console.log(`Server running on port ${server.address().port}`);
    });

    server.on('error', (e) => {
        if (e.code === 'EADDRINUSE') {
            console.log('Port is busy, trying the next one...');
            server.listen(0); // This will automatically assign an available port
        } else {
            console.error(e);
        }
    });
});