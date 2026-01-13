import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import RegistrationPage from './pages/RegistrationPage';
import AptitudePage from './pages/AptitudePage';
import CodingPage from './pages/CodingPage';
import HRPage from './pages/HRPage';
import DashboardPage from './pages/DashboardPage';
import SplashScreen from './components/SplashScreen';
import { getCandidate, getAptitudeScore, getCodingScore, getHRScore } from './utils/localStorageService';

function App() {
  const [showSplash, setShowSplash] = useState(true);

  // Check if user has seen splash before (optional - can be removed for always showing)
  // For now, always show splash on first load
  const handleSplashComplete = () => {
    setShowSplash(false);
  };
  // Protected route component to check progress
  const ProtectedRoute = ({ children, requiredRound }) => {
    const candidate = getCandidate();
    
    if (!candidate) {
      return <Navigate to="/" replace />;
    }

    // Check if user can access this round
    const aptitudeScore = getAptitudeScore();
    const codingScore = getCodingScore();
    const hrScore = getHRScore();

    switch (requiredRound) {
      case 'aptitude':
        return children;
      case 'coding':
        if (!aptitudeScore) {
          return <Navigate to="/aptitude" replace />;
        }
        return children;
      case 'hr':
        if (!aptitudeScore || !codingScore) {
          return <Navigate to="/coding" replace />;
        }
        return children;
      case 'dashboard':
        if (!aptitudeScore || !codingScore || !hrScore) {
          return <Navigate to="/hr" replace />;
        }
        return children;
      default:
        return children;
    }
  };

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<RegistrationPage />} />
        <Route
          path="/aptitude"
          element={
            <ProtectedRoute requiredRound="aptitude">
              <AptitudePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/coding"
          element={
            <ProtectedRoute requiredRound="coding">
              <CodingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr"
          element={
            <ProtectedRoute requiredRound="hr">
              <HRPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requiredRound="dashboard">
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

