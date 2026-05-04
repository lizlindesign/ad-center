import { useState } from 'react';
import { ChevronDown, TrendingUp, TrendingDown } from 'lucide-react';

const INITIAL_CAMPAIGNS = [
  { name: 'Cool Beans, Hot Days (Summer 2025)', roas: '$7.68', cpc: '$1.09', ctr: '2.37%', cvr: '57.48%', spend: 1.09, status: 'Live' },
  { name: 'Decaf, Not Defeated (Evergreen)', roas: '$10.52', cpc: '$0.78', ctr: '0.60%', cvr: '63.92%', spend: 0.78, status: 'Live' },
  { name: 'Press, Sip, Reign, K-Cups (Evergreen)', roas: '$6.78', cpc: '$1.32', ctr: '0.78%', cvr: '44.67%', spend: 1.32, status: 'Paused' },
  { name: 'Morning Ritual — French Press Q4', roas: '$8.21', cpc: '$0.95', ctr: '1.84%', cvr: '52.10%', spend: 0.95, status: 'Live' },
  { name: 'Cold Brew Summer Push', roas: '$5.44', cpc: '$1.55', ctr: '1.02%', cvr: '38.77%', spend: 1.55, status: 'Scheduled' },
];

const STATUS_COLORS = {
  Live: 'bg-green-100 text-green-800',
  Paused: 'bg-amber-100 text-amber-700',
  Scheduled: 'bg-blue-100 text-blue-700',
  Completed: 'bg-slate-100 text-slate-600',
};

