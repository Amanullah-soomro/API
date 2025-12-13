const { Pool } = require("pg");
require("dotenv").config();

const { DATABASE_URL, PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE, NODE_ENV } = process.env;

let poolConfig;
if (DATABASE_URL) {
    poolConfig = {
        connectionString: DATABASE_URL,
        ssl: NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    };
} else if (PGHOST || PGUSER || PGPASSWORD || PGDATABASE) {
    poolConfig = {
        host: PGHOST || 'localhost',
        port: PGPORT ? parseInt(PGPORT, 10) : 5432,
        user: PGUSER,
        password: PGPASSWORD,
        database: PGDATABASE
    };
} else {
    throw new Error('No Postgres configuration found. Set DATABASE_URL or PGHOST/PGUSER/PGPASSWORD/PGDATABASE environment variables.');
}

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
});

module.exports = pool;