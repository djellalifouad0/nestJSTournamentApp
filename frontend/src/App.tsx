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
import { useTheme } from './hooks/useTheme';

function AppContent() {
  useWebSocket();
  return (
    <div className="min-h-screen bg-ink transition-colors duration-300">
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
  const { isDark } = useTheme();
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: isDark ? '#141414' : '#EAE6DC',
              color: isDark ? '#E0E0E0' : '#1A1814',
              border: `1px solid ${isDark ? '#2A2A2A' : '#C8C2B4'}`,
              borderRadius: '0',
              fontSize: '12px',
              fontFamily: "'Space Mono', monospace",
            },
            success: {
              iconTheme: {
                primary: isDark ? '#CDFF00' : '#8BA600',
                secondary: isDark ? '#0A0A0A' : '#F5F2EB',
              },
            },
            error: {
              iconTheme: {
                primary: isDark ? '#FF3333' : '#CC2222',
                secondary: isDark ? '#0A0A0A' : '#F5F2EB',
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
