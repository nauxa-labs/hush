import React, { useMemo } from 'react';
import { useStores, useStoreSelector } from '../../contexts/StoreContext';
import { BarChart3, CheckCircle, Clock, TrendingUp, Flame } from 'lucide-react';
import { motion } from 'framer-motion';

export function StatsPanel() {
  const { statsStore } = useStores();
  const stats = useStoreSelector(statsStore, (state) => state);

  // Derive Weekly Data from history
  const weeklyData = useMemo(() => {
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const now = new Date();
    const result = [];

    // Generate last 7 days (including today)
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toDateString();
      const entry = stats?.history?.find(h => h.date === dateStr);
      result.push({
        day: days[d.getDay()],
        val: entry ? entry.minutes : 0
      });
    }
    return result;
  }, [stats]);

  if (!stats) return null;

  // Format Focus Time (e.g., 125m -> 2h 5m)
  const hours = Math.floor(stats.totalMinutes / 60);
  const minutes = stats.totalMinutes % 60;
  const focusTimeStr = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

  return (
    <div className="flex flex-col h-full bg-bg-panel text-text-main p-8 overflow-y-auto custom-scrollbar">
      <div className="text-sm font-bold text-text-muted uppercase tracking-widest mb-10 border-b border-white/5 pb-4">
        Productivity Stats
      </div>

      {/* Hero Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Total Sessions */}
        <div className="bg-black/20 p-5 rounded-2xl border border-white/5 flex flex-col items-center justify-center gap-2 group hover:border-text-gold/20 transition-colors">
          <div className="p-3 rounded-full bg-text-gold/10 text-text-gold group-hover:bg-text-gold group-hover:text-bg-deep transition-colors">
            <CheckCircle size={20} />
          </div>
          <div className="text-2xl font-light text-white">{stats.totalSessions}</div>
          <div className="text-[10px] text-text-muted uppercase tracking-wider">Sessions</div>
        </div>

        {/* Total Time */}
        <div className="bg-black/20 p-5 rounded-2xl border border-white/5 flex flex-col items-center justify-center gap-2 group hover:border-text-gold/20 transition-colors">
          <div className="p-3 rounded-full bg-blue-400/10 text-blue-400 group-hover:bg-blue-400 group-hover:text-bg-deep transition-colors">
            <Clock size={20} />
          </div>
          <div className="text-2xl font-light text-white">{focusTimeStr}</div>
          <div className="text-[10px] text-text-muted uppercase tracking-wider">Total Time</div>
        </div>
      </div>

      {/* Streak (New) */}
      <div className="bg-gradient-to-br from-red-500/10 to-transparent p-5 rounded-2xl border border-red-500/10 mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${stats.currentStreak > 0 ? 'bg-red-500 text-white' : 'bg-white/5 text-text-muted'}`}>
            <Flame size={20} fill={stats.currentStreak > 0 ? "currentColor" : "none"} />
          </div>
          <div>
            <div className="font-bold text-lg">{stats.currentStreak} Days</div>
            <div className="text-[10px] text-text-muted uppercase tracking-wider">Current Streak</div>
          </div>
        </div>
        {stats.longestStreak > 0 && (
          <div className="text-[10px] text-text-muted text-right">
            <div>Best</div>
            <div className="font-bold">{stats.longestStreak} Days</div>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="bg-black/20 p-6 rounded-2xl border border-white/5 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-xs font-bold text-text-muted/80">
            <TrendingUp size={14} /> <span>WEEKLY MINUTES</span>
          </div>
          <div className="text-[10px] text-text-muted bg-white/5 px-2 py-0.5 rounded-full">Last 7 Days</div>
        </div>

        <div className="flex items-end justify-between h-[120px] pt-4">
          {weeklyData.map((d, i) => (
            <div key={i} className="flex flex-col items-center gap-2 w-full">
              <div className="w-full px-1 h-full flex items-end">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.min(100, (d.val / 60) * 100)}%` }} // Scale roughly to 60m = 100% for visual
                  transition={{ delay: i * 0.1, duration: 0.5, ease: "backOut" }}
                  className={`w-full rounded-t-sm transition-colors relative group ${d.val > 0 ? 'bg-text-gold hover:bg-white' : 'bg-white/5'}`}
                  style={{ minHeight: d.val > 0 ? '4px' : '4px' }}
                >
                  {/* Tooltip */}
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-bg-deep text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                    {d.val} mins
                  </div>
                </motion.div>
              </div>
              <div className="text-[10px] text-text-muted font-mono">{d.day}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
