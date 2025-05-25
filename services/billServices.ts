import { MaterialIcons, MaterialCommunityIcons, FontAwesome, FontAwesome5, Ionicons, Entypo, Foundation, Feather } from '@expo/vector-icons';

export const getIconForBill = (billName: string) => {
  const name = billName.toLowerCase();
  
  // Credit card payments first (more specific)
  if (name.includes('credit card') || name.includes('card payment')) return { icon: MaterialIcons, name: 'credit-card' };
  
  // Vehicle related checks
  if (name.includes('vehicle insurance')) return { icon: MaterialCommunityIcons, name: 'car-insurance' };
  if (name.includes('electric car') || name.includes('ev charging')) return { icon: MaterialCommunityIcons, name: 'car-electric' };
  if (name.includes('car') || name.includes('auto') || name.includes('vehicle')) return { icon: MaterialCommunityIcons, name: 'car' };
  
  // More specific insurance types
  if (name.includes('travel insurance')) return { icon: MaterialIcons, name: 'flight-takeoff' };
  if (name.includes('health insurance')) return { icon: MaterialIcons, name: 'favorite' };
  
  // Specific subscription types
  if (name.includes('magazine subscription') || name.includes('book club')) return { icon: MaterialCommunityIcons, name: 'book-open-variant' };
  if (name.includes('newspaper') || name.includes('news subscription')) return { icon: MaterialCommunityIcons, name: 'newspaper' };
  if (name.includes('service fee') || name.includes('subscription fee')) return { icon: MaterialIcons, name: 'description' };
  
  // Storage types
  if (name.includes('cloud') || name.includes('icloud')) return { icon: MaterialIcons, name: 'cloud' };
  if (name.includes('storage rental')) return { icon: MaterialIcons, name: 'storage' };
  
  // Education
  if (name.includes('education') || name.includes('school') || name.includes('tuition')) return { icon: MaterialIcons, name: 'school' };
  
  // Continue with the other patterns
  if (name.includes('wifi') || name.includes('internet')) return { icon: MaterialIcons, name: 'wifi' };
  if (name.includes('rent') || name.includes('mortgage')) return { icon: MaterialIcons, name: 'home' };
  if (name.includes('netflix') || name.includes('hulu') || name.includes('stream') || 
      name.includes('cable') || name.includes('satellite')) return { icon: MaterialIcons, name: 'tv' };
  if (name.includes('shopping') || name.includes('amazon') || name.includes('store')) return { icon: MaterialIcons, name: 'shopping-bag' };
  if (name.includes('electric') || name.includes('power') || name.includes('energy')) return { icon: MaterialIcons, name: 'bolt' };
  if (name.includes('water') || name.includes('aqua') || 
      name.includes('water heater') || name.includes('boiler')) return { icon: MaterialCommunityIcons, name: 'water' };
  if (name.includes('gas') || name.includes('propane')) return { icon: MaterialCommunityIcons, name: 'gas-cylinder' };
  if (name.includes('phone') || name.includes('cellular') || name.includes('mobile')) return { icon: MaterialIcons, name: 'phone' };
  if (name.includes('insurance') || name.includes('vpn')) return { icon: MaterialIcons, name: 'security' };
  if (name.includes('gym') || name.includes('fitness') || name.includes('workout')) return { icon: MaterialIcons, name: 'fitness-center' };
  if (name.includes('loan') || name.includes('debt')) return { icon: MaterialIcons, name: 'attach-money' };
  if (name.includes('subscription') || name.includes('membership')) return { icon: MaterialIcons, name: 'event' };
  if (name.includes('maintenance') || name.includes('repair')) return { icon: MaterialIcons, name: 'build' };
  if (name.includes('waste') || name.includes('garbage') || name.includes('trash')) return { icon: MaterialIcons, name: 'delete' };
  if (name.includes('security') || name.includes('alarm')) return { icon: MaterialIcons, name: 'lock' };
  if (name.includes('health') || name.includes('medical')) return { icon: MaterialIcons, name: 'local-hospital' };
  if (name.includes('travel') || name.includes('transport')) return { icon: MaterialIcons, name: 'flight' };
  if (name.includes('food') || name.includes('meal')) return { icon: MaterialIcons, name: 'restaurant' };
  if (name.includes('tax')) return { icon: MaterialIcons, name: 'percent' };
  
  return { icon: MaterialIcons, name: 'credit-card' };
};

export const getOrdinalSuffix = (day: number): string => {
  if (day >= 11 && day <= 13) {
    return 'th';
  }
  switch (day % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
};

export const getAmountColor = (amount: number) => {
  if (amount >= 100) {
    return '#8B0000'; // Dark red for highest bills
  } else if (amount >= 50) {
    return '#CC0000'; // Medium red for middle-range bills
  } else if (amount === 0) {
    return '#FFCCCB'; // Very light red for zero-amount bills
  } else {
    return '#FF6B6B'; // Light red for lower bills
  }
};