function MiniSparkline({ up }) {
  const pts = up
    ? '0,18 8,14 16,12 24,8 32,6 40,4'
    : '0,4 8,8 16,10 24,14 32,16 40,18';
  return (
    <svg width="40" height="22" viewBox="0 0 40 22">
      <polyline points={pts} fill="none" stroke={up ? '#16a34a' : '#dc2626'} strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

export default function SponsoredSearch({ onNavigate }) {
  const [activeItem, setActiveItem] = useState('home');
  const [sortCol, setSortCol] = useState('spend');
  const [sortDir, setSortDir] = useState('desc');
  const [campaigns, setCampaigns] = useState(INITIAL_CAMPAIGNS);
  const [dateRange, setDateRange] = useState('Aug 1 – Aug 8, 2025');
  const [attribution, setAttribution] = useState('14 days');

  const handleSort = (col) => {
    const dir = sortCol === col && sortDir === 'desc' ? 'asc' : 'desc';
    setSortCol(col); setSortDir(dir);
    const sorted = [...campaigns].sort((a, b) => {
      let av = a[col], bv = b[col];
      if (typeof av === 'string') { av = parseFloat(av.replace(/[$%]/g, '')); bv = parseFloat(bv.replace(/[$%]/g, '')); }
      return dir === 'desc' ? bv - av : av - bv;
    });
    setCampaigns(sorted);
  };

  const SortIcon = ({ col }) => {
    if (sortCol !== col) return <span className="text-slate-300 ml-1">↕</span>;
    return <span className="text-[#0053E2] ml-1">{sortDir === 'desc' ? '↓' : '↑'}</span>;
  };

  const metrics = [
    { label: 'Impressions', value: '18.7M', delta: '+12%', up: true },
    { label: 'Clicks', value: '148.8K', delta: '+8%', up: true },
    { label: 'CPC', value: '$1.36', delta: '-3%', up: false },
    { label: 'CTR', value: '0.84%', delta: '+5%', up: true },
    { label: 'Ad Spend', value: '$195.6K', delta: '+18%', up: true },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-[#F5F5F5] flex flex-col">
        <div className="flex flex-col gap-[25px] p-6">
          <h1 className="text-[32px] font-bold text-slate-900 leading-10">Hi, Gabriela</h1>
          {/* Filters */}
          <div className="flex items-center gap-3">
            {[
              { label: 'Date range', value: dateRange, opts: ['Last 7 days', 'Aug 1 – Aug 8, 2025', 'Last 30 days'], set: setDateRange },
              { label: 'Attribution', value: attribution, opts: ['7 days', '14 days', '30 days'], set: setAttribution },
            ].map(f => (
              <div key={f.label} className="relative">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">{f.label}</label>
                <select
                  value={f.value}
                  onChange={e => f.set(e.target.value)}
                  className="h-8 pl-3 pr-8 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white outline-none focus:border-[#0053E2] appearance-none cursor-pointer"
                >
                  {f.opts.map(o => <option key={o}>{o}</option>)}
                </select>
                <ChevronDown size={13} className="absolute right-2 bottom-2 text-slate-400 pointer-events-none" />
              </div>
            ))}
            <button className="mt-5 px-5 py-1.5 bg-[#0053E2] text-white text-sm font-bold rounded-full hover:bg-[#114AB6] transition-colors">
              Create campaign
            </button>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-5 gap-4">
            {metrics.map(m => (
              <div key={m.label} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-start justify-between">
                  <span className="text-xs font-semibold text-slate-500">{m.label}</span>
                  <MiniSparkline up={m.up} />
                </div>
                <div className="mt-2 text-xl font-bold text-slate-900">{m.value}</div>
                <div className={`text-xs font-semibold mt-0.5 flex items-center gap-1 ${m.up ? 'text-green-600' : 'text-red-500'}`}>
                  {m.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {m.delta} vs prior period
                </div>
              </div>
            ))}
          </div>

          {/* Chart placeholder */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900">Performance over time</h2>
              <div className="flex items-center gap-4 text-xs font-semibold">
                {[{ label: 'Impressions', color: '#0053E2' }, { label: 'Clicks', color: '#FFC220' }, { label: 'CPC', color: '#2DA44E' }].map(s => (
                  <span key={s.label} className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 rounded-full inline-block" style={{ backgroundColor: s.color }} />
                    {s.label}
                  </span>
                ))}
              </div>
            </div>
            <div className="h-40 flex items-end gap-1 px-2">
              {Array.from({ length: 28 }, (_, i) => {
                const h1 = 30 + Math.sin(i * 0.4) * 25 + Math.random() * 20;
                const h2 = 20 + Math.cos(i * 0.3) * 15 + Math.random() * 15;
                return (
                  <div key={i} className="flex-1 flex items-end gap-px">
                    <div className="flex-1 rounded-t" style={{ height: h1, backgroundColor: '#0053E2', opacity: 0.7 }} />
                    <div className="flex-1 rounded-t" style={{ height: h2, backgroundColor: '#FFC220', opacity: 0.7 }} />
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-2 text-[10px] font-medium text-slate-400 px-1">
              <span>Aug 1</span><span>Aug 8</span>
            </div>
          </div>

          {/* Campaign table */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Campaigns</h2>
              <span className="text-xs text-slate-500">{campaigns.length} campaigns</span>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {[
                    { key: 'name', label: 'Campaign', w: 'w-[35%]' },
                    { key: 'roas', label: 'ROAS', w: 'w-[11%]' },
                    { key: 'cpc', label: 'CPC', w: 'w-[11%]' },
                    { key: 'ctr', label: 'CTR', w: 'w-[11%]' },
                    { key: 'cvr', label: 'CVR', w: 'w-[11%]' },
                    { key: 'spend', label: 'Spend', w: 'w-[11%]' },
                  ].map(col => (
                    <th key={col.key} className={`${col.w} px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wide cursor-pointer hover:text-slate-700`}
                      onClick={() => handleSort(col.key)}>
                      {col.label}<SortIcon col={col.key} />
                    </th>
                  ))}
                  <th className="w-[10%] px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c, i) => (
                  <tr key={c.name} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${i % 2 === 1 ? 'bg-slate-50/40' : ''}`}>
                    <td className="px-4 py-3 font-medium text-slate-900 text-xs">{c.name}</td>
                    <td className="px-4 py-3 text-slate-700">{c.roas}</td>
                    <td className="px-4 py-3 text-slate-700">{c.cpc}</td>
                    <td className="px-4 py-3 text-slate-700">{c.ctr}</td>
                    <td className="px-4 py-3 text-slate-700">{c.cvr}</td>
                    <td className="px-4 py-3 text-slate-700">${c.spend.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_COLORS[c.status]}`}>{c.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
    </div>
  );
}
