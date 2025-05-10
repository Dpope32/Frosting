import { getIconForBill, getOrdinalSuffix, getAmountColor } from '../../services/billServices';
import {
  Wifi, CreditCard, Home, Tv, ShoppingBag, Zap, Droplet, GaugeCircle,
  Phone, Shield, Activity, Car, DollarSign, Calendar, BookOpen,
  Newspaper, Cloud, Wrench, Trash, Lock, Heart, GraduationCap,
  PlaneTakeoff, Coffee, FileText, Percent
} from '@tamagui/lucide-icons';

// Mock setup for testing icon components
jest.mock('@tamagui/lucide-icons', () => {
  const mockIcon = (name: string) => ({ displayName: name });
  return {
    Wifi: mockIcon('Wifi'),
    CreditCard: mockIcon('CreditCard'),
    Home: mockIcon('Home'),
    Tv: mockIcon('Tv'),
    ShoppingBag: mockIcon('ShoppingBag'),
    Zap: mockIcon('Zap'),
    Droplet: mockIcon('Droplet'),
    GaugeCircle: mockIcon('GaugeCircle'),
    Phone: mockIcon('Phone'),
    Shield: mockIcon('Shield'),
    Activity: mockIcon('Activity'),
    Car: mockIcon('Car'),
    DollarSign: mockIcon('DollarSign'),
    Calendar: mockIcon('Calendar'),
    BookOpen: mockIcon('BookOpen'),
    Newspaper: mockIcon('Newspaper'),
    Cloud: mockIcon('Cloud'),
    Wrench: mockIcon('Wrench'),
    Trash: mockIcon('Trash'),
    Lock: mockIcon('Lock'),
    Heart: mockIcon('Heart'),
    GraduationCap: mockIcon('GraduationCap'),
    PlaneTakeoff: mockIcon('PlaneTakeoff'),
    Coffee: mockIcon('Coffee'),
    FileText: mockIcon('FileText'),
    Percent: mockIcon('Percent'),
  };
});

