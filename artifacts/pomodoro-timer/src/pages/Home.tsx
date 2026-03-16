import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react';
import { usePomodoro } from '../hooks/use-pomodoro';
import { Slider } from '../components/ui/slider';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Home() {
  const {
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
    getDuration
  } = usePomodoro();

  const progress = status === 'setup' ? 1 : timeRemaining / Math.max(totalCurrentDuration, 1);
  const ringColor = status === 'setup' ? 'text-primary/20' : (phase === 'work' ? 'text-primary' : 'text-secondary');

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-8 selection:bg-primary/20">
      <motion.div 
        layout
        className="w-full max-w-md bg-white/60 backdrop-blur-xl border border-black/[0.04] rounded-[2.5rem] shadow-2xl overflow-hidden relative z-10 p-6 sm:p-10"
      >
        {/* Timer Display */}
        <div className="relative flex flex-col items-center justify-center py-8">
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
            {/* Background Ring */}
            <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
              <circle
                cx="50%"
                cy="50%"
                r="48%"
                fill="none"
                className="stroke-black/5"
                strokeWidth="12"
              />
              {/* Foreground Animated Ring */}
              <motion.circle
                cx="50%"
                cy="50%"
                r="48%"
                fill="none"
                className={cn("transition-colors duration-700 ease-in-out", ringColor)}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray="301.59" /* 2 * PI * ~48 */
                initial={{ strokeDashoffset: 0 }}
                animate={{ 
                  strokeDashoffset: 301.59 * (1 - progress) 
                }}
                transition={{ duration: 0.2, ease: "linear" }}
                pathLength="1"
              />
            </svg>

            {/* Inner Content */}
            <div className="absolute flex flex-col items-center text-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={status === 'setup' ? 'setup' : phase}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className={cn(
                    "text-xs sm:text-sm font-bold tracking-[0.2em] mb-2",
                    status === 'setup' ? 'text-foreground/40' : (phase === 'work' ? 'text-primary' : 'text-secondary')
                  )}
                >
                  {status === 'setup' ? 'PRÊT' : (phase === 'work' ? 'TRAVAIL' : 'PAUSE')}
                </motion.div>
              </AnimatePresence>

              <div className="text-6xl sm:text-7xl font-light tracking-tight text-foreground tabular-nums">
                {status === 'setup' ? formatTime(config.workBase * 60) : formatTime(timeRemaining)}
              </div>

              <div className="mt-4 text-sm font-medium text-foreground/50">
                Cycle {cycle}
              </div>
            </div>
          </div>
        </div>

        {/* Controls & Settings */}
        <div className="mt-4 flex flex-col items-center gap-8">
          
          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            <AnimatePresence>
              {status !== 'setup' && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={reset}
                  className="w-12 h-12 flex items-center justify-center rounded-full bg-foreground/5 text-foreground/60 hover:bg-foreground/10 hover:text-foreground transition-colors"
                  aria-label="Réinitialiser"
                >
                  <RotateCcw className="w-5 h-5" />
                </motion.button>
              )}
            </AnimatePresence>

            <button
              onClick={status === 'running' ? pause : start}
              className={cn(
                "h-16 px-10 rounded-full flex items-center justify-center gap-3 text-white font-semibold text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300",
                status === 'running' 
                  ? "bg-foreground/80 shadow-foreground/20 hover:bg-foreground" 
                  : (phase === 'work' ? "bg-primary shadow-primary/30" : "bg-secondary shadow-secondary/30")
              )}
            >
              {status === 'running' ? (
                <>
                  <Pause className="w-6 h-6 fill-current" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-6 h-6 fill-current ml-1" />
                  <span>Démarrer</span>
                </>
              )}
            </button>

            <AnimatePresence>
              {status !== 'setup' && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={skip}
                  className="w-12 h-12 flex items-center justify-center rounded-full bg-foreground/5 text-foreground/60 hover:bg-foreground/10 hover:text-foreground transition-colors"
                  aria-label="Passer"
                >
                  <SkipForward className="w-5 h-5" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Configuration Panel (Only in Setup) */}
          <AnimatePresence mode="wait">
            {status === 'setup' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="w-full flex flex-col gap-6 pt-4 border-t border-black/5"
              >
                <Slider
                  label="Temps de travail initial (min)"
                  min={1}
                  max={30}
                  step={1}
                  value={config.workBase}
                  onChange={(v) => setConfig({ ...config, workBase: v })}
                  formatValue={(v) => `${v} min`}
                />
                <Slider
                  label="Temps de pause initial (min)"
                  min={1}
                  max={30}
                  step={1}
                  value={config.breakBase}
                  onChange={(v) => setConfig({ ...config, breakBase: v })}
                  formatValue={(v) => `${v} min`}
                />
                <Slider
                  label="Ratio de travail"
                  min={1.0}
                  max={3.0}
                  step={0.1}
                  value={config.workRatio}
                  onChange={(v) => setConfig({ ...config, workRatio: v })}
                  formatValue={(v) => `×${v.toFixed(1)}`}
                />
                <Slider
                  label="Ratio de pause"
                  min={1.0}
                  max={2.5}
                  step={0.1}
                  value={config.breakRatio}
                  onChange={(v) => setConfig({ ...config, breakRatio: v })}
                  formatValue={(v) => `×${v.toFixed(1)}`}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Upcoming Cycles Preview */}
      <AnimatePresence>
        {status !== 'setup' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="w-full max-w-md mt-6 bg-white/40 backdrop-blur-md rounded-[2rem] p-6 shadow-sm border border-black/[0.02]"
          >
            <h3 className="text-sm font-semibold text-foreground/50 uppercase tracking-wider mb-4 px-2">
              Cycles à venir
            </h3>
            <div className="flex flex-col gap-2">
              {[0, 1, 2, 3].map((offset) => {
                const c = cycle + offset;
                const workSec = getDuration('work', c, config);
                const breakSec = getDuration('break', c, config);
                
                const isCurrent = offset === 0;

                const formatMinSec = (sec: number) => {
                  const m = Math.floor(sec / 60);
                  const s = sec % 60;
                  if (s === 0) return `${m}m`;
                  return `${m}m ${s}s`;
                };

                return (
                  <div
                    key={c}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-2xl transition-colors",
                      isCurrent ? "bg-white shadow-sm ring-1 ring-black/5" : "hover:bg-white/50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                        isCurrent ? "bg-foreground text-white" : "bg-foreground/5 text-foreground/50"
                      )}>
                        {c}
                      </div>
                      <span className={cn(
                        "font-medium",
                        isCurrent ? "text-foreground" : "text-foreground/70"
                      )}>
                        Cycle {c}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1.5 text-primary/80 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/80" />
                        {formatMinSec(workSec)}
                      </span>
                      <span className="flex items-center gap-1.5 text-secondary/80 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary/80" />
                        {formatMinSec(breakSec)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
