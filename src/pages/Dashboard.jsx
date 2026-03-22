import { useStudents } from '../hooks/useStudents'
import { useBooks } from '../hooks/useBooks'

export default function Dashboard() {
    const { students, isLoading: studentsLoading } = useStudents()
    const { books, isLoading: booksLoading }       = useBooks()

    const assignedBooks   = books.filter(b => b.studentId)
    const unassignedBooks = books.filter(b => !b.studentId)
    const utilisation     = books.length > 0
        ? Math.round((assignedBooks.length / books.length) * 100)
        : 0

    const departments = [...new Set(students.map(s => s.department))]
    const genres      = [...new Set(books.map(b => b.genre))]

    if (studentsLoading || booksLoading) return (
        <div style={{ color: '#9ca3af', padding: '40px', textAlign: 'center' }}>
            Loading dashboard...
        </div>
    )

    return (
        <div>
            <div style={{ marginBottom: '28px' }}>
                <h1 style={{ fontSize: '22px', fontWeight: '600', color: '#fff' }}>
                    Dashboard
                </h1>
                <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
                    Library overview
                </p>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '12px',
                marginBottom: '28px',
            }}>
                {[
                    {
                        label: 'Total students',
                        value: students.length,
                        sub: `${departments.length} departments`,
                        color: '#818cf8',
                    },
                    {
                        label: 'Total books',
                        value: books.length,
                        sub: `${genres.length} genres`,
                        color: '#34d399',
                    },
                    {
                        label: 'Assigned books',
                        value: assignedBooks.length,
                        sub: `${utilisation}% utilisation`,
                        color: '#60a5fa',
                    },
                    {
                        label: 'Unassigned books',
                        value: unassignedBooks.length,
                        sub: 'available on shelf',
                        color: '#fb923c',
                    },
                ].map(card => (
                    <div
                        key={card.label}
                        style={{
                            backgroundColor: '#1a1a2e',
                            border: '1px solid #2a2a4e',
                            borderRadius: '10px',
                            padding: '16px 20px',
                        }}
                    >
                        <div style={{
                            fontSize: '11px',
                            color: '#6b7280',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            marginBottom: '8px',
                        }}>
                            {card.label}
                        </div>
                        <div style={{
                            fontSize: '28px',
                            fontWeight: '600',
                            color: card.color,
                            lineHeight: 1,
                            marginBottom: '6px',
                        }}>
                            {card.value}
                        </div>
                        <div style={{ fontSize: '11px', color: '#6b7280' }}>
                            {card.sub}
                        </div>
                    </div>
                ))}
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
            }}>
                <div style={{
                    backgroundColor: '#1a1a2e',
                    border: '1px solid #2a2a4e',
                    borderRadius: '10px',
                    padding: '16px 20px',
                }}>
                    <h2 style={{
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#9ca3af',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        marginBottom: '16px',
                    }}>
                        Students by department
                    </h2>
                    {departments.map(dept => {
                        const count = students.filter(s => s.department === dept).length
                        const pct   = Math.round((count / students.length) * 100)
                        return (
                            <div key={dept} style={{ marginBottom: '12px' }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    fontSize: '12px',
                                    color: '#e5e7eb',
                                    marginBottom: '4px',
                                }}>
                                    <span>{dept}</span>
                                    <span style={{ color: '#6b7280' }}>{count} students</span>
                                </div>
                                <div style={{
                                    height: '4px',
                                    backgroundColor: '#2a2a4e',
                                    borderRadius: '2px',
                                }}>
                                    <div style={{
                                        height: '4px',
                                        width: `${pct}%`,
                                        backgroundColor: '#818cf8',
                                        borderRadius: '2px',
                                    }} />
                                </div>
                            </div>
                        )
                    })}
                </div>

                <div style={{
                    backgroundColor: '#1a1a2e',
                    border: '1px solid #2a2a4e',
                    borderRadius: '10px',
                    padding: '16px 20px',
                }}>
                    <h2 style={{
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#9ca3af',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        marginBottom: '16px',
                    }}>
                        Unassigned shelf
                    </h2>
                    {unassignedBooks.length === 0 ? (
                        <div style={{
                            color: '#6b7280',
                            fontSize: '13px',
                            textAlign: 'center',
                            padding: '20px 0',
                        }}>
                            All books are assigned
                        </div>
                    ) : (
                        unassignedBooks.map((book, index) => (
                            <div
                                key={book.id}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '10px 0',
                                    borderBottom: index < unassignedBooks.length - 1
                                        ? '1px solid #2a2a4e' : 'none',
                                }}
                            >
                                <div>
                                    <div style={{
                                        fontSize: '13px',
                                        fontWeight: '500',
                                        color: '#fff',
                                    }}>
                                        {book.title}
                                    </div>
                                    <div style={{
                                        fontSize: '11px',
                                        color: '#6b7280',
                                        marginTop: '2px',
                                    }}>
                                        {book.author}
                                    </div>
                                </div>
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
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}