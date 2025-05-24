import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Select from 'react-select';

function Reservation() {
  const [restaurantId, setRestaurantId] = useState(1);
  const [date, setDate] = useState('');
  const [time, setTime] = useState(null); // Χρήση αντικειμένου από react-select
  const [people, setPeople] = useState(1);

  const navigate = useNavigate();
  const location = useLocation();

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate(`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`);
      return;
    }

    const query = new URLSearchParams(location.search);
    const restaurantParam = query.get('restaurant_id');
    if (restaurantParam) {
      setRestaurantId(parseInt(restaurantParam));
    }
  }, [navigate, location]);

  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 12; hour <= 22; hour++) {
      times.push({ value: `${String(hour).padStart(2, '0')}:00`, label: `${String(hour).padStart(2, '0')}:00` });
      times.push({ value: `${String(hour).padStart(2, '0')}:30`, label: `${String(hour).padStart(2, '0')}:30` });
    }
    times.push({ value: '23:00', label: '23:00' });
    return times;
  };

  const handleReservation = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token || !time) return;

    try {
      const res = await fetch('http://localhost:5000/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          restaurant_id: restaurantId,
          date,
          time: time.value,
          people_count: parseInt(people)
        })
      });

      const data = await res.json();

      if (res.ok) {
        alert('✅ Η κράτηση έγινε με επιτυχία!');
        navigate('/profile');
      } else {
        alert(`❌ Σφάλμα: ${data.message}`);
      }
    } catch (err) {
      console.error('❌ Σφάλμα αποστολής:', err);
      alert('❌ Σφάλμα διακομιστή.');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
      <h2>Φόρμα Κράτησης</h2>
      <form onSubmit={handleReservation}>
        <label>Εστιατόριο:</label>
        <select
          value={restaurantId}
          onChange={(e) => setRestaurantId(parseInt(e.target.value))}
          className="form-control mb-3"
        >
          <option value={1}>Taverna Nikos</option>
          <option value={2}>Souvlaki House</option>
          <option value={3}>Ocean View</option>
          <option value={4}>Pasta Bella</option>
        </select>

        <label>Ημερομηνία:</label>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          min={todayStr}
          required
          className="form-control mb-3"
        />

        <label>Ώρα:</label>
        <Select
          className="mb-3"
          options={generateTimeOptions()}
          value={time}
          onChange={(selected) => setTime(selected)}
          placeholder="-- Επιλέξτε ώρα --"
        />

        <label>Άτομα:</label>
        <input
          type="number"
          min="1"
          value={people}
          onChange={e => setPeople(e.target.value)}
          required
          className="form-control mb-3"
        />

        <button type="submit" className="btn btn-success">Κράτηση</button>
      </form>
    </div>
  );
}

export default Reservation;
