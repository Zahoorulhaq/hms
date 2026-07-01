// components/dashboard/ProfitSummary.tsx

interface ProfitSummaryProps {
  totalRevenue:  number;
  totalExpenses: number;
}

export default function ProfitSummary({ totalRevenue, totalExpenses }: ProfitSummaryProps) {
  const profit    = totalRevenue - totalExpenses;
  const isProfit  = profit >= 0;
  const pct       = totalRevenue > 0
    ? Math.abs((profit / totalRevenue) * 100).toFixed(1)
    : '0.0';

  return (
    <div style={{
      background:   '#fff',
      borderRadius: 12,
      padding:      '20px 24px',
      boxShadow:    'var(--shadow-sm)',
      border:       `1px solid ${isProfit ? 'var(--success)' : 'var(--danger)'}33`,
    }}>
      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500, marginBottom: 8 }}>
        Net Profit / Loss
      </div>

      <div style={{
        fontSize:   '2rem',
        fontWeight: 800,
        color:      isProfit ? 'var(--success)' : 'var(--danger)',
        lineHeight: 1.1,
      }}>
        {isProfit ? '+' : '-'} Rs. {Math.abs(profit).toLocaleString()}
      </div>

      <div style={{
        marginTop:    8,
        fontSize:     '0.78rem',
        color:        isProfit ? 'var(--success)' : 'var(--danger)',
        background:   isProfit ? 'var(--success-bg)' : 'var(--danger-bg)',
        display:      'inline-block',
        padding:      '2px 10px',
        borderRadius: 20,
        fontWeight:   600,
      }}>
        {isProfit ? '▲' : '▼'} {pct}% margin
      </div>

      {/* Bar breakdown */}
      <div style={{ marginTop: 20 }}>
        {[
          { label: 'Revenue',  value: totalRevenue,  color: 'var(--success)' },
          { label: 'Expenses', value: totalExpenses, color: 'var(--danger)'  },
        ].map(row => (
          <div key={row.label} style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 4 }}>
              <span style={{ color: 'var(--text-muted)' }}>{row.label}</span>
              <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                Rs. {row.value.toLocaleString()}
              </span>
            </div>
            <div style={{ height: 6, background: 'var(--border-color)', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{
                height:       '100%',
                width:        `${totalRevenue > 0 ? (row.value / totalRevenue) * 100 : 0}%`,
                background:   row.color,
                borderRadius: 10,
                transition:   'width 0.6s ease',
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}