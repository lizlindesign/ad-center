import { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search, ChevronDown, ArrowUp, RefreshCw, Zap, ImageIcon,
  Download, CheckCircle, Circle, Store, BarChart2, Pin, X, ChevronsUpDown,
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

// ─── Main page ───────────────────────────────────────────────────────────────
export default function AdInventory({ onNavigate }) {
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

  const searchRef = useRef(null);

  useEffect(() => {
    const onMouseDown = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchDropdownOpen(false);
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

  const triggerSync = () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 1500);
  };

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: '#F5F5F5' }}>

      {/* ── Title bar ─────────────────────────────────────────── */}
      <div className="px-8 pt-6 pb-4 flex flex-wrap gap-4 justify-between items-center bg-white border-b border-[#E3E4E5]">
        <div>
          <h1 className="text-[32px] font-bold text-[#2E2F32] leading-10">Ad Inventory</h1>
          <p className="text-[16px] text-[#74767C] mt-1">Store Ads inventory availability and booking status</p>
        </div>
        <div className="flex gap-3 items-center">
          <SharePill icon={<CheckCircle size={14} style={{ color: BLUE }} />} label="Paid ad (60%)" active />
          <SharePill icon={<Circle size={14} style={subtle} />} label="In-house ad (40%)" />
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
          <Btn variant="primary" onClick={() => onNavigate?.('inventory-calendar')}>Reserve inventory</Btn>
        </div>
      </div>

      {/* ── Section 1: All stores + Daily overview ────────────── */}
      <div className="px-8 py-6 grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">

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

      {/* ── Section 3: Network load + Inventory fluidity ──────── */}
      <div className="px-8 pb-10 grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="p-5 flex flex-col" style={surfaceCard}>
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-[#2E2F32]">Network load</h3>
            <span className="text-[10px] font-black uppercase tracking-[0.18em] px-2 py-0.5 rounded"
              style={{ background: '#e3f4ea', color: '#1a8245' }}>LIVE</span>
          </div>
          <div className="flex justify-center mt-4">
            <NetworkLoadDonut pct={45} />
          </div>
        </div>
        <div className="xl:col-span-2 p-5 flex flex-col" style={surfaceCard}>
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-[#2E2F32]">Inventory fluidity (24h)</h3>
            <span className="flex items-center gap-2 text-xs">
              <span className="inline-block w-3 h-0.5" style={{ background: BLUE }} />
            </span>
          </div>
          <FluiditySineChart />
          <div className="flex justify-between text-[10px] uppercase font-bold tracking-wider mt-2" style={subtle}>
            <span>Aisle Update</span><span>High Traffic</span><span>Store Reset</span><span>Present</span>
          </div>
        </div>
      </div>
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

function NetworkLoadDonut({ pct }) {
  const G = 1.5;
  const bg = `conic-gradient(
    white 0% ${G / 2}%,
    ${BLUE} ${G / 2}% ${pct - G / 2}%,
    white ${pct - G / 2}% ${pct + G / 2}%,
    #f1f1f2 ${pct + G / 2}% ${100 - G / 2}%,
    white ${100 - G / 2}% 100%
  )`;
  return (
    <div className="relative w-32 h-32 rounded-full" role="img" aria-label={`${pct} percent booked`}
      style={{ background: bg }}>
      <div className="absolute inset-3 rounded-full flex flex-col items-center justify-center" style={{ background: '#fff' }}>
        <span className="text-2xl font-black tracking-tighter text-[#2E2F32]">{pct}%</span>
        <span className="text-[9px] uppercase font-black mt-1" style={subtle}>Booked</span>
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

function FluiditySineChart() {
  const W = 1000, H = 120;
  const points = [];
  for (let i = 0; i <= 60; i++) {
    const x = (i / 60) * W;
    const y = H / 2 - Math.sin((i / 60) * Math.PI * 2) * 35;
    points.push(`${x},${y}`);
  }
  return (
    <div className="mt-4 relative h-28 w-full">
      <svg className="w-full h-full" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        <polyline fill="none" stroke={BLUE} strokeWidth="2.5" points={points.join(' ')} />
      </svg>
    </div>
  );
}
