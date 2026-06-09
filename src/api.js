// API URL configuration
// Priority: env var > same-origin /api (Vercel) > localhost
const getAPIUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // Same-origin: frontend + API on same domain (Vercel serverless)
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return '/api';
  }
  return 'http://localhost:3001/api';
};

const API_URL = getAPIUrl();

export async function fetchInventory() {
  const res = await fetch(`${API_URL}/inventory`);
  return res.json();
}

export async function addInventory(item) {
  const res = await fetch(`${API_URL}/inventory`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
  return res.json();
}

export async function updateInventory(item) {
  const res = await fetch(`${API_URL}/inventory/${item.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
  return res.json();
}

export async function deleteInventory(id) {
  const res = await fetch(`${API_URL}/inventory/${id}`, {
    method: 'DELETE',
  });
  return res.json();
}

export async function fetchBorrowings() {
  const res = await fetch(`${API_URL}/borrowings`);
  return res.json();
}

export async function addBorrowing(borrowing) {
  const res = await fetch(`${API_URL}/borrowings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(borrowing),
  });
  return res.json();
}

export async function updateBorrowing(id, data) {
  const res = await fetch(`${API_URL}/borrowings/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function fetchTransactions() {
  const res = await fetch(`${API_URL}/transactions`);
  return res.json();
}

export async function cancelTransaction(id) {
  const res = await fetch(`${API_URL}/transactions/${id}/cancel`, {
    method: 'PUT',
  });
  return res.json();
}

export async function addTransaction(transaction) {
  const res = await fetch(`${API_URL}/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(transaction),
  });
  return res.json();
}

export async function login(email, password) {
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Login gagal');
  }

  return res.json();
}

export async function register(userData) {
  const res = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Pendaftaran gagal');
  }

  return res.json();
}

export async function getUsers() {
  const res = await fetch(`${API_URL}/users`);
  return res.json();
}

export async function createUser(userData) {
  const res = await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  return res.json();
}

export async function updateUser(id, userData) {
  const res = await fetch(`${API_URL}/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  return res.json();
}

export async function deleteUser(id) {
  const res = await fetch(`${API_URL}/users/${id}`, {
    method: 'DELETE',
  });
  return res.json();
}

export async function getCategories() {
  const res = await fetch(`${API_URL}/categories`);
  return res.json();
}

export async function addCategory(name) {
  const res = await fetch(`${API_URL}/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  return res.json();
}

export async function deleteCategory(id) {
  const res = await fetch(`${API_URL}/categories/${id}`, {
    method: 'DELETE',
  });
  return res.json();
}

export async function getUnits() {
  const res = await fetch(`${API_URL}/units`);
  return res.json();
}

export async function getFundingSources() {
  const res = await fetch(`${API_URL}/funding-sources`);
  return res.json();
}

export async function addFundingSource(name) {
  const res = await fetch(`${API_URL}/funding-sources`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  return res.json();
}

export async function deleteFundingSource(id) {
  const res = await fetch(`${API_URL}/funding-sources/${id}`, {
    method: 'DELETE',
  });
  return res.json();
}

export async function getDepartments() {
  const res = await fetch(`${API_URL}/departments`);
  return res.json();
}

export async function addDepartment(name) {
  const res = await fetch(`${API_URL}/departments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  return res.json();
}

export async function deleteDepartment(id) {
  const res = await fetch(`${API_URL}/departments/${id}`, {
    method: 'DELETE',
  });
  return res.json();
}

export async function getSettings() {
  const res = await fetch(`${API_URL}/settings`);
  return res.json();
}

export async function updateSettings(settings) {
  const res = await fetch(`${API_URL}/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
  return res.json();
}

export async function addUnit(name) {
  const res = await fetch(`${API_URL}/units`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  return res.json();
}

export async function deleteUnit(id) {
  const res = await fetch(`${API_URL}/units/${id}`, {
    method: 'DELETE',
  });
  return res.json();
}
