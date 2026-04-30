const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

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
