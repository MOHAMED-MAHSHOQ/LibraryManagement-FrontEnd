export default function Pagination({ page, totalPages, totalElements, size, onPageChange, onSizeChange }) {

    const pages = []
    const start = Math.max(0, page - 2)
    const end   = Math.min(totalPages - 1, page + 2)
    for (let i = start; i <= end; i++) pages.push(i)

    const btn = (label, onClick, active = false, disabled = false) => (
        <button
            key={label}
            onClick={onClick}
            disabled={disabled}
            style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: active ? '1px solid #4f46e5' : '1px solid #2a2a4e',
                backgroundColor: active ? '#4f46e5' : 'transparent',
                color: disabled ? '#374151' : active ? '#fff' : '#9ca3af',
                fontSize: '12px',
                cursor: disabled ? 'not-allowed' : 'pointer',
                minWidth: '36px',
            }}
        >
            {label}
        </button>
    )

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '16px',
            flexWrap: 'wrap',
            gap: '8px',
        }}>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>
                Showing {page * size + 1}–{Math.min((page + 1) * size, totalElements)} of {totalElements} records
            </div>

            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                {btn('«', () => onPageChange(0),        false, page === 0)}
                {btn('‹', () => onPageChange(page - 1), false, page === 0)}
                {pages.map(p => btn(p + 1, () => onPageChange(p), p === page))}
                {btn('›', () => onPageChange(page + 1), false, page >= totalPages - 1)}
                {btn('»', () => onPageChange(totalPages - 1), false, page >= totalPages - 1)}
            </div>

            <select
                value={size}
                onChange={e => { onSizeChange(Number(e.target.value)); onPageChange(0) }}
                style={{
                    padding: '5px 8px',
                    borderRadius: '6px',
                    border: '1px solid #2a2a4e',
                    backgroundColor: '#1a1a2e',
                    color: '#9ca3af',
                    fontSize: '12px',
                    cursor: 'pointer',
                }}
            >
                {[10, 20, 50, 100].map(n => (
                    <option key={n} value={n}>{n} per page</option>
                ))}
            </select>
        </div>
    )
}