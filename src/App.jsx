import { useState, useMemo, useCallback } from 'react'
import './App.css'

// Icons
const HomeIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
const CampaignIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
const CalendarIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"/></svg>
const ReportIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/></svg>
const SettingsIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>
const LockIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
const FlashIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M7 2v11h3v9l7-12h-4l4-8z"/></svg>
const RefreshIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>
const SearchIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
const DownloadIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
const UploadIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5z"/></svg>
const EyeIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
const CloseIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
const EditIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
const DeleteIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
const InfoIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>

const navItems = [
  { icon: HomeIcon, label: 'Home' },
  { icon: CampaignIcon, label: 'Campaigns' },
  { icon: ReportIcon, label: 'Reports' },
  { icon: CalendarIcon, label: 'Inventory Calendar', active: true },
  { icon: SettingsIcon, label: 'Settings' },
]

// Generate 50 DMAs for RON logic
const dmas = [
  { id: 1, name: 'New York, NY', code: 'DMA 501' },
  { id: 2, name: 'Los Angeles, CA', code: 'DMA 803' },
  { id: 3, name: 'Chicago, IL', code: 'DMA 602' },
  { id: 4, name: 'Philadelphia, PA', code: 'DMA 504' },
  { id: 5, name: 'Dallas-Ft. Worth, TX', code: 'DMA 623' },
  { id: 6, name: 'San Francisco, CA', code: 'DMA 807' },
  { id: 7, name: 'Boston, MA', code: 'DMA 506' },
  { id: 8, name: 'Atlanta, GA', code: 'DMA 524' },
  { id: 9, name: 'Washington, DC', code: 'DMA 511' },
  { id: 10, name: 'Houston, TX', code: 'DMA 618' },
  { id: 11, name: 'Detroit, MI', code: 'DMA 505' },
  { id: 12, name: 'Phoenix, AZ', code: 'DMA 753' },
  { id: 13, name: 'Seattle, WA', code: 'DMA 819' },
  { id: 14, name: 'Tampa, FL', code: 'DMA 539' },
  { id: 15, name: 'Minneapolis, MN', code: 'DMA 613' },
]

const advertisers = ['Pepsi-Cola', 'Microsoft', 'Netflix', 'Johnson & Johnson', 'Adidas', 'Nike', 'HP', 'Spotify', 'Dell', 'Amazon', 'Apple', 'Samsung']
const managers = ['Sarah Chen', 'Mike Johnson', 'Emily Davis', 'James Wilson', 'Lisa Park']

const generateWeeks = () => {
  const weeks = []
  const start = new Date('2026-01-05')
  for (let i = 0; i < 52; i++) {
    const weekStart = new Date(start)
    weekStart.setDate(start.getDate() + i * 7)
    weeks.push({
      id: i + 1,
      label: `W${i + 1}`,
      date: weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    })
  }
  return weeks
}

const weeks = generateWeeks()

// Status definitions with colors (matching Figma spec)
const STATUS = {
  BOOKED: 'Booked',
  IO_IN_PROGRESS: 'IO in progress',
  INTEREST: 'Interest',
  AVAILABLE: 'Available',
}

