import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Search, Download, Lock, Clock, X, Calendar, ChevronDown, Plus,
  Check, CheckSquare, Square, Zap, MinusSquare, MapPin,
  Eye, ChevronRight, ChevronUp, Filter as FilterIcon,
  ShoppingCart, Gamepad2, Home as HomeIcon, Baby, Heart, Pill, PawPrint, Monitor,
} from 'lucide-react';

// ─── Design tokens ──────────────────────────────────────────────────────────
const BLUE = '#0053E2';

// ─── StoresLabel component (matches App.jsx) ─────────────────────────────────
const StoresLabel = ({ text, count }) => {
  const containerRef = useRef(null);
  const labelRef = useRef(null);
  const badgeRef = useRef(null);
  const lastWidthRef = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    const label = labelRef.current;
    const badge = badgeRef.current;
    if (!container || !label || !badge) return;
    let raf = 0;

    const measure = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const range = document.createRange();
        range.selectNodeContents(label);
        const rects = range.getClientRects();
        if (rects.length === 0) return;
        const containerRect = container.getBoundingClientRect();
        const firstTop = rects[0].top - containerRect.top;
        const lastBottom = rects[rects.length - 1].bottom - containerRect.top;
        const midY = (firstTop + lastBottom) / 2;
        const badgeH = badge.offsetHeight;
        const gap = 16;
        let maxRight = 0;
        for (let i = 0; i < rects.length; i++) {
          const r = rects[i].right - containerRect.left;
          if (r > maxRight) maxRight = r;
        }
        const textEnd = Math.ceil(maxRight);
        badge.style.left = textEnd + gap + 'px';
        badge.style.top = Math.round(midY - badgeH / 2) + 'px';
        badge.style.visibility = '';
        const needed = textEnd + gap + badge.offsetWidth;
        if (needed !== lastWidthRef.current) {
          lastWidthRef.current = needed;
          container.style.marginRight = (gap + badge.offsetWidth) + 'px';
        }
      });
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(container.parentElement);
    return () => { ro.disconnect(); cancelAnimationFrame(raf); };
  }, [text, count]);

  return (
    <div ref={containerRef} className="relative min-w-0" style={{overflow: 'visible'}}>
      <div ref={labelRef} className="font-black text-slate-500 uppercase tracking-widest" style={{fontSize:'12px', lineHeight:'16px', letterSpacing:'0.05em'}}>{text}</div>
      <span ref={badgeRef} className="absolute bg-slate-200 text-slate-700 px-2 py-0.5 rounded text-[11px] font-black border border-slate-300/50 whitespace-nowrap" style={{visibility: 'hidden'}}>{count}</span>
    </div>
  );
};
const surfaceCard = {
  background: '#ffffff',
  border: '1px solid #E3E4E5',
  borderRadius: 12,
  boxShadow: '0 1px 2px rgba(0,31,100,0.04)',
};
const subtle = { color: '#74767C' };

// ─── Fiscal weeks (same as main calendar) ─────────────────────────────────────
const FY2027_START = new Date('2026-02-01');

const generateFiscalWeeks = () => {
  const weeks = [];
  for (let i = 0; i < 52; i++) {
    const start = new Date(FY2027_START);
    start.setDate(start.getDate() + (i * 7));
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    const fmt = (d) => d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
    weeks.push({
      id: i + 1,
      weekNumber: i + 1,
      label: `WM Week ${i + 1}`,
      dates: `${fmt(start)} - ${fmt(end)}`,
      startDate: start,
      endDate: end,
    });
  }
  return weeks;
};

const FISCAL_WEEKS = generateFiscalWeeks();

// ─── Zones and Aisles ─────────────────────────────────────────────────────────
// Grocery: 12 screens, Toys: 6, Home: 4, Baby: 3, HHE: 5, Health & Beauty: 2, OTC/Pharmacy: 2, Pets: 2
const ZONES = [
  { id: 'grocery', name: 'Grocery', icon: 'grocery', totalScreens: 12, aisles: [
    { id: 'grocery-1', name: 'Soda/Drinks' },
    { id: 'grocery-2', name: 'Seasoning' },
    { id: 'grocery-3', name: 'Chips/Snacks' },
    { id: 'grocery-4', name: 'Cereal' },
    { id: 'grocery-5', name: 'Canned Goods' },
    { id: 'grocery-6', name: 'Pasta & Rice' },
    { id: 'grocery-7', name: 'Baking' },
    { id: 'grocery-8', name: 'Condiments' },
    { id: 'grocery-9', name: 'Coffee & Tea' },
    { id: 'grocery-10', name: 'Breakfast' },
    { id: 'grocery-11', name: 'International Foods' },
    { id: 'grocery-12', name: 'Organic & Natural' },
  ]},
  { id: 'toys', name: 'Toys', icon: 'toys', totalScreens: 6, aisles: [
    { id: 'toys-1', name: 'Action Figures' },
    { id: 'toys-2', name: 'Games & Puzzles' },
    { id: 'toys-3', name: 'Dolls & Playsets' },
    { id: 'toys-4', name: 'Outdoor Play' },
    { id: 'toys-5', name: 'Building Sets' },
    { id: 'toys-6', name: 'Educational Toys' },
  ]},
  { id: 'home', name: 'Home', icon: 'home', totalScreens: 4, aisles: [
    { id: 'home-1', name: 'Furniture' },
    { id: 'home-2', name: 'Furnishings' },
    { id: 'home-3', name: 'Bedding' },
    { id: 'home-4', name: 'Kitchen' },
  ]},
  { id: 'baby', name: 'Baby', icon: 'baby', totalScreens: 3, aisles: [
    { id: 'baby-1', name: 'Diapers & Wipes' },
    { id: 'baby-2', name: 'Baby Food' },
    { id: 'baby-3', name: 'Baby Care' },
  ]},
  { id: 'hhe', name: 'Household Essentials', icon: 'hhe', totalScreens: 5, aisles: [
    { id: 'hhe-1', name: 'Cleaning Supplies' },
    { id: 'hhe-2', name: 'Paper Goods' },
    { id: 'hhe-3', name: 'Laundry' },
    { id: 'hhe-4', name: 'Air Fresheners' },
    { id: 'hhe-5', name: 'Trash Bags' },
  ]},
  { id: 'health-beauty', name: 'Health & Beauty', icon: 'beauty', totalScreens: 2, aisles: [
    { id: 'beauty-1', name: 'Skincare' },
    { id: 'beauty-2', name: 'Haircare' },
  ]},
  { id: 'otc-pharmacy', name: 'OTC/Pharmacy', icon: 'pharmacy', totalScreens: 2, aisles: [
    { id: 'pharmacy-1', name: 'Pain Relief' },
    { id: 'pharmacy-2', name: 'Vitamins & Supplements' },
  ]},
  { id: 'pets', name: 'Pets', icon: 'pets', totalScreens: 2, aisles: [
    { id: 'pets-1', name: 'Dog Food' },
    { id: 'pets-2', name: 'Cat Food' },
  ]},
];

const ZONE_ICONS = {
  grocery: ShoppingCart,
  toys: Gamepad2,
  home: HomeIcon,
  baby: Baby,
  hhe: Monitor,
  beauty: Heart,
  pharmacy: Pill,
  pets: PawPrint,
};

const ADVERTISERS = [
  'Pepsi', 'Coca Cola', 'Monster Energy', 'Celsius', 'Frito Lay', 'Pringles',
  'Cheeze It', 'Doritos', 'McCormick', 'Old Spice', 'Pampers', 'Huggies',
  'Tide', 'Bounty', 'Charmin', "L'Oreal", 'Neutrogena', 'Tylenol', 'Advil',
  'Purina', 'Blue Buffalo', 'LEGO', 'Hasbro', 'Mattel', 'IKEA', 'Ashley',
];

// High-demand weeks (holidays) - FY2027 starts Feb 1, 2026
// Week 22-23: July 4th (June 28 - July 11)
// Week 31-32: Labor Day (Sept 6-19)
// Week 43-48: Holiday Season (Thanksgiving through Christmas)
const HIGH_DEMAND_WEEKS = new Set([22, 23, 31, 32, 43, 44, 45, 46, 47, 48]);

// Generate booking data for each aisle-week combination
// Kangaroo just started - lots of availability, but guaranteed variety in early weeks
const generateBookingData = () => {
  const data = {};

  // First pass: generate random bookings with moderate rates
  ZONES.forEach((zone, zoneIdx) => {
    zone.aisles.forEach((aisle, aisleIdx) => {
      FISCAL_WEEKS.forEach(week => {
        const key = `${aisle.id}-${week.id}`;
        const roll = Math.random();

        let bookingChance;
        
        // High demand weeks (July 4th, Labor Day, Holiday season)
        if (HIGH_DEMAND_WEEKS.has(week.id)) {
          bookingChance = 0.55 + (aisleIdx % 3) * 0.08; // 55-79% booking chance
        } else if (week.id <= 10) {
          // Past weeks - moderate bookings
          bookingChance = 0.30 + (aisleIdx % 3) * 0.06;
        } else if (week.id <= 15) {
          // Recent weeks - some bookings
          bookingChance = 0.18 + (aisleIdx % 4) * 0.04;
        } else if (week.id <= 25) {
          // Near future - fewer bookings
          bookingChance = 0.08 + (aisleIdx % 5) * 0.02;
        } else {
          // Far future - mostly available
          bookingChance = 0.04;
        }

        const isBooked = roll < bookingChance;

        if (isBooked) {
          const extendBefore = Math.floor(Math.random() * 2);
          const extendAfter = Math.floor(Math.random() * 2);
          const startWeek = Math.max(1, week.id - extendBefore);
          const endWeek = Math.min(52, week.id + extendAfter);

          data[key] = {
            booked: true,
            advertiser: ADVERTISERS[Math.floor(Math.random() * ADVERTISERS.length)],
            weekSpan: `WM Week ${startWeek} - ${endWeek}`,
          };
        } else {
          data[key] = { booked: false };
        }
      });
    });

    // Per-zone: pick a different random week (spread across 8-18) for sold out
    const soldOutWeek = 8 + zoneIdx + Math.floor(Math.random() * 3);
    zone.aisles.forEach(aisle => {
      const key = `${aisle.id}-${soldOutWeek}`;
      data[key] = {
        booked: true,
        advertiser: ADVERTISERS[Math.floor(Math.random() * ADVERTISERS.length)],
        weekSpan: `WM Week ${soldOutWeek} - ${Math.min(52, soldOutWeek + Math.floor(Math.random() * 2))}`,
      };
    });

    // Add "Near Capacity" weeks (75-99% booked) - 2-3 weeks per zone in weeks 9-16
    const nearCapacityWeeks = [9 + (zoneIdx * 2) % 5, 12 + zoneIdx % 4];
    nearCapacityWeeks.forEach(ncWeek => {
      if (ncWeek === soldOutWeek) return; // Skip if already sold out
      const aisleCount = zone.aisles.length;
      const targetBooked = Math.floor(aisleCount * (0.75 + Math.random() * 0.15)); // 75-90% booked
      const shuffledAisles = [...zone.aisles].sort(() => Math.random() - 0.5);
      shuffledAisles.slice(0, targetBooked).forEach(aisle => {
        const key = `${aisle.id}-${ncWeek}`;
        data[key] = {
          booked: true,
          advertiser: ADVERTISERS[Math.floor(Math.random() * ADVERTISERS.length)],
          weekSpan: `WM Week ${ncWeek} - ${Math.min(52, ncWeek + Math.floor(Math.random() * 2))}`,
        };
      });
    });
  });

  return data;
};

const BOOKING_DATA = generateBookingData();

