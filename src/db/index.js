require('dotenv').config();
const path = require('path');
const fs = require('fs');
const { Pool, types } = require('pg');

types.setTypeParser(1700, (value) => parseFloat(value));

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function initDb() {
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await pool.query(schema);
}

module.exports = { pool, initDb };