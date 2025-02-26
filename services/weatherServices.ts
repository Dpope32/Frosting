export const getTemperatureColor = (temp: number, isDark: boolean): string => {
    'worklet'
    if (isDark) {
      if (temp <= 8) return '#a1a1aa'    // zinc-400
      if (temp <= 16) return '#93c5fd'   // blue-300
      if (temp <= 24) return '#60a5fa'   // blue-400
      if (temp <= 32) return '#3b82f6'   // blue-500
      if (temp <= 40) return '#eab308'   // yellow-500
      if (temp <= 48) return '#facc15'   // yellow-400
      if (temp <= 56) return '#84cc16'   // lime-500
      if (temp <= 64) return '#22c55e'   // green-500
      if (temp <= 72) return '#15803d'   // green-700
      if (temp <= 81) return '#fb923c'   // orange-400
      if (temp <= 91) return '#f97316'   // orange-500
      if (temp <= 100) return '#ef4444'  // red-500
      return '#dc2626'                    // red-600
    } else {
      if (temp <= 8) return '#18181b'    // zinc-900
      if (temp <= 16) return '#1d4ed8'   // blue-700
      if (temp <= 24) return '#2563eb'   // blue-600
      if (temp <= 32) return '#3b82f6'   // blue-500
      if (temp <= 40) return '#ca8a04'   // yellow-600
      if (temp <= 48) return '#eab308'   // yellow-500
      if (temp <= 56) return '#65a30d'   // lime-600
      if (temp <= 64) return '#16a34a'   // green-600
      if (temp <= 72) return '#15803d'   // green-700
      if (temp <= 81) return '#ea580c'   // orange-600
      if (temp <= 91) return '#c2410c'   // orange-700
      if (temp <= 100) return '#dc2626'  // red-600
      return '#b91c1c'                    // red-700
    }
  }
  