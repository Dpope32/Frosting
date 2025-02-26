import { Wifi, CreditCard, Home, Tv, ShoppingBag, Zap, Droplet, GaugeCircle, Phone, Shield, Activity, Car, DollarSign, Calendar, BookOpen, Newspaper, Cloud, Wrench, Trash, Lock, Heart, GraduationCap, PlaneTakeoff, Coffee, FileText, Percent } from '@tamagui/lucide-icons';

export const getIconForBill = (billName: string) => {
    const name = billName.toLowerCase();
    if (name.includes('wifi') || name.includes('internet')) return Wifi;
    else if (name.includes('rent') || name.includes('mortgage')) return Home;
    else if (name.includes('netflix') || name.includes('hulu') || name.includes('stream')) return Tv;
    else if (name.includes('shopping') || name.includes('amazon') || name.includes('store')) return ShoppingBag;
    else if (name.includes('electric') || name.includes('power') || name.includes('energy')) return Zap;
    else if (name.includes('water') || name.includes('aqua')) return Droplet;
    else if (name.includes('gas') || name.includes('propane')) return GaugeCircle;
    else if (name.includes('phone') || name.includes('cellular') || name.includes('mobile')) return Phone;
    else if (name.includes('insurance')) return Shield;
    else if (name.includes('gym') || name.includes('fitness') || name.includes('workout')) return Activity;
    else if (name.includes('car') || name.includes('auto') || name.includes('vehicle')) return Car;
    else if (name.includes('loan') || name.includes('debt')) return DollarSign;
    else if (name.includes('credit card') || name.includes('card payment')) return CreditCard;
    else if (name.includes('cable') || name.includes('satellite')) return Tv;
    else if (name.includes('subscription') || name.includes('membership')) return Calendar;
    else if (name.includes('magazine') || name.includes('book')) return BookOpen;
    else if (name.includes('newspaper') || name.includes('news')) return Newspaper;
    else if (name.includes('cloud') || name.includes('storage')) return Cloud;
    else if (name.includes('maintenance') || name.includes('repair')) return Wrench;
    else if (name.includes('waste') || name.includes('garbage') || name.includes('trash')) return Trash;
    else if (name.includes('security') || name.includes('alarm')) return Lock;
    else if (name.includes('health') || name.includes('medical')) return Heart;
    else if (name.includes('education') || name.includes('school') || name.includes('tuition')) return GraduationCap;
    else if (name.includes('travel') || name.includes('transport')) return PlaneTakeoff;
    else if (name.includes('food') || name.includes('meal')) return Coffee;
    else if (name.includes('service fee') || name.includes('subscription fee')) return FileText;
    else if (name.includes('tax')) return Percent;
    else if (name.includes('water heater') || name.includes('boiler')) return Droplet;
    else if (name.includes('vpn')) return Shield;
    else if (name.includes('ev') || name.includes('electric car')) return Car;
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
    if (amount >= 100) return '#D32F2F'; // Darker red
    if (amount >= 50) return '#FFD93D';
    return '#4ECDC4';
  };
