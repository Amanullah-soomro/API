const express = require('express');
const cors = require('cors');
const pool = require("./db");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json("Welcome");
});

app.get('/employees', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM employees');
        res.status(200).json({ data: result.rows });
    } catch (error) {
        console.error('DB query error:', error);
        res.status(500).json({ error: error.message || error });
    }
});

app.get('/employees/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM employees WHERE id = $1', [id]);

        if (!result.rows[0]) {
            return res.status(404).json({ error: 'Employee not found' });
        }
        res.status(200).json({ data: result.rows });
    } catch (error) {
        console.error('DB query error:', error);
        res.status(500).json({ error: error.message || error });
    }
});

app.get('/dpt', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM departments');
        res.status(200).json({ data: result.rows });
    } catch (error) {
        console.error('DB query error:', error);
        res.status(500).json({ error: error.message || error });
    }
});

app.get('/dpt/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM departments WHERE id = $1', [id]);

        if (!result.rows[0]) {
            return res.status(404).json({ error: 'Department not found' });
        }
        res.status(200).json({ data: result.rows });
    } catch (error) {
        console.error('DB query error:', error);
        res.status(500).json({ error: error.message || error });
    }
});


const PORT = process.env.PORT || 5000;

(async () => {
    try {
        await pool.query('SELECT 1');
        app.listen(PORT, () => {
            console.log(`Server is running on ${PORT}`);
        });
    } catch (err) {
        console.error('Failed to connect to Postgres. Ensure the database is running and environment variables are set.');
        console.error(err);
        process.exit(1);
    }
})();
