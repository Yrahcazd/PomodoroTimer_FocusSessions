import { useState, useEffect, useCallback, useRef } from 'react';
import { playChime } from '../lib/audio';

export type PomodoroStatus = 'setup' | 'running' | 'paused';
export type Phase = 'work' | 'break';

export interface PomodoroConfig {
  workBase: number; // in minutes
  breakBase: number; // in minutes
  workRatio: number;
  breakRatio: number;
}

export function usePomodoro() {
  const [config, setConfig] = useState<PomodoroConfig>({
    workBase: 5,
    breakBase: 5,
    workRatio: 2.0,
    breakRatio: 1.5,
  });

  const [status, setStatus] = useState<PomodoroStatus>('setup');
  const [phase, setPhase] = useState<Phase>('work');
  const [cycle, setCycle] = useState(1);
  
  // Time remaining in seconds
  const [timeRemaining, setTimeRemaining] = useState(0);
  
  // To avoid drift, we track the exact end time
  const endTimeRef = useRef<number | null>(null);

  // Calculates duration in seconds for a specific cycle and phase
  const getDuration = useCallback((ph: Phase, c: number, conf: PomodoroConfig): number => {
    const base = ph === 'work' ? conf.workBase : conf.breakBase;
    const ratio = ph === 'work' ? conf.workRatio : conf.breakRatio;
    // Calculate new time and round to nearest second
    return Math.round(base * 60 * Math.pow(ratio, c - 1));
  }, []);

  // Format MM:SS, handles hours if > 60m
  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const totalCurrentDuration = getDuration(phase, cycle, config);

  // Main timer tick
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    if (status === 'running') {
      intervalId = setInterval(() => {
        if (!endTimeRef.current) return;
        
        const now = Date.now();
        const remaining = Math.max(0, Math.ceil((endTimeRef.current - now) / 1000));
        
        setTimeRemaining(remaining);

        if (remaining <= 0) {
          handlePhaseComplete();
        }
      }, 100); // Check frequently for smooth UI and accurate triggers
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [status, phase, cycle, config]); // Re-bind when state changes to avoid stale closures inside handlePhaseComplete

  const handlePhaseComplete = useCallback(() => {
    let nextPhase: Phase;
    let nextCycle = cycle;

    if (phase === 'work') {
      nextPhase = 'break';
      playChime('break');
    } else {
      nextPhase = 'work';
      nextCycle += 1;
      playChime('work');
    }

    const nextDuration = getDuration(nextPhase, nextCycle, config);
    
    setPhase(nextPhase);
    setCycle(nextCycle);
    setTimeRemaining(nextDuration);
    endTimeRef.current = Date.now() + nextDuration * 1000;
  }, [phase, cycle, config, getDuration]);

  // Update document title
  useEffect(() => {
    if (status === 'setup') {
      document.title = 'Pomodoro Timer';
    } else {
      const icon = phase === 'work' ? '🔴' : '🔵';
      const label = phase === 'work' ? 'TRAVAIL' : 'PAUSE';
      document.title = `${icon} ${formatTime(timeRemaining)} - ${label}`;
    }
  }, [timeRemaining, phase, status]);

  const start = useCallback(() => {
    if (status === 'setup') {
      // First start
      const duration = getDuration('work', 1, config);
      setTimeRemaining(duration);
      endTimeRef.current = Date.now() + duration * 1000;
      setPhase('work');
      setCycle(1);
    } else if (status === 'paused') {
      // Resume
      endTimeRef.current = Date.now() + timeRemaining * 1000;
    }
    
    // Initialize audio context on first user interaction
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContext) {
       const ctx = new AudioContext();
       if (ctx.state === 'suspended') ctx.resume();
    }

    setStatus('running');
  }, [status, timeRemaining, config, getDuration]);

  const pause = useCallback(() => {
    setStatus('paused');
    endTimeRef.current = null;
  }, []);

  const reset = useCallback(() => {
    setStatus('setup');
    setPhase('work');
    setCycle(1);
    setTimeRemaining(0);
    endTimeRef.current = null;
  }, []);

  const skip = useCallback(() => {
    handlePhaseComplete();
  }, [handlePhaseComplete]);

  return {
    status,
    phase,
    cycle,
    timeRemaining,
    totalCurrentDuration,
    config,
    setConfig,
    start,
    pause,
    reset,
    skip,
    formatTime,
    getDuration,
  };
}
