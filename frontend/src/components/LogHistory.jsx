import { useState, useEffect } from 'react';
import axios from 'axios';

const LogHistory = ({ onNavigateToLog }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [actionNotice, setActionNotice] = useState(null);

  // Fetch logs on component mount
  useEffect(() => {
    let ignore = false;

    const loadInitialLogs = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          if (!ignore) {
            setError('Authentication token missing. Please log in.');
            setLoading(false);
          }
          return;
        }

        const response = await axios.get('http://localhost:5000/api/logs', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!ignore) {
          setLogs(Array.isArray(response.data) ? response.data : []);
          setLoading(false);
        }
      } catch (err) {
        if (!ignore) {
          const serverMessage = err.response?.data?.message;
          setError(serverMessage || 'Failed to fetch logs. Please ensure the backend server is running.');
          setLoading(false);
        }
      }
    };

    loadInitialLogs();

    return () => {
      ignore = true;
    };
  }, []);

  // Manual refresh handler
  const handleRefresh = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token missing. Please log in.');
        return;
      }

      const response = await axios.get('http://localhost:5000/api/logs', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setLogs(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      const serverMessage = err.response?.data?.message;
      setError(serverMessage || 'Failed to fetch logs. Please ensure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, date) => {
    const isConfirmed = window.confirm(`Are you sure you want to delete the log for ${date}?`);
    if (!isConfirmed) return;

    setDeletingId(id);
    setActionNotice(null);

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/logs/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setLogs((prevLogs) => prevLogs.filter((log) => log._id !== id));
      setActionNotice({ type: 'success', text: `Log for ${date} successfully deleted.` });
    } catch (err) {
      const serverMessage = err.response?.data?.message;
      setActionNotice({
        type: 'error',
        text: serverMessage || 'Failed to delete the log. Please try again.',
      });
    } finally {
      setDeletingId(null);
    }
  };

  // Compute quick summary metrics
  const totalEntries = logs.length;
  const avgSleep = totalEntries
    ? (logs.reduce((acc, curr) => acc + (curr.sleepHours ?? curr.sleep_hours ?? 0), 0) / totalEntries).toFixed(1)
    : 0;
  const avgMood = totalEntries
    ? (logs.reduce((acc, curr) => acc + (curr.moodScore ?? curr.mood_score ?? 0), 0) / totalEntries).toFixed(1)
    : 0;
  const avgProductivity = totalEntries
    ? Math.round(logs.reduce((acc, curr) => acc + (curr.productivityScore ?? curr.productivity_score ?? 0), 0) / totalEntries)
    : 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header & Refresh */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-800 p-5 rounded-lg border border-gray-700 shadow-lg">
        <div>
          <h2 className="text-xl font-semibold text-gray-200 flex items-center gap-2">
            <span>📊</span> My Daily Log History
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Review your tracked lifestyle metrics and monitor your progress over time.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={loading}
          className="bg-gray-700 hover:bg-gray-600 text-gray-200 px-4 py-2 rounded text-sm font-medium transition border border-gray-600 flex items-center gap-2 disabled:opacity-50"
        >
          <svg
            className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Refresh</span>
        </button>
      </div>

      {/* Action Notice / Banner */}
      {actionNotice && (
        <div
          className={`p-3 rounded text-sm border flex items-center justify-between transition ${
            actionNotice.type === 'success'
              ? 'bg-green-900/30 border-green-500/60 text-green-300'
              : 'bg-red-900/30 border-red-500/60 text-red-300'
          }`}
        >
          <span>{actionNotice.text}</span>
          <button
            type="button"
            onClick={() => setActionNotice(null)}
            className="text-xs font-bold px-2 hover:opacity-80"
          >
            ✕
          </button>
        </div>
      )}

      {/* Overview Stat Cards */}
      {!loading && !error && totalEntries > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 shadow text-center">
            <p className="text-xs text-gray-400 uppercase tracking-wide">Total Logs</p>
            <p className="text-2xl font-bold text-blue-400 mt-1">{totalEntries}</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 shadow text-center">
            <p className="text-xs text-gray-400 uppercase tracking-wide">Avg Sleep</p>
            <p className="text-2xl font-bold text-indigo-400 mt-1">{avgSleep} <span className="text-xs text-gray-400 font-normal">hrs</span></p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 shadow text-center">
            <p className="text-xs text-gray-400 uppercase tracking-wide">Avg Mood</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{avgMood} <span className="text-xs text-gray-400 font-normal">/ 10</span></p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 shadow text-center">
            <p className="text-xs text-gray-400 uppercase tracking-wide">Avg Productivity</p>
            <p className="text-2xl font-bold text-teal-400 mt-1">{avgProductivity}%</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-12 text-center shadow-lg">
          <div className="inline-flex items-center justify-center p-4 bg-gray-750 rounded-full mb-4">
            <svg className="animate-spin h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
          <p className="text-gray-300 font-medium">Loading your past logs...</p>
          <p className="text-xs text-gray-500 mt-1">Fetching records from server</p>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="bg-gray-800 rounded-lg border border-red-800/60 p-8 text-center shadow-lg">
          <div className="text-red-400 text-3xl mb-2">⚠️</div>
          <h3 className="text-lg font-semibold text-red-300">Unable to Load Logs</h3>
          <p className="text-sm text-gray-400 mt-1 max-w-md mx-auto">{error}</p>
          <button
            onClick={handleRefresh}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded text-sm font-medium transition"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && logs.length === 0 && (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-12 text-center shadow-lg">
          <div className="text-4xl mb-3">🗓️</div>
          <h3 className="text-lg font-medium text-gray-200">No Logs Recorded Yet</h3>
          <p className="text-sm text-gray-400 mt-2 max-w-sm mx-auto">
            You haven't logged any daily metrics yet. Start recording your daily routine to see trends and productivity insights!
          </p>
          {onNavigateToLog && (
            <button
              onClick={onNavigateToLog}
              className="mt-5 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded font-medium transition shadow-md inline-flex items-center gap-2"
            >
              <span>➕</span> Log Today's Data
            </button>
          )}
        </div>
      )}

      {/* Logs Table */}
      {!loading && !error && logs.length > 0 && (
        <div className="bg-gray-800 rounded-lg border border-gray-700 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-900/70 border-b border-gray-700 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Sleep</th>
                  <th className="py-3 px-4">Work</th>
                  <th className="py-3 px-4">Screen</th>
                  <th className="py-3 px-4">Exercise</th>
                  <th className="py-3 px-4">Breaks</th>
                  <th className="py-3 px-4">Mood</th>
                  <th className="py-3 px-4">Productivity</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/60 text-sm text-gray-300">
                {logs.map((log) => {
                  const mood = log.moodScore ?? log.mood_score ?? 5;
                  const moodColorClass =
                    mood >= 8
                      ? 'bg-green-900/40 text-green-300 border-green-600/40'
                      : mood >= 5
                      ? 'bg-yellow-900/40 text-yellow-300 border-yellow-600/40'
                      : 'bg-red-900/40 text-red-300 border-red-600/40';

                  const sleepHours = log.sleepHours ?? log.sleep_hours ?? 0;
                  const workHours = log.workHours ?? log.work_hours ?? 0;
                  const screenTime = log.screenTime ?? log.screen_time ?? 0;
                  const exerciseMins = log.exerciseMinutes ?? log.exercise_minutes ?? 0;
                  const breakMins = log.breakMinutes ?? log.break_minutes ?? 0;
                  const prodScore = log.productivityScore ?? log.productivity_score ?? 0;
                  const isDeleting = deletingId === log._id;

                  return (
                    <tr
                      key={log._id}
                      className="hover:bg-gray-750/50 transition duration-150"
                    >
                      {/* Date */}
                      <td className="py-3 px-4 font-medium text-white whitespace-nowrap">
                        {log.date}
                      </td>

                      {/* Sleep */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-semibold text-gray-200">{sleepHours}</span>
                        <span className="text-xs text-gray-500 ml-1">hrs</span>
                      </td>

                      {/* Work */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-semibold text-gray-200">{workHours}</span>
                        <span className="text-xs text-gray-500 ml-1">hrs</span>
                      </td>

                      {/* Screen Time */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-semibold text-gray-200">{screenTime}</span>
                        <span className="text-xs text-gray-500 ml-1">hrs</span>
                      </td>

                      {/* Exercise */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-semibold text-gray-200">{exerciseMins}</span>
                        <span className="text-xs text-gray-500 ml-1">m</span>
                      </td>

                      {/* Break */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-semibold text-gray-200">{breakMins}</span>
                        <span className="text-xs text-gray-500 ml-1">m</span>
                      </td>

                      {/* Mood Score */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${moodColorClass}`}
                        >
                          {mood} / 10
                        </span>
                      </td>

                      {/* Productivity */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-blue-400">{prodScore}%</span>
                          <div className="w-12 bg-gray-700 rounded-full h-1.5 hidden md:block">
                            <div
                              className="bg-blue-500 h-1.5 rounded-full"
                              style={{ width: `${Math.min(100, Math.max(0, prodScore))}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Delete Action */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleDelete(log._id, log.date)}
                          disabled={isDeleting}
                          title="Delete Log"
                          className="text-red-400 hover:text-red-200 bg-red-950/30 hover:bg-red-900/50 border border-red-800/60 px-3 py-1 rounded text-xs font-semibold transition duration-150 disabled:opacity-50 inline-flex items-center gap-1"
                        >
                          {isDeleting ? (
                            <>
                              <svg className="animate-spin h-3 w-3 text-red-400" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              <span>Deleting...</span>
                            </>
                          ) : (
                            <>
                              <span>🗑️</span>
                              <span>Delete</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogHistory;
