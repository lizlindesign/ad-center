import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Send, Square, ThumbsUp, ThumbsDown, BarChart2 } from 'lucide-react';

// Gradient-ring orb used in chat messages and panel header
const MartyOrb = ({ size = 24 }) => {
  const id = `mg-${size}`;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <clipPath id={`clip-${id}`}><rect width="24" height="24" rx="12" fill="white"/></clipPath>
      <g clipPath={`url(#clip-${id})`}>
        <rect width="24" height="24" rx="12" fill="white"/>
        <circle cx="12" cy="12" r="9.5" fill={`url(#grad-${id})`}/>
      </g>
      <defs>
        <linearGradient id={`grad-${id}`} x1="2.5" y1="2.5" x2="21.5" y2="21.5" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#993EF4"/>
          <stop offset="50%" stopColor="#4DBDF5"/>
          <stop offset="100%" stopColor="#00D0CD"/>
        </linearGradient>
      </defs>
    </svg>
  );
};

// Blob mascot used in the FAB button
const MartyBlob = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="blob-ring" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#993EF4"/>
        <stop offset="50%" stopColor="#4DBDF5"/>
        <stop offset="100%" stopColor="#00D0CD"/>
      </linearGradient>
      <clipPath id="blob-clip"><circle cx="20" cy="20" r="20"/></clipPath>
    </defs>
    {/* Gradient ring */}
    <circle cx="20" cy="20" r="20" fill="url(#blob-ring)"/>
    <circle cx="20" cy="20" r="18" fill="white"/>
    {/* Blob body */}
    <path d="M9 23C9 15.5 13 9.5 20 9.5C27 9.5 31 15.5 31 23C31 28 27.5 30.5 20 30.5C12.5 30.5 9 28 9 23Z" fill="#9B8EF5"/>
    {/* Shine */}
    <ellipse cx="16" cy="13" rx="3" ry="2" fill="white" fillOpacity="0.3"/>
    {/* Left eye */}
    <circle cx="16" cy="22" r="2.8" fill="white"/>
    <circle cx="16.8" cy="22.6" r="1.3" fill="#2E2F32"/>
    <circle cx="17.3" cy="22.1" r="0.5" fill="white"/>
    {/* Right eye */}
    <circle cx="24" cy="22" r="2.8" fill="white"/>
    <circle cx="24.8" cy="22.6" r="1.3" fill="#2E2F32"/>
    <circle cx="25.3" cy="22.1" r="0.5" fill="white"/>
    {/* Smile */}
    <path d="M16.5 27Q20 29.5 23.5 27" stroke="#2E2F32" strokeWidth="1.3" strokeLinecap="round" fill="none"/>
  </svg>
);

const QUICK_RESPONSES = {
  campaign: "I can help you create a campaign! I'll guide you through setting up targeting, budget, and items. Would you like to start with Sponsored Products or Display?",
  budget: "Campaign budgets control your ad spend. I recommend starting with at least $50–100/day for Display to gather data. You can adjust anytime based on performance.",
  targeting: "There are several targeting strategies:\n\n• Contextual — based on page content\n• Behavioral — based on user history\n• Run of site — across all placements\n\nWhat type of campaign are you planning?",
  recommend: "Based on your account, I recommend:\n\n1. Optimize high-performing campaigns — 3 campaigns at 113%+ pacing could use budget increases\n2. Review paused campaigns — 4 campaigns ready to reactivate\n3. Add negative keywords — could reduce wasted spend by 8–12%\n\nWhich would you like to explore first?",
  pacing: "Pacing shows how quickly your budget is being spent. 100% = on track, 100%+ = spending faster than planned.\n\nGreen (100–115%) is good. Orange (115%+) means you might exhaust budget early.",
  performance: "Your current performance overview:\n\n• Total Impressions: 156M+ across active campaigns\n• Avg CTR: Strong engagement on contextual targeting\n• Top Performers: Behavioral targeting showing 10–15% better results",
  help: "I can help with:\n\n• Creating campaigns — step-by-step setup\n• Optimizing performance — recommendations for active campaigns\n• Understanding metrics — learn what your data means\n• Managing budgets — adjust spending\n\nWhat would you like help with?",
  default: "That's a great question! I can help you with creating and managing campaigns, understanding performance metrics, optimizing your advertising strategy, and answering questions about Walmart advertising. Could you rephrase or let me know which area you'd like to explore?",
};

