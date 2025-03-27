import { Wifi, CreditCard, Home, Tv, ShoppingBag, Zap, Droplet, GaugeCircle, Phone, Shield, Activity, Car, DollarSign, Calendar, BookOpen, Newspaper, Cloud, Wrench, Trash, Lock, Heart, GraduationCap, PlaneTakeoff, Coffee, FileText, Percent } from '@tamagui/lucide-icons';

export const getIconForBill = (billName: string) => {
  const name = billName.toLowerCase();
  
  // Credit card payments first (more specific)
  if (name.includes('credit card') || name.includes('card payment')) return CreditCard;
  
  // Vehicle related checks
  if (name.includes('vehicle insurance')) return Car;
  if (name.includes('electric car') || name.includes('ev charging')) return Car;
  if (name.includes('car') || name.includes('auto') || name.includes('vehicle')) return Car;
  
  // More specific insurance types
  if (name.includes('travel insurance')) return PlaneTakeoff;
  if (name.includes('health insurance')) return Heart;
  
  // Specific subscription types
  if (name.includes('magazine subscription') || name.includes('book club')) return BookOpen;
  if (name.includes('newspaper') || name.includes('news subscription')) return Newspaper;
  if (name.includes('service fee') || name.includes('subscription fee')) return FileText;
  
  // Storage types
  if (name.includes('cloud') || name.includes('icloud')) return Cloud;
  if (name.includes('storage rental')) return Cloud;
  
  // Education
  if (name.includes('education') || name.includes('school') || name.includes('tuition')) return GraduationCap;
  
  // Continue with the other patterns
  if (name.includes('wifi') || name.includes('internet')) return Wifi;
  if (name.includes('rent') || name.includes('mortgage')) return Home;
  if (name.includes('netflix') || name.includes('hulu') || name.includes('stream') || 
      name.includes('cable') || name.includes('satellite')) return Tv;
  if (name.includes('shopping') || name.includes('amazon') || name.includes('store')) return ShoppingBag;
  if (name.includes('electric') || name.includes('power') || name.includes('energy')) return Zap;
  if (name.includes('water') || name.includes('aqua') || 
      name.includes('water heater') || name.includes('boiler')) return Droplet;
  if (name.includes('gas') || name.includes('propane')) return GaugeCircle;
  if (name.includes('phone') || name.includes('cellular') || name.includes('mobile')) return Phone;
  if (name.includes('insurance') || name.includes('vpn')) return Shield;
  if (name.includes('gym') || name.includes('fitness') || name.includes('workout')) return Activity;
  if (name.includes('loan') || name.includes('debt')) return DollarSign;
  if (name.includes('subscription') || name.includes('membership')) return Calendar;
  if (name.includes('maintenance') || name.includes('repair')) return Wrench;
  if (name.includes('waste') || name.includes('garbage') || name.includes('trash')) return Trash;
  if (name.includes('security') || name.includes('alarm')) return Lock;
  if (name.includes('health') || name.includes('medical')) return Heart;
  if (name.includes('travel') || name.includes('transport')) return PlaneTakeoff;
  if (name.includes('food') || name.includes('meal')) return Coffee;
  if (name.includes('tax')) return Percent;
  
  return CreditCard;
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
    if (amount >= 100) return '#ff0000'; // Darker red
    if (amount >= 50) return '#FFD93D';
    if (amount == 0) return '#5edd11';
    return '#5EEE11';
  };
