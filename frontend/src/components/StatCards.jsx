import { motion } from 'framer-motion';

const StatCards = ({ logs = [] }) => {
  const totalLogs = logs.length;

  // Calculate Average Productivity
  const avgProductivity = totalLogs > 0
    ? Math.round(
        logs.reduce((sum, log) => sum + Number(log.productivityScore ?? log.productivity_score ?? 0), 0) / totalLogs
      )
    : 0;

  // Calculate Highest Score This Week (last 7 days from today)
  const now = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 7);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

  const thisWeekLogs = logs.filter((log) => log.date && log.date >= sevenDaysAgoStr);
  const hasThisWeekLogs = thisWeekLogs.length > 0;
  const targetLogs = hasThisWeekLogs ? thisWeekLogs : logs;

  const highestScore = targetLogs.length > 0
    ? Math.max(...targetLogs.map((log) => Number(log.productivityScore ?? log.productivity_score ?? 0)))
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8"
    >
      {/* Card 1: Average Productivity */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:border-purple-300 hover:shadow-md transition duration-200">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-600">Average Productivity</span>
          <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg border border-purple-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-gray-900">{avgProductivity}%</span>
          <span className="text-xs text-gray-500">overall score</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5 mt-4">
          <div
            className="bg-purple-600 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, avgProductivity))}%` }}
          />
        </div>
      </div>

      {/* Card 2: Highest Score This Week */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:border-emerald-300 hover:shadow-md transition duration-200">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-600">Highest Score This Week</span>
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-emerald-600">{highestScore}%</span>
          <span className="text-xs text-emerald-600/80 font-medium">
            {hasThisWeekLogs ? 'Past 7 days' : totalLogs > 0 ? 'All-time peak' : 'No records'}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          {highestScore >= 85
            ? '🔥 Peak performance reached!'
            : highestScore > 0
            ? 'Solid consistency maintained'
            : 'Start logging to set your high score'}
        </p>
      </div>

      {/* Card 3: Total Logs */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:border-blue-300 hover:shadow-md transition duration-200">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-600">Total Logs</span>
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-gray-900">{totalLogs}</span>
          <span className="text-xs text-gray-500">logged entries</span>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          {totalLogs > 0
            ? `${totalLogs} day${totalLogs === 1 ? '' : 's'} of data tracked`
            : 'No logs recorded yet'}
        </p>
      </div>
    </motion.div>
  );
};

export default StatCards;
