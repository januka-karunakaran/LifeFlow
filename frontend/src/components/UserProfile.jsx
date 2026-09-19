import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const UserProfile = () => {
  const [user, setUser] = useState({
    name: 'LifeFlow Member',
    email: 'user@lifeflow.app',
  });
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(null);

  // Mock form state
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    dailyReminders: true,
    weeklyReports: true,
  });

  // Fetch profile or decode token
  useEffect(() => {
    let ignore = false;

    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        // Try getting user details from backend auth/me
        const response = await axios.get('http://localhost:5000/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!ignore && response.data) {
          setUser({
            name: response.data.name || 'LifeFlow Member',
            email: response.data.email || 'user@lifeflow.app',
          });
        }
      } catch {
        // Fallback: try decoding JWT payload
        try {
          const token = localStorage.getItem('token');
          if (token && !ignore) {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(window.atob(base64));
            if (payload?.email) {
              setUser((prev) => ({ ...prev, email: payload.email }));
            }
          }
        } catch {
          // Keep default placeholder
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchUserProfile();

    return () => {
      ignore = true;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleMockSubmit = (e) => {
    e.preventDefault();
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setNotice({ type: 'error', message: 'New passwords do not match!' });
      return;
    }

    setNotice({
      type: 'success',
      message: 'Account settings and preferences updated successfully!',
    });

    setFormData((prev) => ({
      ...prev,
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }));
  };

  const getInitials = (name) => {
    if (!name) return 'LF';
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      {/* User Header Profile Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {/* Avatar Placeholder with Status Badge */}
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-purple-600 to-blue-600 flex items-center justify-center text-white text-3xl font-extrabold shadow-sm border-4 border-white">
            {getInitials(user.name)}
          </div>
          <span
            title="Active"
            className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white"
          />
        </div>

        {/* User Info */}
        <div className="text-center sm:text-left flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
            <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
            <span className="self-center sm:self-auto text-xs px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200 font-semibold">
              Pro Member
            </span>
          </div>

          <p className="text-sm text-gray-600 mb-4">{loading ? 'Loading...' : user.email}</p>

          <div className="flex flex-wrap justify-center sm:justify-start gap-3 text-xs text-gray-600">
            <div className="bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
              <span className="text-gray-500 mr-1">Status:</span>
              <span className="text-emerald-600 font-medium">Active Account</span>
            </div>
            <div className="bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
              <span className="text-gray-500 mr-1">Timezone:</span>
              <span className="text-gray-700 font-medium">Local (Browser)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Notice */}
      {notice && (
        <div
          className={`p-4 rounded-lg text-sm border flex items-center justify-between ${
            notice.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          <span>{notice.message}</span>
          <button
            type="button"
            onClick={() => setNotice(null)}
            className="text-xs font-bold px-2 hover:opacity-80"
          >
            ✕
          </button>
        </div>
      )}

      {/* Account Settings & Mock Password Form */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
          <span>⚙️</span> Account Settings
        </h3>
        <p className="text-xs text-gray-600 mb-6">
          Manage your account preferences and security options.
        </p>

        <form onSubmit={handleMockSubmit} className="space-y-6">
          {/* Email Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={user.name}
                disabled
                className="w-full rounded-lg bg-gray-50 border border-gray-300 p-2.5 text-gray-900 text-sm cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full rounded-lg bg-gray-50 border border-gray-300 p-2.5 text-gray-900 text-sm cursor-not-allowed"
              />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Change Password</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full rounded-lg bg-white border border-gray-300 p-2 text-gray-900 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full rounded-lg bg-white border border-gray-300 p-2 text-gray-900 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full rounded-lg bg-white border border-gray-300 p-2 text-gray-900 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none transition"
                />
              </div>
            </div>
          </div>

          {/* Preferences Toggles */}
          <div className="border-t border-gray-200 pt-6 space-y-3">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Notification Preferences</h4>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="dailyReminders"
                checked={formData.dailyReminders}
                onChange={handleChange}
                className="w-4 h-4 rounded text-purple-600 bg-white border-gray-300 focus:ring-purple-500 transition"
              />
              <span className="text-xs text-gray-700">
                Daily routine tracking reminders (Evening nudge)
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="weeklyReports"
                checked={formData.weeklyReports}
                onChange={handleChange}
                className="w-4 h-4 rounded text-purple-600 bg-white border-gray-300 focus:ring-purple-500 transition"
              />
              <span className="text-xs text-gray-700">
                Weekly AI productivity summary digest
              </span>
            </label>
          </div>

          <div className="border-t border-gray-200 pt-6 flex justify-end">
            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition shadow-sm"
            >
              Save Preferences
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default UserProfile;
