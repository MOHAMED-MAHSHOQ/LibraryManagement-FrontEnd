import { useBooks } from '../hooks/useBooks'

export default function UnassignedShelf() {
    const { books, isLoading } = useBooks()
    const unassigned = books.filter(b => !b.studentId)

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
                    {unassigned.length} books available
                </p>
            </div>

            {unassigned.length === 0 ? (
                <div style={{
                    backgroundColor: '#1a1a2e',
                    border: '1px solid #2a2a4e',
                    borderRadius: '10px',
                    padding: '60px',
                    textAlign: 'center',
                    color: '#6b7280',
                    fontSize: '14px',
                }}>
                    All books are currently assigned to students
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                    gap: '12px',
                }}>
                    {unassigned.map(book => (
                        <div
                            key={book.id}
                            style={{
                                backgroundColor: '#1a1a2e',
                                border: '1px solid #2a2a4e',
                                borderRadius: '10px',
                                padding: '16px',
                            }}
                        >
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                marginBottom: '10px',
                            }}>
                <span style={{
                    fontSize: '10px',
                    padding: '2px 8px',
                    backgroundColor: '#14532d',
                    color: '#4ade80',
                    borderRadius: '20px',
                    fontWeight: '500',
                }}>
                  Free
                </span>
                                <span style={{
                                    fontSize: '10px',
                                    padding: '2px 8px',
                                    backgroundColor: '#2a2a4e',
                                    color: '#a5b4fc',
                                    borderRadius: '20px',
                                }}>
                  {book.genre}
                </span>
                            </div>
                            <div style={{
                                fontSize: '14px',
                                fontWeight: '600',
                                color: '#fff',
                                marginBottom: '4px',
                                lineHeight: '1.4',
                            }}>
                                {book.title}
                            </div>
                            <div style={{
                                fontSize: '12px',
                                color: '#9ca3af',
                                marginBottom: '8px',
                            }}>
                                {book.author}
                            </div>
                            <div style={{
                                fontSize: '11px',
                                color: '#6b7280',
                                fontFamily: 'monospace',
                            }}>
                                {book.isbn}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}