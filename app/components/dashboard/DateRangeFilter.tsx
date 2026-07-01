// components/dashboard/DateRangeFilter.tsx
'use client';

import { useState }                       from 'react';
import DatePicker                          from 'react-datepicker';
import { startOfMonth, subMonths, format } from 'date-fns';
import 'react-datepicker/dist/react-datepicker.css';
import Dropdown, { DropdownSection }       from '@/components/ui/Dropdown';
import type { DateRange }                  from '@/hooks/useDashboardStats';
import { MdCalendarMonth, MdExpandMore }   from 'react-icons/md';

interface Props {
  value:    DateRange;
  onChange: (range: DateRange) => void;
}

type Preset = 'this_month' | 'last_3' | 'last_6' | 'custom';

const PRESETS: { label: string; value: Preset }[] = [
  { label: 'This Month',    value: 'this_month' },
  { label: 'Last 3 Months', value: 'last_3'     },
  { label: 'Last 6 Months', value: 'last_6'     },
];

function presetToRange(preset: Preset): DateRange | null {
  const now = new Date();
  if (preset === 'this_month') return { from: startOfMonth(now), to: now };
  if (preset === 'last_3')     return { from: subMonths(now, 3),  to: now };
  if (preset === 'last_6')     return { from: subMonths(now, 6),  to: now };
  return null;
}

export default function DateRangeFilter({ value, onChange }: Props) {
  const [active,     setActive]     = useState<Preset>('this_month');
  const [customFrom, setCustomFrom] = useState<Date | null>(null);
  const [customTo,   setCustomTo]   = useState<Date | null>(null);

  const handlePreset = (preset: Preset) => {
    setActive(preset);
    const range = presetToRange(preset);
    if (range) onChange(range);
  };

  const handleRangeChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    setCustomFrom(start);
    setCustomTo(end);
  };

  const handleApply = (close: () => void) => {
    if (customFrom && customTo) {
      setActive('custom');
      onChange({ from: customFrom, to: customTo });
      close();
    }
  };

  const customTrigger = (
    <button className="d-flex align-items-center gap-1 general-border rounded-pill px-3 py-1 bg-white"
      style={{
        color:      active === 'custom' ? '#fff'            : 'var(--text-muted)',
        background: active === 'custom' ? 'var(--primary)'  : '#fff',
        fontWeight: active === 'custom' ? 600               : 400,
        fontSize:   '0.78rem',
        border:     'none',
        cursor:     'pointer',
      }}
    >
      <MdCalendarMonth size={13} />
      <span className='text-main fw-12-500'>
      {active === 'custom' && customFrom && customTo
        ? `${format(customFrom, 'dd MMM yy')} – ${format(customTo, 'dd MMM yy')}`
        : 'Custom'
      }
      </span>
      <MdExpandMore size={13} />
    </button>
  );

  return (
    <div className="d-flex align-items-center gap-2 flex-wrap">

      {/* Preset pills */}
      {PRESETS.map(p => (
        <button
          key={p.value}
          onClick={() => handlePreset(p.value)}
          className="rounded-pill px-3 py-1 general-border f-12-500 cursor-pointer border-0"
          style={{
            background: active === p.value ? 'var(--primary)' : '#fff',
            color:      active === p.value ? '#fff'           : 'var(--text-muted)',
            fontWeight: active === p.value ? 600              : 400,
            transition: 'all 0.15s',
          }}
        >
          {p.label}
        </button>
      ))}

      {/* Custom dropdown */}
      <Dropdown trigger={customTrigger} align="right" minWidth={560}>
        {(close: () => void) => (
          <DropdownSection>
            <div className="p-3">

              {/* Read-only date display */}
              <div className="d-flex align-items-center gap-2 mb-3">
                <div className="flex-fill text-center general-border rounded px-2 py-1 f-12-500 text-muted"
                  style={{ background: 'var(--primary-bg)' }}
                >
                  {customFrom ? format(customFrom, 'dd MMM yyyy') : 'Start date'}
                </div>
                <span className="text-muted f-12-500">→</span>
                <div className="flex-fill text-center general-border rounded px-2 py-1 f-12-500 text-muted"
                  style={{ background: 'var(--primary-bg)' }}
                >
                  {customTo ? format(customTo, 'dd MMM yyyy') : 'End date'}
                </div>
              </div>

              {/* 2-month inline range picker */}
              <DatePicker
                selected={customFrom}
                onChange={handleRangeChange}
                startDate={customFrom}
                endDate={customTo}
                selectsRange
                inline
                monthsShown={2}
              />

              {/* Footer */}
              <div className="d-flex justify-content-end align-items-center gap-2 mt-3">
                <button
                  className="btn btn-sm general-border rounded f-12-500 text-muted"
                  onClick={() => { setCustomFrom(null); setCustomTo(null); }}
                >
                  Clear
                </button>
                <button
                  className="btn btn-sm f-12-600"
                  disabled={!customFrom || !customTo}
                  onClick={() => handleApply(close)}
                  style={{
                    background: 'var(--primary)',
                    color:      '#fff',
                    opacity:    !customFrom || !customTo ? 0.5 : 1,
                  }}
                >
                  Apply
                </button>
              </div>

            </div>
          </DropdownSection>
        )}
      </Dropdown>

    </div>
  );
}