// ─── State/Store Data for non-In-Aisle tabs ───────────────────────────────────
const STATE_DATA_FULL = {
  AL:{name:'Alabama',cities:['Birmingham','Montgomery','Huntsville','Mobile','Tuscaloosa']},
  AR:{name:'Arkansas',cities:['Little Rock','Fort Smith','Fayetteville','Springdale','Jonesboro','Rogers','Bentonville']},
  AZ:{name:'Arizona',cities:['Phoenix','Tucson','Mesa','Chandler','Scottsdale','Gilbert','Glendale','Tempe']},
  CA:{name:'California',cities:['Los Angeles','San Diego','San Jose','San Francisco','Fresno','Sacramento','Long Beach','Oakland','Bakersfield','Anaheim','Riverside','Stockton','Irvine','Chula Vista','Santa Ana','Fremont','Modesto','Fontana']},
  CO:{name:'Colorado',cities:['Denver','Colorado Springs','Aurora','Fort Collins','Lakewood','Thornton','Arvada','Pueblo']},
  CT:{name:'Connecticut',cities:['Bridgeport','New Haven','Hartford','Stamford','Waterbury']},
  FL:{name:'Florida',cities:['Jacksonville','Miami','Tampa','Orlando','St. Petersburg','Tallahassee','Fort Lauderdale','Cape Coral','Pembroke Pines','Hollywood','Gainesville','Coral Springs','Palm Bay','Lakeland']},
  GA:{name:'Georgia',cities:['Atlanta','Augusta','Columbus','Savannah','Athens','Sandy Springs','Macon','Roswell']},
  IA:{name:'Iowa',cities:['Des Moines','Cedar Rapids','Davenport','Sioux City','Iowa City','Waterloo']},
  IL:{name:'Illinois',cities:['Chicago','Aurora','Naperville','Joliet','Rockford','Springfield','Elgin','Peoria','Champaign']},
  IN:{name:'Indiana',cities:['Indianapolis','Fort Wayne','Evansville','South Bend','Carmel','Fishers','Bloomington']},
  KS:{name:'Kansas',cities:['Wichita','Overland Park','Kansas City','Olathe','Topeka','Lawrence']},
  KY:{name:'Kentucky',cities:['Louisville','Lexington','Bowling Green','Owensboro','Covington']},
  LA:{name:'Louisiana',cities:['New Orleans','Baton Rouge','Shreveport','Lafayette','Lake Charles']},
  MA:{name:'Massachusetts',cities:['Boston','Worcester','Springfield','Cambridge','Lowell','Brockton']},
  MD:{name:'Maryland',cities:['Baltimore','Columbia','Germantown','Silver Spring','Frederick']},
  MI:{name:'Michigan',cities:['Detroit','Grand Rapids','Warren','Sterling Heights','Ann Arbor','Lansing','Flint']},
  MN:{name:'Minnesota',cities:['Minneapolis','Saint Paul','Rochester','Bloomington','Duluth']},
  MO:{name:'Missouri',cities:['Kansas City','St. Louis','Springfield','Columbia','Independence']},
  MS:{name:'Mississippi',cities:['Jackson','Gulfport','Southaven','Hattiesburg','Biloxi']},
  NC:{name:'North Carolina',cities:['Charlotte','Raleigh','Greensboro','Durham','Winston-Salem','Fayetteville','Wilmington','High Point']},
  NE:{name:'Nebraska',cities:['Omaha','Lincoln','Bellevue','Grand Island']},
  NJ:{name:'New Jersey',cities:['Newark','Jersey City','Paterson','Elizabeth','Edison','Woodbridge','Toms River']},
  NM:{name:'New Mexico',cities:['Albuquerque','Las Cruces','Rio Rancho','Santa Fe']},
  NV:{name:'Nevada',cities:['Las Vegas','Henderson','Reno','North Las Vegas','Sparks']},
  NY:{name:'New York',cities:['New York City','Buffalo','Rochester','Yonkers','Syracuse','Albany','New Rochelle']},
  OH:{name:'Ohio',cities:['Columbus','Cleveland','Cincinnati','Toledo','Akron','Dayton','Canton']},
  OK:{name:'Oklahoma',cities:['Oklahoma City','Tulsa','Norman','Broken Arrow','Edmond','Lawton']},
  OR:{name:'Oregon',cities:['Portland','Salem','Eugene','Gresham','Hillsboro','Bend','Beaverton']},
  PA:{name:'Pennsylvania',cities:['Philadelphia','Pittsburgh','Allentown','Reading','Scranton','Bethlehem','Lancaster']},
  SC:{name:'South Carolina',cities:['Charleston','Columbia','North Charleston','Greenville','Rock Hill']},
  TN:{name:'Tennessee',cities:['Nashville','Memphis','Knoxville','Chattanooga','Clarksville','Murfreesboro']},
  TX:{name:'Texas',cities:['Houston','San Antonio','Dallas','Austin','Fort Worth','El Paso','Arlington','Corpus Christi','Plano','Laredo','Lubbock','Garland','Irving','Amarillo','Grand Prairie','Brownsville','McKinney','Frisco','Pasadena','Mesquite']},
  UT:{name:'Utah',cities:['Salt Lake City','West Valley City','Provo','West Jordan','Orem','Sandy','Ogden']},
  VA:{name:'Virginia',cities:['Virginia Beach','Norfolk','Chesapeake','Richmond','Newport News','Alexandria','Hampton','Roanoke']},
  WA:{name:'Washington',cities:['Seattle','Spokane','Tacoma','Vancouver','Bellevue','Kent','Everett','Renton']},
  WI:{name:'Wisconsin',cities:['Milwaukee','Madison','Green Bay','Kenosha','Racine','Appleton','Waukesha']},
};

// Store formats
const FORMATS = ['Supercenter', 'Neighborhood Market', 'Sam\'s Club', 'Discount Store'];

// Generate stores
const generateAllStores = () => {
  const stores = [];
  let num = 1001;
  Object.entries(STATE_DATA_FULL).forEach(([abbr, data]) => {
    const base = abbr === 'TX' ? 80 : abbr === 'CA' ? 70 : abbr === 'FL' ? 55 :
      ['NY','IL','OH','PA','GA','NC','MI'].includes(abbr) ? 35 :
      ['VA','TN','IN','MO','WI','MN','AL','LA','SC','AZ','CO','OK','KY','OR','WA','NJ','MA','MD'].includes(abbr) ? 20 : 8;
    const count = Math.max(base + Math.floor(Math.random() * 5) - 2, 3);
    for (let i = 0; i < count; i++) {
      stores.push({
        id: String(num++),
        city: data.cities[i % data.cities.length],
        state: abbr,
        stateName: data.name,
        format: FORMATS[Math.floor(Math.random() * FORMATS.length)],
        zip: String(10001 + Math.floor(Math.random() * 89999)),
      });
    }
  });
  return stores;
};

const ALL_STORES = generateAllStores();
const STORES_BY_STATE = {};
ALL_STORES.forEach(s => { if (!STORES_BY_STATE[s.state]) STORES_BY_STATE[s.state] = []; STORES_BY_STATE[s.state].push(s); });
const TOTAL_STORES = ALL_STORES.length;

// Generate store booking data (per store, per week)
const SLOT_DATA = {};
(() => {
  ALL_STORES.forEach(store => {
    let wp = 1;
    while (wp <= 52) {
      const isEarly = wp <= 20;
      const chance = isEarly ? 0.08 : 0.025;
      if (Math.random() < chance) {
        const span = Math.floor(Math.random() * 2) + 1;
        const roll = Math.random();
        const isBooked = roll < 0.375;
        const isIo = !isBooked && Math.random() < 0.5;
        const dur = `Wk ${wp}-${Math.min(52, wp + span - 1)}`;
        const mkEntry = () => ({ advertiser: ADVERTISERS[Math.floor(Math.random() * ADVERTISERS.length)], weeks: dur, id: Math.random() });

        for (let s = 0; s < span && (wp + s) <= 52; s++) {
          const key = `${store.id}-${wp + s}`;
          if (isBooked) {
            SLOT_DATA[key] = { booked: mkEntry(), ios: [], interests: [] };
          } else if (isIo) {
            SLOT_DATA[key] = { booked: null, ios: [mkEntry()], interests: [] };
          } else {
            SLOT_DATA[key] = { booked: null, ios: [], interests: [mkEntry()] };
          }
        }
        wp += span + 4;
      } else wp++;
    }
  });
})();

