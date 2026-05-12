import { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search, ChevronDown, ArrowUp, RefreshCw, Zap, ImageIcon,
  Download, CheckCircle, Circle, Store, BarChart2, Pin, X, ChevronsUpDown,
  Monitor, Calendar, Clock, ChevronLeft, Check,
  ShoppingCart, Gamepad2, Home as HomeIcon, Baby, Heart, Pill, PawPrint,
} from 'lucide-react';

// ─── Design tokens ──────────────────────────────────────────────────────────
const BLUE      = '#0053E2';
const BLUE_DARK = '#001f64';
const surfaceCard = {
  background: '#ffffff',
  border: '1px solid #E3E4E5',
  borderRadius: 12,
  boxShadow: '0 1px 2px rgba(0,31,100,0.04)',
};
const subtle = { color: '#74767C' };

// ─── Mock data ───────────────────────────────────────────────────────────────
const TABS = [
  { id: 'departments',   label: 'Departments' },
  { id: 'self-checkout', label: 'Self Check-out' },
  { id: 'store-mode',    label: 'Store Mode' },
  { id: 'in-aisle',      label: 'In-aisle' },
];

const FAMOUS_ITEMS = [
  { name: 'Cheeze It Original (12.4 oz)',     upc: '024100122615', brand: "Kellogg's" },
  { name: 'Oreo Family Size Double Stuf',     upc: '044000033279', brand: 'Nabisco' },
  { name: 'Coca-Cola Classic 12-Pack',        upc: '049000028904', brand: 'Coca-Cola' },
  { name: 'Tide PODS Laundry Detergent 42ct', upc: '037000930389', brand: 'P&G' },
  { name: 'Doritos Nacho Cheese (9.25 oz)',   upc: '028400022020', brand: 'Frito-Lay' },
];

const STORE_ADDRESSES = [
  '3510 SE 14th St, Bentonville, AR',   '406 S Walton Blvd, Bentonville, AR',
  '4208 Pleasant Crossing Blvd, Rogers, AR', '2004 S Promenada Blvd, Rogers, AR',
  '2110 W Walnut St, Rogers, AR',       '2875 W Martin Luther King Blvd, Fayetteville, AR',
  '3919 N Mall Ave, Fayetteville, AR',  '1555 E Grand Ave, Arroyo Grande, CA',
  '1800 E Main St, Woodland, CA',       '1120 S 2nd St, Cabot, AR',
  '205 Deaderick Rd, Forrest City, AR', '1702 S 4th St, Heber Springs, AR',
  '900 NW Nye Pkwy, Bentonville, AR',   '725 N Walton Blvd, Bentonville, AR',
  '610 W Olive St, Rogers, AR',
];

const STORE_LIST = Array.from({ length: 60 }, (_, i) => ({
  name: `Walmart Supercenter - #${String(i + 1).padStart(4, '0')}`,
  addr: STORE_ADDRESSES[i % STORE_ADDRESSES.length],
  pct:  Math.max(5, Math.round(100 - i * 1.6 * 10) / 10),
}));

const TOTAL_SEC = 9_657_360;
const _RESERVED_PCTS = [
  24.46, 17.46, 16.53, 11.39, 11.39, 11.39, 11.39, 11.39, 11.39, 11.39,
  12.10, 13.20, 14.40, 15.60, 16.80, 18.20, 19.50, 20.10, 18.90, 17.30,
  15.70, 14.20, 12.90, 11.80, 11.39, 11.39, 11.39, 12.00, 13.50, 15.10,
];
const BOOKING_ROWS = Array.from({ length: 30 }, (_, i) => {
  const d = new Date(2026, 3, 28);
  d.setDate(d.getDate() + i);
  const date = `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`;
  const reservedPct = _RESERVED_PCTS[i];
  const availablePct = +(100 - reservedPct).toFixed(2);
  const reservedSec = Math.round(TOTAL_SEC * reservedPct / 100);
  const availableSec = TOTAL_SEC - reservedSec;
  return { date, reservedPct, availablePct, reservedSec, availableSec };
});

const TOP_DEPARTMENTS = [
  { code: 'A1-A24', name: 'Grocery & Consumables', badge: 'High Traffic',   badgeColor: 'positive', screens: '42,000', avail: '450k', barPct: 80, barTone: 'info' },
  { code: 'G1-G8',  name: 'Health & Wellness',     badge: 'Moderate',       badgeColor: 'info',     screens: '12,000', avail: '120k', barPct: 35, barTone: 'info' },
  { code: 'J1-J12', name: 'Entertainment & Toys',  badge: 'Seasonal Peak',  badgeColor: 'warning',  screens:  '8,000', avail:  '60k', barPct: 22, barTone: 'warning' },
];

const AISLE_PLACEMENTS = [
  { aisle: 'AISLE A12', name: 'Snacks & Chips',   context: 'Home Aisle location',           priority: 'primary',       badge: 'PRIMARY',                gross: '450k', net: '180k', barPct: 78 },
  { aisle: 'AISLE D5',  name: 'Soda & Beverages', context: 'Highest basket affinity',       priority: 'primary-comp',  badge: 'PRIMARY COMPLIMENTARY',  gross: '520k', net: '210k', barPct: 90 },
  { aisle: 'AISLE G2',  name: 'Party Supplies',   context: 'Event-based seasonal affinity', priority: 'secondary-comp',badge: 'SECONDARY COMPLIMENTARY',gross: '180k', net:  '45k', barPct: 22 },
];

const PRIORITY_COLOR = {
  'primary':       '#0053E2',
  'primary-comp':  '#8a3ffc',
  'secondary-comp':'#0caab1',
};
const PRIORITY_TAG_COLOR = {
  'primary':       'blue',
  'primary-comp':  'purple',
  'secondary-comp':'teal',
};

// ─── Kangaroo In-Aisle Screens Data ───────────────────────────────────────────
// Using Walmart fiscal weeks (consistent with Inventory Calendar)
const FY2027_START = new Date('2026-02-01');

const generateKangarooFlights = () => {
  const flights = [];
  const fmt = (d) => d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
  
  // Generate 2-week flight windows starting from WM Week 10
  for (let i = 0; i < 12; i++) {
    const startWeek = 10 + (i * 2);
    const endWeek = startWeek + 1;
    
    // Calculate actual dates based on fiscal year start
    const startDate = new Date(FY2027_START);
    startDate.setDate(startDate.getDate() + ((startWeek - 1) * 7));
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 13); // 2 weeks - 1 day
    
    flights.push({
      id: i + 1,
      startWeek,
      endWeek,
      label: `WM Week ${startWeek} - ${endWeek}`,
      dates: `${fmt(startDate)} - ${fmt(endDate)}`,
      startDate,
      endDate,
    });
  }
  return flights;
};

const FLIGHT_WINDOWS = generateKangarooFlights();

