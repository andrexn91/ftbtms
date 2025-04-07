const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false, // solo se stai usando Neon o hosting simili
    },
});

/*
module.exports = {
    query: (text, params) => pool.query(text, params),
};
*/
module.exports = pool;