// ─── Main Component ───────────────────────────────────────────────────────────
export default function InventoryCalendar2({ onNavigate, initialTab = 'in-aisle' }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [expandedZones, setExpandedZones] = useState(new Set(ZONES.map(z => z.id)));
  const [selectedAisles, setSelectedAisles] = useState(new Set());
  const [weekRange, setWeekRange] = useState({ start: null, end: null });
  const [hoverWeek, setHoverWeek] = useState(null);
  const [activeCursor, setActiveCursor] = useState({ aisleId: null, weekId: null });
  const [isScrolled, setIsScrolled] = useState(false);
  const [viewFilter, setViewFilter] = useState('all');
  const [availableSubs, setAvailableSubs] = useState(new Set());
  const [isViewFilterOpen, setIsViewFilterOpen] = useState(false);
  const [isReserving, setIsReserving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [weekFilterMode, setWeekFilterMode] = useState('52running');
  const [isWeekFilterOpen, setIsWeekFilterOpen] = useState(false);
  const [customDates, setCustomDates] = useState({ start: '', end: '' });
  // State-based calendar states
  const [expandedStates, setExpandedStates] = useState(new Set());
  const [selectedStores, setSelectedStores] = useState(new Set());
  const [storeWeekRange, setStoreWeekRange] = useState({ start: null, end: null });
  const [storeHoverWeek, setStoreHoverWeek] = useState(null);
  const [storeSearchTerm, setStoreSearchTerm] = useState('');
  const [storeSearchType, setStoreSearchType] = useState('Store #');
  const [isStoreSearchTypeOpen, setIsStoreSearchTypeOpen] = useState(false);
  const [storeFilterState, setStoreFilterState] = useState('');
  const [storeFilterCity, setStoreFilterCity] = useState('');
  const [isStoreFilterPanelOpen, setIsStoreFilterPanelOpen] = useState(false);
  const [storeActiveCursor, setStoreActiveCursor] = useState({ storeId: null, weekId: null });
  const [viewDetailSlot, setViewDetailSlot] = useState(null);
  const [isStoreReserving, setIsStoreReserving] = useState(false);
  const [pinnedState, setPinnedState] = useState(null);
  const [pinnedZone, setPinnedZone] = useState(null);
  const [storeViewFilter, setStoreViewFilter] = useState('all');
  const [storeAvailableSubs, setStoreAvailableSubs] = useState(new Set());
  const [isStoreViewFilterOpen, setIsStoreViewFilterOpen] = useState(false);

  const gridScrollRef = useRef(null);
  const viewFilterRef = useRef(null);
  const viewFilterDropdownRef = useRef(null);
  const filterPanelRef = useRef(null);
  const weekFilterRef = useRef(null);
  const storeSearchTypeRef = useRef(null);
  const storeFilterPanelRef = useRef(null);
  const storeGridScrollRef = useRef(null);
  const stateRowRefs = useRef({});
  const zoneRowRefs = useRef({});
  const storeViewFilterRef = useRef(null);
  const storeViewFilterDropdownRef = useRef(null);

  // Display weeks (show 20 weeks starting from week 8)
  const displayWeeks = useMemo(() => FISCAL_WEEKS.slice(7, 27), []);

  // ─── Store-based calendar helpers ───────────────────────────────────────────
  const filteredStores = useMemo(() => {
    let result = ALL_STORES;
    if (storeFilterState) result = result.filter(s => s.state === storeFilterState);
    if (storeFilterCity) result = result.filter(s => s.city === storeFilterCity);
    if (storeSearchTerm) {
      const parts = storeSearchTerm.toLowerCase().trim().split(',').map(p => p.trim()).filter(Boolean);
      if (storeSearchType === 'Store #') result = result.filter(s => parts.some(p => s.id.includes(p)));
      else if (storeSearchType === 'City') result = result.filter(s => parts.some(p => s.city.toLowerCase().includes(p)));
      else if (storeSearchType === 'Store name') result = result.filter(s => parts.some(p => `Store #${s.id} — ${s.city}`.toLowerCase().includes(p)));
    }
    if (storeViewFilter === 'selected') result = result.filter(s => selectedStores.has(s.id));
    if (storeViewFilter === 'available' && storeAvailableSubs.size === 0 && storeWeekRange.start) result = result.filter(s => !isStoreDisabled(s.id));
    if (storeViewFilter === 'unavailable' && storeWeekRange.start) result = result.filter(s => isStoreDisabled(s.id));
    if (storeViewFilter === 'available' && storeAvailableSubs.size > 0) {
      let wMin, wMax;
      if (storeWeekRange.start) {
        const end = storeWeekRange.end || storeHoverWeek || storeWeekRange.start;
        wMin = Math.min(storeWeekRange.start, end);
        wMax = Math.max(storeWeekRange.start, end);
      } else {
        wMin = 1; wMax = 52;
      }
      result = result.filter(s => {
        for (let w = wMin; w <= wMax; w++) {
          if (SLOT_DATA[`${s.id}-${w}`]?.booked) return false;
        }
        return true;
      });
      result = result.filter(s => {
        for (let w = wMin; w <= wMax; w++) {
          const d = SLOT_DATA[`${s.id}-${w}`];
          const isBlank = !d?.booked && !d?.ios?.length && !d?.interests?.length;
          if (storeAvailableSubs.has('blank') && isBlank) return true;
          if (storeAvailableSubs.has('io') && d?.ios?.length > 0) return true;
          if (storeAvailableSubs.has('interest') && d?.interests?.length > 0) return true;
        }
        return false;
      });
    }
    return result;
  }, [storeFilterState, storeFilterCity, storeSearchTerm, storeSearchType, storeViewFilter, storeAvailableSubs, selectedStores, storeWeekRange, storeHoverWeek]);

  const filteredByState = useMemo(() => {
    const map = {};
    filteredStores.forEach(s => { if (!map[s.state]) map[s.state] = []; map[s.state].push(s); });
    return map;
  }, [filteredStores]);
  const filteredStateKeys = useMemo(() => Object.keys(filteredByState).sort(), [filteredByState]);
  const isStoreAnyFilterActive = storeFilterState || storeFilterCity || storeSearchTerm || storeViewFilter !== 'all';

  const isStoreDisabled = (id, targetWeekId = null) => {
    if (!storeWeekRange.start && targetWeekId === null) return false;
    const start = storeWeekRange.start || targetWeekId;
    const end = targetWeekId !== null ? targetWeekId : (storeWeekRange.end || storeHoverWeek || storeWeekRange.start);
    const min = Math.min(start, end);
    const max = Math.max(start, end);
    for (let w = min; w <= max; w++) if (SLOT_DATA[`${id}-${w}`]?.booked) return true;
    return false;
  };

  const isStoreWeekHardBooked = (wid) => {
    if (selectedStores.size === 0) return false;
    for (const sid of selectedStores) { if (SLOT_DATA[`${sid}-${wid}`]?.booked) return true; }
    return false;
  };

  const isStoreWeekDisabled = (wid) => {
    if (selectedStores.size === 0) return false;
    if (!storeWeekRange.start) return isStoreWeekHardBooked(wid);
    if (wid === storeWeekRange.start) return isStoreWeekHardBooked(wid);
    const [lo, hi] = wid > storeWeekRange.start ? [storeWeekRange.start + 1, wid] : [wid, storeWeekRange.start - 1];
    for (let w = lo; w <= hi; w++) if (isStoreWeekHardBooked(w)) return true;
    return false;
  };

  const isStoreCellSelected = (storeId, weekId) => {
    if (!selectedStores.has(storeId) || !storeActiveRange || !storeWeekRange.end) return false;
    return weekId >= storeActiveRange.min && weekId <= storeActiveRange.max;
  };

  const handleStoreWeekHeaderClick = (weekId) => {
    if (isStoreWeekDisabled(weekId)) return;
    if (!storeWeekRange.start || (storeWeekRange.start && storeWeekRange.end)) setStoreWeekRange({ start: weekId, end: null });
    else setStoreWeekRange(prev => ({ ...prev, end: weekId }));
  };

  const toggleStore = (id) => {
    if (isStoreDisabled(id)) return;
    const next = new Set(selectedStores);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedStores(next);
  };

  const handleStoreCellClick = (storeId, weekId) => {
    if (SLOT_DATA[`${storeId}-${weekId}`]?.booked) return;
    if (isStoreDisabled(storeId, weekId) || isStoreWeekDisabled(weekId)) return;
    if (!selectedStores.has(storeId)) toggleStore(storeId);
    handleStoreWeekHeaderClick(weekId);
  };

  const toggleStateExpand = (st) => { const n = new Set(expandedStates); if (n.has(st)) n.delete(st); else n.add(st); setExpandedStates(n); };

  const selectAllInState = (st) => {
    const next = new Set(selectedStores);
    const stores = filteredByState[st] || [];
    const allSel = stores.every(s => next.has(s.id));
    stores.forEach(s => { if (allSel) next.delete(s.id); else { if (!isStoreDisabled(s.id)) next.add(s.id); } });
    setSelectedStores(next);
  };

  const selectAllFilteredStores = () => {
    const next = new Set(selectedStores);
    const allSel = filteredStores.every(s => next.has(s.id));
    filteredStores.forEach(s => { if (allSel) next.delete(s.id); else { if (!isStoreDisabled(s.id)) next.add(s.id); } });
    setSelectedStores(next);
  };

  const allFilteredStoresSelected = useMemo(() => filteredStores.length > 0 && filteredStores.every(s => selectedStores.has(s.id)), [filteredStores, selectedStores]);
  const someFilteredStoresSelected = useMemo(() => filteredStores.some(s => selectedStores.has(s.id)), [filteredStores, selectedStores]);

  // Active range calculation for In-Aisle
  const activeRange = useMemo(() => {
    if (!weekRange.start) return null;
    const end = weekRange.end || hoverWeek || weekRange.start;
    return { min: Math.min(weekRange.start, end), max: Math.max(weekRange.start, end) };
  }, [weekRange, hoverWeek]);

  // Check if aisle is disabled (any week in range is booked)
  const isAisleDisabled = (aisleId) => {
    if (!activeRange) return false;
    for (let w = activeRange.min; w <= activeRange.max; w++) {
      if (BOOKING_DATA[`${aisleId}-${w}`]?.booked) return true;
    }
    return false;
  };

  // Check if week is disabled (any selected aisle is booked for that week)
  const isWeekDisabled = (weekId) => {
    if (selectedAisles.size === 0) return false;
    for (const aisleId of selectedAisles) {
      if (BOOKING_DATA[`${aisleId}-${weekId}`]?.booked) return true;
    }
    return false;
  };

  // Check if cell is selected
  const isCellSelected = (aisleId, weekId) => {
    if (!selectedAisles.has(aisleId)) return false;
    if (!activeRange) return false;
    return weekId >= activeRange.min && weekId <= activeRange.max;
  };

  // Get zone status based on aisle bookings
  const getZoneStatus = (zone, weekId) => {
    let bookedCount = 0;
    zone.aisles.forEach(aisle => {
      if (BOOKING_DATA[`${aisle.id}-${weekId}`]?.booked) bookedCount++;
    });
    const pct = (bookedCount / zone.aisles.length) * 100;
    if (pct >= 100) return { label: 'SOLD OUT', color: 'error' };
    if (pct >= 75) return { label: 'NEAR CAPACITY', color: 'warning' };
    if (pct >= 50) return { label: 'HIGH DEMAND', color: 'info' };
    return { label: 'AVAILABLE', color: 'positive' };
  };

  // Filter zones based on search
  const filteredZones = useMemo(() => {
    if (!searchTerm.trim()) return ZONES;
    const q = searchTerm.toLowerCase();
    return ZONES.filter(z => 
      z.name.toLowerCase().includes(q) || 
      z.aisles.some(a => a.name.toLowerCase().includes(q))
    );
  }, [searchTerm]);

  // Toggle zone expansion
  const toggleZoneExpand = (zoneId) => {
    setExpandedZones(prev => {
      const next = new Set(prev);
      if (next.has(zoneId)) next.delete(zoneId);
      else next.add(zoneId);
      return next;
    });
  };

  // Toggle aisle selection
  const toggleAisle = (aisleId) => {
    if (isAisleDisabled(aisleId)) return;
    setSelectedAisles(prev => {
      const next = new Set(prev);
      if (next.has(aisleId)) next.delete(aisleId);
      else next.add(aisleId);
      return next;
    });
  };

  // Select all aisles in zone
  const selectAllInZone = (zone) => {
    const aisleIds = zone.aisles.map(a => a.id).filter(id => !isAisleDisabled(id));
    const allSelected = aisleIds.every(id => selectedAisles.has(id));
    
    setSelectedAisles(prev => {
      const next = new Set(prev);
      if (allSelected) {
        aisleIds.forEach(id => next.delete(id));
      } else {
        aisleIds.forEach(id => next.add(id));
      }
      return next;
    });
  };

  // Handle week header click
  const handleWeekHeaderClick = (weekId) => {
    if (isWeekDisabled(weekId)) return;
    
    if (!weekRange.start) {
      setWeekRange({ start: weekId, end: null });
    } else if (!weekRange.end) {
      if (weekId === weekRange.start) {
        setWeekRange({ start: null, end: null });
      } else {
        const min = Math.min(weekRange.start, weekId);
        const max = Math.max(weekRange.start, weekId);
        // Check if any week in range is disabled
        let hasDisabled = false;
        for (let w = min; w <= max; w++) {
          if (isWeekDisabled(w)) {
            hasDisabled = true;
            break;
          }
        }
        if (!hasDisabled) {
          setWeekRange({ start: min, end: max });
        }
      }
    } else {
      setWeekRange({ start: weekId, end: null });
    }
  };

  // Handle cell click
  const handleCellClick = (aisleId, weekId) => {
    const data = BOOKING_DATA[`${aisleId}-${weekId}`];
    if (data?.booked) return;
    if (isAisleDisabled(aisleId)) return;
    if (isWeekDisabled(weekId)) return;
    
    // Toggle aisle selection
    toggleAisle(aisleId);
    
    // Set week if not set
    if (!weekRange.start) {
      setWeekRange({ start: weekId, end: null });
    }
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (viewFilterRef.current && !viewFilterRef.current.contains(e.target) &&
          viewFilterDropdownRef.current && !viewFilterDropdownRef.current.contains(e.target)) {
        setIsViewFilterOpen(false);
      }
      if (filterPanelRef.current && !filterPanelRef.current.contains(e.target)) {
        setIsFilterPanelOpen(false);
      }
      if (weekFilterRef.current && !weekFilterRef.current.contains(e.target)) {
        setIsWeekFilterOpen(false);
      }
      if (storeSearchTypeRef.current && !storeSearchTypeRef.current.contains(e.target)) {
        setIsStoreSearchTypeOpen(false);
      }
      if (storeFilterPanelRef.current && !storeFilterPanelRef.current.contains(e.target)) {
        setIsStoreFilterPanelOpen(false);
      }
      if (storeViewFilterRef.current && !storeViewFilterRef.current.contains(e.target) && (!storeViewFilterDropdownRef.current || !storeViewFilterDropdownRef.current.contains(e.target))) {
        setIsStoreViewFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll detection for In-Aisle grid with pinned zone header
  useEffect(() => {
    const scrollEl = gridScrollRef.current;
    if (!scrollEl) return;
    const headerHeight = 73;
    const handleScroll = () => {
      setIsScrolled(scrollEl.scrollTop > 0);
      const containerRect = scrollEl.getBoundingClientRect();
      const threshold = containerRect.top + headerHeight;
      let pinned = null;
      for (const zone of filteredZones) {
        if (!expandedZones.has(zone.id)) continue;
        const ref = zoneRowRefs.current[zone.id];
        if (!ref) continue;
        const zoneRow = ref.closest('tr');
        if (!zoneRow) continue;
        const zoneRect = zoneRow.getBoundingClientRect();
        if (zoneRect.top > threshold) break;
        let lastRow = zoneRow;
        let sibling = zoneRow.nextElementSibling;
        while (sibling && !sibling.querySelector('[data-zone-header]')) {
          lastRow = sibling;
          sibling = sibling.nextElementSibling;
        }
        const lastRect = lastRow.getBoundingClientRect();
        if (lastRect.bottom > threshold + 40) pinned = zone.id;
      }
      setPinnedZone(pinned);
    };
    scrollEl.addEventListener('scroll', handleScroll, { passive: true });
    return () => scrollEl.removeEventListener('scroll', handleScroll);
  }, [filteredZones, expandedZones]);

  // Scroll detection for Store grid with pinned state header
  useEffect(() => {
    const scrollEl = storeGridScrollRef.current;
    if (!scrollEl) return;
    const headerHeight = 73;
    const handleScroll = () => {
      setIsScrolled(scrollEl.scrollTop > 0);
      const containerRect = scrollEl.getBoundingClientRect();
      const threshold = containerRect.top + headerHeight;
      let pinned = null;
      for (const st of filteredStateKeys) {
        if (!expandedStates.has(st)) continue;
        const ref = stateRowRefs.current[st];
        if (!ref) continue;
        const stateRow = ref.closest('tr');
        if (!stateRow) continue;
        const stateRect = stateRow.getBoundingClientRect();
        if (stateRect.top > threshold) break;
        let lastRow = stateRow;
        let sibling = stateRow.nextElementSibling;
        while (sibling && !sibling.querySelector('[data-state-header]')) {
          lastRow = sibling;
          sibling = sibling.nextElementSibling;
        }
        const lastRect = lastRow.getBoundingClientRect();
        if (lastRect.bottom > threshold + 40) pinned = st;
      }
      setPinnedState(pinned);
    };
    scrollEl.addEventListener('scroll', handleScroll, { passive: true });
    return () => scrollEl.removeEventListener('scroll', handleScroll);
  }, [filteredStateKeys, expandedStates]);

  // Selection count for In-Aisle
  const selectionCount = selectedAisles.size * (activeRange ? (activeRange.max - activeRange.min + 1) : 0);
  const canReserve = selectedAisles.size > 0 && weekRange.start;

  // Store-based calendar selection count
  const storeActiveRange = useMemo(() => {
    if (!storeWeekRange.start) return null;
    const end = storeWeekRange.end || storeHoverWeek || storeWeekRange.start;
    return { min: Math.min(storeWeekRange.start, end), max: Math.max(storeWeekRange.start, end) };
  }, [storeWeekRange, storeHoverWeek]);
  
  const storeSelectionCount = useMemo(() => {
    if (!selectedStores.size) return 0;
    const wCount = storeActiveRange ? (storeActiveRange.max - storeActiveRange.min + 1) : (storeWeekRange.start ? 1 : 0);
    return selectedStores.size * wCount;
  }, [selectedStores.size, storeActiveRange, storeWeekRange.start]);
  
  const canReserveStores = useMemo(() => selectedStores.size > 0 && storeWeekRange.end !== null, [selectedStores.size, storeWeekRange.end]);

  // Week filter label
  const weekFilterButtonLabel = useMemo(() => {
    if (weekFilterMode === '52running') return '52 running weeks';
    if (weekFilterMode === 'fy2026') return 'FY 2026';
    if (weekFilterMode === 'fy2027') return 'FY 2027';
    return 'Custom week range';
  }, [weekFilterMode]);

  const TABS = [
    { id: 'departments', label: 'Departments', header: 'Departments Inventory Calendar', subheader: 'Select stores and weeks to reserve slots for your ads' },
    { id: 'self-checkout', label: 'Self Check-out', header: 'Self Check-Out Inventory Calendar', subheader: 'Select stores and weeks to reserve slots for your ads' },
    { id: 'store-mode', label: 'Store Mode', header: 'Store Mode Inventory Calendar', subheader: 'Select stores and weeks to reserve slots for your ads' },
    { id: 'in-aisle', label: 'In-aisle', header: 'In-Aisle Screens Inventory Calendar', subheader: 'Select zones and weeks to reserve slots for your ads' },
  ];

  const currentTab = TABS.find(t => t.id === activeTab) || TABS[3];

  return (
    <div className="flex-1 flex flex-col overflow-y-auto" style={{ background: '#F5F5F5' }}>
      {/* Title bar */}
      <div className="px-6 pt-6 pb-4 shrink-0 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-bold text-[#2E2F32] leading-10">{currentTab.header}</h1>
          <p className="text-[16px] text-[#74767C] mt-1">{currentTab.subheader}</p>
        </div>
        <button
          onClick={() => activeTab === 'in-aisle' ? setIsReserving(true) : setIsStoreReserving(true)}
          disabled={activeTab === 'in-aisle' ? !canReserve : !canReserveStores}
          className={`shrink-0 mt-2 flex items-center gap-1.5 px-5 h-10 rounded-full font-bold text-[16px] transition-all ${(activeTab === 'in-aisle' ? canReserve : canReserveStores) ? 'bg-[#0053E2] text-white hover:bg-[#114AB6]' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
        >
          Reserve{(activeTab === 'in-aisle' ? selectionCount : storeSelectionCount) > 0 ? ` ${(activeTab === 'in-aisle' ? selectionCount : storeSelectionCount).toLocaleString()}` : ''} slots
        </button>
      </div>

      {/* Tabs */}
      <div className="px-8 bg-white" style={{ borderBottom: '1px solid #E3E4E5' }}>
        <div role="tablist" className="flex gap-6">
          {TABS.map((t) => {
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(t.id)}
                className="text-sm py-3"
                style={{
                  background: 'transparent', border: 'none',
                  borderBottom: active ? `2px solid ${BLUE}` : '2px solid transparent',
                  color: active ? BLUE : '#2E2F32',
                  fontWeight: active ? 700 : 500,
                  cursor: 'pointer', marginBottom: -1,
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'in-aisle' ? (
        <>
      {/* In-Aisle Filter Bar - Full Width */}
      <div className="px-8 py-4 flex flex-wrap gap-3 items-center justify-between bg-white border-b border-[#E3E4E5]">
        <div className="flex-1 flex items-center bg-white border border-[#BABBBE] rounded-full h-8 relative min-w-0">
          <div className="flex items-center gap-2 px-3 h-full border-r border-[#BABBBE]">
            <Search size={16} className="text-slate-500" />
          </div>
          <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search zones or aisles..." className="flex-1 bg-transparent px-4 py-2.5 text-sm outline-none font-medium text-slate-800 h-full" />
          {searchTerm && <button onClick={() => setSearchTerm('')} className="p-2 text-slate-400 hover:text-slate-600 mr-1"><X size={14} strokeWidth={3} /></button>}
        </div>

        <button onClick={() => { if (expandedZones.size === ZONES.length) setExpandedZones(new Set()); else setExpandedZones(new Set(ZONES.map(z => z.id))); }} className="shrink-0 flex items-center gap-1.5 px-3 h-8 border border-[#2e2f32] rounded-full text-[14px] font-normal text-[#2E2F32] hover:bg-[#f1f1f2] transition-all">
          {expandedZones.size === ZONES.length ? <><ChevronUp size={14} /> Collapse All</> : <><ChevronDown size={14} /> Expand All</>}
        </button>

        <div className="relative shrink-0" ref={filterPanelRef}>
          <button onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)} className="flex items-center gap-2 px-3 h-8 border rounded-full text-[14px] font-normal transition-all border-[#2e2f32] text-[#2E2F32] hover:bg-[#f1f1f2]">
            <FilterIcon size={16} /> Filters
          </button>
          {isFilterPanelOpen && (
            <div className="absolute top-full left-0 mt-2 w-[320px] bg-white border border-[#E3E4E5] rounded-lg shadow-[0px_4px_16px_rgba(0,0,0,0.12)] z-[600] p-5 space-y-4">
              <div className="flex items-center justify-between"><span className="text-sm font-black text-slate-700 uppercase tracking-tight">Filter Zones</span></div>
              <div className="space-y-1.5"><label className="text-[11px] font-black text-slate-400 uppercase tracking-tight">Zone</label><select className="w-full h-10 px-3 border border-slate-300 rounded-lg text-sm font-bold outline-none focus:border-[#0053E2] bg-white"><option value="">All zones</option>{ZONES.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}</select></div>
              <div className="pt-2 border-t border-slate-100 text-xs font-bold text-slate-500">{ZONES.length} zones, {ZONES.reduce((sum, z) => sum + z.aisles.length, 0)} aisles total</div>
            </div>
          )}
        </div>

        <div className="relative shrink-0" ref={weekFilterRef}>
          <button onClick={() => setIsWeekFilterOpen(!isWeekFilterOpen)} className={`flex items-center gap-2 px-3 h-8 border rounded-full text-[14px] font-normal transition-all ${isWeekFilterOpen ? 'border-2 border-[#0053E2] text-[#2E2F32] bg-[#E9F1FE]' : 'border-[#2e2f32] text-[#2E2F32] hover:bg-[#f1f1f2]'}`}>
            {weekFilterButtonLabel} <ChevronDown size={14} className={isWeekFilterOpen ? 'rotate-180' : ''} />
          </button>
          {isWeekFilterOpen && (
            <div className="absolute top-full right-0 mt-2 w-[480px] bg-white border border-[#E3E4E5] rounded-lg shadow-[0px_4px_16px_rgba(0,0,0,0.12)] z-[600] p-6">
              <div className="space-y-5">
                {[{ id: '52running', label: '52 running weeks' }, { id: 'fy2026', label: 'FY 2026' }, { id: 'fy2027', label: 'FY 2027' }, { id: 'custom', label: 'Custom week range' }].map(opt => (
                  <label key={opt.id} className="flex items-center gap-4 cursor-pointer"><div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${weekFilterMode === opt.id ? 'border-[#0053E2]' : 'border-slate-300'}`}>{weekFilterMode === opt.id && <div className="w-2.5 h-2.5 rounded-full bg-[#0053E2]" />}</div><input type="radio" className="sr-only" checked={weekFilterMode === opt.id} onChange={() => setWeekFilterMode(opt.id)} /><span className="text-sm font-black text-slate-800">{opt.label}</span></label>
                ))}
                <div className={`grid grid-cols-2 gap-6 pt-2 transition-opacity ${weekFilterMode === 'custom' ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                  <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase">Start week</label><input type="date" value={customDates.start} onChange={(e) => setCustomDates({ ...customDates, start: e.target.value })} className="w-full h-11 px-3 border border-slate-300 rounded-lg text-sm font-bold outline-none focus:border-[#0053E2]" /></div>
                  <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase">End week</label><input type="date" value={customDates.end} onChange={(e) => setCustomDates({ ...customDates, end: e.target.value })} className="w-full h-11 px-3 border border-slate-300 rounded-lg text-sm font-bold outline-none focus:border-[#0053E2]" /></div>
                </div>
                <div className="flex justify-end gap-4 pt-4 border-t border-slate-200"><button onClick={() => setIsWeekFilterOpen(false)} className="text-sm font-bold text-slate-500">Cancel</button><button onClick={() => setIsWeekFilterOpen(false)} className="px-8 py-2.5 bg-[#0053E2] text-white rounded-full font-black text-sm hover:bg-[#114AB6] shadow-md">Apply</button></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* In-Aisle Calendar Container */}
      <div className="flex flex-col mx-8 my-6 rounded-xl border border-[#E3E4E5] bg-white overflow-hidden" style={{ height: 'calc(100vh - 120px)' }}>
      {/* Legend + Summary */}
      <div className="px-5 py-3 bg-white border-b border-[#E3E4E5] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
              <Lock size={12} strokeWidth={3} />
            </div>
            Booked
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded bg-slate-50 border border-slate-300 flex items-center justify-center text-slate-400">
              <Square size={12} strokeWidth={3} />
            </div>
            Available
          </div>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          {selectedAisles.size > 0 && (
            <div className="flex items-center bg-[#E5F1FF] text-[#0053E2] px-3 py-1.5 rounded-full text-xs font-black border border-blue-100 shadow-sm">
              {selectedAisles.size} aisle{selectedAisles.size > 1 ? 's' : ''}
              <button onClick={() => setSelectedAisles(new Set())} className="ml-2 hover:text-[#114AB6]">
                <X size={14} strokeWidth={4} />
              </button>
            </div>
          )}
          {weekRange.start && (
            <div className="flex items-center bg-[#E5F1FF] text-[#0053E2] px-3 py-1.5 rounded-full text-xs font-black border border-blue-100 shadow-sm">
              WM Week {activeRange?.min}{activeRange && activeRange.max > activeRange.min ? ` - ${activeRange.max}` : ''}
              <button onClick={() => setWeekRange({ start: null, end: null })} className="ml-2 hover:text-[#114AB6]">
                <X size={14} strokeWidth={4} />
              </button>
            </div>
          )}
          {(selectedAisles.size > 0 || weekRange.start) && (
            <button
              onClick={() => { setSelectedAisles(new Set()); setWeekRange({ start: null, end: null }); }}
              className="text-[11px] font-black uppercase text-rose-600 hover:text-rose-800 underline ml-2"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      <div
        ref={gridScrollRef}
        className="flex-1 overflow-auto bg-white"
        onMouseLeave={() => setActiveCursor({ aisleId: null, weekId: null })}
      >
        <table className="border-separate border-spacing-0 w-full relative table-fixed">
          <thead>
            <tr className="sticky top-0 z-[200]">
              <th className={`sticky left-0 z-[210] bg-[#F1F5F9] border-b border-r border-slate-200 p-0 text-left w-[360px] shadow-[4px_0_6px_-2px_rgba(0,0,0,0.1)] ${isScrolled ? 'shadow-[4px_4px_6px_-2px_rgba(0,0,0,0.1)]' : ''}`}>
                <div className="flex items-center gap-3 p-4">
                  <span className="font-black text-slate-500 uppercase tracking-widest" style={{fontSize:'12px', lineHeight:'16px', letterSpacing:'0.05em'}}>
                    Zones / Aisles
                  </span>
                  
                  <div className="relative ml-auto shrink-0" ref={viewFilterRef}>
                    <button
                      onClick={() => setIsViewFilterOpen(!isViewFilterOpen)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all ${viewFilter !== 'all' ? 'bg-blue-50 text-[#0053E2] border border-blue-100 shadow-sm' : 'hover:bg-slate-200 text-slate-400'}`}
                    >
                      {viewFilter !== 'all' && (
                        <span className="text-[10px] font-black uppercase mr-1">
                          {viewFilter === 'available' ? 'Available' : viewFilter}
                        </span>
                      )}
                      <Eye size={16} strokeWidth={3} />
                    </button>
                    
                    {isViewFilterOpen && createPortal(
                      <div
                        ref={viewFilterDropdownRef}
                        className="fixed w-56 bg-white border border-slate-200 rounded-lg shadow-2xl z-[9999]"
                        style={{
                          top: viewFilterRef.current?.getBoundingClientRect().bottom + 4,
                          left: viewFilterRef.current?.getBoundingClientRect().left,
                        }}
                      >
                        <div className="px-4 py-3 border-b bg-slate-50 font-black text-sm uppercase text-slate-600 tracking-tight flex items-center gap-2">
                          <Eye size={16} /> View by
                        </div>
                        {[
                          { v: 'all', l: 'View all / Reset' },
                          { v: 'selected', l: 'Selected only' },
                          { v: 'available', l: 'Available only' },
                        ].map(o => (
                          <button
                            key={o.v}
                            onClick={() => { setViewFilter(o.v); setIsViewFilterOpen(false); }}
                            disabled={o.v === 'selected' && selectedAisles.size === 0}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-[11px] font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed ${viewFilter === o.v ? 'bg-blue-50 text-[#0053E2]' : 'text-slate-700 hover:bg-slate-50'}`}
                          >
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${viewFilter === o.v ? 'border-[#0053E2]' : 'border-slate-300'}`}>
                              {viewFilter === o.v && <div className="w-2 h-2 rounded-full bg-[#0053E2]" />}
                            </div>
                            {o.l}
                          </button>
                        ))}
                      </div>,
                      document.body
                    )}
                  </div>
                </div>
              </th>
              
              {displayWeeks.map(week => {
                const inRange = activeRange && week.id >= activeRange.min && week.id <= activeRange.max;
                const isColHovered = activeCursor.weekId === week.id;
                const blocked = isWeekDisabled(week.id);
                let bg = 'bg-[#F1F5F9]';
                if (blocked) bg = isColHovered ? 'bg-rose-100' : 'bg-rose-50';
                else if (inRange) bg = 'bg-[#0053E2] shadow-md';
                else if (isColHovered) bg = 'bg-[#E5EAF5]';
                
                return (
                  <th
                    key={week.id}
                    onClick={() => handleWeekHeaderClick(week.id)}
                    onMouseEnter={() => setActiveCursor({ aisleId: null, weekId: week.id })}
                    className={`sticky top-0 p-0 border-b border-slate-200 w-[150px] transition-all z-[200] group ${bg} ${blocked ? 'cursor-not-allowed' : 'cursor-pointer'} ${isScrolled ? 'shadow-[0_4px_6px_-2px_rgba(0,0,0,0.1)]' : ''}`}
                  >
                    <div className={`py-5 flex flex-col items-center relative ${blocked ? 'pointer-events-none' : ''}`}>
                      {blocked && <Lock size={16} className="absolute top-1 text-rose-600" />}
                      {isColHovered && !weekRange.end && !blocked && (
                        <div className="absolute top-1"><Plus size={20} strokeWidth={3} className="text-[#0053E2]" /></div>
                      )}
                      <span className={`text-sm font-black mt-1 ${blocked ? 'text-rose-600' : inRange ? 'text-white' : 'text-slate-900'}`}>
                        {week.label}
                      </span>
                      <span className={`text-[10px] font-bold ${blocked ? 'text-rose-600 opacity-80' : inRange ? 'text-blue-100' : 'text-slate-500'}`}>
                        {week.dates}
                      </span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          
          <tbody className="relative z-0">
            {filteredZones.map(zone => {
              const isExpanded = expandedZones.has(zone.id);
              const zoneAisleIds = zone.aisles.map(a => a.id);
              const zoneSelCount = zoneAisleIds.filter(id => selectedAisles.has(id)).length;
              const allZoneSel = zoneSelCount === zone.aisles.length;
              const IconComponent = ZONE_ICONS[zone.icon] || Monitor;

              return (
                <React.Fragment key={zone.id}>
                  {/* Zone header row */}
                  <tr>
                    <td ref={el => { zoneRowRefs.current[zone.id] = el; }} data-zone-header={zone.id} className="sticky left-0 z-[95] border-b border-r border-slate-200 p-0 bg-[#F8FAFC] shadow-[4px_0_6px_-2px_rgba(0,0,0,0.1)]">
                      <div className="flex items-center gap-3 px-4 py-2.5">
                        <button
                          onClick={() => selectAllInZone(zone)}
                          className="shrink-0 text-slate-400 hover:text-[#0053E2]"
                        >
                          {allZoneSel ? <CheckSquare size={16} className="text-[#0053E2]" /> : zoneSelCount > 0 ? <MinusSquare size={16} className="text-[#0053E2]" /> : <Square size={16} />}
                        </button>
                        <button
                          onClick={() => toggleZoneExpand(zone.id)}
                          className="flex items-center gap-2 flex-1 min-w-0"
                        >
                          <ChevronRight size={16} className={`text-slate-400 transition-transform shrink-0 ${isExpanded ? 'rotate-90' : ''}`} />
                          <IconComponent size={14} style={{ color: BLUE }} className="shrink-0" />
                          <span className="text-[13px] font-black text-slate-700 whitespace-nowrap">{zone.name}</span>
                          <span className="text-[11px] font-bold text-slate-400 whitespace-nowrap">{zone.aisles.length} aisles</span>
                          {zoneSelCount > 0 && (
                            <span className="text-[10px] font-black text-[#0053E2] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 whitespace-nowrap">
                              {zoneSelCount} selected
                            </span>
                          )}
                        </button>
                      </div>
                    </td>
                    
                    {/* Zone status cells */}
                    {displayWeeks.map(week => {
                      const status = getZoneStatus(zone, week.id);
                      const statusColors = {
                        positive: { bg: '#e3f4ea', text: '#1a8245', cellBg: '#f0fdf4' },
                        info: { bg: '#e9f1fe', text: BLUE, cellBg: '#eff6ff' },
                        warning: { bg: '#fff4e0', text: '#c97f00', cellBg: '#fffbeb' },
                        error: { bg: '#ffeaea', text: '#c41e3a', cellBg: '#fef2f2' },
                      };
                      const c = statusColors[status.color];

                      return (
                        <td key={`${zone.id}-${week.id}`} className="border-b border-slate-200 text-center" style={{ background: c.cellBg }}>
                          <span
                            className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded"
                            style={{ background: c.bg, color: c.text }}
                          >
                            {status.label}
                          </span>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Aisle rows */}
                  {isExpanded && zone.aisles.map(aisle => {
                    const isSelected = selectedAisles.has(aisle.id);
                    const isRowHovered = activeCursor.aisleId === aisle.id;
                    const blockedAisle = isAisleDisabled(aisle.id);
                    const rowBg = blockedAisle
                      ? (isRowHovered ? 'bg-rose-100' : 'bg-rose-50')
                      : isSelected
                        ? 'bg-blue-50'
                        : (isRowHovered ? 'bg-[#E5EAF5]' : 'bg-white');

                    return (
                      <tr key={aisle.id} className="group/row">
                        <td
                          onClick={() => toggleAisle(aisle.id)}
                          onMouseEnter={() => setActiveCursor({ aisleId: aisle.id, weekId: null })}
                          className={`sticky left-0 z-[90] border-b border-r border-slate-200 p-3 pl-12 transition-all shadow-[4px_0_6px_-2px_rgba(0,0,0,0.1)] ${rowBg} ${blockedAisle ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`transition-colors ${isSelected ? 'text-[#0053E2]' : blockedAisle ? 'text-rose-600' : 'text-slate-400 group-hover/row:text-[#0053E2]'}`}>
                              {blockedAisle ? <Lock size={16} /> : isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                            </div>
                            <span className={`text-sm font-medium ${isSelected ? 'text-[#0053E2]' : blockedAisle ? 'text-rose-950' : 'text-slate-700'}`}>
                              {aisle.name}
                            </span>
                          </div>
                        </td>
                        
                        {displayWeeks.map(week => {
                          const cellData = BOOKING_DATA[`${aisle.id}-${week.id}`];
                          const isSelectedCell = isCellSelected(aisle.id, week.id);
                          const isColHovered = activeCursor.weekId === week.id;
                          const isRowHoveredLocal = activeCursor.aisleId === aisle.id;
                          const blockedWeek = isWeekDisabled(week.id);
                          const isBooked = cellData?.booked;
                          const isCrosshairPath = isRowHoveredLocal || isColHovered;

                          let bg = 'bg-white';
                          let ring = '';
                          let z = 'z-0';
                          
                          if (isBooked) {
                            bg = isCrosshairPath ? 'bg-rose-50' : 'bg-rose-50/60';
                            if (isCrosshairPath) {
                              ring = 'ring-2 ring-inset ring-rose-300 shadow-md';
                              z = 'z-20';
                            }
                          } else if (blockedAisle || blockedWeek) {
                            const isFocused = activeCursor.aisleId === aisle.id && activeCursor.weekId === week.id;
                            bg = isFocused ? 'bg-rose-100' : 'bg-rose-50/40';
                            if (isFocused) ring = 'ring-2 ring-inset ring-rose-400';
                            z = 'z-20';
                          } else if (isCrosshairPath) {
                            bg = 'bg-[#F0F4FA]';
                          }

                          if (isSelectedCell) {
                            bg = isBooked ? 'bg-rose-100' : 'bg-blue-50';
                            ring = 'ring-2 ring-inset ring-[#0053E2]';
                            z = 'z-10';
                          }

                          const isDisabledCell = isBooked || blockedAisle || blockedWeek;
                          
                          return (
                            <td
                              key={`${aisle.id}-${week.id}`}
                              onClick={() => !isDisabledCell && handleCellClick(aisle.id, week.id)}
                              onMouseEnter={() => setActiveCursor({ aisleId: aisle.id, weekId: week.id })}
                              className={`border-b border-r border-slate-200 h-16 group/slot transition-all relative overflow-visible ${bg} ${ring} ${z} ${isDisabledCell ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                            >
                              <div className="flex flex-col items-center justify-center h-full py-2 px-2 text-center pointer-events-none">
                                {isBooked && !isSelectedCell && (
                                  <>
                                    <Lock size={12} className="text-rose-600" />
                                    <span className="text-[9px] font-black uppercase text-rose-900 line-clamp-1 mt-0.5">
                                      {cellData.advertiser}
                                    </span>
                                  </>
                                )}
                                {isSelectedCell && !isBooked && (
                                  <div className="w-6 h-6 bg-[#0053E2] rounded-lg flex items-center justify-center shadow-lg border-2 border-white">
                                    <Check size={12} className="text-white" strokeWidth={4} />
                                  </div>
                                )}
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

      {/* Pinned Zone Header for In-Aisle Calendar */}
      {pinnedZone && expandedZones.has(pinnedZone) && (() => {
        const zone = filteredZones.find(z => z.id === pinnedZone);
        if (!zone) return null;
        const zoneAisleIds = zone.aisles.map(a => a.id);
        const zoneSelCount = zoneAisleIds.filter(id => selectedAisles.has(id)).length;
        const allZoneSel = zoneSelCount === zone.aisles.length;
        const scrollEl = gridScrollRef.current;
        const rect = scrollEl?.getBoundingClientRect();
        if (!rect) return null;
        const IconComponent = ZONE_ICONS[zone.icon] || Monitor;
        return (
          <div className="fixed z-[195] bg-white/98 backdrop-blur-md border-b border-r border-slate-200 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.12),4px_0_6px_-2px_rgba(0,0,0,0.08)]" style={{ top: rect.top + 73, left: rect.left, width: 360 }}>
            <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#0053E2] rounded-r" />
            <div className="flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-blue-50/60 to-transparent">
              <button onClick={() => selectAllInZone(zone)} className="shrink-0 text-slate-400 hover:text-[#0053E2]">{allZoneSel ? <CheckSquare size={16} className="text-[#0053E2]" /> : zoneSelCount > 0 ? <MinusSquare size={16} className="text-[#0053E2]" /> : <Square size={16} />}</button>
              <button onClick={() => toggleZoneExpand(zone.id)} className="flex items-center gap-2 flex-1 min-w-0">
                <ChevronRight size={16} className="text-slate-400 transition-transform shrink-0 rotate-90" />
                <IconComponent size={14} style={{ color: BLUE }} className="shrink-0" />
                <span className="text-[13px] font-black text-slate-700">{zone.name}</span>
                <span className="text-[11px] font-bold text-slate-400">{zone.aisles.length} aisles</span>
                {zoneSelCount > 0 && <span className="text-[10px] font-black text-[#0053E2] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">{zoneSelCount} selected</span>}
              </button>
            </div>
          </div>
        );
      })()}

      {/* Reserve Drawer */}
      {isReserving && (
        <>
          <div className="fixed inset-0 bg-black/50 z-[2000]" onClick={() => setIsReserving(false)} />
          <div className="fixed inset-y-0 right-0 w-[420px] bg-white shadow-2xl border-l border-slate-200 z-[2500]">
            <div className="flex flex-col h-full">
              <header className="px-6 py-5 flex items-center justify-between border-b border-[#E3E4E5] bg-white">
                <div>
                  <h2 className="text-lg font-bold text-[#2E2F32]">Reserve In-Aisle Screens</h2>
                  <p className="text-sm text-[#74767C] mt-0.5">
                    {selectedAisles.size} aisle{selectedAisles.size > 1 ? 's' : ''} • 
                    WM Week {activeRange?.min}{activeRange && activeRange.max > activeRange.min ? ` - ${activeRange.max}` : ''}
                  </p>
                </div>
                <button onClick={() => setIsReserving(false)} className="p-2 text-slate-400 hover:text-slate-900">
                  <X size={20} />
                </button>
              </header>
              
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-[#2E2F32]">Advertiser</label>
                  <div className="relative">
                    <select className="w-full h-10 px-4 bg-white border border-[#BABBBE] rounded font-medium text-[#2E2F32] outline-none focus:border-[#0053E2] appearance-none text-sm">
                      <option value="">Select advertiser</option>
                      {ADVERTISERS.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                  </div>
                </div>
                
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="text-xs font-bold text-slate-500 uppercase mb-2">Selected Aisles</div>
                  <div className="flex flex-wrap gap-2">
                    {[...selectedAisles].map(aisleId => {
                      const aisle = ZONES.flatMap(z => z.aisles).find(a => a.id === aisleId);
                      return (
                        <span key={aisleId} className="px-2 py-1 bg-white border border-slate-200 rounded text-xs font-medium">
                          {aisle?.name}
                        </span>
                      );
                    })}
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-[#2E2F32]">Campaign name (optional)</label>
                  <input
                    type="text"
                    placeholder="Enter campaign name"
                    className="w-full h-10 px-4 border border-[#BABBBE] rounded font-medium text-[#2E2F32] outline-none focus:border-[#0053E2] text-sm placeholder-[#74767C]"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-[#2E2F32]">Notes (optional)</label>
                  <textarea
                    rows={3}
                    placeholder="Add notes..."
                    className="w-full px-4 py-3 border border-[#BABBBE] rounded font-medium outline-none focus:border-[#0053E2] resize-none text-sm placeholder-[#74767C]"
                  />
                </div>
              </div>
              
              <footer className="px-6 py-4 border-t border-[#E3E4E5] flex justify-end gap-4 bg-white shrink-0">
                <button
                  onClick={() => setIsReserving(false)}
                  className="text-sm font-bold text-[#74767C] hover:text-[#2E2F32]"
                >
                  Cancel
                </button>
                <button
                  className="px-6 h-10 bg-[#0053E2] text-white font-bold rounded-full hover:bg-[#114AB6] text-sm transition-colors"
                >
                  Reserve
                </button>
              </footer>
            </div>
          </div>
        </>
      )}
      </div>
        </>
      ) : (
        <>
        {/* Store-based Filter Bar - Full Width */}
        <div className="px-8 py-4 flex flex-wrap gap-3 items-center justify-between bg-white border-b border-[#E3E4E5]">
          <div className="flex-1 flex items-center bg-white border border-[#BABBBE] rounded-full h-8 relative min-w-0">
            <div className="relative h-full flex items-center" ref={storeSearchTypeRef}>
              <button onClick={() => setIsStoreSearchTypeOpen(!isStoreSearchTypeOpen)} className="flex items-center gap-2 px-3 py-1.5 text-sm text-[#2E2F32] border-r border-[#BABBBE] h-full rounded-l-full hover:bg-[#f1f1f2] transition-colors">
                <Search size={16} /><span className="whitespace-nowrap font-normal text-slate-500">Search by <span className="font-bold text-slate-700">{storeSearchType}</span></span><ChevronDown size={14} className={isStoreSearchTypeOpen ? 'rotate-180' : ''} />
              </button>
              {isStoreSearchTypeOpen && <div className="absolute top-[110%] left-0 w-48 bg-white border border-[#E3E4E5] rounded shadow-[0px_4px_16px_rgba(0,0,0,0.12)] z-[500] overflow-hidden">{['Store #','Store name','City'].map(t => <button key={t} onClick={() => { setStoreSearchType(t); setIsStoreSearchTypeOpen(false); setStoreSearchTerm(''); }} className={`w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-blue-50 ${storeSearchType === t ? 'text-[#0053E2] bg-blue-50 font-bold' : ''}`}>{t}</button>)}</div>}
            </div>
            <input type="text" placeholder={storeSearchType === 'Store #' ? 'e.g. 1001, 2045...' : storeSearchType === 'Store name' ? 'e.g. Store #1001...' : 'e.g. Houston, Dallas...'} className="flex-1 bg-transparent px-4 py-2.5 text-sm outline-none font-medium text-slate-800 h-full" value={storeSearchTerm} onChange={(e) => setStoreSearchTerm(e.target.value)} />
            {storeSearchTerm && <button onClick={() => setStoreSearchTerm('')} className="p-2 text-slate-400 hover:text-slate-600 mr-1"><X size={14} strokeWidth={3} /></button>}
          </div>

          <div className="relative shrink-0" ref={storeFilterPanelRef}>
            <button onClick={() => setIsStoreFilterPanelOpen(!isStoreFilterPanelOpen)} className={`flex items-center gap-2 px-3 h-8 border rounded-full text-[14px] font-normal transition-all ${(storeFilterState || storeFilterCity) ? 'border-2 border-[#0053E2] text-[#2E2F32] bg-[#E9F1FE]' : 'border-[#2e2f32] text-[#2E2F32] hover:bg-[#f1f1f2]'}`}>
              <FilterIcon size={16} /> Filters {(storeFilterState || storeFilterCity) && <span className="bg-[#0053E2] text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">{[storeFilterState, storeFilterCity].filter(Boolean).length}</span>}
            </button>
            {isStoreFilterPanelOpen && (
              <div className="absolute top-full right-0 mt-2 w-[320px] bg-white border border-[#E3E4E5] rounded-lg shadow-[0px_4px_16px_rgba(0,0,0,0.12)] z-[600] p-5 space-y-4">
                <div className="flex items-center justify-between"><span className="text-sm font-black text-slate-700 uppercase tracking-tight">Filter Stores</span>{(storeFilterState || storeFilterCity) && <button onClick={() => { setStoreFilterState(''); setStoreFilterCity(''); }} className="text-[11px] font-bold text-rose-600 underline">Clear</button>}</div>
                <div className="space-y-1.5"><label className="text-[11px] font-black text-slate-400 uppercase tracking-tight">State</label><select value={storeFilterState} onChange={e => { setStoreFilterState(e.target.value); setStoreFilterCity(''); }} className="w-full h-10 px-3 border border-slate-300 rounded-lg text-sm font-bold outline-none focus:border-[#0053E2] bg-white"><option value="">All states</option>{Object.keys(STATE_DATA_FULL).sort().map(st => <option key={st} value={st}>{STATE_DATA_FULL[st]?.name} ({(STORES_BY_STATE[st] || []).length})</option>)}</select></div>
                <div className="space-y-1.5"><label className="text-[11px] font-black text-slate-400 uppercase tracking-tight">City</label><select value={storeFilterCity} onChange={e => setStoreFilterCity(e.target.value)} className="w-full h-10 px-3 border border-slate-300 rounded-lg text-sm font-bold outline-none focus:border-[#0053E2] bg-white"><option value="">All cities</option>{[...new Set((storeFilterState ? STORES_BY_STATE[storeFilterState] || [] : ALL_STORES).map(s => s.city))].sort().map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                <div className="pt-2 border-t border-slate-100 text-xs font-bold text-slate-500">{filteredStores.length.toLocaleString()} stores match</div>
              </div>
            )}
          </div>

          <div className="relative shrink-0" ref={weekFilterRef}>
            <button onClick={() => setIsWeekFilterOpen(!isWeekFilterOpen)} className={`flex items-center gap-2 px-3 h-8 border rounded-full text-[14px] font-normal transition-all ${isWeekFilterOpen ? 'border-2 border-[#0053E2] text-[#2E2F32] bg-[#E9F1FE]' : 'border-[#2e2f32] text-[#2E2F32] hover:bg-[#f1f1f2]'}`}>{weekFilterButtonLabel} <ChevronDown size={14} className={isWeekFilterOpen ? 'rotate-180' : ''} /></button>
            {isWeekFilterOpen && (
              <div className="absolute top-full right-0 mt-2 w-[480px] bg-white border border-[#E3E4E5] rounded-lg shadow-[0px_4px_16px_rgba(0,0,0,0.12)] z-[600] p-6">
                <div className="space-y-5">
                  {[{ id: '52running', label: '52 running weeks' },{ id: 'fy2026', label: 'FY 2026' },{ id: 'fy2027', label: 'FY 2027' },{ id: 'custom', label: 'Custom week range' }].map(opt => (
                    <label key={opt.id} className="flex items-center gap-4 cursor-pointer"><div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${weekFilterMode === opt.id ? 'border-[#0053E2]' : 'border-slate-300'}`}>{weekFilterMode === opt.id && <div className="w-2.5 h-2.5 rounded-full bg-[#0053E2]" />}</div><input type="radio" className="sr-only" checked={weekFilterMode === opt.id} onChange={() => setWeekFilterMode(opt.id)} /><span className="text-sm font-black text-slate-800">{opt.label}</span></label>
                  ))}
                  <div className={`grid grid-cols-2 gap-6 pt-2 transition-opacity ${weekFilterMode === 'custom' ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                    <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase">Start week</label><input type="date" value={customDates.start} onChange={(e) => setCustomDates({ ...customDates, start: e.target.value })} className="w-full h-11 px-3 border border-slate-300 rounded-lg text-sm font-bold outline-none focus:border-[#0053E2]" /></div>
                    <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase">End week</label><input type="date" value={customDates.end} onChange={(e) => setCustomDates({ ...customDates, end: e.target.value })} className="w-full h-11 px-3 border border-slate-300 rounded-lg text-sm font-bold outline-none focus:border-[#0053E2]" /></div>
                  </div>
                  <div className="flex justify-end gap-4 pt-4 border-t border-slate-200"><button onClick={() => setIsWeekFilterOpen(false)} className="text-sm font-bold text-slate-500">Cancel</button><button onClick={() => setIsWeekFilterOpen(false)} className="px-8 py-2.5 bg-[#0053E2] text-white rounded-full font-black text-sm hover:bg-[#114AB6] shadow-md">Apply</button></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Store Calendar Container */}
        <div className="flex flex-col mx-8 my-6 rounded-xl border border-[#E3E4E5] bg-white overflow-hidden" style={{ height: 'calc(100vh - 120px)' }}>
          {/* Legend + Summary */}
          <div className="px-5 py-3 bg-white border-b border-[#E3E4E5] flex items-center justify-between shrink-0 z-20">
            <div className="flex items-center gap-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <div className="flex items-center gap-2.5"><div className="w-5 h-5 rounded bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600"><Lock size={12} strokeWidth={3} /></div>Booked</div>
              <div className="flex items-center gap-2.5"><div className="w-5 h-5 rounded bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600"><Clock size={12} strokeWidth={3} /></div>IO in progress</div>
              <div className="flex items-center gap-2.5"><div className="w-5 h-5 rounded bg-green-50 border border-green-200 flex items-center justify-center text-green-700"><Zap size={12} fill="currentColor" className="fill-green-700/20" /></div>Interest</div>
              <div className="flex items-center gap-2.5"><div className="w-5 h-5 rounded bg-slate-50 border border-slate-300 flex items-center justify-center text-slate-400"><Square size={12} strokeWidth={3} /></div>Blank</div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {selectedStores.size > 0 && <div className="flex items-center bg-[#E5F1FF] text-[#0053E2] px-3 py-1.5 rounded-full text-xs font-black border border-blue-100 shadow-sm">{selectedStores.size.toLocaleString()} stores<button onClick={() => setSelectedStores(new Set())} className="ml-2 hover:text-[#114AB6]"><X size={14} strokeWidth={4} /></button></div>}
              {storeWeekRange.start && (() => {
                const minWeek = displayWeeks.find(w => w.id === storeActiveRange?.min);
                const maxWeek = displayWeeks.find(w => w.id === storeActiveRange?.max);
                return <div className="flex items-center bg-[#E5F1FF] text-[#0053E2] px-3 py-1.5 rounded-full text-xs font-black border border-blue-100 shadow-sm">WM Week {minWeek?.weekNumber}{maxWeek && maxWeek.weekNumber > minWeek?.weekNumber ? ` - ${maxWeek.weekNumber}` : ''}<button onClick={() => setStoreWeekRange({ start: null, end: null })} className="ml-2 hover:text-[#114AB6]"><X size={14} strokeWidth={4} /></button></div>;
              })()}
              {(selectedStores.size > 0 || storeWeekRange.start || storeViewFilter !== 'all') && <button onClick={() => { setSelectedStores(new Set()); setStoreWeekRange({ start: null, end: null }); setStoreViewFilter('all'); setStoreAvailableSubs(new Set()); }} className="text-[11px] font-black uppercase text-rose-600 hover:text-rose-800 underline ml-2">Clear all</button>}
            </div>
          </div>

          {/* Store Grid */}
          <div ref={storeGridScrollRef} className="flex-1 overflow-auto bg-white" onMouseLeave={() => setStoreActiveCursor({ storeId: null, weekId: null })}>
            <table className="border-separate border-spacing-0 w-full relative table-fixed">
              <thead>
                <tr className="sticky top-0 z-[200]">
                  <th className={`sticky left-0 z-[210] bg-[#F1F5F9] border-b border-r border-slate-200 p-0 text-left w-[360px] shadow-[4px_0_6px_-2px_rgba(0,0,0,0.1)] ${isScrolled ? 'shadow-[4px_4px_6px_-2px_rgba(0,0,0,0.1)]' : ''}`}>
                    <div className="flex items-center gap-3 p-4">
                      <button onClick={selectAllFilteredStores} className="text-slate-400 hover:text-[#0053E2] shrink-0">{allFilteredStoresSelected ? <CheckSquare size={18} className="text-[#0053E2]" /> : someFilteredStoresSelected ? <MinusSquare size={18} className="text-[#0053E2]" /> : <Square size={18} />}</button>
                      <StoresLabel text={`${isStoreAnyFilterActive ? 'Filtered' : 'All'} Stores`} count={filteredStores.length.toLocaleString()} />
                      <div className="relative ml-auto shrink-0" ref={storeViewFilterRef}>
                        <button onClick={() => setIsStoreViewFilterOpen(!isStoreViewFilterOpen)} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all ${storeViewFilter !== 'all' ? 'bg-blue-50 text-[#0053E2] border border-blue-100 shadow-sm' : 'hover:bg-slate-200 text-slate-400'}`}>{storeViewFilter !== 'all' && <span className="text-[10px] font-black uppercase mr-1">{storeViewFilter === 'available' && storeAvailableSubs.size > 0 && storeAvailableSubs.size < 3 ? [...storeAvailableSubs].map(s => s === 'io' ? 'IO' : s.charAt(0).toUpperCase() + s.slice(1)).join(', ') : storeViewFilter === 'available' ? 'Available' : storeViewFilter}</span>}<Eye size={16} strokeWidth={3} /></button>
                        {isStoreViewFilterOpen && createPortal(
                          <div ref={storeViewFilterDropdownRef} className="fixed w-64 bg-white border border-slate-200 rounded-lg shadow-2xl z-[9999]" style={(() => { const r = storeViewFilterRef.current?.closest('th')?.getBoundingClientRect(); return r ? { top: r.bottom - 12, left: r.right - 256 - 16 + 150 } : {}; })()}>
                            <div className="px-4 py-3 border-b bg-slate-50 font-black text-sm uppercase text-slate-600 tracking-tight flex items-center gap-2"><Eye size={16} /> View by</div>
                            {[{v:'all',l:'View all / Reset'},{v:'selected',l:'Selected only'}].map(o => (
                              <button key={o.v} onClick={() => { setStoreViewFilter(o.v); setStoreAvailableSubs(new Set()); setIsStoreViewFilterOpen(false); }} disabled={o.v === 'selected' && selectedStores.size === 0} className={`w-full flex items-center gap-3 px-4 py-3 text-[11px] font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed ${storeViewFilter === o.v ? 'bg-blue-50 text-[#0053E2]' : 'text-slate-700 hover:bg-slate-50'}`}>
                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${storeViewFilter === o.v ? 'border-[#0053E2]' : 'border-slate-300'}`}>{storeViewFilter === o.v && <div className="w-2 h-2 rounded-full bg-[#0053E2]" />}</div>{o.l}
                              </button>
                            ))}
                            <div className="border-t border-slate-100">
                              <button onClick={() => {
                                if (storeViewFilter === 'available' && storeAvailableSubs.size === 3) { setStoreViewFilter('all'); setStoreAvailableSubs(new Set()); }
                                else { setStoreViewFilter('available'); setStoreAvailableSubs(new Set(['blank','io','interest'])); }
                              }} className={`w-full flex items-center gap-3 px-4 py-3 text-[11px] font-bold transition-all ${storeViewFilter === 'available' ? 'bg-blue-50 text-[#0053E2]' : 'text-slate-700 hover:bg-slate-50'}`}>
                                <div className="shrink-0">{storeViewFilter === 'available' && storeAvailableSubs.size === 3 ? <CheckSquare size={16} className="text-[#0053E2]" /> : storeViewFilter === 'available' && storeAvailableSubs.size > 0 ? <MinusSquare size={16} className="text-[#0053E2]" /> : <Square size={16} className="text-slate-300" />}</div>Available only
                              </button>
                              {[{k:'blank',label:'Blank',icon:<Square size={12} strokeWidth={3} className="text-slate-400" />},{k:'io',label:'IO in Progress',icon:<Clock size={12} strokeWidth={3} className="text-amber-600" />},{k:'interest',label:'Interest',icon:<Zap size={12} className="text-green-700 fill-green-700/20" />}].map(sub => {
                                const isChecked = storeViewFilter === 'available' && storeAvailableSubs.has(sub.k);
                                return (
                                  <button key={sub.k} onClick={() => {
                                    if (storeViewFilter !== 'available') { setStoreViewFilter('available'); setStoreAvailableSubs(new Set([sub.k])); }
                                    else {
                                      const ns = new Set(storeAvailableSubs);
                                      if (ns.has(sub.k)) ns.delete(sub.k); else ns.add(sub.k);
                                      if (ns.size === 0) { setStoreViewFilter('all'); setStoreAvailableSubs(new Set()); }
                                      else setStoreAvailableSubs(ns);
                                    }
                                  }} className={`w-full flex items-center gap-3 px-4 py-2.5 pl-10 text-[11px] font-bold transition-all ${isChecked ? 'bg-blue-50 text-[#0053E2]' : 'text-slate-600 hover:bg-slate-50'}`}>
                                    <div className="shrink-0">{isChecked ? <CheckSquare size={14} className="text-[#0053E2]" /> : <Square size={14} className="text-slate-300" />}</div>
                                    <span className="flex items-center gap-2">{sub.icon}{sub.label}</span>
                                  </button>
                                );
                              })}
                            </div>
                            <div className="border-t border-slate-100">
                              <button onClick={() => { setStoreViewFilter('unavailable'); setStoreAvailableSubs(new Set()); setIsStoreViewFilterOpen(false); }} disabled={!storeWeekRange.start} className={`w-full flex items-center gap-3 px-4 py-3 text-[11px] font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed ${storeViewFilter === 'unavailable' ? 'bg-blue-50 text-[#0053E2]' : 'text-slate-700 hover:bg-slate-50'}`}>
                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${storeViewFilter === 'unavailable' ? 'border-[#0053E2]' : 'border-slate-300'}`}>{storeViewFilter === 'unavailable' && <div className="w-2 h-2 rounded-full bg-[#0053E2]" />}</div>Unavailable only
                              </button>
                            </div>
                          </div>,
                          document.body
                        )}
                      </div>
                    </div>
                  </th>
                  {displayWeeks.map(week => {
                    const inRange = storeActiveRange && week.id >= storeActiveRange.min && week.id <= storeActiveRange.max;
                    const isColHovered = storeActiveCursor.weekId === week.id;
                    const blocked = isStoreWeekDisabled(week.id);
                    let bg = 'bg-[#F1F5F9]';
                    if (blocked) bg = isColHovered ? 'bg-rose-100' : 'bg-rose-50';
                    else if (inRange) bg = 'bg-[#0053E2] shadow-md';
                    else if (isColHovered) bg = 'bg-[#E5EAF5]';
                    return (
                      <th key={week.id} onClick={() => handleStoreWeekHeaderClick(week.id)} onMouseEnter={() => setStoreActiveCursor({ storeId: null, weekId: week.id })} className={`sticky top-0 p-0 border-b border-slate-200 w-[150px] transition-all z-[200] group ${bg} ${blocked ? 'cursor-not-allowed' : 'cursor-pointer'} ${isScrolled ? 'shadow-[0_4px_6px_-2px_rgba(0,0,0,0.1)]' : ''}`}>
                        <div className={`py-5 flex flex-col items-center relative ${blocked ? 'pointer-events-none' : ''}`}>
                          {blocked && <Lock size={16} className="absolute top-1 text-rose-600" />}
                          {isColHovered && !storeWeekRange.end && !blocked && <div className="absolute top-1"><Plus size={20} strokeWidth={3} className="text-[#0053E2]" /></div>}
                          <span className={`text-sm font-black mt-1 ${blocked ? 'text-rose-600' : inRange ? 'text-white' : 'text-slate-900'}`}>{week.label}</span>
                          <span className={`text-[10px] font-bold ${blocked ? 'text-rose-600 opacity-80' : inRange ? 'text-blue-100' : 'text-slate-500'}`}>{week.dates}</span>
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
                  const stateSelCount = stores.filter(s => selectedStores.has(s.id)).length;
                  const allStateSel = stateSelCount === stores.length;
                  return (
                    <React.Fragment key={st}>
                      <tr>
                        <td ref={el => { stateRowRefs.current[st] = el; }} data-state-header={st} className="sticky left-0 z-[95] border-b border-r border-slate-200 p-0 bg-[#F8FAFC] shadow-[4px_0_6px_-2px_rgba(0,0,0,0.1)]">
                          <div className="flex items-center gap-3 px-4 py-2.5">
                            <button onClick={() => selectAllInState(st)} className="shrink-0 text-slate-400 hover:text-[#0053E2]">{allStateSel ? <CheckSquare size={16} className="text-[#0053E2]" /> : stateSelCount > 0 ? <MinusSquare size={16} className="text-[#0053E2]" /> : <Square size={16} />}</button>
                            <button onClick={() => toggleStateExpand(st)} className="flex items-center gap-2 flex-1 min-w-0">
                              <ChevronRight size={16} className={`text-slate-400 transition-transform shrink-0 ${isExpanded ? 'rotate-90' : ''}`} />
                              <MapPin size={14} className="text-slate-400 shrink-0" />
                              <span className="text-[13px] font-black text-slate-700">{STATE_DATA_FULL[st]?.name}</span>
                              <span className="text-[11px] font-bold text-slate-400">{stores.length} stores</span>
                              {stateSelCount > 0 && <span className="text-[10px] font-black text-[#0053E2] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">{stateSelCount} selected</span>}
                            </button>
                          </div>
                        </td>
                        {displayWeeks.map(week => <td key={`${st}-${week.id}`} className="border-b border-slate-200 bg-[#F8FAFC]" />)}
                      </tr>
                      {isExpanded && stores.map(store => {
                        const isSelected = selectedStores.has(store.id);
                        const isRowHovered = storeActiveCursor.storeId === store.id;
                        const blockedStore = isStoreDisabled(store.id);
                        const rowBg = blockedStore ? (isRowHovered ? 'bg-rose-100' : 'bg-rose-50') : isSelected ? 'bg-blue-50' : (isRowHovered ? 'bg-[#E5EAF5]' : 'bg-white');
                        return (
                          <tr key={store.id} className="group/row">
                            <td onClick={() => toggleStore(store.id)} onMouseEnter={() => setStoreActiveCursor({ storeId: store.id, weekId: null })} className={`sticky left-0 z-[90] border-b border-r border-slate-200 p-4 transition-all shadow-[4px_0_6px_-2px_rgba(0,0,0,0.1)] ${rowBg} ${blockedStore ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                              <div className="flex items-center gap-3">
                                <div className={`transition-colors ${isSelected ? 'text-[#0053E2]' : blockedStore ? 'text-rose-600' : 'text-slate-400 group-hover/row:text-[#0053E2]'}`}>
                                  {blockedStore ? <Lock size={18} /> : isSelected ? <CheckSquare size={18} /> : <Square size={18} />}
                                </div>
                                <div className="flex flex-col">
                                  <span className={`text-sm font-bold ${isSelected ? 'text-[#0053E2]' : blockedStore ? 'text-rose-950' : 'text-slate-900'}`}>Store #{store.id} — {store.city}</span>
                                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">{store.format} • {store.state} {store.zip}</span>
                                </div>
                              </div>
                            </td>
                            {displayWeeks.map(week => {
                              const slotKey = `${store.id}-${week.id}`;
                              const cellData = SLOT_DATA[slotKey];
                              const isSelectedCell = isStoreCellSelected(store.id, week.id);
                              const isColHovered = storeActiveCursor.weekId === week.id;
                              const isRowHoveredLocal = storeActiveCursor.storeId === store.id;
                              const blockedWeek = isStoreWeekDisabled(week.id);
                              const isBooked = !!cellData?.booked;
                              const hasActivity = isBooked || (cellData?.ios?.length > 0) || (cellData?.interests?.length > 0);
                              const isCrosshairPath = isRowHoveredLocal || isColHovered;

                              let bg = 'bg-white'; let ring = ''; let z = 'z-0';
                              if (isBooked) { bg = isCrosshairPath ? 'bg-rose-50' : 'bg-rose-50/60'; if (isCrosshairPath) { ring = 'ring-2 ring-inset ring-rose-300 shadow-md'; z = 'z-20'; } }
                              else if (cellData?.ios?.length > 0) { bg = isCrosshairPath ? 'bg-amber-100' : 'bg-amber-50'; }
                              else if (cellData?.interests?.length > 0) { bg = isCrosshairPath ? 'bg-green-100' : 'bg-green-50'; }
                              else if (blockedStore || blockedWeek) {
                                const isFocused = storeActiveCursor.storeId === store.id && storeActiveCursor.weekId === week.id;
                                bg = isFocused ? 'bg-rose-100' : 'bg-rose-50/40'; if (isFocused) ring = 'ring-2 ring-inset ring-rose-400'; z = 'z-20';
                              }
                              else if (isCrosshairPath) { bg = 'bg-[#F0F4FA]'; }

                              if (isSelectedCell) {
                                bg = isBooked ? 'bg-rose-100' : (cellData?.ios?.length > 0) ? 'bg-amber-100' : (cellData?.interests?.length > 0) ? 'bg-green-100' : 'bg-blue-50';
                                ring = 'ring-2 ring-inset ring-[#0053E2]'; z = 'z-10';
                              }

                              const isDisabledCell = isBooked || blockedStore || blockedWeek;
                              return (
                                <td key={slotKey} onClick={() => !isDisabledCell && handleStoreCellClick(store.id, week.id)} onMouseEnter={() => setStoreActiveCursor({ storeId: store.id, weekId: week.id })} className={`border-b border-r border-slate-200 h-28 group/slot transition-all relative overflow-visible ${bg} ${ring} ${z} ${isDisabledCell ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                                  <div className="flex flex-col items-center justify-between h-full py-4 px-2 text-center pointer-events-none">
                                    {!isSelectedCell && (
                                      <div className="flex flex-col items-center gap-1 w-full pointer-events-none">
                                        {isBooked && <Lock size={14} className="text-rose-600" />}
                                        {!isBooked && cellData?.ios?.length > 0 && <Clock size={14} className="text-amber-700" />}
                                        {!isBooked && cellData?.ios?.length === 0 && cellData?.interests?.length > 0 && <Zap size={14} className="text-green-700 fill-green-700/20" />}
                                        <span className={`text-[10px] font-black uppercase leading-tight line-clamp-2 ${isBooked ? 'text-rose-900' : (cellData?.ios?.length > 0 ? 'text-amber-900' : (cellData?.interests?.length > 0 ? 'text-green-800' : 'text-slate-800'))}`}>
                                          {isBooked ? cellData.booked.advertiser : (cellData?.ios?.length > 0 ? cellData.ios[0].advertiser : (cellData?.interests?.length > 0 ? cellData.interests[0].advertiser : ''))}
                                        </span>
                                      </div>
                                    )}
                                    {hasActivity && !isSelectedCell && (
                                      <button className="pointer-events-auto mt-auto flex items-center gap-1.5 text-[#0053E2] underline font-black text-[11px] hover:text-[#114AB6] bg-transparent border-none p-0 opacity-0 group-hover/slot:opacity-100 whitespace-nowrap" onClick={(e) => { e.stopPropagation(); setViewDetailSlot({ storeId: store.id, weekId: week.id }); }}>
                                        <Eye size={13} strokeWidth={3} /> View detail
                                      </button>
                                    )}
                                    {isSelectedCell && !isBooked && <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><div className="w-7 h-7 bg-[#0053E2] rounded-lg flex items-center justify-center shadow-lg border-2 border-white"><Check size={14} className="text-white" strokeWidth={4} /></div></div>}
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
        </div>
        </>
      )}

      {/* Pinned State Header for Store Calendar */}
      {activeTab !== 'in-aisle' && pinnedState && expandedStates.has(pinnedState) && (() => {
        const stores = filteredByState[pinnedState] || [];
        const stateSelCount = stores.filter(s => selectedStores.has(s.id)).length;
        const allStateSel = stateSelCount === stores.length;
        const scrollEl = storeGridScrollRef.current;
        const rect = scrollEl?.getBoundingClientRect();
        if (!rect) return null;
        return (
          <div className="fixed z-[195] bg-white/98 backdrop-blur-md border-b border-r border-slate-200 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.12),4px_0_6px_-2px_rgba(0,0,0,0.08)]" style={{ top: rect.top + 73, left: rect.left, width: 360 }}>
            <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#0053E2] rounded-r" />
            <div className="flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-blue-50/60 to-transparent">
              <button onClick={() => selectAllInState(pinnedState)} className="shrink-0 text-slate-400 hover:text-[#0053E2]">{allStateSel ? <CheckSquare size={16} className="text-[#0053E2]" /> : stateSelCount > 0 ? <MinusSquare size={16} className="text-[#0053E2]" /> : <Square size={16} />}</button>
              <button onClick={() => toggleStateExpand(pinnedState)} className="flex items-center gap-2 flex-1 min-w-0">
                <ChevronRight size={16} className="text-slate-400 transition-transform shrink-0 rotate-90" />
                <MapPin size={14} className="text-slate-400 shrink-0" />
                <span className="text-[13px] font-black text-slate-700">{STATE_DATA_FULL[pinnedState]?.name}</span>
                <span className="text-[11px] font-bold text-slate-400">{stores.length} stores</span>
                {stateSelCount > 0 && <span className="text-[10px] font-black text-[#0053E2] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">{stateSelCount} selected</span>}
              </button>
            </div>
          </div>
        );
      })()}

      {/* View Detail Slider for Store Calendar */}
      <div className={`fixed inset-y-0 right-0 w-[900px] bg-white shadow-2xl border-l border-slate-200 z-[2000] transform transition-transform duration-500 ${viewDetailSlot ? 'translate-x-0' : 'translate-x-full'}`}>
        {viewDetailSlot && (() => {
          const store = ALL_STORES.find(s => s.id === viewDetailSlot.storeId);
          const data = SLOT_DATA[`${viewDetailSlot.storeId}-${viewDetailSlot.weekId}`];
          return (
            <div className="flex flex-col h-full">
              <header className="p-8 flex items-center justify-between border-b border-slate-200 bg-white">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900">WM Week {viewDetailSlot.weekId}</h2>
                  <p className="text-sm text-slate-400 font-medium uppercase">Store #{viewDetailSlot.storeId} • {store?.city}, {store?.state}</p>
                </div>
                <button onClick={() => setViewDetailSlot(null)} className="p-2 text-slate-400 hover:text-slate-900"><X size={32} /></button>
              </header>
              <div className="flex-1 overflow-y-auto px-8 py-6">
                <div className="flex items-center text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 px-2">
                  <div className="w-[30%]">Advertiser</div><div className="w-[25%]">Weeks</div><div className="w-[45%]">Status</div>
                </div>
                <section className="mb-10">
                  <div className="flex items-center gap-2 mb-4 font-bold text-rose-600"><Lock size={18} /> Booked</div>
                  <div className="border-t border-slate-200">
                    {data?.booked ? (
                      <div className="flex items-center py-4 border-b border-slate-200 px-2">
                        <div className="w-[30%] font-bold text-sm uppercase">{data.booked.advertiser}</div>
                        <div className="w-[25%] text-slate-700 text-sm font-bold">{data.booked.weeks}</div>
                        <div className="w-[45%] text-slate-500 text-sm">Confirmed</div>
                      </div>
                    ) : <p className="py-8 text-sm text-slate-400 italic">No confirmed booking.</p>}
                  </div>
                </section>
                <section className="mb-10">
                  <div className="flex items-center gap-2 mb-4 font-bold text-amber-700"><Clock size={18} /> IO in progress ({data?.ios?.length || 0})</div>
                  <div className="border-t border-slate-200">
                    {data?.ios?.map((io, i) => (
                      <div key={i} className="flex items-center py-4 border-b border-slate-200 px-2">
                        <div className="w-[30%] font-bold text-sm uppercase">{io.advertiser}</div>
                        <div className="w-[25%] text-slate-700 text-sm font-bold">{io.weeks}</div>
                        <div className="w-[45%] text-slate-500 text-sm">In progress</div>
                      </div>
                    ))}
                    {(!data?.ios || data.ios.length === 0) && <p className="py-8 text-sm text-slate-400 italic">No IO in progress.</p>}
                  </div>
                </section>
                <section className="mb-10">
                  <div className="flex items-center gap-2 mb-4 font-bold text-green-700"><Zap size={18} className="fill-green-700/20" /> Interest ({data?.interests?.length || 0})</div>
                  <div className="border-t border-slate-200">
                    {data?.interests?.map((o, i) => (
                      <div key={i} className="flex items-center py-4 border-b border-slate-200 px-2">
                        <div className="w-[30%] font-bold text-sm uppercase">{o.advertiser}</div>
                        <div className="w-[25%] text-slate-700 text-sm font-bold">{o.weeks}</div>
                        <div className="w-[45%] text-slate-500 text-sm">Interest noted</div>
                      </div>
                    ))}
                    {(!data?.interests || data.interests.length === 0) && <p className="py-8 text-sm text-slate-400 italic">No interest recorded.</p>}
                  </div>
                </section>
              </div>
              <footer className="p-8 border-t border-slate-200 flex justify-end gap-6 bg-slate-50 bg-opacity-30">
                <button onClick={() => setViewDetailSlot(null)} className="text-sm font-bold text-slate-500 uppercase tracking-widest">Close</button>
              </footer>
            </div>
          );
        })()}
      </div>

      {/* Reserve Drawer for Store Calendar */}
      <div className={`fixed inset-y-0 right-0 w-[480px] bg-white shadow-2xl border-l border-slate-200 z-[2500] transition-all duration-500 transform ${isStoreReserving ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full relative">
          <header className="px-8 py-6 flex items-center justify-between border-b border-[#E3E4E5] bg-white">
            <div>
              <h2 className="text-[20px] font-bold text-[#2E2F32] leading-tight">Reserve {currentTab.label} Ads</h2>
              <p className="text-[14px] text-[#74767C] mt-1">{selectedStores.size.toLocaleString()} stores • Weeks {storeActiveRange ? storeActiveRange.min : ''}{storeActiveRange && storeActiveRange.max > storeActiveRange.min ? ` - ${storeActiveRange.max}` : ''}</p>
            </div>
            <button onClick={() => setIsStoreReserving(false)} className="p-2 text-slate-400 hover:text-slate-900"><X size={24} /></button>
          </header>
          <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
            <div className="space-y-1.5">
              <label className="text-[14px] font-bold text-[#2E2F32]">Advertiser</label>
              <div className="relative">
                <select className="w-full h-10 px-4 bg-white border border-[#BABBBE] rounded font-bold text-[#2E2F32] outline-none focus:border-[#0053E2] appearance-none text-sm">
                  <option value="">Select advertiser</option>
                  {ADVERTISERS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
              </div>
            </div>
            <div className="space-y-4 pt-2">
              <label className="text-[14px] font-bold text-[#2E2F32]">Status</label>
              <div className="flex flex-row items-center gap-12">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center w-5 h-5 rounded-full border-2 border-slate-400 group-hover:border-[#0053E2]">
                    <div className="w-2.5 h-2.5 bg-[#0053E2] rounded-full" />
                  </div>
                  <div className="text-[14px] font-black text-slate-900">Interest</div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center w-5 h-5 rounded-full border-2 border-slate-400 group-hover:border-[#0053E2]" />
                  <div className="text-[14px] font-black text-slate-900">IO in progress</div>
                </label>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[14px] font-bold text-[#2E2F32]">Campaign name (optional)</label>
              <input type="text" placeholder="Enter campaign name" className="w-full h-10 px-4 border border-[#BABBBE] rounded font-medium text-[#2E2F32] outline-none focus:border-[#0053E2] text-sm placeholder-[#74767C]" />
            </div>
            <div className="space-y-1.5 pt-2">
              <label className="text-[14px] font-bold text-[#2E2F32]">Notes (optional)</label>
              <textarea rows={3} placeholder="Add campaign notes..." className="w-full px-4 py-3 border border-[#BABBBE] rounded font-medium outline-none focus:border-[#0053E2] resize-none text-sm placeholder-[#74767C]" />
            </div>
          </div>
          <footer className="px-8 py-5 border-t border-[#E3E4E5] flex justify-end gap-4 bg-white shrink-0">
            <button onClick={() => setIsStoreReserving(false)} className="text-[14px] font-bold text-[#74767C] hover:text-[#2E2F32]">Cancel</button>
            <button className="px-6 h-10 bg-[#0053E2] text-white font-bold rounded-full hover:bg-[#114AB6] text-[16px] transition-colors">Reserve</button>
          </footer>
        </div>
      </div>

      {/* Backdrop for modals */}
      {(isStoreReserving || viewDetailSlot) && <div className="fixed inset-0 bg-black/50 z-[1050]" onClick={() => { setIsStoreReserving(false); setViewDetailSlot(null); }} />}
    </div>
  );
}