const statusColors = {
  [STATUS.BOOKED]: { bg: '#ffe4e6', text: '#be123c', border: '#fda4af' }, // Rose
  [STATUS.IO_IN_PROGRESS]: { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' }, // Amber
  [STATUS.INTEREST]: { bg: '#dcfce7', text: '#166534', border: '#86efac' }, // Green
  [STATUS.AVAILABLE]: { bg: '#f8fafc', text: '#64748b', border: '#e2e8f0' }, // Gray
}

// Generate slots with dynamic density (higher for weeks 1-20)
const generateSlots = () => {
  const slots = {}
  dmas.forEach((dma) => {
    slots[dma.id] = {}
    weeks.forEach((week) => {
      // Dynamic density: ~40% for weeks 1-20, ~20% for later weeks
      const density = week.id <= 20 ? 0.4 : 0.2
      if (Math.random() < density) {
        const advertiser = advertisers[Math.floor(Math.random() * advertisers.length)]
        const manager = managers[Math.floor(Math.random() * managers.length)]
        
        // Status distribution
        const rand = Math.random()
        let status
        if (rand < 0.35) status = STATUS.BOOKED
        else if (rand < 0.55) status = STATUS.IO_IN_PROGRESS
        else if (rand < 0.75) status = STATUS.INTEREST
        else status = STATUS.AVAILABLE

        // Hidden depth: 70% of booked slots have multiple interests
        const interests = []
        if (status === STATUS.BOOKED && Math.random() < 0.7) {
          const numInterests = Math.floor(Math.random() * 3) + 1
          for (let i = 0; i < numInterests; i++) {
            interests.push({
              advertiser: advertisers[Math.floor(Math.random() * advertisers.length)],
              status: Math.random() > 0.5 ? STATUS.IO_IN_PROGRESS : STATUS.INTEREST,
            })
          }
        }

        slots[dma.id][week.id] = {
          advertiser,
          status,
          manager,
          interests,
          createdAt: new Date(2026, 0, 1 + Math.floor(Math.random() * 90)).toLocaleDateString(),
        }
      }
    })
  })
  return slots
}

const initialSlots = generateSlots()

// View filter options
const VIEW_FILTERS = {
  ALL: 'All DMAs',
  SELECTED: 'Selected only',
  AVAILABLE: 'Available only',
  UNAVAILABLE: 'Unavailable only',
}

export default function App() {
  const [query, setQuery] = useState('')
  const [viewFilter, setViewFilter] = useState(VIEW_FILTERS.ALL)
  const [viewFilterOpen, setViewFilterOpen] = useState(false)
  const [selectedDmas, setSelectedDmas] = useState([])
  const [hoveredCell, setHoveredCell] = useState(null)
  const [slots] = useState(initialSlots)
  
  // Selection state for week range
  const [selectionStart, setSelectionStart] = useState(null) // { dmaId, weekId }
  const [selectionEnd, setSelectionEnd] = useState(null)
  const [selectedRange, setSelectedRange] = useState(null) // { dmaIds: [], weekRange: [min, max] }
  
  // Detail modal
  const [detailModal, setDetailModal] = useState(null)
  const [actionTooltip, setActionTooltip] = useState(null)

  // Current user (for permission logic)
  const currentUser = 'Liz Harper'

  // Calculate the normalized week range [min, max]
  const getWeekRange = useCallback((start, end) => {
    if (!start || !end) return null
    const min = Math.min(start, end)
    const max = Math.max(start, end)
    return [min, max]
  }, [])

  // Check if a range has any booked slots that block selection
  const isRangeBlocked = useCallback((dmaId, weekMin, weekMax) => {
    for (let w = weekMin; w <= weekMax; w++) {
      const slot = slots[dmaId]?.[w]
      if (slot?.status === STATUS.BOOKED) {
        return true
      }
    }
    return false
  }, [slots])

  // Check if any DMA in a group has blocked range
  const isGroupRangeBlocked = useCallback((dmaIds, weekMin, weekMax) => {
    return dmaIds.some(dmaId => isRangeBlocked(dmaId, weekMin, weekMax))
  }, [isRangeBlocked])

  // Handle cell click for range selection
  const handleCellClick = useCallback((dmaId, weekId) => {
    const slot = slots[dmaId]?.[weekId]
    
    // If booked, show detail but don't allow selection
    if (slot?.status === STATUS.BOOKED) {
      setDetailModal({ dmaId, weekId, slot })
      return
    }

    // If clicking on IO in progress or Interest, can view details
    if (slot && (slot.status === STATUS.IO_IN_PROGRESS || slot.status === STATUS.INTEREST)) {
      setDetailModal({ dmaId, weekId, slot })
    }

    // Selection logic
    if (!selectionStart) {
      // First click: set start
      setSelectionStart({ dmaId, weekId })
      setSelectionEnd(null)
      setSelectedRange(null)
      // Auto-select this DMA
      if (!selectedDmas.includes(dmaId)) {
        setSelectedDmas([dmaId])
      }
    } else {
      // Second click: set end and create range
      const weekRange = getWeekRange(selectionStart.weekId, weekId)
      const dmaIds = selectedDmas.length > 0 ? selectedDmas : [selectionStart.dmaId]
      
      // Check if range is blocked for any selected DMA
      if (isGroupRangeBlocked(dmaIds, weekRange[0], weekRange[1])) {
        // Show blocked feedback
        setSelectionStart(null)
        setSelectionEnd(null)
        setSelectedRange(null)
        return
      }

      setSelectionEnd({ dmaId: selectionStart.dmaId, weekId })
      setSelectedRange({
        dmaIds,
        weekRange,
      })
    }
  }, [selectionStart, selectedDmas, slots, getWeekRange, isGroupRangeBlocked])

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectionStart(null)
    setSelectionEnd(null)
    setSelectedRange(null)
  }, [])

  // Check if a cell is in the selected range
  const isCellSelected = useCallback((dmaId, weekId) => {
    if (!selectedRange) return false
    const { dmaIds, weekRange } = selectedRange
    return dmaIds.includes(dmaId) && weekId >= weekRange[0] && weekId <= weekRange[1]
  }, [selectedRange])

  // Check if a cell is in the pending selection (between start and hover)
  const isCellInPendingSelection = useCallback((dmaId, weekId) => {
    if (!selectionStart || selectedRange) return false
    if (hoveredCell) {
      const range = getWeekRange(selectionStart.weekId, hoveredCell.week)
      if (!range) return false
      const dmaIds = selectedDmas.length > 0 ? selectedDmas : [selectionStart.dmaId]
      return dmaIds.includes(dmaId) && weekId >= range[0] && weekId <= range[1]
    }
    return selectionStart.dmaId === dmaId && selectionStart.weekId === weekId
  }, [selectionStart, selectedRange, hoveredCell, selectedDmas, getWeekRange])

  // Check if week header should show unavailable state
  const isWeekUnavailable = useCallback((weekId) => {
    if (selectedDmas.length === 0) return false
    return selectedDmas.every(dmaId => {
      const slot = slots[dmaId]?.[weekId]
      return slot?.status === STATUS.BOOKED
    })
  }, [selectedDmas, slots])

  // Check if DMA row should show unavailable state
  const isDmaUnavailable = useCallback((dmaId) => {
    if (!selectedRange) return false
    const { weekRange } = selectedRange
    return isRangeBlocked(dmaId, weekRange[0], weekRange[1])
  }, [selectedRange, isRangeBlocked])

  // Check if this is RON (Run of Network)
  const isRON = useMemo(() => {
    return selectedDmas.length === dmas.length && selectedRange !== null
  }, [selectedDmas, selectedRange])

  // Filter DMAs based on view filter
  const filteredDmas = useMemo(() => {
    let filtered = dmas.filter((dma) => 
      dma.name.toLowerCase().includes(query.toLowerCase())
    )

    switch (viewFilter) {
      case VIEW_FILTERS.SELECTED:
        filtered = filtered.filter(dma => selectedDmas.includes(dma.id))
        break
      case VIEW_FILTERS.AVAILABLE:
        filtered = filtered.filter(dma => {
          if (!selectedRange) return true
          return !isRangeBlocked(dma.id, selectedRange.weekRange[0], selectedRange.weekRange[1])
        })
        break
      case VIEW_FILTERS.UNAVAILABLE:
        filtered = filtered.filter(dma => {
          if (!selectedRange) return false
          return isRangeBlocked(dma.id, selectedRange.weekRange[0], selectedRange.weekRange[1])
        })
        break
      default:
        break
    }

    return filtered
  }, [query, viewFilter, selectedDmas, selectedRange, isRangeBlocked])

  const toggleDma = (id) => {
    setSelectedDmas((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    )
    // Clear range when changing DMA selection
    clearSelection()
  }

  const toggleAll = () => {
    if (selectedDmas.length === dmas.length) {
      setSelectedDmas([])
    } else {
      setSelectedDmas(dmas.map((d) => d.id))
    }
    clearSelection()
  }

  const getSlotIcon = (slot) => {
    if (slot.status === STATUS.BOOKED) return <LockIcon />
    if (slot.status === STATUS.IO_IN_PROGRESS) return <FlashIcon />
    return <RefreshIcon />
  }

  // Handle action click with permission check
  const handleActionClick = (action, slot) => {
    if (slot.manager !== currentUser) {
      setActionTooltip(action)
      setTimeout(() => setActionTooltip(null), 2000)
    } else {
      // Execute action
      console.log(`Executing ${action} for slot`)
      setDetailModal(null)
    }
  }

  // Visible weeks (show 12 at a time, can scroll)
  const [weekOffset, setWeekOffset] = useState(0)
  const visibleWeeks = weeks.slice(weekOffset, weekOffset + 12)

  return (
    <div className="app-shell">
      {/* Top Navbar */}
      <header className="top-navbar">
        <div className="navbar-brand">
          <span className="walmart-logo">Walmart</span>
          <span className="divider">|</span>
          <span>Ad Center</span>
        </div>
        <div className="navbar-actions">
          <button className="navbar-btn">Help</button>
          <div className="avatar">LH</div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="main-layout">
        {/* Left Nav */}
        <aside className="side-nav">
          {navItems.map((item, index) => (
            <button
              key={index}
              className={`nav-icon ${item.active ? 'active' : ''}`}
              title={item.label}
            >
              <item.icon />
            </button>
          ))}
        </aside>

        {/* Content */}
        <main className="content">
          {/* Page Header */}
          <div className="page-header">
            <h1>Inventory Calendar</h1>
            {isRON && (
              <span className="ron-badge">RON (Run of Network)</span>
            )}
          </div>

          {/* Toolbar */}
          <div className="toolbar">
            <div className="toolbar-left">
              <div className="search-box">
                <SearchIcon />
                <input
                  type="text"
                  placeholder="Search DMAs..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>

              {/* View DMA by filter */}
              <div className="filter-dropdown">
                <button 
                  className="filter-btn"
                  onClick={() => setViewFilterOpen(!viewFilterOpen)}
                >
                  {viewFilter}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7 10l5 5 5-5z" />
                  </svg>
                </button>
                {viewFilterOpen && (
                  <div className="filter-menu">
                    {Object.values(VIEW_FILTERS).map((filter) => (
                      <button
                        key={filter}
                        className={`filter-option ${viewFilter === filter ? 'active' : ''}`}
                        onClick={() => {
                          setViewFilter(filter)
                          setViewFilterOpen(false)
                        }}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button className="filter-btn">
                52 running weeks
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 10l5 5 5-5z" />
                </svg>
              </button>

              <button className="icon-btn"><DownloadIcon /></button>
              <button className="icon-btn"><UploadIcon /></button>
            </div>

            <div className="toolbar-right">
              {selectedRange && (
                <button className="secondary-btn" onClick={clearSelection}>
                  Clear Selection
                </button>
              )}
              <button className="primary-btn">+ Add Inventory</button>
            </div>
          </div>

          {/* Status Legend */}
          <div className="status-legend">
            {Object.entries(statusColors).map(([status, colors]) => (
              <span
                key={status}
                className="status-badge"
                style={{
                  backgroundColor: colors.bg,
                  color: colors.text,
                  borderColor: colors.border,
                }}
              >
                {status}
              </span>
            ))}

            <div className="legend-spacer" />

            {selectedDmas.length > 0 && (
              <>
                <span className="selection-info">
                  {selectedDmas.length} DMA{selectedDmas.length > 1 ? 's' : ''} selected
                </span>
                {selectedRange && (
                  <span className="selection-info">
                    W{selectedRange.weekRange[0]} - W{selectedRange.weekRange[1]}
                  </span>
                )}
              </>
            )}
          </div>

          {/* Week Navigation */}
          <div className="week-navigation">
            <button 
              className="nav-arrow"
              disabled={weekOffset === 0}
              onClick={() => setWeekOffset(Math.max(0, weekOffset - 4))}
            >
              ← Earlier
            </button>
            <span className="week-range-label">
              Showing W{weekOffset + 1} - W{Math.min(weekOffset + 12, 52)}
            </span>
            <button 
              className="nav-arrow"
              disabled={weekOffset >= 40}
              onClick={() => setWeekOffset(Math.min(40, weekOffset + 4))}
            >
              Later →
            </button>
          </div>

          {/* Data Table */}
          <div className="table-container">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th className="sticky-col col-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedDmas.length === dmas.length}
                      onChange={toggleAll}
                    />
                  </th>
                  <th className="sticky-col col-dma">
                    <div className="dma-header">
                      <span>All DMAs</span>
                      <span className="dma-badge">{dmas.length}</span>
                      <EyeIcon />
                    </div>
                  </th>
                  {visibleWeeks.map((week) => {
                    const unavailable = isWeekUnavailable(week.id)
                    return (
                      <th 
                        key={week.id} 
                        className={`col-week ${unavailable ? 'unavailable' : ''}`}
                      >
                        <div className="week-header">
                          {unavailable && <LockIcon />}
                          <span className="week-label">{week.label}</span>
                          <span className="week-date">{week.date}</span>
                        </div>
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                {filteredDmas.map((dma) => {
                  const rowUnavailable = isDmaUnavailable(dma.id)
                  return (
                    <tr key={dma.id} className={rowUnavailable ? 'row-unavailable' : ''}>
                      <td className="sticky-col col-checkbox">
                        <input
                          type="checkbox"
                          checked={selectedDmas.includes(dma.id)}
                          onChange={() => toggleDma(dma.id)}
                        />
                      </td>
                      <td className={`sticky-col col-dma ${rowUnavailable ? 'unavailable' : ''}`}>
                        <div className="dma-cell">
                          {rowUnavailable && <LockIcon />}
                          <div>
                            <span className="dma-name">{dma.name}</span>
                            <span className="dma-code">{dma.code}</span>
                          </div>
                        </div>
                      </td>
                      {visibleWeeks.map((week) => {
                        const slot = slots[dma.id]?.[week.id]
                        const isHovered = hoveredCell?.dma === dma.id && hoveredCell?.week === week.id
                        const isSelected = isCellSelected(dma.id, week.id)
                        const isPending = isCellInPendingSelection(dma.id, week.id)
                        const isBooked = slot?.status === STATUS.BOOKED

                        return (
                          <td
                            key={week.id}
                            className={`
                              col-week slot-cell 
                              ${slot ? `has-slot status-${slot.status.toLowerCase().replace(/\s+/g, '-')}` : ''} 
                              ${isHovered ? 'hovered' : ''} 
                              ${isSelected ? 'selected' : ''} 
                              ${isPending ? 'pending' : ''}
                              ${isBooked ? 'booked' : ''}
                            `}
                            onClick={() => handleCellClick(dma.id, week.id)}
                            onMouseEnter={() => setHoveredCell({ dma: dma.id, week: week.id })}
                            onMouseLeave={() => setHoveredCell(null)}
                          >
                            {slot && (
                              <div className="slot-content">
                                <span className="slot-icon">{getSlotIcon(slot)}</span>
                                <span className="slot-advertiser">{slot.advertiser}</span>
                                {slot.interests?.length > 0 && (
                                  <span className="interest-count">+{slot.interests.length}</span>
                                )}
                              </div>
                            )}
                            {isHovered && slot && (
                              <div className="tooltip">
                                <div className="tooltip-row">
                                  <strong>{slot.advertiser}</strong>
                                </div>
                                <div className="tooltip-row">
                                  Status:{' '}
                                  <span style={{ color: statusColors[slot.status].text }}>
                                    {slot.status}
                                  </span>
                                </div>
                                <div className="tooltip-row">Manager: {slot.manager}</div>
                                {slot.interests?.length > 0 && (
                                  <div className="tooltip-row">
                                    +{slot.interests.length} additional interest{slot.interests.length > 1 ? 's' : ''}
                                  </div>
                                )}
                                {isBooked && (
                                  <div className="tooltip-row tooltip-warning">
                                    <LockIcon /> Booked - Cannot select
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Instructions */}
          <div className="instructions">
            <InfoIcon />
            <span>Click a cell to start selection, then click another cell in the same row to select a week range. Booked slots (rose) cannot be selected.</span>
          </div>
        </main>
      </div>

      {/* Detail Modal */}
      {detailModal && (
        <>
          <div className="modal-backdrop" onClick={() => setDetailModal(null)} />
          <div className="detail-modal">
            <div className="modal-header">
              <h3>{detailModal.slot.advertiser}</h3>
              <button className="close-btn" onClick={() => setDetailModal(null)}>
                <CloseIcon />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="detail-row">
                <span className="detail-label">Status</span>
                <span 
                  className="detail-value status-chip"
                  style={{
                    backgroundColor: statusColors[detailModal.slot.status].bg,
                    color: statusColors[detailModal.slot.status].text,
                  }}
                >
                  {detailModal.slot.status}
                </span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">DMA</span>
                <span className="detail-value">
                  {dmas.find(d => d.id === detailModal.dmaId)?.name}
                </span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">Week</span>
                <span className="detail-value">
                  {weeks.find(w => w.id === detailModal.weekId)?.label} ({weeks.find(w => w.id === detailModal.weekId)?.date})
                </span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">Campaign Manager</span>
                <span className="detail-value">{detailModal.slot.manager}</span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">Created</span>
                <span className="detail-value">{detailModal.slot.createdAt}</span>
              </div>

              {detailModal.slot.interests?.length > 0 && (
                <div className="interests-section">
                  <h4>Additional Interests ({detailModal.slot.interests.length})</h4>
                  {detailModal.slot.interests.map((interest, idx) => (
                    <div key={idx} className="interest-item">
                      <span>{interest.advertiser}</span>
                      <span 
                        className="status-chip small"
                        style={{
                          backgroundColor: statusColors[interest.status].bg,
                          color: statusColors[interest.status].text,
                        }}
                      >
                        {interest.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-actions">
              <div className="action-btn-wrapper">
                <button 
                  className="action-btn"
                  onClick={() => handleActionClick('Edit', detailModal.slot)}
                >
                  <EditIcon /> Edit
                </button>
                {actionTooltip === 'Edit' && (
                  <div className="permission-tooltip">
                    Only {detailModal.slot.manager} can edit this booking
                  </div>
                )}
              </div>
              
              <div className="action-btn-wrapper">
                <button 
                  className="action-btn danger"
                  onClick={() => handleActionClick('Delete', detailModal.slot)}
                >
                  <DeleteIcon /> Delete
                </button>
                {actionTooltip === 'Delete' && (
                  <div className="permission-tooltip">
                    Only {detailModal.slot.manager} can delete this booking
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}