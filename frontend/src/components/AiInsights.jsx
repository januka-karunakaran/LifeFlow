const AiInsights = ({ logs = [] }) => {
  if (!logs || logs.length === 0) {
    return (
      <div className="bg-gradient-to-br from-white via-purple-50/20 to-blue-50/20 border border-purple-100 rounded-2xl p-6 shadow-sm mb-8 text-center">
        <div className="text-3xl mb-2">🤖</div>
        <h3 className="text-lg font-semibold text-gray-900">AI Recommendation Engine</h3>
        <p className="text-sm text-gray-600 mt-1 max-w-md mx-auto">
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
      tagColor: 'bg-red-50 text-red-700 border-red-200',
    });
  } else if (avgSleep >= 7.5) {
    insights.push({
      id: 'sleep',
      icon: '😴',
      title: 'Optimal Sleep Foundation',
      description: `Maintaining ${avgSleep}h average sleep supports sustained energy and steady emotional regulation throughout demanding days.`,
      tag: 'Optimal Rest',
      tagColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    });
  } else {
    insights.push({
      id: 'sleep',
      icon: '🛌',
      title: 'Steady Sleep Rhythm',
      description: `Average sleep is at ${avgSleep}h. Aiming for an extra 30 minutes could elevate morning clarity and focus.`,
      tag: 'Balanced',
      tagColor: 'bg-blue-50 text-blue-700 border-blue-200',
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
      tagColor: 'bg-purple-50 text-purple-700 border-purple-200',
    });
  } else if (avgProductivity < 60) {
    insights.push({
      id: 'productivity',
      icon: '🎯',
      title: 'Productivity Dip',
      description: `Average productivity is at ${avgProductivity}%. Try organizing work into 25-minute Pomodoro sprints and eliminate multitasking friction.`,
      tag: 'Action Needed',
      tagColor: 'bg-amber-50 text-amber-800 border-amber-200',
    });
  } else {
    insights.push({
      id: 'productivity',
      icon: '📈',
      title: 'Consistent Output',
      description: `Holding a solid ${avgProductivity}% average productivity. Pairing complex tasks with peak morning energy windows will yield maximum gains.`,
      tag: 'Consistent',
      tagColor: 'bg-blue-50 text-blue-700 border-blue-200',
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
      tagColor: 'bg-amber-50 text-amber-800 border-amber-200',
    });
  } else {
    insights.push({
      id: 'screen',
      icon: '🌿',
      title: 'Healthy Digital Boundary',
      description: `Screen time is well contained (${avgScreen}h daily average), preserving mental bandwidth for offline recovery and deep thought.`,
      tag: 'Mindful',
      tagColor: 'bg-teal-50 text-teal-700 border-teal-200',
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
      tagColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    });
  }

  return (
    <div className="bg-gradient-to-br from-white via-purple-50/30 to-blue-50/30 border border-purple-100 rounded-2xl p-6 shadow-sm mb-8 relative overflow-hidden">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-200/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-xl shadow-sm">
            🤖
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-gray-900 tracking-wide">
                AI Recommendation Engine
              </h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
                Personalized
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-0.5">
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
            className="bg-white/90 border border-gray-200 rounded-xl p-4 flex flex-col justify-between hover:border-purple-300 hover:shadow-sm transition duration-200"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xl">{item.icon}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-md border ${item.tagColor}`}>
                  {item.tag}
                </span>
              </div>
              <h4 className="text-sm font-semibold text-gray-900 mb-1.5">{item.title}</h4>
              <p className="text-xs text-gray-600 leading-relaxed">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AiInsights;