const KANGAROO_DEPARTMENTS = [
  { id: 'grocery', name: 'Grocery', totalScreens: 12, icon: 'grocery', categories: [
    { id: 'soda-drinks', name: 'Soda/Drinks Aisle' },
    { id: 'seasoning', name: 'Seasoning' },
    { id: 'chips-snacks', name: 'Chips/Snacks' },
  ]},
  { id: 'toys', name: 'Toys', totalScreens: 6, icon: 'toys', categories: [
    { id: 'action-figures', name: 'Action Figures' },
    { id: 'games-puzzles', name: 'Games & Puzzles' },
  ]},
  { id: 'home', name: 'Home', totalScreens: 4, icon: 'home', categories: [
    { id: 'furniture', name: 'Furniture' },
    { id: 'furnishings', name: 'Furnishings' },
  ]},
  { id: 'baby', name: 'Baby', totalScreens: 3, icon: 'baby', categories: [
    { id: 'diapers', name: 'Diapers & Wipes' },
    { id: 'baby-food', name: 'Baby Food' },
  ]},
  { id: 'hhe', name: 'Household Essentials (HHE)', totalScreens: 5, icon: 'hhe', categories: [
    { id: 'cleaning', name: 'Cleaning Supplies' },
    { id: 'paper-goods', name: 'Paper Goods' },
  ]},
  { id: 'health-beauty', name: 'Health & Beauty', totalScreens: 2, icon: 'beauty', categories: [
    { id: 'skincare', name: 'Skincare' },
    { id: 'haircare', name: 'Haircare' },
  ]},
  { id: 'otc-pharmacy', name: 'OTC/Pharmacy', totalScreens: 2, icon: 'pharmacy', categories: [
    { id: 'pain-relief', name: 'Pain Relief' },
    { id: 'vitamins', name: 'Vitamins & Supplements' },
  ]},
  { id: 'pets', name: 'Pets', totalScreens: 2, icon: 'pets', categories: [
    { id: 'dog-food', name: 'Dog Food' },
    { id: 'cat-food', name: 'Cat Food' },
  ]},
];

const DEPT_ICONS = {
  grocery: ShoppingCart,
  toys: Gamepad2,
  home: HomeIcon,
  baby: Baby,
  hhe: Monitor,
  beauty: Heart,
  pharmacy: Pill,
  pets: PawPrint,
};

const KANGAROO_ADVERTISERS = [
  'Pepsi', 'Coca Cola', 'Monster Energy', 'Celsius', 'Frito Lay', 'Pringles',
  'Cheeze It', 'Doritos', 'McCormick', 'Old Spice', 'Pampers', 'Huggies',
  'Tide', 'Bounty', 'Charmin', 'L\'Oreal', 'Neutrogena', 'Tylenol', 'Advil',
  'Purina', 'Blue Buffalo', 'LEGO', 'Hasbro', 'Mattel', 'IKEA', 'Ashley',
];

const generateKangarooBookings = () => {
  const bookings = {};
  KANGAROO_DEPARTMENTS.forEach((dept) => {
    const screensPerCat = Math.ceil(dept.totalScreens / dept.categories.length);
    dept.categories.forEach((cat) => {
      FLIGHT_WINDOWS.forEach((flight) => {
        const key = `${cat.id}-${flight.id}`;
        // Booking probability varies by flight timing:
        // Earlier flights (1-4): more bookings, higher chance of sold out
        // Middle flights (5-8): moderate bookings
        // Later flights (9-12): fewer bookings, mostly available
        const roll = Math.random();
        let numBookings;

        if (flight.id <= 4) {
          // Past/recent weeks - higher booking rate, more sold out
          if (roll < 0.15) {
            numBookings = 0;
          } else if (roll < 0.30) {
            numBookings = 1;
          } else if (roll < 0.50) {
            numBookings = 2;
          } else if (roll < 0.70) {
            numBookings = 3;
          } else {
            numBookings = screensPerCat; // Sold out
          }
        } else if (flight.id <= 8) {
          // Middle weeks - moderate bookings
          if (roll < 0.30) {
            numBookings = 0;
          } else if (roll < 0.55) {
            numBookings = 1;
          } else if (roll < 0.80) {
            numBookings = 2;
          } else {
            numBookings = Math.min(screensPerCat, 3);
          }
        } else {
          // Far future - mostly available
          if (roll < 0.50) {
            numBookings = 0;
          } else if (roll < 0.75) {
            numBookings = 1;
          } else if (roll < 0.90) {
            numBookings = 2;
          } else {
            numBookings = Math.min(screensPerCat, 2);
          }
        }

        numBookings = Math.min(numBookings, screensPerCat);
        const campaigns = [];
        for (let i = 0; i < numBookings; i++) {
          // Generate multi-week booking spans that include the current flight
          // Randomly extend before and/or after the current flight (1-3 extra flights each direction)
          const extendBefore = Math.floor(Math.random() * 3); // 0-2 flights before
          const extendAfter = Math.floor(Math.random() * 3);  // 0-2 flights after
          
          const startFlightIdx = Math.max(0, flight.id - 1 - extendBefore);
          const endFlightIdx = Math.min(FLIGHT_WINDOWS.length - 1, flight.id - 1 + extendAfter);
          
          const startFlight = FLIGHT_WINDOWS[startFlightIdx];
          const endFlight = FLIGHT_WINDOWS[endFlightIdx];
          
          // Build week label spanning multiple flights
          const weekLabel = startFlightIdx === endFlightIdx
            ? startFlight.label
            : `WM Week ${startFlight.startWeek} - ${endFlight.endWeek}`;
          
          campaigns.push({
            id: `${key}-${i}`,
            advertiser: KANGAROO_ADVERTISERS[Math.floor(Math.random() * KANGAROO_ADVERTISERS.length)],
            dateRange: flight.dates,
            weekLabel,
            status: 'RUNNING',
          });
        }
        bookings[key] = campaigns;
      });
    });
  });
  return bookings;
};

const KANGAROO_BOOKINGS = generateKangarooBookings();

// Random total percentage between 20-78% for the prototype
const KANGAROO_RANDOM_PCT = Math.floor(Math.random() * 59) + 20; // 20-78

const getKangarooDeptStatus = (dept, flightId) => {
  let totalBooked = 0;
  dept.categories.forEach((cat) => {
    const key = `${cat.id}-${flightId}`;
    totalBooked += (KANGAROO_BOOKINGS[key] || []).length;
  });
  const pct = (totalBooked / dept.totalScreens) * 100;
  // Adjusted thresholds - Kangaroo just started, so more Available statuses
  if (pct >= 100) return { label: 'SOLD OUT', color: 'error' };
  if (pct >= 90) return { label: 'NEAR CAPACITY', color: 'warning' };
  if (pct >= 70) return { label: 'HIGH DEMAND', color: 'info' };
  return { label: 'AVAILABLE', color: 'positive' };
};

const getKangarooCategoryBooked = (catId, flightId) => {
  const key = `${catId}-${flightId}`;
  return (KANGAROO_BOOKINGS[key] || []).length;
};

