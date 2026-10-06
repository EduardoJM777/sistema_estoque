const express = require('express');
const { pool } = require('../db');

const router = express.Router();


router.get('/', async (req, res) => {
    const { rows } = await pool.query(`
        SELECT m.*, p.name AS product_name
        FROM movements m
        JOIN products p ON p.id = m.product_id
        ORDER BY m.id DESC    
    `);
    res.json(rows);
});

router.get('/product/:productId', async (req, res) => {
    const { rows } = await pool.query(
        'SELECT * FROM movements WHERE product_id = $1 ORDER BY id DESC',
        [req.params.productId]
    );
    res.json(rows);
});

router.post('/', async (req, res) => {
    const { product_id, type, quantity, reason } = req.body;

    if (!product_id || !type || !quantity) {
        return res.status(400).json({ error: 'product_id, type e quantity são obrigatórios' });
    }
    if (!['IN', 'OUT'].includes(type)) {
        return res.status(400).json({ error: "type deve ser 'IN' ou 'OUT'"});
    }
    if (!Number.isInteger(quantity) || quantity <= 0) {
        return res.status(400).json({ error: 'quantity deve ser um inteiro maior que zero' });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const { rows: found } = await client.query(
            'SELECT * FROM products WHERE id = $1 FOR UPDATE',
            [product_id]
        );
        if (found.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Produto não encontrado' });
        }

        if (type === 'OUT' && found[0].quantity < quantity) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'Estoque insuficiente para essa saída' });
        }

        const { rows: inserted } = await client.query(
            `INSERT INTO movements (product_id, type, quantity, reason)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
             [product_id, type, quantity, reason || null]
        );

        const { rows: updated } = await client.query('SELECT * FROM products WHERE id = $1', [product_id]);

        await client.query('COMMIT');
        res.status(201).json({ movement: inserted[0], product: updated[0] });
    }catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }

});

module.exports = router;