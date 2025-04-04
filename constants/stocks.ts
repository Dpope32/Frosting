// stocks.ts

export interface StockData {
    name: string;
    symbol: string;
    ipoPrice?: number;
  }
  
  export const stocksData: StockData[] = [
    { name: '3M Company', symbol: 'MMM', ipoPrice: 5 },
    { name: 'A. O. Smith', symbol: 'AOS', ipoPrice: 10 },
    { name: 'Abbott Laboratories', symbol: 'ABT', ipoPrice: 8 },
    { name: 'AbbVie Inc.', symbol: 'ABBV', ipoPrice: 15 },
    { name: 'Accenture plc', symbol: 'ACN', ipoPrice: 12 },
    { name: 'Adobe Inc.', symbol: 'ADBE', ipoPrice: 14 },
    { name: 'Advanced Micro Devices', symbol: 'AMD', ipoPrice: 15 },
    { name: 'AES Corporation', symbol: 'AES', ipoPrice: 7 },
    { name: 'Aflac Inc.', symbol: 'AFL', ipoPrice: 9 },
    { name: 'Agilent Technologies', symbol: 'A', ipoPrice: 10 },
    { name: 'Air Products & Chemicals', symbol: 'APD', ipoPrice: 11 },
    { name: 'Airbnb Inc.', symbol: 'ABNB', ipoPrice: 68 },
    { name: 'Akamai Technologies', symbol: 'AKAM', ipoPrice: 8 },
    { name: 'Albemarle Corporation', symbol: 'ALB', ipoPrice: 20 },
    { name: 'Alexandria Real Estate Equities', symbol: 'ARE', ipoPrice: 18 },
    { name: 'Align Technology', symbol: 'ALGN', ipoPrice: 22 },
    { name: 'Allegion plc', symbol: 'ALLE', ipoPrice: 16 },
    { name: 'Alliant Energy', symbol: 'LNT', ipoPrice: 12 },
    { name: 'Allstate Corp.', symbol: 'ALL', ipoPrice: 13 },
    { name: 'Alphabet Inc. (Class A)', symbol: 'GOOGL', ipoPrice: 85 },
    { name: 'Alphabet Inc. (Class C)', symbol: 'GOOG', ipoPrice: 85 },
    { name: 'Altria Group', symbol: 'MO', ipoPrice: 20 },
    { name: 'Amazon.com Inc.', symbol: 'AMZN', ipoPrice: 18 },
    { name: 'Amcor plc', symbol: 'AMCR', ipoPrice: 7 },
    { name: 'Ameren Corp.', symbol: 'AEE', ipoPrice: 10 },
    { name: 'American Electric Power', symbol: 'AEP', ipoPrice: 8 },
    { name: 'American Express Co.', symbol: 'AXP', ipoPrice: 18 },
    { name: 'American International Group', symbol: 'AIG', ipoPrice: 15 },
    { name: 'American Tower Corp.', symbol: 'AMT', ipoPrice: 17 },
    { name: 'American Water Works', symbol: 'AWK', ipoPrice: 16 },
    { name: 'Ameriprise Financial', symbol: 'AMP', ipoPrice: 19 },
    { name: 'Ametek Inc.', symbol: 'AME', ipoPrice: 20 },
    { name: 'Amgen Inc.', symbol: 'AMGN', ipoPrice: 22 },
    { name: 'Amphenol Corp.', symbol: 'APH', ipoPrice: 21 },
    { name: 'Analog Devices', symbol: 'ADI', ipoPrice: 17 },
    { name: 'Ansys Inc.', symbol: 'ANSS', ipoPrice: 25 },
    { name: 'Aon plc', symbol: 'AON', ipoPrice: 24 },
    { name: 'APA Corporation', symbol: 'APA', ipoPrice: 5 },
    { name: 'Apollo Global Management', symbol: 'APO', ipoPrice: 30 },
    { name: 'Apple Inc.', symbol: 'AAPL', ipoPrice: 0.39 },
    { name: 'Applied Materials', symbol: 'AMAT', ipoPrice: 18 },
    { name: 'Aptiv plc', symbol: 'APTV', ipoPrice: 16 },
    { name: 'Arch Capital Group Ltd.', symbol: 'ACGL', ipoPrice: 14 },
    { name: 'Archer-Daniels-Midland', symbol: 'ADM', ipoPrice: 12 },
    { name: 'Arista Networks', symbol: 'ANET', ipoPrice: 28 },
    { name: 'Arthur J. Gallagher & Co.', symbol: 'AJG', ipoPrice: 22 },
    { name: 'Assurant Inc.', symbol: 'AIZ', ipoPrice: 15 },
    { name: 'AT&T Inc.', symbol: 'T', ipoPrice: 10 },
    { name: 'Atmos Energy', symbol: 'ATO', ipoPrice: 13 },
    { name: 'Autodesk Inc.', symbol: 'ADSK', ipoPrice: 15 },
    { name: 'Automatic Data Processing', symbol: 'ADP', ipoPrice: 20 },
    { name: 'AutoZone Inc.', symbol: 'AZO', ipoPrice: 18 },
    { name: 'AvalonBay Communities', symbol: 'AVB', ipoPrice: 16 },
    { name: 'Avery Dennison Corp.', symbol: 'AVY', ipoPrice: 14 },
    { name: 'Axon Enterprise', symbol: 'AXON', ipoPrice: 12 },
    { name: 'Baker Hughes Co.', symbol: 'BKR', ipoPrice: 8 },
    { name: 'Ball Corporation', symbol: 'BALL', ipoPrice: 10 },
    { name: 'Bank of America Corp.', symbol: 'BAC', ipoPrice: 9 },
    { name: 'Baxter International', symbol: 'BAX', ipoPrice: 11 },
    { name: 'Becton Dickinson & Co.', symbol: 'BDX', ipoPrice: 20 },
    { name: 'Berkshire Hathaway (Class B)', symbol: 'BRK.B', ipoPrice: 18 },
    { name: 'Best Buy Co. Inc.', symbol: 'BBY', ipoPrice: 12 },
    { name: 'Bio-Techne Corp.', symbol: 'TECH', ipoPrice: 14 },
    { name: 'Biogen Inc.', symbol: 'BIIB', ipoPrice: 15 },
    { name: 'BlackRock Inc.', symbol: 'BLK', ipoPrice: 20 },
    { name: 'Blackstone Inc.', symbol: 'BX', ipoPrice: 31 },
    { name: 'BNY Mellon (Bank of New York Mellon)', symbol: 'BK', ipoPrice: 10 },
    { name: 'Boeing Co.', symbol: 'BA', ipoPrice: 12 },
    { name: 'Booking Holdings Inc.', symbol: 'BKNG', ipoPrice: 30 },
    { name: 'BorgWarner Inc.', symbol: 'BWA', ipoPrice: 8 },
    { name: 'Boston Scientific Corp.', symbol: 'BSX', ipoPrice: 14 },
    { name: 'Bristol Myers Squibb', symbol: 'BMY', ipoPrice: 10 },
    { name: 'Broadcom Inc.', symbol: 'AVGO', ipoPrice: 25 },
    { name: 'Broadridge Financial Solutions', symbol: 'BR', ipoPrice: 18 },
    { name: 'Brown & Brown Inc.', symbol: 'BRO', ipoPrice: 15 },
    { name: 'Brown–Forman Corp. (Class B)', symbol: 'BF.B', ipoPrice: 12 },
    { name: 'Builders FirstSource', symbol: 'BLDR', ipoPrice: 9 },
    { name: 'Bunge Ltd.', symbol: 'BG', ipoPrice: 10 },
    { name: 'BXP, Inc. (Boston Properties)', symbol: 'BXP' },
    { name: 'C.H. Robinson Worldwide', symbol: 'CHRW', ipoPrice: 11 },
    { name: 'Cadence Design Systems', symbol: 'CDNS', ipoPrice: 22 },
    { name: 'Caesars Entertainment', symbol: 'CZR', ipoPrice: 7 },
    { name: 'Camden Property Trust', symbol: 'CPT', ipoPrice: 16 },
    { name: 'Campbell Soup Co.', symbol: 'CPB', ipoPrice: 18 },
    { name: 'Capital One Financial', symbol: 'COF', ipoPrice: 15 },
    { name: 'Cardinal Health', symbol: 'CAH', ipoPrice: 12 },
    { name: 'CarMax Inc.', symbol: 'KMX', ipoPrice: 20 },
    { name: 'Carnival Corp.', symbol: 'CCL', ipoPrice: 5 },
    { name: 'Carrier Global', symbol: 'CARR', ipoPrice: 10 },
    { name: 'Caterpillar Inc.', symbol: 'CAT', ipoPrice: 15 },
    { name: 'Cboe Global Markets', symbol: 'CBOE', ipoPrice: 18 },
    { name: 'CBRE Group', symbol: 'CBRE', ipoPrice: 20 },
    { name: 'CDW Corp.', symbol: 'CDW', ipoPrice: 22 },
    { name: 'Celanese Corp.', symbol: 'CE', ipoPrice: 15 },
    { name: 'Cencora (AmerisourceBergen)', symbol: 'COR', ipoPrice: 12 },
    { name: 'Centene Corp.', symbol: 'CNC', ipoPrice: 16 },
    { name: 'CenterPoint Energy', symbol: 'CNP', ipoPrice: 10 },
    { name: 'CF Industries', symbol: 'CF', ipoPrice: 8 },
    { name: 'Charles River Laboratories', symbol: 'CRL', ipoPrice: 20 },
    { name: 'Charles Schwab Corp.', symbol: 'SCHW', ipoPrice: 25 },
    { name: 'Charter Communications', symbol: 'CHTR', ipoPrice: 15 },
    { name: 'Chevron Corp.', symbol: 'CVX', ipoPrice: 3 },
    { name: 'Chipotle Mexican Grill', symbol: 'CMG', ipoPrice: 22 },
    { name: 'Chubb Ltd.', symbol: 'CB', ipoPrice: 15 },
    { name: 'Church & Dwight Co.', symbol: 'CHD', ipoPrice: 10 },
    { name: 'Cigna Group', symbol: 'CI', ipoPrice: 18 },
    { name: 'Cincinnati Financial', symbol: 'CINF', ipoPrice: 14 },
    { name: 'Cintas Corp.', symbol: 'CTAS', ipoPrice: 17 },
    { name: 'Cisco Systems', symbol: 'CSCO', ipoPrice: 26 },
    { name: 'Citigroup Inc.', symbol: 'C', ipoPrice: 3 },
    { name: 'Citizens Financial Group', symbol: 'CFG', ipoPrice: 9 },
    { name: 'Clorox Co.', symbol: 'CLX', ipoPrice: 16 },
    { name: 'CME Group Inc.', symbol: 'CME', ipoPrice: 24 },
    { name: 'CMS Energy', symbol: 'CMS', ipoPrice: 12 },
    { name: 'Coca-Cola Co. (The)', symbol: 'KO', ipoPrice: 22 },
    { name: 'Cognizant Technology Solutions', symbol: 'CTSH', ipoPrice: 20 },
    { name: 'Colgate-Palmolive', symbol: 'CL', ipoPrice: 18 },
    { name: 'Comcast Corp.', symbol: 'CMCSA', ipoPrice: 25 },
    { name: 'Conagra Brands', symbol: 'CAG', ipoPrice: 14 },
    { name: 'ConocoPhillips', symbol: 'COP', ipoPrice: 10 },
    { name: 'Consolidated Edison', symbol: 'ED', ipoPrice: 15 },
    { name: 'Constellation Brands', symbol: 'STZ', ipoPrice: 30 },
    { name: 'Constellation Energy', symbol: 'CEG', ipoPrice: 13 },
    { name: 'Cooper Companies (The)', symbol: 'COO', ipoPrice: 21 },
    { name: 'Copart Inc.', symbol: 'CPRT', ipoPrice: 17 },
    { name: 'Corning Inc.', symbol: 'GLW', ipoPrice: 12 },
    { name: 'Corpay Inc.', symbol: 'CPAY', ipoPrice: 9 },
    { name: 'Corteva Inc.', symbol: 'CTVA', ipoPrice: 14 },
    { name: 'CoStar Group', symbol: 'CSGP', ipoPrice: 22 },
    { name: 'Costco Wholesale', symbol: 'COST', ipoPrice: 8 },
    { name: 'Coterra Energy', symbol: 'CTRA', ipoPrice: 10 },
    { name: 'CrowdStrike Holdings', symbol: 'CRWD', ipoPrice: 35 },
    { name: 'Crown Castle Inc.', symbol: 'CCI', ipoPrice: 24 },
    { name: 'CSX Corporation', symbol: 'CSX', ipoPrice: 15 },
    { name: 'Cummins Inc.', symbol: 'CMI', ipoPrice: 20 },
    { name: 'CVS Health Corp.', symbol: 'CVS', ipoPrice: 15 },
    { name: 'Danaher Corp.', symbol: 'DHR', ipoPrice: 25 },
    { name: 'Darden Restaurants', symbol: 'DRI', ipoPrice: 18 },
    { name: 'DaVita Inc.', symbol: 'DVA', ipoPrice: 15 },
    { name: 'Dayforce (Ceridian)', symbol: 'DAY', ipoPrice: 20 },
    { name: 'Deckers Brands', symbol: 'DECK', ipoPrice: 28 },
    { name: 'Deere & Co.', symbol: 'DE', ipoPrice: 12 },
    { name: 'Dell Technologies', symbol: 'DELL', ipoPrice: 15 },
    { name: 'Delta Air Lines', symbol: 'DAL', ipoPrice: 8 },
    { name: 'Devon Energy', symbol: 'DVN', ipoPrice: 10 },
    { name: 'Dexcom Inc.', symbol: 'DXCM', ipoPrice: 22 },
    { name: 'Diamondback Energy', symbol: 'FANG', ipoPrice: 11 },
    { name: 'Digital Realty Trust', symbol: 'DLR', ipoPrice: 20 },
    { name: 'Discover Financial Services', symbol: 'DFS', ipoPrice: 16 },
    { name: 'Dollar General', symbol: 'DG', ipoPrice: 13 },
    { name: 'Dollar Tree', symbol: 'DLTR', ipoPrice: 15 },
    { name: 'Dominion Energy', symbol: 'D', ipoPrice: 10 },
    { name: 'Domino’s Pizza', symbol: 'DPZ', ipoPrice: 18 },
    { name: 'Dover Corp.', symbol: 'DOV', ipoPrice: 12 },
    { name: 'Dow Inc.', symbol: 'DOW', ipoPrice: 18 },
    { name: 'D.R. Horton', symbol: 'DHI', ipoPrice: 20 },
    { name: 'DTE Energy', symbol: 'DTE', ipoPrice: 10 },
    { name: 'Duke Energy', symbol: 'DUK', ipoPrice: 15 },
    { name: 'DuPont de Nemours', symbol: 'DD', ipoPrice: 22 },
    { name: 'Eastman Chemical', symbol: 'EMN', ipoPrice: 12 },
    { name: 'Eaton Corp. plc', symbol: 'ETN', ipoPrice: 15 },
    { name: 'eBay Inc.', symbol: 'EBAY', ipoPrice: 20 },
    { name: 'Ecolab Inc.', symbol: 'ECL', ipoPrice: 18 },
    { name: 'Edison International', symbol: 'EIX', ipoPrice: 13 },
    { name: 'Edwards Lifesciences', symbol: 'EW', ipoPrice: 25 },
    { name: 'Electronic Arts', symbol: 'EA', ipoPrice: 30 },
    { name: 'Elevance Health', symbol: 'ELV', ipoPrice: 14 },
    { name: 'Emerson Electric', symbol: 'EMR', ipoPrice: 18 },
    { name: 'Enphase Energy', symbol: 'ENPH', ipoPrice: 25 },
    { name: 'Entergy Corp.', symbol: 'ETR', ipoPrice: 10 },
    { name: 'EOG Resources', symbol: 'EOG', ipoPrice: 12 },
    { name: 'EPAM Systems', symbol: 'EPAM', ipoPrice: 28 },
    { name: 'EQT Corp.', symbol: 'EQT', ipoPrice: 15 },
    { name: 'Equifax Inc.', symbol: 'EFX', ipoPrice: 20 },
    { name: 'Equinix Inc.', symbol: 'EQIX', ipoPrice: 25 },
    { name: 'Equity Residential', symbol: 'EQR', ipoPrice: 18 },
    { name: 'Erie Indemnity Co.', symbol: 'ERIE', ipoPrice: 12 },
    { name: 'Essex Property Trust', symbol: 'ESS', ipoPrice: 15 },
    { name: 'Estée Lauder Companies', symbol: 'EL', ipoPrice: 30 },
    { name: 'Everest Group Ltd.', symbol: 'EG', ipoPrice: 10 },
    { name: 'Evergy Inc.', symbol: 'EVRG', ipoPrice: 12 },
    { name: 'Eversource Energy', symbol: 'ES', ipoPrice: 14 },
    { name: 'Exelon Corp.', symbol: 'EXC', ipoPrice: 16 },
    { name: 'Expedia Group', symbol: 'EXPE', ipoPrice: 18 },
    { name: 'Expeditors International', symbol: 'EXPD', ipoPrice: 20 },
    { name: 'Extra Space Storage', symbol: 'EXR', ipoPrice: 22 },
    { name: 'Exxon Mobil Corp.', symbol: 'XOM', ipoPrice: 3 },
    { name: 'F5, Inc.', symbol: 'FFIV' },
    { name: 'FactSet Research Systems', symbol: 'FDS', ipoPrice: 20 },
    { name: 'Fair Isaac Corp. (FICO)', symbol: 'FICO', ipoPrice: 25 },
    { name: 'Fastenal Co.', symbol: 'FAST', ipoPrice: 15 },
    { name: 'Federal Realty Investment Trust', symbol: 'FRT', ipoPrice: 20 },
    { name: 'FedEx Corp.', symbol: 'FDX', ipoPrice: 17 },
    { name: 'Fidelity National Info. Svcs.', symbol: 'FIS', ipoPrice: 15 },
    { name: 'Fifth Third Bancorp', symbol: 'FITB', ipoPrice: 10 },
    { name: 'First Solar Inc.', symbol: 'FSLR', ipoPrice: 18 },
    { name: 'FirstEnergy Corp.', symbol: 'FE', ipoPrice: 12 },
    { name: 'Fiserv Inc.', symbol: 'FI', ipoPrice: 20 },
    { name: 'FMC Corporation', symbol: 'FMC', ipoPrice: 14 },
    { name: 'Ford Motor Co.', symbol: 'F', ipoPrice: 3 },
    { name: 'Fortinet Inc.', symbol: 'FTNT', ipoPrice: 30 },
    { name: 'Fortive Corp.', symbol: 'FTV', ipoPrice: 15 },
    { name: 'Fox Corp. (Class A)', symbol: 'FOXA', ipoPrice: 22 },
    { name: 'Fox Corp. (Class B)', symbol: 'FOX', ipoPrice: 22 },
    { name: 'Franklin Resources', symbol: 'BEN', ipoPrice: 16 },
    { name: 'Freeport-McMoRan', symbol: 'FCX', ipoPrice: 10 },
    { name: 'Garmin Ltd.', symbol: 'GRMN', ipoPrice: 15 },
    { name: 'Gartner Inc.', symbol: 'IT', ipoPrice: 20 },
    { name: 'GE Aerospace (General Electric)', symbol: 'GE', ipoPrice: 3 },
    { name: 'GE HealthCare Technologies', symbol: 'GEHC', ipoPrice: 12 },
    { name: 'GE Vernova', symbol: 'GEV', ipoPrice: 12 },
    { name: 'Gen Digital Inc.', symbol: 'GEN', ipoPrice: 8 },
    { name: 'Generac Holdings', symbol: 'GNRC', ipoPrice: 18 },
    { name: 'General Dynamics', symbol: 'GD', ipoPrice: 25 },
    { name: 'General Mills', symbol: 'GIS', ipoPrice: 16 },
    { name: 'General Motors Co.', symbol: 'GM', ipoPrice: 33 },
    { name: 'Genuine Parts Co.', symbol: 'GPC', ipoPrice: 20 },
    { name: 'Gilead Sciences', symbol: 'GILD', ipoPrice: 22 },
    { name: 'Global Payments', symbol: 'GPN', ipoPrice: 18 },
    { name: 'Globe Life Inc.', symbol: 'GL', ipoPrice: 12 },
    { name: 'GoDaddy Inc.', symbol: 'GDDY', ipoPrice: 10 },
    { name: 'Goldman Sachs Group', symbol: 'GS', ipoPrice: 18 },
    { name: 'Halliburton Co.', symbol: 'HAL', ipoPrice: 15 },
    { name: 'Hartford Financial Svcs. (The)', symbol: 'HIG', ipoPrice: 12 },
    { name: 'Hasbro Inc.', symbol: 'HAS', ipoPrice: 16 },
    { name: 'HCA Healthcare', symbol: 'HCA', ipoPrice: 25 },
    { name: 'Healthpeak Properties', symbol: 'DOC', ipoPrice: 15 },
    { name: 'Henry Schein', symbol: 'HSIC', ipoPrice: 18 },
    { name: 'Hershey Co. (The)', symbol: 'HSY', ipoPrice: 20 },
    { name: 'Hess Corp.', symbol: 'HES', ipoPrice: 8 },
    { name: 'Hewlett Packard Enterprise', symbol: 'HPE', ipoPrice: 20 },
    { name: 'Hilton Worldwide Holdings', symbol: 'HLT', ipoPrice: 15 },
    { name: 'Hologic Inc.', symbol: 'HOLX', ipoPrice: 22 },
    { name: 'Home Depot (The)', symbol: 'HD', ipoPrice: 25 },
    { name: 'Honeywell International', symbol: 'HON', ipoPrice: 22 },
    { name: 'Hormel Foods', symbol: 'HRL', ipoPrice: 15 },
    { name: 'Host Hotels & Resorts', symbol: 'HST', ipoPrice: 12 },
    { name: 'Howmet Aerospace', symbol: 'HWM', ipoPrice: 18 },
    { name: 'HP Inc.', symbol: 'HPQ', ipoPrice: 20 },
    { name: 'Hubbell Inc.', symbol: 'HUBB', ipoPrice: 15 },
    { name: 'Humana Inc.', symbol: 'HUM', ipoPrice: 20 },
    { name: 'Huntington Bancshares', symbol: 'HBAN', ipoPrice: 10 },
    { name: 'Huntington Ingalls Industries', symbol: 'HII', ipoPrice: 15 },
    { name: 'IBM Corp.', symbol: 'IBM', ipoPrice: 20 },
    { name: 'IDEX Corp.', symbol: 'IEX', ipoPrice: 18 },
    { name: 'IDEXX Laboratories', symbol: 'IDXX', ipoPrice: 22 },
    { name: 'Illinois Tool Works', symbol: 'ITW', ipoPrice: 15 },
    { name: 'Incyte Corp.', symbol: 'INCY', ipoPrice: 18 },
    { name: 'Ingersoll Rand Inc.', symbol: 'IR', ipoPrice: 20 },
    { name: 'Insulet Corp.', symbol: 'PODD', ipoPrice: 16 },
    { name: 'Intel Corp.', symbol: 'INTC', ipoPrice: 15 },
    { name: 'Intercontinental Exchange', symbol: 'ICE', ipoPrice: 25 },
    { name: 'Intl Flavors & Fragrances', symbol: 'IFF', ipoPrice: 10 },
    { name: 'International Paper', symbol: 'IP', ipoPrice: 12 },
    { name: 'Interpublic Group (The)', symbol: 'IPG', ipoPrice: 18 },
    { name: 'Intuit Inc.', symbol: 'INTU', ipoPrice: 20 },
    { name: 'Intuitive Surgical', symbol: 'ISRG', ipoPrice: 30 },
    { name: 'Invesco Ltd.', symbol: 'IVZ', ipoPrice: 15 },
    { name: 'Invitation Homes', symbol: 'INVH', ipoPrice: 12 },
    { name: 'IQVIA Holdings', symbol: 'IQV', ipoPrice: 22 },
    { name: 'Iron Mountain', symbol: 'IRM', ipoPrice: 10 },
    { name: 'J.B. Hunt Transport Svcs.', symbol: 'JBHT', ipoPrice: 18 },
    { name: 'Jabil Inc.', symbol: 'JBL', ipoPrice: 15 },
    { name: 'Jack Henry & Associates', symbol: 'JKHY', ipoPrice: 12 },
    { name: 'Jacobs Solutions Inc.', symbol: 'J', ipoPrice: 18 },
    { name: 'Johnson & Johnson', symbol: 'JNJ', ipoPrice: 15 },
    { name: 'Johnson Controls Intl.', symbol: 'JCI', ipoPrice: 15 },
    { name: 'JPMorgan Chase & Co.', symbol: 'JPM', ipoPrice: 18 },
    { name: 'Juniper Networks', symbol: 'JNPR', ipoPrice: 20 },
    { name: 'Kellanova (Kellogg Co.)', symbol: 'K', ipoPrice: 10 },
    { name: 'Kenvue Inc.', symbol: 'KVUE', ipoPrice: 22 },
    { name: 'Keurig Dr Pepper', symbol: 'KDP', ipoPrice: 15 },
    { name: 'KeyCorp', symbol: 'KEY', ipoPrice: 12 },
    { name: 'Keysight Technologies', symbol: 'KEYS', ipoPrice: 16 },
    { name: 'Kimberly-Clark', symbol: 'KMB', ipoPrice: 18 },
    { name: 'Kimco Realty', symbol: 'KIM', ipoPrice: 15 },
    { name: 'Kinder Morgan', symbol: 'KMI', ipoPrice: 12 },
    { name: 'KKR & Co. Inc.', symbol: 'KKR', ipoPrice: 25 },
    { name: 'KLA Corporation', symbol: 'KLAC', ipoPrice: 22 },
    { name: 'Kraft Heinz Co.', symbol: 'KHC', ipoPrice: 16 },
    { name: 'Kroger Co.', symbol: 'KR', ipoPrice: 10 },
    { name: 'L3Harris Technologies', symbol: 'LHX', ipoPrice: 20 },
    { name: 'Labcorp (Laboratory Corp. of America)', symbol: 'LH', ipoPrice: 18 },
    { name: 'Lam Research', symbol: 'LRCX', ipoPrice: 25 },
    { name: 'Lamb Weston Holdings', symbol: 'LW', ipoPrice: 15 },
    { name: 'Las Vegas Sands', symbol: 'LVS', ipoPrice: 20 },
    { name: 'Leidos Holdings', symbol: 'LDOS', ipoPrice: 18 },
    { name: 'Lennar Corp.', symbol: 'LEN', ipoPrice: 12 },
    { name: 'Lennox International', symbol: 'LII', ipoPrice: 15 },
    { name: 'Eli Lilly & Co.', symbol: 'LLY', ipoPrice: 25 },
    { name: 'Linde plc', symbol: 'LIN', ipoPrice: 30 },
    { name: 'Live Nation Entertainment', symbol: 'LYV', ipoPrice: 20 },
    { name: 'LKQ Corporation', symbol: 'LKQ', ipoPrice: 18 },
    { name: 'Lockheed Martin', symbol: 'LMT', ipoPrice: 20 },
    { name: 'Loews Corp.', symbol: 'L', ipoPrice: 15 },
    { name: 'Lowe’s Companies', symbol: 'LOW', ipoPrice: 20 },
    { name: 'Lululemon Athletica', symbol: 'LULU', ipoPrice: 25 },
    { name: 'LyondellBasell Industries', symbol: 'LYB', ipoPrice: 30 },
    { name: 'M&T Bank Corp.', symbol: 'MTB', ipoPrice: 10 },
    { name: 'Marathon Petroleum', symbol: 'MPC', ipoPrice: 18 },
    { name: 'MarketAxess Holdings', symbol: 'MKTX', ipoPrice: 22 },
    { name: 'Marriott International', symbol: 'MAR', ipoPrice: 20 },
    { name: 'Marsh & McLennan', symbol: 'MMC', ipoPrice: 18 },
    { name: 'Martin Marietta Materials', symbol: 'MLM', ipoPrice: 15 },
    { name: 'Masco Corp.', symbol: 'MAS', ipoPrice: 12 },
    { name: 'Mastercard Inc.', symbol: 'MA', ipoPrice: 39 },
    { name: 'Match Group Inc.', symbol: 'MTCH', ipoPrice: 25 },
    { name: 'McCormick & Co.', symbol: 'MKC', ipoPrice: 18 },
    { name: 'McDonald’s Corp.', symbol: 'MCD', ipoPrice: 22 },
    { name: 'McKesson Corp.', symbol: 'MCK', ipoPrice: 15 },
    { name: 'Medtronic plc', symbol: 'MDT', ipoPrice: 25 },
    { name: 'Merck & Co.', symbol: 'MRK', ipoPrice: 18 },
    { name: 'Meta Platforms Inc.', symbol: 'META', ipoPrice: 38 },
    { name: 'MetLife Inc.', symbol: 'MET', ipoPrice: 15 },
    { name: 'Mettler-Toledo Intl.', symbol: 'MTD', ipoPrice: 20 },
    { name: 'MGM Resorts International', symbol: 'MGM', ipoPrice: 18 },
    { name: 'Microchip Technology', symbol: 'MCHP', ipoPrice: 16 },
    { name: 'Micron Technology', symbol: 'MU', ipoPrice: 15 },
    { name: 'Microsoft Corp.', symbol: 'MSFT', ipoPrice: 21 },
    { name: 'Mid-America Apartment Communities', symbol: 'MAA', ipoPrice: 20 },
    { name: 'Moderna Inc.', symbol: 'MRNA', ipoPrice: 22 },
    { name: 'Mohawk Industries', symbol: 'MHK', ipoPrice: 18 },
    { name: 'Molina Healthcare', symbol: 'MOH', ipoPrice: 12 },
    { name: 'Molson Coors Beverage Co.', symbol: 'TAP', ipoPrice: 10 },
    { name: 'Mondelez International', symbol: 'MDLZ', ipoPrice: 15 },
    { name: 'Monolithic Power Systems', symbol: 'MPWR', ipoPrice: 20 },
    { name: 'Monster Beverage', symbol: 'MNST', ipoPrice: 18 },
    { name: 'Moody’s Corp.', symbol: 'MCO', ipoPrice: 25 },
    { name: 'Morgan Stanley', symbol: 'MS', ipoPrice: 18 },
    { name: 'Mosaic Co. (The)', symbol: 'MOS', ipoPrice: 12 },
    { name: 'Motorola Solutions', symbol: 'MSI', ipoPrice: 20 },
    { name: 'MSCI Inc.', symbol: 'MSCI', ipoPrice: 25 },
    { name: 'Nasdaq, Inc.', symbol: 'NDAQ' },
    { name: 'NetApp Inc.', symbol: 'NTAP', ipoPrice: 22 },
    { name: 'Netflix Inc.', symbol: 'NFLX', ipoPrice: 15 },
    { name: 'Newmont Corp.', symbol: 'NEM', ipoPrice: 12 },
    { name: 'News Corp. (Class A)', symbol: 'NWSA', ipoPrice: 10 },
    { name: 'News Corp. (Class B)', symbol: 'NWS', ipoPrice: 10 },
    { name: 'NextEra Energy', symbol: 'NEE', ipoPrice: 18 },
    { name: 'Nike, Inc.', symbol: 'NKE' },
    { name: 'NiSource Inc.', symbol: 'NI', ipoPrice: 10 },
    { name: 'Nordson Corp.', symbol: 'NDSN', ipoPrice: 16 },
    { name: 'Norfolk Southern', symbol: 'NSC', ipoPrice: 15 },
    { name: 'Northern Trust', symbol: 'NTRS', ipoPrice: 12 },
    { name: 'Northrop Grumman', symbol: 'NOC', ipoPrice: 20 },
    { name: 'Norwegian Cruise Line Holdings', symbol: 'NCLH', ipoPrice: 10 },
    { name: 'NRG Energy', symbol: 'NRG', ipoPrice: 12 },
    { name: 'Nucor Corp.', symbol: 'NUE', ipoPrice: 15 },
    { name: 'Nvidia Corp.', symbol: 'NVDA', ipoPrice: 20 },
    { name: 'NVR, Inc.', symbol: 'NVR' },
    { name: 'NXP Semiconductors', symbol: 'NXPI', ipoPrice: 18 },
    { name: 'O’Reilly Automotive', symbol: 'ORLY', ipoPrice: 15 },
    { name: 'Occidental Petroleum', symbol: 'OXY', ipoPrice: 10 },
    { name: 'Old Dominion Freight Line', symbol: 'ODFL', ipoPrice: 18 },
    { name: 'Omnicom Group', symbol: 'OMC', ipoPrice: 20 },
    { name: 'ON Semiconductor', symbol: 'ON', ipoPrice: 15 },
    { name: 'ONEOK Inc.', symbol: 'OKE', ipoPrice: 12 },
    { name: 'Oracle Corp.', symbol: 'ORCL', ipoPrice: 18 },
    { name: 'Otis Worldwide', symbol: 'OTIS', ipoPrice: 20 },
    { name: 'Paccar Inc.', symbol: 'PCAR', ipoPrice: 16 },
    { name: 'Packaging Corp. of America', symbol: 'PKG', ipoPrice: 18 },
    { name: 'Palantir Technologies', symbol: 'PLTR', ipoPrice: 25 },
    { name: 'Palo Alto Networks', symbol: 'PANW', ipoPrice: 20 },
    { name: 'Paramount Global', symbol: 'PARA', ipoPrice: 15 },
    { name: 'Parker-Hannifin', symbol: 'PH', ipoPrice: 22 },
    { name: 'Paychex Inc.', symbol: 'PAYX', ipoPrice: 18 },
    { name: 'Paycom Software', symbol: 'PAYC', ipoPrice: 20 },
    { name: 'PayPal Holdings', symbol: 'PYPL', ipoPrice: 25 },
    { name: 'Pentair plc', symbol: 'PNR', ipoPrice: 16 },
    { name: 'PepsiCo Inc.', symbol: 'PEP', ipoPrice: 22 },
    { name: 'Pfizer Inc.', symbol: 'PFE', ipoPrice: 20 },
    { name: 'PG&E Corp.', symbol: 'PCG', ipoPrice: 10 },
    { name: 'Philip Morris International', symbol: 'PM', ipoPrice: 18 },
    { name: 'Phillips 66', symbol: 'PSX', ipoPrice: 12 },
    { name: 'Pinnacle West Capital', symbol: 'PNW', ipoPrice: 15 },
    { name: 'PNC Financial Services', symbol: 'PNC', ipoPrice: 14 },
    { name: 'Pool Corporation', symbol: 'POOL', ipoPrice: 20 },
    { name: 'PPG Industries', symbol: 'PPG', ipoPrice: 18 },
    { name: 'PPL Corp.', symbol: 'PPL', ipoPrice: 10 },
    { name: 'Principal Financial Group', symbol: 'PFG', ipoPrice: 15 },
    { name: 'Procter & Gamble', symbol: 'PG', ipoPrice: 25 },
    { name: 'Progressive Corp.', symbol: 'PGR', ipoPrice: 20 },
    { name: 'Prologis', symbol: 'PLD', ipoPrice: 22 },
    { name: 'Prudential Financial', symbol: 'PRU', ipoPrice: 18 },
    { name: 'Public Service Enterprise Group', symbol: 'PEG', ipoPrice: 15 },
    { name: 'PTC Inc.', symbol: 'PTC', ipoPrice: 20 },
    { name: 'Public Storage', symbol: 'PSA', ipoPrice: 15 },
    { name: 'PulteGroup', symbol: 'PHM', ipoPrice: 20 },
    { name: 'Quanta Services', symbol: 'PWR', ipoPrice: 18 },
    { name: 'Qualcomm Inc.', symbol: 'QCOM', ipoPrice: 25 },
    { name: 'Quest Diagnostics', symbol: 'DGX', ipoPrice: 15 },
    { name: 'Ralph Lauren Corp.', symbol: 'RL', ipoPrice: 20 },
    { name: 'Raymond James Financial', symbol: 'RJF', ipoPrice: 18 },
    { name: 'RTX Corporation (Raytheon Technologies)', symbol: 'RTX', ipoPrice: 20 },
    { name: 'Realty Income Corp.', symbol: 'O', ipoPrice: 22 },
    { name: 'Regency Centers Corp.', symbol: 'REG', ipoPrice: 18 },
    { name: 'Regeneron Pharmaceuticals', symbol: 'REGN', ipoPrice: 25 },
    { name: 'Regions Financial', symbol: 'RF', ipoPrice: 14 },
    { name: 'Republic Services', symbol: 'RSG', ipoPrice: 18 },
    { name: 'ResMed Inc.', symbol: 'RMD', ipoPrice: 15 },
    { name: 'Revvity Inc.', symbol: 'RVTY', ipoPrice: 20 },
    { name: 'Rockwell Automation', symbol: 'ROK', ipoPrice: 22 },
    { name: 'Rollins Inc.', symbol: 'ROL', ipoPrice: 15 },
    { name: 'Roper Technologies', symbol: 'ROP', ipoPrice: 20 },
    { name: 'Ross Stores', symbol: 'ROST', ipoPrice: 18 },
    { name: 'Royal Caribbean Group', symbol: 'RCL', ipoPrice: 12 },
    { name: 'S&P Global Inc.', symbol: 'SPGI', ipoPrice: 25 },
    { name: 'Salesforce, Inc.', symbol: 'CRM' },
    { name: 'SBA Communications', symbol: 'SBAC', ipoPrice: 20 },
    { name: 'Schlumberger Ltd.', symbol: 'SLB', ipoPrice: 15 },
    { name: 'Seagate Technology', symbol: 'STX', ipoPrice: 20 },
    { name: 'Sempra', symbol: 'SRE', ipoPrice: 12 },
    { name: 'ServiceNow, Inc.', symbol: 'NOW' },
    { name: 'Sherwin-Williams Co.', symbol: 'SHW', ipoPrice: 22 },
    { name: 'Simon Property Group', symbol: 'SPG', ipoPrice: 20 },
    { name: 'Skyworks Solutions', symbol: 'SWKS', ipoPrice: 18 },
    { name: 'Smucker Co. (J.M.)', symbol: 'SJM', ipoPrice: 15 },
    { name: 'Smurfit WestRock', symbol: 'SW', ipoPrice: 14 },
    { name: 'Snap-on Inc.', symbol: 'SNA', ipoPrice: 20 },
    { name: 'Solventum', symbol: 'SOLV', ipoPrice: 10 },
    { name: 'Southern Co.', symbol: 'SO', ipoPrice: 15 },
    { name: 'Southwest Airlines', symbol: 'LUV', ipoPrice: 12 },
    { name: 'Stanley Black & Decker', symbol: 'SWK', ipoPrice: 18 },
    { name: 'Starbucks Corp.', symbol: 'SBUX', ipoPrice: 25 },
    { name: 'State Street Corp.', symbol: 'STT', ipoPrice: 18 },
    { name: 'Steel Dynamics', symbol: 'STLD', ipoPrice: 15 },
    { name: 'Steris plc', symbol: 'STE', ipoPrice: 20 },
    { name: 'Stryker Corp.', symbol: 'SYK', ipoPrice: 25 },
    { name: 'Super Micro Computer', symbol: 'SMCI', ipoPrice: 18 },
    { name: 'Synchrony Financial', symbol: 'SYF', ipoPrice: 15 },
    { name: 'Synopsys Inc.', symbol: 'SNPS', ipoPrice: 20 },
    { name: 'Sysco Corp.', symbol: 'SYY', ipoPrice: 18 },
    { name: 'T-Mobile US', symbol: 'TMUS', ipoPrice: 30 },
    { name: 'T. Rowe Price Group', symbol: 'TROW', ipoPrice: 20 },
    { name: 'Take-Two Interactive', symbol: 'TTWO', ipoPrice: 25 },
    { name: 'Tapestry, Inc.', symbol: 'TPR' },
    { name: 'Targa Resources', symbol: 'TRGP', ipoPrice: 15 },
    { name: 'Target Corp.', symbol: 'TGT', ipoPrice: 25 },
    { name: 'TE Connectivity Ltd.', symbol: 'TEL', ipoPrice: 18 },
    { name: 'Teledyne Technologies', symbol: 'TDY', ipoPrice: 20 },
    { name: 'Teleflex Inc.', symbol: 'TFX', ipoPrice: 15 },
    { name: 'Teradyne Inc.', symbol: 'TER', ipoPrice: 20 },
    { name: 'Tesla Inc.', symbol: 'TSLA', ipoPrice: 11.28 },
    { name: 'Texas Instruments', symbol: 'TXN', ipoPrice: 20 },
    { name: 'Texas Pacific Land Corp.', symbol: 'TPL', ipoPrice: 10 },
    { name: 'Textron Inc.', symbol: 'TXT', ipoPrice: 15 },
    { name: 'Thermo Fisher Scientific', symbol: 'TMO', ipoPrice: 22 },
    { name: 'TJX Companies', symbol: 'TJX', ipoPrice: 20 },
    { name: 'Tractor Supply Co.', symbol: 'TSCO', ipoPrice: 18 },
    { name: 'Trane Technologies plc', symbol: 'TT', ipoPrice: 15 },
    { name: 'TransDigm Group', symbol: 'TDG', ipoPrice: 25 },
    { name: 'Travelers Companies (The)', symbol: 'TRV', ipoPrice: 18 },
    { name: 'Trimble Inc.', symbol: 'TRMB', ipoPrice: 20 },
    { name: 'Truist Financial', symbol: 'TFC', ipoPrice: 18 },
    { name: 'Tyler Technologies', symbol: 'TYL', ipoPrice: 20 },
    { name: 'Tyson Foods', symbol: 'TSN', ipoPrice: 15 },
    { name: 'U.S. Bancorp', symbol: 'USB', ipoPrice: 12 },
    { name: 'Uber Technologies', symbol: 'UBER', ipoPrice: 45 },
    { name: 'UDR, Inc.', symbol: 'UDR' },
    { name: 'Ulta Beauty', symbol: 'ULTA', ipoPrice: 20 },
    { name: 'Union Pacific Corp.', symbol: 'UNP', ipoPrice: 25 },
    { name: 'United Airlines Holdings', symbol: 'UAL', ipoPrice: 18 },
    { name: 'United Parcel Service', symbol: 'UPS', ipoPrice: 15 },
    { name: 'United Rentals', symbol: 'URI', ipoPrice: 18 },
    { name: 'UnitedHealth Group', symbol: 'UNH', ipoPrice: 20 },
    { name: 'Universal Health Services', symbol: 'UHS', ipoPrice: 15 },
    { name: 'Valero Energy', symbol: 'VLO', ipoPrice: 10 },
    { name: 'Ventas Inc.', symbol: 'VTR', ipoPrice: 18 },
    { name: 'Veralto Inc.', symbol: 'VLTO', ipoPrice: 12 },
    { name: 'Verisign Inc.', symbol: 'VRSN', ipoPrice: 20 },
    { name: 'Verisk Analytics', symbol: 'VRSK', ipoPrice: 18 },
    { name: 'Verizon Communications', symbol: 'VZ', ipoPrice: 35 },
    { name: 'Vertex Pharmaceuticals', symbol: 'VRTX', ipoPrice: 25 },
    { name: 'Viatris Inc.', symbol: 'VTRS', ipoPrice: 15 },
    { name: 'Vici Properties', symbol: 'VICI', ipoPrice: 10 },
    { name: 'Visa Inc.', symbol: 'V', ipoPrice: 44 },
    { name: 'Vistra Corp.', symbol: 'VST', ipoPrice: 15 },
    { name: 'Vulcan Materials', symbol: 'VMC', ipoPrice: 12 },
    { name: 'W.R. Berkley Corp.', symbol: 'WRB', ipoPrice: 18 },
    { name: 'W.W. Grainger Inc.', symbol: 'GWW', ipoPrice: 25 },
    { name: 'Wabtec Corp.', symbol: 'WAB', ipoPrice: 15 },
    { name: 'Walgreens Boots Alliance', symbol: 'WBA', ipoPrice: 18 },
    { name: 'Walmart Inc.', symbol: 'WMT', ipoPrice: 22 },
    { name: 'Walt Disney Co. (The)', symbol: 'DIS', ipoPrice: 20 },
    { name: 'Warner Bros. Discovery', symbol: 'WBD', ipoPrice: 15 },
    { name: 'Waste Management', symbol: 'WM', ipoPrice: 18 },
    { name: 'Waters Corp.', symbol: 'WAT', ipoPrice: 20 },
    { name: 'WEC Energy Group', symbol: 'WEC', ipoPrice: 12 },
    { name: 'Wells Fargo & Co.', symbol: 'WFC', ipoPrice: 10 },
    { name: 'Welltower Inc.', symbol: 'WELL', ipoPrice: 15 },
    { name: 'West Pharmaceutical Services', symbol: 'WST', ipoPrice: 18 },
    { name: 'Western Digital', symbol: 'WDC', ipoPrice: 20 },
    { name: 'Weyerhaeuser Co.', symbol: 'WY', ipoPrice: 15 },
    { name: 'Williams Companies', symbol: 'WMB', ipoPrice: 12 },
    { name: 'Willis Towers Watson plc', symbol: 'WTW', ipoPrice: 18 },
    { name: 'Workday, Inc.', symbol: 'WDAY' },
    { name: 'Wynn Resorts Ltd.', symbol: 'WYNN', ipoPrice: 15 },
    { name: 'Xcel Energy', symbol: 'XEL', ipoPrice: 20 },
    { name: 'Xylem Inc.', symbol: 'XYL', ipoPrice: 15 },
    { name: 'Yum! Brands', symbol: 'YUM', ipoPrice: 18 },
    { name: 'Zebra Technologies', symbol: 'ZBRA', ipoPrice: 20 },
    { name: 'Zimmer Biomet Holdings', symbol: 'ZBH', ipoPrice: 18 },
    { name: 'Zoetis Inc.', symbol: 'ZTS', ipoPrice: 22 },
  ];
  