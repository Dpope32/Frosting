import { getIconForStock } from '../../constants/popularStocks';
import { FontAwesome, FontAwesome5, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';

// Mock AsyncStorage to prevent Jest worker exceptions
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  getAllKeys: jest.fn(),
  multiGet: jest.fn(),
  multiSet: jest.fn(),
  multiRemove: jest.fn(),
}));

// Mock the icon libraries
jest.mock('@expo/vector-icons', () => ({
  FontAwesome: { name: 'FontAwesome' },
  FontAwesome5: { name: 'FontAwesome5' },
  MaterialCommunityIcons: { name: 'MaterialCommunityIcons' },
  MaterialIcons: { name: 'MaterialIcons' },
  Ionicons: { name: 'Ionicons' },
  Feather: { name: 'Feather' },
  Foundation: { name: 'Foundation' },
  Entypo: { name: 'Entypo' }
}));

describe('stockServices', () => {
  describe('getIconForStock', () => {
    // Tech Companies
    describe('Tech sector icons', () => {
      it('should return Microsoft icon for MSFT', () => {
        const result = getIconForStock('MSFT');
        expect(result.Component).toBe(FontAwesome5);
        expect(result.name).toBe('microsoft');
        expect(result.type).toBe('brand');
      });

      it('should return Google icon for GOOGL and GOOG', () => {
        const googl = getIconForStock('GOOGL');
        expect(googl.Component).toBe(FontAwesome);
        expect(googl.name).toBe('google');
        expect(googl.type).toBe('brand');

        const goog = getIconForStock('GOOG');
        expect(goog.Component).toBe(FontAwesome);
        expect(goog.name).toBe('google');
        expect(goog.type).toBe('brand');
      });

      it('should return Facebook icon for META', () => {
        const result = getIconForStock('META');
        expect(result.Component).toBe(FontAwesome5);
        expect(result.name).toBe('facebook');
        expect(result.type).toBe('brand');
      });

      it('should return Apple icon for AAPL', () => {
        const result = getIconForStock('AAPL');
        expect(result.Component).toBe(FontAwesome);
        expect(result.name).toBe('apple');
        expect(result.type).toBe('brand');
      });

      it('should return Amazon icon for AMZN', () => {
        const result = getIconForStock('AMZN');
        expect(result.Component).toBe(FontAwesome);
        expect(result.name).toBe('amazon');
        expect(result.type).toBe('brand');
      });

      it('should return Netflix icon for NFLX', () => {
        const result = getIconForStock('NFLX');
        expect(result.Component).toBe(MaterialCommunityIcons);
        expect(result.name).toBe('netflix');
        expect(result.type).toBe('material');
      });

      it('should return correct icons for chip/hardware companies', () => {
        const intel = getIconForStock('INTC');
        expect(intel.Component).toBe(MaterialCommunityIcons);
        expect(intel.name).toBe('cpu-64-bit');

        const nvidia = getIconForStock('NVDA');
        expect(nvidia.Component).toBe(MaterialCommunityIcons);
        expect(nvidia.name).toBe('chip');

        const amd = getIconForStock('AMD');
        expect(amd.Component).toBe(MaterialCommunityIcons);
        expect(amd.name).toBe('memory');
      });

      it('should return car icons for Tesla', () => {
        const result = getIconForStock('TSLA');
        expect(result.Component).toBe(MaterialCommunityIcons);
        expect(result.name).toBe('car-sports');
        expect(result.type).toBe('material');
      });
    });

    // Finance Companies
    describe('Finance sector icons', () => {
      it('should return landmark icon for JPM', () => {
        const result = getIconForStock('JPM');
        expect(result.Component).toBe(FontAwesome5);
        expect(result.name).toBe('landmark');
        expect(result.type).toBe('solid');
      });

      it('should return correct credit card icons', () => {
        const visa = getIconForStock('V');
        expect(visa.Component).toBe(FontAwesome5);
        expect(visa.name).toBe('cc-visa');
        expect(visa.type).toBe('brand');

        const mastercard = getIconForStock('MA');
        expect(mastercard.Component).toBe(FontAwesome5);
        expect(mastercard.name).toBe('cc-mastercard');
        expect(mastercard.type).toBe('brand');

        const amex = getIconForStock('AXP');
        expect(amex.Component).toBe(FontAwesome5);
        expect(amex.name).toBe('cc-amex');
        expect(amex.type).toBe('brand');
      });

      it('should return bank icons for banking companies', () => {
        const bac = getIconForStock('BAC');
        expect(bac.Component).toBe(MaterialCommunityIcons);
        expect(bac.name).toBe('bank');

        const wfc = getIconForStock('WFC');
        expect(wfc.Component).toBe(MaterialCommunityIcons);
        expect(wfc.name).toBe('bank');
      });

      it('should return PayPal icon for PYPL', () => {
        const result = getIconForStock('PYPL');
        expect(result.Component).toBe(FontAwesome5);
        expect(result.name).toBe('paypal');
        expect(result.type).toBe('brand');
      });
    });

    // Healthcare Companies
    describe('Healthcare sector icons', () => {
      it('should return pill icon for pharmaceutical companies', () => {
        const jnj = getIconForStock('JNJ');
        expect(jnj.Component).toBe(MaterialCommunityIcons);
        expect(jnj.name).toBe('pill');

        const pfe = getIconForStock('PFE');
        expect(pfe.Component).toBe(MaterialCommunityIcons);
        expect(pfe.name).toBe('pill');

        const mrk = getIconForStock('MRK');
        expect(mrk.Component).toBe(MaterialCommunityIcons);
        expect(mrk.name).toBe('pill');
      });

      it('should return heartbeat icon for UNH', () => {
        const result = getIconForStock('UNH');
        expect(result.Component).toBe(FontAwesome5);
        expect(result.name).toBe('heartbeat');
        expect(result.type).toBe('solid');
      });

      it('should return specialized healthcare icons', () => {
        const cvs = getIconForStock('CVS');
        expect(cvs.Component).toBe(MaterialCommunityIcons);
        expect(cvs.name).toBe('pharmacy');

        const tmo = getIconForStock('TMO');
        expect(tmo.Component).toBe(MaterialCommunityIcons);
        expect(tmo.name).toBe('microscope');
      });
    });

    // Consumer Companies
    describe('Consumer sector icons', () => {
      it('should return shopping cart icons for retail', () => {
        const walmart = getIconForStock('WMT');
        expect(walmart.Component).toBe(MaterialIcons);
        expect(walmart.name).toBe('shopping-cart');

        const pg = getIconForStock('PG');
        expect(pg.Component).toBe(MaterialIcons);
        expect(pg.name).toBe('shopping-basket');
      });

      it('should return beverage icons for drink companies', () => {
        const coke = getIconForStock('KO');
        expect(coke.Component).toBe(MaterialCommunityIcons);
        expect(coke.name).toBe('bottle-soda');

        const pepsi = getIconForStock('PEP');
        expect(pepsi.Component).toBe(MaterialCommunityIcons);
        expect(pepsi.name).toBe('bottle-soda-classic');

        const starbucks = getIconForStock('SBUX');
        expect(starbucks.Component).toBe(MaterialCommunityIcons);
        expect(starbucks.name).toBe('coffee');
      });

      it('should return food icons for restaurants', () => {
        const mcdonalds = getIconForStock('MCD');
        expect(mcdonalds.Component).toBe(MaterialCommunityIcons);
        expect(mcdonalds.name).toBe('hamburger');
      });

      it('should return specialized retail icons', () => {
        const target = getIconForStock('TGT');
        expect(target.Component).toBe(MaterialCommunityIcons);
        expect(target.name).toBe('target');

        const costco = getIconForStock('COST');
        expect(costco.Component).toBe(MaterialCommunityIcons);
        expect(costco.name).toBe('warehouse');

        const nike = getIconForStock('NKE');
        expect(nike.Component).toBe(MaterialCommunityIcons);
        expect(nike.name).toBe('shoe-sneaker');
      });
    });

    // Entertainment Companies
    describe('Entertainment sector icons', () => {
      it('should return movie icon for Disney', () => {
        const result = getIconForStock('DIS');
        expect(result.Component).toBe(MaterialCommunityIcons);
        expect(result.name).toBe('movie-open');
        expect(result.type).toBe('material');
      });

      it('should return Spotify icon for SPOT', () => {
        const result = getIconForStock('SPOT');
        expect(result.Component).toBe(FontAwesome5);
        expect(result.name).toBe('spotify');
        expect(result.type).toBe('brand');
      });

      it('should return TV icons for streaming companies', () => {
        const comcast = getIconForStock('CMCSA');
        expect(comcast.Component).toBe(MaterialCommunityIcons);
        expect(comcast.name).toBe('television');

        const roku = getIconForStock('ROKU');
        expect(roku.Component).toBe(MaterialCommunityIcons);
        expect(roku.name).toBe('remote-tv');
      });
    });

    // Energy Companies
    describe('Energy sector icons', () => {
      it('should return gas station icon for XOM', () => {
        const result = getIconForStock('XOM');
        expect(result.Component).toBe(MaterialCommunityIcons);
        expect(result.name).toBe('gas-station');
      });

      it('should return oil-related icons for energy companies', () => {
        const chevron = getIconForStock('CVX');
        expect(chevron.Component).toBe(MaterialCommunityIcons);
        expect(chevron.name).toBe('oil');

        const cop = getIconForStock('COP');
        expect(cop.Component).toBe(MaterialCommunityIcons);
        expect(cop.name).toBe('oil-lamp');

        const eog = getIconForStock('EOG');
        expect(eog.Component).toBe(MaterialCommunityIcons);
        expect(eog.name).toBe('barrel');
      });
    });

    // Auto Companies
    describe('Auto sector icons', () => {
      it('should return car icons for auto manufacturers', () => {
        const ford = getIconForStock('F');
        expect(ford.Component).toBe(MaterialCommunityIcons);
        expect(ford.name).toBe('car');

        const gm = getIconForStock('GM');
        expect(gm.Component).toBe(MaterialCommunityIcons);
        expect(gm.name).toBe('car-side');

        const toyota = getIconForStock('TM');
        expect(toyota.Component).toBe(MaterialCommunityIcons);
        expect(toyota.name).toBe('car-estate');
      });
    });

    // Airlines
    describe('Airline sector icons', () => {
      it('should return airplane icons for airlines', () => {
        const united = getIconForStock('UAL');
        expect(united.Component).toBe(MaterialCommunityIcons);
        expect(united.name).toBe('airplane');

        const delta = getIconForStock('DAL');
        expect(delta.Component).toBe(MaterialCommunityIcons);
        expect(delta.name).toBe('airplane-takeoff');

        const american = getIconForStock('AAL');
        expect(american.Component).toBe(MaterialCommunityIcons);
        expect(american.name).toBe('airplane-landing');

        const southwest = getIconForStock('LUV');
        expect(southwest.Component).toBe(FontAwesome5);
        expect(southwest.name).toBe('plane-departure');
      });

      it('should return rocket icon for Boeing', () => {
        const result = getIconForStock('BA');
        expect(result.Component).toBe(MaterialCommunityIcons);
        expect(result.name).toBe('rocket');
      });
    });

    // Industrial Companies
    describe('Industrial sector icons', () => {
      it('should return truck icons for logistics companies', () => {
        const cat = getIconForStock('CAT');
        expect(cat.Component).toBe(MaterialCommunityIcons);
        expect(cat.name).toBe('truck');

        const ups = getIconForStock('UPS');
        expect(ups.Component).toBe(MaterialCommunityIcons);
        expect(ups.name).toBe('truck-delivery');

        const fedex = getIconForStock('FDX');
        expect(fedex.Component).toBe(MaterialCommunityIcons);
        expect(fedex.name).toBe('truck-fast');
      });

      it('should return specialized industrial icons', () => {
        const deere = getIconForStock('DE');
        expect(deere.Component).toBe(MaterialCommunityIcons);
        expect(deere.name).toBe('tractor');

        const mmm = getIconForStock('MMM');
        expect(mmm.Component).toBe(MaterialCommunityIcons);
        expect(mmm.name).toBe('hammer-wrench');

        const honeywell = getIconForStock('HON');
        expect(honeywell.Component).toBe(MaterialCommunityIcons);
        expect(honeywell.name).toBe('factory');
      });
    });

    // Utilities
    describe('Utilities sector icons', () => {
      it('should return lightbulb icons for electric utilities', () => {
        const nee = getIconForStock('NEE');
        expect(nee.Component).toBe(MaterialCommunityIcons);
        expect(nee.name).toBe('lightbulb');

        const so = getIconForStock('SO');
        expect(so.Component).toBe(MaterialCommunityIcons);
        expect(so.name).toBe('lightbulb-on');
      });

      it('should return power-related icons', () => {
        const duke = getIconForStock('DUK');
        expect(duke.Component).toBe(MaterialCommunityIcons);
        expect(duke.name).toBe('transmission-tower');

        const dominion = getIconForStock('D');
        expect(dominion.Component).toBe(MaterialCommunityIcons);
        expect(dominion.name).toBe('power-plug');

        const aep = getIconForStock('AEP');
        expect(aep.Component).toBe(MaterialCommunityIcons);
        expect(aep.name).toBe('flash');
      });
    });

    // Real Estate
    describe('Real Estate sector icons', () => {
      it('should return building icons for REITs', () => {
        const spg = getIconForStock('SPG');
        expect(spg.Component).toBe(MaterialCommunityIcons);
        expect(spg.name).toBe('office-building');

        const pld = getIconForStock('PLD');
        expect(pld.Component).toBe(MaterialCommunityIcons);
        expect(pld.name).toBe('warehouse');
      });

      it('should return tower icons for tower REITs', () => {
        const amt = getIconForStock('AMT');
        expect(amt.Component).toBe(MaterialCommunityIcons);
        expect(amt.name).toBe('antenna');

        const cci = getIconForStock('CCI');
        expect(cci.Component).toBe(MaterialCommunityIcons);
        expect(cci.name).toBe('broadcast-tower');
      });

      it('should return server icon for data center REITs', () => {
        const eqix = getIconForStock('EQIX');
        expect(eqix.Component).toBe(MaterialCommunityIcons);
        expect(eqix.name).toBe('server');
      });
    });

    // Telecom
    describe('Telecom sector icons', () => {
      it('should return phone icons for telecom companies', () => {
        const att = getIconForStock('T');
        expect(att.Component).toBe(MaterialCommunityIcons);
        expect(att.name).toBe('phone');

        const verizon = getIconForStock('VZ');
        expect(verizon.Component).toBe(MaterialCommunityIcons);
        expect(verizon.name).toBe('cellphone');

        const tmobile = getIconForStock('TMUS');
        expect(tmobile.Component).toBe(MaterialCommunityIcons);
        expect(tmobile.name).toBe('cellphone-wireless');
      });
    });

    // Default fallback icons
    describe('Default fallback icons', () => {
      it('should return correct fallback icons based on first letter', () => {
        // A-C: office-building
        const apple2 = getIconForStock('AAAA');
        expect(apple2.Component).toBe(MaterialCommunityIcons);
        expect(apple2.name).toBe('office-building');

        // D-F: attach-money
        const dell = getIconForStock('DELL');
        expect(dell.Component).toBe(MaterialIcons);
        expect(dell.name).toBe('attach-money');

        // G-I: earth
        const generic = getIconForStock('GENERIC');
        expect(generic.Component).toBe(MaterialCommunityIcons);
        expect(generic.name).toBe('earth');

        // J-L: bank
        const jptest = getIconForStock('JPTEST');
        expect(jptest.Component).toBe(MaterialCommunityIcons);
        expect(jptest.name).toBe('bank');

        // M-O: shopping-cart
        const mystock = getIconForStock('MYSTOCK');
        expect(mystock.Component).toBe(MaterialIcons);
        expect(mystock.name).toBe('shopping-cart');

        // P-R: pill
        const pharma = getIconForStock('PHARMA');
        expect(pharma.Component).toBe(MaterialCommunityIcons);
        expect(pharma.name).toBe('pill');

        // S-U: trending-up
        const stock = getIconForStock('STOCK');
        expect(stock.Component).toBe(MaterialIcons);
        expect(stock.name).toBe('trending-up');

        // V-Z: lightning-bolt
        const venture = getIconForStock('VENTURE');
        expect(venture.Component).toBe(MaterialCommunityIcons);
        expect(venture.name).toBe('lightning-bolt');
      });

      it('should return default trending-up icon for empty or invalid symbols', () => {
        const empty = getIconForStock('');
        expect(empty.Component).toBe(MaterialIcons);
        expect(empty.name).toBe('trending-up');

        const numeric = getIconForStock('123');
        expect(numeric.Component).toBe(MaterialIcons);
        expect(numeric.name).toBe('trending-up');
      });
    });
  });
});