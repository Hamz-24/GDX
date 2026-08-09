import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Dashboard from './pages/Dashboard';
import Mentor from './pages/Mentor';
import Roadmap from './pages/Roadmap';
import Tasks from './pages/Tasks';
import WeeklyReport from './pages/WeeklyReport';
import FocusConsole from './pages/FocusConsole';
import DataIntake from './pages/DataIntake';
import Blueprint from './pages/Blueprint';
import DataVault from './pages/DataVault';
import Profile from './pages/Profile';
import DailyConcept from './pages/DailyConcept';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            
            <Route path="/focus" element={<FocusConsole />} />
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/mentor" element={<Mentor />} />
              <Route path="/roadmap" element={<Roadmap />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/report" element={<WeeklyReport />} />
              <Route path="/intake" element={<DataIntake />} />
              <Route path="/blueprint" element={<Blueprint />} />
              <Route path="/vault" element={<DataVault />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/concept" element={<DailyConcept />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
