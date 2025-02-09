import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SubmitUserPage  from './pages/SubmitUserPage';
import ReportPage from "./pages/ReportPage";
import './App.css';

function App() {
  return (
    <Router>
      <div>
        <h1>User Management System</h1>
        <nav>
          <ul>
            <li><a href="/">Submit User</a></li>
            <li><a href="/report">Generate Report</a></li>
          </ul>
        </nav>
        <Routes>
          <Route path="/" element={<SubmitUserPage />} />
          <Route path="/report" element={<ReportPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App
