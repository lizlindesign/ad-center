import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  Search, Download, Upload, Lock, Clock, User, X, Calendar, ChevronDown, Plus,
  HelpCircle, Bell, Check, CheckSquare, Square, Zap, Info, MinusSquare, Trash2,
  Eye, ChevronUp, Pencil, ChevronRight, Store, MapPin, Building2, Filter as FilterIcon
} from 'lucide-react';

// --- Constants ---
const FY2026_START = new Date('2025-02-02');
const FY2027_START = new Date('2026-02-01');
const MOCK_TODAY = new Date('2026-04-06');

const ADVERTISERS = [
  '3M','7-Eleven','Abbott','Activision Blizzard','Adidas','Adobe','Aetna','Airbnb','Albertsons','Aldi',
  'Allstate','Alphabet','Amazon','AMD','American Express','Amway','Anheuser-Busch','Apple','Aramark','Archer Daniels Midland',
  'AT&T','Audi','AutoZone','Avery Dennison','Avon','Band-Aid','Barilla','Bath & Body Works','Bayer','Beam Suntory',
  'Beats by Dre','Ben & Jerry\'s','Best Buy','Beyond Meat','BIC','Bird\'s Eye','Black & Decker','BMW','Bose','Boston Scientific',
  'Bounty','Braun','Brita','Brooks Running','Budweiser','Bumble Bee','Burt\'s Bees','Bush\'s Beans','Calvin Klein','Campbell\'s',
  'Canon','Capital One','Cargill','Carlsberg','Carhartt','Cascade','Caterpillar','Celsius','Chanel','Charmin',
  'Chase','Cheerios','Cheetos','Chevron','Chick-fil-A','Chobani','Church & Dwight','Cisco','Citi','Clif Bar',
  'Clorox','Coach','Coca-Cola','Colgate-Palmolive','Columbia Sportswear','Comcast','ConAgra','Converse','Corning','Costco',
  'Coty','Cracker Barrel','Crayola','Crocs','Crown Royal','CVS Health','Dannon','Dawn','De Beers','Del Monte',
  'Dell','Delta Air Lines','Diageo','Diamond Foods','Dior','Discovery','Disney','Dockers','Dole','Dollar General',
  'Dollar Tree','Domino\'s','Doritos','Dove','Dr Pepper','Driscoll\'s','Duracell','Dyson','EA Sports','Eastman Kodak',
  'eBay','Ecover','Edgewell','Electrolux','Eli Lilly','Energizer','Epson','Essentia Water','Estée Lauder','Etsy',
  'ExxonMobil','Fanta','FedEx','Ferrero','Fila','Fisher-Price','Fitbit','Folgers','Food Lion','Ford',
  'Fossil','Frito-Lay','Fruit of the Loom','Gatorade','GE Appliances','General Mills','General Motors','Gerber','Gillette','Glad',
  'GlaxoSmithKline','Godiva','Gold Bond','Goodyear','Google','GoPro','Goya','Green Giant','Gucci','H&M',
  'Häagen-Dazs','Hallmark','Hanes','Harley-Davidson','Harry\'s','Hasbro','Head & Shoulders','Heineken','Heinz','Hello Fresh',
  'Henkel','Hershey\'s','Hewlett-Packard','Hidden Valley','Hillshire Farm','Honest Company','Honeywell','Hormel','HP','Huggies',
  'Hyundai','IKEA','Intel','iRobot','Jack Daniel\'s','JBL','Jeep','Jif','Jimmy Dean','John Deere',
  'Johnson & Johnson','Kashi','Kellogg\'s','Kenmore','Keurig Dr Pepper','KFC','Kia','Kimberly-Clark','Kind Snacks','KitchenAid',
  'Kleenex','Kodiak Cakes','Kraft Heinz','Kroger','L\'Oréal','La Croix','Land O\'Lakes','Lay\'s','Lean Cuisine','LEGO',
  'Lenovo','Levi\'s','LG','Lipton','Listerine','Logitech','Louis Vuitton','Lowe\'s','Lululemon','Lysol',
  'M&M\'s','Maker\'s Mark','Mars','Mastercard','Mattel','Maxwell House','Maytag','McCormick','McDonald\'s','Mercedes-Benz',
  'Meta','Method','Michelin','Microsoft','MillerCoors','Minute Maid','Modelo','Molson Coors','Mondelez','Monster Energy',
  'Mountain Dew','Mr. Clean','Nabisco','Nestlé','Netflix','Neutrogena','New Balance','Newman\'s Own','Nike','Nintendo',
  'Nissan','Nivea','Nokia','Nordstrom','North Face','Nvidia','Oatly','Ocean Spray','Olay','Old Navy',
  'Old Spice','Oral-B','Oreo','Oscar Mayer','OxiClean','Pampers','Panasonic','Pantene','Patagonia','Pedigree',
  'Pepsi','Perdue','Pfizer','Philadelphia Cream Cheese','Philips','Pillsbury','Planters','PlayStation','Polo Ralph Lauren','Pop-Tarts',
  'Prada','Prego','Pringles','Procter & Gamble','Progressive','Puma','Purell','Purina','Quaker Oats','Qualcomm',
  'Rao\'s','Ray-Ban','Reckitt','Red Bull','Reebok','Revlon','Reynolds','Ring','Ritz','Roku',
  'Rubbermaid','S.C. Johnson','Sabra','Samsung','Sargento','Schick','Scotch-Brite','Scott','Seventh Generation','Sharp',
  'Shell','Shiseido','Silk','Similac','Simple Green','Skechers','Skippy','Smartwater','Smuckers','Snapple',
  'Snickers','Sony','Spam','Spotify','Starbucks','State Farm','Subaru','Subway','Sun-Maid','Sunkist',
  'Swiffer','T-Mobile','Taco Bell','Target','Tesla','The Honest Company','Tide','Tiffany & Co.','TikTok','Tillamook',
  'Timberland','Tostitos','Toyota','Trader Joe\'s','Tropicana','Tums','Tupperware','Tylenol','Tyson Foods','Uber',
  'Under Armour','Unilever','United Airlines','UPS','USAA','V8','Vans','Vaseline','Verizon','Versace',
  'Visa','Vitamix','Vlasic','Volkswagen','Volvo','Walgreens','Walmart','Weber','Welch\'s','Wells Fargo',
  'Wendy\'s','Whirlpool','White Claw','Whole Foods','Windex','Wonderful Pistachios','Xbox','Xerox','Yakult','Yeti',
  'Yoplait','YouTube','Zara','Ziploc','Zoom','Zyrtec'
].sort();

const CATEGORIES = ['Electronics','Grocery','Health & Wellness','Home & Patio','Toys','Apparel','Automotive','Beauty'];
const MANAGERS = ['Sam Walton','Alice Glass','Robert Lewis','Sarah Chen','David Brooks'];
const FORMATS = ['Supercenter','Neighborhood Market','Sam\'s Club','Discount Store'];

