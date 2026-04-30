import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function AccountManagement() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    instansi: '',
    role: 'user',
    email: '',
    password: '',
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingUser) {
        await api.updateUser(editingUser.id, formData);
      } else {
        await api.createUser(formData);
      }
      setShowForm(false);
      setEditingUser(null);
      setFormData({ first_name: '', last_name: '', instansi: '', role: 'user', email: '', password: '' });
      loadUsers();
    } catch (err) {
      console.error('Error saving user:', err);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      instansi: user.instansi || '',
      role: user.role || 'user',
      email: user.email || '',
      password: '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus user ini?')) return;

    try {
      await api.deleteUser(id);
      loadUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-h1 text-on-surface">Manajemen Akun</h1>
          <p className="font-body-md text-on-surface-variant mt-1">
            Kelola akun pengguna sistem
          </p>
        </div>
        <button
          onClick={() => {
            setEditingUser(null);
            setFormData({ username: '', password: '', name: '', role: 'user' });
            setShowForm(true);
          }}
          className="px-4 py-2 bg-primary text-on-primary rounded-xl font-body-md
                     hover:bg-primary/90 transition-colors"
        >
          + Tambah Akun
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface p-6 rounded-2xl w-full max-w-md">
            <h2 className="font-h2 text-on-surface mb-4">
              {editingUser ? 'Edit Akun' : 'Tambah Akun'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-body-md text-on-surface mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) =>
                      setFormData({ ...formData, first_name: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-background border border-outline rounded-xl
                               text-on-surface focus:outline-none focus:border-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block font-body-md text-on-surface mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) =>
                      setFormData({ ...formData, last_name: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-background border border-outline rounded-xl
                               text-on-surface focus:outline-none focus:border-primary"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block font-body-md text-on-surface mb-2">
                  Instansi
                </label>
                <input
                  type="text"
                  value={formData.instansi}
                  onChange={(e) =>
                    setFormData({ ...formData, instansi: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-background border border-outline rounded-xl
                             text-on-surface focus:outline-none focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="block font-body-md text-on-surface mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-background border border-outline rounded-xl
                             text-on-surface focus:outline-none focus:border-primary"
                  required
                  disabled={editingUser}
                />
              </div>
              <div>
                <label className="block font-body-md text-on-surface mb-2">
                  Password {editingUser && '(kosongkan jika tidak diubah)'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-background border border-outline rounded-xl
                             text-on-surface focus:outline-none focus:border-primary"
                  required={!editingUser}
                />
              </div>
              <div>
                <label className="block font-body-md text-on-surface mb-2">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-background border border-outline rounded-xl
                             text-on-surface focus:outline-none focus:border-primary"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="Super Admin">Super Admin</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-primary text-on-primary rounded-xl font-body-md
                             hover:bg-primary/90 transition-colors"
                >
                  Simpan
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingUser(null);
                  }}
                  className="flex-1 py-2 bg-surface-variant text-on-surface-variant rounded-xl
                             font-body-md hover:bg-surface-variant/80 transition-colors"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-surface rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-on-surface-variant">
            Loading...
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-surface-variant/50">
              <tr>
                <th className="text-left px-6 py-4 font-body-md text-on-surface-variant">
                  First Name
                </th>
                <th className="text-left px-6 py-4 font-body-md text-on-surface-variant">
                  Last Name
                </th>
                <th className="text-left px-6 py-4 font-body-md text-on-surface-variant">
                  Instansi
                </th>
                <th className="text-left px-6 py-4 font-body-md text-on-surface-variant">
                  Role
                </th>
                <th className="text-left px-6 py-4 font-body-md text-on-surface-variant">
                  Email
                </th>
                <th className="text-left px-6 py-4 font-body-md text-on-surface-variant">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-outline-variant">
                  <td className="px-6 py-4 font-body-md text-on-surface">
                    {u.first_name}
                  </td>
                  <td className="px-6 py-4 font-body-md text-on-surface">
                    {u.last_name}
                  </td>
                  <td className="px-6 py-4 font-body-md text-on-surface">
                    {u.instansi || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        u.role === 'Super Admin'
                          ? 'bg-error-container text-on-error-container'
                          : u.role === 'admin'
                          ? 'bg-tertiary-container text-on-tertiary-container'
                          : 'bg-primary-container text-on-primary-container'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-body-md text-on-surface">
                    {u.email}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(u)}
                        className="p-2 text-on-surface-variant hover:bg-surface-variant rounded-lg"
                      >
                        <span className="material-symbols-outlined text-sm">
                          edit
                        </span>
                      </button>
                      {u.id !== user?.id && (
                        <button
                          onClick={() => handleDelete(u.id)}
                          className="p-2 text-error hover:bg-error-container rounded-lg"
                        >
                          <span className="material-symbols-outlined text-sm">
                            delete
                          </span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
