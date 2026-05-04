import { Construction } from 'lucide-react';

const PAGE_LABELS = {
  'shop-builder': 'Shop Builder',
  'store-ads': 'Store Ads',
  'unified-reports': 'Unified Reports',
  'billing-manager': 'Billing Manager',
  'associate-tools': 'Associate Tools',
  'component-library': 'Component Library',
};

export default function StubPage({ pageId, onNavigate }) {
  const title = PAGE_LABELS[pageId] || pageId;
  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-[#F5F5F5]">
        <div className="p-6">
          <h1 className="text-[32px] font-bold text-slate-900 leading-10">{title}</h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center px-8">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
            <Construction size={28} className="text-slate-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">{title}</h2>
            <p className="text-slate-500 mt-2 max-w-sm">This section is coming soon. Check back later or explore another product.</p>
          </div>
          <button
            onClick={() => onNavigate?.('inventory-calendar')}
            className="px-6 py-2.5 bg-[#0053E2] text-white text-sm font-bold rounded-full hover:bg-[#114AB6] transition-colors"
          >
            Go to Inventory Calendar
          </button>
        </div>
    </div>
  );
}