// ─── Main page ───────────────────────────────────────────────────────────────
export default function AdInventory2({ onNavigate, onNavigateToCalendar }) {
  const [activeTab,            setActiveTab]            = useState('in-aisle');
  const [adFormat,             setAdFormat]             = useState('dynamic');
  const [timeRange,            setTimeRange]            = useState('1M');
  const [granularity,          setGranularity]          = useState('Daily');
  const [searchInput,          setSearchInput]          = useState('');
  const [skuInput,             setSkuInput]             = useState('');
  const [analyzedSku,          setAnalyzedSku]          = useState(null);
  const [tablesExpanded,       setTablesExpanded]       = useState(false);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const [isSyncing,            setIsSyncing]            = useState(false);

  // Kangaroo section state
  const [kangarooSearch, setKangarooSearch] = useState('');
  const [selectedFlight, setSelectedFlight] = useState(FLIGHT_WINDOWS[0]);
  const [flightDropdownOpen, setFlightDropdownOpen] = useState(false);
  const [selectedKangarooDept, setSelectedKangarooDept] = useState(null);
  const [reserveModal, setReserveModal] = useState(null);

  const searchRef = useRef(null);
  const flightRef = useRef(null);

  useEffect(() => {
    const onMouseDown = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchDropdownOpen(false);
      }
      if (flightRef.current && !flightRef.current.contains(e.target)) {
        setFlightDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, []);

  const filteredItems = useMemo(
    () => FAMOUS_ITEMS.filter(
      (i) => i.name.toLowerCase().includes(skuInput.toLowerCase()) || i.upc.includes(skuInput)
    ),
    [skuInput],
  );

  // Kangaroo computed values
  const kangarooTotalScreens = KANGAROO_DEPARTMENTS.reduce((sum, d) => sum + d.totalScreens, 0);
  const kangarooTotalBooked = useMemo(() => {
    let booked = 0;
    KANGAROO_DEPARTMENTS.forEach((dept) => {
      dept.categories.forEach((cat) => {
        booked += getKangarooCategoryBooked(cat.id, selectedFlight.id);
      });
    });
    return booked;
  }, [selectedFlight.id]);
  // Use random percentage (20-78%) for the global donut - refreshes show different values
  const kangarooTotalPct = KANGAROO_RANDOM_PCT;

  const filteredKangarooDepts = useMemo(() => {
    if (!kangarooSearch.trim()) return KANGAROO_DEPARTMENTS;
    const q = kangarooSearch.toLowerCase();
    return KANGAROO_DEPARTMENTS.filter(
      (d) => d.name.toLowerCase().includes(q) || d.categories.some((c) => c.name.toLowerCase().includes(q))
    );
  }, [kangarooSearch]);

  const triggerSync = () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 1500);
  };

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: '#F5F5F5' }}>

      {/* ── Title bar ─────────────────────────────────────────── */}
      <div className="px-8 pt-6 pb-4 flex flex-wrap gap-4 justify-between items-center">
        <div>
          <h1 className="text-[32px] font-bold text-[#2E2F32] leading-10">Ad Inventory</h1>
          <p className="text-[16px] text-[#74767C] mt-1">Store Ads inventory availability and booking status</p>
        </div>
        <div className="flex gap-3 items-center">
          <Btn variant="primary" onClick={() => onNavigateToCalendar?.(activeTab)}>Reserve inventory</Btn>
        </div>
      </div>

      {/* ── Tabs ──────────────────────────────────────────────── */}
      <div className="px-8 bg-white" style={{ borderBottom: '1px solid #E3E4E5' }}>
        <div role="tablist" aria-label="Macro placement tabs" className="flex gap-6">
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

      {/* ── Filter bar ────────────────────────────────────────── */}
      <div className="px-8 py-4 flex flex-wrap gap-3 items-center justify-between bg-white border-b border-[#E3E4E5]">
        <div className="flex gap-2 items-center flex-wrap">
          <div className="flex items-center gap-2 px-3 rounded-full text-sm" style={{ height: 36, width: 220, background: '#fff', border: '1px solid #c4c5c8' }}>
            <Search size={14} style={subtle} />
            <input type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search" aria-label="Search" className="flex-1 bg-transparent outline-none text-sm" />
          </div>
          <FilterDropdown label="Saved store list" width={160} />
          <SegControl
            value={timeRange}
            options={['1M', '3M', '6M', 'Custom']}
            onChange={setTimeRange}
          />
          <FilterDropdown
            label={granularity}
            width={110}
            onClick={() => {
              const order = ['Daily', 'Weekly', 'Monthly'];
              setGranularity(order[(order.indexOf(granularity) + 1) % order.length]);
            }}
          />
        </div>
        <div className="flex gap-2 items-center">
          <Btn variant="secondary" leading={<Download size={14} />}>Download CSV</Btn>
          <SharePill icon={<CheckCircle size={14} style={{ color: BLUE }} />} label="Paid ad (60%)" active />
          <SharePill icon={<Circle size={14} style={subtle} />} label="In-house ad (40%)" />
        </div>
      </div>

      {/* ── Section 1: All stores + Daily overview ────────────── */}
      <div className="px-8 py-6 grid grid-cols-1 xl:grid-cols-3 gap-6 items-stretch">

        {/* Left: donut + store list */}
        <div className="flex flex-col" style={surfaceCard}>
          <div className="px-5 py-4">
            <h2 className="text-sm font-bold text-[#2E2F32]">All stores (4,700)</h2>
          </div>
          <div className="px-5 pb-5 flex flex-col items-center">
            <DonutChart available={55.4} booked={44.6} />
            <div className="grid grid-cols-2 gap-2 mt-5 w-full text-xs">
              <div className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded" style={{ background: '#E3E4E5' }} />
                <span>55.4% Available</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded" style={{ background: BLUE }} />
                <span>44.6% Booked</span>
              </div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid #E3E4E5' }}>
            <div className="px-5 py-3 flex justify-between text-sm">
              <span className="flex items-center gap-2"><CheckCircle size={14} style={subtle} />Available stores</span>
              <span className="font-medium" style={subtle}>(3,508)</span>
            </div>
            <div className="px-5 py-3 flex justify-between text-sm" style={{ borderTop: '1px solid #f1f1f2' }}>
              <span className="flex items-center gap-2"><Circle size={14} style={subtle} />Unavailable stores</span>
              <span className="font-medium" style={subtle}>(1,181)</span>
            </div>
          </div>
          <div className="flex flex-col" style={{ borderTop: '1px solid #E3E4E5' }}>
            <div className="px-5 py-2 flex justify-between text-[11px] font-bold uppercase tracking-wide" style={{ ...subtle, background: '#F5F5F5' }}>
              <span>Store</span>
              <span className="flex items-center gap-1">Booking % <ArrowUp size={10} /></span>
            </div>
            <div className="overflow-y-auto" style={{ height: tablesExpanded ? 520 : 320 }}>
              {STORE_LIST.map((s) => (
                <div key={s.name} className="px-5 py-3 flex justify-between items-center" style={{ borderTop: '1px solid #f1f1f2' }}>
                  <div className="text-xs">
                    <div className="font-medium text-[#2E2F32]">{s.name}</div>
                    <div className="mt-0.5" style={subtle}>{s.addr}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full" style={{ background: BLUE }} />
                    <span className="text-xs font-bold">{s.pct}%</span>
                  </div>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => setTablesExpanded((v) => !v)}
              className="w-full py-3 text-sm flex justify-center items-center gap-2"
              style={{ color: BLUE, fontWeight: 600, borderTop: '1px solid #f1f1f2', background: 'transparent', border: 'none', cursor: 'pointer' }}>
              <ChevronsUpDown size={12} />
              {tablesExpanded ? 'Show Less' : 'View More Stores'}
            </button>
          </div>
        </div>

        {/* Right: Daily overview chart + Booking status */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          <div className="shrink-0 flex flex-col" style={surfaceCard}>
            <div className="px-5 pt-4 pb-2 flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#2E2F32]">Daily overview</h2>
              <div className="flex gap-5 text-xs">
                {[['2026', BLUE], ['2025', '#8a3ffc'], ['2024', '#5ec5ee']].map(([yr, col]) => (
                  <span key={yr} className="flex items-center gap-2">
                    <span className="inline-block w-3 h-0.5" style={{ background: col }} />
                    <span className="font-medium">{yr}</span>
                  </span>
                ))}
              </div>
            </div>
            <div className="px-5 pb-5 flex-1">
              <DailyOverviewChart />
            </div>
          </div>
          <div className="flex flex-col" style={surfaceCard}>
            <div className="px-5 py-4">
              <h2 className="text-sm font-bold text-[#2E2F32]">Booking status</h2>
            </div>
            <div className="text-[11px] font-bold uppercase tracking-wide grid"
              style={{ ...subtle, gridTemplateColumns: '1fr 1fr 1fr 1.3fr 1.3fr', background: '#F5F5F5', borderTop: '1px solid #E3E4E5', borderBottom: '1px solid #E3E4E5' }}>
              <div className="px-5 py-2 flex items-center gap-1">Date <ArrowUp size={10} /></div>
              <div className="px-5 py-2">Reserved (%)</div>
              <div className="px-5 py-2">Available (%)</div>
              <div className="px-5 py-2">Reserved (Sec)</div>
              <div className="px-5 py-2">Available (Sec)</div>
            </div>
            <div className="overflow-y-auto" style={{ height: tablesExpanded ? 500 : 300 }}>
              {BOOKING_ROWS.map((row) => (
                <div key={row.date} className="grid text-sm" style={{ gridTemplateColumns: '1fr 1fr 1fr 1.3fr 1.3fr', borderBottom: '1px solid #f1f1f2' }}>
                  <div className="px-5 py-3">{row.date}</div>
                  <div className="px-5 py-3">{row.reservedPct}%</div>
                  <div className="px-5 py-3">{row.availablePct}%</div>
                  <div className="px-5 py-3">{row.reservedSec.toLocaleString()}</div>
                  <div className="px-5 py-3">{row.availableSec.toLocaleString()}</div>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => setTablesExpanded((v) => !v)}
              className="w-full py-3 text-sm flex justify-center items-center gap-2"
              style={{ color: BLUE, fontWeight: 600, borderTop: '1px solid #f1f1f2', background: 'transparent', border: 'none', cursor: 'pointer' }}>
              <ChevronsUpDown size={12} />
              {tablesExpanded ? 'Show Less' : 'View More Dates'}
            </button>
          </div>
        </div>
      </div>

      {/* ── In-Aisle Targeting Strategy bar ──────────────────── */}
      <div className="mx-8 mb-6 px-5 py-4 flex flex-wrap gap-4 items-center justify-between" style={{
        background: 'linear-gradient(90deg, #e9f1fe 0%, #F5F5F5 100%)',
        border: `1px solid ${BLUE}`,
        borderRadius: 12,
      }}>
        <div>
          <h3 className="text-sm font-bold text-[#2E2F32]">In-Aisle Targeting Strategy</h3>
          <p className="text-xs mt-0.5" style={subtle}>Define your aisle-level targeting parameters.</p>
        </div>
        <div className="flex gap-3 items-center flex-wrap">
          <FormatToggle value={adFormat} onChange={setAdFormat} />
          <button type="button" onClick={triggerSync}
            className="flex items-center gap-1.5 px-3 text-xs font-bold rounded-full"
            style={{ height: 30, background: '#fff', border: '1px solid #c4c5c8', color: '#2E2F32', cursor: 'pointer' }}>
            <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
            Sync metadata
          </button>
          {/* SKU search */}
          <div ref={searchRef} className="relative">
            <div className="flex items-center gap-2 px-3 rounded-full text-xs" style={{ height: 30, width: 240, background: '#fff', border: '1px solid #c4c5c8' }}>
              <Search size={12} style={subtle} />
              <input type="text" value={skuInput}
                onChange={(e) => { setSkuInput(e.target.value); setIsSearchDropdownOpen(true); }}
                onFocus={() => setIsSearchDropdownOpen(true)}
                placeholder="Search Item or UPC (e.g. Cheeze It)"
                aria-label="Search Item or UPC"
                className="flex-1 bg-transparent outline-none text-xs" />
              {(skuInput || analyzedSku) && (
                <button type="button" aria-label="Clear" onClick={() => { setSkuInput(''); setAnalyzedSku(null); setIsSearchDropdownOpen(false); }}
                  className="inline-flex items-center justify-center w-4 h-4 rounded-full"
                  style={{ background: '#E3E4E5', color: '#2E2F32', border: 'none', cursor: 'pointer' }}>
                  <X size={10} />
                </button>
              )}
            </div>
            {isSearchDropdownOpen && skuInput && filteredItems.length > 0 && (
              <div role="listbox" className="absolute right-0 mt-1 z-20 max-h-72 overflow-y-auto" style={{ ...surfaceCard, width: 280 }}>
                {filteredItems.map((item) => (
                  <button type="button" role="option" key={item.upc}
                    onClick={() => { setSkuInput(item.name); setIsSearchDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-[#e9f1fe] transition-colors">
                    <div className="font-medium text-[#2E2F32]">{item.name}</div>
                    <div className="text-xs" style={subtle}>{item.brand} · UPC {item.upc}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button type="button" onClick={() => setAnalyzedSku(skuInput.trim() || null)}
            disabled={!skuInput.trim()}
            className="flex items-center gap-1.5 px-3 text-xs font-bold rounded-full transition-colors"
            style={{ height: 30, background: skuInput.trim() ? BLUE : '#E3E4E5', color: skuInput.trim() ? '#fff' : '#74767C', border: 'none', cursor: skuInput.trim() ? 'pointer' : 'not-allowed' }}>
            <BarChart2 size={12} />
            Analyze
          </button>
        </div>
      </div>

      {/* ── Section 2: Inventory tile + Top departments ───────── */}
      <div className="px-8 pb-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Inventory overview tile */}
        <div className="p-5" style={surfaceCard}>
          <div className="text-[10px] font-bold uppercase tracking-[0.18em]" style={subtle}>
            {analyzedSku ? 'Item Focus' : 'Network Overview'}
          </div>
          <h3 className="text-lg font-bold mt-1 text-[#2E2F32]">
            {analyzedSku ?? 'All In-Aisle Inventory'}
          </h3>
          <p className="text-xs mt-0.5" style={subtle}>Tiered Impression Model</p>

          <div className="mt-4 p-4" style={{ background: '#F5F5F5', borderRadius: 10 }}>
            <div className="text-[10px] font-bold uppercase tracking-[0.18em]" style={subtle}>Total Gross Impressions</div>
            <div className="text-2xl font-black mt-1 text-[#2E2F32]">
              {analyzedSku ? '1,150,000' : '12,450,000'}
            </div>
          </div>

          <div className="mt-3 p-4 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${BLUE_DARK} 0%, ${BLUE} 100%)`, color: '#fff', borderRadius: 10 }}>
            <div className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: '#bfd6ff' }}>Available Net Liquidity</div>
            <div className="text-2xl font-black mt-1">{analyzedSku ? '435,000' : '4,235,000'}</div>
            <div className="text-[11px] mt-1" style={{ color: '#bfd6ff' }}>
              {analyzedSku ? 'Aggregate across 4,120 stores' : 'Aggregate across 4,700 stores'}
            </div>
            <BarSpark />
          </div>

          <div className="mt-4 p-3 flex items-start gap-3" style={{ background: '#F5F5F5', borderRadius: 10 }}>
            <Store size={18} style={{ color: BLUE, marginTop: 2, flexShrink: 0 }} />
            <div>
              <div className="text-xs font-bold text-[#2E2F32]">Reach Strategy</div>
              <div className="text-[11px] mt-0.5" style={subtle}>
                {analyzedSku
                  ? 'Forecast includes Primary (Home Aisle) and tiered Complimentary reach based on customer basket overlap.'
                  : 'Forecast aggregates capacity across primary departments. Target specific SKUs to refine reach.'}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Top departments or Aisle placements */}
        <div className="xl:col-span-2 flex flex-col" style={surfaceCard}>
          <div className="px-5 py-4 flex justify-between items-center gap-4 flex-wrap">
            {analyzedSku ? (
              <>
                <h3 className="text-sm font-bold flex items-center gap-2 text-[#2E2F32]">
                  <Pin size={14} style={{ color: BLUE }} />
                  Aisle Placement Aggregation
                </h3>
                <div className="flex items-center gap-3 text-[11px]">
                  <PriorityLegend color={PRIORITY_COLOR['primary']}        label="Primary" />
                  <PriorityLegend color={PRIORITY_COLOR['primary-comp']}   label="P. Complimentary" />
                  <PriorityLegend color={PRIORITY_COLOR['secondary-comp']} label="S. Complimentary" />
                  <button type="button" onClick={() => setAnalyzedSku(null)}
                    className="text-xs font-bold ml-2" style={{ color: BLUE, background: 'none', border: 'none', cursor: 'pointer' }}>
                    Clear
                  </button>
                </div>
              </>
            ) : (
              <h3 className="text-sm font-bold text-[#2E2F32]">Top Performing Departments</h3>
            )}
          </div>
          <div className="px-5 flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 pb-2">
            {analyzedSku
              ? AISLE_PLACEMENTS.map((p) => <AislePlacementTile key={p.aisle} placement={p} />)
              : TOP_DEPARTMENTS.map((d) => <DepartmentTile key={d.code} dept={d} />)}
          </div>

          {/* Inventory Capture Logic banner */}
          <div className="px-5 pt-4 pb-5">
            <section aria-label="Inventory capture summary"
              className="px-5 py-4 flex gap-4 justify-between items-center relative overflow-hidden"
              style={{ background: BLUE_DARK, color: '#fff', borderRadius: 12 }}>
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div className="p-2 flex items-center justify-center shrink-0" style={{ background: 'rgba(77,190,255,0.18)', borderRadius: 8 }}>
                  <Store size={20} style={{ color: '#4dbeff' }} />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: '#bfe3ff' }}>
                    Inventory Capture Logic
                  </div>
                  <div className="text-sm mt-1">
                    {analyzedSku ? (
                      <>Aggregating aisle placements for{' '}
                        <span style={{ color: '#4dbeff', fontWeight: 700 }}>{analyzedSku}</span>{' '}
                        across <span style={{ color: '#4dbeff', fontWeight: 700 }}>4,120 specific stores</span>.</>
                    ) : (
                      <>Calculating reach across{' '}
                        <span style={{ color: '#4dbeff', fontWeight: 700 }}>4,700 network stores</span>{' '}
                        based on aggregate department traffic and active screen availability.</>
                    )}
                  </div>
                </div>
              </div>
              <Btn variant="primary" style={{ flexShrink: 0 }}>Confirm allocation</Btn>
            </section>
          </div>
        </div>
      </div>

      {/* ── Kangaroo In-Aisle Screens Section ──────────────────── */}
      <div className="px-8 pb-8">
        <div style={surfaceCard}>
          {/* Section header with filters */}
          <div className="px-6 py-4 flex flex-wrap gap-4 items-center justify-between border-b border-[#E3E4E5]">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-bold text-[#2E2F32]">In Aisle Screens</h2>
              <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide"
                style={{ background: '#e9f1fe', color: BLUE }}>200 Stores Aggregated</span>
            </div>
            <div className="flex gap-3 items-center flex-wrap">
              {/* Search */}
              <div className="flex items-center gap-2 px-3 rounded-full text-sm"
                style={{ height: 32, width: 160, background: '#fff', border: '1px solid #c4c5c8' }}>
                <Search size={12} style={subtle} />
                <input type="text" value={kangarooSearch} onChange={(e) => setKangarooSearch(e.target.value)}
                  placeholder="Search inventory..." className="flex-1 bg-transparent outline-none text-xs" />
              </div>
              {/* Flight badge */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold"
                style={{ background: '#fff4e0', color: '#c97f00', border: '1px solid #ffd98a' }}>
                <Clock size={10} />
                FLIGHT: 2-WEEK INCREMENT
              </div>
              {/* Date picker */}
              <div ref={flightRef} className="relative">
                <button type="button" onClick={() => setFlightDropdownOpen(!flightDropdownOpen)}
                  className="flex items-center gap-2 px-3 rounded-full text-xs"
                  style={{ height: 32, background: '#fff', border: '1px solid #c4c5c8', cursor: 'pointer' }}>
                  <Calendar size={12} style={{ color: BLUE }} />
                  <span>{selectedFlight.label} ({selectedFlight.dates})</span>
                  <ChevronDown size={12} />
                </button>
                {flightDropdownOpen && (
                  <div className="absolute left-0 mt-1 z-30 py-1" style={{ ...surfaceCard, minWidth: 160 }}>
                    {FLIGHT_WINDOWS.map((f) => (
                      <button key={f.id} type="button"
                        onClick={() => { setSelectedFlight(f); setFlightDropdownOpen(false); }}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-[#e9f1fe] flex items-center justify-between gap-2"
                        style={{ background: f.id === selectedFlight.id ? '#e9f1fe' : 'transparent', border: 'none', cursor: 'pointer' }}>
                        <div>
                          <div className="font-medium">{f.label}</div>
                          <div className="text-[10px]" style={subtle}>{f.dates}</div>
                        </div>
                        {f.id === selectedFlight.id && <Check size={12} style={{ color: BLUE }} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button type="button" className="flex items-center gap-1.5 px-3 rounded-full text-xs font-medium"
                style={{ height: 32, background: '#fff', border: '1px solid #c4c5c8', cursor: 'pointer' }}>
                <Download size={12} />
                Download View
              </button>
              <button
                type="button"
                onClick={() => onNavigate?.('inventory-calendar-2')}
                className="flex items-center gap-1.5 px-4 rounded-full text-xs font-bold text-white"
                style={{ height: 32, background: BLUE, border: 'none', cursor: 'pointer' }}
              >
                <Calendar size={12} />
                View inventory calendar
              </button>
            </div>
          </div>

          {/* Content area */}
          <div className="p-6">
            {selectedKangarooDept ? (
              <KangarooDrilldown
                dept={selectedKangarooDept}
                flight={selectedFlight}
                onBack={() => setSelectedKangarooDept(null)}
                onReserve={(cat, avail) => setReserveModal({ dept: selectedKangarooDept, cat, avail })}
                onChangeFlight={setSelectedFlight}
              />
            ) : (
              <KangarooOverview
                departments={filteredKangarooDepts}
                flight={selectedFlight}
                totalPct={kangarooTotalPct}
                totalBooked={kangarooTotalBooked}
                totalScreens={kangarooTotalScreens}
                onSelectDept={setSelectedKangarooDept}
              />
            )}
          </div>
        </div>
      </div>

      {/* Reserve Modal */}
      {reserveModal && (
        <KangarooReserveModal
          dept={reserveModal.dept}
          cat={reserveModal.cat}
          flight={selectedFlight}
          availableSlots={reserveModal.avail}
          onClose={() => setReserveModal(null)}
        />
      )}

    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function SharePill({ icon, label, active }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
      style={{ border: '1px solid #E3E4E5', color: active ? '#2E2F32' : '#74767C', background: '#fff' }}>
      {icon}<span>{label}</span>
    </div>
  );
}

function FilterDropdown({ label, width, onClick }) {
  return (
    <button type="button" onClick={onClick}
      className="flex items-center justify-between px-3 rounded-full text-sm"
      style={{ height: 36, width, background: '#fff', border: '1px solid #c4c5c8', color: '#2E2F32', cursor: 'pointer' }}>
      <span>{label}</span><ChevronDown size={14} />
    </button>
  );
}

function SegControl({ value, options, onChange }) {
  return (
    <div role="radiogroup" className="flex rounded-full overflow-hidden text-sm"
      style={{ height: 36, background: '#fff', border: '1px solid #c4c5c8' }}>
      {options.map((opt) => {
        const active = value === opt;
        return (
          <button key={opt} type="button" role="radio" aria-checked={active} onClick={() => onChange(opt)}
            className="px-4"
            style={{ background: active ? BLUE : 'transparent', color: active ? '#fff' : '#2E2F32',
              fontWeight: active ? 700 : 500, border: 'none', cursor: 'pointer' }}>
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function FormatToggle({ value, onChange }) {
  const items = [
    { value: 'dynamic', label: 'Dynamic Items', icon: <Zap size={11} /> },
    { value: 'static',  label: 'Static Images', icon: <ImageIcon size={11} /> },
  ];
  return (
    <div className="flex rounded-full overflow-hidden text-xs"
      style={{ height: 30, background: '#fff', border: '1px solid #c4c5c8' }}>
      {items.map((item) => {
        const active = value === item.value;
        return (
          <button key={item.value} type="button" onClick={() => onChange(item.value)}
            className="flex items-center gap-1.5 px-3"
            style={{ background: active ? BLUE : 'transparent', color: active ? '#fff' : '#2E2F32',
              fontWeight: active ? 700 : 500, border: 'none', cursor: 'pointer' }}>
            {item.icon}{item.label}
          </button>
        );
      })}
    </div>
  );
}

function Btn({ variant = 'primary', children, onClick, disabled, leading, style: extra }) {
  const isPrimary = variant === 'primary';
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      className="flex items-center gap-1.5 rounded-full font-bold text-sm transition-colors"
      style={{
        padding: '0 20px', height: 40, border: isPrimary ? 'none' : '1px solid #c4c5c8',
        background: isPrimary ? (disabled ? '#E3E4E5' : BLUE) : '#fff',
        color: isPrimary ? (disabled ? '#74767C' : '#fff') : '#2E2F32',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        ...extra,
      }}>
      {leading}{children}
    </button>
  );
}

function Tag({ color = 'gray', variant = 'secondary', children }) {
  const palette = {
    positive: { bg: '#e3f4ea', text: '#1a8245', border: '#b4dfc4' },
    info:     { bg: '#e9f1fe', text: '#0053E2', border: '#c4d9ff' },
    warning:  { bg: '#fff4e0', text: '#c97f00', border: '#ffd98a' },
    gray:     { bg: '#f1f1f2', text: '#46474c', border: '#e3e4e5' },
    purple:   { bg: '#f2ecff', text: '#6b39c4', border: '#d4b8ff' },
    blue:     { bg: '#e9f1fe', text: '#0053E2', border: '#c4d9ff' },
    teal:     { bg: '#e0f7f8', text: '#0caab1', border: '#9de8eb' },
  };
  const s = palette[color] || palette.gray;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 4,
      fontSize: 10, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
      background: variant === 'primary' ? s.bg : 'transparent', color: s.text, border: `1px solid ${s.border}` }}>
      {children}
    </span>
  );
}

function DonutChart({ booked }) {
  const G = 1.2;
  const bg = `conic-gradient(
    white 0% ${G / 2}%,
    ${BLUE} ${G / 2}% ${booked - G / 2}%,
    white ${booked - G / 2}% ${booked + G / 2}%,
    #E3E4E5 ${booked + G / 2}% ${100 - G / 2}%,
    white ${100 - G / 2}% 100%
  )`;
  return (
    <div className="relative w-44 h-44 rounded-full" role="img" aria-label={`${booked} percent booked`}
      style={{ background: bg }}>
      <div className="absolute inset-6 rounded-full flex flex-col items-center justify-center" style={{ background: '#fff' }}>
        <span className="text-xl font-black text-[#2E2F32] leading-tight">{booked}%</span>
        <span className="text-[10px] font-bold uppercase tracking-wide mt-0.5" style={{ color: '#74767C' }}>Booked</span>
      </div>
    </div>
  );
}

function DepartmentTile({ dept }) {
  const barColor = dept.barTone === 'warning' ? '#ffc220' : BLUE;
  const availColor = dept.barTone === 'warning' ? '#c97f00' : BLUE;
  return (
    <div className="p-4 flex flex-col" style={{ background: '#F5F5F5', borderRadius: 10, minHeight: 180 }}>
      <div className="flex justify-between items-start gap-2">
        <Tag color="gray" variant="secondary">{dept.code}</Tag>
        <Tag color={dept.badgeColor} variant="primary">{dept.badge}</Tag>
      </div>
      <div className="text-base font-bold mt-3 text-[#2E2F32]">{dept.name}</div>
      <div className="text-[11px]" style={subtle}>Department average</div>
      <div className="mt-auto pt-4 flex justify-between items-baseline text-[10px] uppercase font-bold tracking-wider" style={subtle}>
        <span>Active Screens</span>
        <span style={{ color: '#2E2F32', fontSize: 14 }}>{dept.screens}</span>
      </div>
      <div className="mt-3 flex justify-between items-baseline text-[10px] uppercase font-bold tracking-wider" style={subtle}>
        <span>Avg Net Avail</span>
        <span style={{ color: availColor, fontSize: 18, fontWeight: 800 }}>{dept.avail}</span>
      </div>
      <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: '#E3E4E5' }}>
        <div style={{ width: `${dept.barPct}%`, height: '100%', background: barColor }} />
      </div>
    </div>
  );
}

function AislePlacementTile({ placement }) {
  const color = PRIORITY_COLOR[placement.priority];
  const tagColor = PRIORITY_TAG_COLOR[placement.priority];
  return (
    <div className="relative p-4 flex flex-col overflow-hidden"
      style={{ background: '#fff', border: '1px solid #E3E4E5', borderRadius: 10, minHeight: 180 }}>
      <div className="flex justify-between items-start gap-2">
        <Tag color="gray" variant="secondary">{placement.aisle}</Tag>
        <Tag color={tagColor} variant="primary">{placement.badge}</Tag>
      </div>
      <div className="text-base font-bold mt-3 text-[#2E2F32]">{placement.name}</div>
      <div className="text-[11px]" style={subtle}>{placement.context}</div>
      <div className="mt-auto pt-4 flex justify-between items-baseline text-[10px] uppercase font-bold tracking-wider" style={subtle}>
        <span>Gross Impressions</span>
        <span style={{ color: '#2E2F32', fontSize: 13 }}>{placement.gross}</span>
      </div>
      <div className="mt-3 flex justify-between items-baseline text-[10px] uppercase font-bold tracking-wider" style={subtle}>
        <span>Net Avail Impressions</span>
        <span style={{ color, fontSize: 16, fontWeight: 800 }}>{placement.net}</span>
      </div>
      <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: '#E3E4E5' }}>
        <div style={{ width: `${placement.barPct}%`, height: '100%', background: color }} />
      </div>
    </div>
  );
}

function PriorityLegend({ color, label }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-block w-2 h-2 rounded-full" style={{ background: color }} />
      <span style={subtle}>{label}</span>
    </span>
  );
}

function BarSpark() {
  return (
    <svg width="120" height="40" viewBox="0 0 120 40" style={{ position: 'absolute', right: 8, bottom: 8, opacity: 0.6 }} aria-hidden>
      {[20,28,16,32,24,36,20,30].map((h, i) => (
        <rect key={i} x={i * 14} y={40 - h} width="10" height={h} fill="rgba(255,255,255,0.55)" rx="1" />
      ))}
    </svg>
  );
}

function smoothPath(values, W, H) {
  if (!values.length) return '';
  const stepX = W / Math.max(values.length - 1, 1);
  const pts = values.map((v, i) => ({ x: i * stepX, y: H - v }));
  let d = `M ${pts[0].x},${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
  }
  return d;
}

function DailyOverviewChart() {
  const series2026 = [40,70,50,75,55,78,35,50,25];
  const series2025 = [55,45,50,48,50,45,40,35,30];
  const series2024 = [30,35,30,40,38,30,55,35,25];
  const dows = ['M','T','W','T','F','S','S','M','T','W','T','F','S','S','M','T','W','T','F','S','S','M','T','W','T','F','S','S','M','T'];
  const dateMarkers = { 0: '6/1', 7: '6/8', 14: '6/15', 21: '6/22' };
  const yLeft = ['100%','80%','60%','40%','20%','0'];
  const W = 1000, H = 100;
  const PURPLE = '#8a3ffc', CYAN = '#5ec5ee';
  const p26 = smoothPath(series2026, W, H);
  const p25 = smoothPath(series2025, W, H);
  const p24 = smoothPath(series2024, W, H);
  return (
    <div className="relative w-full" style={{ height: 260 }}>
      <div className="absolute left-0 top-0 w-10 flex flex-col justify-between text-[10px] font-medium" style={{ ...subtle, bottom: 44 }}>
        {yLeft.map((v) => <span key={v}>{v}</span>)}
      </div>
      <div className="absolute" style={{ left: 44, right: 8, top: 0, bottom: 44 }}>
        <svg className="w-full h-full" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
          <defs>
            <linearGradient id="ag26" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={BLUE} stopOpacity="0.22" /><stop offset="100%" stopColor={BLUE} stopOpacity="0" />
            </linearGradient>
            <linearGradient id="ag25" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={PURPLE} stopOpacity="0.10" /><stop offset="100%" stopColor={PURPLE} stopOpacity="0" />
            </linearGradient>
            <linearGradient id="ag24" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CYAN} stopOpacity="0.10" /><stop offset="100%" stopColor={CYAN} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={`${p24} L ${W},${H} L 0,${H} Z`} fill="url(#ag24)" />
          <path d={`${p25} L ${W},${H} L 0,${H} Z`} fill="url(#ag25)" />
          <path d={`${p26} L ${W},${H} L 0,${H} Z`} fill="url(#ag26)" />
          <path d={p24} fill="none" stroke={CYAN}   strokeWidth="2"    vectorEffect="non-scaling-stroke" />
          <path d={p25} fill="none" stroke={PURPLE} strokeWidth="2"    vectorEffect="non-scaling-stroke" />
          <path d={p26} fill="none" stroke={BLUE}   strokeWidth="2.25" vectorEffect="non-scaling-stroke" />
        </svg>
        <div className="absolute flex text-[10px] font-medium" style={{ left: 0, right: 0, bottom: -18, ...subtle }}>
          {dows.map((d, i) => <span key={i} style={{ flex: 1, textAlign: 'center' }}>{d}</span>)}
        </div>
        <div className="absolute flex text-[10px] font-medium" style={{ left: 0, right: 0, bottom: -34, ...subtle }}>
          {dows.map((_, i) => <span key={i} style={{ flex: 1, textAlign: 'center' }}>{dateMarkers[i] ?? ''}</span>)}
        </div>
      </div>
    </div>
  );
}

// ─── Kangaroo Sub-components ──────────────────────────────────────────────────

function KangarooOverview({ departments, flight, totalPct, totalBooked, totalScreens, onSelectDept }) {
  return (
    <div className="flex gap-6 items-stretch">
      {/* Left: Donut */}
      <div className="p-5 flex flex-col items-center shrink-0" style={{ background: '#F5F5F5', borderRadius: 12, width: 220 }}>
        <div className="text-xs font-bold text-[#2E2F32] mb-3 text-center">
          Global Store Inventory for In Aisle Screens
        </div>
        <KangarooDonut pct={totalPct} />
        <div className="mt-3 text-center">
          <div className="text-[10px] uppercase font-bold tracking-wide" style={subtle}>Booked</div>
          <div className="text-sm mt-1">
            <span className="font-bold">{totalBooked}</span>
            <span style={subtle}> / {totalScreens} screens</span>
          </div>
        </div>
      </div>

      {/* Right: Department grid */}
      <div className="flex-1 grid grid-cols-2 xl:grid-cols-4 gap-3 auto-rows-fr">
        {departments.map((dept) => {
          const status = getKangarooDeptStatus(dept, flight.id);
          let booked = 0;
          dept.categories.forEach((cat) => {
            booked += getKangarooCategoryBooked(cat.id, flight.id);
          });
          return (
            <button key={dept.id} type="button" onClick={() => onSelectDept(dept)}
              className="p-3 flex flex-col text-left transition-all hover:shadow-md"
              style={{ background: '#F5F5F5', borderRadius: 12, cursor: 'pointer', border: '2px solid transparent' }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = BLUE)}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'transparent')}>
              <div className="flex items-start justify-between gap-2">
                {(() => {
                  const IconComponent = DEPT_ICONS[dept.icon] || Monitor;
                  return <IconComponent size={16} style={{ color: BLUE }} />;
                })()}
                <KangarooStatusBadge status={status} />
              </div>
              <div className="text-sm font-bold mt-2 text-[#2E2F32]">{dept.name}</div>
              <div className="mt-auto pt-3">
                <div className="text-xl font-black text-[#2E2F32]">
                  {booked}<span className="text-sm font-medium" style={subtle}> / {dept.totalScreens}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function KangarooDrilldown({ dept, flight, onBack, onReserve, onChangeFlight }) {
  return (
    <div>
      <button type="button" onClick={onBack}
        className="flex items-center gap-1 text-xs font-medium mb-3"
        style={{ color: BLUE, background: 'none', border: 'none', cursor: 'pointer' }}>
        <ChevronLeft size={14} />
        Back
      </button>

      <h3 className="text-lg font-bold text-[#2E2F32] mb-4">{dept.name} Inventory Breakdown</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {dept.categories.map((cat) => {
          const key = `${cat.id}-${flight.id}`;
          const campaigns = KANGAROO_BOOKINGS[key] || [];
          const booked = campaigns.length;
          const screensPerCat = Math.ceil(dept.totalScreens / dept.categories.length);
          const avail = Math.max(0, screensPerCat - booked);
          const isFull = avail === 0;
          
          // Find next flight with availability (scan future flights)
          const nextAvailableFlight = FLIGHT_WINDOWS.find((f) => {
            if (f.id <= flight.id) return false;
            const futureKey = `${cat.id}-${f.id}`;
            const futureCampaigns = KANGAROO_BOOKINGS[futureKey] || [];
            return futureCampaigns.length < screensPerCat;
          });

          // Determine category status
          const pct = (booked / screensPerCat) * 100;
          let catStatus;
          if (pct >= 100) catStatus = { label: 'SOLD OUT', color: 'error' };
          else if (pct >= 75) catStatus = { label: 'NEAR CAPACITY', color: 'warning' };
          else if (pct >= 50) catStatus = { label: 'HIGH DEMAND', color: 'info' };
          else catStatus = { label: 'AVAILABLE', color: 'positive' };

          return (
            <div key={cat.id} className="flex flex-col" style={surfaceCard}>
              <div className="px-4 pt-3 pb-2">
                <div className="text-[9px] uppercase font-bold tracking-wide" style={subtle}>Primary Product Category</div>
                <div className="flex items-baseline justify-between mt-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-base font-bold text-[#2E2F32]">{cat.name}</span>
                    {isFull && (
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded"
                        style={{ background: '#ffeaea', color: '#c41e3a' }}>SOLD OUT</span>
                    )}
                  </div>
                  {isFull && nextAvailableFlight && (
                    <span className="text-[10px]" style={subtle}>
                      Next available:{' '}
                      <button
                        type="button"
                        onClick={() => onChangeFlight(nextAvailableFlight)}
                        className="underline"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: BLUE }}
                      >
                        {nextAvailableFlight.label}
                      </button>
                    </span>
                  )}
                </div>
              </div>

              <div className="px-4 flex-1">
                {/* Active Campaigns */}
                {campaigns.length > 0 && (
                  <>
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="text-[9px] uppercase font-bold tracking-wide flex items-center gap-1" style={subtle}>
                        <Clock size={9} />
                        Active Campaigns
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      {campaigns.map((c) => (
                        <div key={c.id} className="flex items-center py-2 px-3 rounded-lg" style={{ background: '#e9f1fe' }}>
                          <div>
                            <div className="text-xs font-bold" style={{ color: BLUE }}>{c.advertiser}</div>
                            <div className="text-[10px] flex items-center gap-1" style={{ color: '#5a8fe6' }}>
                              <Clock size={9} />{c.weekLabel}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Available Screens */}
                {avail > 0 && (
                  <div className={campaigns.length > 0 ? 'mt-3' : ''}>
                    <div className="flex items-center justify-between mb-1.5 pr-3">
                      <div className="text-[9px] uppercase font-bold tracking-wide flex items-center gap-1" style={subtle}>
                        <Monitor size={9} />
                        Available Screens
                      </div>
                      <button
                        type="button"
                        onClick={() => onReserve(cat, avail)}
                        className="text-[9px] font-bold px-2 py-0.5 rounded"
                        style={{ background: 'transparent', color: '#1a8245', border: '1px solid #1a8245', cursor: 'pointer' }}
                      >
                        Reserve All
                      </button>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      {Array.from({ length: avail }, (_, i) => (
                        <div key={`avail-${i}`} className="flex items-center justify-between py-2 px-3 rounded-lg" style={{ background: '#e3f4ea' }}>
                          <div>
                            <div className="text-xs font-bold" style={{ color: '#1a8245' }}>Screen Slot {booked + i + 1}</div>
                            <div className="text-[10px] flex items-center gap-1" style={{ color: '#4da672' }}>
                              <Clock size={9} />{flight.label}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => onReserve(cat, 1)}
                            className="text-[9px] font-bold px-2 py-0.5 rounded"
                            style={{ background: 'transparent', color: '#1a8245', border: '1px solid #1a8245', cursor: 'pointer' }}
                          >
                            Reserve
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {campaigns.length === 0 && avail === 0 && (
                  <div className="text-xs py-3 text-center" style={subtle}>No screens</div>
                )}
              </div>

              <div className="px-4 py-3 mt-auto" style={{ borderTop: '1px solid #E3E4E5' }}>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span>{booked}</span>
                  <span style={{ color: avail > 0 ? '#1a8245' : '#c97f00' }}>{avail}</span>
                </div>
                <div className="flex justify-between text-[9px] uppercase font-bold tracking-wide" style={subtle}>
                  <span>Booked</span><span>Avail.</span>
                </div>
                <div className="mt-1.5 h-1.5 rounded-full overflow-hidden flex" style={{ background: '#E3E4E5' }}>
                  {booked > 0 && <div style={{ width: `${(booked / screensPerCat) * 100}%`, background: BLUE, borderRadius: '9999px 0 0 9999px' }} />}
                  {booked > 0 && avail > 0 && <div style={{ width: '3px', background: '#fff' }} />}
                  {avail > 0 && <div style={{ width: `${(avail / screensPerCat) * 100}%`, background: '#1a8245', borderRadius: booked > 0 ? '0 9999px 9999px 0' : '9999px' }} />}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function KangarooReserveModal({ dept, cat, flight, availableSlots, onClose }) {
  const [advertiser, setAdvertiser] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => onClose(), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="p-5 w-full max-w-sm" style={{ ...surfaceCard, borderRadius: 16 }}>
        {submitted ? (
          <div className="text-center py-6">
            <div className="w-14 h-14 rounded-full mx-auto flex items-center justify-center mb-3" style={{ background: '#e3f4ea' }}>
              <Check size={28} style={{ color: '#1a8245' }} />
            </div>
            <h3 className="text-lg font-bold text-[#2E2F32]">Reservation Submitted!</h3>
            <p className="text-xs mt-1" style={subtle}>Your slot has been reserved for {cat.name}</p>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-[#2E2F32]">Reserve Slot</h3>
                <p className="text-xs mt-0.5" style={subtle}>{dept.name} → {cat.name}</p>
              </div>
              <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} style={subtle} />
              </button>
            </div>

            <div className="mb-3 p-2.5 rounded-lg" style={{ background: '#F5F5F5' }}>
              <div className="flex items-center gap-2 text-xs">
                <Calendar size={12} style={{ color: BLUE }} />
                <span className="font-medium">{flight.label}</span>
              </div>
              <div className="text-[10px] mt-0.5" style={subtle}>
                {flight.dates} · {availableSlots} slot{availableSlots > 1 ? 's' : ''} available
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-medium mb-1.5 text-[#2E2F32]">Advertiser Name</label>
              <input type="text" value={advertiser} onChange={(e) => setAdvertiser(e.target.value)}
                placeholder="Enter advertiser name"
                className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ border: '1px solid #c4c5c8' }} />
            </div>

            <div className="flex gap-2">
              <button type="button" onClick={onClose}
                className="flex-1 py-2 rounded-full text-xs font-bold"
                style={{ background: '#fff', border: '1px solid #c4c5c8', cursor: 'pointer' }}>Cancel</button>
              <button type="button" onClick={handleSubmit} disabled={!advertiser.trim()}
                className="flex-1 py-2 rounded-full text-xs font-bold text-white"
                style={{ background: advertiser.trim() ? BLUE : '#E3E4E5', border: 'none', cursor: advertiser.trim() ? 'pointer' : 'not-allowed' }}>Reserve</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function KangarooStatusBadge({ status }) {
  const colors = {
    positive: { bg: '#e3f4ea', text: '#1a8245' },
    info: { bg: '#e9f1fe', text: BLUE },
    warning: { bg: '#fff4e0', text: '#c97f00' },
    error: { bg: '#ffeaea', text: '#c41e3a' },
  };
  const c = colors[status.color] || colors.info;
  return (
    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded" style={{ background: c.bg, color: c.text }}>
      {status.label}
    </span>
  );
}

function KangarooDonut({ pct }) {
  const G = 1.5;
  const bg = `conic-gradient(
    white 0% ${G / 2}%,
    ${BLUE} ${G / 2}% ${pct - G / 2}%,
    white ${pct - G / 2}% ${pct + G / 2}%,
    #E3E4E5 ${pct + G / 2}% ${100 - G / 2}%,
    white ${100 - G / 2}% 100%
  )`;
  return (
    <div className="relative w-28 h-28 rounded-full" style={{ background: bg }}>
      <div className="absolute inset-3 rounded-full flex flex-col items-center justify-center" style={{ background: '#F5F5F5' }}>
        <span className="text-2xl font-black text-[#2E2F32]">{pct}%</span>
        <span className="text-[8px] font-bold uppercase tracking-wide text-center" style={subtle}>Booked</span>
      </div>
    </div>
  );
}

