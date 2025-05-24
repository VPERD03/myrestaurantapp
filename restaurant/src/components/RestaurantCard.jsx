import React from 'react';
import { useNavigate } from 'react-router-dom';

function RestaurantCard({ restaurant }) {
  const navigate = useNavigate();

  const handleReservationClick = () => {
    const token = localStorage.getItem('token');
    const restaurantIdParam = `restaurant_id=${restaurant.id}`;

    if (token) {
      navigate(`/reserve?${restaurantIdParam}`);
    } else {
      const encodedRedirect = encodeURIComponent(`/reserve?${restaurantIdParam}`);
      navigate(`/login?redirect=${encodedRedirect}`);
    }
  };

  return (
    <div className="card m-2 shadow-sm" style={{ width: '18rem' }}>
      <div className="card-body">
        <h5 className="card-title">{restaurant.name}</h5>
        <h6 className="card-subtitle mb-2 text-muted">{restaurant.location}</h6>
        <p className="card-text">{restaurant.description}</p>
        <button className="btn btn-primary" onClick={handleReservationClick}>
          Κάνε Κράτηση
        </button>
      </div>
    </div>
  );
}

export default RestaurantCard;
