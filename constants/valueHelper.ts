// valueHelper.ts

export const getValueColor = (valueType: string, value: string | number, primaryColor: string): string => {
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;

  switch (valueType) {
    case 'temperature':
      if (numericValue >= 116) return '#8B0000'; // Dark Red
      if (numericValue >= 107) return '#B22222'; // Fire Brick Red
      if (numericValue >= 99) return '#DC143C';  // Crimson
      if (numericValue >= 90) return '#FF4500';  // Dark Orange
      if (numericValue >= 82) return '#FF6347';  // Tomato
      if (numericValue >= 73) return '#FFA500';  // Light Orange
      if (numericValue >= 64) return '#FFD700';  // Yellow
      if (numericValue >= 56) return '#98FB98';  // Pale Green
      if (numericValue >= 48) return '#87CEEB';  // Sky Blue
      if (numericValue >= 40) return '#4169E1';  // Royal Blue
      if (numericValue >= 32) return '#0000FF';  // Blue
      if (numericValue >= 24) return '#00BFFF';  // Deep Sky Blue
      if (numericValue >= 16) return '#1E90FF';  // Dodger Blue
      if (numericValue >= 8) return '#00CED1';   // Dark Turquoise
      if (numericValue >= 0) return '#00FFFF';   // Cyan
      if (numericValue >= -8) return '#E0FFFF';  // Light Cyan
      if (numericValue >= -16) return '#F0FFFF'; // Azure
      return 'white';
    case 'wifi':
      if (numericValue > 100) return '#2E7D32';  // Dark Green
      if (numericValue >= 40) return '#FFFF00';  // Yellow
      if (numericValue >= 10) return '#FFA500';  // Orange
      return '#FF0000';                          // Red
    case 'portfolio':
      return '#2E7D32';                          // Dark Green
    case 'time':
      return '#C0C0C0';  // Light gray that's visible on dark background
    default:
      return 'white';
  }
};
