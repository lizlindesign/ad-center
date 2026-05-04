import { useState, useEffect } from 'react';
import {
  Home,
  Megaphone,
  BarChart2,
  Calendar,
  Users,
  Image,
  ChevronDown,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';

const DEFAULT_MENU_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', Icon: Home },
  {
    id: 'campaigns',
    label: 'Campaigns',
    Icon: Megaphone,
    submenuItems: [
      { id: 'campaigns-all', label: 'All Campaigns' },
      { id: 'campaigns-drafts', label: 'Drafts' },
      { id: 'campaigns-archived', label: 'Archived' },
    ],
  },
  { id: 'reports', label: 'Reports', Icon: BarChart2 },
  {
    id: 'inventory',
    label: 'Inventory',
    Icon: Calendar,
    submenuItems: [
      { id: 'ad-inventory', label: 'Ad inventory' },
      { id: 'inventory-policy', label: 'Inventory Policy' },
      { id: 'inventory-calendar', label: 'Inventory Calendar' },
    ],
  },
  { id: 'asset-library', label: 'Asset Library', Icon: Users },
  { id: 'creative-builder', label: 'Creative Builder', Icon: Image },
];

export function AppSidebar({
  activeMenuItem: controlledActive,
  onMenuItemClick,
  menuItems = DEFAULT_MENU_ITEMS,
  defaultLocked = false,
  variant = 'full',
}) {
  const [internalActive, setInternalActive] = useState('inventory-calendar');
  const activeMenuItem = controlledActive ?? internalActive;

  const [sidebarLocked, setSidebarLocked] = useState(defaultLocked);
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(220);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStartX, setResizeStartX] = useState(0);
  const [resizeStartWidth, setResizeStartWidth] = useState(0);
  const [expandedSubmenus, setExpandedSubmenus] = useState(() => {
    const initial = {};
    menuItems.forEach((item) => {
      if (item.submenuItems?.length > 0) initial[item.id] = true;
    });
    return initial;
  });

  const sidebarExpanded = sidebarLocked || sidebarHovered;

  useEffect(() => {
    if (!isResizing) return;
    const handleMouseMove = (e) => {
      const delta = e.clientX - resizeStartX;
      setSidebarWidth(Math.max(64, Math.min(400, resizeStartWidth + delta)));
    };
    const handleMouseUp = () => setIsResizing(false);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, resizeStartX, resizeStartWidth]);

  const handleToggle = () => {
    if (sidebarLocked) {
      setSidebarLocked(false);
    } else {
      setSidebarLocked(true);
      if (sidebarWidth < 220) setSidebarWidth(220);
    }
  };

  const handleItemClick = (item) => {
    const hasSubmenu = item.submenuItems?.length > 0;
    if (hasSubmenu) {
      if (!sidebarExpanded) {
        onMenuItemClick?.(item.id);
        setInternalActive(item.id);
        return;
      }
      setExpandedSubmenus((prev) => ({ ...prev, [item.id]: !prev[item.id] }));
    } else {
      onMenuItemClick?.(item.id);
      setInternalActive(item.id);
    }
  };

  const renderItem = (item) => {
    const isActive =
      activeMenuItem === item.id ||
      (item.submenuItems?.some((sub) => activeMenuItem === sub.id) ?? false);
    const IconComponent = item.Icon;
    const hasSubmenu = item.submenuItems?.length > 0;
    const isExpanded = expandedSubmenus[item.id] ?? false;

    return (
      <div key={item.id}>
        <button
          onClick={() => handleItemClick(item)}
          aria-label={item.label}
          title={!sidebarExpanded ? item.label : undefined}
          className="flex items-center border-none cursor-pointer transition-colors"
          style={{
            gap: sidebarExpanded ? 12 : undefined,
            paddingLeft: sidebarExpanded ? 12 : undefined,
            paddingRight: sidebarExpanded ? 12 : undefined,
            width: sidebarExpanded ? '100%' : 40,
            justifyContent: sidebarExpanded ? 'space-between' : 'center',
            margin: sidebarExpanded ? undefined : '0 auto',
            height: 36,
            borderRadius: 4,
            backgroundColor: isActive && sidebarExpanded ? '#EFF6FF' : 'transparent',
          }}
          onMouseEnter={(e) => {
            if (!isActive || !sidebarExpanded)
              e.currentTarget.style.backgroundColor = '#F8FAFC';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor =
              isActive && sidebarExpanded ? '#EFF6FF' : 'transparent';
          }}
        >
          <div className="flex items-center" style={{ gap: 12 }}>
            <IconComponent size={16} style={{ color: isActive ? '#1d4ed8' : '#2E2F32' }} />
            {sidebarExpanded && (
              <span
                className="text-sm whitespace-nowrap overflow-hidden text-ellipsis"
                style={{ color: isActive ? '#1d4ed8' : '#2E2F32' }}
              >
                {item.label}
              </span>
            )}
          </div>
          {sidebarExpanded && hasSubmenu && (
            <div
              className="flex items-center"
              style={{
                transform: isExpanded ? 'rotate(180deg)' : 'none',
                transition: 'transform 150ms',
                color: '#2E2F32',
              }}
            >
              <ChevronDown size={16} />
            </div>
          )}
        </button>

        {/* Submenu — expanded sidebar only */}
        {hasSubmenu && isExpanded && sidebarExpanded && (
          <div className="flex flex-col gap-1 mt-1">
            {item.submenuItems.map((subItem) => {
              const isSubActive = activeMenuItem === subItem.id;
              return (
                <button
                  key={subItem.id}
                  onClick={() => { onMenuItemClick?.(subItem.id); setInternalActive(subItem.id); }}
                  aria-label={subItem.label}
                  className="flex items-center border-none cursor-pointer transition-colors"
                  style={{
                    gap: 12,
                    paddingLeft: 48,
                    paddingRight: 12,
                    width: '100%',
                    height: 36,
                    borderRadius: 4,
                    backgroundColor: 'transparent',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F8FAFC'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <svg width="6" height="6" viewBox="0 0 6 6" style={{ flexShrink: 0 }}>
                    {isSubActive ? (
                      <circle cx="3" cy="3" r="3" fill="#1d4ed8" />
                    ) : (
                      <circle cx="3" cy="3" r="2.5" stroke="#2E2F32" strokeWidth="1" fill="none" />
                    )}
                  </svg>
                  <span
                    className="text-sm whitespace-nowrap overflow-hidden text-ellipsis"
                    style={{ color: isSubActive ? '#1d4ed8' : '#2E2F32' }}
                  >
                    {subItem.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  /* ── Compact variant ── */
  if (variant === 'compact') {
    return (
      <nav
        aria-label="Main navigation"
        className="flex flex-col justify-between items-center border-r border-slate-200 bg-white shrink-0 overflow-y-auto"
        style={{ width: 56, padding: '12px 8px' }}
      >
        <div className="flex flex-col items-center gap-1">
          {menuItems.filter(i => !i.bottom).map((item) => {
            const isActive = activeMenuItem === item.id;
            const IconComponent = item.Icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => { onMenuItemClick?.(item.id); setInternalActive(item.id); }}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
                title={item.label}
                className={`w-10 h-10 flex items-center justify-center rounded-lg border-none cursor-pointer transition-colors ${
                  isActive ? 'bg-blue-50 text-blue-700' : 'bg-transparent text-slate-800 hover:bg-slate-100'
                }`}
              >
                <IconComponent size={20} />
              </button>
            );
          })}
        </div>
      </nav>
    );
  }

  /* ── Full variant ── */
  const topItems = menuItems.filter(i => !i.bottom);
  const bottomItems = menuItems.filter(i => i.bottom);

  return (
    <aside
      aria-label="Main navigation"
      className="border-r border-slate-200 bg-white flex flex-col justify-between overflow-hidden relative shrink-0"
      style={{
        padding: 12,
        alignSelf: 'stretch',
        width: sidebarExpanded ? sidebarWidth : 64,
        transition: isResizing ? 'none' : 'width 300ms ease-in-out',
      }}
      onMouseEnter={() => setSidebarHovered(true)}
      onMouseLeave={() => setSidebarHovered(false)}
    >
      {/* Top items */}
      <div className="flex flex-col gap-1">
        {topItems.map(renderItem)}
      </div>

      {/* Bottom section: Creative Builder + toggle */}
      <div className="flex flex-col gap-1">
        {bottomItems.map(renderItem)}

        {bottomItems.length > 0 && sidebarExpanded && <div className="w-full h-px bg-slate-100 my-1" />}

        <button
          onClick={handleToggle}
          aria-label={sidebarLocked ? 'Collapse sidebar' : 'Expand sidebar'}
          aria-expanded={sidebarLocked}
          className="flex items-center border-none cursor-pointer transition-colors text-slate-800"
          style={{
            gap: sidebarExpanded ? 12 : undefined,
            paddingLeft: sidebarExpanded ? 12 : undefined,
            paddingRight: sidebarExpanded ? 12 : undefined,
            width: sidebarExpanded ? '100%' : 40,
            justifyContent: sidebarExpanded ? undefined : 'center',
            margin: sidebarExpanded ? undefined : '0 auto',
            height: 36,
            borderRadius: 4,
            backgroundColor: 'transparent',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F8FAFC'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
          {sidebarExpanded ? (
            <>
              <ArrowLeft size={16} />
              <span className="text-sm whitespace-nowrap overflow-hidden text-ellipsis text-slate-800">
                Lock sidebar
              </span>
            </>
          ) : (
            <ArrowRight size={16} />
          )}
        </button>
      </div>

      {/* Resize handle */}
      {sidebarExpanded && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 4,
            height: '100%',
            cursor: 'col-resize',
            backgroundColor: 'transparent',
            transition: 'background-color 150ms',
            zIndex: 10,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#0053E2'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          onMouseDown={(e) => {
            e.preventDefault();
            setIsResizing(true);
            setResizeStartX(e.clientX);
            setResizeStartWidth(sidebarWidth);
          }}
        />
      )}
    </aside>
  );
}

export default AppSidebar;
