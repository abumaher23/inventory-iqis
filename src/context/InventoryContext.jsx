import { createContext, useContext, useReducer, useEffect } from 'react';

const InventoryContext = createContext();

const initialState = {
  inventory: [],
  borrowings: [],
  transactions: [],
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
