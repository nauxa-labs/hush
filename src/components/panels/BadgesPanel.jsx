import React, { useEffect, useState } from 'react';
import { useStores, useStoreSelector } from '../../contexts/StoreContext';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';

export function BadgesPanel() {
  const { achievementStore } = useStores();
  // Subscribe to changes in unlocked badges
  const unlockedIds = useStoreSelector(achievementStore, (state) => state.unlocked);
  // Get full badge list with unlocked status
  const badges = achievementStore.getAllBadges();

  return (
    <div className="p-8 h-full overflow-y-auto custom-scrollbar">
      <h2 className="text-2xl font-bold bg-gradient-brand bg-clip-text text-transparent mb-2">
        Achievements
      </h2>
      <p className="text-text-muted text-sm mb-8">
        Unlock badges by staying focused and consistent.
      </p>

      <div className="grid grid-cols-2 gap-4">
        {badges.map((badge, idx) => (
          <BadgeCard key={badge.id} badge={badge} index={idx} />
        ))}
      </div>
    </div>
  );
}

function BadgeCard({ badge, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`relative aspect-square rounded-xl border flex flex-col items-center justify-center p-4 text-center group overflow-hidden transition-all ${badge.unlocked
          ? 'bg-white/5 border-text-gold/30 hover:bg-white/10 hover:border-text-gold/60'
          : 'bg-black/20 border-white/5 opacity-60'
        }`}
    >
      {/* Background Glow for unlocked */}
      {badge.unlocked && (
        <div className="absolute inset-0 bg-text-gold/5 blur-xl group-hover:bg-text-gold/10 transition-colors" />
      )}

      {/* Icon */}
      <div className={`text-4xl mb-3 transition-transform group-hover:scale-110 ${badge.unlocked ? '' : 'grayscale opacity-30 blur-[2px]'}`}>
        {badge.icon}
      </div>

      {/* Content */}
      <div className="z-10 relative">
        <h3 className={`font-bold text-sm mb-1 ${badge.unlocked ? 'text-text-gold' : 'text-text-muted'}`}>
          {badge.name}
        </h3>
        {badge.unlocked ? (
          <p className="text-[10px] text-text-muted leading-tight">{badge.description}</p>
        ) : (
          <div className="flex items-center justify-center gap-1 text-[10px] text-text-muted mt-2">
            <Lock size={10} />
            <span>Locked</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
