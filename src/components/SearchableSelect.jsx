import { useState, useRef, useEffect } from 'react';

export default function SearchableSelect({ items, value, onChange, placeholder, disabled }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  const selected = items.find(i => i.id === value);

  const filtered = items.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (!open) setSearch('');
  }, [open]);

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const select = (item) => {
    onChange(item.id);
    setOpen(false);
    inputRef.current?.blur();
  };

  return (
    <div className="relative flex-1" ref={containerRef}>
      <div
        className={`flex items-center gap-2 w-full px-4 py-2.5 bg-white border rounded-lg text-sm cursor-pointer ${
          open ? 'border-primary ring-2 ring-primary/20' : 'border-slate-200'
        }`}
        onClick={() => { if (!disabled) setOpen(!open); }}
      >
        <span className="material-symbols-outlined text-slate-400 text-lg">search</span>
        {selected ? (
          <span className="flex-1 font-medium text-slate-800 truncate">{selected.name}</span>
        ) : (
          <span className="flex-1 text-slate-400">{placeholder || 'Pilih barang...'}</span>
        )}
        <span className="material-symbols-outlined text-slate-400 text-lg">
          {open ? 'expand_less' : 'expand_more'}
        </span>
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-20 max-h-72 overflow-hidden flex flex-col">
          <div className="p-2 border-b border-slate-100">
            <input
              ref={inputRef}
              type="text"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
              placeholder="Cari barang..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          <div className="overflow-y-auto flex-1">
            {filtered.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-slate-400">Barang tidak ditemukan</div>
            ) : (
              filtered.map(item => {
                const stock = item.stock ?? 0;
                const stockLabel = stock === 0 ? 'Habis' : stock <= 3 ? 'Kritis' : stock <= 10 ? 'Hampir Habis' : 'Tersedia';
                const stockColor = stock === 0 ? 'text-red-600 bg-red-50' : stock <= 3 ? 'text-orange-600 bg-orange-50' : stock <= 10 ? 'text-yellow-600 bg-yellow-50' : 'text-green-700 bg-green-50';
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-b-0 ${
                      value === item.id ? 'bg-primary/5' : ''
                    }`}
                    onClick={() => select(item)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-800 truncate">{item.name}</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {item.category && <span>{item.category}</span>}
                        {item.unit && <span> &middot; {item.unit}</span>}
                      </div>
                    </div>
                    <div className={`text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ${stockColor}`}>
                      {stock} {stockLabel}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
