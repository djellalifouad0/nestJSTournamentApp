import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { TournamentDetail } from './pages/TournamentDetail';
import { PlayerProfile } from './pages/PlayerProfile';
import { Games } from './pages/Games';
import { Leaderboard } from './pages/Leaderboard';
import { useWebSocket } from './hooks/useWebSocket';

function AppContent() {
  useWebSocket();

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/tournaments/:id" element={<TournamentDetail />} />
        <Route
          path="/players/:id"
          element={
            <ProtectedRoute>
              <PlayerProfile />
            </ProtectedRoute>
          }
        />
        <Route path="/games" element={<Games />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#2a2740',
              color: '#e2e0eb',
              border: '1px solid rgba(139, 92, 246, 0.2)',
              borderRadius: '12px',
              fontSize: '14px',
            },
            success: {
              iconTheme: {
                primary: '#4ade80',
                secondary: '#2a2740',
              },
            },
            error: {
              iconTheme: {
                primary: '#f87171',
                secondary: '#2a2740',
              },
            },
          }}
        />
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
