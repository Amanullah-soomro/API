const pool = require('./db');
const bcrypt = require('bcryptjs');

const users = [
  { email: 'alice@example.com', password: 'password1' },
  { email: 'bob@example.com', password: 'password2' },
  { email: 'carol@example.com', password: 'password3' },
  { email: 'dave@example.com', password: 'password4' }
];

(async () => {
  try {
    for (const u of users) {
      const hashed = await bcrypt.hash(u.password, 10);
      const q = 'INSERT INTO users (email, password) VALUES ($1, $2) ON CONFLICT (email) DO NOTHING RETURNING id, email, created_at';
      const result = await pool.query(q, [u.email, hashed]);
      if (result.rows[0]) {
        console.log('Inserted user:', result.rows[0]);
      } else {
        console.log('User already exists:', u.email);
      }
    }
    console.log('Seeding complete.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
})();
