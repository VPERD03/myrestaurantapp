import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

function Navbar({ loggedIn, setLoggedIn }) {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserEmail(decoded.email || '');
      } catch (err) {
        console.error('Σφάλμα αποκωδικοποίησης token:', err);
        setUserEmail('');
        localStorage.removeItem('token');
        setLoggedIn(false);
      }
    } else {
      setUserEmail('');
    }
  }, [loggedIn, setLoggedIn]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setLoggedIn(false);
    setUserEmail('');
    navigate('/');
  };

  return (
    <nav className="navbar navbar-dark bg-dark px-4">
      <Link to="/" className="navbar-brand">
        🍽 MyRestaurantApp
      </Link>

      <div className="d-flex align-items-center gap-3 text-white">
        {loggedIn ? (
          <>
            <Link to="/profile" className="text-white text-decoration-none d-flex align-items-center gap-1">
              <span role="img" aria-label="profile">👤</span> {userEmail}
            </Link>
            <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
              Αποσύνδεση
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-white text-decoration-none">
              Σύνδεση
            </Link>
            <Link to="/register" className="text-white text-decoration-none">
              Εγγραφή
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
