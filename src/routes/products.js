const express = require('express');
const db = require('../db');

const router = express.Router();



router.get('/', async (req, res) => {
    const { rows } = await pool.query(`
            SELECT p.*, c.name AS category_name, s.name AS supplier_name
            FROM products p
            LEFT JOIN categories c ON c.id = p.category_id
            LEFT JOIN suppliers s ON s.id = p.supplier_id
            ORDER BY p.id DESC
        `);
        res.json(rows);
});

router.get('/low-stock', async (req, res) => {
    const { rows } = pool.query('SELECT * FROM low_stock_products');
    res.json(rows);
});

router.get('/:id', async (req, res) => {
    const { rows } = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Produto não encontrado' });
    res.json(rows[0]);
});

router.post('/', async (req, res) => {
    const { name, category_id, supplier_id, price, quantity, min_quantity } = req.body;
    if (!name) return res.status(400).json({ error: 'Nome é obrigatório' });

    const { rows } = await pool.query(
        `INSERT INTO products (name, category_id, supplier_id, price, quantity, min_quantity)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *`,
        [name, category_id || null, supplier_id || null, price || 0, quantity || 0, min_quantity || 0]
    );
    res.status(201).json(rows[0]);
});

router.put('/:id', async (req, res) => {
    const { name, category_id, supplier_id, price, min_quantity } = req.body;
    
    const { rows } = await pool.query(
        `UPDATE products
         SET name            = COALESCE($1, name), 
             category_id     = COALESCE($2, category_id), 
             supplier_id     = COALESCE($3, supplier_id), 
             price           = COALESCE($4, price), 
             min_quantity    = COALESCE($5, min_quantity)
         WHERE id = $6
         RETURNING *`,
         [name, category_id, supplier_id, price, min_quantity, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Produto não encontrado' });
    res.json(rows[0]);
});

router.delete('/:id', async (req, res) => {
    const result = await pool.query('DELETE FROM products WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Produto não encontrado' });
    res.status(204).send();
});

module.exports = router;