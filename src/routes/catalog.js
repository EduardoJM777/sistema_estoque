const express = require('express');
const db = require('../db');

const router = express.Router();


router.get('/categories', (req, res) => {
    res.json(db.prepare('SELECT * FROM categories ORDER BY name').all());
});

router.post('/categories', (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Nome é obrigatório' });
    const result = db.prepare('INSERT INTO categories (name) VALUES (?)').run(name);
    res.status(201).json({ id: result.lastInsertRowid, name });
});


router.get('/suppliers', (req, res) => {
    res.json(db.prepare('SELECT * FROM suppliers ORDER BY name').all());
});

router.post('/suppliers', (req, res) => {
    const { name, phone, email } = req.body;
    if (!name) return res.status(400).json({ error: 'Nome é obrigatório' });
    const result = db.prepare(
        'INSERT INTO suppliers (name, phone, email) VALUES (?, ?, ?)'
    ).run(name, phone || null, email || null);
    res.status(201).json({ id: result.lastInsertRowid, name, phone, email });
});

module.exports = router;