const express = require('express');
const { pool } = require('../db');

const router = express.Router();


router.get('/categories', async (req, res) => {
    const { rows } = await pool.query('SELECT * FROM categories ORDER BY name');
    res.json(rows);
});

router.post('/categories', async (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Nome é obrigatório' });
    const { rows } = await pool.query(
        'INSERT INTO categories (name) VALUES ($1) RETURNING *',
        [name]
    );
    res.status(201).json(rows[0]);
});


router.get('/suppliers', async (req, res) => {
    const { rows } = await pool.query('SELECT * FROM suppliers ORDER BY name');
    res.json(rows);
});

router.post('/suppliers', async (req, res) => {
    const { name, phone, email } = req.body;
    if (!name) return res.status(400).json({ error: 'Nome é obrigatório' });
    const { rows } = await pool.query(
        'INSERT INTO suppliers (name, phone, email) VALUES ($1, $2, $3) RETURNING *',
        [name, phone || null, email || null]
    );
    res.status(201).json(rows[0]);
});

module.exports = router;