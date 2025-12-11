import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Reconciliation from './pages/Reconciliation';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/reconciliation/:platform" element={<Reconciliation />} />
      </Routes>
    </Router>
  );
}
