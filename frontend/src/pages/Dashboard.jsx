import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import DailyLogForm from '../components/DailyLogForm';
import LogHistory from '../components/LogHistory';
import StatCards from '../components/StatCards';
import AnalyticsCharts from '../components/AnalyticsCharts';
import GamificationPanel from '../components/GamificationPanel';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('simulator'); // 'simulator' | 'log' | 'history' | 'analytics'
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
      });
      setLogs(Array.isArray(response.data) ? response.data : []);
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
        });
        if (!ignore) {
          setLogs(Array.isArray(response.data) ? response.data : []);
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
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-500">LifeFlow Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded font-medium transition shadow"
        >
          Logout
        </button>
      </div>

      {/* Gamification Panel (Streak & Achievements) */}
      <GamificationPanel logs={logs} />

      {/* Navigation Tabs */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex flex-wrap gap-2 p-1.5 bg-gray-800 rounded-xl border border-gray-700 shadow-md">
          <button
            onClick={() => setActiveTab('simulator')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition ${
              activeTab === 'simulator'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/60'
            }`}
          >
            <span>🤖</span>
            <span>What-If Simulator</span>
          </button>

          <button
            onClick={() => setActiveTab('log')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition ${
              activeTab === 'log'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/60'
            }`}
          >
            <span>📝</span>
            <span>Log Today's Data</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition ${
              activeTab === 'history'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/60'
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
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition ${
              activeTab === 'analytics'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/60'
            }`}
          >
            <span>📈</span>
            <span>Analytics</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="max-w-6xl mx-auto">
        {/* Tab 1: What-If Simulator */}
        {activeTab === 'simulator' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: What-If Simulator Form */}
            <div className="lg:col-span-2 bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
              <h2 className="text-xl font-semibold mb-4 text-gray-200">🤖 What-If Simulator</h2>
              <p className="text-sm text-gray-400 mb-6">
                Tweak your daily metrics to see how it affects your predicted productivity.
              </p>

              <form onSubmit={handlePredict} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {inputFields.map((field) => (
                  <div key={field.name}>
                    <label className="block text-xs font-medium text-gray-400 mb-1">{field.label}</label>
                    <input
                      type="number"
                      name={field.name}
                      step={field.step}
                      value={formData[field.name]}
                      onChange={handleChange}
                      className="w-full rounded bg-gray-700 border border-gray-600 p-2 text-white focus:border-blue-500 focus:outline-none transition"
                      required
                    />
                  </div>
                ))}

                <div className="md:col-span-2 lg:col-span-3 mt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded font-bold transition disabled:opacity-50"
                  >
                    {loading ? 'Running ML Models...' : 'Predict My Day'}
                  </button>
                </div>
              </form>
              {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
            </div>

            {/* Right Column: Prediction Results */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 flex flex-col justify-center">
              <h2 className="text-xl font-semibold mb-6 text-center text-gray-200">Prediction Results</h2>

              {!result ? (
                <div className="text-center text-gray-500 py-10">
                  Run the simulator to see your results here.
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Productivity Score */}
                  <div className="bg-gray-700 p-4 rounded text-center border-l-4 border-blue-500">
                    <p className="text-sm text-gray-400">Predicted Productivity</p>
                    <p className="text-4xl font-bold text-blue-400 mt-1">{result.predicted_productivity}</p>
                  </div>

                  {/* Task Completion */}
                  <div className="bg-gray-700 p-4 rounded text-center border-l-4 border-green-500">
                    <p className="text-sm text-gray-400">Task Completion Probability</p>
                    <p className="text-4xl font-bold text-green-400 mt-1">
                      {result.task_completion_probability}%
                    </p>
                  </div>

                  {/* Disruption Risk */}
                  <div
                    className={`bg-gray-700 p-4 rounded text-center border-l-4 ${
                      result.disruption_risk === 'HIGH'
                        ? 'border-red-500'
                        : result.disruption_risk === 'MEDIUM'
                        ? 'border-yellow-500'
                        : 'border-green-500'
                    }`}
                  >
                    <p className="text-sm text-gray-400">Routine Disruption Risk</p>
                    <p
                      className={`text-3xl font-bold mt-1 ${
                        result.disruption_risk === 'HIGH'
                          ? 'text-red-400'
                          : result.disruption_risk === 'MEDIUM'
                          ? 'text-yellow-400'
                          : 'text-green-400'
                      }`}
                    >
                      {result.disruption_risk}
                    </p>
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-800 p-5 rounded-lg border border-gray-700 shadow-lg">
              <div>
                <h2 className="text-xl font-semibold text-gray-200 flex items-center gap-2">
                  <span>📈</span> Analytics & Insights
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  Visualize your historical productivity trends and monitor lifestyle metrics.
                </p>
              </div>

              <button
                onClick={fetchLogs}
                disabled={logsLoading}
                className="bg-gray-700 hover:bg-gray-600 text-gray-200 px-4 py-2 rounded text-sm font-medium transition border border-gray-600 flex items-center gap-2 disabled:opacity-50"
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
              <div className="bg-red-900/30 border border-red-500/60 p-4 rounded-lg text-sm text-red-300 flex items-center justify-between">
                <span>{logsError}</span>
                <button
                  onClick={fetchLogs}
                  className="bg-red-800 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-semibold"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Loading Indicator */}
            {logsLoading && logs.length === 0 ? (
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-12 text-center shadow-lg">
                <div className="inline-flex items-center justify-center p-4 bg-gray-750 rounded-full mb-4">
                  <svg className="animate-spin h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                </div>
                <p className="text-gray-300 font-medium">Loading analytics...</p>
              </div>
            ) : (
              <>
                {/* 3 Summary Cards */}
                <StatCards logs={logs} />

                {/* 2 Responsive Recharts */}
                <AnalyticsCharts logs={logs} />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;