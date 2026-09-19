import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);

  // Extract logged in user ID from token
  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        if (payload?.id) {
          setCurrentUserId(payload.id);
        }
      }
    } catch {
      // Ignore decoding failure
    }
  }, []);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token missing. Please log in.');
        setLoading(false);
        return;
      }

      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/logs/leaderboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setLeaderboard(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      const serverMessage = err.response?.data?.message;
      setError(serverMessage || 'Failed to load leaderboard. Please ensure backend is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  // Medal and rank styling helper
  const getRankDetails = (rankIndex) => {
    switch (rankIndex) {
      case 0:
        return {
          rank: 1,
          medal: '🥇',
          label: 'Champion',
          containerClass:
            'bg-gradient-to-r from-yellow-950/40 via-gray-800 to-gray-800 border-yellow-500/70 shadow-[0_0_25px_rgba(234,179,8,0.18)] hover:border-yellow-400',
          badgeClass: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
          avatarRing: 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-gray-900 bg-yellow-600',
          scoreColor: 'text-yellow-400',
        };
      case 1:
        return {
          rank: 2,
          medal: '🥈',
          label: 'Runner-up',
          containerClass:
            'bg-gradient-to-r from-slate-800/60 via-gray-800 to-gray-800 border-slate-400/60 shadow-[0_0_15px_rgba(148,163,184,0.1)] hover:border-slate-300',
          badgeClass: 'bg-slate-400/20 text-slate-200 border-slate-400/50',
          avatarRing: 'ring-2 ring-slate-300 ring-offset-2 ring-offset-gray-900 bg-slate-600',
          scoreColor: 'text-slate-200',
        };
      case 2:
        return {
          rank: 3,
          medal: '🥉',
          label: '3rd Place',
          containerClass:
            'bg-gradient-to-r from-amber-950/40 via-gray-800 to-gray-800 border-amber-700/60 shadow-[0_0_15px_rgba(180,83,9,0.1)] hover:border-amber-600',
          badgeClass: 'bg-amber-600/20 text-amber-300 border-amber-600/50',
          avatarRing: 'ring-2 ring-amber-600 ring-offset-2 ring-offset-gray-900 bg-amber-700',
          scoreColor: 'text-amber-400',
        };
      default:
        return {
          rank: rankIndex + 1,
          medal: null,
          label: `Rank #${rankIndex + 1}`,
          containerClass: 'bg-gray-800 border-gray-700 hover:border-gray-600 hover:bg-gray-750/70',
          badgeClass: 'bg-gray-700 text-gray-300 border-gray-600',
          avatarRing: 'border border-gray-600 bg-gray-700',
          scoreColor: 'text-blue-400',
        };
    }
  };

  // Helper to extract initials for avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const topThree = leaderboard.slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8 max-w-5xl mx-auto"
    >
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏆</span>
            <h2 className="text-2xl font-bold text-white tracking-wide">Community Leaderboard</h2>
          </div>
          <p className="text-sm text-gray-400 mt-1">
            Top 10 most productive members ranked by average daily productivity score.
          </p>
        </div>

        <button
          onClick={fetchLeaderboard}
          disabled={loading}
          className="bg-gray-700 hover:bg-gray-600 text-gray-200 px-4 py-2 rounded-lg text-sm font-medium transition border border-gray-600 flex items-center gap-2 disabled:opacity-50 shadow-sm"
        >
          <svg
            className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
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
          <span>Refresh</span>
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-12 text-center shadow-lg">
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
          <p className="text-gray-300 font-medium">Calculating rankings...</p>
          <p className="text-xs text-gray-500 mt-1">Aggregating community productivity scores</p>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="bg-gray-800 rounded-xl border border-red-800/60 p-8 text-center shadow-lg">
          <div className="text-red-400 text-3xl mb-2">⚠️</div>
          <h3 className="text-lg font-semibold text-red-300">Unable to Load Leaderboard</h3>
          <p className="text-sm text-gray-400 mt-1 max-w-md mx-auto">{error}</p>
          <button
            onClick={fetchLeaderboard}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded text-sm font-medium transition"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && leaderboard.length === 0 && (
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-12 text-center shadow-lg">
          <div className="text-4xl mb-3">🏅</div>
          <h3 className="text-lg font-medium text-gray-200">No Leaderboard Data Yet</h3>
          <p className="text-sm text-gray-400 mt-2 max-w-md mx-auto">
            Be the first to record daily metrics and climb to the top of the LifeFlow Community Leaderboard!
          </p>
        </div>
      )}

      {/* Top 3 Podium Cards */}
      {!loading && !error && topThree.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Arrange Podium: 2nd place left, 1st place center (elevated), 3rd place right on large screens */}
          {topThree.map((user, index) => {
            const rankInfo = getRankDetails(index);
            const isUserLoggedIn = currentUserId && (user._id === currentUserId || user.userId === currentUserId);

            return (
              <motion.div
                key={user._id || index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`relative rounded-xl border p-6 flex flex-col items-center text-center transition duration-200 ${
                  rankInfo.containerClass
                } ${index === 0 ? 'md:-translate-y-2 md:shadow-xl' : ''}`}
              >
                {/* Top Medal Badge */}
                <div className="text-4xl mb-2">{rankInfo.medal}</div>

                {/* Avatar Initial */}
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg text-white shadow mb-3 ${rankInfo.avatarRing}`}
                >
                  {getInitials(user.name)}
                </div>

                {/* Name */}
                <div className="flex items-center gap-1.5 flex-wrap justify-center">
                  <h3 className="font-bold text-lg text-white truncate max-w-[180px]" title={user.name}>
                    {user.name}
                  </h3>
                  {isUserLoggedIn && (
                    <span className="bg-blue-500/30 text-blue-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-blue-500/50">
                      YOU
                    </span>
                  )}
                </div>

                <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border mt-1 ${rankInfo.badgeClass}`}>
                  {rankInfo.label}
                </span>

                {/* Avg Productivity */}
                <div className="mt-4 w-full bg-gray-900/60 rounded-lg p-3 border border-gray-700/50">
                  <span className="text-xs text-gray-400 block uppercase tracking-wider">Avg Productivity</span>
                  <span className={`text-2xl font-black mt-0.5 block ${rankInfo.scoreColor}`}>
                    {user.averageProductivity}%
                  </span>
                  <span className="text-[11px] text-gray-400 mt-1 block">
                    {user.totalLogs} {user.totalLogs === 1 ? 'day' : 'days'} tracked
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Full Ranked List Table / Cards */}
      {!loading && !error && leaderboard.length > 0 && (
        <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-lg overflow-hidden">
          <div className="p-4 bg-gray-850 border-b border-gray-700 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
              <span>📋</span> All Top Ranked Members
            </h3>
            <span className="text-xs text-gray-400">Top {leaderboard.length} users</span>
          </div>

          <div className="divide-y divide-gray-700/60">
            {leaderboard.map((user, index) => {
              const rankInfo = getRankDetails(index);
              const isUserLoggedIn = currentUserId && (user._id === currentUserId || user.userId === currentUserId);
              const score = user.averageProductivity || 0;

              return (
                <div
                  key={user._id || index}
                  className={`p-4 sm:px-6 flex items-center justify-between gap-4 transition duration-150 ${
                    index === 0
                      ? 'bg-yellow-950/20 hover:bg-yellow-950/30'
                      : 'hover:bg-gray-750/50'
                  }`}
                >
                  {/* Left: Rank & User Info */}
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    {/* Rank Indicator */}
                    <div className="w-9 h-9 shrink-0 flex items-center justify-center font-bold text-sm">
                      {rankInfo.medal ? (
                        <span className="text-2xl" title={rankInfo.label}>{rankInfo.medal}</span>
                      ) : (
                        <span className="text-gray-400 font-bold">#{rankInfo.rank}</span>
                      )}
                    </div>

                    {/* Avatar Initial */}
                    <div
                      className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-sm font-bold text-white ${rankInfo.avatarRing}`}
                    >
                      {getInitials(user.name)}
                    </div>

                    {/* Name & Log Details */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white truncate text-sm sm:text-base">
                          {user.name}
                        </span>
                        {isUserLoggedIn && (
                          <span className="bg-blue-500/30 text-blue-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-blue-500/50 shrink-0">
                            YOU
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {user.totalLogs} {user.totalLogs === 1 ? 'log' : 'logs'} recorded
                      </p>
                    </div>
                  </div>

                  {/* Right: Productivity Score & Progress Bar */}
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <span className={`text-base sm:text-lg font-bold ${rankInfo.scoreColor}`}>
                          {score}%
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide">Avg Score</p>
                    </div>

                    {/* Small Progress Bar */}
                    <div className="w-16 sm:w-24 bg-gray-700 rounded-full h-2 hidden sm:block">
                      <div
                        className={`h-2 rounded-full ${
                          index === 0
                            ? 'bg-yellow-400'
                            : index === 1
                            ? 'bg-slate-300'
                            : index === 2
                            ? 'bg-amber-500'
                            : 'bg-blue-500'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Leaderboard;
