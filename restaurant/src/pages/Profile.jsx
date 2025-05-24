import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { secureFetch } from '../utils/api';
import Select from 'react-select';

function Profile() {
  const [reservations, setReservations] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ date: '', time: '', people_count: 1 });
  const [email, setEmail] = useState('');

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!token) return;

    try {
      const decoded = jwtDecode(token);
      setEmail(decoded.email || '(χωρίς email)');
    } catch (err) {
      console.warn('⚠️ Σφάλμα αποκωδικοποίησης token:', err);
      localStorage.removeItem('token');
      navigate('/login');
      return;
    }

    secureFetch(
      'http://localhost:5000/api/reservations/user',
      {},
      navigate,
      () => {
        localStorage.removeItem('token');
        alert('⛔ Η σύνδεσή σας έληξε. Παρακαλώ συνδεθείτε ξανά.');
        navigate('/login');
      }
    )
      .then(res => res && res.json())
      .then(data => data && setReservations(data))
      .catch(err => console.error('❌ Σφάλμα φόρτωσης:', err));
  }, [token, navigate]);

  const handleDelete = async (id) => {
    if (!window.confirm('Θέλεις σίγουρα να διαγράψεις την κράτηση;')) return;

    const res = await secureFetch(
      `http://localhost:5000/api/reservations/${id}`,
      { method: 'DELETE' },
      navigate,
      () => {
        localStorage.removeItem('token');
        navigate('/login');
      }
    );

    if (res?.ok) {
      setReservations(prev => prev.filter(r => r.reservation_id !== id));
      alert('✅ Διαγράφηκε.');
    }
  };

  const startEdit = (r) => {
    setEditingId(r.reservation_id);
    setEditData({
      date: r.date.split('T')[0],
      time: r.time,
      people_count: r.people_count
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    const reservationDate = new Date(`${editData.date}T${editData.time}`);
    const now = new Date();

    if (reservationDate < now) {
      alert('⛔ Δεν μπορείτε να ορίσετε ημερομηνία/ώρα στο παρελθόν.');
      return;
    }

    const [hours, minutes] = editData.time.split(':').map(Number);
    if (hours < 12 || hours > 23 || (hours === 23 && minutes > 0)) {
      alert('⛔ Το ωράριο κρατήσεων είναι 12:00 - 23:00.');
      return;
    }

    const res = await secureFetch(
      `http://localhost:5000/api/reservations/${editingId}`,
      {
        method: 'PUT',
        body: JSON.stringify(editData)
      },
      navigate,
      () => {
        localStorage.removeItem('token');
        navigate('/login');
      }
    );

    if (res?.ok) {
      setReservations(prev =>
        prev.map(r =>
          r.reservation_id === editingId ? { ...r, ...editData } : r
        )
      );
      setEditingId(null);
      alert('✅ Η κράτηση ενημερώθηκε.');
    } else {
      alert('❌ Σφάλμα κατά την ενημέρωση.');
    }
  };

  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString('el-GR');
  };

  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 12; hour <= 22; hour++) {
      times.push({ label: `${hour.toString().padStart(2, '0')}:00`, value: `${hour.toString().padStart(2, '0')}:00` });
      times.push({ label: `${hour.toString().padStart(2, '0')}:30`, value: `${hour.toString().padStart(2, '0')}:30` });
    }
    times.push({ label: '23:00', value: '23:00' });
    return times;
  };

  return (
    <div className="container mt-4" style={{ maxWidth: '700px' }}>
      <h2>Το Προφίλ μου</h2>
      <p><strong>Email:</strong> {email}</p>

      <h4 className="mt-4">Οι κρατήσεις μου</h4>
      {reservations.length === 0 ? (
        <p>Δεν υπάρχουν κρατήσεις.</p>
      ) : (
        <ul className="list-group">
          {reservations.map(r => (
            <li key={r.reservation_id} className="list-group-item mb-3">
              <p>
                <strong>Εστιατόριο:</strong> {r.restaurant_name}<br />
                <strong>Ημερομηνία:</strong> {formatDate(r.date)}<br />
                <strong>Ώρα:</strong> {r.time}<br />
                <strong>Άτομα:</strong> {r.people_count}
              </p>

              <button className="btn btn-sm btn-danger me-2" onClick={() => handleDelete(r.reservation_id)}>Διαγραφή</button>
              <button className="btn btn-sm btn-warning" onClick={() => startEdit(r)}>✏ Τροποποίηση</button>

              {editingId === r.reservation_id && (
                <form onSubmit={handleEditSubmit} className="mt-3">
                  <input
                    type="date"
                    className="form-control mb-2"
                    min={today}
                    value={editData.date}
                    onChange={e => setEditData({ ...editData, date: e.target.value })}
                    required
                  />
                  <Select
                    className="mb-2"
                    options={generateTimeOptions()}
                    value={{ label: editData.time, value: editData.time }}
                    onChange={option => setEditData({ ...editData, time: option.value })}
                    placeholder="-- Επιλέξτε ώρα --"
                    styles={{
                      control: (base) => ({
                        ...base,
                        minHeight: 35,
                        fontSize: '0.9rem'
                      }),
                      menu: (base) => ({
                        ...base,
                        zIndex: 9999
                      })
                    }}
                  />
                  <input
                    type="number"
                    min="1"
                    className="form-control mb-2"
                    value={editData.people_count}
                    onChange={e => setEditData({ ...editData, people_count: e.target.value })}
                    required
                  />
                  <button type="submit" className="btn btn-success btn-sm">Αποθήκευση</button>{' '}
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditingId(null)}>Άκυρο</button>
                </form>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Profile;
