import { createContext, useContext, useReducer, useEffect } from 'react';

const InventoryContext = createContext();

const initialState = {
  inventory: [
    { id: 'ELC-2023-0041', name: 'Laptop Chromebook v2', category: 'Elektronik', stock: 45, status: 'Tersedia', type: 'asset' },
    { id: 'FURN-2022-0112', name: 'Kursi Lipat Ergonomis', category: 'Mebel', stock: 12, status: 'Hampir Habis', type: 'asset' },
    { id: 'SPO-2023-0009', name: 'Bola Basket Molten v7', category: 'Alat Olahraga', stock: 0, status: 'Habis', type: 'consumable' },
    { id: 'LIB-2021-0882', name: 'Buku Paket Matematika XII', category: 'Buku & Pustaka', stock: 120, status: 'Tersedia', type: 'asset' },
    { id: 'LAB-2023-0102', name: 'Mikroskop Binokuler Digital', category: 'Laboratorium', stock: 8, status: 'Tersedia', type: 'asset' },
    { id: 'ATK-2023-0021', name: 'Tinta Printer HP 680 Black', category: 'Alat Tulis Kantor', stock: 2, status: 'Kritis', type: 'consumable' },
    { id: 'ELC-2023-0112', name: 'Kabel HDMI 3M', category: 'Elektronik', stock: 5, status: 'Hampir Habis', type: 'asset' },
  ],
  borrowings: [
    { id: 1, borrower: 'Rizky Amanda', borrowerId: 'GURU-08221', item: 'Proyektor Epson EB-X400', itemId: 'PJ-2023-001', borrowDate: '12 Okt 2023', dueDate: '19 Okt 2023', status: 'Terlambat' },
    { id: 2, borrower: 'Budi Santoso', borrowerId: 'STAF-02201', item: 'Kamera DSLR Canon EOS 80D', itemId: 'KM-2023-042', borrowDate: '20 Okt 2023', dueDate: '27 Okt 2023', status: 'Dipinjam' },
    { id: 3, borrower: 'Dewi Nuraini', borrowerId: 'GURU-08225', item: 'Microphone Wireless Shure', itemId: 'AU-2023-015', borrowDate: '22 Okt 2023', dueDate: '29 Okt 2023', status: 'Dipinjam' },
    { id: 4, borrower: 'Indra Kusuma', borrowerId: 'STAF-02205', item: 'Laptop Dell Latitude 5420', itemId: 'LP-2023-112', borrowDate: '15 Okt 2023', dueDate: '22 Okt 2023', status: 'Terlambat' },
  ],
  transactions: [
    { id: 1, type: 'Masuk', item: '10 Rim Kertas A4', date: '2 Jam Lalu', user: 'Admin', category: 'Restock' },
    { id: 2, type: 'Keluar', item: 'Laptop Dell Latitude 3420', date: '45 Menit Lalu', user: 'Siti Aminah', category: 'Peminjaman' },
    { id: 3, type: 'Kembali', item: 'Proyektor Epson EB-X400', date: '10 Menit Lalu', user: 'Budi Santoso', category: 'Pengembalian' },
    { id: 4, type: 'Keluar', item: 'Kabel HDMI 3M', date: '1 Hari Lalu', user: 'Admin Lab', category: 'Pengambilan' },
  ],
};

function inventoryReducer(state, action) {
  switch (action.type) {
    case 'ADD_INVENTORY':
      return { ...state, inventory: [...state.inventory, action.payload] };
    case 'UPDATE_INVENTORY':
      return {
        ...state,
        inventory: state.inventory.map(item =>
          item.id === action.payload.id ? action.payload : item
        ),
      };
    case 'ADD_BORROWING':
      return { ...state, borrowings: [...state.borrowings, action.payload] };
    case 'RETURN_BORROWING':
      return {
        ...state,
        borrowings: state.borrowings.map(b =>
          b.id === action.payload ? { ...b, status: 'Dikembalikan' } : b
        ),
      };
    case 'ADD_TRANSACTION':
      return { ...state, transactions: [action.payload, ...state.transactions] };
    default:
      return state;
  }
}

export function InventoryProvider({ children }) {
  const [state, dispatch] = useReducer(inventoryReducer, initialState);

  return (
    <InventoryContext.Provider value={{ state, dispatch }}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within InventoryProvider');
  }
  return context;
}
