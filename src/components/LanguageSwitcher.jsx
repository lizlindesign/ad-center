import { useState, useRef, useEffect } from 'react';

const LANGUAGES = [
  { code: 'en', label: 'English',  flag: 'https://flagcdn.com/w40/us.png' },
  { code: 'es', label: 'Español',  flag: 'https://flagcdn.com/w40/es.png' },
  { code: 'fr', label: 'Français', flag: 'https://flagcdn.com/w40/fr.png' },
];

export default function LanguageSwitcher() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState('en');
  const ref = useRef(null);

  const lang = LANGUAGES.find(l => l.code === current) ?? LANGUAGES[0];

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-0.5 px-1 py-1 rounded-full border border-slate-300 bg-white hover:bg-slate-50 transition-colors"
        aria-label="Change language"
      >
        <img src={lang.flag} alt={lang.label} className="w-5 h-5 rounded-full object-cover" />
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
          <path d="M7.624 10.329C7.719 10.438 7.856 10.5 8 10.5C8.144 10.5 8.281 10.438 8.376 10.329L11.876 6.329C12.006 6.182 12.036 5.972 11.955 5.793C11.874 5.615 11.696 5.5 11.5 5.5H4.5C4.304 5.5 4.126 5.615 4.045 5.793C3.964 5.972 3.995 6.182 4.124 6.329L7.624 10.329Z" fill="#2E2F32"/>
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg z-[600] min-w-[160px] py-1 overflow-hidden">
          {LANGUAGES.map(l => (
            <button
              key={l.code}
              onClick={() => { setCurrent(l.code); setOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors hover:bg-slate-50 ${
                current === l.code ? 'font-semibold text-[#0053E2]' : 'text-[#2E2F32]'
              }`}
            >
              <img src={l.flag} alt={l.label} className="w-5 h-5 rounded-full object-cover shrink-0" />
              <span className="flex-1 text-left">{l.label}</span>
              {current === l.code && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M1.5 6L4.5 9L10.5 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