const STATE_DATA = {
  AL:{name:'Alabama',cities:['Birmingham','Montgomery','Huntsville','Mobile','Tuscaloosa']},
  AK:{name:'Alaska',cities:['Anchorage','Fairbanks','Juneau']},
  AZ:{name:'Arizona',cities:['Phoenix','Tucson','Mesa','Chandler','Scottsdale','Gilbert','Glendale','Tempe','Peoria','Surprise']},
  AR:{name:'Arkansas',cities:['Little Rock','Fort Smith','Fayetteville','Springdale','Jonesboro','Rogers','Conway','Bentonville']},
  CA:{name:'California',cities:['Los Angeles','San Diego','San Jose','San Francisco','Fresno','Sacramento','Long Beach','Oakland','Bakersfield','Anaheim','Riverside','Stockton','Irvine','Chula Vista','Santa Ana','Fremont','Modesto','Fontana','San Bernardino','Moreno Valley']},
  CO:{name:'Colorado',cities:['Denver','Colorado Springs','Aurora','Fort Collins','Lakewood','Thornton','Arvada','Pueblo']},
  CT:{name:'Connecticut',cities:['Bridgeport','New Haven','Hartford','Stamford','Waterbury']},
  DE:{name:'Delaware',cities:['Wilmington','Dover','Newark']},
  FL:{name:'Florida',cities:['Jacksonville','Miami','Tampa','Orlando','St. Petersburg','Hialeah','Tallahassee','Fort Lauderdale','Cape Coral','Pembroke Pines','Hollywood','Gainesville','Miramar','Coral Springs','Palm Bay','Lakeland']},
  GA:{name:'Georgia',cities:['Atlanta','Augusta','Columbus','Savannah','Athens','Sandy Springs','Macon','Roswell','Albany']},
  HI:{name:'Hawaii',cities:['Honolulu','Pearl City','Hilo']},
  ID:{name:'Idaho',cities:['Boise','Meridian','Nampa','Idaho Falls','Pocatello']},
  IL:{name:'Illinois',cities:['Chicago','Aurora','Naperville','Joliet','Rockford','Springfield','Elgin','Peoria','Champaign']},
  IN:{name:'Indiana',cities:['Indianapolis','Fort Wayne','Evansville','South Bend','Carmel','Fishers','Bloomington','Hammond']},
  IA:{name:'Iowa',cities:['Des Moines','Cedar Rapids','Davenport','Sioux City','Iowa City','Waterloo']},
  KS:{name:'Kansas',cities:['Wichita','Overland Park','Kansas City','Olathe','Topeka','Lawrence']},
  KY:{name:'Kentucky',cities:['Louisville','Lexington','Bowling Green','Owensboro','Covington']},
  LA:{name:'Louisiana',cities:['New Orleans','Baton Rouge','Shreveport','Lafayette','Lake Charles','Kenner']},
  ME:{name:'Maine',cities:['Portland','Lewiston','Bangor']},
  MD:{name:'Maryland',cities:['Baltimore','Columbia','Germantown','Silver Spring','Waldorf','Frederick']},
  MA:{name:'Massachusetts',cities:['Boston','Worcester','Springfield','Cambridge','Lowell','Brockton','New Bedford']},
  MI:{name:'Michigan',cities:['Detroit','Grand Rapids','Warren','Sterling Heights','Ann Arbor','Lansing','Flint','Dearborn','Livonia']},
  MN:{name:'Minnesota',cities:['Minneapolis','Saint Paul','Rochester','Bloomington','Duluth','Brooklyn Park']},
  MS:{name:'Mississippi',cities:['Jackson','Gulfport','Southaven','Hattiesburg','Biloxi']},
  MO:{name:'Missouri',cities:['Kansas City','St. Louis','Springfield','Columbia','Independence','Lee\'s Summit']},
  MT:{name:'Montana',cities:['Billings','Missoula','Great Falls','Bozeman']},
  NE:{name:'Nebraska',cities:['Omaha','Lincoln','Bellevue','Grand Island']},
  NV:{name:'Nevada',cities:['Las Vegas','Henderson','Reno','North Las Vegas','Sparks']},
  NH:{name:'New Hampshire',cities:['Manchester','Nashua','Concord']},
  NJ:{name:'New Jersey',cities:['Newark','Jersey City','Paterson','Elizabeth','Edison','Woodbridge','Lakewood','Toms River','Hamilton','Trenton']},
  NM:{name:'New Mexico',cities:['Albuquerque','Las Cruces','Rio Rancho','Santa Fe','Roswell']},
  NY:{name:'New York',cities:['New York City','Buffalo','Rochester','Yonkers','Syracuse','Albany','New Rochelle','Mount Vernon','Schenectady','Utica']},
  NC:{name:'North Carolina',cities:['Charlotte','Raleigh','Greensboro','Durham','Winston-Salem','Fayetteville','Cary','Wilmington','High Point','Concord']},
  ND:{name:'North Dakota',cities:['Fargo','Bismarck','Grand Forks','Minot']},
  OH:{name:'Ohio',cities:['Columbus','Cleveland','Cincinnati','Toledo','Akron','Dayton','Parma','Canton','Youngstown']},
  OK:{name:'Oklahoma',cities:['Oklahoma City','Tulsa','Norman','Broken Arrow','Edmond','Lawton']},
  OR:{name:'Oregon',cities:['Portland','Salem','Eugene','Gresham','Hillsboro','Bend','Beaverton','Medford']},
  PA:{name:'Pennsylvania',cities:['Philadelphia','Pittsburgh','Allentown','Reading','Scranton','Bethlehem','Lancaster','Harrisburg','Erie']},
  RI:{name:'Rhode Island',cities:['Providence','Warwick','Cranston']},
  SC:{name:'South Carolina',cities:['Charleston','Columbia','North Charleston','Mount Pleasant','Rock Hill','Greenville','Summerville']},
  SD:{name:'South Dakota',cities:['Sioux Falls','Rapid City','Aberdeen']},
  TN:{name:'Tennessee',cities:['Nashville','Memphis','Knoxville','Chattanooga','Clarksville','Murfreesboro','Franklin']},
  TX:{name:'Texas',cities:['Houston','San Antonio','Dallas','Austin','Fort Worth','El Paso','Arlington','Corpus Christi','Plano','Laredo','Lubbock','Garland','Irving','Amarillo','Grand Prairie','Brownsville','McKinney','Frisco','Pasadena','Mesquite']},
  UT:{name:'Utah',cities:['Salt Lake City','West Valley City','Provo','West Jordan','Orem','Sandy','Ogden','St. George']},
  VT:{name:'Vermont',cities:['Burlington','South Burlington','Rutland']},
  VA:{name:'Virginia',cities:['Virginia Beach','Norfolk','Chesapeake','Richmond','Newport News','Alexandria','Hampton','Roanoke','Portsmouth','Lynchburg']},
  WA:{name:'Washington',cities:['Seattle','Spokane','Tacoma','Vancouver','Bellevue','Kent','Everett','Renton','Federal Way','Yakima']},
  WV:{name:'West Virginia',cities:['Charleston','Huntington','Morgantown','Parkersburg']},
  WI:{name:'Wisconsin',cities:['Milwaukee','Madison','Green Bay','Kenosha','Racine','Appleton','Waukesha','Oshkosh']},
  WY:{name:'Wyoming',cities:['Cheyenne','Casper','Laramie','Gillette']}
};

const REGIONS = {
  Northeast:['CT','DE','MA','MD','ME','NH','NJ','NY','PA','RI','VT'],
  Southeast:['AL','AR','FL','GA','KY','LA','MS','NC','SC','TN','VA','WV'],
  Midwest:['IA','IL','IN','KS','MI','MN','MO','ND','NE','OH','SD','WI'],
  Southwest:['AZ','NM','OK','TX'],
  West:['AK','CA','CO','HI','ID','MT','NV','OR','UT','WA','WY']
};

const REGION_FOR_STATE = {};
Object.entries(REGIONS).forEach(([region, states]) => states.forEach(s => { REGION_FOR_STATE[s] = region; }));

// Generate ~4700 stores
const generateStores = () => {
  const stores = [];
  let storeNum = 1001;
  const stateEntries = Object.entries(STATE_DATA);
  stateEntries.forEach(([abbr, data]) => {
    const baseCount = abbr === 'TX' ? 380 : abbr === 'CA' ? 320 : abbr === 'FL' ? 260 :
      ['NY','IL','OH','PA','GA','NC','MI'].includes(abbr) ? 140 :
      ['VA','TN','IN','MO','WI','MN','AL','LA','SC','AZ','CO','OK','KY','OR','WA','NJ','MA','MD'].includes(abbr) ? 80 :
      ['IA','KS','AR','MS','NE','NV','NM','UT','CT','WV','ID','HI','NH','ME','MT','ND','SD','RI','DE','VT','WY','AK'].includes(abbr) ? 30 : 50;
    const count = baseCount + Math.floor(Math.random() * 20) - 10;
    for (let i = 0; i < Math.max(count, 3); i++) {
      const city = data.cities[i % data.cities.length];
      stores.push({
        id: String(storeNum++),
        city,
        state: abbr,
        stateName: data.name,
        region: REGION_FOR_STATE[abbr],
        format: FORMATS[Math.floor(Math.random() * FORMATS.length)],
        zip: String(10001 + Math.floor(Math.random() * 89999))
      });
    }
  });
  return stores;
};

const ALL_STORES = generateStores();
const STORES_BY_STATE = {};
ALL_STORES.forEach(s => {
  if (!STORES_BY_STATE[s.state]) STORES_BY_STATE[s.state] = [];
  STORES_BY_STATE[s.state].push(s);
});
const STATE_KEYS = Object.keys(STORES_BY_STATE).sort();

