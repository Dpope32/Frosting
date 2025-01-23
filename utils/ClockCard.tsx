import React, { useEffect, useState } from 'react';
import { StatusCard } from '@/components/status/StatusCard';
import { getValueColor } from '@/constants/valueHelper';
import { useUserStore } from '@/store/UserStore';

export function ClockCard() {
  const primaryColor = useUserStore(s => s.preferences.primaryColor);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric',
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <StatusCard
      label="Time"
      value={formatTime(time)}
      color="#F44336"
      valueColor={getValueColor('time', 0, primaryColor)}
    />
  );
}
