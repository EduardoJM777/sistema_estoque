const express = require('express');
const db = require('../db');

const router = express.Router();


router.get('/', (req, res) => {
    const rows = db.prepare(`
        SELECT m.*, p.name AS product_name
        FROM movements m
        JOIN products p ON p.id = m.product_id
        ORDER BY m.id DESC    
    `).all();
    res.json(rows);
});

router.get('/product/:productId', (req, res) => {
    const rows = db.prepare(`
        SELECT * FROM movements WHERE product_id = ? ORDER BY id DESC    
    `).all(req.params.productId);
    res.json(rows);
});

router.post('/', (req, res) => {
    const { product_id, type, quantity, reason } = req.body;

    if (!product_id || !type || !quantity) {
        return res.status(400).json({ error: 'product_id, type e quantity são obrigatórios' });
    }
    if (!['IN', 'OUT'].includes(type)) {
        return res.status(400).json({ error: "type deve ser 'IN' ou 'OUT'"});
    }
    if (quantity <= 0) {
        return res.status(400).json({ error: 'quantity deve ser maior que zero' });
    }

    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(product_id);
    if (!product) return res.status(404).json({ error: 'Produto não encontrado' });

    if (type === 'OUT' && product.quantity < quantity) {
        return res.status(400).json({ error: 'Estoque insuficiente para essa saída' });
    }

    const stmt = db.prepare(`
        INSERT INTO movements (product_id, type, quantity, reason)
        VALUES (?, ?, ?, ?)    
    `);
    const result = stmt.run(product_id, type, quantity, reason || null);

    const movement = db.prepare('SELECT * FROM movements WHERE id = ?').get(result.lastInsertRowid);
    const updatedProduct = db.prepare('SELECT * FROM products WHERE id = ?').get(product_id);

    res.status(201).json({ movement, product: updatedProduct });
});

module.exports = router;