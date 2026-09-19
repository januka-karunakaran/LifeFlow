import { useRef, useState } from 'react';
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
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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
  const reportRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);

  // PDF Export handler using html2canvas and jsPDF
  const exportPDF = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);

    try {
      const element = reportRef.current;

      const canvas = await html2canvas(element, {
        scale: 2, // High resolution capture
        backgroundColor: '#1f2937', // Preserve dark theme (Tailwind bg-gray-800)
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');

      // Create PDF in landscape or portrait matching canvas orientation
      const orientation = canvas.width > canvas.height ? 'landscape' : 'portrait';
      const pdf = new jsPDF({
        orientation,
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Fit image with 10mm padding on sides
      const margin = 10;
      const availableWidth = pdfWidth - margin * 2;
      const imgHeight = (canvas.height * availableWidth) / canvas.width;

      // Center vertically if it fits nicely
      const yPosition = imgHeight < pdfHeight - margin * 2 
        ? (pdfHeight - imgHeight) / 2 
        : margin;

      pdf.addImage(imgData, 'PNG', margin, yPosition, availableWidth, Math.min(imgHeight, pdfHeight - margin * 2));
      pdf.save('LifeFlow_Report.pdf');
    } catch (err) {
      console.error('Error generating PDF report:', err);
    } finally {
      setIsExporting(false);
    }
  };

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
    <div className="space-y-4">
      {/* Top Header & Export PDF Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-md">
        <div>
          <h3 className="text-base font-semibold text-gray-200 flex items-center gap-2">
            <span>📊</span> Visual Performance Analytics
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Export high-resolution charts and performance trends as a PDF document.
          </p>
        </div>

        <button
          onClick={exportPDF}
          disabled={isExporting || logs.length === 0}
          className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 shadow-md hover:shadow-purple-600/25 shrink-0"
          title="Download full analytics report as PDF"
        >
          {isExporting ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Generating...</span>
            </>
          ) : (
            <>
              <span>📄</span>
              <span>Download PDF Report</span>
            </>
          )}
        </button>
      </div>

      {/* Captured Printable Report Container */}
      <motion.div
        ref={reportRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="p-4 sm:p-6 bg-gray-850 rounded-2xl border border-gray-700/80 shadow-xl space-y-6"
      >
        {/* Report Watermark / Title inside Canvas */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-gray-700 gap-2">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-blue-500">⚡ LifeFlow</span>
              <span className="text-gray-400 font-normal">| Productivity & Lifestyle Report</span>
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Generated on {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })} • {logs.length} entries analyzed
            </p>
          </div>
          <span className="bg-blue-500/20 text-blue-300 text-xs font-semibold px-3 py-1 rounded-full border border-blue-500/40">
            Official Analytics Export
          </span>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
        </div>
      </motion.div>
    </div>
  );
};

export default AnalyticsCharts;

