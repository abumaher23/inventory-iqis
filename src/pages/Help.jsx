export default function Help() {
  return (
    <div>
      <div className="mb-8">
        <h2 className="font-h1 text-h1 text-primary">Bantuan & Dukungan</h2>
        <p className="text-slate-500 mt-1">Panduan penggunaan sistem IQIS.</p>
      </div>

      <div className="max-w-4xl space-y-6">
        {/* FAQ Section */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-h3 text-h3 text-primary mb-4">FAQ - Pertanyaan Umum</h3>
          <div className="space-y-4">
            {[
              { q: 'Bagaimana cara menambah barang baru?', a: 'Buka menu Inventaris dan klik tombol "Tambah Aset Baru" atau gunakan menu "Tambah Barang" di sidebar.' },
              { q: 'Bagaimana jika barang terlambat dikembalikan?', a: 'Sistem akan otomatis mendeteksi status "Terlambat" dan mengirimkan notifikasi ke peminjam serta atasan.' },
              { q: 'Apa perbedaan Pengambilan dan Peminjaman?', a: 'Peminjaman untuk barang yang harus dikembalikan (aset), sedangkan Pengambilan untuk barang habis pakai (stok berkurang permanen).' },
              { q: 'Bagaimana cara mencetak laporan?', a: 'Gunakan tombol "Export PDF" di halaman Log Transaksi atau Daftar Inventaris.' },
            ].map((faq, idx) => (
              <div key={idx} className="border-b border-slate-100 pb-4 last:border-0">
                <h4 className="font-semibold text-sm text-slate-900 mb-2">{faq.q}</h4>
                <p className="text-sm text-slate-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Guide */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-h3 text-h3 text-primary mb-4">Panduan Cepat</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { icon: 'inventory_2', title: 'Manajemen Inventaris', desc: 'Kelola seluruh aset sekolah, filter berdasarkan kategori, dan pantau stok secara real-time.' },
              { icon: 'assignment_return', title: 'Sistem Peminjaman', desc: 'Catat barang keluar/masuk, atur jatuh tempo, dan lacak keterlambatan otomatis.' },
              { icon: 'output', title: 'Pengambilan Barang', desc: 'Khusus barang habis pakai. Stok berkurang permanen tanpa perlu pengembalian.' },
              { icon: 'receipt_long', title: 'Log Transaksi', desc: 'Audit trail lengkap untuk semua mutasi barang masuk dan keluar.' },
            ].map((guide, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-lg">
                <span className="material-symbols-outlined text-primary text-2xl mb-2">{guide.icon}</span>
                <h4 className="font-semibold text-sm text-slate-900 mb-1">{guide.title}</h4>
                <p className="text-xs text-slate-600">{guide.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Support */}
        <div className="bg-primary text-white rounded-xl p-6 flex items-center gap-6">
          <span className="material-symbols-outlined text-4xl">support_agent</span>
          <div>
            <h4 className="font-bold text-lg mb-2">Butuh Bantuan Lebih?</h4>
            <p className="text-blue-100 text-sm mb-4">Hubungi tim support kami untuk bantuan teknis.</p>
            <div className="flex gap-3">
              <button className="bg-white text-primary px-4 py-2 rounded-lg text-sm font-bold">Email Support</button>
              <button className="bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-bold">Lihat Dokumentasi</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
