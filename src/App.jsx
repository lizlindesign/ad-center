import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Search, 
  Download, 
  Upload, 
  Lock, 
  Clock, 
  User, 
  X, 
  Calendar,
  ChevronDown, 
  Plus, 
  HelpCircle, 
  Bell, 
  Check, 
  CheckSquare, 
  Square, 
  Zap, 
  MousePointer2, 
  ArrowRight, 
  Info, 
  MinusSquare,
  Sparkles, 
  Loader2, 
  Wand2, 
  Lightbulb, 
  Trash2, 
  Eye, 
  ChevronUp,
  Slash,
  Pencil,
  Filter as FilterIcon
} from 'lucide-react';

const apiKey = ""; 

// Walmart Fiscal Year Constants
const FY2026_START = new Date('2025-02-02');
const FY2027_START = new Date('2026-02-01');
const MOCK_TODAY = new Date('2026-04-06'); // Anchor: Monday, Apr 6, 2026

const CITY_DATA = [
  "New York, NY", "Los Angeles, CA", "Chicago, IL", "Houston, TX", "Phoenix, AZ", "Philadelphia, PA", "San Antonio, TX", "San Diego, CA", "Dallas, TX", "San Jose, CA",
  "Austin, TX", "Jacksonville, FL", "Fort Worth, TX", "Columbus, OH", "Charlotte, NC", "Indianapolis, IN", "San Francisco, CA", "Seattle, WA", "Denver, CO", "Oklahoma City, OK",
  "Nashville, TN", "El Paso, TX", "Washington, DC", "Las Vegas, NV", "Boston, MA", "Portland, OR", "Louisville, KY", "Memphis, TN", "Detroit, MI", "Baltimore, MD",
  "Milwaukee, WI", "Albuquerque, NM", "Tucson, AZ", "Fresno, CA", "Sacramento, CA", "Mesa, AZ", "Kansas City, MO", "Atlanta, GA", "Colorado Springs, CO", "Omaha, NE",
  "Raleigh, NC", "Virginia Beach, VA", "Long Beach, CA", "Miami, FL", "Oakland, CA", "Minneapolis, MN", "Tulsa, OK", "Bakersfield, CA", "Tampa, FL", "Wichita, KS"
];

const DMAs = CITY_DATA.map((name, i) => ({
  id: (501 + i).toString(),
  name,
  stores: Math.floor(Math.random() * 400) + 20,
  state: name.split(', ')[1],
  zip: (10000 + i).toString()
}));

// Robust Fiscal Week Generator
const generateFiscalWeeks = (baseDate, fiscalYearStart) => Array.from({ length: 52 }, (_, i) => {
  const start = new Date(baseDate);
  start.setDate(start.getDate() + (i * 7));
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  
  // Logic: Calculate WM Week # relative to fiscalYearStart (always starts Week 1)
  const diffInDays = Math.floor((start - fiscalYearStart) / (1000 * 60 * 60 * 24));
  let totalWeeksFromStart = Math.floor(diffInDays / 7);
  let weekNum = (totalWeeksFromStart % 52) + 1;
  if (weekNum <= 0) weekNum += 52;

  const formatDateShort = (d) => d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
  return {
    id: i + 1, // ID is used for grid reference
    weekNumber: weekNum, // The display WM Week #
    label: `WM Week ${weekNum}`,
    dates: `${formatDateShort(start)} - ${formatDateShort(end)}`,
    startDate: start,
    endDate: end
  };
});

// Running Weeks: Starts Apr 5, 2026 (Sunday before Apr 6)
const RUNNING_START = new Date(2026, 3, 5); 
const WEEKS_FY2026 = generateFiscalWeeks(FY2026_START, FY2026_START);
const WEEKS_FY2027 = generateFiscalWeeks(FY2027_START, FY2027_START);
const RUNNING_WEEKS = generateFiscalWeeks(RUNNING_START, FY2027_START);

