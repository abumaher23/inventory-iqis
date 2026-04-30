require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
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

// Start server
initDB().then(() => {
  app.listen(port, () => {
    console.log(`IQIS Server running on port ${port}`);
  });
});
