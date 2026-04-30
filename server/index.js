require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

// Neon PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Initialize database tables
async function initDB() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        instansi VARCHAR(100),
        role VARCHAR(50) DEFAULT 'user',
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS inventory (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        stock INTEGER DEFAULT 0,
        status VARCHAR(50),
        type VARCHAR(20) DEFAULT 'asset'
      );
      
      CREATE TABLE IF NOT EXISTS borrowings (
        id SERIAL PRIMARY KEY,
        borrower VARCHAR(255),
        borrower_id VARCHAR(50),
        item VARCHAR(255),
        item_id VARCHAR(50),
        borrow_date VARCHAR(50),
        due_date VARCHAR(50),
        status VARCHAR(50)
      );
      
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        type VARCHAR(20),
        item VARCHAR(255),
        date VARCHAR(50),
        user_name VARCHAR(100),
        category VARCHAR(50)
      );
    `);
    console.log('Database initialized successfully');
    // Seed initial data if tables are empty
    const invCheck = await client.query('SELECT COUNT(*) FROM inventory');
    if (parseInt(invCheck.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO inventory (id, name, category, stock, status, type) VALUES
        ('ELC-2023-0041', 'Laptop Chromebook v2', 'Elektronik', 45, 'Tersedia', 'asset'),
        ('FURN-2022-0112', 'Kursi Lipat Ergonomis', 'Mebel', 12, 'Hampir Habis', 'asset'),
        ('SPO-2023-0009', 'Bola Basket Molten v7', 'Alat Olahraga', 0, 'Habis', 'asset'),
        ('LIB-2021-0882', 'Buku Paket Matematika XII', 'Buku & Pustaka', 120, 'Tersedia', 'asset'),
        ('LAB-2023-0102', 'Mikroskop Binokuler Digital', 'Laboratorium', 8, 'Tersedia', 'asset'),
        ('ATK-2023-0021', 'Tinta Printer HP 680 Black', 'Alat Tulis Kantor', 2, 'Kritis', 'consumable'),
        ('ELC-2023-0112', 'Kabel HDMI 3M', 'Elektronik', 5, 'Hampir Habis', 'asset')
      `);
    }
    
    const borCheck = await client.query('SELECT COUNT(*) FROM borrowings');
    if (parseInt(borCheck.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO borrowings (borrower, borrower_id, item, item_id, borrow_date, due_date, status) VALUES
        ('Rizky Amanda', 'GURU-08221', 'Proyektor Epson EB-X400', 'PJ-2023-001', '12 Okt 2023', '19 Okt 2023', 'Terlambat'),
        ('Budi Santoso', 'STAF-02201', 'Kamera DSLR Canon EOS 80D', 'KM-2023-042', '20 Okt 2023', '27 Okt 2023', 'Dipinjam'),
        ('Dewi Nuraini', 'GURU-08225', 'Microphone Wireless Shure', 'AU-2023-015', '22 Okt 2023', '29 Okt 2023', 'Dipinjam'),
        ('Indra Kusuma', 'STAF-02205', 'Laptop Dell Latitude 5420', 'LP-2023-112', '15 Okt 2023', '22 Okt 2023', 'Terlambat')
      `);
    }
    
    const transCheck = await client.query('SELECT COUNT(*) FROM transactions');
    if (parseInt(transCheck.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO transactions (type, item, date, user_name, category) VALUES
        ('Masuk', '10 Rim Kertas A4', '2 Jam Lalu', 'Admin', 'Restock'),
        ('Keluar', 'Laptop Dell Latitude 3420', '45 Menit Lalu', 'Siti Aminah', 'Peminjaman'),
        ('Kembali', 'Proyektor Epson EB-X400', '10 Menit Lalu', 'Budi Santoso', 'Pengembalian'),
        ('Keluar', 'Kabel HDMI 3M', '1 Hari Lalu', 'Admin Lab', 'Pengambilan')
      `);
    }

    const userCheck = await client.query('SELECT COUNT(*) FROM users');
    if (parseInt(userCheck.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO users (first_name, last_name, instansi, role, email, password) VALUES
        ('Admin', 'Sekolah', 'SMA Contoh', 'Super Admin', 'admin@iqis.id', 'admin123')
      `);
    }
  } catch (err) {
    console.error('Error initializing database:', err);
  } finally {
    client.release();
  }
}

// API Routes

// Get all inventory
app.get('/api/inventory', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM inventory ORDER BY id');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add inventory item
app.post('/api/inventory', async (req, res) => {
  const { id, name, category, stock, status, type } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO inventory (id, name, category, stock, status, type) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [id, name, category, stock, status, type]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update inventory
app.put('/api/inventory/:id', async (req, res) => {
  const { name, category, stock, status, type } = req.body;
  try {
    const { rows } = await pool.query(
      'UPDATE inventory SET name=$1, category=$2, stock=$3, status=$4, type=$5 WHERE id=$6 RETURNING *',
      [name, category, stock, status, type, req.params.id]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all borrowings
app.get('/api/borrowings', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM borrowings ORDER BY id');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add borrowing
app.post('/api/borrowings', async (req, res) => {
  const { borrower, borrower_id, item, item_id, borrow_date, due_date, status } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO borrowings (borrower, borrower_id, item, item_id, borrow_date, due_date, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [borrower, borrower_id, item, item_id, borrow_date, due_date, status]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update borrowing (return)
app.put('/api/borrowings/:id', async (req, res) => {
  const { status } = req.body;
  try {
    const { rows } = await pool.query(
      'UPDATE borrowings SET status=$1 WHERE id=$2 RETURNING *',
      [status, req.params.id]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all transactions
app.get('/api/transactions', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM transactions ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add transaction
app.post('/api/transactions', async (req, res) => {
  const { type, item, date, user_name, category } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO transactions (type, item, date, user_name, category) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [type, item, date, user_name, category]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'IQIS API is running' });
});

// Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const { rows } = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND password = $2',
      [email, password]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    const user = rows[0];
    res.json({
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, first_name, last_name, instansi, role, email FROM users ORDER BY id'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new user
app.post('/api/users', async (req, res) => {
  const { first_name, last_name, instansi, role, email, password } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO users (first_name, last_name, instansi, role, email, password) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, first_name, last_name, instansi, role, email',
      [first_name, last_name, instansi, role, email, password]
    );
    res.json(rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Email sudah digunakan' });
    }
    res.status(500).json({ error: err.message });
  }
});

// Update user
app.put('/api/users/:id', async (req, res) => {
  const { first_name, last_name, instansi, role, email, password } = req.body;
  try {
    let query, params;
    if (password) {
      query =
        'UPDATE users SET first_name=$1, last_name=$2, instansi=$3, role=$4, email=$5, password=$6 WHERE id=$7 RETURNING id, first_name, last_name, instansi, role, email';
      params = [first_name, last_name, instansi, role, email, password, req.params.id];
    } else {
      query =
        'UPDATE users SET first_name=$1, last_name=$2, instansi=$3, role=$4, email=$5 WHERE id=$6 RETURNING id, first_name, last_name, instansi, role, email';
      params = [first_name, last_name, instansi, role, email, req.params.id];
    }
    const { rows } = await pool.query(query, params);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete user
app.delete('/api/users/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE id=$1', [req.params.id]);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
initDB().then(() => {
  app.listen(port, () => {
    console.log(`IQIS Server running on port ${port}`);
  });
});