const INITIAL_SLOT_DATA = {};
const ADVERTISERS = [
  '3M', '7-Eleven', 'Abbott', 'Activision Blizzard', 'Adidas', 'Adobe', 'Aetna', 'Airbnb', 'Albertsons', 'Aldi',
  'Allstate', 'Alphabet', 'Amazon', 'AMD', 'American Express', 'Amway', 'Anheuser-Busch', 'Apple', 'Aramark', 'Archer Daniels Midland',
  'AT&T', 'Audi', 'AutoZone', 'Avery Dennison', 'Avon', 'Band-Aid', 'Barilla', 'Bath & Body Works', 'Bayer', 'Beam Suntory',
  'Beats by Dre', 'Ben & Jerry\'s', 'Best Buy', 'Beyond Meat', 'BIC', 'Bird\'s Eye', 'Black & Decker', 'BMW', 'Bose', 'Boston Scientific',
  'Bounty', 'Braun', 'Brita', 'Brooks Running', 'Budweiser', 'Bumble Bee', 'Burt\'s Bees', 'Bush\'s Beans', 'Calvin Klein', 'Campbell\'s',
  'Canon', 'Capital One', 'Cargill', 'Carlsberg', 'Carhartt', 'Cascade', 'Caterpillar', 'Celsius', 'Chanel', 'Charmin',
  'Chase', 'Cheerios', 'Cheetos', 'Chevron', 'Chick-fil-A', 'Chobani', 'Church & Dwight', 'Cisco', 'Citi', 'Clif Bar',
  'Clorox', 'Coach', 'Coca-Cola', 'Colgate-Palmolive', 'Columbia Sportswear', 'Comcast', 'ConAgra', 'Converse', 'Corning', 'Costco',
  'Coty', 'Cracker Barrel', 'Crayola', 'Crocs', 'Crown Royal', 'CVS Health', 'Dannon', 'Dawn', 'De Beers', 'Del Monte',
  'Dell', 'Delta Air Lines', 'Diageo', 'Diamond Foods', 'Dior', 'Discovery', 'Disney', 'Dockers', 'Dole', 'Dollar General',
  'Dollar Tree', 'Domino\'s', 'Doritos', 'Dove', 'Dr Pepper', 'Driscoll\'s', 'Duracell', 'Dyson', 'EA Sports', 'Eastman Kodak',
  'eBay', 'Ecover', 'Edgewell', 'Electrolux', 'Eli Lilly', 'Energizer', 'Epson', 'Essentia Water', 'Estée Lauder', 'Etsy',
  'ExxonMobil', 'Fanta', 'FedEx', 'Ferrero', 'Fila', 'Fisher-Price', 'Fitbit', 'Folgers', 'Food Lion', 'Ford',
  'Fossil', 'Frito-Lay', 'Fruit of the Loom', 'Gatorade', 'GE Appliances', 'General Mills', 'General Motors', 'Gerber', 'Gillette', 'Glad',
  'GlaxoSmithKline', 'Glenlivet', 'Godiva', 'Gold Bond', 'Goodyear', 'Google', 'GoPro', 'Goya', 'Green Giant', 'Grey Goose',
  'Grubhub', 'Gucci', 'H&M', 'Häagen-Dazs', 'Hallmark', 'Hanes', 'Harley-Davidson', 'Harry\'s', 'Hasbro', 'Head & Shoulders',
  'Heineken', 'Heinz', 'Hello Fresh', 'Henkel', 'Hennessy', 'Hershey\'s', 'Hewlett-Packard', 'Hidden Valley', 'Hillshire Farm', 'Honest Company',
  'Honeywell', 'Hood', 'Hormel', 'Hot Pockets', 'HP', 'Huggies', 'Humana', 'Hunt\'s', 'Hyundai', 'IKEA',
  'Intel', 'Iovate', 'iRobot', 'Jack Daniel\'s', 'Jameson', 'JBL', 'Jelly Belly', 'Jeep', 'Jet-Puffed', 'Jif',
  'Jimmy Dean', 'John Deere', 'Johnson & Johnson', 'Jose Cuervo', 'Kashi', 'Kellogg\'s', 'Kenmore', 'Keurig Dr Pepper', 'KFC', 'Kia',
  'Kimberly-Clark', 'Kind Snacks', 'KitchenAid', 'Kleenex', 'Kodiak Cakes', 'Kohl\'s', 'Kraft Heinz', 'Kroger', 'L\'Oréal', 'La Croix',
  'Land O\'Lakes', 'Lay\'s', 'Lean Cuisine', 'LEGO', 'Lenovo', 'Levi\'s', 'LG', 'Lipton', 'Listerine', 'Logitech',
  'Louis Vuitton', 'Lowe\'s', 'Lululemon', 'Lysol', 'M&M\'s', 'Macy\'s', 'Maker\'s Mark', 'Mars', 'Mastercard', 'Mattel',
  'Maxwell House', 'Maytag', 'McCormick', 'McDonald\'s', 'Meow Mix', 'Mercedes-Benz', 'Meta', 'Method', 'Michelin', 'Microsoft',
  'MillerCoors', 'Minute Maid', 'Modelo', 'Molson Coors', 'Mondelez', 'Monster Energy', 'Mott\'s', 'Mountain Dew', 'Mr. Clean', 'Nabisco',
  'Nature\'s Path', 'Nespresso', 'Nestlé', 'Netflix', 'Neutrogena', 'New Balance', 'Newman\'s Own', 'Nike', 'Nintendo', 'Nissan',
  'Nivea', 'Nokia', 'Nordstrom', 'North Face', 'NutriBullet', 'Nvidia', 'Oatly', 'Ocean Spray', 'Olay', 'Old Navy',
  'Old Spice', 'Olive Garden', 'Oral-B', 'Oreo', 'Oscar Mayer', 'OxiClean', 'Pampers', 'Panasonic', 'Pandora', 'Pantene',
  'Patagonia', 'Patron', 'Pedigree', 'Pepsi', 'Perdue', 'Perrigo', 'Pfizer', 'Philadelphia Cream Cheese', 'Philips', 'Pillsbury',
  'Planters', 'PlayStation', 'Poise', 'Polo Ralph Lauren', 'Pop-Tarts', 'Prada', 'Prego', 'Pringles', 'Procter & Gamble', 'Progressive',
  'Publix', 'Puma', 'Purell', 'Purina', 'Quaker Oats', 'Qualcomm', 'Rao\'s', 'Ray-Ban', 'Raytheon', 'Reckitt',
  'Red Bull', 'Reebok', 'Revlon', 'Reynolds', 'Ring', 'Ritz', 'Rolex', 'Roku', 'Roomba', 'Rubbermaid',
  'Russell Stover', 'S.C. Johnson', 'Sabra', 'Samsung', 'San Pellegrino', 'Sargento', 'Schick', 'Scotch-Brite', 'Scott', 'Sears',
  'Seventh Generation', 'Sharp', 'Shell', 'Shiseido', 'Shopify', 'Silk', 'Similac', 'Simple Green', 'Skechers', 'Skippy',
  'Smartwater', 'Smuckers', 'Snapple', 'Snickers', 'Sony', 'Southwest Airlines', 'Spam', 'Spectrum', 'Spotify', 'Sprint',
  'Starbucks', 'State Farm', 'Stonyfield', 'Subaru', 'Subway', 'Sun-Maid', 'Sunkist', 'Swiffer', 'T-Mobile', 'Taco Bell',
  'Target', 'Tasty Bite', 'Tesla', 'The Honest Company', 'Tide', 'Tiffany & Co.', 'TikTok', 'Tillamook', 'Timberland', 'Titleist',
  'Tostitos', 'Toyota', 'Trader Joe\'s', 'Tropicana', 'Tums', 'Tupperware', 'Tylenol', 'Tyson Foods', 'Uber', 'Under Armour',
  'Unilever', 'United Airlines', 'UPS', 'USAA', 'V8', 'Vans', 'Vaseline', 'Verizon', 'Versace', 'Visa',
  'Vitamix', 'Vlasic', 'Volkswagen', 'Volvo', 'Walgreens', 'Walmart', 'Wasa', 'Weber', 'Welch\'s', 'Wells Fargo',
  'Wendy\'s', 'Whirlpool', 'White Claw', 'Whole Foods', 'Windex', 'Wonderful Pistachios', 'Xbox', 'Xerox', 'Yakult', 'Yeti',
  'Yoplait', 'YouTube', 'Zara', 'Ziploc', 'Zoom', 'Zyrtec'
].sort();
const CATEGORIES = ['Electronics', 'Grocery', 'Health & Wellness', 'Home & Patio', 'Toys', 'Apparel', 'Automotive', 'Beauty'];
const MANAGERS = ['Sam Walton', 'Alice Glass', 'Robert Lewis', 'Sarah Chen', 'David Brooks'];

const generateBrandsForType = (type, hasMultiple) => {
  const count = type === 'booked' ? 1 : (hasMultiple ? Math.floor(Math.random() * 4) + 3 : 1);
  return Array.from({ length: count }, () => ({
    id: Math.random(),
    advertiser: ADVERTISERS[Math.floor(Math.random() * ADVERTISERS.length)],
    product: 'Campaign Plan', cm: 'S. Walton', date: 'Feb 15', status: 'Active'
  }));
};

const populateGrid = () => {
  DMAs.forEach((dma) => {
    let weekPointer = 1;
    while (weekPointer <= 52) {
      const isEarly = weekPointer <= 20;
      const activityChance = isEarly ? 0.40 : 0.15;
      if (Math.random() < activityChance) {
        const span = Math.floor(Math.random() * 2) + 1;
        const roll = Math.random();
        const isBooked = roll < 0.375; 
        const isIo = !isBooked && Math.random() < 0.5;
        const hasMultiple = Math.random() < 0.5;
        const brands = generateBrandsForType(isBooked ? 'booked' : 'other', hasMultiple);
        const duration = `Wk ${weekPointer}-${Math.min(52, weekPointer + span - 1)}`;

        let popularIos = [];
        let popularInterests = [];
        if (isBooked && Math.random() < 0.70) {
            popularIos = generateBrandsForType('other', true).map(b => ({ ...b, weeks: duration }));
            popularInterests = generateBrandsForType('other', true).map(b => ({ ...b, weeks: duration }));
        }

        for (let s = 0; s < span && (weekPointer + s) <= 52; s++) {
          const key = `${dma.id}-${weekPointer + s}`;
          if (isBooked) {
            INITIAL_SLOT_DATA[key] = { booked: { ...brands[0], weeks: duration }, ios: popularIos, interests: popularInterests };
          } else if (isIo) {
            INITIAL_SLOT_DATA[key] = { booked: null, ios: brands.map(b => ({ ...b, weeks: duration })), interests: [] };
          } else {
            INITIAL_SLOT_DATA[key] = { booked: null, ios: [], interests: brands.map(b => ({ ...b, weeks: duration })) };
          }
        }
        weekPointer += span + 4; 
      } else weekPointer++;
    }
  });
};

populateGrid();

