import React, { useState, useEffect } from 'react';
import { Wifi, Battery, Signal } from 'lucide-react';

export const MobileStatusBar: React.FC = () => {
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-8 px-6 flex items-center justify-between text-[11px] font-semibold text-slate-700 dark:text-slate-300 select-none bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800/60 z-30">
      <span className="font-mono tabular-nums">{time || '09:41'}</span>
      <div className="flex items-center gap-2">
        <Signal className="w-3 h-3" />
        <Wifi className="w-3 h-3" />
        <div className="flex items-center gap-1">
          <span className="text-[10px] tabular-nums">98%</span>
          <Battery className="w-3.5 h-3.5 fill-current" />
        </div>
      </div>
    </div>
  );
};