describe('billServices', () => {
  describe('getIconForBill', () => {
    // Test all the icon mappings
    it('should return Wifi icon for wifi and internet bills', () => {
      expect(getIconForBill('Wifi Bill')).toBe(Wifi);
      expect(getIconForBill('internet service')).toBe(Wifi);
    });

    it('should return Home icon for rent and mortgage bills', () => {
      expect(getIconForBill('Rent')).toBe(Home);
      expect(getIconForBill('Mortgage Payment')).toBe(Home);
    });

    it('should return Tv icon for streaming services', () => {
      expect(getIconForBill('Netflix')).toBe(Tv);
      expect(getIconForBill('Hulu')).toBe(Tv);
      expect(getIconForBill('Streaming Service')).toBe(Tv);
      expect(getIconForBill('Cable')).toBe(Tv);
      expect(getIconForBill('Satellite TV')).toBe(Tv);
    });

    it('should return ShoppingBag icon for shopping services', () => {
      expect(getIconForBill('Shopping')).toBe(ShoppingBag);
      expect(getIconForBill('Amazon Prime')).toBe(ShoppingBag);
      expect(getIconForBill('Store Credit')).toBe(ShoppingBag);
    });

    it('should return Zap icon for electric bills', () => {
      expect(getIconForBill('Electric Bill')).toBe(Zap);
      expect(getIconForBill('Power Company')).toBe(Zap);
      expect(getIconForBill('Energy Bill')).toBe(Zap);
    });

    it('should return Droplet icon for water bills', () => {
      expect(getIconForBill('Water Bill')).toBe(Droplet);
      expect(getIconForBill('Aqua Services')).toBe(Droplet);
      expect(getIconForBill('Water Heater Maintenance')).toBe(Droplet);
      expect(getIconForBill('Boiler Service')).toBe(Droplet);
    });

    it('should return GaugeCircle icon for gas bills', () => {
      expect(getIconForBill('Gas Bill')).toBe(GaugeCircle);
      expect(getIconForBill('Propane Delivery')).toBe(GaugeCircle);
    });

    it('should return Phone icon for phone bills', () => {
      expect(getIconForBill('Phone Bill')).toBe(Phone);
      expect(getIconForBill('Cellular Service')).toBe(Phone);
      expect(getIconForBill('Mobile Payment')).toBe(Phone);
    });

    it('should return Shield icon for insurance and security bills', () => {
      expect(getIconForBill('Insurance')).toBe(Shield);
      expect(getIconForBill('VPN Service')).toBe(Shield);
    });

    it('should return Activity icon for fitness bills', () => {
      expect(getIconForBill('Gym Membership')).toBe(Activity);
      expect(getIconForBill('Fitness App')).toBe(Activity);
      expect(getIconForBill('Workout Subscription')).toBe(Activity);
    });

    it('should return Car icon for vehicle related bills', () => {
      expect(getIconForBill('Car Payment')).toBe(Car);
      expect(getIconForBill('Auto Loan')).toBe(Car);
      expect(getIconForBill('Vehicle Insurance')).toBe(Car);
      expect(getIconForBill('EV Charging')).toBe(Car);
      expect(getIconForBill('Electric Car Lease')).toBe(Car);
    });

    it('should return DollarSign icon for loans and debts', () => {
      expect(getIconForBill('Loan Payment')).toBe(DollarSign);
      expect(getIconForBill('Debt Consolidation')).toBe(DollarSign);
    });

    it('should return CreditCard icon for credit card payments', () => {
      expect(getIconForBill('Credit Card Payment')).toBe(CreditCard);
      expect(getIconForBill('Card Payment')).toBe(CreditCard);
    });

    it('should return Calendar icon for subscriptions', () => {
      expect(getIconForBill('Subscription')).toBe(Calendar);
      expect(getIconForBill('Membership Dues')).toBe(Calendar);
    });

    it('should return BookOpen icon for magazine and book services', () => {
      expect(getIconForBill('Magazine Subscription')).toBe(BookOpen);
      expect(getIconForBill('Book Club')).toBe(BookOpen);
    });

    it('should return Newspaper icon for news services', () => {
      expect(getIconForBill('Newspaper Delivery')).toBe(Newspaper);
      expect(getIconForBill('News Subscription')).toBe(Newspaper);
    });

    it('should return Cloud icon for storage services', () => {
      expect(getIconForBill('Cloud Storage')).toBe(Cloud);
      expect(getIconForBill('iCloud')).toBe(Cloud);
      expect(getIconForBill('Storage Rental')).toBe(Cloud);
    });

    it('should return Wrench icon for maintenance services', () => {
      expect(getIconForBill('Maintenance Fee')).toBe(Wrench);
      expect(getIconForBill('Repair Service')).toBe(Wrench);
    });

    it('should return Trash icon for waste management', () => {
      expect(getIconForBill('Waste Management')).toBe(Trash);
      expect(getIconForBill('Garbage Collection')).toBe(Trash);
      expect(getIconForBill('Trash Service')).toBe(Trash);
    });

    it('should return Lock icon for security services', () => {
      expect(getIconForBill('Security System')).toBe(Lock);
      expect(getIconForBill('Alarm Monitoring')).toBe(Lock);
    });

    it('should return Heart icon for health services', () => {
      expect(getIconForBill('Health Insurance')).toBe(Heart);
      expect(getIconForBill('Medical Bill')).toBe(Heart);
    });

    it('should return GraduationCap icon for education expenses', () => {
      expect(getIconForBill('Education Loan')).toBe(GraduationCap);
      expect(getIconForBill('School Fees')).toBe(GraduationCap);
      expect(getIconForBill('Tuition Payment')).toBe(GraduationCap);
    });

    it('should return PlaneTakeoff icon for travel expenses', () => {
      expect(getIconForBill('Travel Insurance')).toBe(PlaneTakeoff);
      expect(getIconForBill('Transport Pass')).toBe(PlaneTakeoff);
    });

    it('should return Coffee icon for food services', () => {
      expect(getIconForBill('Food Delivery')).toBe(Coffee);
      expect(getIconForBill('Meal Kit')).toBe(Coffee);
    });

    it('should return FileText icon for service fees', () => {
      expect(getIconForBill('Service Fee')).toBe(FileText);
      expect(getIconForBill('Subscription Fee')).toBe(FileText);
    });

    it('should return Percent icon for tax payments', () => {
      expect(getIconForBill('Tax Payment')).toBe(Percent);
      expect(getIconForBill('Property Tax')).toBe(Percent);
    });

    it('should return CreditCard as default icon', () => {
      expect(getIconForBill('Random Bill')).toBe(CreditCard);
      expect(getIconForBill('')).toBe(CreditCard);
    });
  });

  describe('getOrdinalSuffix', () => {
    it('should return correct suffix for numbers ending in 1 (except 11)', () => {
      expect(getOrdinalSuffix(1)).toBe('st');
      expect(getOrdinalSuffix(21)).toBe('st');
      expect(getOrdinalSuffix(31)).toBe('st');
    });

    it('should return correct suffix for numbers ending in 2 (except 12)', () => {
      expect(getOrdinalSuffix(2)).toBe('nd');
      expect(getOrdinalSuffix(22)).toBe('nd');
      expect(getOrdinalSuffix(32)).toBe('nd');
    });

    it('should return correct suffix for numbers ending in 3 (except 13)', () => {
      expect(getOrdinalSuffix(3)).toBe('rd');
      expect(getOrdinalSuffix(23)).toBe('rd');
      expect(getOrdinalSuffix(33)).toBe('rd');
    });

    it('should return "th" for all teens (11-13)', () => {
      expect(getOrdinalSuffix(11)).toBe('th');
      expect(getOrdinalSuffix(12)).toBe('th');
      expect(getOrdinalSuffix(13)).toBe('th');
    });

    it('should return "th" for all other numbers', () => {
      expect(getOrdinalSuffix(4)).toBe('th');
      expect(getOrdinalSuffix(5)).toBe('th');
      expect(getOrdinalSuffix(10)).toBe('th');
      expect(getOrdinalSuffix(14)).toBe('th');
      expect(getOrdinalSuffix(20)).toBe('th');
      expect(getOrdinalSuffix(25)).toBe('th');
      expect(getOrdinalSuffix(30)).toBe('th');
    });
  });

  describe('getAmountColor', () => {
    it('should return red for amounts >= 100', () => {
      expect(getAmountColor(100)).toBe('#8B0000');
      expect(getAmountColor(150)).toBe('#8B0000');
      expect(getAmountColor(1000)).toBe('#8B0000');
    });

    it('should return yellow for amounts >= 50 and < 100', () => {
      expect(getAmountColor(50)).toBe('#CC0000');
      expect(getAmountColor(75)).toBe('#CC0000');
      expect(getAmountColor(99)).toBe('#CC0000');
    });

    it('should return bright green for amount == 0', () => {
      expect(getAmountColor(0)).toBe('#FFCCCB');
    });

    it('should return normal green for amounts > 0 and < 50', () => {
      expect(getAmountColor(1)).toBe('#FF6B6B');
      expect(getAmountColor(25)).toBe('#FF6B6B');
      expect(getAmountColor(49)).toBe('#FF6B6B');
    });
  });
});