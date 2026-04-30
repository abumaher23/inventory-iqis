export default function Settings() {
  return (
    <div>
      <div className="mb-8">
        <h2 className="font-h1 text-h1 text-primary">Pengaturan</h2>
        <p className="text-slate-500 mt-1">Kelola konfigurasi sistem IQIS.</p>
      </div>

      <div className="space-y-6 max-w-4xl">
        {/* Profile Section */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-h3 text-h3 text-primary mb-4">Profil Sekolah</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Sekolah</label>
              <input type="text" defaultValue="SMP Negeri 01" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Alamat</label>
                <input type="text" defaultValue="Jl. Pendidikan No. 123" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Telepon</label>
                <input type="text" defaultValue="021-1234567" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
              </div>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-h3 text-h3 text-primary mb-4">Pengaturan Notifikasi</h3>
          <div className="space-y-3">
            {['Email untuk keterlambatan', 'Reminder jatuh tempo', 'Laporan mingguan'].map((item, idx) => (
              <label key={idx} className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-700">{item}</span>
                <input type="checkbox" defaultChecked className="toggle" />
              </label>
            ))}
          </div>
        </div>

        {/* Low Stock Threshold */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-h3 text-h3 text-primary mb-4">Batas Stok Minimum</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Peringatan (Hampir Habis)</label>
              <input type="number" defaultValue="10" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Kritis</label>
              <input type="number" defaultValue="3" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
            </div>
          </div>
        </div>

        <button className="bg-primary text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:brightness-110">
          Simpan Pengaturan
        </button>
      </div>
    </div>
  );
}