// --- External Helper Components ---
const RadioItem = ({ label, active, disabled, onClick }) => (
  <button 
    onClick={onClick} 
    disabled={disabled}
    className={`w-full flex items-center gap-3 px-4 py-3 text-[11px] font-bold transition-all ${active ? 'bg-blue-50 text-[#0071CE]' : 'text-slate-700 hover:bg-slate-50'} disabled:opacity-30 disabled:cursor-not-allowed group`}
  >
    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${active ? 'border-[#0071CE]' : 'border-slate-300 group-hover:border-slate-400'}`}>
      {active && <div className="w-2 h-2 rounded-full bg-[#0071CE]" />}
    </div>
    <span className="flex-1 text-left whitespace-nowrap">{label}</span>
  </button>
);

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
    filtered.forEach(a => {
      const letter = a[0].toUpperCase();
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(a);
    });
    return groups;
  }, [filtered]);

  useEffect(() => {
    const handleOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  useEffect(() => {
    setHighlightIdx(-1);
    if (listRef.current) listRef.current.scrollTop = 0;
  }, [query]);

  const handleSelect = (adv) => {
    onChange(adv);
    setQuery('');
    setIsOpen(false);
  };

  const handleKeyDown = (e) => {
    if (!isOpen) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlightIdx(i => Math.min(i + 1, filtered.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlightIdx(i => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter' && highlightIdx >= 0) { e.preventDefault(); handleSelect(filtered[highlightIdx]); }
    else if (e.key === 'Escape') { setIsOpen(false); }
  };

  return (
    <div ref={containerRef} className="relative">
      <div className={`flex items-center w-full h-[46px] border rounded-md bg-white shadow-sm transition-colors ${isOpen ? 'border-[#0071CE]' : 'border-slate-300'}`}>
        <Search size={16} className="ml-4 text-slate-400 shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={isOpen ? query : (value || '')}
          placeholder={value || 'Search advertiser...'}
          onFocus={() => { setIsOpen(true); setQuery(''); }}
          onChange={(e) => { setQuery(e.target.value); if (!isOpen) setIsOpen(true); }}
          onKeyDown={handleKeyDown}
          className="flex-1 h-full px-3 outline-none font-bold text-slate-800 text-sm bg-transparent placeholder-slate-400"
        />
        {value && !isOpen && (
          <button onClick={(e) => { e.stopPropagation(); onChange(''); inputRef.current?.focus(); }} className="pr-3 text-slate-400 hover:text-slate-600">
            <X size={16} strokeWidth={3} />
          </button>
        )}
        <ChevronDown size={16} className={`mr-4 text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div ref={listRef} className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-2xl z-[3000] max-h-[280px] overflow-y-auto">
          {query.length > 0 && query.length < 3 && (
            <div className="px-4 py-3 text-xs text-slate-400 font-medium">Type at least 3 characters to search...</div>
          )}
          {query.length >= 3 && filtered.length === 0 && (
            <div className="px-4 py-6 text-sm text-slate-400 text-center">No advertisers match "<span className="font-bold text-slate-600">{query}</span>"</div>
          )}
          {Object.keys(letterGroups).sort().map(letter => (
            <div key={letter}>
              <div className="sticky top-0 px-4 py-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 border-b border-slate-100">{letter}</div>
              {letterGroups[letter].map((adv) => {
                const flatIdx = filtered.indexOf(adv);
                return (
                  <button
                    key={adv}
                    onClick={() => handleSelect(adv)}
                    onMouseEnter={() => setHighlightIdx(flatIdx)}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${flatIdx === highlightIdx ? 'bg-blue-50 text-[#0071CE] font-bold' : value === adv ? 'text-[#0071CE] font-bold bg-blue-50/50' : 'text-slate-700 hover:bg-slate-50 font-medium'}`}
                  >
                    {adv}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function App() {
  // --- States ---
  const [selectedDMAs, setSelectedDMAs] = useState(new Set());
  const [weekRange, setWeekRange] = useState({ start: null, end: null });
  const [hoverWeek, setHoverWeek] = useState(null);
  const [isReserving, setIsReserving] = useState(false);
  const [viewDetailSlot, setViewDetailSlot] = useState(null); 
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('DMA numbers'); 
  const [isSearchTypeDropdownOpen, setIsSearchTypeDropdownOpen] = useState(false);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [isWeekFilterOpen, setIsWeekFilterOpen] = useState(false);
  const [viewFilter, setViewFilter] = useState('all'); 
  const [activeCursor, setActiveCursor] = useState({ dmaId: null, weekId: null });
  const [actionTooltip, setActionTooltip] = useState(null);
  const [weekFilterMode, setWeekFilterMode] = useState('52running'); 
  const [customDates, setCustomDates] = useState({ 
    start: MOCK_TODAY.toISOString().split('T')[0], 
    end: new Date(MOCK_TODAY.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] 
  });
  const [isIosExpanded, setIsIosExpanded] = useState(false);
  const [isInterestsExpanded, setIsInterestsExpanded] = useState(false);

  // Reserve Form States
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

  const [isScrolled, setIsScrolled] = useState(false);
  const gridScrollRef = useRef(null);
  const searchTypeRef = useRef(null);
  const filterRef = useRef(null);
  const weekFilterRef = useRef(null);

  // --- 1. Memos (Pre-initialized to avoid ReferenceErrors) ---
  const activeRange = useMemo(() => {
    if (!weekRange.start) return null;
    const end = weekRange.end || hoverWeek || weekRange.start;
    return { min: Math.min(weekRange.start, end), max: Math.max(weekRange.start, end) };
  }, [weekRange, hoverWeek]);

  const selectionCount = useMemo(() => {
    if (!selectedDMAs.size) return 0;
    const wCount = activeRange ? (activeRange.max - activeRange.min + 1) : (weekRange.start ? 1 : 0);
    return selectedDMAs.size * wCount;
  }, [selectedDMAs.size, activeRange, weekRange.start]);

  const canReserve = useMemo(() => selectedDMAs.size > 0 && weekRange.end !== null, [selectedDMAs.size, weekRange.end]);

  const isWeekHardBooked = (wid) => {
    if (selectedDMAs.size === 0) return false;
    return Array.from(selectedDMAs).some(did => !!INITIAL_SLOT_DATA[`${did}-${wid}`]?.booked);
  };

  const isWeekDisabled = (wid) => {
    if (selectedDMAs.size === 0) return false;
    if (!weekRange.start) return isWeekHardBooked(wid);
    if (wid === weekRange.start) return isWeekHardBooked(wid);
    if (wid > weekRange.start) {
      for (let w = weekRange.start + 1; w <= wid; w++) if (isWeekHardBooked(w)) return true;
    } else {
      for (let w = wid; w < weekRange.start; w++) if (isWeekHardBooked(w)) return true;
    }
    return false;
  };

  const isDmaDisabled = (id, targetWeekId = null) => {
    if (!weekRange.start && targetWeekId === null) return false;
    const start = weekRange.start || targetWeekId;
    const end = targetWeekId !== null ? targetWeekId : (weekRange.end || hoverWeek || weekRange.start);
    const min = Math.min(start, end);
    const max = Math.max(start, end);
    for (let w = min; w <= max; w++) if (INITIAL_SLOT_DATA[`${id}-${w}`]?.booked) return true;
    return false;
  };

  const isCellSelected = (dmaId, weekId) => {
    if (!selectedDMAs.has(dmaId) || !activeRange || !weekRange.end) return false;
    return weekId >= activeRange.min && weekId <= activeRange.max;
  };

  const isAnyFilterActive = useMemo(() => searchTerm !== '' || viewFilter !== 'all', [searchTerm, viewFilter]);

  const translatedWeeksRange = useMemo(() => {
    const sDate = new Date(customDates.start);
    const eDate = new Date(customDates.end);
    const findWeekIdx = (date) => {
        const diffInDays = Math.floor((date - FY2027_START) / (1000 * 60 * 60 * 24));
        return Math.floor(diffInDays / 7) + 1;
    };
    const s = findWeekIdx(sDate); const e = findWeekIdx(eDate);
    if (s <= 0 || e <= 0) return { start: 1, end: 52, label: "Wk ? - ?" };
    return { start: Math.min(s, e), end: Math.max(s, e), label: `Wk ${Math.min(s, e)} - ${Math.max(s, e)}` };
  }, [customDates]);

  const weekFilterButtonLabel = useMemo(() => {
    if (weekFilterMode === '52running') return '52 running weeks';
    if (weekFilterMode === 'fy2026') return 'FY 2026';
    if (weekFilterMode === 'fy2027') return 'FY 2027';
    return translatedWeeksRange.label;
  }, [weekFilterMode, translatedWeeksRange]);

  const filteredDMAs = useMemo(() => {
    let result = DMAs;
    if (searchTerm) {
      const term = searchTerm.toLowerCase().trim();
      const parts = term.split(',').map(p => p.trim()).filter(p => p);
      if (searchType === 'DMA numbers') {
        result = result.filter(dma => parts.some(part => dma.id.includes(part)));
      } else {
        result = result.filter(dma => parts.some(part => dma.name.toLowerCase().includes(part)));
      }
    }
    if (viewFilter === 'selected') result = result.filter(d => selectedDMAs.has(d.id));
    if (viewFilter === 'available' && weekRange.start) result = result.filter(d => !isDmaDisabled(d.id));
    if (viewFilter === 'unavailable' && weekRange.start) result = result.filter(d => isDmaDisabled(d.id));
    return result;
  }, [searchTerm, searchType, viewFilter, selectedDMAs, weekRange.start, activeRange, hoverWeek]);

  const anyVisibleSelected = useMemo(() => filteredDMAs.some(d => selectedDMAs.has(d.id)), [filteredDMAs, selectedDMAs]);

  const displayWeeks = useMemo(() => {
    if (weekFilterMode === 'fy2026') return WEEKS_FY2026;
    if (weekFilterMode === 'fy2027') return WEEKS_FY2027;
    if (weekFilterMode === '52running') return RUNNING_WEEKS;
    return WEEKS_FY2027.filter(w => w.id >= translatedWeeksRange.start && w.id <= translatedWeeksRange.end);
  }, [weekFilterMode, translatedWeeksRange]);

  const selectedStoresCount = useMemo(() => Array.from(selectedDMAs).reduce((acc, id) => acc + (DMAs.find(d => d.id === id)?.stores || 0), 0), [selectedDMAs]);

  // --- 2. Handlers ---
  const handleDmaToggle = (id) => {
    if (isDmaDisabled(id)) return;
    const newSelected = new Set(selectedDMAs);
    if (newSelected.has(id)) newSelected.delete(id); else newSelected.add(id);
    setSelectedDMAs(newSelected);
  };

  const handleWeekHeaderClick = (weekId) => {
    if (isWeekDisabled(weekId)) return;
    if (!weekRange.start || (weekRange.start && weekRange.end)) setWeekRange({ start: weekId, end: null });
    else setWeekRange(prev => ({ ...prev, end: weekId }));
  };

  const handleCellClick = (dmaId, weekId) => {
    if (INITIAL_SLOT_DATA[`${dmaId}-${weekId}`]?.booked) return;
    // Interaction check
    if (isDmaDisabled(dmaId, weekId) || isWeekDisabled(weekId)) return;
    if (!selectedDMAs.has(dmaId)) handleDmaToggle(dmaId);
    handleWeekHeaderClick(weekId);
  };

  const handleHeaderCheckboxToggle = () => {
    const newSelected = new Set(selectedDMAs);
    if (anyVisibleSelected) {
      filteredDMAs.forEach(d => newSelected.delete(d.id));
    } else {
      filteredDMAs.forEach(d => { if (!isDmaDisabled(d.id)) newSelected.add(d.id); });
    }
    setSelectedDMAs(newSelected);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchTypeRef.current && !searchTypeRef.current.contains(e.target)) setIsSearchTypeDropdownOpen(false);
      if (filterRef.current && !filterRef.current.contains(e.target)) setIsFilterDropdownOpen(false);
      if (weekFilterRef.current && !weekFilterRef.current.contains(e.target)) setIsWeekFilterOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);

    const scrollEl = gridScrollRef.current;
    const handleScroll = () => setIsScrolled(scrollEl.scrollTop > 0);
    if (scrollEl) scrollEl.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (scrollEl) scrollEl.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden relative">
      <aside className="w-16 flex flex-col items-center py-6 bg-[#004F91] border-r border-slate-200 gap-8 z-50 shrink-0 shadow-lg">
        <div className="w-10 h-10 bg-[#FFC220] rounded-xl flex items-center justify-center text-[#004F91] font-bold text-lg shadow-inner">W</div>
        <nav className="flex flex-col gap-6 text-white/60">
          <Calendar className="text-white cursor-pointer" size={22} /><User size={22} /><Bell size={22} /><div className="mt-auto"><HelpCircle size={22} /></div>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0 z-40">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Inventory Calendar</h1>
          <div className="flex items-center gap-4 text-sm font-medium text-slate-500"><User size={18} className="text-slate-400" /><span>Sam Walton</span><ChevronDown size={14} /></div>
        </header>

        <div className="bg-white border-b border-slate-200 px-8 py-3 flex items-center justify-between shrink-0 z-[300] shadow-sm gap-6 overflow-visible">
          <div className="flex-1 flex items-center bg-slate-100 border border-slate-200 rounded-xl h-11 relative">
            <div className="relative h-full flex items-center" ref={searchTypeRef}>
              <button onClick={() => setIsSearchTypeDropdownOpen(!isSearchTypeDropdownOpen)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 border-r border-slate-200 h-full rounded-l-xl hover:bg-slate-200 transition-colors">
                <Search size={16} />
                {/* Prefix font weight fixed to normal */}
                <span className="whitespace-nowrap font-normal text-slate-500">Search by <span className="font-bold text-slate-700">{searchType}</span></span>
                <ChevronDown size={14} className={isSearchTypeDropdownOpen ? 'rotate-180' : ''} />
              </button>
              {isSearchTypeDropdownOpen && (
                <div className="absolute top-[110%] left-0 w-56 bg-white border border-slate-200 rounded-lg shadow-2xl z-[500] overflow-hidden animate-in fade-in zoom-in-95">
                  {['DMA numbers', 'DMA names'].map(type => (
                    <button key={type} onClick={() => { setSearchType(type); setIsSearchTypeDropdownOpen(false); setSearchTerm(''); }} className={`w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-blue-50 transition-colors ${searchType === type ? 'text-[#0071CE] bg-blue-50 font-bold' : ''}`}>{type}</button>
                  ))}
                </div>
              )}
            </div>
            <input type="text" placeholder={searchType === 'DMA numbers' ? 'e.g. 501, 803...' : 'e.g. New York, Chicago...'} className="flex-1 bg-transparent px-4 py-2.5 text-sm outline-none font-medium text-slate-800 h-full" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            {searchTerm && <button onClick={() => setSearchTerm('')} className="p-2 text-slate-400 hover:text-slate-600 transition-colors mr-1"><X size={14} strokeWidth={3} /></button>}
          </div>

          <div className="flex items-center gap-3 h-full overflow-visible">
            <div className="relative h-full" ref={weekFilterRef}>
              <button onClick={() => setIsWeekFilterOpen(!isWeekFilterOpen)} className={`flex items-center gap-2 px-4 h-full border rounded-lg transition-all text-sm font-bold ${isWeekFilterOpen ? 'border-[#0071CE] text-[#0071CE] bg-blue-50 shadow-sm' : 'border-slate-300 text-slate-600 hover:bg-slate-50'}`}>
                {weekFilterButtonLabel} <ChevronDown size={14} className={isWeekFilterOpen ? 'rotate-180' : ''} />
              </button>
              {isWeekFilterOpen && (
                <div className="absolute top-full right-0 mt-2 w-[480px] bg-white border border-slate-200 rounded-xl shadow-2xl z-[600] p-6 animate-in fade-in zoom-in-95">
                  <div className="space-y-5">
                    {[{ id: '52running', label: '52 running weeks' }, { id: 'fy2026', label: 'FY 2026' }, { id: 'fy2027', label: 'FY 2027' }, { id: 'custom', label: 'Custom week range' }].map((opt) => (
                      <label key={opt.id} className="flex items-center gap-4 cursor-pointer group">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${weekFilterMode === opt.id ? 'border-[#0071CE]' : 'border-slate-300'}`}>{weekFilterMode === opt.id && <div className="w-2.5 h-2.5 rounded-full bg-[#0071CE]" />}</div>
                        <input type="radio" className="sr-only" checked={weekFilterMode === opt.id} onChange={() => setWeekFilterMode(opt.id)} />
                        <span className="text-sm font-black text-slate-800">{opt.label}</span>
                      </label>
                    ))}
                    <div className={`grid grid-cols-2 gap-6 pt-2 transition-opacity duration-200 ${weekFilterMode === 'custom' ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-tight">Start week</label>
                          <div className="group relative"><Info size={12} className="text-slate-300 hover:text-[#0071CE] cursor-help" /><div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-900 text-white text-[10px] rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[700]">Click any day to select the week.</div></div>
                        </div>
                        <input type="date" value={customDates.start} onChange={(e) => setCustomDates({...customDates, start: e.target.value})} className="w-full h-11 px-3 border border-slate-300 rounded-lg text-sm font-bold outline-none focus:border-[#0071CE]" />
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-tight">End week</label>
                          <div className="group relative"><Info size={12} className="text-slate-300 hover:text-[#0071CE] cursor-help" /><div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-900 text-white text-[10px] rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[700]">Click any day to select the week.</div></div>
                        </div>
                        <input type="date" value={customDates.end} onChange={(e) => setCustomDates({...customDates, end: e.target.value})} className="w-full h-11 px-3 border border-slate-300 rounded-lg text-sm font-bold outline-none focus:border-[#0071CE]" />
                      </div>
                    </div>
                    <div className="text-[11px] font-bold text-slate-400 leading-none h-4">
                        {weekFilterMode === 'custom' ? `Walmart ${translatedWeeksRange.label}` : ''}
                    </div>
                    <div className="flex justify-end gap-4 pt-4 border-t"><button onClick={() => setIsWeekFilterOpen(false)} className="text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors">Cancel</button><button onClick={() => setIsWeekFilterOpen(false)} className="px-8 py-2.5 bg-[#0071CE] text-white rounded-full font-black text-sm hover:bg-[#004F91] transition-all shadow-md">Apply</button></div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5 h-full relative">
                <button onMouseEnter={(e) => setActionTooltip({ tip: 'Upload CSV', rect: e.currentTarget.getBoundingClientRect() })} onMouseLeave={() => setActionTooltip(null)} className="p-2.5 text-slate-500 border border-slate-300 rounded-lg hover:bg-blue-50 transition-all"><Upload size={18} /></button>
                <button onMouseEnter={(e) => setActionTooltip({ tip: 'Download CSV', rect: e.currentTarget.getBoundingClientRect() })} onMouseLeave={() => setActionTooltip(null)} className="p-2.5 text-slate-500 border border-slate-300 rounded-lg hover:bg-blue-50 transition-all"><Download size={18} /></button>
            </div>
            <button onClick={() => setIsReserving(true)} disabled={!canReserve} className={`px-10 h-full rounded-xl text-sm font-black transition-all shadow-lg min-w-[180px] ${canReserve ? 'bg-[#0071CE] text-white shadow-[#0071CE]/20 hover:bg-[#004F91]' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>
                Reserve {selectionCount > 0 ? selectionCount : ''} slots
            </button>
          </div>
        </div>

        {/* Legend / Selection Summary Bar */}
        <div className="px-8 py-3 bg-white border-b border-slate-100 flex items-center justify-between shrink-0 z-20 overflow-visible">
          <div className="flex items-center gap-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <div className="flex items-center gap-2.5"><div className="w-5 h-5 rounded bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 font-bold"><Lock size={12} strokeWidth={3} /></div>Booked</div>
            <div className="flex items-center gap-2.5"><div className="w-5 h-5 rounded bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 font-bold"><Clock size={12} strokeWidth={3} /></div>IO in progress</div>
            <div className="flex items-center gap-2.5"><div className="w-5 h-5 rounded bg-green-50 border border-green-200 flex items-center justify-center text-green-700 font-bold"><Zap size={12} fill="currentColor" className="fill-green-700/20" /></div>Interest</div>
            <div className="flex items-center gap-2.5"><div className="w-5 h-5 rounded bg-slate-50 border border-slate-300 flex items-center justify-center text-slate-400 font-bold"><Square size={12} strokeWidth={3} /></div>Blank</div>
          </div>

          <div className="flex items-center gap-2 flex-wrap animate-in fade-in slide-in-from-right-2">
            {selectedDMAs.size > 0 && (<div className="flex items-center bg-[#E5F1FF] text-[#0071CE] px-3 py-1.5 rounded-full text-xs font-black border border-blue-100 shadow-sm">{selectedDMAs.size} DMAs • {selectedStoresCount.toLocaleString()} stores<button onClick={() => setSelectedDMAs(new Set())} className="ml-2 hover:text-[#004F91] transition-colors"><X size={14} strokeWidth={4} /></button></div>)}
            {weekRange.start && (
                <div className="flex items-center bg-[#E5F1FF] text-[#0071CE] px-3 py-1.5 rounded-full text-xs font-black border border-blue-100 shadow-sm">
                    WM Week {activeRange?.min}{activeRange && activeRange.max > activeRange.min ? ` - ${activeRange.max}` : ''}
                    <button onClick={() => setWeekRange({start:null, end:null})} className="ml-2 hover:text-[#004F91] transition-colors"><X size={14} strokeWidth={4} /></button>
                </div>
            )}
            {(selectedDMAs.size > 0 || weekRange.start || viewFilter !== 'all') && (<button onClick={() => { setSelectedDMAs(new Set()); setWeekRange({ start: null, end: null }); setViewFilter('all'); }} className="text-[11px] font-black uppercase text-rose-600 hover:text-rose-800 underline ml-2 transition-all">Clear all</button>)}
          </div>
        </div>

        {/* Grid Area */}
        <div ref={gridScrollRef} className="flex-1 overflow-auto bg-white" onMouseLeave={() => setActiveCursor({ dmaId: null, weekId: null })}>
          <table className="border-separate border-spacing-0 w-full relative table-fixed">
            <thead>
              <tr className="sticky top-0 z-[200]">
                <th className={`sticky left-0 z-[210] bg-[#F1F5F9] border-b border-r border-slate-200 p-0 text-left w-[360px] shadow-[4px_0_6px_-2px_rgba(0,0,0,0.1)] transition-colors ${activeCursor.dmaId ? 'bg-[#E5EAF5]' : ''} ${isScrolled ? 'shadow-[4px_4px_6px_-2px_rgba(0,0,0,0.1)]' : ''}`}>
                  <div className="flex items-center gap-3 p-4 overflow-visible relative">
                    <button onClick={handleHeaderCheckboxToggle} className="text-slate-400 hover:text-[#0071CE] transition-colors shrink-0">{selectedDMAs.size > 0 ? <MinusSquare size={18} className="text-[#0071CE]" /> : <Square size={18} />}</button>
                    <div className="flex items-center gap-2"><span className="text-xs font-black text-slate-500 uppercase tracking-widest">{isAnyFilterActive ? "Filtered DMAs" : "All DMAs"}</span>
                    <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded text-[11px] font-black leading-none border border-slate-300/50">{filteredDMAs.length}</span></div>
                    <div className="relative ml-auto shrink-0" ref={filterRef}>
                      <button onMouseEnter={(e) => setActionTooltip({ tip: 'View DMA by...', rect: e.currentTarget.getBoundingClientRect() })} onMouseLeave={() => setActionTooltip(null)} onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all ${viewFilter !== 'all' ? 'bg-blue-50 text-[#0071CE] border border-blue-100 shadow-sm' : 'hover:bg-slate-200 text-slate-400'}`}>
                        {viewFilter !== 'all' && <span className="text-[10px] font-black uppercase tracking-tight mr-1">{viewFilter}</span>}<Eye size={16} strokeWidth={3} />
                      </button>
                      {isFilterDropdownOpen && (
                        <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-slate-200 rounded-lg shadow-2xl z-[500] animate-in fade-in zoom-in-95 overflow-visible">
                          <div className="px-4 py-4 border-b bg-slate-50 flex items-center justify-between">
                            <div className="flex items-center gap-2 font-black text-sm uppercase text-slate-600 tracking-tight"><Eye size={16} /> VIEW DMA by</div>
                            <div className="group relative flex items-center">
                              <Info size={14} className="text-slate-400 hover:text-[#0071CE] cursor-help" />
                              <div className="fixed z-[3000] p-3 bg-slate-900 text-white text-[10px] font-bold rounded-lg shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none transform translate-x-[-105%] translate-y-[-50%] w-52 shadow-black/40 leading-relaxed border border-white/10 whitespace-normal">For Run Of Network (RON), select all DMAs</div>
                            </div>
                          </div>
                          <RadioItem label="View all / Reset" active={viewFilter === 'all'} onClick={() => { setViewFilter('all'); setIsFilterDropdownOpen(false); }} />
                          <div className="h-px bg-slate-100 mx-2" />
                          <RadioItem label="Selected only" active={viewFilter === 'selected'} disabled={selectedDMAs.size === 0} onClick={() => { setViewFilter('selected'); setIsFilterDropdownOpen(false); }} />
                          <RadioItem label="Available only" active={viewFilter === 'available'} disabled={!weekRange.start} onClick={() => { setViewFilter('available'); setIsFilterDropdownOpen(false); }} />
                          <RadioItem label="Unavailable only" active={viewFilter === 'unavailable'} disabled={!weekRange.start} onClick={() => { setViewFilter('unavailable'); setIsFilterDropdownOpen(false); }} />
                        </div>
                      )}
                    </div>
                  </div>
                </th>
                {displayWeeks.map((week) => {
                  const inRange = activeRange && week.id >= activeRange.min && week.id <= activeRange.max;
                  const isColHovered = activeCursor.weekId === week.id;
                  const blocked = isWeekDisabled(week.id);
                  let bg = 'bg-[#F1F5F9]';
                  if (blocked) bg = isColHovered ? 'bg-rose-100' : 'bg-rose-50';
                  else if (inRange) bg = 'bg-[#0071CE] shadow-md';
                  else if (isColHovered) bg = 'bg-[#E5EAF5]';
                  const labelColor = blocked ? 'text-rose-600' : inRange ? 'text-white' : 'text-slate-900';
                  const dateColor = blocked ? 'text-rose-600 opacity-80' : inRange ? 'text-blue-100' : 'text-slate-500';
                  return (
                    <th key={week.dates} onClick={() => handleWeekHeaderClick(week.id)} onMouseEnter={() => setActiveCursor({ dmaId: null, weekId: week.id })} className={`sticky top-0 p-0 border-b border-slate-200 w-[150px] transition-all z-[200] group ${bg} ${blocked ? 'cursor-not-allowed' : 'cursor-pointer'} ${isScrolled ? 'shadow-[0_4px_6px_-2px_rgba(0,0,0,0.1)]' : ''}`}>
                      <div className={`py-5 flex flex-col items-center relative transition-transform duration-200 ${blocked ? 'pointer-events-none' : ''}`}>
                        {blocked && <Lock size={16} className="absolute top-1 text-rose-600" />}
                        {isColHovered && !weekRange.end && !blocked && (<div className="absolute top-1 animate-in zoom-in-75 fade-in duration-200"><Plus size={20} strokeWidth={3} className="text-[#0071CE]" /></div>)}
                        <span className={`text-sm font-black ${labelColor}`}>{week.label}</span>
                        <span className={`text-[10px] font-bold ${dateColor}`}>{week.dates}</span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="relative z-0">
              {filteredDMAs.map((dma) => {
                const isSelected = selectedDMAs.has(dma.id);
                const isRowHovered = activeCursor.dmaId === dma.id;
                const blockedDma = isDmaDisabled(dma.id);
                const rowBg = blockedDma ? (isRowHovered ? 'bg-rose-100' : 'bg-rose-50') : isSelected ? 'bg-blue-50' : (isRowHovered ? 'bg-[#E5EAF5]' : 'bg-white');
                return (
                  <tr key={dma.id} className="group/row">
                    <td onClick={() => handleDmaToggle(dma.id)} onMouseEnter={() => setActiveCursor({ dmaId: dma.id, weekId: null })} className={`sticky left-0 z-[90] border-b border-r border-slate-200 p-4 transition-all shadow-[4px_0_6px_-2px_rgba(0,0,0,0.1)] ${rowBg} ${blockedDma ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                      <div className="flex items-center gap-3">
                        <div className={`transition-colors duration-150 ${isSelected ? 'text-[#0071CE]' : (blockedDma ? 'text-rose-600' : 'text-slate-400 group-hover/row:text-[#0071CE]')}`}>
                          {blockedDma ? <Lock size={18} /> : isSelected ? <CheckSquare size={18} /> : <Square size={18} />}
                        </div>
                        <div className="flex flex-col"><span className={`text-sm font-bold ${isSelected ? 'text-[#004F91]' : blockedDma ? 'text-rose-950' : 'text-slate-900'}`}>{dma.name}</span><span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">DMA {dma.id} • {dma.stores} Stores</span></div>
                      </div>
                    </td>
                    {displayWeeks.map((week) => {
                      const slotKey = `${dma.id}-${week.id}`;
                      const cellData = INITIAL_SLOT_DATA[slotKey];
                      const isSelectedCell = isCellSelected(dma.id, week.id);
                      const isColHovered = activeCursor.weekId === week.id;
                      const isRowHoveredLocal = activeCursor.dmaId === dma.id;
                      const blockedWeek = isWeekDisabled(week.id);
                      const isBooked = !!cellData?.booked;
                      const hasActivity = isBooked || (cellData?.ios?.length > 0) || (cellData?.interests?.length > 0);
                      const isCrosshairPath = isRowHoveredLocal || isColHovered;
                      
                      let bg = 'bg-white'; let ring = ''; let z = 'z-0'; 
                      if (isBooked) { bg = isCrosshairPath ? 'bg-rose-50' : 'bg-rose-50/60'; if (isCrosshairPath) { ring = 'ring-2 ring-inset ring-rose-300 shadow-md'; z = 'z-20'; } }
                      else if (cellData?.ios?.length > 0) { bg = isCrosshairPath ? 'bg-amber-100' : 'bg-amber-50'; }
                      else if (cellData?.interests?.length > 0) { bg = isCrosshairPath ? 'bg-green-100' : 'bg-green-50'; }
                      else if (blockedDma || blockedWeek) { 
                        const isFocused = activeCursor.dmaId === dma.id && activeCursor.weekId === week.id;
                        bg = isFocused ? 'bg-rose-100' : 'bg-rose-50/40'; if (isFocused) ring = 'ring-2 ring-inset ring-rose-400'; z = 'z-20'; 
                      }
                      else if (isCrosshairPath) { bg = 'bg-[#F0F4FA]'; }
                      
                      if (isSelectedCell) {
                        bg = isBooked ? 'bg-rose-100' : (cellData?.ios?.length > 0) ? 'bg-amber-100' : (cellData?.interests?.length > 0) ? 'bg-green-100' : 'bg-blue-50';
                        ring = 'ring-2 ring-inset ring-[#0071CE]';
                        z = 'z-10';
                      }

                      const isDisabledCell = isBooked || blockedDma || blockedWeek;
                      return (
                        <td key={`${dma.id}-${week.dates}`} onClick={() => !isDisabledCell && handleCellClick(dma.id, week.id)} onMouseEnter={() => setActiveCursor({ dmaId: dma.id, weekId: week.id })} className={`border-b border-r border-slate-200 h-28 group/slot transition-all relative overflow-visible ${bg} ${ring} ${z} ${isDisabledCell ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                          <div className="flex flex-col items-center justify-between h-full py-4 px-2 text-center pointer-events-none">
                            {!isSelectedCell && (
                              <div className="flex flex-col items-center gap-1 w-full pointer-events-none">
                                {isBooked && <Lock size={14} className="text-rose-600" />}
                                {!isBooked && cellData?.ios?.length > 0 && <Clock size={14} className="text-amber-700" />}
                                {!isBooked && cellData?.ios?.length === 0 && cellData?.interests?.length > 0 && <Zap size={14} className="text-green-700 fill-green-700/20" />}
                                <span className={`text-[10px] font-black uppercase leading-tight line-clamp-2 ${isBooked ? 'text-rose-900' : (cellData?.ios?.length > 0 ? 'text-amber-900' : (cellData?.interests?.length > 0 ? 'text-green-800' : 'text-slate-800'))}`}>{isBooked ? cellData.booked.advertiser : (cellData?.ios?.length > 0 ? cellData.ios[0].advertiser : (cellData?.interests?.length > 0 ? cellData.interests[0].advertiser : ''))}</span>
                              </div>
                            )}
                            {hasActivity && !isSelectedCell && (<button className="pointer-events-auto mt-auto flex items-center gap-1.5 text-[#0071CE] underline font-black text-[13px] hover:text-[#004F91] transition-all bg-transparent border-none p-0 opacity-0 group-hover/slot:opacity-100" onClick={(e) => { e.stopPropagation(); setViewDetailSlot({ dmaId: dma.id, weekId: week.id }); }}><Eye size={15} strokeWidth={3} /> View detail</button>)}
                            {isSelectedCell && !isBooked && <div className="absolute inset-0 flex items-center justify-center animate-in zoom-in-75 pointer-events-none"><div className="w-7 h-7 bg-[#0071CE] rounded-lg flex items-center justify-center shadow-lg border-2 border-white"><Check size={14} className="text-white" strokeWidth={4} /></div></div>}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>

      {/* Detail Slider */}
      <div className={`fixed inset-y-0 right-0 w-[900px] bg-white shadow-2xl border-l border-slate-200 z-[2000] transform transition-transform duration-500 ${viewDetailSlot ? 'translate-x-0' : 'translate-x-full'}`}>
        {viewDetailSlot && (
          <div className="flex flex-col h-full">
            <header className="p-8 flex items-center justify-between border-b border-slate-200 bg-white">
              <div><h2 className="text-2xl font-bold tracking-tight text-slate-900">Walmart Week {viewDetailSlot.weekId}</h2><p className="text-sm text-slate-400 font-medium uppercase">{DMAs.find(d => d.id === viewDetailSlot.dmaId)?.name}</p></div>
              <button onClick={() => setViewDetailSlot(null)} className="p-2 text-slate-400 hover:text-slate-900 transition-colors"><X size={32} /></button>
            </header>
            <div className="flex-1 overflow-y-auto px-8 py-6">
              <div className="flex items-center text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 px-2">
                <div className="w-[20%]">Advertiser</div><div className="w-[18%]">Product</div><div className="w-[18%]">CM Name</div><div className="w-[12%]">Date</div><div className="w-[15%]">Weeks</div>
                <div className="w-[17%] flex items-center justify-end gap-1.5 pr-12">
                   <span>ACTIONS</span><div className="group relative flex items-center"><Info size={12} className="text-slate-400 cursor-help" /><div className="fixed z-[4000] p-2.5 bg-slate-900 text-white text-[10px] font-medium rounded shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none transform translate-x-[-105%] translate-y-[-50%] w-48 shadow-black/30 whitespace-normal">Actions can only be taken by the campaign manager</div></div>
                </div>
              </div>
              <section className="mb-10"><div className="flex items-center gap-2 mb-4 font-bold text-rose-600"><Lock size={18} /> Booked</div><div className="border-t border-slate-200">{INITIAL_SLOT_DATA[`${viewDetailSlot.dmaId}-${viewDetailSlot.weekId}`]?.booked ? <DetailRow rowData={INITIAL_SLOT_DATA[`${viewDetailSlot.dmaId}-${viewDetailSlot.weekId}`].booked} /> : <p className="py-8 text-sm text-slate-400 italic">No confirmed booking.</p>}</div></section>
              <section className="mb-10"><div className="flex items-center justify-between mb-4"><div className="flex items-center gap-2 font-bold text-amber-700"><Clock size={18} /> IO in progress ({INITIAL_SLOT_DATA[`${viewDetailSlot.dmaId}-${viewDetailSlot.weekId}`]?.ios?.length || 0})</div>{INITIAL_SLOT_DATA[`${viewDetailSlot.dmaId}-${viewDetailSlot.weekId}`]?.ios?.length > 2 && (<button onClick={() => setIsIosExpanded(!isIosExpanded)} className="text-xs font-bold text-[#0071CE] flex items-center gap-1">{isIosExpanded ? 'View less' : 'View all'} {isIosExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</button>)}</div><div className="border-t border-slate-200">{(isIosExpanded ? INITIAL_SLOT_DATA[`${viewDetailSlot.dmaId}-${viewDetailSlot.weekId}`]?.ios : INITIAL_SLOT_DATA[`${viewDetailSlot.dmaId}-${viewDetailSlot.weekId}`]?.ios?.slice(0, 2))?.map((io, i) => <DetailRow key={i} rowData={io} />)}</div></section>
              <section className="mb-10"><div className="flex items-center justify-between mb-4"><div className="flex items-center gap-2 font-bold text-green-700"><Zap size={18} className="fill-green-700/20" /> Interest ({INITIAL_SLOT_DATA[`${viewDetailSlot.dmaId}-${viewDetailSlot.weekId}`]?.interests?.length || 0})</div>{INITIAL_SLOT_DATA[`${viewDetailSlot.dmaId}-${viewDetailSlot.weekId}`]?.interests?.length > 2 && (<button onClick={() => setIsInterestsExpanded(!isInterestsExpanded)} className="text-xs font-bold text-[#0071CE] flex items-center gap-1">{isInterestsExpanded ? 'View less' : 'View all'} {isInterestsExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</button>)}</div><div className="border-t border-slate-200">{(isInterestsExpanded ? INITIAL_SLOT_DATA[`${viewDetailSlot.dmaId}-${viewDetailSlot.weekId}`]?.interests : INITIAL_SLOT_DATA[`${viewDetailSlot.dmaId}-${viewDetailSlot.weekId}`]?.interests?.slice(0, 2))?.map((o, i) => <DetailRow key={i} rowData={o} />)}</div></section>
            </div>
            <footer className="p-8 border-t border-slate-200 flex justify-end gap-6 bg-slate-50 bg-opacity-30"><button onClick={() => setViewDetailSlot(null)} className="text-sm font-bold text-slate-500 uppercase tracking-widest">Cancel</button><button onClick={() => setViewDetailSlot(null)} className="px-10 py-4 bg-[#0071CE] text-white font-black rounded-full shadow hover:bg-[#004F91] transition-all text-sm uppercase tracking-widest">Save changes</button></footer>
          </div>
        )}
      </div>

      {/* Reservation Drawer */}
      <div className={`fixed inset-y-0 right-0 w-[480px] bg-white shadow-2xl border-l border-slate-200 z-[2500] transition-all duration-500 transform ${isReserving ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full relative">
          <header className="px-8 py-6 flex items-center justify-between border-b border-slate-200 bg-white">
            <div>
              <h2 className="text-[22px] font-black text-slate-900 leading-tight">Reserve SCO Ads</h2>
              <p className="text-[13px] text-slate-500 mt-1 font-medium">{selectedDMAs.size} DMAs selected • Weeks {activeRange ? activeRange.min : ''} {activeRange && activeRange.max > activeRange.min ? `- ${activeRange.max}` : ''}</p>
            </div>
            <button onClick={() => setIsReserving(false)} className="p-2 text-slate-400 hover:text-slate-900 transition-colors"><X size={24} /></button>
          </header>
          
          <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
            <div className="space-y-1.5"><label className="text-[14px] font-bold text-slate-700">Advertiser</label>
              <AdvertiserTypeahead value={advertiser} onChange={setAdvertiser} />
            </div>

            <div className="space-y-4 pt-2"><label className="text-[14px] font-bold text-slate-700">Status</label>
              <div className="flex flex-row items-center gap-12">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center w-5 h-5 rounded-full border-2 border-slate-400 group-hover:border-[#0071CE] transition-all">{reserveStatus === 'interest' && <div className="w-2.5 h-2.5 bg-[#0071CE] rounded-full" />}<input type="radio" className="sr-only" checked={reserveStatus === 'interest'} onChange={() => setReserveStatus('interest')} /></div><div className="text-[14px] font-black text-slate-900">Interest</div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center w-5 h-5 rounded-full border-2 border-slate-400 group-hover:border-[#0071CE] transition-all">{reserveStatus === 'book' && <div className="w-2.5 h-2.5 bg-[#0071CE] rounded-full" />}<input type="radio" className="sr-only" checked={reserveStatus === 'book'} onChange={() => setReserveStatus('book')} /></div><div className="text-[14px] font-black text-slate-900">IO in progress</div>
                </label>
              </div>
            </div>

            {reserveStatus === 'book' && (
                <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
                   <div className="space-y-1.5"><label className="text-[13px] font-black text-slate-500 uppercase tracking-tight">IO status</label>
                        <div className="relative"><select value={ioStatus} onChange={e => setIoStatus(e.target.value)} className="w-full h-[46px] px-4 bg-white border border-slate-300 rounded-md font-bold text-slate-800 outline-none focus:border-[#0071CE] appearance-none shadow-sm text-sm"><option value="Draft">Draft</option><option value="Finalized">Finalized</option></select><ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} /></div>
                    </div>
                    <div className="space-y-1.5"><label className="text-[13px] font-black text-slate-500 uppercase tracking-tight">IO Name (optional)</label><input type="text" value={ioName} onChange={(e) => setIoName(e.target.value)} placeholder="e.g. Back to School 2026" className="w-full h-[46px] px-4 border border-slate-300 rounded-md font-medium text-slate-800 outline-none focus:border-[#0071CE] text-sm bg-white placeholder-slate-400" /></div>
                    <div className="space-y-1.5"><label className="text-[13px] font-black text-slate-500 uppercase tracking-tight">IO Number (optional)</label><input type="text" value={ioNumber} onChange={(e) => setIoNumber(e.target.value)} placeholder="e.g. IO-882103" className="w-full h-[46px] px-4 border border-slate-300 rounded-md font-medium text-slate-800 outline-none focus:border-[#0071CE] text-sm bg-white placeholder-slate-400" /></div>
                </div>
            )}

            <div className="space-y-1.5"><label className="text-[14px] font-bold text-slate-700">Campaign name (optional)</label><input type="text" value={campaignName} onChange={(e) => setCampaignName(e.target.value)} placeholder="Enter campaign name" className="w-full h-[46px] px-4 border border-slate-300 rounded-md font-medium text-slate-800 outline-none focus:border-[#0071CE] text-sm placeholder-slate-400" /></div>
            <div className="space-y-1.5"><label className="text-[14px] font-bold text-slate-700">Brand/product (optional)</label><input type="text" value={brandProduct} onChange={(e) => setBrandProduct(e.target.value)} placeholder="Enter brand or product" className="w-full h-[46px] px-4 border border-slate-300 rounded-md font-medium text-slate-800 outline-none focus:border-[#0071CE] text-sm placeholder-slate-400" /></div>
            <div className="space-y-1.5"><label className="text-[14px] font-bold text-slate-700">Ad group name (optional)</label><input type="text" value={adGroupName} onChange={(e) => setAdGroupName(e.target.value)} placeholder="Enter ad group name" className="w-full h-[46px] px-4 border border-slate-300 rounded-md font-medium text-slate-800 outline-none focus:border-[#0071CE] text-sm placeholder-slate-400" /></div>

            <div className="space-y-1.5"><label className="text-[14px] font-bold text-slate-700">Category</label>
                <div className="relative"><select value={category} onChange={e => setCategory(e.target.value)} className="w-full h-[46px] px-4 bg-white border border-slate-300 rounded-md font-bold text-slate-800 outline-none focus:border-[#0071CE] appearance-none shadow-sm text-sm"><option value="">Select category</option>{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select><ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} /></div>
            </div>

            <div className="space-y-1.5"><label className="text-[14px] font-bold text-slate-700">Campaign Manager</label>
                <div className="relative"><select value={campaignManager} onChange={e => setCampaignManager(e.target.value)} className="w-full h-[46px] px-4 bg-white border border-slate-300 rounded-md font-bold text-slate-800 outline-none focus:border-[#0071CE] appearance-none shadow-sm text-sm"><option value="">Assign manager</option>{MANAGERS.map(m => <option key={m} value={m}>{m}</option>)}</select><ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} /></div>
            </div>

            <div className="space-y-1.5 pt-2"><label className="text-[14px] font-bold text-slate-700">Notes (optional)</label><textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Add campaign notes..." className="w-full px-4 py-3 border border-slate-300 rounded-md font-medium outline-none focus:border-[#0071CE] resize-none shadow-sm text-sm placeholder-slate-400" /></div>
          </div>
          
          <footer className="px-8 py-6 border-t border-slate-200 flex justify-end gap-6 bg-white shrink-0">
            <button onClick={() => setIsReserving(false)} className="text-[14px] font-bold text-slate-500 underline hover:text-slate-800">Cancel</button>
            <button className="px-10 py-3 bg-[#0071CE] text-white font-black rounded-full shadow hover:bg-[#004F91] transition-all text-[14px]">Reserve</button>
          </footer>
        </div>
      </div>

      {actionTooltip && (
        <div className="fixed pointer-events-none z-[9999] px-3 py-1.5 bg-slate-900 text-white text-[11px] font-medium rounded shadow-xl whitespace-nowrap" style={{ left: actionTooltip.rect.left + (actionTooltip.rect.width / 2), top: actionTooltip.rect.top - 8, transform: 'translate(-50%, -100%)' }}>
          {actionTooltip.tip}<div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
        </div>
      )}

      {(isReserving || viewDetailSlot) && <div className="fixed inset-0 bg-black/50 z-[1050]" onClick={() => { setIsReserving(false); setViewDetailSlot(null); }} />}
    </div>
  );
}
