import { useState } from 'react';
import {
  ChevronDown, MoreHorizontal, TrendingUp, Zap
} from 'lucide-react';

const CAMPAIGNS = [
  {
    id: '10004',
    name: 'Walmart|Display|Auction|Cross Device|Brand_FY27_Q1',
    type: 'Display',
    status: 'Live',
    totalBudget: '$200,553',
    targeting: 'Contextual targeting',
    impressions: '1,223,112',
    pacing: { value: '113%', color: 'text-green-600' },
    recommendations: 1,
  },
  {
    id: '10005',
    name: 'H&H_FY25_Always On_North Atlantic_Display_In-Market_50839',
    type: 'Display',
    status: 'Scheduled',
    totalBudget: '$213,443',
    targeting: 'Contextual targeting',
    impressions: '3,200,332',
    pacing: { value: '123%', color: 'text-amber-500' },
    recommendations: 2,
  },
  {
    id: '10006',
    name: 'KH_Summer_Awareness_Display_Run-of-Site_FY26',
    type: 'Video',
    status: 'Live',
    totalBudget: '$89,000',
    targeting: 'Behavioral targeting',
    impressions: '876,543',
    pacing: { value: '98%', color: 'text-green-600' },
    recommendations: 0,
  },
  {
    id: '10007',
    name: 'KH_Q3_Retargeting_Display_Audience',
    type: 'Display',
    status: 'Paused',
    totalBudget: '$45,000',
    targeting: 'Behavioral targeting',
    impressions: '234,891',
    pacing: { value: '67%', color: 'text-slate-500' },
    recommendations: 3,
  },
  {
    id: '10008',
    name: 'Holiday_2025_Brand_Awareness_Video',
    type: 'Video',
    status: 'Scheduled',
    totalBudget: '$320,000',
    targeting: 'Run of site',
    impressions: '—',
    pacing: { value: '—', color: 'text-slate-400' },
    recommendations: 0,
  },
];

const STATUS_COLORS = {
  Live: 'bg-green-100 text-green-700',
  Scheduled: 'bg-blue-100 text-blue-700',
  Paused: 'bg-amber-100 text-amber-700',
  Completed: 'bg-slate-100 text-slate-600',
};

export default function DisplayAdvertising({ onNavigate }) {
  const [recommendationsOpen, setRecommendationsOpen] = useState(true);
  const [campaignFilter, setCampaignFilter] = useState('All');

  const filtered = campaignFilter === 'All' ? CAMPAIGNS : CAMPAIGNS.filter(c => c.status === campaignFilter);

  const recommendations = [
    { title: 'Boost awareness', desc: '45k–48k potential impression increase', goal: 'Awareness', color: 'bg-purple-50 border-purple-200 text-purple-700' },
    { title: 'Improve reach', desc: '12–15% better reach frequency', goal: 'Reach', color: 'bg-blue-50 border-blue-200 text-blue-700' },
    { title: 'Increase conversions', desc: '8 recommendations available', goal: 'Conversion', color: 'bg-green-50 border-green-200 text-green-700' },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-[#F5F5F5] flex flex-col">
        <div className="flex flex-col gap-[25px] p-6">
          <h1 className="text-[32px] font-bold text-slate-900 leading-10">Hi, Gabriela</h1>
          {/* Recommendations */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <button
              className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
              onClick={() => setRecommendationsOpen(o => !o)}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Zap size={18} className="text-purple-600 fill-purple-200" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-slate-900">Recommendations</div>
                  <div className="text-xs text-slate-500">Discover opportunities to improve your campaigns</div>
                </div>
              </div>
              <ChevronDown size={16} className={`text-slate-400 transition-transform ${recommendationsOpen ? 'rotate-180' : ''}`} />
            </button>

            {recommendationsOpen && (
              <div className="px-6 pb-6 grid grid-cols-3 gap-4 border-t border-slate-100">
                {recommendations.map(r => (
                  <div key={r.title} className={`border rounded-xl p-5 ${r.color}`}>
                    <div className="text-[10px] font-bold uppercase tracking-wide opacity-70 mb-2">{r.goal}</div>
                    <div className="font-bold text-base mb-1">{r.title}</div>
                    <div className="text-sm opacity-80">{r.desc}</div>
                    <button className="mt-3 text-xs font-bold underline opacity-80 hover:opacity-100">View →</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Campaign table */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Campaigns</h2>
              <div className="flex items-center gap-2">
                {['All', 'Live', 'Scheduled', 'Paused'].map(f => (
                  <button key={f}
                    onClick={() => setCampaignFilter(f)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-colors ${campaignFilter === f ? 'bg-[#0053E2] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                    {f}
                  </button>
                ))}
                <button className="ml-2 px-4 py-1.5 bg-[#0053E2] text-white text-xs font-bold rounded-full hover:bg-[#114AB6] transition-colors">
                  + New campaign
                </button>
              </div>
            </div>

            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                  <th className="px-4 py-3 text-left w-[35%]">Campaign</th>
                  <th className="px-4 py-3 text-left w-[12%]">Type</th>
                  <th className="px-4 py-3 text-left w-[10%]">Status</th>
                  <th className="px-4 py-3 text-left w-[12%]">Budget</th>
                  <th className="px-4 py-3 text-left w-[16%]">Targeting</th>
                  <th className="px-4 py-3 text-left w-[10%]">Impressions</th>
                  <th className="px-4 py-3 text-left w-[8%]">Pacing</th>
                  <th className="px-4 py-3 w-6" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <tr key={c.id} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${i % 2 === 1 ? 'bg-slate-50/30' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-start gap-2">
                        <div>
                          <div className="font-medium text-slate-900 text-xs leading-5 line-clamp-2">{c.name}</div>
                          {c.recommendations > 0 && (
                            <div className="mt-0.5 flex items-center gap-1 text-[10px] font-bold text-purple-600">
                              <Zap size={10} className="fill-purple-200" />
                              {c.recommendations} recommendation{c.recommendations > 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${c.type === 'Video' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {c.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_COLORS[c.status]}`}>{c.status}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-700 text-xs">{c.totalBudget}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{c.targeting}</td>
                    <td className="px-4 py-3 text-slate-700 text-xs">{c.impressions}</td>
                    <td className={`px-4 py-3 text-xs font-bold ${c.pacing.color}`}>{c.pacing.value}</td>
                    <td className="px-4 py-3">
                      <button className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100">
                        <MoreHorizontal size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Performance summary */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Total Impressions', value: '5.5M', sub: 'This period' },
              { label: 'Total Reach', value: '2.1M', sub: 'Unique users' },
              { label: 'Avg eCPM', value: '$4.82', sub: 'vs $5.10 prior' },
              { label: 'View Rate', value: '68.4%', sub: 'Video campaigns' },
            ].map(m => (
              <div key={m.label} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <div className="text-xs font-semibold text-slate-500 mb-1">{m.label}</div>
                <div className="text-2xl font-bold text-slate-900">{m.value}</div>
                <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1"><TrendingUp size={10} />{m.sub}</div>
              </div>
            ))}
          </div>
        </div>
    </div>
  );
}