function generateResponse(input) {
  const i = input.toLowerCase();
  if (i.includes('campaign') && (i.includes('create') || i.includes('make') || i.includes('start'))) return QUICK_RESPONSES.campaign;
  if (i.includes('budget')) return QUICK_RESPONSES.budget;
  if (i.includes('targeting')) return QUICK_RESPONSES.targeting;
  if (i.includes('recommend') || i.includes('suggestion')) return QUICK_RESPONSES.recommend;
  if (i.includes('pacing') || i.includes('pace')) return QUICK_RESPONSES.pacing;
  if (i.includes('performance') || i.includes('metrics')) return QUICK_RESPONSES.performance;
  if (i.includes('help') || i.includes('?') || i.includes('hi') || i.includes('hello')) return QUICK_RESPONSES.help;
  return QUICK_RESPONSES.default;
}

export default function MartyFloatingPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [viewState, setViewState] = useState('welcome');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [dailyBudget, setDailyBudget] = useState('');

  // FAB drag state — matches reference exactly
  const [isDragging, setIsDragging] = useState(false);
  const [hasMoved, setHasMoved] = useState(false);
  const [fabPosition, setFabPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [eyePosition, setEyePosition] = useState({ x: 0, y: 0 });
  const [tooltipPosition, setTooltipPosition] = useState('top');
  const isDraggingRef = useRef(false);
  const fabButtonRef = useRef(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '20px';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [input]);

  // Eye tracking
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (fabButtonRef.current) {
        const rect = fabButtonRef.current.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = e.clientX - cx, dy = e.clientY - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxMove = 3;
        setEyePosition({
          x: dist > 0 ? (dx / dist) * Math.min(dist / 20, maxMove) : 0,
          y: dist > 0 ? (dy / dist) * Math.min(dist / 20, maxMove) : 0,
        });
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Drag handling
  useEffect(() => {
    if (!isDragging) return;
    const handleMouseMove = (e) => {
      const dx = Math.abs(e.clientX - dragStartPos.x);
      const dy = Math.abs(e.clientY - dragStartPos.y);
      if (Math.sqrt(dx * dx + dy * dy) > 3) {
        isDraggingRef.current = true;
        setFabPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
        setHasMoved(true);
      }
    };
    const handleMouseUp = () => setIsDragging(false);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); };
  }, [isDragging, dragStart, dragStartPos]);

  // Tooltip position (avoid clipping when dragged near edges)
  useEffect(() => {
    if (!hasMoved || !fabButtonRef.current) return;
    const rect = fabButtonRef.current.getBoundingClientRect();
    const spaceTop = rect.top, spaceBottom = window.innerHeight - rect.bottom;
    const spaceLeft = rect.left, spaceRight = window.innerWidth - rect.right;
    if (spaceTop >= 60) setTooltipPosition('top');
    else if (spaceRight >= 200) setTooltipPosition('right');
    else if (spaceLeft >= 200) setTooltipPosition('left');
    else setTooltipPosition('bottom');
  }, [fabPosition, hasMoved]);

  const simulateTyping = async (text) => {
    const msg = { id: Date.now() + 1 + '', role: 'assistant', content: '', ts: new Date(), feedback: null };
    setMessages(prev => [...prev, msg]);
    await new Promise(r => setTimeout(r, 800));
    const chunks = [];
    for (let i = 0; i < text.length; i += 15) chunks.push(text.slice(i, i + 15));
    let full = '';
    for (const chunk of chunks) {
      full += chunk;
      const snap = full;
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, content: snap } : m));
      await new Promise(r => setTimeout(r, 50));
    }
    setIsTyping(false);
  };

  const sendMessage = async (text) => {
    const t = (text ?? input).trim();
    if (!t) return;
    setMessages(prev => [...prev, { id: Date.now() + '', role: 'user', content: t, ts: new Date() }]);
    setInput('');
    if (viewState !== 'chat') setViewState('chat');
    setIsTyping(true);
    await simulateTyping(generateResponse(t));
  };

  const handleCreateCampaign = () => {
    setViewState('thinking');
    setTimeout(() => setViewState('campaign-form'), 1500);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const handleFeedback = (id, val) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, feedback: m.feedback === val ? null : val } : m));
  };

  if (!isOpen) {
    const fabStyle = hasMoved
      ? { position: 'fixed', top: fabPosition.y, left: fabPosition.x, zIndex: 9999, cursor: isDragging ? 'grabbing' : 'grab' }
      : { position: 'fixed', bottom: 32, right: 32, zIndex: 9999, cursor: 'grab' };

    return (
      <div style={fabStyle}>
        <button
          ref={fabButtonRef}
          onMouseDown={(e) => {
            e.preventDefault();
            setIsDragging(true);
            isDraggingRef.current = false;
            const rect = e.currentTarget.getBoundingClientRect();
            setDragStart({ x: rect.width / 2, y: rect.height / 2 });
            setDragStartPos({ x: e.clientX, y: e.clientY });
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (!isDraggingRef.current) setIsOpen(true);
            setTimeout(() => { isDraggingRef.current = false; }, 100);
          }}
          className={`inline-flex p-0.5 justify-end items-center gap-2 rounded-full shadow-[0_-1px_3px_0_rgba(0,0,0,0.10),0_3px_5px_2px_rgba(0,0,0,0.15)] relative group transition-all duration-200 ease-out ${
            hasMoved ? 'overflow-visible' : 'overflow-hidden'
          }`}
          aria-label="Ask Marty"
        >
          {/* Gradient border background */}
          <div
            className="absolute inset-0 rounded-full"
            style={{ background: 'linear-gradient(134deg, #993EF4 10.5%, #4DBDF5 71.77%, #00D0CD 102.41%)' }}
          />

          {/* Content wrapper */}
          <div className={`flex items-center rounded-full bg-white relative z-10 transition-all duration-200 ease-out ${
            hasMoved ? 'w-[50px] h-[50px] justify-center p-0' : 'gap-2 py-2 pl-2 pr-4'
          }`}>
            {/* Mascot with eye tracking */}
            <div className={`flex justify-center items-center rounded-full bg-white shrink-0 relative ${
              hasMoved ? 'w-[50px] h-[50px]' : 'w-[38px] h-[38px] overflow-hidden'
            }`}>
              <div className={`rounded-full w-full h-full flex items-center justify-center ${hasMoved ? '' : 'overflow-hidden'}`}>
                <div style={{
                  width: hasMoved ? 42 : 38,
                  height: hasMoved ? 42 : 38,
                  transform: `translate(${eyePosition.x}px, ${eyePosition.y}px)`,
                  transition: 'transform 0.1s ease-out',
                  flexShrink: 0,
                }}>
                    <MartyBlob size={hasMoved ? 42 : 38} />
                </div>
              </div>

              {/* Speech bubble tooltip (when dragged) */}
              {hasMoved && (
                <div className={`absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-[60] ${
                  tooltipPosition === 'top'    ? '-top-16 left-1/2 -translate-x-1/2' :
                  tooltipPosition === 'right'  ? 'top-1/2 -translate-y-1/2 -right-52' :
                  tooltipPosition === 'left'   ? 'top-1/2 -translate-y-1/2 -left-52'  :
                  'top-full left-1/2 -translate-x-1/2 mt-2'
                }`}>
                  <div className="bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.15)] px-3 py-2 relative whitespace-nowrap">
                    <span className="text-sm text-slate-900 font-normal">I have something to show you</span>
                    {tooltipPosition === 'top' && <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-white drop-shadow-sm" />}
                    {tooltipPosition === 'right' && <div className="absolute top-1/2 -translate-y-1/2 -left-2 w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-r-[8px] border-r-white drop-shadow-sm" />}
                    {tooltipPosition === 'left' && <div className="absolute top-1/2 -translate-y-1/2 -right-2 w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-l-[8px] border-l-white drop-shadow-sm" />}
                    {tooltipPosition === 'bottom' && <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-white drop-shadow-sm" />}
                  </div>
                </div>
              )}
            </div>

            {/* Text — slides in on hover */}
            <div className={`text-slate-900 text-right text-base leading-6 whitespace-nowrap flex items-center gap-0.5 transition-all duration-200 ease-out ${
              hasMoved ? 'max-w-0 opacity-0 group-hover:max-w-[200px] group-hover:opacity-100 overflow-hidden' : ''
            }`}>
              {!hasMoved ? (
                <>
                  <span className="inline-block max-w-0 opacity-0 group-hover:max-w-[150px] group-hover:opacity-100 font-normal overflow-hidden transition-all duration-200 ease-out">Have a question?&nbsp;</span>
                  <span className="font-bold">Ask Marty</span>
                </>
              ) : (
                <span className="font-normal whitespace-nowrap">Have a question? <span className="font-bold">Ask Marty</span></span>
              )}
            </div>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div
      className="fixed bottom-0 right-4 z-[9999] flex flex-col bg-white border border-slate-200 rounded-t-xl"
      style={{
        width: 425, height: 652,
        boxShadow: '0 -1px 4px 0 rgba(0,0,0,0.10), 0 5px 10px 3px rgba(0,0,0,0.15)',
        animation: 'slideUpPanel 0.25s ease-out',
      }}
    >
      <style>{`@keyframes slideUpPanel { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 shrink-0 rounded-t-xl" style={{ height: 60 }}>
        {viewState === 'campaign-form' ? (
          <div className="flex items-center gap-3">
            <button onClick={() => setViewState('welcome')} className="p-1 rounded text-slate-500 hover:bg-slate-100">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M19 12H5M5 12L11 18M5 12L11 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <span className="font-bold text-lg text-slate-900">Create campaign</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <MartyOrb size={24} />
            <span className="font-bold text-lg text-slate-900">Marty</span>
            <span className="text-[10px] font-medium border border-slate-400 text-slate-500 px-1.5 py-0.5 rounded leading-4">Beta</span>
          </div>
        )}
        <div className="flex items-center gap-3">
          <button className="p-1.5 rounded text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Reports">
            <BarChart2 size={18} />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Minimize"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M6 18L18 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">

        {/* Welcome view */}
        {viewState === 'welcome' && (
          <div className="flex flex-col gap-6 px-4 pt-4 pb-0">
            <div className="flex flex-col gap-4">
              <h2 className="text-[32px] font-bold leading-10 text-slate-900">Hi, Gabriela</h2>
              <p className="text-sm text-slate-700 leading-5">I'm your smart assistant, here to help you launch campaigns, get insights and find answers. What can I help you with today?</p>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={handleCreateCampaign}
                className="w-full text-left px-4 py-2.5 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-sm font-medium text-slate-700 transition-colors"
              >
                Create a campaign
              </button>
              <button
                onClick={() => sendMessage('Help & FAQs')}
                className="w-full text-left px-4 py-2.5 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-sm font-medium text-slate-700 transition-colors"
              >
                Help &amp; FAQs
              </button>
            </div>
          </div>
        )}

        {/* Thinking view */}
        {viewState === 'thinking' && (
          <div className="flex flex-col gap-6 px-4 pt-6">
            <div className="flex w-full pl-20 flex-col items-end gap-1">
              <p className="text-sm text-slate-700 leading-5">Create a campaign</p>
            </div>
            <div className="flex items-center gap-1.5 py-1">
              <span className="text-sm leading-5" style={{ background: 'linear-gradient(90deg, #993EF4, #4DBDF5, #00D0CD)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Thinking…
              </span>
            </div>
          </div>
        )}

        {/* Campaign form view */}
        {viewState === 'campaign-form' && (
          <div className="flex flex-col gap-4 px-4 py-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-900 leading-4">Campaign type</label>
              <div className="flex h-10 items-center rounded border border-slate-300 px-3">
                <span className="text-sm text-slate-700">Sponsored Products Automatic</span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-900 leading-4">Campaign name</label>
              <input
                defaultValue="Free Rein Coffee Campaign Fall 2025"
                className="h-10 rounded border border-slate-300 px-3 text-sm text-slate-700 outline-none focus:border-[#0053E2]"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-900 leading-4">Start date (mm/dd/yyyy)</label>
              <input
                defaultValue="10/01/2025"
                className="h-10 rounded border border-slate-300 px-3 text-sm text-slate-700 outline-none focus:border-[#0053E2]"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-900 leading-4">Daily budget ($)</label>
              <input
                value={dailyBudget}
                onChange={e => setDailyBudget(e.target.value)}
                placeholder="e.g. 50.00"
                className="h-10 rounded border border-slate-300 px-3 text-sm text-slate-700 outline-none focus:border-[#0053E2] placeholder-slate-400"
              />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-xs font-bold text-slate-900 leading-4">Items</p>
              <p className="text-sm text-slate-500">Your recommended items</p>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-base font-bold text-slate-900">Additional settings</span>
              <ChevronDown size={20} className="text-slate-500" />
            </div>
            <p className="text-xs text-slate-400 text-center">Click "Save and review" to view item list and all campaign creation options</p>
          </div>
        )}

        {/* Chat view */}
        {viewState === 'chat' && (
          <div className="flex flex-col gap-3 px-4 py-4">
            {messages.map(msg => (
              <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && <div className="shrink-0 mt-1"><MartyOrb size={24} /></div>}
                <div className="flex flex-col gap-1 max-w-[80%]">
                  <div className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[#0053E2] text-white rounded-br-sm'
                      : 'bg-slate-100 text-slate-900 rounded-bl-sm'
                  }`}>
                    {msg.content.split('\n').map((line, i) => (
                      <p key={i} className={i > 0 ? 'mt-1' : ''}>{line}</p>
                    ))}
                  </div>
                  {msg.role === 'assistant' && msg.content && (
                    <div className="flex items-center gap-1 pl-1">
                      <button onClick={() => handleFeedback(msg.id, 'up')} className={`p-1 rounded ${msg.feedback === 'up' ? 'text-green-600' : 'text-slate-300 hover:text-slate-500'}`}><ThumbsUp size={12} /></button>
                      <button onClick={() => handleFeedback(msg.id, 'down')} className={`p-1 rounded ${msg.feedback === 'down' ? 'text-red-500' : 'text-slate-300 hover:text-slate-500'}`}><ThumbsDown size={12} /></button>
                    </div>
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className="shrink-0 mt-1 w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">G</div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-2">
                <div className="shrink-0 mt-1"><MartyOrb size={24} /></div>
                <div className="bg-slate-100 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
                  <style>{`@keyframes martybounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-5px)}}`}</style>
                  {[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 bg-slate-400 rounded-full" style={{ animation: `martybounce 1s infinite ${i*0.2}s` }} />)}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Footer */}
      {viewState === 'campaign-form' ? (
        <div className="border-t border-slate-200 px-4 py-4 shrink-0 flex justify-end gap-3">
          <button className="px-4 py-2 rounded-full border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50">Save and review</button>
          <button className="px-4 py-2 rounded-full bg-[#0053E2] text-white text-sm font-semibold hover:bg-[#114AB6]">Launch campaign</button>
        </div>
      ) : (
        <div className="border-t border-slate-200 px-4 py-4 shrink-0 flex flex-col gap-3">
          <div className="flex items-end gap-3 rounded-lg border border-slate-200 px-3 py-2" style={{ boxShadow: '0 -1px 3px 0 rgba(0,0,0,0.10), 0 3px 5px 2px rgba(0,0,0,0.15)' }}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="How can I help?"
              rows={1}
              className="flex-1 bg-transparent text-sm text-slate-800 outline-none resize-none placeholder-slate-400 leading-5"
              style={{ minHeight: 20, maxHeight: 120 }}
            />
            {isTyping ? (
              <button onClick={() => setIsTyping(false)} className="shrink-0 w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-300">
                <Square size={12} />
              </button>
            ) : (
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim()}
                className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center disabled:bg-slate-200 disabled:text-slate-400 bg-[#0053E2] text-white hover:bg-[#114AB6] disabled:cursor-not-allowed transition-colors"
              >
                <Send size={13} />
              </button>
            )}
          </div>
          <p className="text-xs text-slate-400 text-center leading-4">
            I'm powered by AI and can make mistakes. Don't share sensitive info.{' '}
            <span className="underline cursor-pointer">Disclaimer</span>
          </p>
        </div>
      )}
    </div>
  );
}
