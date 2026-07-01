// components/ui/FilterFields.tsx
'use client';

import { useState } from 'react';
import DatePicker from 'react-datepicker';
import { startOfMonth, subMonths, format } from 'date-fns';
import 'react-datepicker/dist/react-datepicker.css';
import FilterDropdown from './FilterDropdown';
import { DropdownSection, DropdownDivider } from './Dropdown';

// ── Select filter ─────────────────────────────────────────────────
export function FilterSelect({
  label,
  value,
  onChange,
  options,
  placeholder = 'All',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
  placeholder?: string;
}) {
  return (
    <FilterDropdown
      label={label}
      active={!!value}
      value={value ? options.find((o) => o.value === value)?.label : undefined}>
      {(close: () => void) => (
        <DropdownSection>
          {/* All / reset option */}
          <div
            onClick={() => {
              onChange('');
              close();
            }}
            className="px-3 py-2 f-12-500 text-muted"
            style={{
              cursor: 'pointer',
              background: !value ? 'var(--primary-bg)' : 'transparent',
              color: !value ? 'var(--primary)' : undefined,
            }}
            onMouseEnter={(e) => {
              if (value) (e.currentTarget as HTMLElement).style.background = 'var(--primary-bg)';
            }}
            onMouseLeave={(e) => {
              if (value) (e.currentTarget as HTMLElement).style.background = 'transparent';
            }}>
            {placeholder}
          </div>
          {options.map((o) => (
            <div
              key={o.value}
              onClick={() => {
                onChange(o.value);
                close();
              }}
              className="px-3 py-2 f-12-500"
              style={{
                cursor: 'pointer',
                fontWeight: value === o.value ? 600 : 400,
                color: value === o.value ? 'var(--primary)' : 'var(--text-main)',
                background: value === o.value ? 'var(--primary-bg)' : 'transparent',
              }}
              onMouseEnter={(e) => {
                if (value !== o.value)
                  (e.currentTarget as HTMLElement).style.background = 'var(--primary-bg)';
              }}
              onMouseLeave={(e) => {
                if (value !== o.value)
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}>
              {o.label}
            </div>
          ))}
        </DropdownSection>
      )}
    </FilterDropdown>
  );
}

// ── Amount range filter ───────────────────────────────────────────
export function FilterAmountRange({
  label = 'Amount',
  minVal,
  maxVal,
  onMinChange,
  onMaxChange,
}: {
  label?: string;
  minVal: string;
  maxVal: string;
  onMinChange: (v: string) => void;
  onMaxChange: (v: string) => void;
}) {
  const active = !!minVal || !!maxVal;
  const displayVal = active
    ? minVal && maxVal
      ? `${Number(minVal).toLocaleString()} – ${Number(maxVal).toLocaleString()}`
      : minVal
        ? `≥ ${Number(minVal).toLocaleString()}`
        : `≤ ${Number(maxVal).toLocaleString()}`
    : undefined;

  // local state so we can validate before committing
  const [localMin, setLocalMin] = useState(minVal);
  const [localMax, setLocalMax] = useState(maxVal);
  const [error, setError] = useState('');

  const handleApply = (close: () => void) => {
    const min = Number(localMin);
    const max = Number(localMax);
    if (localMin && localMax && max < min) {
      setError('Upper limit must be ≥ lower limit');
      return;
    }
    setError('');
    onMinChange(localMin);
    onMaxChange(localMax);
    close();
  };

  const handleReset = (close: () => void) => {
    setLocalMin('');
    setLocalMax('');
    setError('');
    onMinChange('');
    onMaxChange('');
    close();
  };

  return (
    <FilterDropdown label={label} active={active} value={displayVal} minWidth={260}>
      {(close: () => void) => (
        <div className="p-3">
          <div
            className="f-12-600 text-muted mb-2 text-uppercase"
            style={{ letterSpacing: '0.05em' }}>
            {label} Range
          </div>

          <div className="d-flex align-items-center gap-2 mb-1">
            <div className="flex-fill">
              <label className="f-12-500 text-muted mb-1 d-block">From</label>
              <input
                type="number"
                min={0}
                className="form-control form-control-sm f-12-500"
                placeholder="Min"
                value={localMin}
                onChange={(e) => {
                  setLocalMin(e.target.value);
                  setError('');
                  // ensure max >= min live
                  if (localMax && Number(e.target.value) > Number(localMax)) {
                    setLocalMax(e.target.value);
                  }
                }}
                style={{ border: '1px solid var(--border-color)' }}
              />
            </div>
            <span className="text-muted f-12-500 mt-3">–</span>
            <div className="flex-fill">
              <label className="f-12-500 text-muted mb-1 d-block">To</label>
              <input
                type="number"
                min={localMin ? Number(localMin) : 0} // ← enforces upper >= lower
                className="form-control form-control-sm f-12-500"
                placeholder="Max"
                value={localMax}
                onChange={(e) => {
                  setError('');
                  setLocalMax(e.target.value);
                }}
                style={{ border: '1px solid var(--border-color)' }}
              />
            </div>
          </div>

          {error && <div className="text-danger f-12-500 mb-2">{error}</div>}

          <div className="d-flex justify-content-end gap-2 mt-2">
            <button
              className="btn btn-sm f-12-500 text-muted general-border rounded"
              onClick={() => handleReset(close)}>
              Reset
            </button>
            <button
              className="btn btn-sm f-12-600 px-3"
              onClick={() => handleApply(close)}
              style={{
                background: 'var(--primary)',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
              }}>
              Apply
            </button>
          </div>
        </div>
      )}
    </FilterDropdown>
  );
}

// ── Date range filter — same UI as OverView ───────────────────────
type Preset = 'this_month' | 'last_3' | 'last_6' | 'custom' | '';

export function FilterDateRange({
  label = 'Date',
  from,
  to,
  onFromChange,
  onToChange,
}: {
  label?: string;
  from: Date | null;
  to: Date | null;
  onFromChange: (d: Date | null) => void;
  onToChange: (d: Date | null) => void;
}) {
  const [preset, setPreset] = useState<Preset>('');
  const [customFrom, setCustomFrom] = useState<Date | null>(from);
  const [customTo, setCustomTo] = useState<Date | null>(to);
  const [showPicker, setShowPicker] = useState(false);

  const active = !!from || !!to;

  const displayVal = !active
    ? undefined
    : preset === 'this_month'
      ? 'This Month'
      : preset === 'last_3'
        ? 'Last 3 Mo'
        : preset === 'last_6'
          ? 'Last 6 Mo'
          : from && to
            ? `${format(from, 'dd MMM')} – ${format(to, 'dd MMM')}`
            : undefined;

  const applyPreset = (p: Preset, close: () => void) => {
    const now = new Date();
    setPreset(p);
    if (p === 'this_month') {
      onFromChange(startOfMonth(now));
      onToChange(now);
      close();
    }
    if (p === 'last_3') {
      onFromChange(subMonths(now, 3));
      onToChange(now);
      close();
    }
    if (p === 'last_6') {
      onFromChange(subMonths(now, 6));
      onToChange(now);
      close();
    }
    if (p === 'custom') {
      setShowPicker(true);
    }
    if (p === '') {
      onFromChange(null);
      onToChange(null);
      setShowPicker(false);
      close();
    }
  };

  const handleRangeChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    setCustomFrom(start);
    setCustomTo(end);
  };

  const handleApplyCustom = (close: () => void) => {
    if (customFrom && customTo) {
      onFromChange(customFrom);
      onToChange(customTo);
      close();
    }
  };

  const PRESETS: { label: string; value: Preset }[] = [
    { label: 'This Month', value: 'this_month' },
    { label: 'Last 3 Months', value: 'last_3' },
    { label: 'Last 6 Months', value: 'last_6' },
    { label: 'Custom Range', value: 'custom' },
  ];

  return (
    <FilterDropdown
      label={label}
      active={active}
      value={displayVal}
      minWidth={showPicker ? 580 : 200}>
      {(close: () => void) => (
        <>
          {/* Preset options */}
          <DropdownSection>
            {/* Reset option */}
            <div
              onClick={() => applyPreset('', close)}
              className="px-3 py-2 f-12-500 text-muted"
              style={{ cursor: 'pointer' }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.background = 'var(--primary-bg)')
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.background = 'transparent')
              }>
              All Time
            </div>
            {PRESETS.map((p) => (
              <div
                key={p.value}
                onClick={() => applyPreset(p.value, close)}
                className="px-3 py-2 f-12-500"
                style={{
                  cursor: 'pointer',
                  fontWeight: preset === p.value ? 600 : 400,
                  color: preset === p.value ? 'var(--primary)' : 'var(--text-main)',
                  background: preset === p.value ? 'var(--primary-bg)' : 'transparent',
                }}
                onMouseEnter={(e) => {
                  if (preset !== p.value)
                    (e.currentTarget as HTMLElement).style.background = 'var(--primary-bg)';
                }}
                onMouseLeave={(e) => {
                  if (preset !== p.value)
                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                }}>
                {p.label}
              </div>
            ))}
          </DropdownSection>

          {/* Custom picker — same 2-month inline as OverView */}
          {showPicker && (
            <>
              <DropdownDivider />
              <div className="p-3">
                {/* Read-only date display */}
                <div className="d-flex align-items-center gap-2 mb-3">
                  <div
                    className="flex-fill text-center general-border rounded px-2 py-1 f-12-500 text-muted"
                    style={{ background: 'var(--primary-bg)' }}>
                    {customFrom ? format(customFrom, 'dd MMM yyyy') : 'Start date'}
                  </div>
                  <span className="text-muted f-12-500">→</span>
                  <div
                    className="flex-fill text-center general-border rounded px-2 py-1 f-12-500 text-muted"
                    style={{ background: 'var(--primary-bg)' }}>
                    {customTo ? format(customTo, 'dd MMM yyyy') : 'End date'}
                  </div>
                </div>

                {/* 2-month inline calendar */}
                <DatePicker
                  selected={customFrom}
                  onChange={handleRangeChange}
                  startDate={customFrom}
                  endDate={customTo}
                  selectsRange
                  inline
                  monthsShown={2}
                />

                <div className="d-flex justify-content-end gap-2 mt-3">
                  <button
                    className="btn btn-sm f-12-500 text-muted general-border rounded"
                    onClick={() => {
                      setCustomFrom(null);
                      setCustomTo(null);
                    }}>
                    Clear
                  </button>
                  <button
                    className="btn btn-sm f-12-600 px-3"
                    disabled={!customFrom || !customTo}
                    onClick={() => handleApplyCustom(close)}
                    style={{
                      background: 'var(--primary)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 6,
                      opacity: !customFrom || !customTo ? 0.5 : 1,
                    }}>
                    Apply
                  </button>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </FilterDropdown>
  );
}
