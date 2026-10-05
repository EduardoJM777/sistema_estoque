const express = require('express');
const db = require('../db');

const router = express.Router();



router.get('/', (req, res) => {
    const products = db.prepare(`
            SELECT p.*, c.name AS category_name, s.name AS supplier_name
            FROM products p
            LEFT JOIN categories c ON c.id = p.category_id
            LEFT JOIN suppliers s ON s.id = p.supplier_id
            ORDER BY p.id DESC
        `).all();
        res.json(products);
});

router.get('/low-stock', (req, res) => {
    const rows = db.prepare('SELECT * FROM low_stock_products').all();
    res.json(rows);
});

router.get('/:id', (req, res) => {
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!product) return res.status(404).json({ error: 'Produto não encontrado' });
    res.json(product);
});

router.post('/', (req, res) => {
    const { name, category_id, supplier_id, price, quantity, min_quantity } = req.body;
    if (!name) return res.status(400).json({ error: 'Nome é obrigatório' });

    const stmt = db.prepare(`
        INSERT INTO products (name, category_id, supplier_id, price, quantity, min_quantity)
        VALUES (?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
        name,
        category_id | null,
        supplier_id || null,
        price || 0,
        quantity || 0,
        min_quantity || 0
    );
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(product);
});

router.put('/:id', (req, res) => {
    const { name, category_id, supplier_id, price, min_quantity } = req.body;
    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Produto não encontrado' });

    db.prepare(`
        UPDATE products
        SET NAME = ?, category_id = ?, supplier_id = ?, price = ?, min_quantity = ?
        WHERE id = ?    
    `).run(
        name ?? existing.name,
        category_id ?? existing.category_id,
        supplier_id ?? existing.supplier_id,
        price ?? existing.price,
        min_quantity ?? existing.min_quantity,
        req.params.id
    );
    const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    res.json(updated);
});

router.delete('/:id', (req, res) => {
    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Produto não encontrado' });
    db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
    res.status(204).send();
});

module.exports = router;