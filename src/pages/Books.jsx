import { useState } from 'react'
import Modal from '../components/Modal'
import Pagination from '../components/Pagination'
import {
    useBooks,
    useCreateBook,
    useUpdateBook,
    useDeleteBook,
    useAssignBook,
    useRemoveBook,
} from '../hooks/useBooks'
import { useQuery } from '@tanstack/react-query'
import { getStudents } from '../api/students'

const emptyForm = { title: '', author: '', genre: '', isbn: '' }
const GENRES = ['All', 'Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Science', 'CS', 'Maths']

export default function Books() {
    // ── list state ──────────────────────────────────────────────────
    const [search,      setSearch]      = useState('')
    const [activeGenre, setActiveGenre] = useState('All')
    const [page,        setPage]        = useState(0)
    const [size,        setSize]        = useState(20)
    const [sortBy,      setSortBy]      = useState('id')
    const [sortDir,     setSortDir]     = useState('asc')

    // ── form/modal state ─────────────────────────────────────────────
    const [isModalOpen,   setIsModalOpen]   = useState(false)
    const [isAssignOpen,  setIsAssignOpen]  = useState(false)
    const [formData,      setFormData]      = useState(emptyForm)
    const [editingId,     setEditingId]     = useState(null)
    const [selectedBook,  setSelectedBook]  = useState(null)
    const [errors,        setErrors]        = useState({})

    // ── assign modal search state ────────────────────────────────────
    const [studentSearch,    setStudentSearch]    = useState('')
    const [studentPage,      setStudentPage]      = useState(0)
    const [selectedStudent,  setSelectedStudent]  = useState('')

    // ── data ──────────────────────────────────────────────────────────
    const { books, totalElements, totalPages, isLoading, isError, error }
        = useBooks({ page, size, sortBy, sortDir })

    // Students for assign modal — paginated with search via backend
    // We fetch by name search if possible; fallback to page-based browsing
    const { data: studentsData } = useQuery({
        queryKey: ['students-assign', studentPage, studentSearch],
        queryFn: () => getStudents({ page: studentPage, size: 20, sortBy: 'name', sortDir: 'asc' }),
        enabled: isAssignOpen,
        keepPreviousData: true,
    })
    const assignStudents     = studentsData?.content       || []
    const assignTotalPages   = studentsData?.totalPages    || 0
    const assignTotalElements = studentsData?.totalElements || 0

    // Client-side filter on the fetched page (fast for small pages)
    const filteredAssignStudents = studentSearch.trim()
        ? assignStudents.filter(s =>
            s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
            s.department.toLowerCase().includes(studentSearch.toLowerCase())
        )
        : assignStudents

    const createBook = useCreateBook()
    const updateBook = useUpdateBook()
    const deleteBook = useDeleteBook()
    const assignBook = useAssignBook()
    const removeBook = useRemoveBook()

    // Sort
    const handleSort = (col) => {
        if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
        else { setSortBy(col); setSortDir('asc') }
        setPage(0)
    }
    const arrow = (col) => sortBy !== col ? ' ↕' : sortDir === 'asc' ? ' ↑' : ' ↓'

    // Handlers
    const handleOpenAdd = () => {
        setFormData(emptyForm); setEditingId(null); setErrors({})
        setIsModalOpen(true)
    }
    const handleOpenEdit = (book) => {
        setFormData({ title: book.title, author: book.author, genre: book.genre, isbn: book.isbn })
        setEditingId(book.id); setErrors({}); setIsModalOpen(true)
    }
    const handleOpenAssign = (book) => {
        setSelectedBook(book); setSelectedStudent('')
        setStudentSearch(''); setStudentPage(0)
        setIsAssignOpen(true)
    }
    const handleClose = () => {
        setIsModalOpen(false); setFormData(emptyForm); setEditingId(null); setErrors({})
    }
    const handleCloseAssign = () => {
        setIsAssignOpen(false); setSelectedBook(null)
        setSelectedStudent(''); setStudentSearch(''); setStudentPage(0)
    }
    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(p => ({ ...p, [name]: value }))
        if (errors[name]) setErrors(p => ({ ...p, [name]: '' }))
    }
    const validate = () => {
        const e = {}
        if (!formData.title.trim())  e.title  = 'Title is required'
        if (!formData.author.trim()) e.author = 'Author is required'
        if (!formData.genre.trim())  e.genre  = 'Genre is required'
        if (!formData.isbn.trim())   e.isbn   = 'ISBN is required'
        else if (!/^ISBN-[0-9]{3,}$/.test(formData.isbn)) e.isbn = 'Format must be ISBN-001'
        setErrors(e)
        return Object.keys(e).length === 0
    }
    const handleSave = () => {
        if (!validate()) return
        if (editingId) {
            updateBook.mutate({ id: editingId, data: formData }, { onSuccess: handleClose })
        } else {
            createBook.mutate(formData, { onSuccess: handleClose })
        }
    }
    const handleDelete = (id, title) => {
        if (window.confirm(`Delete book "${title}"?`)) deleteBook.mutate(id)
    }
    const handleAssignSave = () => {
        if (!selectedStudent) return
        assignBook.mutate(
            { studentId: selectedStudent, bookId: selectedBook.id },
            { onSuccess: handleCloseAssign }
        )
    }
    const handleUnassign = (book) => {
        if (window.confirm(`Unassign "${book.title}" from ${book.studentName}?`))
            removeBook.mutate({ studentId: book.studentId, bookId: book.id })
    }

    if (isLoading) return <div style={{ color: '#9ca3af', padding: '40px', textAlign: 'center' }}>Loading books...</div>
    if (isError)   return <div style={{ color: '#f87171', padding: '40px', textAlign: 'center' }}>Error: {error.message}</div>

    // Client-side genre filter on current page
    const filtered = books.filter(b =>
        (activeGenre === 'All' || b.genre === activeGenre) &&
        (b.title.toLowerCase().includes(search.toLowerCase()) ||
            b.author.toLowerCase().includes(search.toLowerCase()))
    )

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <p style={{ fontSize: '13px', color: '#6b7280' }}>
                    {totalElements} books total
                </p>
                <button onClick={handleOpenAdd} style={{
                    backgroundColor: '#4f46e5', color: '#fff', border: 'none',
                    borderRadius: '6px', padding: '8px 16px', fontSize: '13px',
                    cursor: 'pointer', fontWeight: '500',
                }}>
                    + Add Book
                </button>
            </div>

            {/* Search */}
            <input
                type="text"
                placeholder="Search by title or author on this page..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                    width: '100%', padding: '10px 14px', borderRadius: '6px',
                    border: '1px solid #2a2a4e', backgroundColor: '#1a1a2e',
                    color: '#ffffff', fontSize: '13px', marginBottom: '16px', outline: 'none',
                }}
            />

            {/* Genre filter */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                {GENRES.map(genre => (
                    <button key={genre} onClick={() => setActiveGenre(genre)} style={{
                        padding: '6px 14px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer',
                        border: activeGenre === genre ? '1px solid #4f46e5' : '1px solid #2a2a4e',
                        backgroundColor: activeGenre === genre ? '#4f46e5' : 'transparent',
                        color: activeGenre === genre ? '#fff' : '#9ca3af',
                        fontWeight: activeGenre === genre ? '500' : '400',
                    }}>
                        {genre}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div style={{ backgroundColor: '#1a1a2e', borderRadius: '8px', border: '1px solid #2a2a4e', overflow: 'hidden' }}>
                {/* Header row */}
                <div style={{
                    display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 200px',
                    padding: '12px 16px', borderBottom: '1px solid #2a2a4e',
                    fontSize: '11px', color: '#6b7280', fontWeight: '600',
                    textTransform: 'uppercase', letterSpacing: '0.5px',
                }}>
                    {[['Title','title'],['Author','author'],['Genre','genre'],['ISBN','isbn'],['Status','id']].map(([label, col]) => (
                        <span key={col} onClick={() => handleSort(col)}
                              style={{ cursor: 'pointer', userSelect: 'none' }}>
                            {label}{arrow(col)}
                        </span>
                    ))}
                    <span>Actions</span>
                </div>

                {filtered.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280', fontSize: '13px' }}>
                        No books found on this page
                    </div>
                ) : (
                    filtered.map((book, index) => (
                        <div key={book.id} style={{
                            display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 200px',
                            padding: '14px 16px',
                            borderBottom: index < filtered.length - 1 ? '1px solid #2a2a4e' : 'none',
                            fontSize: '13px', alignItems: 'center',
                        }}>
                            <div>
                                <div style={{ fontWeight: '500', color: '#fff' }}>{book.title}</div>
                                {book.studentName && (
                                    <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
                                        → {book.studentName}
                                    </div>
                                )}
                            </div>
                            <span style={{ color: '#9ca3af' }}>{book.author}</span>
                            <span style={{
                                display: 'inline-block', padding: '2px 8px',
                                backgroundColor: '#2a2a4e', borderRadius: '20px',
                                fontSize: '11px', color: '#a5b4fc', width: 'fit-content',
                            }}>{book.genre}</span>
                            <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#9ca3af' }}>
                                {book.isbn}
                            </span>
                            <span style={{
                                display: 'inline-block', padding: '2px 8px', borderRadius: '20px',
                                fontSize: '11px', fontWeight: '500', width: 'fit-content',
                                backgroundColor: book.studentId ? '#1e3a5f' : '#14532d',
                                color: book.studentId ? '#60a5fa' : '#4ade80',
                            }}>
                                {book.studentId ? 'Assigned' : 'Free'}
                            </span>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                {!book.studentId && (
                                    <button onClick={() => handleOpenAssign(book)} style={{
                                        backgroundColor: 'transparent', border: '1px solid #059669',
                                        color: '#34d399', borderRadius: '4px', padding: '4px 10px',
                                        fontSize: '11px', cursor: 'pointer',
                                    }}>Assign</button>
                                )}
                                {book.studentId && (
                                    <button onClick={() => handleUnassign(book)} style={{
                                        backgroundColor: 'transparent', border: '1px solid #d97706',
                                        color: '#fbbf24', borderRadius: '4px', padding: '4px 10px',
                                        fontSize: '11px', cursor: 'pointer',
                                    }}>Unassign</button>
                                )}
                                <button onClick={() => handleOpenEdit(book)} style={{
                                    backgroundColor: 'transparent', border: '1px solid #4f46e5',
                                    color: '#818cf8', borderRadius: '4px', padding: '4px 10px',
                                    fontSize: '11px', cursor: 'pointer',
                                }}>Edit</button>
                                <button onClick={() => handleDelete(book.id, book.title)} style={{
                                    backgroundColor: 'transparent', border: '1px solid #ef4444',
                                    color: '#ef4444', borderRadius: '4px', padding: '4px 10px',
                                    fontSize: '11px', cursor: 'pointer',
                                }}>Delete</button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            <Pagination
                page={page}
                totalPages={totalPages}
                totalElements={totalElements}
                size={size}
                onPageChange={setPage}
                onSizeChange={(s) => { setSize(s); setPage(0) }}
            />

            {/* ── Add/Edit Book Modal ── */}
            <Modal isOpen={isModalOpen} onClose={handleClose} title={editingId ? 'Edit Book' : 'Add Book'}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {[
                        { label: 'Title',  name: 'title',  placeholder: 'eg. Clean Code' },
                        { label: 'Author', name: 'author', placeholder: 'eg. Robert C. Martin' },
                        { label: 'Genre',  name: 'genre',  placeholder: 'eg. Computer Science' },
                        { label: 'ISBN',   name: 'isbn',   placeholder: 'eg. ISBN-101' },
                    ].map(field => (
                        <div key={field.name}>
                            <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px', fontWeight: '500' }}>
                                {field.label} <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <input
                                type="text" name={field.name} value={formData[field.name]}
                                onChange={handleChange} placeholder={field.placeholder}
                                style={{
                                    width: '100%', padding: '10px 12px', borderRadius: '6px',
                                    border: errors[field.name] ? '1px solid #ef4444' : '1px solid #2a2a4e',
                                    backgroundColor: '#0f0f23', color: '#ffffff', fontSize: '13px', outline: 'none',
                                }}
                            />
                            {errors[field.name] && <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>{errors[field.name]}</p>}
                        </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                        <button onClick={handleClose} style={{
                            backgroundColor: 'transparent', border: '1px solid #2a2a4e',
                            color: '#9ca3af', borderRadius: '6px', padding: '8px 16px', fontSize: '13px', cursor: 'pointer',
                        }}>Cancel</button>
                        <button onClick={handleSave}
                                disabled={createBook.isPending || updateBook.isPending}
                                style={{
                                    backgroundColor: '#4f46e5', border: 'none', color: '#fff',
                                    borderRadius: '6px', padding: '8px 16px', fontSize: '13px',
                                    cursor: 'pointer', opacity: (createBook.isPending || updateBook.isPending) ? 0.7 : 1,
                                }}>
                            {(createBook.isPending || updateBook.isPending) ? 'Saving...' : editingId ? 'Update' : 'Save'}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* ── Assign Book Modal — with search + pagination ── */}
            <Modal
                isOpen={isAssignOpen}
                onClose={handleCloseAssign}
                title={`Assign "${selectedBook?.title}"`}
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {/* Search bar */}
                    <input
                        type="text"
                        placeholder="Search student by name or department..."
                        value={studentSearch}
                        onChange={e => { setStudentSearch(e.target.value); setStudentPage(0) }}
                        style={{
                            width: '100%', padding: '9px 12px', borderRadius: '6px',
                            border: '1px solid #2a2a4e', backgroundColor: '#0f0f23',
                            color: '#fff', fontSize: '13px', outline: 'none',
                        }}
                    />

                    {/* Student list */}
                    <div style={{
                        border: '1px solid #2a2a4e', borderRadius: '6px',
                        maxHeight: '280px', overflowY: 'auto', backgroundColor: '#0f0f23',
                    }}>
                        {filteredAssignStudents.length === 0 ? (
                            <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280', fontSize: '12px' }}>
                                No students found
                            </div>
                        ) : (
                            filteredAssignStudents.map(student => (
                                <div
                                    key={student.id}
                                    onClick={() => setSelectedStudent(String(student.id))}
                                    style={{
                                        padding: '10px 14px',
                                        cursor: 'pointer',
                                        borderBottom: '1px solid #1a1a2e',
                                        backgroundColor: selectedStudent === String(student.id) ? '#2a2a4e' : 'transparent',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                    }}
                                >
                                    <div>
                                        <div style={{ fontSize: '13px', color: '#fff', fontWeight: selectedStudent === String(student.id) ? '600' : '400' }}>
                                            {student.name}
                                        </div>
                                        <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '1px' }}>
                                            {student.department}
                                        </div>
                                    </div>
                                    {selectedStudent === String(student.id) && (
                                        <span style={{ color: '#4ade80', fontSize: '16px' }}>✓</span>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Pagination for assign modal */}
                    {!studentSearch.trim() && assignTotalPages > 1 && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: '#6b7280' }}>
                            <span>
                                Page {studentPage + 1} of {assignTotalPages} ({assignTotalElements} students)
                            </span>
                            <div style={{ display: 'flex', gap: '6px' }}>
                                <button
                                    onClick={() => setStudentPage(p => Math.max(0, p - 1))}
                                    disabled={studentPage === 0}
                                    style={{
                                        padding: '4px 10px', borderRadius: '4px',
                                        border: '1px solid #2a2a4e', backgroundColor: 'transparent',
                                        color: studentPage === 0 ? '#374151' : '#9ca3af',
                                        cursor: studentPage === 0 ? 'not-allowed' : 'pointer', fontSize: '12px',
                                    }}
                                >‹ Prev</button>
                                <button
                                    onClick={() => setStudentPage(p => Math.min(assignTotalPages - 1, p + 1))}
                                    disabled={studentPage >= assignTotalPages - 1}
                                    style={{
                                        padding: '4px 10px', borderRadius: '4px',
                                        border: '1px solid #2a2a4e', backgroundColor: 'transparent',
                                        color: studentPage >= assignTotalPages - 1 ? '#374151' : '#9ca3af',
                                        cursor: studentPage >= assignTotalPages - 1 ? 'not-allowed' : 'pointer', fontSize: '12px',
                                    }}
                                >Next ›</button>
                            </div>
                        </div>
                    )}

                    {studentSearch.trim() && (
                        <div style={{ fontSize: '11px', color: '#6b7280', textAlign: 'center' }}>
                            Showing matches from current page · clear search to browse all
                        </div>
                    )}

                    {/* Selected student indicator */}
                    {selectedStudent && (() => {
                        const s = filteredAssignStudents.find(x => String(x.id) === selectedStudent)
                        return s ? (
                            <div style={{
                                padding: '8px 12px', backgroundColor: '#14532d', borderRadius: '6px',
                                fontSize: '12px', color: '#4ade80',
                            }}>
                                ✓ Selected: {s.name} — {s.department}
                            </div>
                        ) : null
                    })()}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                        <button onClick={handleCloseAssign} style={{
                            backgroundColor: 'transparent', border: '1px solid #2a2a4e',
                            color: '#9ca3af', borderRadius: '6px', padding: '8px 16px', fontSize: '13px', cursor: 'pointer',
                        }}>Cancel</button>
                        <button onClick={handleAssignSave}
                                disabled={!selectedStudent || assignBook.isPending}
                                style={{
                                    backgroundColor: selectedStudent ? '#059669' : '#1a2e25',
                                    border: 'none', color: selectedStudent ? '#fff' : '#6b7280',
                                    borderRadius: '6px', padding: '8px 16px', fontSize: '13px',
                                    cursor: !selectedStudent || assignBook.isPending ? 'not-allowed' : 'pointer',
                                    opacity: assignBook.isPending ? 0.7 : 1,
                                }}>
                            {assignBook.isPending ? 'Assigning...' : 'Assign'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}