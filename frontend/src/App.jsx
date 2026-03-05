import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Menu, Home, User, Bell, Apple } from 'lucide-react';
import UserForm from './components/UserForm';
import ModernDashboard from './components/ModernDashboard';
import TrackDiet from './components/TrackDiet';
import Auth from './components/Auth';
import HealthTrackers from './components/HealthTrackers';
import JustCurious from './components/JustCurious';
import About from './components/About';
import AIAssistant from './components/AIAssistant';
import { Activity, Search, Info, MessageSquare } from 'lucide-react';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  // Initialize macros data from localStorage if available, else default
  const [macrosData, setMacrosData] = useState(() => {
    try {
      const saved = localStorage.getItem('userMacros');
      return saved ? JSON.parse(saved) : {
        targetCalories: 2000,
        macros: { protein: 120, carbs: 220, fat: 65 },
        bmr: 1650,
        tdee: 2000
      };
    } catch (e) {
      console.error("Error parsing userMacros", e);
      return {
        targetCalories: 2000,
        macros: { protein: 120, carbs: 220, fat: 65 },
        bmr: 1650,
        tdee: 2000
      };
    }
  });
  const [mealPlan, setMealPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [user, setUser] = useState(null);

  // Load user from session if available
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('supabaseUser');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.error("Error parsing supabaseUser", e);
      localStorage.removeItem('supabaseUser');
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('supabaseUser', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('supabaseUser');
  };

  useEffect(() => {
    // Fetch an initial meal plan so the home page isn't empty
    axios.get('http://localhost:5000/mealplan')
      .then(res => setMealPlan(res.data))
      .catch(err => {
        console.error("Could not fetch default meal plan", err);
        setMealPlan({ breakfast: {}, lunch: {}, dinner: {} }); // Fallback
      });
  }, []);

  const handleCalculate = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      // 1. Calculate macros
      const calcResponse = await axios.post('http://localhost:5000/calculate', {
        age: parseInt(formData.age),
        gender: formData.gender,
        height: parseInt(formData.height),
        weight: parseInt(formData.weight),
        activity: formData.activity,
        goal: formData.goal
      });
      setMacrosData(calcResponse.data);
      localStorage.setItem('userMacros', JSON.stringify(calcResponse.data));

      // 2. Fetch meal plan
      const mealResponse = await axios.get('http://localhost:5000/mealplan');
      setMealPlan(mealResponse.data);

      setSuccess("Profile updated successfully! You can view your new plan on the Dashboard.");
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch data from the server. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div className="app-layout">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <Menu className="menu-icon" size={28} />
          <h2>BiteRite</h2>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${currentPage === 'home' ? 'active' : ''}`}
            onClick={() => setCurrentPage('home')}
          >
            <Home size={20} />
            <span>Dashboard</span>
          </button>

          <button
            className={`nav-item ${currentPage === 'track-diet' ? 'active' : ''}`}
            onClick={() => setCurrentPage('track-diet')}
          >
            <Apple size={20} />
            <span>Track Diet</span>
          </button>

          <button
            className={`nav-item ${currentPage === 'health' ? 'active' : ''}`}
            onClick={() => setCurrentPage('health')}
          >
            <Activity size={20} />
            <span>Health Trackers</span>
          </button>

          <button
            className={`nav-item ${currentPage === 'curious' ? 'active' : ''}`}
            onClick={() => setCurrentPage('curious')}
          >
            <Search size={20} />
            <span>Just Curious</span>
          </button>

          <button
            className={`nav-item ${currentPage === 'ai-assistant' ? 'active' : ''}`}
            onClick={() => setCurrentPage('ai-assistant')}
          >
            <MessageSquare size={20} />
            <span>AI Assistant</span>
          </button>

          <button
            className={`nav-item ${currentPage === 'about' ? 'active' : ''}`}
            onClick={() => setCurrentPage('about')}
          >
            <Info size={20} />
            <span>About Us</span>
          </button>

          <button
            className={`nav-item ${currentPage === 'profile' ? 'active' : ''}`}
            onClick={() => setCurrentPage('profile')}
          >
            <User size={20} />
            <span>My Profile</span>
          </button>
        </nav>

        <div className="sidebar-footer" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <Bell size={20} className="bell-icon" />
          <div className="user-profile-small">
            <img
              src={JSON.parse(localStorage.getItem('userProfileForm'))?.profilePic || `https://ui-avatars.com/api/?name=${user.username}&background=0D8ABC&color=fff`}
              alt="User"
              className="avatar"
              style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
            />
            <span style={{ marginLeft: '10px' }}>{user.username}</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {loading && (
          <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '2rem' }}>
            <h2>Generating your custom plan...</h2>
          </div>
        )}

        {!loading && error && (
          <div className="card" style={{ borderColor: 'var(--neon-red)', margin: '2rem' }}>
            <h2 style={{ color: 'var(--neon-red)' }}>Error</h2>
            <p>{error}</p>
          </div>
        )}

        {!loading && success && currentPage === 'profile' && (
          <div className="card" style={{ borderColor: 'var(--neon-green)', margin: '2rem 2rem 0 2rem' }}>
            <h2 style={{ color: 'var(--neon-green)' }}>Success</h2>
            <p>{success}</p>
          </div>
        )}

        {!loading && currentPage === 'home' && (
          <ModernDashboard macrosData={macrosData} mealPlan={mealPlan} user={user} />
        )}

        {!loading && currentPage === 'track-diet' && (
          <TrackDiet />
        )}

        {!loading && currentPage === 'health' && (
          <HealthTrackers user={user} />
        )}

        {!loading && currentPage === 'curious' && (
          <JustCurious />
        )}

        {!loading && currentPage === 'about' && (
          <About />
        )}

        {!loading && currentPage === 'ai-assistant' && (
          <AIAssistant />
        )}

        {!loading && currentPage === 'profile' && (
          <div className="container" style={{ maxWidth: '800px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', marginBottom: '2rem' }}>
              <h1 className="title" style={{ margin: 0, textAlign: 'left', fontSize: '2rem' }}>My Profile</h1>
              <button
                onClick={handleLogout}
                className="btn-primary"
                style={{ width: 'auto', marginTop: 0, background: 'var(--neon-red)', padding: '0.5rem 1.5rem', fontSize: '0.9rem' }}
              >
                Log Out
              </button>
            </div>

            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
              Adjust your personal information and daily caloric targets.
            </p>
            <UserForm onSubmit={handleCalculate} />

            {macrosData && macrosData.bmi && (
              <div className="glass-panel" style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(6, 182, 212, 0.05)', border: '1px solid var(--neon-cyan)' }}>
                <h3 style={{ color: 'var(--neon-cyan)', marginBottom: '1rem' }}>Your Body Mass Index (BMI)</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                  <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'white' }}>{macrosData.bmi}</div>
                  <div>
                    <div style={{ fontSize: '1.25rem', fontWeight: '600', color: macrosData.bmi < 18.5 ? 'var(--neon-orange)' : macrosData.bmi < 25 ? 'var(--neon-green)' : 'var(--neon-red)' }}>
                      {macrosData.bmi < 18.5 ? 'Underweight' : macrosData.bmi < 25 ? 'Normal weight' : macrosData.bmi < 30 ? 'Overweight' : 'Obese'}
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                      A healthy BMI range is between 18.5 and 24.9.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
