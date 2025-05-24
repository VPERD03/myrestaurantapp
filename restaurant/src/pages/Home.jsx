import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import RestaurantCard from '../components/RestaurantCard';

function Home() {
  const [search, setSearch] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [restaurants, setRestaurants] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:5000/api/restaurants')
      .then(res => res.json())
      .then(setRestaurants)
      .catch(console.error);
  }, []);

  const filtered = restaurants.filter(r =>
    (r.name.toLowerCase().includes(search.toLowerCase()) ||
     r.location.toLowerCase().includes(search.toLowerCase())) &&
    (selectedLocation ? r.location === selectedLocation : true) &&
    (selectedCategory ? r.category === selectedCategory : true)
  );

  //  Αν ο χρήστης πατήσει "Κάνε Κράτηση"
  const handleReserveClick = (restaurantId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      // Αν δεν είναι συνδεδεμένος → redirect σε login
      navigate('/login');
    } else {
      // Αν είναι → redirect σε φόρμα κράτησης
      navigate(`/reservation/${restaurantId}`);
    }
  };

  return (
    <div className="container mt-4">
      <SearchBar search={search} setSearch={setSearch} />

      <h5>Φίλτρα Περιοχής:</h5>
      <div className="mb-3 d-flex flex-wrap gap-2">
        {['Αθήνα', 'Θεσσαλονίκη', 'Πειραιάς'].map(loc => (
          <button
            key={loc}
            className={`btn ${selectedLocation === loc ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setSelectedLocation(loc === selectedLocation ? '' : loc)}
          >
            {loc}
          </button>
        ))}
      </div>

      <h5>Κατηγορίες:</h5>
      <div className="mb-4 d-flex flex-wrap gap-2">
        {['Ελληνική', 'Ιταλική', 'Θαλασσινά', 'Γρήγορο'].map(cat => (
          <button
            key={cat}
            className={`btn ${selectedCategory === cat ? 'btn-success' : 'btn-outline-success'}`}
            onClick={() => setSelectedCategory(cat === selectedCategory ? '' : cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <h4 className="mb-3">Όλα τα Εστιατόρια</h4>
      <div className="row">
        {filtered.map(r => (
          <div key={r.id} className="col-md-4">
            <RestaurantCard restaurant={r} onReserveClick={() => handleReserveClick(r.id)} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
