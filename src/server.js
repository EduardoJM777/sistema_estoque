const express = require('express');

const productsRouter = require('./routes/products');
const movementsRouter = require('./routes/movements');
const catalogRouter = require('./routes/catalog');

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
    res.json({
        message: 'API do Sistema de Estoque',
        endpoints: [
            'GET    /products',
            'GET    /products/low-stock',
            'GET    /products/:id',
            'POST   /products',
            'PUT    /products/:id',
            'DELETE /products/:id',
            'GET    /movements',
            'GET    /movements/product/:productId',
            'POST   /movements',
            'GET    /categories',
            'POST   /categories',
            'GET    /suppliers',
            'POST   /suppliers',
        ],
    });
});

app.use('/products', productsRouter);
app.use('/movements', movementsRouter);
app.use('/', catalogRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});