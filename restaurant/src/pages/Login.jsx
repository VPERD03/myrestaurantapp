import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

function Login({ setLoggedIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = new URLSearchParams(location.search).get('redirect') || '/';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 > Date.now()) {
          navigate('/');
        }
      } catch {
        // Αν το token είναι άκυρο, αγνόησέ το
      }
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        alert('✅ Συνδεθήκατε επιτυχώς!');
        setLoggedIn(true);
        navigate(redirectPath);
      } else {
        alert(`❌ Σφάλμα: ${data.message}`);
      }
    } catch (err) {
      console.error('❌ Σφάλμα:', err);
      alert('❌ Σφάλμα διακομιστή.');
    }
  };

  return (
    <div className="container" style={{ maxWidth: '400px', marginTop: '40px' }}>
      <h2 className="mb-4">Σύνδεση</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          className="form-control mb-2"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Κωδικός"
          className="form-control mb-3"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="btn btn-primary w-100">Σύνδεση</button>
      </form>

      <p className="mt-3 text-center">
        Δεν έχετε λογαριασμό;{' '}
        <Link to="/register" className="text-decoration-none">
          Κάντε εγγραφή εδώ
        </Link>
      </p>
    </div>
  );
}

export default Login;
