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
    <div className="min-h-screen bg-ink">
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/tournaments/:id" element={<TournamentDetail />} />
        <Route path="/players/:id" element={<ProtectedRoute><PlayerProfile /></ProtectedRoute>} />
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
              background: '#141414',
              color: '#E0E0E0',
              border: '1px solid #2A2A2A',
              borderRadius: '0',
              fontSize: '12px',
              fontFamily: "'Space Mono', monospace",
            },
            success: { iconTheme: { primary: '#CDFF00', secondary: '#0A0A0A' } },
            error: { iconTheme: { primary: '#FF3333', secondary: '#0A0A0A' } },
          }}
        />
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
