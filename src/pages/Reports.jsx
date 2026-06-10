import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import * as api from '../api';

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function todayStr() {
  return new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function Reports() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const printRef = useRef(null);
  const [inventory, setInventory] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [borrowings, setBorrowings] = useState([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedItem, setSelectedItem] = useState('');
  const [generating, setGenerating] = useState('');

  useEffect(() => {
    api.fetchInventory().then(setInventory).catch(console.error);
    api.fetchTransactions().then(setTransactions).catch(console.error);
    api.fetchBorrowings().then(setBorrowings).catch(console.error);
  }, []);

  const generatePDF = async (type) => {
    setGenerating(type);
    await new Promise(r => setTimeout(r, 100));

    const { default: html2pdf } = await import('html2pdf.js');

    const element = document.getElementById('pdf-content');
    if (!element) return;

    const opt = {
      margin: 10,
      filename: `${type}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: type === 'kartu-stok' ? 'portrait' : 'landscape' },
    };

    try {
      await html2pdf().set(opt).from(element).save();
      addToast('PDF berhasil diunduh', 'success');
    } catch (err) {
      addToast('Gagal membuat PDF', 'error');
    }
    setGenerating('');
  };

  const filteredTransactions = transactions.filter(t => {
    if (!dateFrom && !dateTo) return true;
    const d = t.date ? new Date(t.date.split(',')[0] + ' 2026') : null;
    if (!d) return true;
    const from = dateFrom ? new Date(dateFrom) : new Date('2000-01-01');
    const to = dateTo ? new Date(dateTo + 'T23:59:59') : new Date('2099-12-31');
    return d >= from && d <= to;
  });

  const selectedTransactions = selectedItem
    ? transactions.filter(t => t.item_id === selectedItem)
    : [];

  return (
    <div>
      <div className="mb-8">
        <h2 className="font-h1 text-h1 text-primary">Laporan</h2>
        <p className="text-slate-500 mt-1">Download laporan inventaris dalam format PDF.</p>
      </div>

      {/* Hide PDF content off-screen for generation */}
      <div className="fixed left-[-9999px] top-0">
        <div id="pdf-content">
          {generating === 'inventaris' && (
            <div style={{ padding: '20px 30px', fontFamily: 'Inter, sans-serif', color: '#191c1e' }}>
              <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4, color: '#002B5B' }}>Laporan Inventaris Barang</h1>
              <p style={{ fontSize: 12, color: '#727780', marginBottom: 20 }}>IQIS — Ibnul Qayyim Islamic School | {todayStr()}</p>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                <thead>
                  <tr style={{ backgroundColor: '#002B5B', color: '#fff' }}>
                    <th style={thStyle}>No</th>
                    <th style={thStyle}>Nama Barang</th>
                    <th style={thStyle}>Kategori</th>
                    <th style={thStyle}>Stok</th>
                    <th style={thStyle}>Satuan</th>
                    <th style={thStyle}>Jenis</th>
                    <th style={thStyle}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map((item, i) => (
                    <tr key={item.id} style={{ backgroundColor: i % 2 === 0 ? '#fff' : '#f7f9fb' }}>
                      <td style={tdStyle}>{i + 1}</td>
                      <td style={tdStyle}>{item.name}</td>
                      <td style={tdStyle}>{item.category || '-'}</td>
                      <td style={tdStyle}>{item.stock}</td>
                      <td style={tdStyle}>{item.unit || 'Unit'}</td>
                      <td style={tdStyle}>{item.type === 'asset' ? 'Aset' : 'Habis Pakai'}</td>
                      <td style={tdStyle}>{item.status || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p style={{ fontSize: 10, color: '#727780', marginTop: 16 }}>
                Total barang: {inventory.length} | Dicetak: {new Date().toLocaleString('id-ID')}
              </p>
            </div>
          )}

          {generating === 'transaksi' && (
            <div style={{ padding: '20px 30px', fontFamily: 'Inter, sans-serif', color: '#191c1e' }}>
              <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4, color: '#002B5B' }}>Laporan Transaksi</h1>
              <p style={{ fontSize: 12, color: '#727780', marginBottom: 20 }}>
                IQIS — Ibnul Qayyim Islamic School | {todayStr()}
                {dateFrom && dateTo && ` | Periode: ${formatDate(dateFrom)} — ${formatDate(dateTo)}`}
              </p>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                <thead>
                  <tr style={{ backgroundColor: '#002B5B', color: '#fff' }}>
                    <th style={thStyle}>No</th>
                    <th style={thStyle}>Tanggal</th>
                    <th style={thStyle}>Jenis</th>
                    <th style={thStyle}>Barang</th>
                    <th style={thStyle}>Jumlah</th>
                    <th style={thStyle}>Petugas</th>
                    <th style={thStyle}>Kategori</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((t, i) => (
                    <tr key={t.id} style={{ backgroundColor: i % 2 === 0 ? '#fff' : '#f7f9fb' }}>
                      <td style={tdStyle}>{i + 1}</td>
                      <td style={tdStyle}>{t.date || '-'}</td>
                      <td style={tdStyle}>{t.type}</td>
                      <td style={tdStyle}>{t.item}</td>
                      <td style={tdStyle}>{t.quantity || '-'}</td>
                      <td style={tdStyle}>{t.user_name || '-'}</td>
                      <td style={tdStyle}>{t.category || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p style={{ fontSize: 10, color: '#727780', marginTop: 16 }}>
                Total transaksi: {filteredTransactions.length} | Dicetak: {new Date().toLocaleString('id-ID')}
              </p>
            </div>
          )}

          {generating === 'peminjaman' && (
            <div style={{ padding: '20px 30px', fontFamily: 'Inter, sans-serif', color: '#191c1e' }}>
              <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4, color: '#002B5B' }}>Laporan Peminjaman</h1>
              <p style={{ fontSize: 12, color: '#727780', marginBottom: 20 }}>IQIS — Ibnul Qayyim Islamic School | {todayStr()}</p>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                <thead>
                  <tr style={{ backgroundColor: '#002B5B', color: '#fff' }}>
                    <th style={thStyle}>No</th>
                    <th style={thStyle}>Peminjam</th>
                    <th style={thStyle}>Barang</th>
                    <th style={thStyle}>Tgl Pinjam</th>
                    <th style={thStyle}>Jatuh Tempo</th>
                    <th style={thStyle}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {borrowings.map((b, i) => (
                    <tr key={b.id} style={{ backgroundColor: i % 2 === 0 ? '#fff' : '#f7f9fb' }}>
                      <td style={tdStyle}>{i + 1}</td>
                      <td style={tdStyle}>{b.borrower}</td>
                      <td style={tdStyle}>{b.item}</td>
                      <td style={tdStyle}>{b.borrow_date || '-'}</td>
                      <td style={tdStyle}>{b.due_date || '-'}</td>
                      <td style={tdStyle}>{b.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p style={{ fontSize: 10, color: '#727780', marginTop: 16 }}>
                Total peminjaman: {borrowings.length} | Dicetak: {new Date().toLocaleString('id-ID')}
              </p>
            </div>
          )}

          {generating === 'kartu-stok' && selectedItem && (
            <div style={{ padding: '20px 30px', fontFamily: 'Inter, sans-serif', color: '#191c1e' }}>
              <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4, color: '#002B5B' }}>Kartu Stok Barang</h1>
              <p style={{ fontSize: 12, color: '#727780', marginBottom: 4 }}>
                IQIS — Ibnul Qayyim Islamic School | {todayStr()}
              </p>
              <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
                {inventory.find(i => i.id === selectedItem)?.name || selectedItem}
              </p>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                <thead>
                  <tr style={{ backgroundColor: '#002B5B', color: '#fff' }}>
                    <th style={thStyle}>No</th>
                    <th style={thStyle}>Tanggal</th>
                    <th style={thStyle}>Jenis</th>
                    <th style={thStyle}>Jumlah</th>
                    <th style={thStyle}>Petugas</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedTransactions.map((t, i) => (
                    <tr key={t.id} style={{ backgroundColor: i % 2 === 0 ? '#fff' : '#f7f9fb' }}>
                      <td style={tdStyle}>{i + 1}</td>
                      <td style={tdStyle}>{t.date || '-'}</td>
                      <td style={tdStyle}>{t.type}</td>
                      <td style={tdStyle}>{t.quantity || '-'}</td>
                      <td style={tdStyle}>{t.user_name || '-'}</td>
                    </tr>
                  ))}
                  {selectedTransactions.length === 0 && (
                    <tr><td colSpan={5} style={{ ...tdStyle, textAlign: 'center', color: '#727780' }}>Belum ada transaksi</td></tr>
                  )}
                </tbody>
              </table>
              <p style={{ fontSize: 10, color: '#727780', marginTop: 16 }}>
                Total transaksi: {selectedTransactions.length} | Dicetak: {new Date().toLocaleString('id-ID')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Laporan Inventaris */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-start gap-4 mb-5">
            <div className="w-10 h-10 rounded-lg bg-primary-fixed flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">inventory_2</span>
            </div>
            <div className="flex-1">
              <h3 className="font-h3 text-primary">Laporan Inventaris</h3>
              <p className="text-sm text-slate-500 mt-1">Seluruh daftar barang dengan stok, kategori, dan status.</p>
            </div>
          </div>
          <button
            onClick={() => generatePDF('inventaris')}
            disabled={generating === 'inventaris'}
            className="w-full py-2.5 bg-primary text-white rounded-lg font-semibold text-sm hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {generating === 'inventaris' ? (
              <><span className="material-symbols-outlined text-lg animate-spin">refresh</span> Memproses...</>
            ) : (
              <><span className="material-symbols-outlined text-lg">download</span> Download PDF</>
            )}
          </button>
        </div>

        {/* Laporan Transaksi */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-start gap-4 mb-5">
            <div className="w-10 h-10 rounded-lg bg-primary-fixed flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">receipt_long</span>
            </div>
            <div className="flex-1">
              <h3 className="font-h3 text-primary">Laporan Transaksi</h3>
              <p className="text-sm text-slate-500 mt-1">Riwayat transaksi masuk/keluar berdasarkan periode.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Dari tanggal</label>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Sampai tanggal</label>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
            </div>
          </div>
          <button
            onClick={() => generatePDF('transaksi')}
            disabled={generating === 'transaksi'}
            className="w-full py-2.5 bg-primary text-white rounded-lg font-semibold text-sm hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {generating === 'transaksi' ? (
              <><span className="material-symbols-outlined text-lg animate-spin">refresh</span> Memproses...</>
            ) : (
              <><span className="material-symbols-outlined text-lg">download</span> Download PDF</>
            )}
          </button>
        </div>

        {/* Laporan Peminjaman */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-start gap-4 mb-5">
            <div className="w-10 h-10 rounded-lg bg-primary-fixed flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">assignment_return</span>
            </div>
            <div className="flex-1">
              <h3 className="font-h3 text-primary">Laporan Peminjaman</h3>
              <p className="text-sm text-slate-500 mt-1">Daftar peminjaman barang dengan status.</p>
            </div>
          </div>
          <button
            onClick={() => generatePDF('peminjaman')}
            disabled={generating === 'peminjaman'}
            className="w-full py-2.5 bg-primary text-white rounded-lg font-semibold text-sm hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {generating === 'peminjaman' ? (
              <><span className="material-symbols-outlined text-lg animate-spin">refresh</span> Memproses...</>
            ) : (
              <><span className="material-symbols-outlined text-lg">download</span> Download PDF</>
            )}
          </button>
        </div>

        {/* Kartu Stok */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-start gap-4 mb-5">
            <div className="w-10 h-10 rounded-lg bg-primary-fixed flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">history</span>
            </div>
            <div className="flex-1">
              <h3 className="font-h3 text-primary">Kartu Stok per Barang</h3>
              <p className="text-sm text-slate-500 mt-1">Riwayat mutasi stok satu barang tertentu.</p>
            </div>
          </div>
          <div className="mb-4">
            <select value={selectedItem} onChange={e => setSelectedItem(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm">
              <option value="">-- Pilih Barang --</option>
              {inventory.map(item => (
                <option key={item.id} value={item.id}>{item.name} (Stok: {item.stock})</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => generatePDF('kartu-stok')}
            disabled={generating === 'kartu-stok' || !selectedItem}
            className="w-full py-2.5 bg-primary text-white rounded-lg font-semibold text-sm hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {generating === 'kartu-stok' ? (
              <><span className="material-symbols-outlined text-lg animate-spin">refresh</span> Memproses...</>
            ) : (
              <><span className="material-symbols-outlined text-lg">download</span> Download PDF</>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}

const thStyle = {
  padding: '8px 10px',
  textAlign: 'left',
  fontWeight: 600,
  fontSize: 11,
  border: '1px solid #e0e3e5',
};

const tdStyle = {
  padding: '6px 10px',
  border: '1px solid #e0e3e5',
  fontSize: 11,
};