// Fiscal weeks
const generateFiscalWeeks = (baseDate, fiscalYearStart) => Array.from({ length: 52 }, (_, i) => {
  const start = new Date(baseDate);
  start.setDate(start.getDate() + (i * 7));
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const diffInDays = Math.floor((start - fiscalYearStart) / (1000 * 60 * 60 * 24));
  let weekNum = (Math.floor(diffInDays / 7) % 52) + 1;
  if (weekNum <= 0) weekNum += 52;
  const fmt = (d) => d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
  return { id: i + 1, weekNumber: weekNum, label: `WM Week ${weekNum}`, dates: `${fmt(start)} - ${fmt(end)}`, startDate: start, endDate: end };
});

const RUNNING_START = new Date(2026, 3, 5);
const WEEKS_FY2026 = generateFiscalWeeks(FY2026_START, FY2026_START);
const WEEKS_FY2027 = generateFiscalWeeks(FY2027_START, FY2027_START);
const RUNNING_WEEKS = generateFiscalWeeks(RUNNING_START, FY2027_START);

// Slot data keyed by storeId-weekId
const SLOT_DATA = {};
const populateSlots = () => {
  ALL_STORES.forEach(store => {
    let wp = 1;
    while (wp <= 52) {
      const chance = wp <= 20 ? 0.06 : 0.02;
      if (Math.random() < chance) {
        const span = Math.floor(Math.random() * 2) + 1;
        const roll = Math.random();
        const isBooked = roll < 0.35;
        const isIo = !isBooked && Math.random() < 0.5;
        const adv = ADVERTISERS[Math.floor(Math.random() * ADVERTISERS.length)];
        const dur = `Wk ${wp}-${Math.min(52, wp + span - 1)}`;
        for (let s = 0; s < span && (wp + s) <= 52; s++) {
          const key = `${store.id}-${wp + s}`;
          if (isBooked) {
            SLOT_DATA[key] = { booked: { advertiser: adv, product: 'Campaign Plan', cm: 'S. Walton', date: 'Feb 15', weeks: dur }, ios: [], interests: [] };
          } else if (isIo) {
            SLOT_DATA[key] = { booked: null, ios: [{ advertiser: adv, product: 'Campaign Plan', cm: 'S. Walton', date: 'Feb 15', weeks: dur }], interests: [] };
          } else {
            SLOT_DATA[key] = { booked: null, ios: [], interests: [{ advertiser: adv, product: 'Campaign Plan', cm: 'S. Walton', date: 'Feb 15', weeks: dur }] };
          }
        }
        wp += span + 4;
      } else wp++;
    }
  });
};
populateSlots();

// --- Helper Components ---
const DetailRow = ({ rowData }) => (
  <div className="flex items-center py-4 border-b border-slate-200 last:border-0 px-2 hover:bg-slate-50 transition-colors">
    <div className="w-[20%] font-bold text-sm truncate pr-2 uppercase">{rowData.advertiser}</div>
    <div className="w-[18%] text-slate-600 text-sm truncate pr-4">{rowData.product}</div>
    <div className="w-[18%] text-slate-500 text-sm truncate pr-2">{rowData.cm}</div>
    <div className="w-[12%] text-slate-500 text-sm pr-2">{rowData.date}</div>
    <div className="w-[15%] text-slate-700 text-sm font-bold">{rowData.weeks}</div>
    <div className="w-[17%] flex items-center justify-end gap-3 pr-2">
      <div className="flex items-center gap-1.5">
        <button className="p-1.5 rounded hover:bg-blue-50 text-slate-400 hover:text-[#0071CE] transition-colors"><Pencil size={14} /></button>
        <button className="p-1.5 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-colors"><Trash2 size={14} /></button>
      </div>
    </div>
  </div>
);

