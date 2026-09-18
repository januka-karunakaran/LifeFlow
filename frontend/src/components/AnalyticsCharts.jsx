import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { motion } from 'framer-motion';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 border border-gray-700 p-3 rounded-lg shadow-xl text-xs">
        <p className="font-semibold text-gray-200 mb-2 border-b border-gray-700 pb-1">{label}</p>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center justify-between gap-4 py-0.5">
            <span style={{ color: entry.color }} className="font-medium">
              {entry.name}:
            </span>
            <span className="font-bold text-white">
              {entry.value} {entry.unit || ''}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const AnalyticsCharts = ({ logs = [] }) => {
  if (!logs || logs.length === 0) {
    return (
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-12 text-center shadow-lg">
        <div className="text-4xl mb-3">📈</div>
        <h3 className="text-lg font-medium text-gray-200">No Analytics Data Available</h3>
        <p className="text-sm text-gray-400 mt-2 max-w-sm mx-auto">
          Start logging your daily metrics to view productivity trends and work vs. screen time comparisons.
        </p>
      </div>
    );
  }

  // Sort logs chronologically (oldest to newest) for left-to-right timeline charts
  const chartData = [...logs]
    .sort((a, b) => (a.date || '').localeCompare(b.date || ''))
    .map((log) => {
      const productivity = Number(
        log.productivityScore ?? log.productivity_score ?? log.predicted_productivity ?? 0
      );
      const workHours = Number(log.workHours ?? log.work_hours ?? 0);
      const screenTime = Number(log.screenTime ?? log.screen_time ?? 0);

      return {
        date: log.date || 'N/A',
        predicted_productivity: productivity,
        productivity: productivity,
        'Work Hours': workHours,
        'Screen Time': screenTime,
      };
    });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-8"
    >
      {/* Chart 1: Productivity Trend Line Chart */}
      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg flex flex-col justify-between">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-200 flex items-center gap-2">
            <span>📈</span> Productivity Trend
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Tracking your productivity score across recorded dates
          </p>
        </div>

        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
              <CartesianGrid stroke="#374151" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#9CA3AF"
                tick={{ fill: '#9CA3AF', fontSize: 11 }}
                tickLine={{ stroke: '#4B5563' }}
                dy={8}
              />
              <YAxis
                domain={[0, 100]}
                stroke="#9CA3AF"
                tick={{ fill: '#9CA3AF', fontSize: 11 }}
                tickLine={{ stroke: '#4B5563' }}
                unit="%"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: '12px', fontSize: '12px', color: '#9CA3AF' }}
              />
              <Line
                type="monotone"
                dataKey="predicted_productivity"
                name="Productivity"
                unit="%"
                stroke="#3B82F6"
                strokeWidth={3}
                dot={{ fill: '#3B82F6', stroke: '#1E40AF', strokeWidth: 2, r: 4 }}
                activeDot={{ fill: '#60A5FA', stroke: '#FFFFFF', strokeWidth: 2, r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Work Hours vs Screen Time Bar Chart */}
      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg flex flex-col justify-between">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-200 flex items-center gap-2">
            <span>⚖️</span> Work Hours vs Screen Time
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Compare active work duration against total digital screen exposure
          </p>
        </div>

        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
              <CartesianGrid stroke="#374151" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#9CA3AF"
                tick={{ fill: '#9CA3AF', fontSize: 11 }}
                tickLine={{ stroke: '#4B5563' }}
                dy={8}
              />
              <YAxis
                stroke="#9CA3AF"
                tick={{ fill: '#9CA3AF', fontSize: 11 }}
                tickLine={{ stroke: '#4B5563' }}
                unit="h"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: '12px', fontSize: '12px', color: '#9CA3AF' }}
              />
              <Bar
                dataKey="Work Hours"
                unit=" hrs"
                fill="#3B82F6"
                radius={[4, 4, 0, 0]}
                maxBarSize={35}
              />
              <Bar
                dataKey="Screen Time"
                unit=" hrs"
                fill="#8B5CF6"
                radius={[4, 4, 0, 0]}
                maxBarSize={35}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
};

export default AnalyticsCharts;
