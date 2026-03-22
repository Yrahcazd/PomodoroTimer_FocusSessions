import { useState, useEffect, useCallback } from 'react';

export interface RewardsState {
  sessionsCompleted: number;
  totalFocusSeconds: number;
  currentStreak: number;
  lastSessionDate: string | null;
}

const DEFAULT_REWARDS: RewardsState = {
  sessionsCompleted: 0,
  totalFocusSeconds: 0,
  currentStreak: 0,
  lastSessionDate: null,
};

const STORAGE_KEY = 'pomodoro-rewards';

export function useRewards() {
  const [rewards, setRewards] = useState<RewardsState>(DEFAULT_REWARDS);
  const [showCelebration, setShowCelebration] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setRewards(JSON.parse(stored));
      } catch {
        setRewards(DEFAULT_REWARDS);
      }
    }
  }, []);

  // Save to localStorage whenever rewards change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rewards));
  }, [rewards]);

  const completeWorkSession = useCallback((durationSeconds: number) => {
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 2000);

    setRewards((prev) => {
      const today = new Date().toISOString().split('T')[0];
      const isNewDay = prev.lastSessionDate !== today;
      
      return {
        sessionsCompleted: prev.sessionsCompleted + 1,
        totalFocusSeconds: prev.totalFocusSeconds + durationSeconds,
        currentStreak: isNewDay && prev.lastSessionDate ? prev.currentStreak + 1 : 1,
        lastSessionDate: today,
      };
    });
  }, []);

  const resetRewards = useCallback(() => {
    setRewards(DEFAULT_REWARDS);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const formatFocusTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return {
    rewards,
    showCelebration,
    completeWorkSession,
    resetRewards,
    formatFocusTime,
  };
}
