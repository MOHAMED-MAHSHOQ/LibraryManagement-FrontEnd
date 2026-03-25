import { useState } from 'react'
import { useUnassignedBooks } from '../hooks/useBooks'

const ITEMS_PER_PAGE = 20

export default function UnassignedShelf() {
    const { unassignedBooks, isLoading } = useUnassignedBooks()
    const [page, setPage] = useState(0)
    const [search, setSearch] = useState('')

    const filtered = unassignedBooks.filter(b =>
        b.title.toLowerCase().includes(search.toLowerCase()) ||
        b.author.toLowerCase().includes(search.toLowerCase()) ||
        b.genre.toLowerCase().includes(search.toLowerCase())
    )

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
    const paginated  = filtered.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE)

    const handleSearch = (val) => { setSearch(val); setPage(0) }

    if (isLoading) return (
        <div style={{ color: '#9ca3af', padding: '40px', textAlign: 'center' }}>
            Loading...
        </div>
    )

    return (
        <div>
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '22px', fontWeight: '600', color: '#fff' }}>
                    Unassigned shelf
                </h1>
                <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
                    {filtered.length} books available
                    {search && ` (filtered from ${unassignedBooks.length})`}
                </p>
            </div>

            {/* Search */}
            <input
                type="text"
                placeholder="Search by title, author or genre..."
                value={search}
                onChange={e => handleSearch(e.target.value)}
                style={{
                    width: '100%', padding: '10px 14px', borderRadius: '6px',
                    border: '1px solid #2a2a4e', backgroundColor: '#1a1a2e',
                    color: '#ffffff', fontSize: '13px', marginBottom: '20px', outline: 'none',
                }}
            />

            {filtered.length === 0 ? (
                <div style={{
                    backgroundColor: '#1a1a2e', border: '1px solid #2a2a4e',
                    borderRadius: '10px', padding: '60px', textAlign: 'center',
                    color: '#6b7280', fontSize: '14px',
                }}>
                    {search ? 'No books match your search' : 'All books are currently assigned to students'}
                </div>
            ) : (
                <>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                        gap: '12px',
                        marginBottom: '20px',
                    }}>
                        {paginated.map(book => (
                            <div key={book.id} style={{
                                backgroundColor: '#1a1a2e', border: '1px solid #2a2a4e',
                                borderRadius: '10px', padding: '16px',
                            }}>
                                <div style={{
                                    display: 'flex', justifyContent: 'space-between',
                                    alignItems: 'flex-start', marginBottom: '10px',
                                }}>
                                    <span style={{
                                        fontSize: '10px', padding: '2px 8px',
                                        backgroundColor: '#14532d', color: '#4ade80',
                                        borderRadius: '20px', fontWeight: '500',
                                    }}>Free</span>
                                    <span style={{
                                        fontSize: '10px', padding: '2px 8px',
                                        backgroundColor: '#2a2a4e', color: '#a5b4fc',
                                        borderRadius: '20px',
                                    }}>{book.genre}</span>
                                </div>
                                <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff', marginBottom: '4px', lineHeight: '1.4' }}>
                                    {book.title}
                                </div>
                                <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '8px' }}>
                                    {book.author}
                                </div>
                                <div style={{ fontSize: '11px', color: '#6b7280', fontFamily: 'monospace' }}>
                                    {book.isbn}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                Showing {page * ITEMS_PER_PAGE + 1}–{Math.min((page + 1) * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
                            </div>
                            <div style={{ display: 'flex', gap: '4px' }}>
                                {[
                                    { label: '«', go: 0,            dis: page === 0 },
                                    { label: '‹', go: page - 1,     dis: page === 0 },
                                    { label: '›', go: page + 1,     dis: page >= totalPages - 1 },
                                    { label: '»', go: totalPages-1, dis: page >= totalPages - 1 },
                                ].map(({ label, go, dis }) => (
                                    <button key={label} onClick={() => setPage(go)} disabled={dis} style={{
                                        padding: '6px 10px', borderRadius: '6px',
                                        border: '1px solid #2a2a4e', backgroundColor: 'transparent',
                                        color: dis ? '#374151' : '#9ca3af',
                                        cursor: dis ? 'not-allowed' : 'pointer', fontSize: '12px',
                                    }}>{label}</button>
                                ))}
                                <span style={{ padding: '6px 10px', fontSize: '12px', color: '#6b7280' }}>
                                    Page {page + 1} / {totalPages}
                                </span>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}