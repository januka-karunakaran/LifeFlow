import { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { dailyLogSchema, validateForm } from '../utils/validation';

const DailyLogForm = ({ onLogAdded }) => {
  const getTodayDateString = () => new Date().toISOString().split('T')[0];

  const initialFormState = {
    date: getTodayDateString(),
    sleep_hours: 7,
    work_hours: 8,
    screen_time: 4,
    exercise_minutes: 30,
    break_minutes: 60,
    meetings: 2,
    social_media_minutes: 45,
    mood_score: 8,
    previous_productivity: 75,
    tasks_planned: 5,
    tasks_completed: 4,
    productivity_score: 80,
  };

  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side Zod validation
    const validation = validateForm(dailyLogSchema, formData);
    if (!validation.success) {
      toast.error(validation.error);
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication token missing. Please log in again.');
        return;
      }

      // Prepare payload compatible with backend (supporting both camelCase and snake_case)
      const payload = {
        date: formData.date || getTodayDateString(),
        sleepHours: Number(formData.sleep_hours),
        workHours: Number(formData.work_hours),
        screenTime: Number(formData.screen_time),
        exerciseMinutes: Number(formData.exercise_minutes),
        breakMinutes: Number(formData.break_minutes),
        meetings: Number(formData.meetings),
        socialMediaMinutes: Number(formData.social_media_minutes),
        moodScore: Number(formData.mood_score),
        previousProductivity: Number(formData.previous_productivity),
        tasksPlanned: Number(formData.tasks_planned),
        tasksCompleted: Number(formData.tasks_completed),
        productivityScore: Number(formData.productivity_score),
        // Aliases for redundancy
        sleep_hours: Number(formData.sleep_hours),
        work_hours: Number(formData.work_hours),
        screen_time: Number(formData.screen_time),
        exercise_minutes: Number(formData.exercise_minutes),
        break_minutes: Number(formData.break_minutes),
        social_media_minutes: Number(formData.social_media_minutes),
        mood_score: Number(formData.mood_score),
        previous_productivity: Number(formData.previous_productivity),
        tasks_planned: Number(formData.tasks_planned),
        tasks_completed: Number(formData.tasks_completed),
        productivity_score: Number(formData.productivity_score),
      };

      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/logs`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success('Log saved successfully!');
      if (onLogAdded) {
        onLogAdded(response.data);
      }
    } catch (err) {
      const serverMessage = err.response?.data?.message || 'Failed to save daily log. Please check your connection.';
      toast.error(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  const inputFields = [
    { label: 'Date', name: 'date', type: 'date', step: undefined },
    { label: 'Sleep Hours', name: 'sleep_hours', type: 'number', step: '0.5', min: '0', max: '24' },
    { label: 'Work Hours', name: 'work_hours', type: 'number', step: '0.5', min: '0', max: '24' },
    { label: 'Screen Time (hrs)', name: 'screen_time', type: 'number', step: '0.5', min: '0', max: '24' },
    { label: 'Exercise (mins)', name: 'exercise_minutes', type: 'number', step: '5', min: '0' },
    { label: 'Break (mins)', name: 'break_minutes', type: 'number', step: '5', min: '0' },
    { label: 'Meetings Count', name: 'meetings', type: 'number', step: '1', min: '0' },
    { label: 'Social Media (mins)', name: 'social_media_minutes', type: 'number', step: '5', min: '0' },
    { label: 'Mood Score (1-10)', name: 'mood_score', type: 'number', step: '1', min: '1', max: '10' },
    { label: 'Previous Productivity', name: 'previous_productivity', type: 'number', step: '1', min: '0', max: '100' },
    { label: 'Tasks Planned', name: 'tasks_planned', type: 'number', step: '1', min: '0' },
    { label: 'Tasks Completed', name: 'tasks_completed', type: 'number', step: '1', min: '0' },
    { label: 'Productivity Score (%)', name: 'productivity_score', type: 'number', step: '1', min: '0', max: '100' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 max-w-4xl mx-auto"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <span>📝</span> Log Today's Data
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Record your actual metrics to track productivity, habits, and well-being over time.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {inputFields.map((field) => (
          <div key={field.name}>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {field.label}
            </label>
            <input
              type={field.type}
              name={field.name}
              step={field.step}
              min={field.min}
              max={field.max}
              value={formData[field.name]}
              onChange={handleChange}
              className="w-full rounded-lg bg-white border border-gray-300 p-2 text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none transition"
              required
            />
          </div>
        ))}

        <div className="md:col-span-2 lg:col-span-3 mt-4 flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-lg font-bold transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Saving Daily Log...</span>
              </>
            ) : (
              <span>Save Today's Log</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setFormData(initialFormState)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-3 rounded-lg font-medium transition border border-gray-200"
          >
            Reset Form
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default DailyLogForm;
