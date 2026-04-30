const API_URL = 'http://localhost:3001/api';

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
