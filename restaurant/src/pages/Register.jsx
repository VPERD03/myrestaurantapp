import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json();

      if (res.ok) {
        alert('✅ Η εγγραφή ήταν επιτυχής! Τώρα μπορείτε να συνδεθείτε.');
        navigate('/login');
      } else {
        alert(`❌ Σφάλμα: ${data.message}`);
      }
    } catch (err) {
      console.error('❌ Σφάλμα εγγραφής:', err);
      alert('❌ Σφάλμα διακομιστή.');
    }
  };

  return (
    <div className="container" style={{ maxWidth: '400px', marginTop: '40px' }}>
      <h2 className="mb-4">Εγγραφή</h2>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Όνομα"
          value={name}
          onChange={e => setName(e.target.value)}
          className="form-control mb-2"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="form-control mb-2"
          required
        />
        <input
          type="password"
          placeholder="Κωδικός"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="form-control mb-3"
          required
        />
        <button type="submit" className="btn btn-primary w-100">Εγγραφή</button>
      </form>

      <p className="mt-3 text-center">
        Έχετε ήδη λογαριασμό;{' '}
        <Link to="/login" className="text-decoration-none">
          Κάντε σύνδεση εδώ
        </Link>
      </p>
    </div>
  );
}

export default Register;
