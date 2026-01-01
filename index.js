const express = require('express');
const cors = require('cors');
const pool = require("./db");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Helper: generate JWT
const signToken = (payload) => {
    const secret = process.env.JWT_SECRET || 'dev_jwt_secret';
    return jwt.sign(payload, secret, { expiresIn: '1h' });
};

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

// --- Authentication routes ---
app.post('/signup', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

        const hashed = await bcrypt.hash(password, 10);
        const insertQuery = 'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email, created_at';
        const result = await pool.query(insertQuery, [email, hashed]);
        const user = result.rows[0];

        const token = signToken({ userId: user.id, email: user.email });
        res.status(201).json({ user: { id: user.id, email: user.email }, token });
    } catch (err) {
        console.error('Signup error:', err);
        if (err.code === '23505') { // unique_violation
            return res.status(409).json({ error: 'Email already registered' });
        }
        res.status(500).json({ error: err.message || err });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

        const q = 'SELECT id, email, password FROM users WHERE email = $1';
        const result = await pool.query(q, [email]);
        const user = result.rows[0];
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ error: 'Invalid credentials' });

        const token = signToken({ userId: user.id, email: user.email });
        res.status(200).json({ user: { id: user.id, email: user.email }, token });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: err.message || err });
    }
});

// --- Users read endpoints ---
app.get('/users', async (req, res) => {
    try {
        const q = 'SELECT id, email, created_at FROM users ORDER BY id';
        const result = await pool.query(q);
        res.status(200).json({ data: result.rows });
    } catch (err) {
        console.error('Get users error:', err);
        res.status(500).json({ error: err.message || err });
    }
});

app.get('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const q = 'SELECT id, email, created_at FROM users WHERE id = $1';
        const result = await pool.query(q, [id]);
        if (!result.rows[0]) return res.status(404).json({ error: 'User not found' });
        res.status(200).json({ data: result.rows[0] });
    } catch (err) {
        console.error('Get user error:', err);
        res.status(500).json({ error: err.message || err });
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
