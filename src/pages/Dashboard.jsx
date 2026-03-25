import { useQuery } from '@tanstack/react-query'
import { getStudents } from '../api/students'
import { getBooks } from '../api/books'
import { getUnassignedBooks } from '../api/books'

export default function Dashboard() {
    // Fetch page 0 with size 1 just to get totalElements — cheap call
    const { data: studentsData, isLoading: studentsLoading } = useQuery({
        queryKey: ['students-summary'],
        queryFn: () => getStudents({ page: 0, size: 1 }),
        staleTime: 0,
        refetchOnMount: 'always',
    })

    const { data: booksData, isLoading: booksLoading } = useQuery({
        queryKey: ['books-summary'],
        queryFn: () => getBooks({ page: 0, size: 1 }),
        staleTime: 0,
        refetchOnMount: 'always',
    })

    // Unassigned books — this endpoint returns ALL unassigned books (no pagination)
    const { data: unassignedBooks = [], isLoading: unassignedLoading } = useQuery({
        queryKey: ['books', 'unassigned'],
        queryFn: getUnassignedBooks,
        staleTime: 0,
        refetchOnMount: 'always',
    })

    // We need department breakdown — fetch a larger page for dashboard stats
    const { data: studentsAllData } = useQuery({
        queryKey: ['students-departments'],
        queryFn: () => getStudents({ page: 0, size: 200 }),
        staleTime: 0,
        refetchOnMount: 'always',
    })

    const { data: booksAllData } = useQuery({
        queryKey: ['books-genres'],
        queryFn: () => getBooks({ page: 0, size: 200 }),
        staleTime: 0,
        refetchOnMount: 'always',
    })

    const totalStudents   = studentsData?.totalElements || 0
    const totalBooks      = booksData?.totalElements    || 0
    const assignedCount   = totalBooks - unassignedBooks.length
    const utilisation     = totalBooks > 0
        ? Math.round((assignedCount / totalBooks) * 100)
        : 0

    const sampleStudents = studentsAllData?.content || []
    const sampleBooks    = booksAllData?.content    || []

    const departments = [...new Set(sampleStudents.map(s => s.department))]
    const genres      = [...new Set(sampleBooks.map(b => b.genre))]

    if (studentsLoading || booksLoading || unassignedLoading) return (
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

            {/* Stat cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '12px',
                marginBottom: '28px',
            }}>
                {[
                    {
                        label: 'Total students',
                        value: totalStudents,
                        sub: `${departments.length}+ departments`,
                        color: '#818cf8',
                    },
                    {
                        label: 'Total books',
                        value: totalBooks,
                        sub: `${genres.length}+ genres`,
                        color: '#34d399',
                    },
                    {
                        label: 'Assigned books',
                        value: assignedCount,
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
                {/* Students by department */}
                <div style={{
                    backgroundColor: '#1a1a2e',
                    border: '1px solid #2a2a4e',
                    borderRadius: '10px',
                    padding: '16px 20px',
                    overflowY: 'auto',
                    maxHeight: '500px',
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
                        {totalStudents > 200 && (
                            <span style={{ fontSize: '10px', color: '#6b7280', marginLeft: '8px', fontWeight: 400 }}>
                                (sample of first 200)
                            </span>
                        )}
                    </h2>
                    {departments.length === 0 ? (
                        <div style={{ color: '#6b7280', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>
                            No students yet
                        </div>
                    ) : (
                        departments.map(dept => {
                            const count = sampleStudents.filter(s => s.department === dept).length
                            const pct   = sampleStudents.length > 0
                                ? Math.round((count / sampleStudents.length) * 100)
                                : 0
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
                        })
                    )}
                </div>

                {/* Unassigned shelf */}
                <div style={{
                    backgroundColor: '#1a1a2e',
                    border: '1px solid #2a2a4e',
                    borderRadius: '10px',
                    padding: '16px 20px',
                    overflowY: 'auto',
                    maxHeight: '500px',
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
                        <span style={{ fontSize: '11px', color: '#fb923c', marginLeft: '8px', fontWeight: 400 }}>
                            ({unassignedBooks.length} books)
                        </span>
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
                                    <div style={{ fontSize: '13px', fontWeight: '500', color: '#fff' }}>
                                        {book.title}
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
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
                                    flexShrink: 0,
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