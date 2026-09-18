const AiInsights = ({ logs = [] }) => {
  if (!logs || logs.length === 0) {
    return (
      <div className="bg-gradient-to-br from-gray-800 via-gray-800 to-purple-950/20 border border-purple-500/30 rounded-xl p-6 shadow-lg mb-8 text-center">
        <div className="text-3xl mb-2">🤖</div>
        <h3 className="text-lg font-semibold text-gray-200">AI Recommendation Engine</h3>
        <p className="text-sm text-gray-400 mt-1 max-w-md mx-auto">
          No daily logs found yet. Start logging your routine to receive tailored AI insights on sleep, screen time, and productivity habits!
        </p>
      </div>
    );
  }

  // Compute aggregate averages
  const count = logs.length;
  const avgSleep = Number(
    (logs.reduce((sum, l) => sum + Number(l.sleepHours ?? l.sleep_hours ?? 0), 0) / count).toFixed(1)
  );
  const avgScreen = Number(
    (logs.reduce((sum, l) => sum + Number(l.screenTime ?? l.screen_time ?? 0), 0) / count).toFixed(1)
  );
  const avgProductivity = Math.round(
    logs.reduce(
      (sum, l) => sum + Number(l.productivityScore ?? l.productivity_score ?? l.predicted_productivity ?? 0),
      0
    ) / count
  );
  const avgExercise = Math.round(
    logs.reduce((sum, l) => sum + Number(l.exerciseMinutes ?? l.exercise_minutes ?? 0), 0) / count
  );

  // Generate dynamic contextual insights
  const insights = [];

  // 1. Sleep Insight
  if (avgSleep < 6) {
    insights.push({
      id: 'sleep',
      icon: '🌙',
      title: 'Prioritize Rest & Recovery',
      description: `Your average sleep (${avgSleep}h) is below recommended levels. Consistent sleep deprivation directly limits cognitive resilience and daily focus.`,
      tag: 'Rest Deficit',
      tagColor: 'bg-red-500/20 text-red-300 border-red-500/40',
    });
  } else if (avgSleep >= 7.5) {
    insights.push({
      id: 'sleep',
      icon: '😴',
      title: 'Optimal Sleep Foundation',
      description: `Maintaining ${avgSleep}h average sleep supports sustained energy and steady emotional regulation throughout demanding days.`,
      tag: 'Optimal Rest',
      tagColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    });
  } else {
    insights.push({
      id: 'sleep',
      icon: '🛌',
      title: 'Steady Sleep Rhythm',
      description: `Average sleep is at ${avgSleep}h. Aiming for an extra 30 minutes could elevate morning clarity and focus.`,
      tag: 'Balanced',
      tagColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    });
  }

  // 2. Productivity Insight
  if (avgProductivity >= 80) {
    insights.push({
      id: 'productivity',
      icon: '🚀',
      title: 'Peak Momentum',
      description: `Great momentum! Your average productivity is at a stellar ${avgProductivity}%. Keep up your current time-blocking and break routines.`,
      tag: 'High Performer',
      tagColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    });
  } else if (avgProductivity < 60) {
    insights.push({
      id: 'productivity',
      icon: '🎯',
      title: 'Productivity Dip',
      description: `Average productivity is at ${avgProductivity}%. Try organizing work into 25-minute Pomodoro sprints and eliminate multitasking friction.`,
      tag: 'Action Needed',
      tagColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
    });
  } else {
    insights.push({
      id: 'productivity',
      icon: '📈',
      title: 'Consistent Output',
      description: `Holding a solid ${avgProductivity}% average productivity. Pairing complex tasks with peak morning energy windows will yield maximum gains.`,
      tag: 'Consistent',
      tagColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    });
  }

  // 3. Screen Time & Digital Fatigue
  if (avgScreen >= 5.5) {
    insights.push({
      id: 'screen',
      icon: '💻',
      title: 'Digital Fatigue Warning',
      description: `High screen exposure detected (${avgScreen}h daily average). Implement the 20-20-20 rule to reduce ocular fatigue and mental exhaustion.`,
      tag: 'Screen Caution',
      tagColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    });
  } else {
    insights.push({
      id: 'screen',
      icon: '🌿',
      title: 'Healthy Digital Boundary',
      description: `Screen time is well contained (${avgScreen}h daily average), preserving mental bandwidth for offline recovery and deep thought.`,
      tag: 'Mindful',
      tagColor: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
    });
  }

  // 4. Physical Activity
  if (avgExercise >= 25) {
    insights.push({
      id: 'exercise',
      icon: '🏃',
      title: 'Active Energy Boost',
      description: `Logging ${avgExercise}m daily exercise fuels endorphin release and significantly buffers stress throughout high-pressure work days.`,
      tag: 'Active Routine',
      tagColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    });
  }

  return (
    <div className="bg-gradient-to-br from-gray-800 via-gray-800 to-purple-950/30 border border-purple-500/40 rounded-xl p-6 shadow-xl mb-8 relative overflow-hidden">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-700/70">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-xl shadow-inner">
            🤖
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white tracking-wide">
                AI Recommendation Engine
              </h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                Personalized
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Automated behavioral insights derived from your {count} logged day{count === 1 ? '' : 's'}.
            </p>
          </div>
        </div>
      </div>

      {/* Insights Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {insights.map((item) => (
          <div
            key={item.id}
            className="bg-gray-900/60 border border-gray-700/70 rounded-xl p-4 flex flex-col justify-between hover:border-purple-500/40 transition duration-200"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xl">{item.icon}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-md border ${item.tagColor}`}>
                  {item.tag}
                </span>
              </div>
              <h4 className="text-sm font-semibold text-white mb-1.5">{item.title}</h4>
              <p className="text-xs text-gray-400 leading-relaxed">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AiInsights;
