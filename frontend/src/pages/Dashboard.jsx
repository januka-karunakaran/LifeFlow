import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import DailyLogForm from '../components/DailyLogForm';
import LogHistory from '../components/LogHistory';
import StatCards from '../components/StatCards';
import AnalyticsCharts from '../components/AnalyticsCharts';
import GamificationPanel from '../components/GamificationPanel';
import AiInsights from '../components/AiInsights';
import UserProfile from '../components/UserProfile';
import Leaderboard from '../components/Leaderboard';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('simulator'); // 'simulator' | 'log' | 'history' | 'analytics' | 'leaderboard' | 'profile'
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Logs state shared with Analytics and History
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsError, setLogsError] = useState('');

  // Default values for the What-If Simulator
  const [formData, setFormData] = useState({
    sleep_hours: 7,
    work_hours: 8,
    screen_time: 4,
    exercise_minutes: 30,
    break_minutes: 60,
    meetings: 2,
    social_media_minutes: 45,
    mood_score: 8,
    previous_productivity: 75,
  });

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  // Manual / event-based logs fetcher
  const fetchLogs = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setLogsLoading(true);
    setLogsError('');

    try {
      const response = await axios.get('http://localhost:5000/api/logs', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          limit: 100, // Fetch up to 100 recent logs for analytics & streaks
        },
      });
      const data = response.data;
      setLogs(Array.isArray(data) ? data : (data?.logs || []));
    } catch (err) {
      setLogsError(err.response?.data?.message || 'Failed to fetch logs data.');
    } finally {
      setLogsLoading(false);
    }
  }, []);

  // Fetch logs on initial mount
  useEffect(() => {
    let ignore = false;

    const loadInitialLogs = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const response = await axios.get('http://localhost:5000/api/logs', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            limit: 100, // Fetch up to 100 recent logs for analytics & streaks
          },
        });
        if (!ignore) {
          const data = response.data;
          setLogs(Array.isArray(data) ? data : (data?.logs || []));
        }
      } catch (err) {
        if (!ignore) {
          setLogsError(err.response?.data?.message || 'Failed to fetch logs data.');
        }
      }
    };

    loadInitialLogs();

    return () => {
      ignore = true;
    };
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: Number(e.target.value) });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      // Sending data to Node.js which in turn calls Python FastAPI
      const response = await axios.post('http://localhost:5000/api/predictions', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch prediction. Is the ML service running?');
    } finally {
      setLoading(false);
    }
  };

  const handleLogAdded = () => {
    fetchLogs();
    setActiveTab('history');
  };

  // Form input configurations for clean rendering
  const inputFields = [
    { label: 'Sleep Hours', name: 'sleep_hours', step: '0.5' },
    { label: 'Work Hours', name: 'work_hours', step: '0.5' },
    { label: 'Screen Time (hrs)', name: 'screen_time', step: '0.5' },
    { label: 'Exercise (mins)', name: 'exercise_minutes', step: '5' },
    { label: 'Break (mins)', name: 'break_minutes', step: '5' },
    { label: 'Meetings Count', name: 'meetings', step: '1' },
    { label: 'Social Media (mins)', name: 'social_media_minutes', step: '5' },
    { label: 'Mood Score (1-10)', name: 'mood_score', step: '1' },
    { label: 'Previous Productivity', name: 'previous_productivity', step: '1' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-3 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 max-w-6xl mx-auto">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            LifeFlow Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-gray-600">Intelligent Routine & Productivity Optimization</p>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-4 py-2 rounded-lg font-medium transition shadow-sm text-sm self-end sm:self-auto"
        >
          Logout
        </button>
      </div>

      {/* Gamification Panel (Streak & Achievements) */}
      <GamificationPanel logs={logs} />

      {/* Navigation Tabs (Horizontal Scroll on Mobile) */}
      <div className="max-w-6xl mx-auto mb-6 sm:mb-8">
        <div className="flex overflow-x-auto whitespace-nowrap gap-2 p-1.5 bg-white rounded-xl border border-gray-200 shadow-sm scrollbar-thin scrollbar-thumb-gray-200">
          <button
            onClick={() => setActiveTab('simulator')}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition whitespace-nowrap shrink-0 ${
              activeTab === 'simulator'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <span>🤖</span>
            <span>What-If Simulator</span>
          </button>

          <button
            onClick={() => setActiveTab('log')}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition whitespace-nowrap shrink-0 ${
              activeTab === 'log'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <span>📝</span>
            <span>Log Today's Data</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition whitespace-nowrap shrink-0 ${
              activeTab === 'history'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <span>📊</span>
            <span>My History</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('analytics');
              fetchLogs();
            }}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition whitespace-nowrap shrink-0 ${
              activeTab === 'analytics'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <span>📈</span>
            <span>Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition whitespace-nowrap shrink-0 ${
              activeTab === 'leaderboard'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <span>🏆</span>
            <span>Leaderboard</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition whitespace-nowrap shrink-0 ${
              activeTab === 'profile'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <span>👤</span>
            <span>Profile</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content with Framer Motion Transition */}
      <div className="max-w-6xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            {/* Tab 1: What-If Simulator */}
            {activeTab === 'simulator' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: What-If Simulator Form */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <h2 className="text-xl font-semibold mb-4 text-gray-900">🤖 What-If Simulator</h2>
                  <p className="text-sm text-gray-600 mb-6">
                    Tweak your daily metrics to see how it affects your predicted productivity.
                  </p>

                  <form onSubmit={handlePredict} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {inputFields.map((field) => (
                      <div key={field.name}>
                        <label className="block text-xs font-medium text-gray-700 mb-1">{field.label}</label>
                        <input
                          type="number"
                          name={field.name}
                          step={field.step}
                          value={formData[field.name]}
                          onChange={handleChange}
                          className="w-full rounded-lg bg-white border border-gray-300 p-2 text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none transition"
                          required
                        />
                      </div>
                    ))}

                    <div className="md:col-span-2 lg:col-span-3 mt-4">
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-lg font-bold transition shadow-sm disabled:opacity-50"
                      >
                        {loading ? 'Running ML Models...' : 'Predict My Day'}
                      </button>
                    </div>
                  </form>
                  {error && <p className="text-red-500 mt-4 text-center text-sm">{error}</p>}
                </div>

                {/* Right Column: Prediction Results */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-center">
                  <h2 className="text-xl font-semibold mb-6 text-center text-gray-900">🤖 ML Prediction Results</h2>

                  {!result ? (
                    <div className="text-center text-gray-500 py-10">
                      Adjust your lifestyle metrics and click <strong className="text-gray-700">"Predict My Day"</strong> to run our machine learning models.
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {/* 1. Productivity Score */}
                      <div className="bg-purple-50/60 p-4 rounded-xl text-center border-l-4 border-purple-500 shadow-sm">
                        <p className="text-xs uppercase tracking-wider font-semibold text-gray-600">Predicted Productivity</p>
                        <div className="flex items-baseline justify-center gap-1 mt-1">
                          <span className="text-4xl font-extrabold text-purple-600">
                            {result.productivity_score ?? result.predicted_productivity ?? 0}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-3">
                          <div
                            className="bg-purple-600 h-1.5 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, Math.max(0, result.productivity_score ?? result.predicted_productivity ?? 0))}%` }}
                          />
                        </div>
                      </div>

                      {/* 2. Burnout Risk */}
                      <div
                        className={`p-4 rounded-xl text-center border-l-4 shadow-sm ${
                          String(result.burnout_risk).toLowerCase() === 'high'
                            ? 'bg-rose-50/60 border-rose-500'
                            : String(result.burnout_risk).toLowerCase() === 'medium'
                            ? 'bg-amber-50/60 border-amber-500'
                            : 'bg-emerald-50/60 border-emerald-500'
                        }`}
                      >
                        <p className="text-xs uppercase tracking-wider font-semibold text-gray-600">Burnout Risk</p>
                        <div className="flex items-center justify-center gap-2 mt-1">
                          <span
                            className={`text-2xl font-black px-3.5 py-1 rounded-lg inline-flex items-center gap-1.5 ${
                              String(result.burnout_risk).toLowerCase() === 'high'
                                ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                : String(result.burnout_risk).toLowerCase() === 'medium'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            <span>
                              {String(result.burnout_risk).toLowerCase() === 'high'
                                ? '⚠️'
                                : String(result.burnout_risk).toLowerCase() === 'medium'
                                ? '⚡'
                                : '🛡️'}
                            </span>
                            <span>{result.burnout_risk}</span>
                          </span>
                        </div>

                        {/* Fine-grained Burnout Probabilities breakdown */}
                        {result.burnout_probabilities && (
                          <div className="mt-3 pt-3 border-t border-gray-200 grid grid-cols-3 gap-2 text-[11px] text-gray-600">
                            <div>
                              <span>Low: </span>
                              <strong className="text-emerald-600">{result.burnout_probabilities.Low ?? 0}%</strong>
                            </div>
                            <div>
                              <span>Med: </span>
                              <strong className="text-amber-600">{result.burnout_probabilities.Medium ?? 0}%</strong>
                            </div>
                            <div>
                              <span>High: </span>
                              <strong className="text-rose-600">{result.burnout_probabilities.High ?? 0}%</strong>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 2: Daily Log Form */}
            {activeTab === 'log' && (
              <DailyLogForm onLogAdded={handleLogAdded} />
            )}

            {/* Tab 3: Log History */}
            {activeTab === 'history' && (
              <LogHistory onNavigateToLog={() => setActiveTab('log')} />
            )}

            {/* Tab 4: Analytics */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                {/* Header & Refresh */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                      <span>📈</span> Analytics & Insights
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Visualize your historical productivity trends and monitor lifestyle metrics.
                    </p>
                  </div>

                  <button
                    onClick={fetchLogs}
                    disabled={logsLoading}
                    className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition border border-gray-300 shadow-sm flex items-center gap-2 disabled:opacity-50"
                  >
                    <svg
                      className={`w-4 h-4 ${logsLoading ? 'animate-spin' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    <span>Refresh Data</span>
                  </button>
                </div>

                {/* Error Message */}
                {logsError && (
                  <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-sm text-red-600 flex items-center justify-between">
                    <span>{logsError}</span>
                    <button
                      onClick={fetchLogs}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-semibold"
                    >
                      Retry
                    </button>
                  </div>
                )}

                {/* Loading Indicator */}
                {logsLoading && logs.length === 0 ? (
                  <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
                    <div className="inline-flex items-center justify-center p-4 bg-purple-50 rounded-full mb-4">
                      <svg className="animate-spin h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                    </div>
                    <p className="text-gray-700 font-medium">Loading analytics...</p>
                  </div>
                ) : (
                  <>
                    {/* 3 Summary Cards */}
                    <StatCards logs={logs} />

                    {/* AI Insights & Recommendations */}
                    <AiInsights logs={logs} />

                    {/* 2 Responsive Recharts */}
                    <AnalyticsCharts logs={logs} />
                  </>
                )}
              </div>
            )}

            {/* Tab 5: Community Leaderboard */}
            {activeTab === 'leaderboard' && <Leaderboard />}

            {/* Tab 6: User Profile */}
            {activeTab === 'profile' && <UserProfile />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Dashboard;