require('dotenv').config({ path: __dirname + '/.env' });
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
        type VARCHAR(20) DEFAULT 'asset',
        unit VARCHAR(100) DEFAULT 'Unit'
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
      
      ALTER TABLE transactions ADD COLUMN IF NOT EXISTS item_id VARCHAR(50);
      ALTER TABLE transactions ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 0;
      ALTER TABLE inventory ADD COLUMN IF NOT EXISTS unit VARCHAR(100) DEFAULT 'Unit';
      
      CREATE TABLE IF NOT EXISTS funding_sources (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL
      );
      
       CREATE TABLE IF NOT EXISTS departments (
         id SERIAL PRIMARY KEY,
         name VARCHAR(100) UNIQUE NOT NULL
       );
       
       CREATE TABLE IF NOT EXISTS settings (
         id SERIAL PRIMARY KEY,
         school_name VARCHAR(100) DEFAULT 'SMP Negeri 01',
         address TEXT DEFAULT 'Jl. Pendidikan No. 123',
         phone VARCHAR(20) DEFAULT '021-1234567',
         low_stock_threshold INTEGER DEFAULT 10,
         critical_stock_threshold INTEGER DEFAULT 3
       );
     `);
    
    // Insert default funding sources if table is empty
    const fundingSourcesCheck = await client.query('SELECT COUNT(*) FROM funding_sources');
    if (parseInt(fundingSourcesCheck.rows[0].count) === 0) {
      const fundingSources = ['BOS', 'Hibah', 'APBD', 'Komite Sekolah', 'Lainnya'];
      for (const source of fundingSources) {
        await client.query('INSERT INTO funding_sources (name) VALUES ($1)', [source]);
      }
    }
    
    // Insert default departments if table is empty
    const departmentsCheck = await client.query('SELECT COUNT(*) FROM departments');
    if (parseInt(departmentsCheck.rows[0].count) === 0) {
      const departments = ['Tata Usaha', 'Laboratorium', 'Perpustakaan', 'Guru BK', 'Kesiswaan', 'Kurikulum', 'Lainnya'];
      for (const dept of departments) {
        await client.query('INSERT INTO departments (name) VALUES ($1)', [dept]);
      }
    }
    console.log('Database initialized successfully');
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
  const { id, name, category, stock, status, type, unit } = req.body;
  try {
    // Check if name already exists (case-insensitive)
    const check = await pool.query('SELECT * FROM inventory WHERE LOWER(name) = LOWER($1)', [name]);
    if (check.rows.length > 0) {
      return res.status(400).json({ error: 'Nama barang sudah ada' });
    }
    
    const { rows } = await pool.query(
      'INSERT INTO inventory (id, name, category, stock, status, type, unit) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [id, name, category, stock, status, type, unit]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update inventory
app.put('/api/inventory/:id', async (req, res) => {
  const { name, category, stock, status, type, unit } = req.body;
  try {
    // Check if name already exists (excluding current item, case-insensitive)
    const check = await pool.query('SELECT * FROM inventory WHERE LOWER(name) = LOWER($1) AND id != $2', [name, req.params.id]);
    if (check.rows.length > 0) {
      return res.status(400).json({ error: 'Nama barang sudah ada' });
    }
    
    const { rows } = await pool.query(
      'UPDATE inventory SET name=$1, category=$2, stock=$3, status=$4, type=$5, unit=$6 WHERE id=$7 RETURNING *',
      [name, category, stock, status, type, unit, req.params.id]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete inventory
app.delete('/api/inventory/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM inventory WHERE id=$1', [req.params.id]);
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all categories
app.get('/api/categories', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM categories ORDER BY name');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add category
app.post('/api/categories', async (req, res) => {
  const { name } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO categories (name) VALUES ($1) RETURNING *',
      [name]
    );
    res.json(rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Kategori sudah ada' });
    }
    res.status(500).json({ error: err.message });
  }
});

// Delete category
app.delete('/api/categories/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM categories WHERE id=$1', [req.params.id]);
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Units API
// Get all units
app.get('/api/units', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM units ORDER BY name');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Funding Sources API
// Get all funding sources
app.get('/api/funding-sources', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM funding_sources ORDER BY name');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add funding source
app.post('/api/funding-sources', async (req, res) => {
  const { name } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO funding_sources (name) VALUES ($1) RETURNING *',
      [name]
    );
    res.json(rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Sumber dana sudah ada' });
    }
    res.status(500).json({ error: err.message });
  }
});

// Delete funding source
app.delete('/api/funding-sources/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM funding_sources WHERE id=$1', [req.params.id]);
    res.json({ message: 'Funding source deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Departments API
// Initialize departments table in initDB function
// Add this to the initDB function's SQL:
// CREATE TABLE IF NOT EXISTS departments (
//   id SERIAL PRIMARY KEY,
//   name VARCHAR(100) UNIQUE NOT NULL
// );

// Get all departments
app.get('/api/departments', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM departments ORDER BY name');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add department
app.post('/api/departments', async (req, res) => {
  const { name } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO departments (name) VALUES ($1) RETURNING *',
      [name]
    );
    res.json(rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Departemen sudah ada' });
    }
    res.status(500).json({ error: err.message });
  }
});

// Delete department
app.delete('/api/departments/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM departments WHERE id=$1', [req.params.id]);
    res.json({ message: 'Department deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add unit
app.post('/api/units', async (req, res) => {
  const { name } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO units (name) VALUES ($1) RETURNING *',
      [name]
    );
    res.json(rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Unit kerja sudah ada' });
    }
    res.status(500).json({ error: err.message });
  }
});

// Delete unit
app.delete('/api/units/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM units WHERE id=$1', [req.params.id]);
    res.json({ message: 'Unit deleted' });
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
  const { type, item, date, user_name, category, item_id, quantity } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO transactions (type, item, date, user_name, category, item_id, quantity) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [type, item, date, user_name, category, item_id, quantity || 0]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cancel transaction (reverse stock)
app.put('/api/transactions/:id/cancel', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { rows } = await client.query('SELECT * FROM transactions WHERE id=$1', [req.params.id]);
    if (rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Transaksi tidak ditemukan' });
    }
    
    const transaction = rows[0];
    
    if (transaction.category === 'Dibatalkan') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Transaksi sudah dibatalkan' });
    }
    
    if (!transaction.item_id || !transaction.quantity) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Transaksi ini tidak dapat dibatalkan karena data tidak lengkap' });
    }
    
    // Reverse stock
    const invResult = await client.query('SELECT * FROM inventory WHERE id=$1', [transaction.item_id]);
    if (invResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Barang tidak ditemukan di inventaris' });
    }
    
    const item = invResult.rows[0];
    let newStock;
    
    if (transaction.type === 'Masuk') {
      // Reverse: subtract the quantity that was added
      newStock = item.stock - transaction.quantity;
      if (newStock < 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: `Stok tidak mencukupi untuk pembatalan. Stok saat ini: ${item.stock}, jumlah yang dibatalkan: ${transaction.quantity}` });
      }
    } else if (transaction.type === 'Keluar') {
      // Reverse: add back the quantity that was taken
      newStock = item.stock + transaction.quantity;
    } else {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Tipe transaksi tidak didukung untuk pembatalan' });
    }
    
    // Compute new status
    const lowThreshold = 10;
    const criticalThreshold = 3;
    let status;
    if (newStock > 20) status = 'Tersedia';
    else if (newStock > 5) status = 'Hampir Habis';
    else if (newStock === 0) status = 'Habis';
    else status = 'Kritis';
    
    await client.query(
      'UPDATE inventory SET stock=$1, status=$2 WHERE id=$3',
      [newStock, status, transaction.item_id]
    );
    
    // Mark transaction as cancelled
    await client.query(
      "UPDATE transactions SET category='Dibatalkan' WHERE id=$1",
      [req.params.id]
    );
    
    await client.query('COMMIT');
    
    res.json({ message: 'Transaksi berhasil dibatalkan', newStock });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'IQIS API is running' });
});

// Register (public)
app.post('/api/register', async (req, res) => {
  const { first_name, last_name, instansi, email, password } = req.body;

  if (!first_name || !email || !password) {
    return res.status(400).json({ message: 'Nama depan, email, dan password wajib diisi' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password minimal 6 karakter' });
  }

  try {
    const { rows } = await pool.query(
      'INSERT INTO users (first_name, last_name, instansi, role, email, password) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, first_name, last_name, instansi, role, email',
      [first_name, last_name || '', instansi || '', 'user', email, password]
    );
    res.json({ user: rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ message: 'Email sudah digunakan' });
    }
    res.status(500).json({ message: err.message });
  }
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

// Settings API
// Get settings
app.get('/api/settings', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM settings LIMIT 1');
    // If no settings row exists, create one with defaults
    if (rows.length === 0) {
      const { rows: newRows } = await pool.query(
        'INSERT INTO settings (school_name, address, phone, low_stock_threshold, critical_stock_threshold) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        ['SMP Negeri 01', 'Jl. Pendidikan No. 123', '021-1234567', 10, 3]
      );
      res.json(newRows[0]);
    } else {
      res.json(rows[0]);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update settings
app.put('/api/settings', async (req, res) => {
  const { school_name, address, phone, low_stock_threshold, critical_stock_threshold } = req.body;
  try {
    // Check if settings exist
    const { rows } = await pool.query('SELECT * FROM settings LIMIT 1');
    let result;
    if (rows.length === 0) {
      // Insert new settings
      const { rows: newRows } = await pool.query(
        'INSERT INTO settings (school_name, address, phone, low_stock_threshold, critical_stock_threshold) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [school_name, address, phone, low_stock_threshold, critical_stock_threshold]
      );
      result = newRows[0];
    } else {
      // Update existing settings
      const { rows: updatedRows } = await pool.query(
        'UPDATE settings SET school_name=$1, address=$2, phone=$3, low_stock_threshold=$4, critical_stock_threshold=$5 RETURNING *',
        [school_name, address, phone, low_stock_threshold, critical_stock_threshold]
      );
      result = updatedRows[0];
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Initialize database tables (runs on every cold start, idempotent)
initDB().catch(err => console.error('DB init failed:', err));

// Start server (only when run directly, not via Vercel serverless)
if (require.main === module) {
  app.listen(port, () => {
    console.log(`IQIS Server running on port ${port}`);
  });
}

module.exports = app;
