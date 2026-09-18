import { motion } from 'framer-motion';

const GamificationPanel = ({ logs = [] }) => {
  // Utility function to format Date object into YYYY-MM-DD
  const formatDateString = (dateObj) => {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Calculate current streak counting backwards from today or yesterday
  const calculateStreak = () => {
    if (!logs || logs.length === 0) return 0;

    const loggedDates = new Set(logs.map((log) => log.date).filter(Boolean));

    const today = new Date();
    const todayStr = formatDateString(today);

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = formatDateString(yesterday);

    let streak;
    const checkDate = new Date();

    if (loggedDates.has(todayStr)) {
      streak = 1;
      checkDate.setDate(today.getDate() - 1);
    } else if (loggedDates.has(yesterdayStr)) {
      streak = 1;
      checkDate.setDate(yesterday.getDate() - 1);
    } else {
      return 0;
    }

    // Count backwards day-by-day
    while (loggedDates.has(formatDateString(checkDate))) {
      streak += 1;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    return streak;
  };

  const currentStreak = calculateStreak();

  // Check if today is already logged
  const todayStr = formatDateString(new Date());
  const hasLoggedToday = logs.some((log) => log.date === todayStr);

  // Badge definitions and unlocking criteria
  const badges = [
    {
      id: 'productivity_ninja',
      name: 'Productivity Ninja',
      icon: '🥷',
      description: 'Scored over 85% productivity on any recorded day',
      isUnlocked: logs.some(
        (log) =>
          Number(log.productivityScore ?? log.productivity_score ?? log.predicted_productivity ?? 0) > 85
      ),
      activeColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
    },
    {
      id: 'consistent_achiever',
      name: 'Consistent Achiever',
      icon: '🏆',
      description: 'Logged 5 or more total daily records',
      isUnlocked: logs.length >= 5,
      activeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/50',
    },
    {
      id: 'streak_warrior',
      name: 'Streak Warrior',
      icon: '⚡',
      description: 'Reached a 3-day continuous logging streak',
      isUnlocked: currentStreak >= 3,
      activeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/50',
    },
    {
      id: 'mindful_balancer',
      name: 'Mindful Balancer',
      icon: '🌱',
      description: 'Recorded 30+ mins exercise with 4 or fewer screen hours',
      isUnlocked: logs.some((log) => {
        const exercise = Number(log.exerciseMinutes ?? log.exercise_minutes ?? 0);
        const screen = Number(log.screenTime ?? log.screen_time ?? 0);
        return exercise >= 30 && screen > 0 && screen <= 4;
      }),
      activeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50',
    },
  ];

  const unlockedCount = badges.filter((b) => b.isUnlocked).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-gray-800 rounded-xl border border-gray-700 p-5 shadow-lg mb-8 max-w-6xl mx-auto"
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Left Section: Streak Counter */}
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-3xl shadow-inner">
            <span className={currentStreak > 0 ? 'animate-pulse' : ''}>🔥</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-wide">
                {currentStreak > 0 ? `${currentStreak} Day Streak!` : '0 Day Streak'}
              </h2>
              {currentStreak >= 3 && (
                <span className="text-xs bg-orange-500/20 text-orange-400 font-semibold px-2 py-0.5 rounded-full border border-orange-500/40">
                  On Fire!
                </span>
              )}
            </div>

            <p className="text-xs text-gray-400 mt-1">
              {hasLoggedToday
                ? "You've logged today! Keep the momentum tomorrow."
                : currentStreak > 0
                ? 'Streak active! Log today to keep your streak going.'
                : 'Log today to start your daily routine streak!'}
            </p>
          </div>
        </div>

        {/* Right Section: Badges & Achievements */}
        <div className="w-full md:w-auto flex flex-col items-start md:items-end">
          <div className="flex items-center justify-between w-full md:w-auto gap-4 mb-2.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Achievements
            </span>
            <span className="text-xs font-bold text-gray-400 bg-gray-750 px-2 py-0.5 rounded-md border border-gray-700">
              {unlockedCount} / {badges.length} Unlocked
            </span>
          </div>

          {/* Badges Chips */}
          <div className="flex flex-wrap gap-2">
            {badges.map((badge) => (
              <div
                key={badge.id}
                title={badge.description}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 cursor-default ${
                  badge.isUnlocked
                    ? `${badge.activeColor} shadow-sm`
                    : 'bg-gray-700/40 text-gray-500 border-gray-700/60 opacity-60'
                }`}
              >
                <span>{badge.isUnlocked ? badge.icon : '🔒'}</span>
                <span>{badge.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default GamificationPanel;