const AdvertiserTypeahead = ({ value, onChange }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const containerRef = useRef(null);
  const listRef = useRef(null);
  const inputRef = useRef(null);

  const filtered = useMemo(() => {
    if (query.length < 3) return ADVERTISERS;
    const q = query.toLowerCase();
    return ADVERTISERS.filter(a => a.toLowerCase().includes(q));
  }, [query]);

  const letterGroups = useMemo(() => {
    const groups = {};
    filtered.forEach(a => { const l = a[0].toUpperCase(); if (!groups[l]) groups[l] = []; groups[l].push(a); });
    return groups;
  }, [filtered]);

  useEffect(() => {
    const h = (e) => { if (containerRef.current && !containerRef.current.contains(e.target)) setIsOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => { setHighlightIdx(-1); if (listRef.current) listRef.current.scrollTop = 0; }, [query]);

  const handleSelect = (adv) => { onChange(adv); setQuery(''); setIsOpen(false); };
  const handleKeyDown = (e) => {
    if (!isOpen) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlightIdx(i => Math.min(i + 1, filtered.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlightIdx(i => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter' && highlightIdx >= 0) { e.preventDefault(); handleSelect(filtered[highlightIdx]); }
    else if (e.key === 'Escape') setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className={`flex items-center w-full h-[46px] border rounded-md bg-white shadow-sm transition-colors ${isOpen ? 'border-[#0071CE]' : 'border-slate-300'}`}>
        <Search size={16} className="ml-4 text-slate-400 shrink-0" />
        <input ref={inputRef} type="text" value={isOpen ? query : (value || '')} placeholder={value || 'Search advertiser...'} onFocus={() => { setIsOpen(true); setQuery(''); }} onChange={(e) => { setQuery(e.target.value); if (!isOpen) setIsOpen(true); }} onKeyDown={handleKeyDown} className="flex-1 h-full px-3 outline-none font-bold text-slate-800 text-sm bg-transparent placeholder-slate-400" />
        {value && !isOpen && <button onClick={(e) => { e.stopPropagation(); onChange(''); inputRef.current?.focus(); }} className="pr-3 text-slate-400 hover:text-slate-600"><X size={16} strokeWidth={3} /></button>}
        <ChevronDown size={16} className={`mr-4 text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      {isOpen && (
        <div ref={listRef} className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-2xl z-[3000] max-h-[280px] overflow-y-auto">
          {query.length > 0 && query.length < 3 && <div className="px-4 py-3 text-xs text-slate-400 font-medium">Type at least 3 characters to search...</div>}
          {query.length >= 3 && filtered.length === 0 && <div className="px-4 py-6 text-sm text-slate-400 text-center">No advertisers match "<span className="font-bold text-slate-600">{query}</span>"</div>}
          {Object.keys(letterGroups).sort().map(letter => (
            <div key={letter}>
              <div className="sticky top-0 px-4 py-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 border-b border-slate-100">{letter}</div>
              {letterGroups[letter].map(adv => {
                const fi = filtered.indexOf(adv);
                return <button key={adv} onClick={() => handleSelect(adv)} onMouseEnter={() => setHighlightIdx(fi)} className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${fi === highlightIdx ? 'bg-blue-50 text-[#0071CE] font-bold' : value === adv ? 'text-[#0071CE] font-bold bg-blue-50/50' : 'text-slate-700 hover:bg-slate-50 font-medium'}`}>{adv}</button>;
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Aggregate cell data for a group of stores
const aggregateCell = (storeIds, weekId) => {
  let booked = 0, ios = 0, interests = 0, available = 0;
  storeIds.forEach(sid => {
    const d = SLOT_DATA[`${sid}-${weekId}`];
    if (d?.booked) booked++;
    else if (d?.ios?.length > 0) ios++;
    else if (d?.interests?.length > 0) interests++;
    else available++;
  });
  return { booked, ios, interests, available, total: storeIds.length };
};

// --- Main App ---
export default function App() {
  const [selectedStores, setSelectedStores] = useState(new Set());
  const [weekRange, setWeekRange] = useState({ start: null, end: null });
  const [hoverWeek, setHoverWeek] = useState(null);
  const [isReserving, setIsReserving] = useState(false);
  const [viewDetailSlot, setViewDetailSlot] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('Store #');
  const [isSearchTypeDropdownOpen, setIsSearchTypeDropdownOpen] = useState(false);
  const [isWeekFilterOpen, setIsWeekFilterOpen] = useState(false);
  const [actionTooltip, setActionTooltip] = useState(null);
  const [weekFilterMode, setWeekFilterMode] = useState('52running');
  const [customDates, setCustomDates] = useState({ start: MOCK_TODAY.toISOString().split('T')[0], end: new Date(MOCK_TODAY.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] });
  const [expandedStates, setExpandedStates] = useState(new Set());
  const [activeCursor, setActiveCursor] = useState({ rowKey: null, weekId: null });
  const [isScrolled, setIsScrolled] = useState(false);

  // Filters
  const [filterRegion, setFilterRegion] = useState('');
  const [filterState, setFilterState] = useState('');
  const [filterFormat, setFilterFormat] = useState('');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  // Reserve form
  const [advertiser, setAdvertiser] = useState('');
  const [reserveStatus, setReserveStatus] = useState('interest');
  const [ioStatus, setIoStatus] = useState('Draft');
  const [ioName, setIoName] = useState('');
  const [ioNumber, setIoNumber] = useState('');
  const [campaignName, setCampaignName] = useState('');
  const [brandProduct, setBrandProduct] = useState('');
  const [adGroupName, setAdGroupName] = useState('');
  const [category, setCategory] = useState('');
  const [campaignManager, setCampaignManager] = useState('');
  const [notes, setNotes] = useState('');

  const [isIosExpanded, setIsIosExpanded] = useState(false);
  const [isInterestsExpanded, setIsInterestsExpanded] = useState(false);

  const gridScrollRef = useRef(null);
  const searchTypeRef = useRef(null);
  const weekFilterRef = useRef(null);
  const filterPanelRef = useRef(null);

  // Filtered stores
  const filteredStores = useMemo(() => {
    let result = ALL_STORES;
    if (filterRegion) result = result.filter(s => s.region === filterRegion);
    if (filterState) result = result.filter(s => s.state === filterState);
    if (filterFormat) result = result.filter(s => s.format === filterFormat);
    if (searchTerm) {
      const term = searchTerm.toLowerCase().trim();
      const parts = term.split(',').map(p => p.trim()).filter(Boolean);
      if (searchType === 'Store #') result = result.filter(s => parts.some(p => s.id.includes(p)));
      else if (searchType === 'City') result = result.filter(s => parts.some(p => s.city.toLowerCase().includes(p)));
      else if (searchType === 'Zip') result = result.filter(s => parts.some(p => s.zip.includes(p)));
    }
    return result;
  }, [filterRegion, filterState, filterFormat, searchTerm, searchType]);

  const filteredStoreIds = useMemo(() => new Set(filteredStores.map(s => s.id)), [filteredStores]);

  const filteredByState = useMemo(() => {
    const map = {};
    filteredStores.forEach(s => { if (!map[s.state]) map[s.state] = []; map[s.state].push(s); });
    return map;
  }, [filteredStores]);

  const filteredStateKeys = useMemo(() => Object.keys(filteredByState).sort(), [filteredByState]);

  const activeRange = useMemo(() => {
    if (!weekRange.start) return null;
    const end = weekRange.end || hoverWeek || weekRange.start;
    return { min: Math.min(weekRange.start, end), max: Math.max(weekRange.start, end) };
  }, [weekRange, hoverWeek]);

  const selectionCount = useMemo(() => {
    if (!selectedStores.size) return 0;
    const wCount = activeRange ? (activeRange.max - activeRange.min + 1) : (weekRange.start ? 1 : 0);
    return selectedStores.size * wCount;
  }, [selectedStores.size, activeRange, weekRange.start]);

  const canReserve = useMemo(() => selectedStores.size > 0 && weekRange.end !== null, [selectedStores.size, weekRange.end]);

  const translatedWeeksRange = useMemo(() => {
    const sDate = new Date(customDates.start);
    const eDate = new Date(customDates.end);
    const findWeekIdx = (date) => { const d = Math.floor((date - FY2027_START) / (1000 * 60 * 60 * 24)); return Math.floor(d / 7) + 1; };
    const s = findWeekIdx(sDate); const e = findWeekIdx(eDate);
    if (s <= 0 || e <= 0) return { start: 1, end: 52, label: 'Wk ? - ?' };
    return { start: Math.min(s, e), end: Math.max(s, e), label: `Wk ${Math.min(s, e)} - ${Math.max(s, e)}` };
  }, [customDates]);

  const weekFilterButtonLabel = useMemo(() => {
    if (weekFilterMode === '52running') return '52 running weeks';
    if (weekFilterMode === 'fy2026') return 'FY 2026';
    if (weekFilterMode === 'fy2027') return 'FY 2027';
    return translatedWeeksRange.label;
  }, [weekFilterMode, translatedWeeksRange]);

  const displayWeeks = useMemo(() => {
    if (weekFilterMode === 'fy2026') return WEEKS_FY2026;
    if (weekFilterMode === 'fy2027') return WEEKS_FY2027;
    if (weekFilterMode === '52running') return RUNNING_WEEKS;
    return WEEKS_FY2027.filter(w => w.id >= translatedWeeksRange.start && w.id <= translatedWeeksRange.end);
  }, [weekFilterMode, translatedWeeksRange]);

  const isAnyFilterActive = filterRegion || filterState || filterFormat || searchTerm;

  // Handlers
  const handleWeekHeaderClick = (weekId) => {
    if (!weekRange.start || (weekRange.start && weekRange.end)) setWeekRange({ start: weekId, end: null });
    else setWeekRange(prev => ({ ...prev, end: weekId }));
  };

  const toggleStateExpand = (st) => {
    const next = new Set(expandedStates);
    if (next.has(st)) next.delete(st); else next.add(st);
    setExpandedStates(next);
  };

  const selectAllInState = (st) => {
    const next = new Set(selectedStores);
    const stores = filteredByState[st] || [];
    const allSelected = stores.every(s => next.has(s.id));
    stores.forEach(s => { if (allSelected) next.delete(s.id); else next.add(s.id); });
    setSelectedStores(next);
  };

  const toggleStore = (id) => {
    const next = new Set(selectedStores);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedStores(next);
  };

  const selectAllFiltered = () => {
    const next = new Set(selectedStores);
    const allSelected = filteredStores.every(s => next.has(s.id));
    filteredStores.forEach(s => { if (allSelected) next.delete(s.id); else next.add(s.id); });
    setSelectedStores(next);
  };

  const allFilteredSelected = useMemo(() => filteredStores.length > 0 && filteredStores.every(s => selectedStores.has(s.id)), [filteredStores, selectedStores]);
  const someFilteredSelected = useMemo(() => filteredStores.some(s => selectedStores.has(s.id)), [filteredStores, selectedStores]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchTypeRef.current && !searchTypeRef.current.contains(e.target)) setIsSearchTypeDropdownOpen(false);
      if (weekFilterRef.current && !weekFilterRef.current.contains(e.target)) setIsWeekFilterOpen(false);
      if (filterPanelRef.current && !filterPanelRef.current.contains(e.target)) setIsFilterPanelOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    const scrollEl = gridScrollRef.current;
    const handleScroll = () => setIsScrolled(scrollEl.scrollTop > 0);
    if (scrollEl) scrollEl.addEventListener('scroll', handleScroll, { passive: true });
    return () => { document.removeEventListener('mousedown', handleClickOutside); if (scrollEl) scrollEl.removeEventListener('scroll', handleScroll); };
  }, []);

  // Mini bar for aggregated cells
  const MiniBar = ({ data }) => {
    const { booked, ios, interests, available, total } = data;
    if (total === 0) return null;
    const w = (n) => `${(n / total * 100).toFixed(1)}%`;
    return (
      <div className="w-full px-2">
        <div className="w-full h-2 rounded-full overflow-hidden flex bg-slate-100">
          {booked > 0 && <div className="bg-rose-400 h-full" style={{ width: w(booked) }} />}
          {ios > 0 && <div className="bg-amber-400 h-full" style={{ width: w(ios) }} />}
          {interests > 0 && <div className="bg-green-400 h-full" style={{ width: w(interests) }} />}
          {available > 0 && <div className="bg-slate-200 h-full" style={{ width: w(available) }} />}
        </div>
        <div className="flex justify-center gap-2 mt-1.5 text-[9px] font-bold text-slate-500">
          {booked > 0 && <span className="text-rose-600">{booked}B</span>}
          {ios > 0 && <span className="text-amber-600">{ios}IO</span>}
          {interests > 0 && <span className="text-green-700">{interests}I</span>}
          <span className="text-slate-400">{available}A</span>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden relative">
      {/* Sidebar */}
      <aside className="w-16 flex flex-col items-center py-6 bg-[#004F91] border-r border-slate-200 gap-8 z-50 shrink-0 shadow-lg">
        <div className="w-10 h-10 bg-[#FFC220] rounded-xl flex items-center justify-center text-[#004F91] font-bold text-lg shadow-inner">W</div>
        <nav className="flex flex-col gap-6 text-white/60">
          <Calendar className="text-white cursor-pointer" size={22} /><User size={22} /><Bell size={22} /><div className="mt-auto"><HelpCircle size={22} /></div>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top header */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0 z-40">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Inventory Calendar</h1>
          <div className="flex items-center gap-4 text-sm font-medium text-slate-500"><User size={18} className="text-slate-400" /><span>Sam Walton</span><ChevronDown size={14} /></div>
        </header>

        {/* Toolbar */}
        <div className="bg-white border-b border-slate-200 px-8 py-3 flex items-center justify-between shrink-0 z-[300] shadow-sm gap-4 overflow-visible">
          {/* Search */}
          <div className="flex-1 flex items-center bg-slate-100 border border-slate-200 rounded-xl h-11 relative max-w-xl">
            <div className="relative h-full flex items-center" ref={searchTypeRef}>
              <button onClick={() => setIsSearchTypeDropdownOpen(!isSearchTypeDropdownOpen)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 border-r border-slate-200 h-full rounded-l-xl hover:bg-slate-200 transition-colors">
                <Search size={16} />
                <span className="whitespace-nowrap font-normal text-slate-500">Search by <span className="font-bold text-slate-700">{searchType}</span></span>
                <ChevronDown size={14} className={isSearchTypeDropdownOpen ? 'rotate-180' : ''} />
              </button>
              {isSearchTypeDropdownOpen && (
                <div className="absolute top-[110%] left-0 w-48 bg-white border border-slate-200 rounded-lg shadow-2xl z-[500] overflow-hidden">
                  {['Store #', 'City', 'Zip'].map(type => (
                    <button key={type} onClick={() => { setSearchType(type); setIsSearchTypeDropdownOpen(false); setSearchTerm(''); }} className={`w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-blue-50 transition-colors ${searchType === type ? 'text-[#0071CE] bg-blue-50 font-bold' : ''}`}>{type}</button>
                  ))}
                </div>
              )}
            </div>
            <input type="text" placeholder={searchType === 'Store #' ? 'e.g. 1001, 2045...' : searchType === 'City' ? 'e.g. Houston, Dallas...' : 'e.g. 75001, 90210...'} className="flex-1 bg-transparent px-4 py-2.5 text-sm outline-none font-medium text-slate-800 h-full" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            {searchTerm && <button onClick={() => setSearchTerm('')} className="p-2 text-slate-400 hover:text-slate-600 transition-colors mr-1"><X size={14} strokeWidth={3} /></button>}
          </div>

          {/* Filters */}
          <div className="relative" ref={filterPanelRef}>
            <button onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)} className={`flex items-center gap-2 px-4 h-11 border rounded-lg transition-all text-sm font-bold ${isAnyFilterActive ? 'border-[#0071CE] text-[#0071CE] bg-blue-50' : 'border-slate-300 text-slate-600 hover:bg-slate-50'}`}>
              <FilterIcon size={16} /> Filters {isAnyFilterActive && <span className="bg-[#0071CE] text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">{[filterRegion, filterState, filterFormat].filter(Boolean).length}</span>}
            </button>
            {isFilterPanelOpen && (
              <div className="absolute top-full right-0 mt-2 w-[320px] bg-white border border-slate-200 rounded-xl shadow-2xl z-[600] p-5 space-y-4">
                <div className="flex items-center justify-between"><span className="text-sm font-black text-slate-700 uppercase tracking-tight">Filter Stores</span>{isAnyFilterActive && <button onClick={() => { setFilterRegion(''); setFilterState(''); setFilterFormat(''); setSearchTerm(''); }} className="text-[11px] font-bold text-rose-600 underline">Clear all</button>}</div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-tight">Region</label>
                  <select value={filterRegion} onChange={e => { setFilterRegion(e.target.value); setFilterState(''); }} className="w-full h-10 px-3 border border-slate-300 rounded-lg text-sm font-bold outline-none focus:border-[#0071CE] bg-white">
                    <option value="">All regions</option>
                    {Object.keys(REGIONS).map(r => <option key={r} value={r}>{r} ({REGIONS[r].length} states)</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-tight">State</label>
                  <select value={filterState} onChange={e => setFilterState(e.target.value)} className="w-full h-10 px-3 border border-slate-300 rounded-lg text-sm font-bold outline-none focus:border-[#0071CE] bg-white">
                    <option value="">All states</option>
                    {(filterRegion ? REGIONS[filterRegion] : STATE_KEYS).map(st => <option key={st} value={st}>{STATE_DATA[st]?.name} ({(STORES_BY_STATE[st] || []).length})</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-tight">Store Format</label>
                  <select value={filterFormat} onChange={e => setFilterFormat(e.target.value)} className="w-full h-10 px-3 border border-slate-300 rounded-lg text-sm font-bold outline-none focus:border-[#0071CE] bg-white">
                    <option value="">All formats</option>
                    {FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div className="pt-2 border-t border-slate-100 text-xs font-bold text-slate-500">{filteredStores.length.toLocaleString()} stores match</div>
              </div>
            )}
          </div>

          {/* Week filter */}
          <div className="relative" ref={weekFilterRef}>
            <button onClick={() => setIsWeekFilterOpen(!isWeekFilterOpen)} className={`flex items-center gap-2 px-4 h-11 border rounded-lg transition-all text-sm font-bold ${isWeekFilterOpen ? 'border-[#0071CE] text-[#0071CE] bg-blue-50 shadow-sm' : 'border-slate-300 text-slate-600 hover:bg-slate-50'}`}>
              {weekFilterButtonLabel} <ChevronDown size={14} className={isWeekFilterOpen ? 'rotate-180' : ''} />
            </button>
            {isWeekFilterOpen && (
              <div className="absolute top-full right-0 mt-2 w-[480px] bg-white border border-slate-200 rounded-xl shadow-2xl z-[600] p-6">
                <div className="space-y-5">
                  {[{ id: '52running', label: '52 running weeks' }, { id: 'fy2026', label: 'FY 2026' }, { id: 'fy2027', label: 'FY 2027' }, { id: 'custom', label: 'Custom week range' }].map(opt => (
                    <label key={opt.id} className="flex items-center gap-4 cursor-pointer">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${weekFilterMode === opt.id ? 'border-[#0071CE]' : 'border-slate-300'}`}>{weekFilterMode === opt.id && <div className="w-2.5 h-2.5 rounded-full bg-[#0071CE]" />}</div>
                      <input type="radio" className="sr-only" checked={weekFilterMode === opt.id} onChange={() => setWeekFilterMode(opt.id)} />
                      <span className="text-sm font-black text-slate-800">{opt.label}</span>
                    </label>
                  ))}
                  <div className={`grid grid-cols-2 gap-6 pt-2 transition-opacity duration-200 ${weekFilterMode === 'custom' ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                    <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-tight">Start week</label><input type="date" value={customDates.start} onChange={(e) => setCustomDates({ ...customDates, start: e.target.value })} className="w-full h-11 px-3 border border-slate-300 rounded-lg text-sm font-bold outline-none focus:border-[#0071CE]" /></div>
                    <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-tight">End week</label><input type="date" value={customDates.end} onChange={(e) => setCustomDates({ ...customDates, end: e.target.value })} className="w-full h-11 px-3 border border-slate-300 rounded-lg text-sm font-bold outline-none focus:border-[#0071CE]" /></div>
                  </div>
                  <div className="text-[11px] font-bold text-slate-400 leading-none h-4">{weekFilterMode === 'custom' ? `Walmart ${translatedWeeksRange.label}` : ''}</div>
                  <div className="flex justify-end gap-4 pt-4 border-t border-slate-200"><button onClick={() => setIsWeekFilterOpen(false)} className="text-sm font-bold text-slate-500 hover:text-slate-700">Cancel</button><button onClick={() => setIsWeekFilterOpen(false)} className="px-8 py-2.5 bg-[#0071CE] text-white rounded-full font-black text-sm hover:bg-[#004F91] shadow-md">Apply</button></div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button onMouseEnter={(e) => setActionTooltip({ tip: 'Upload CSV', rect: e.currentTarget.getBoundingClientRect() })} onMouseLeave={() => setActionTooltip(null)} className="p-2.5 text-slate-500 border border-slate-300 rounded-lg hover:bg-blue-50 transition-all"><Upload size={18} /></button>
            <button onMouseEnter={(e) => setActionTooltip({ tip: 'Download CSV', rect: e.currentTarget.getBoundingClientRect() })} onMouseLeave={() => setActionTooltip(null)} className="p-2.5 text-slate-500 border border-slate-300 rounded-lg hover:bg-blue-50 transition-all"><Download size={18} /></button>
          </div>

          <button onClick={() => setIsReserving(true)} disabled={!canReserve} className={`px-8 h-11 rounded-xl text-sm font-black transition-all shadow-lg min-w-[180px] ${canReserve ? 'bg-[#0071CE] text-white shadow-[#0071CE]/20 hover:bg-[#004F91]' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>
            Reserve {selectionCount > 0 ? selectionCount.toLocaleString() : ''} slots
          </button>
        </div>

        {/* Legend + Selection Summary */}
        <div className="px-8 py-3 bg-white border-b border-slate-100 flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center gap-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <div className="flex items-center gap-2.5"><div className="w-5 h-5 rounded bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600"><Lock size={12} strokeWidth={3} /></div>Booked</div>
            <div className="flex items-center gap-2.5"><div className="w-5 h-5 rounded bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600"><Clock size={12} strokeWidth={3} /></div>IO in progress</div>
            <div className="flex items-center gap-2.5"><div className="w-5 h-5 rounded bg-green-50 border border-green-200 flex items-center justify-center text-green-700"><Zap size={12} fill="currentColor" className="fill-green-700/20" /></div>Interest</div>
            <div className="flex items-center gap-2.5"><div className="w-5 h-5 rounded bg-slate-50 border border-slate-300 flex items-center justify-center text-slate-400"><Square size={12} strokeWidth={3} /></div>Available</div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {selectedStores.size > 0 && <div className="flex items-center bg-[#E5F1FF] text-[#0071CE] px-3 py-1.5 rounded-full text-xs font-black border border-blue-100 shadow-sm"><Store size={14} className="mr-1.5" />{selectedStores.size.toLocaleString()} stores<button onClick={() => setSelectedStores(new Set())} className="ml-2 hover:text-[#004F91]"><X size={14} strokeWidth={4} /></button></div>}
            {weekRange.start && <div className="flex items-center bg-[#E5F1FF] text-[#0071CE] px-3 py-1.5 rounded-full text-xs font-black border border-blue-100 shadow-sm">WM Week {activeRange?.min}{activeRange && activeRange.max > activeRange.min ? ` - ${activeRange.max}` : ''}<button onClick={() => setWeekRange({ start: null, end: null })} className="ml-2 hover:text-[#004F91]"><X size={14} strokeWidth={4} /></button></div>}
            {(selectedStores.size > 0 || weekRange.start) && <button onClick={() => { setSelectedStores(new Set()); setWeekRange({ start: null, end: null }); }} className="text-[11px] font-black uppercase text-rose-600 hover:text-rose-800 underline ml-2">Clear all</button>}
          </div>
        </div>

        {/* Grid */}
        <div ref={gridScrollRef} className="flex-1 overflow-auto bg-white" onMouseLeave={() => setActiveCursor({ rowKey: null, weekId: null })}>
          <table className="border-separate border-spacing-0 w-full relative table-fixed">
            <thead>
              <tr className="sticky top-0 z-[200]">
                <th className={`sticky left-0 z-[210] bg-[#F1F5F9] border-b border-r border-slate-200 p-0 text-left w-[340px] shadow-[4px_0_6px_-2px_rgba(0,0,0,0.1)] transition-colors ${isScrolled ? 'shadow-[4px_4px_6px_-2px_rgba(0,0,0,0.1)]' : ''}`}>
                  <div className="flex items-center gap-3 p-4">
                    <button onClick={selectAllFiltered} className="text-slate-400 hover:text-[#0071CE] transition-colors shrink-0">
                      {allFilteredSelected ? <CheckSquare size={18} className="text-[#0071CE]" /> : someFilteredSelected ? <MinusSquare size={18} className="text-[#0071CE]" /> : <Square size={18} />}
                    </button>
                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{isAnyFilterActive ? 'Filtered' : 'All'} Stores</span>
                    <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded text-[11px] font-black leading-none border border-slate-300/50">{filteredStores.length.toLocaleString()}</span>
                  </div>
                </th>
                {displayWeeks.map(week => {
                  const inRange = activeRange && week.id >= activeRange.min && week.id <= activeRange.max;
                  const isColHovered = activeCursor.weekId === week.id;
                  let bg = 'bg-[#F1F5F9]';
                  if (inRange) bg = 'bg-[#0071CE] shadow-md';
                  else if (isColHovered) bg = 'bg-[#E5EAF5]';
                  return (
                    <th key={week.dates} onClick={() => handleWeekHeaderClick(week.id)} onMouseEnter={() => setActiveCursor({ rowKey: null, weekId: week.id })} className={`sticky top-0 p-0 border-b border-slate-200 w-[140px] transition-all z-[200] cursor-pointer group ${bg} ${isScrolled ? 'shadow-[0_4px_6px_-2px_rgba(0,0,0,0.1)]' : ''}`}>
                      <div className="py-4 flex flex-col items-center relative">
                        {isColHovered && !weekRange.end && <div className="absolute top-0.5"><Plus size={18} strokeWidth={3} className="text-[#0071CE]" /></div>}
                        <span className={`text-sm font-black ${inRange ? 'text-white' : 'text-slate-900'}`}>{week.label}</span>
                        <span className={`text-[10px] font-bold ${inRange ? 'text-blue-100' : 'text-slate-500'}`}>{week.dates}</span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="relative z-0">
              {filteredStateKeys.map(st => {
                const stores = filteredByState[st];
                const isExpanded = expandedStates.has(st);
                const stateSelectedCount = stores.filter(s => selectedStores.has(s.id)).length;
                const allStateSelected = stateSelectedCount === stores.length;
                const isRowHovered = activeCursor.rowKey === `state-${st}`;
                const storeIds = stores.map(s => s.id);

                return (
                  <React.Fragment key={st}>
                    {/* State group row */}
                    <tr className="group/row">
                      <td onMouseEnter={() => setActiveCursor({ rowKey: `state-${st}`, weekId: null })} className={`sticky left-0 z-[90] border-b border-r border-slate-200 p-0 transition-all shadow-[4px_0_6px_-2px_rgba(0,0,0,0.1)] ${isRowHovered ? 'bg-[#E5EAF5]' : 'bg-[#F8FAFC]'} cursor-pointer`}>
                        <div className="flex items-center gap-3 px-4 py-3">
                          <button onClick={() => selectAllInState(st)} className="shrink-0 text-slate-400 hover:text-[#0071CE] transition-colors">
                            {allStateSelected ? <CheckSquare size={18} className="text-[#0071CE]" /> : stateSelectedCount > 0 ? <MinusSquare size={18} className="text-[#0071CE]" /> : <Square size={18} />}
                          </button>
                          <button onClick={() => toggleStateExpand(st)} className="flex items-center gap-2 flex-1 min-w-0">
                            <ChevronRight size={16} className={`text-slate-400 transition-transform shrink-0 ${isExpanded ? 'rotate-90' : ''}`} />
                            <MapPin size={14} className="text-slate-400 shrink-0" />
                            <span className="text-sm font-black text-slate-800 truncate">{STATE_DATA[st]?.name}</span>
                            <span className="text-[11px] font-bold text-slate-400 shrink-0">{stores.length} stores</span>
                            {stateSelectedCount > 0 && <span className="text-[10px] font-black text-[#0071CE] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 shrink-0">{stateSelectedCount} selected</span>}
                          </button>
                        </div>
                      </td>
                      {displayWeeks.map(week => {
                        const agg = aggregateCell(storeIds, week.id);
                        const isColHovered = activeCursor.weekId === week.id;
                        const inRange = activeRange && week.id >= activeRange.min && week.id <= activeRange.max;
                        const bg = inRange ? 'bg-blue-50/50' : isRowHovered || isColHovered ? 'bg-[#F0F4FA]' : 'bg-[#FAFBFC]';
                        return (
                          <td key={`${st}-${week.dates}`} onMouseEnter={() => setActiveCursor({ rowKey: `state-${st}`, weekId: week.id })} className={`border-b border-r border-slate-200 h-20 transition-all ${bg} ${inRange ? 'ring-1 ring-inset ring-[#0071CE]/20' : ''}`}>
                            <div className="flex flex-col items-center justify-center h-full">
                              <MiniBar data={agg} />
                            </div>
                          </td>
                        );
                      })}
                    </tr>

                    {/* Expanded individual stores */}
                    {isExpanded && stores.map(store => {
                      const isSelected = selectedStores.has(store.id);
                      const isStoreRowHovered = activeCursor.rowKey === `store-${store.id}`;
                      const rowBg = isSelected ? 'bg-blue-50' : isStoreRowHovered ? 'bg-[#E5EAF5]' : 'bg-white';
                      return (
                        <tr key={store.id} className="group/row">
                          <td onClick={() => toggleStore(store.id)} onMouseEnter={() => setActiveCursor({ rowKey: `store-${store.id}`, weekId: null })} className={`sticky left-0 z-[90] border-b border-r border-slate-200 p-0 transition-all shadow-[4px_0_6px_-2px_rgba(0,0,0,0.1)] cursor-pointer ${rowBg}`}>
                            <div className="flex items-center gap-3 pl-14 pr-4 py-2.5">
                              <div className={`shrink-0 transition-colors ${isSelected ? 'text-[#0071CE]' : 'text-slate-400 group-hover/row:text-[#0071CE]'}`}>
                                {isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className={`text-[13px] font-bold truncate ${isSelected ? 'text-[#004F91]' : 'text-slate-800'}`}>Store #{store.id}</span>
                                <span className="text-[10px] font-bold text-slate-400 truncate">{store.city} • {store.format} • {store.zip}</span>
                              </div>
                            </div>
                          </td>
                          {displayWeeks.map(week => {
                            const slotKey = `${store.id}-${week.id}`;
                            const cellData = SLOT_DATA[slotKey];
                            const isBooked = !!cellData?.booked;
                            const hasIo = cellData?.ios?.length > 0;
                            const hasInterest = cellData?.interests?.length > 0;
                            const hasActivity = isBooked || hasIo || hasInterest;
                            const isColHovered = activeCursor.weekId === week.id;
                            const isCrosshair = isStoreRowHovered || isColHovered;
                            const inRange = activeRange && week.id >= activeRange.min && week.id <= activeRange.max;
                            const isSelectedCell = isSelected && inRange && weekRange.end !== null;

                            let bg = 'bg-white';
                            if (isBooked) bg = isCrosshair ? 'bg-rose-50' : 'bg-rose-50/60';
                            else if (hasIo) bg = isCrosshair ? 'bg-amber-100' : 'bg-amber-50';
                            else if (hasInterest) bg = isCrosshair ? 'bg-green-100' : 'bg-green-50';
                            else if (isCrosshair) bg = 'bg-[#F0F4FA]';

                            let ring = '';
                            if (isSelectedCell) { bg = isBooked ? 'bg-rose-100' : hasIo ? 'bg-amber-100' : hasInterest ? 'bg-green-100' : 'bg-blue-50'; ring = 'ring-2 ring-inset ring-[#0071CE]'; }

                            return (
                              <td key={`${store.id}-${week.dates}`} onClick={() => { if (!isBooked) { if (!isSelected) toggleStore(store.id); handleWeekHeaderClick(week.id); } }} onMouseEnter={() => setActiveCursor({ rowKey: `store-${store.id}`, weekId: week.id })} className={`border-b border-r border-slate-200 h-16 transition-all relative ${bg} ${ring} ${isBooked ? 'cursor-not-allowed' : 'cursor-pointer'} group/slot`}>
                                <div className="flex flex-col items-center justify-center h-full px-1 text-center pointer-events-none">
                                  {!isSelectedCell && (
                                    <>
                                      {isBooked && <Lock size={12} className="text-rose-600" />}
                                      {!isBooked && hasIo && <Clock size={12} className="text-amber-700" />}
                                      {!isBooked && !hasIo && hasInterest && <Zap size={12} className="text-green-700 fill-green-700/20" />}
                                      {hasActivity && <span className={`text-[9px] font-black uppercase leading-tight line-clamp-1 mt-0.5 ${isBooked ? 'text-rose-900' : hasIo ? 'text-amber-900' : 'text-green-800'}`}>{isBooked ? cellData.booked.advertiser : hasIo ? cellData.ios[0].advertiser : cellData.interests[0].advertiser}</span>}
                                    </>
                                  )}
                                  {hasActivity && !isSelectedCell && <button className="pointer-events-auto mt-auto text-[#0071CE] font-black text-[11px] opacity-0 group-hover/slot:opacity-100 underline" onClick={(e) => { e.stopPropagation(); setViewDetailSlot({ storeId: store.id, weekId: week.id }); }}><Eye size={13} className="inline mr-0.5" />Detail</button>}
                                  {isSelectedCell && !isBooked && <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><div className="w-6 h-6 bg-[#0071CE] rounded-md flex items-center justify-center shadow-lg border-2 border-white"><Check size={12} className="text-white" strokeWidth={4} /></div></div>}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>

      {/* Detail Slider */}
      <div className={`fixed inset-y-0 right-0 w-[900px] bg-white shadow-2xl border-l border-slate-200 z-[2000] transform transition-transform duration-500 ${viewDetailSlot ? 'translate-x-0' : 'translate-x-full'}`}>
        {viewDetailSlot && (() => {
          const store = ALL_STORES.find(s => s.id === viewDetailSlot.storeId);
          const data = SLOT_DATA[`${viewDetailSlot.storeId}-${viewDetailSlot.weekId}`];
          return (
            <div className="flex flex-col h-full">
              <header className="p-8 flex items-center justify-between border-b border-slate-200 bg-white">
                <div><h2 className="text-2xl font-bold tracking-tight text-slate-900">WM Week {viewDetailSlot.weekId}</h2><p className="text-sm text-slate-400 font-medium uppercase">Store #{viewDetailSlot.storeId} • {store?.city}, {store?.state}</p></div>
                <button onClick={() => setViewDetailSlot(null)} className="p-2 text-slate-400 hover:text-slate-900 transition-colors"><X size={32} /></button>
              </header>
              <div className="flex-1 overflow-y-auto px-8 py-6">
                <div className="flex items-center text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 px-2">
                  <div className="w-[20%]">Advertiser</div><div className="w-[18%]">Product</div><div className="w-[18%]">CM Name</div><div className="w-[12%]">Date</div><div className="w-[15%]">Weeks</div>
                  <div className="w-[17%] flex items-center justify-end pr-12"><span>ACTIONS</span></div>
                </div>
                <section className="mb-10"><div className="flex items-center gap-2 mb-4 font-bold text-rose-600"><Lock size={18} /> Booked</div><div className="border-t border-slate-200">{data?.booked ? <DetailRow rowData={data.booked} /> : <p className="py-8 text-sm text-slate-400 italic">No confirmed booking.</p>}</div></section>
                <section className="mb-10"><div className="flex items-center justify-between mb-4"><div className="flex items-center gap-2 font-bold text-amber-700"><Clock size={18} /> IO in progress ({data?.ios?.length || 0})</div>{data?.ios?.length > 2 && <button onClick={() => setIsIosExpanded(!isIosExpanded)} className="text-xs font-bold text-[#0071CE] flex items-center gap-1">{isIosExpanded ? 'View less' : 'View all'} {isIosExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</button>}</div><div className="border-t border-slate-200">{(isIosExpanded ? data?.ios : data?.ios?.slice(0, 2))?.map((io, i) => <DetailRow key={i} rowData={io} />)}</div></section>
                <section className="mb-10"><div className="flex items-center justify-between mb-4"><div className="flex items-center gap-2 font-bold text-green-700"><Zap size={18} className="fill-green-700/20" /> Interest ({data?.interests?.length || 0})</div>{data?.interests?.length > 2 && <button onClick={() => setIsInterestsExpanded(!isInterestsExpanded)} className="text-xs font-bold text-[#0071CE] flex items-center gap-1">{isInterestsExpanded ? 'View less' : 'View all'} {isInterestsExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</button>}</div><div className="border-t border-slate-200">{(isInterestsExpanded ? data?.interests : data?.interests?.slice(0, 2))?.map((o, i) => <DetailRow key={i} rowData={o} />)}</div></section>
              </div>
              <footer className="p-8 border-t border-slate-200 flex justify-end gap-6 bg-slate-50 bg-opacity-30"><button onClick={() => setViewDetailSlot(null)} className="text-sm font-bold text-slate-500 uppercase tracking-widest">Cancel</button><button onClick={() => setViewDetailSlot(null)} className="px-10 py-4 bg-[#0071CE] text-white font-black rounded-full shadow hover:bg-[#004F91] text-sm uppercase tracking-widest">Save changes</button></footer>
            </div>
          );
        })()}
      </div>

      {/* Reserve Drawer */}
      <div className={`fixed inset-y-0 right-0 w-[480px] bg-white shadow-2xl border-l border-slate-200 z-[2500] transition-all duration-500 transform ${isReserving ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full relative">
          <header className="px-8 py-6 flex items-center justify-between border-b border-slate-200 bg-white">
            <div>
              <h2 className="text-[22px] font-black text-slate-900 leading-tight">Reserve SCO Ads</h2>
              <p className="text-[13px] text-slate-500 mt-1 font-medium">{selectedStores.size.toLocaleString()} stores selected • Weeks {activeRange ? activeRange.min : ''} {activeRange && activeRange.max > activeRange.min ? `- ${activeRange.max}` : ''}</p>
            </div>
            <button onClick={() => setIsReserving(false)} className="p-2 text-slate-400 hover:text-slate-900 transition-colors"><X size={24} /></button>
          </header>
          <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
            <div className="space-y-1.5"><label className="text-[14px] font-bold text-slate-700">Advertiser</label><AdvertiserTypeahead value={advertiser} onChange={setAdvertiser} /></div>
            <div className="space-y-4 pt-2"><label className="text-[14px] font-bold text-slate-700">Status</label>
              <div className="flex flex-row items-center gap-12">
                <label className="flex items-center gap-3 cursor-pointer group"><div className="relative flex items-center justify-center w-5 h-5 rounded-full border-2 border-slate-400 group-hover:border-[#0071CE] transition-all">{reserveStatus === 'interest' && <div className="w-2.5 h-2.5 bg-[#0071CE] rounded-full" />}<input type="radio" className="sr-only" checked={reserveStatus === 'interest'} onChange={() => setReserveStatus('interest')} /></div><div className="text-[14px] font-black text-slate-900">Interest</div></label>
                <label className="flex items-center gap-3 cursor-pointer group"><div className="relative flex items-center justify-center w-5 h-5 rounded-full border-2 border-slate-400 group-hover:border-[#0071CE] transition-all">{reserveStatus === 'book' && <div className="w-2.5 h-2.5 bg-[#0071CE] rounded-full" />}<input type="radio" className="sr-only" checked={reserveStatus === 'book'} onChange={() => setReserveStatus('book')} /></div><div className="text-[14px] font-black text-slate-900">IO in progress</div></label>
              </div>
            </div>
            {reserveStatus === 'book' && (
              <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-5">
                <div className="space-y-1.5"><label className="text-[13px] font-black text-slate-500 uppercase tracking-tight">IO status</label><div className="relative"><select value={ioStatus} onChange={e => setIoStatus(e.target.value)} className="w-full h-[46px] px-4 bg-white border border-slate-300 rounded-md font-bold text-slate-800 outline-none focus:border-[#0071CE] appearance-none shadow-sm text-sm"><option value="Draft">Draft</option><option value="Finalized">Finalized</option></select><ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} /></div></div>
                <div className="space-y-1.5"><label className="text-[13px] font-black text-slate-500 uppercase tracking-tight">IO Name (optional)</label><input type="text" value={ioName} onChange={(e) => setIoName(e.target.value)} placeholder="e.g. Back to School 2026" className="w-full h-[46px] px-4 border border-slate-300 rounded-md font-medium text-slate-800 outline-none focus:border-[#0071CE] text-sm bg-white placeholder-slate-400" /></div>
                <div className="space-y-1.5"><label className="text-[13px] font-black text-slate-500 uppercase tracking-tight">IO Number (optional)</label><input type="text" value={ioNumber} onChange={(e) => setIoNumber(e.target.value)} placeholder="e.g. IO-882103" className="w-full h-[46px] px-4 border border-slate-300 rounded-md font-medium text-slate-800 outline-none focus:border-[#0071CE] text-sm bg-white placeholder-slate-400" /></div>
              </div>
            )}
            <div className="space-y-1.5"><label className="text-[14px] font-bold text-slate-700">Campaign name (optional)</label><input type="text" value={campaignName} onChange={(e) => setCampaignName(e.target.value)} placeholder="Enter campaign name" className="w-full h-[46px] px-4 border border-slate-300 rounded-md font-medium text-slate-800 outline-none focus:border-[#0071CE] text-sm placeholder-slate-400" /></div>
            <div className="space-y-1.5"><label className="text-[14px] font-bold text-slate-700">Brand/product (optional)</label><input type="text" value={brandProduct} onChange={(e) => setBrandProduct(e.target.value)} placeholder="Enter brand or product" className="w-full h-[46px] px-4 border border-slate-300 rounded-md font-medium text-slate-800 outline-none focus:border-[#0071CE] text-sm placeholder-slate-400" /></div>
            <div className="space-y-1.5"><label className="text-[14px] font-bold text-slate-700">Ad group name (optional)</label><input type="text" value={adGroupName} onChange={(e) => setAdGroupName(e.target.value)} placeholder="Enter ad group name" className="w-full h-[46px] px-4 border border-slate-300 rounded-md font-medium text-slate-800 outline-none focus:border-[#0071CE] text-sm placeholder-slate-400" /></div>
            <div className="space-y-1.5"><label className="text-[14px] font-bold text-slate-700">Category</label><div className="relative"><select value={category} onChange={e => setCategory(e.target.value)} className="w-full h-[46px] px-4 bg-white border border-slate-300 rounded-md font-bold text-slate-800 outline-none focus:border-[#0071CE] appearance-none shadow-sm text-sm"><option value="">Select category</option>{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select><ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} /></div></div>
            <div className="space-y-1.5"><label className="text-[14px] font-bold text-slate-700">Campaign Manager</label><div className="relative"><select value={campaignManager} onChange={e => setCampaignManager(e.target.value)} className="w-full h-[46px] px-4 bg-white border border-slate-300 rounded-md font-bold text-slate-800 outline-none focus:border-[#0071CE] appearance-none shadow-sm text-sm"><option value="">Assign manager</option>{MANAGERS.map(m => <option key={m} value={m}>{m}</option>)}</select><ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} /></div></div>
            <div className="space-y-1.5 pt-2"><label className="text-[14px] font-bold text-slate-700">Notes (optional)</label><textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Add campaign notes..." className="w-full px-4 py-3 border border-slate-300 rounded-md font-medium outline-none focus:border-[#0071CE] resize-none shadow-sm text-sm placeholder-slate-400" /></div>
          </div>
          <footer className="px-8 py-6 border-t border-slate-200 flex justify-end gap-6 bg-white shrink-0">
            <button onClick={() => setIsReserving(false)} className="text-[14px] font-bold text-slate-500 underline hover:text-slate-800">Cancel</button>
            <button className="px-10 py-3 bg-[#0071CE] text-white font-black rounded-full shadow hover:bg-[#004F91] transition-all text-[14px]">Reserve</button>
          </footer>
        </div>
      </div>

      {/* Tooltip */}
      {actionTooltip && (
        <div className="fixed pointer-events-none z-[9999] px-3 py-1.5 bg-slate-900 text-white text-[11px] font-medium rounded shadow-xl whitespace-nowrap" style={{ left: actionTooltip.rect.left + (actionTooltip.rect.width / 2), top: actionTooltip.rect.top - 8, transform: 'translate(-50%, -100%)' }}>
          {actionTooltip.tip}<div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
        </div>
      )}

      {/* Overlay */}
      {(isReserving || viewDetailSlot) && <div className="fixed inset-0 bg-black/50 z-[1050]" onClick={() => { setIsReserving(false); setViewDetailSlot(null); }} />}
    </div>
  );
}
