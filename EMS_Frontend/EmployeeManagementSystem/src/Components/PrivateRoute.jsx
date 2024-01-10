import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const loggedIn = localStorage.getItem('LoggedIn');
    if (!loggedIn || loggedIn !== 'true') {
      navigate('/');
    }
  }, [navigate]);

  return localStorage.getItem('LoggedIn') ? children : null;
};

export default PrivateRoute;