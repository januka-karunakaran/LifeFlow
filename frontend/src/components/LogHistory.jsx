import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const LogHistory = ({ onNavigateToLog }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  // Pagination & Filtering state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Fetch logs with pagination and filters
  const fetchLogs = useCallback(async (targetPage = page, start = startDate, end = endDate, targetLimit = limit) => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token missing. Please log in.');
        setLoading(false);
        return;
      }

      const params = {
        page: targetPage,
        limit: targetLimit,
      };

      if (start) params.startDate = start;
      if (end) params.endDate = end;

      const response = await axios.get('http://localhost:5000/api/logs', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params,
      });

      // Handle structured response: { logs, totalPages, currentPage, totalLogs }
      if (response.data && Array.isArray(response.data.logs)) {
        setLogs(response.data.logs);
        setTotalPages(response.data.totalPages || 1);
        setTotalLogs(response.data.totalLogs ?? response.data.logs.length);
        if (response.data.currentPage && response.data.currentPage !== targetPage) {
          setPage(response.data.currentPage);
        }
      } else if (Array.isArray(response.data)) {
        // Fallback for flat array responses
        setLogs(response.data);
        setTotalPages(1);
        setTotalLogs(response.data.length);
      } else {
        setLogs([]);
        setTotalPages(1);
        setTotalLogs(0);
      }
    } catch (err) {
      const serverMessage = err.response?.data?.message;
      setError(serverMessage || 'Failed to fetch logs. Please ensure the backend server is running.');
    } finally {
      setLoading(false);
    }
  }, [page, startDate, endDate, limit]);

  // Trigger fetch whenever page, date filters, or limit change
  useEffect(() => {
    fetchLogs(page, startDate, endDate, limit);
  }, [fetchLogs, page, startDate, endDate, limit]);

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
    setPage(1); // Reset to page 1 on filter change
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
    setPage(1); // Reset to page 1 on filter change
  };

  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value));
    setPage(1); // Reset to page 1 on limit change
  };

  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const handleRefresh = () => {
    fetchLogs(page, startDate, endDate, limit);
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage((prev) => prev + 1);
    }
  };

  const handleDelete = async (id, date) => {
    const isConfirmed = window.confirm(`Are you sure you want to delete the log for ${date}?`);
    if (!isConfirmed) return;

    setDeletingId(id);

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/logs/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success('Log deleted');
      // If deleting the last item on a page > 1, step back one page
      if (logs.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        fetchLogs(page, startDate, endDate, limit);
      }
    } catch (err) {
      const serverMessage = err.response?.data?.message;
      toast.error(serverMessage || 'Failed to delete log.');
    } finally {
      setDeletingId(null);
    }
  };

  // Export logs to CSV utility
  const exportToCsv = () => {
    if (!logs || logs.length === 0) return;

    // Define CSV Headers
    const headers = [
      'Date',
      'Sleep Hours',
      'Work Hours',
      'Screen Time (hrs)',
      'Exercise (mins)',
      'Break (mins)',
      'Meetings Count',
      'Social Media (mins)',
      'Mood Score (1-10)',
      'Productivity Score (%)',
      'Previous Productivity (%)',
    ];

    // Format data rows
    const rows = logs.map((log) => [
      log.date || '',
      log.sleepHours ?? log.sleep_hours ?? 0,
      log.workHours ?? log.work_hours ?? 0,
      log.screenTime ?? log.screen_time ?? 0,
      log.exerciseMinutes ?? log.exercise_minutes ?? 0,
      log.breakMinutes ?? log.break_minutes ?? 0,
      log.meetings ?? 0,
      log.socialMediaMinutes ?? log.social_media_minutes ?? 0,
      log.moodScore ?? log.mood_score ?? 0,
      log.productivityScore ?? log.productivity_score ?? 0,
      log.previousProductivity ?? log.previous_productivity ?? 0,
    ]);

    // Construct CSV String with proper escaping
    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row
          .map((value) => {
            const str = String(value);
            return str.includes(',') || str.includes('"') || str.includes('\n')
              ? `"${str.replace(/"/g, '""')}"`
              : str;
          })
          .join(',')
      ),
    ].join('\r\n');

    // Create a Blob and trigger standard browser download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'lifeflow_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Compute quick summary metrics for the currently displayed logs
  const currentEntriesCount = logs.length;
  const avgSleep = currentEntriesCount
    ? (logs.reduce((acc, curr) => acc + (curr.sleepHours ?? curr.sleep_hours ?? 0), 0) / currentEntriesCount).toFixed(1)
    : 0;
  const avgMood = currentEntriesCount
    ? (logs.reduce((acc, curr) => acc + (curr.moodScore ?? curr.mood_score ?? 0), 0) / currentEntriesCount).toFixed(1)
    : 0;
  const avgProductivity = currentEntriesCount
    ? Math.round(logs.reduce((acc, curr) => acc + (curr.productivityScore ?? curr.productivity_score ?? 0), 0) / currentEntriesCount)
    : 0;

  const isFiltered = Boolean(startDate || endDate);
  const startEntryIndex = totalLogs === 0 ? 0 : (page - 1) * limit + 1;
  const endEntryIndex = Math.min(page * limit, totalLogs);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 max-w-6xl mx-auto"
    >
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-800 p-5 rounded-lg border border-gray-700 shadow-lg">
        <div>
          <h2 className="text-xl font-semibold text-gray-200 flex items-center gap-2">
            <span>📊</span> My Daily Log History
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Review your tracked lifestyle metrics and monitor your progress over time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportToCsv}
            disabled={loading || logs.length === 0}
            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-4 py-2 rounded text-sm font-medium transition flex items-center gap-2 shadow"
            title="Download current logs as CSV"
          >
            <span>📥</span>
            <span>Download CSV</span>
          </button>

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
      </div>

      {/* Date Range Filter Bar */}
      <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-300 flex items-center gap-1.5">
                <span>📅</span> Filter Date Range:
              </span>
            </div>

            {/* Start Date */}
            <div className="flex items-center gap-2">
              <label htmlFor="startDate" className="text-xs text-gray-400 font-medium whitespace-nowrap">
                From:
              </label>
              <input
                id="startDate"
                type="date"
                value={startDate}
                onChange={handleStartDateChange}
                className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3 py-1.5 focus:border-blue-500 focus:outline-none transition"
              />
            </div>

            {/* End Date */}
            <div className="flex items-center gap-2">
              <label htmlFor="endDate" className="text-xs text-gray-400 font-medium whitespace-nowrap">
                To:
              </label>
              <input
                id="endDate"
                type="date"
                value={endDate}
                onChange={handleEndDateChange}
                className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3 py-1.5 focus:border-blue-500 focus:outline-none transition"
              />
            </div>

            {/* Clear Button */}
            {isFiltered && (
              <button
                onClick={handleClearFilters}
                className="bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-600 transition flex items-center gap-1"
                title="Clear date filters"
              >
                <span>✕</span>
                <span>Reset Range</span>
              </button>
            )}
          </div>

          {/* Per Page Selector */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            <label htmlFor="limitSelector" className="text-xs text-gray-400 font-medium whitespace-nowrap">
              Show:
            </label>
            <select
              id="limitSelector"
              value={limit}
              onChange={handleLimitChange}
              className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-2.5 py-1.5 focus:border-blue-500 focus:outline-none transition"
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>
        </div>
      </div>

      {/* Overview Stat Cards */}
      {!loading && !error && totalLogs > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 shadow text-center">
            <p className="text-xs text-gray-400 uppercase tracking-wide">
              {isFiltered ? 'Matching Logs' : 'Total Logs'}
            </p>
            <p className="text-2xl font-bold text-blue-400 mt-1">{totalLogs}</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 shadow text-center">
            <p className="text-xs text-gray-400 uppercase tracking-wide">Page Avg Sleep</p>
            <p className="text-2xl font-bold text-indigo-400 mt-1">
              {avgSleep} <span className="text-xs text-gray-400 font-normal">hrs</span>
            </p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 shadow text-center">
            <p className="text-xs text-gray-400 uppercase tracking-wide">Page Avg Mood</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">
              {avgMood} <span className="text-xs text-gray-400 font-normal">/ 10</span>
            </p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 shadow text-center">
            <p className="text-xs text-gray-400 uppercase tracking-wide">Page Avg Prod.</p>
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
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
          <p className="text-gray-300 font-medium">Loading logs...</p>
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
          <h3 className="text-lg font-medium text-gray-200">
            {isFiltered ? 'No Logs Match Your Date Filter' : 'No Logs Recorded Yet'}
          </h3>
          <p className="text-sm text-gray-400 mt-2 max-w-sm mx-auto">
            {isFiltered
              ? 'Try choosing a broader date range or clear the filter to view all logs.'
              : "You haven't logged any daily metrics yet. Start recording your daily routine to see trends and productivity insights!"}
          </p>
          {isFiltered ? (
            <button
              onClick={handleClearFilters}
              className="mt-5 bg-gray-700 hover:bg-gray-600 text-white px-5 py-2 rounded font-medium transition shadow border border-gray-600 inline-flex items-center gap-2"
            >
              <span>✕</span> Clear Date Filter
            </button>
          ) : (
            onNavigateToLog && (
              <button
                onClick={onNavigateToLog}
                className="mt-5 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded font-medium transition shadow-md inline-flex items-center gap-2"
              >
                <span>➕</span> Log Today's Data
              </button>
            )
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

          {/* Pagination Controls Below Table */}
          <div className="bg-gray-850 px-5 py-4 border-t border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Range info */}
            <div className="text-sm text-gray-400">
              Showing <span className="font-semibold text-white">{startEntryIndex}</span> to{' '}
              <span className="font-semibold text-white">{endEntryIndex}</span> of{' '}
              <span className="font-semibold text-white">{totalLogs}</span> entries
            </div>

            {/* Pagination Navigation */}
            <div className="flex items-center gap-2">
              {/* Previous Button */}
              <button
                onClick={handlePrevPage}
                disabled={page <= 1 || loading}
                className="bg-gray-800 hover:bg-gray-700 text-white font-medium px-3.5 py-1.5 rounded-lg border border-gray-700 text-sm transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-sm"
              >
                <span>←</span>
                <span>Previous</span>
              </button>

              {/* Page Status Badge */}
              <div className="px-3 py-1.5 bg-gray-800 rounded-lg border border-gray-700 text-sm text-gray-300 font-medium">
                Page <span className="text-blue-400 font-bold">{page}</span> of{' '}
                <span className="text-white font-bold">{totalPages}</span>
              </div>

              {/* Next Button */}
              <button
                onClick={handleNextPage}
                disabled={page >= totalPages || totalPages === 0 || loading}
                className="bg-gray-800 hover:bg-gray-700 text-white font-medium px-3.5 py-1.5 rounded-lg border border-gray-700 text-sm transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-sm"
              >
                <span>Next</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default LogHistory;

