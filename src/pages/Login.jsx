import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.login(email, password);
      login(response.user);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 bg-surface rounded-2xl shadow-lg">
        <div className="text-center mb-8">
          <h1 className="font-h1 text-on-surface">IQIS</h1>
          <p className="font-body-md text-on-surface-variant mt-2">
            Sistem Manajemen Inventaris Sekolah
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block font-body-md text-on-surface mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-background border border-outline rounded-xl
                         text-on-surface focus:outline-none focus:border-primary"
              placeholder="Masukkan email"
              required
            />
          </div>

          <div>
            <label className="block font-body-md text-on-surface mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-background border border-outline rounded-xl
                         text-on-surface focus:outline-none focus:border-primary"
              placeholder="Masukkan password"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-error-container text-on-error-container rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-on-primary rounded-xl font-body-md
                       hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-on-surface-variant">
            Demo: email: admin@iqis.id, password: admin123
          </p>
        </div>
      </div>
    </div>
  );
}
