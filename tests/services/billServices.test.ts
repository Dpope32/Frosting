import { getIconForBill, getOrdinalSuffix, getAmountColor } from '../../services/billServices';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

describe('billServices', () => {
  describe('getIconForBill', () => {
    // Test all the icon mappings
    it('should return wifi icon for wifi and internet bills', () => {
      expect(getIconForBill('Wifi Bill')).toEqual({ icon: MaterialIcons, name: 'wifi' });
      expect(getIconForBill('internet service')).toEqual({ icon: MaterialIcons, name: 'wifi' });
    });

    it('should return home icon for rent and mortgage bills', () => {
      expect(getIconForBill('Rent')).toEqual({ icon: MaterialIcons, name: 'home' });
      expect(getIconForBill('Mortgage Payment')).toEqual({ icon: MaterialIcons, name: 'home' });
    });

    it('should return tv icon for streaming services', () => {
      expect(getIconForBill('Netflix')).toEqual({ icon: MaterialIcons, name: 'tv' });
      expect(getIconForBill('Hulu')).toEqual({ icon: MaterialIcons, name: 'tv' });
      expect(getIconForBill('Streaming Service')).toEqual({ icon: MaterialIcons, name: 'tv' });
      expect(getIconForBill('Cable')).toEqual({ icon: MaterialIcons, name: 'tv' });
      expect(getIconForBill('Satellite TV')).toEqual({ icon: MaterialIcons, name: 'tv' });
    });

    it('should return shopping-bag icon for shopping services', () => {
      expect(getIconForBill('Shopping')).toEqual({ icon: MaterialIcons, name: 'shopping-bag' });
      expect(getIconForBill('Amazon Prime')).toEqual({ icon: MaterialIcons, name: 'shopping-bag' });
      expect(getIconForBill('Store Credit')).toEqual({ icon: MaterialIcons, name: 'shopping-bag' });
    });

    it('should return bolt icon for electric bills', () => {
      expect(getIconForBill('Electric Bill')).toEqual({ icon: MaterialIcons, name: 'bolt' });
      expect(getIconForBill('Power Company')).toEqual({ icon: MaterialIcons, name: 'bolt' });
      expect(getIconForBill('Energy Bill')).toEqual({ icon: MaterialIcons, name: 'bolt' });
    });

    it('should return water icon for water bills', () => {
      expect(getIconForBill('Water Bill')).toEqual({ icon: MaterialCommunityIcons, name: 'water' });
      expect(getIconForBill('Aqua Services')).toEqual({ icon: MaterialCommunityIcons, name: 'water' });
      expect(getIconForBill('Water Heater Maintenance')).toEqual({ icon: MaterialCommunityIcons, name: 'water' });
      expect(getIconForBill('Boiler Service')).toEqual({ icon: MaterialCommunityIcons, name: 'water' });
    });

    it('should return gas-cylinder icon for gas bills', () => {
      expect(getIconForBill('Gas Bill')).toEqual({ icon: MaterialCommunityIcons, name: 'gas-cylinder' });
      expect(getIconForBill('Propane Delivery')).toEqual({ icon: MaterialCommunityIcons, name: 'gas-cylinder' });
    });

    it('should return phone icon for phone bills', () => {
      expect(getIconForBill('Phone Bill')).toEqual({ icon: MaterialIcons, name: 'phone' });
      expect(getIconForBill('Cellular Service')).toEqual({ icon: MaterialIcons, name: 'phone' });
      expect(getIconForBill('Mobile Payment')).toEqual({ icon: MaterialIcons, name: 'phone' });
    });

    it('should return security icon for insurance and security bills', () => {
      expect(getIconForBill('Insurance')).toEqual({ icon: MaterialIcons, name: 'security' });
      expect(getIconForBill('VPN Service')).toEqual({ icon: MaterialIcons, name: 'security' });
    });

    it('should return fitness-center icon for fitness bills', () => {
      expect(getIconForBill('Gym Membership')).toEqual({ icon: MaterialIcons, name: 'fitness-center' });
      expect(getIconForBill('Fitness App')).toEqual({ icon: MaterialIcons, name: 'fitness-center' });
      expect(getIconForBill('Workout Subscription')).toEqual({ icon: MaterialIcons, name: 'fitness-center' });
    });

    it('should return car icon for vehicle related bills', () => {
      expect(getIconForBill('Car Payment')).toEqual({ icon: MaterialCommunityIcons, name: 'car' });
      expect(getIconForBill('Auto Loan')).toEqual({ icon: MaterialCommunityIcons, name: 'car' });
      expect(getIconForBill('Vehicle Insurance')).toEqual({ icon: MaterialCommunityIcons, name: 'car-insurance' });
      expect(getIconForBill('EV Charging')).toEqual({ icon: MaterialCommunityIcons, name: 'car-electric' });
      expect(getIconForBill('Electric Car Lease')).toEqual({ icon: MaterialCommunityIcons, name: 'car-electric' });
    });

    it('should return attach-money icon for loans and debts', () => {
      expect(getIconForBill('Loan Payment')).toEqual({ icon: MaterialIcons, name: 'attach-money' });
      expect(getIconForBill('Debt Consolidation')).toEqual({ icon: MaterialIcons, name: 'attach-money' });
    });

    it('should return credit-card icon for credit card payments', () => {
      expect(getIconForBill('Credit Card Payment')).toEqual({ icon: MaterialIcons, name: 'credit-card' });
      expect(getIconForBill('Card Payment')).toEqual({ icon: MaterialIcons, name: 'credit-card' });
    });

    it('should return event icon for subscriptions', () => {
      expect(getIconForBill('Subscription')).toEqual({ icon: MaterialIcons, name: 'event' });
      expect(getIconForBill('Membership Dues')).toEqual({ icon: MaterialIcons, name: 'event' });
    });

    it('should return book-open-variant icon for magazine and book services', () => {
      expect(getIconForBill('Magazine Subscription')).toEqual({ icon: MaterialCommunityIcons, name: 'book-open-variant' });
      expect(getIconForBill('Book Club')).toEqual({ icon: MaterialCommunityIcons, name: 'book-open-variant' });
    });

    it('should return newspaper icon for news services', () => {
      expect(getIconForBill('Newspaper Delivery')).toEqual({ icon: MaterialCommunityIcons, name: 'newspaper' });
      expect(getIconForBill('News Subscription')).toEqual({ icon: MaterialCommunityIcons, name: 'newspaper' });
    });

    it('should return cloud/storage icon for storage services', () => {
      expect(getIconForBill('Cloud Storage')).toEqual({ icon: MaterialIcons, name: 'cloud' });
      expect(getIconForBill('iCloud')).toEqual({ icon: MaterialIcons, name: 'cloud' });
      expect(getIconForBill('Storage Rental')).toEqual({ icon: MaterialIcons, name: 'storage' });
    });

    it('should return build icon for maintenance services', () => {
      expect(getIconForBill('Maintenance Fee')).toEqual({ icon: MaterialIcons, name: 'build' });
      expect(getIconForBill('Repair Service')).toEqual({ icon: MaterialIcons, name: 'build' });
    });

    it('should return delete icon for waste management', () => {
      expect(getIconForBill('Waste Management')).toEqual({ icon: MaterialIcons, name: 'delete' });
      expect(getIconForBill('Garbage Collection')).toEqual({ icon: MaterialIcons, name: 'delete' });
      expect(getIconForBill('Trash Service')).toEqual({ icon: MaterialIcons, name: 'delete' });
    });

    it('should return lock icon for security services', () => {
      expect(getIconForBill('Security System')).toEqual({ icon: MaterialIcons, name: 'lock' });
      expect(getIconForBill('Alarm Monitoring')).toEqual({ icon: MaterialIcons, name: 'lock' });
    });

    it('should return favorite/local-hospital icon for health services', () => {
      expect(getIconForBill('Health Insurance')).toEqual({ icon: MaterialIcons, name: 'favorite' });
      expect(getIconForBill('Medical Bill')).toEqual({ icon: MaterialIcons, name: 'local-hospital' });
    });

    it('should return school icon for education expenses', () => {
      expect(getIconForBill('Education Loan')).toEqual({ icon: MaterialIcons, name: 'school' });
      expect(getIconForBill('School Fees')).toEqual({ icon: MaterialIcons, name: 'school' });
      expect(getIconForBill('Tuition Payment')).toEqual({ icon: MaterialIcons, name: 'school' });
    });

    it('should return flight/flight-takeoff icon for travel expenses', () => {
      expect(getIconForBill('Travel Insurance')).toEqual({ icon: MaterialIcons, name: 'flight-takeoff' });
      expect(getIconForBill('Transport Pass')).toEqual({ icon: MaterialIcons, name: 'flight' });
    });

    it('should return restaurant icon for food services', () => {
      expect(getIconForBill('Food Delivery')).toEqual({ icon: MaterialIcons, name: 'restaurant' });
      expect(getIconForBill('Meal Kit')).toEqual({ icon: MaterialIcons, name: 'restaurant' });
    });

    it('should return description icon for service fees', () => {
      expect(getIconForBill('Service Fee')).toEqual({ icon: MaterialIcons, name: 'description' });
      expect(getIconForBill('Subscription Fee')).toEqual({ icon: MaterialIcons, name: 'description' });
    });

    it('should return percent icon for tax payments', () => {
      expect(getIconForBill('Tax Payment')).toEqual({ icon: MaterialIcons, name: 'percent' });
      expect(getIconForBill('Property Tax')).toEqual({ icon: MaterialIcons, name: 'percent' });
    });

    it('should return credit-card as default icon', () => {
      expect(getIconForBill('Random Bill')).toEqual({ icon: MaterialIcons, name: 'credit-card' });
      expect(getIconForBill('')).toEqual({ icon: MaterialIcons, name: 'credit-card' });
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