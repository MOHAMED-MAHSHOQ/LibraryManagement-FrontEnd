import { useState,useEffect } from 'react'
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
import { getStudents, searchStudents } from '../api/students'

const emptyForm = { title: '', author: '', genre: '', isbn: '' }
const GENRES = ['All', 'Computer Science', 'Mathematics', 'Physics',
    'Chemistry', 'Biology', 'Science', 'CS', 'Maths']

export default function Books() {

    // ── books list state ─────────────────────────────────────────
    const [search,      setSearch]      = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [activeGenre, setActiveGenre] = useState('All')
    const [page,        setPage]        = useState(0)
    const [size,        setSize]        = useState(20)
    const [sortBy,      setSortBy]      = useState('id')
    const [sortDir,     setSortDir]     = useState('asc')

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(0);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    // ── add/edit modal state ─────────────────────────────────────
    const [isModalOpen,  setIsModalOpen]  = useState(false)
    const [formData,     setFormData]     = useState(emptyForm)
    const [editingId,    setEditingId]    = useState(null)
    const [errors,       setErrors]       = useState({})

    // ── assign modal state ───────────────────────────────────────
    const [isAssignOpen,     setIsAssignOpen]     = useState(false)
    const [selectedBook,     setSelectedBook]     = useState(null)
    const [selectedStudent,  setSelectedStudent]  = useState(null) // full student object
    const [studentSearch,    setStudentSearch]    = useState('')
    const [studentPage,      setStudentPage]      = useState(0)

    // ── books data ───────────────────────────────────────────────
    const { books, totalElements, totalPages, isLoading, isError, error }
        = useBooks({ search: debouncedSearch, page, size, sortBy, sortDir })

    // ── students for assign modal ────────────────────────────────
    // If search is typed → call /students/search (backend search across ALL 3000+)
    // If no search → call /students with pagination
    const isSearching = studentSearch.trim().length > 0

    const { data: studentsData, isFetching: studentsFetching } = useQuery({
        queryKey: ['students-assign-browse', studentPage],
        queryFn:  () => getStudents({ page: studentPage, size: 20, sortBy: 'name', sortDir: 'asc' }),
        enabled:  isAssignOpen && !isSearching,
        keepPreviousData: true,
    })

    const { data: searchData, isFetching: searchFetching } = useQuery({
        queryKey: ['students-assign-search', studentSearch, studentPage],
        queryFn:  () => searchStudents({ query: studentSearch.trim(), page: studentPage, size: 20 }),
        enabled:  isAssignOpen && isSearching && studentSearch.trim().length >= 1,
        keepPreviousData: true,
    })

    // pick the right data source
    const activeData      = isSearching ? searchData      : studentsData
    const isFetchingStudents = isSearching ? searchFetching : studentsFetching
    const studentList     = activeData?.content       || []
    const studentTotal    = activeData?.totalElements || 0
    const studentTotalPages = activeData?.totalPages  || 0

    // ── mutations ────────────────────────────────────────────────
    const createBook = useCreateBook()
    const updateBook = useUpdateBook()
    const deleteBook = useDeleteBook()
    const assignBook = useAssignBook()
    const removeBook = useRemoveBook()

    // ── sort ─────────────────────────────────────────────────────
    const handleSort = (col) => {
        if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
        else { setSortBy(col); setSortDir('asc') }
        setPage(0)
    }
    const arrow = (col) => sortBy !== col ? ' ↕' : sortDir === 'asc' ? ' ↑' : ' ↓'

    // ── book modal handlers ──────────────────────────────────────
    const handleOpenAdd = () => {
        setFormData(emptyForm); setEditingId(null); setErrors({})
        setIsModalOpen(true)
    }
    const handleOpenEdit = (book) => {
        setFormData({ title: book.title, author: book.author, genre: book.genre, isbn: book.isbn })
        setEditingId(book.id); setErrors({}); setIsModalOpen(true)
    }
    const handleCloseBook = () => {
        setIsModalOpen(false); setFormData(emptyForm); setEditingId(null); setErrors({})
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
        else if (!/^ISBN-[0-9]{3,}$/.test(formData.isbn)) e.isbn = 'Format: ISBN-101'
        setErrors(e)
        return Object.keys(e).length === 0
    }
    const handleSave = () => {
        if (!validate()) return
        if (editingId) {
            updateBook.mutate({ id: editingId, data: formData }, { onSuccess: handleCloseBook })
        } else {
            createBook.mutate(formData, { onSuccess: handleCloseBook })
        }
    }
    const handleDelete = (id, title) => {
        if (window.confirm(`Delete book "${title}"?`)) deleteBook.mutate(id)
    }

    // ── assign modal handlers ────────────────────────────────────
    const handleOpenAssign = (book) => {
        setSelectedBook(book)
        setSelectedStudent(null)
        setStudentSearch('')
        setStudentPage(0)
        setIsAssignOpen(true)
    }
    const handleCloseAssign = () => {
        setIsAssignOpen(false)
        setSelectedBook(null)
        setSelectedStudent(null)
        setStudentSearch('')
        setStudentPage(0)
    }
    const handleStudentSearchChange = (e) => {
        setStudentSearch(e.target.value)
        setStudentPage(0)        // reset to page 1 on every new search
        setSelectedStudent(null) // clear selection when search changes
    }
    const handleAssignSave = () => {
        if (!selectedStudent) return
        assignBook.mutate(
            { studentId: selectedStudent.id, bookId: selectedBook.id },
            { onSuccess: handleCloseAssign }
        )
    }
    const handleUnassign = (book) => {
        if (window.confirm(`Unassign "${book.title}" from ${book.studentName}?`))
            removeBook.mutate({ studentId: book.studentId, bookId: book.id })
    }

    if (isLoading) return <div style={{ color: '#9ca3af', padding: '40px', textAlign: 'center' }}>Loading books...</div>
    if (isError)   return <div style={{ color: '#f87171', padding: '40px', textAlign: 'center' }}>Error: {error.message}</div>

    // client-side filter on the current page only (for genre + title search)
    // const filtered = books.filter(b =>
    //     (activeGenre === 'All' || b.genre === activeGenre) &&
    //     (b.title.toLowerCase().includes(search.toLowerCase()) ||
    //         b.author.toLowerCase().includes(search.toLowerCase()))
    // )

    const filteredByGenre = activeGenre === 'All'
        ? books
        : books.filter(b => b.genre === activeGenre);

    return (
        <div>
            {/* ── Header ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <p style={{ fontSize: '13px', color: '#6b7280' }}>{totalElements} books total</p>
                <button onClick={handleOpenAdd} style={{
                    backgroundColor: '#4f46e5', color: '#fff', border: 'none',
                    borderRadius: '6px', padding: '8px 16px', fontSize: '13px',
                    cursor: 'pointer', fontWeight: '500',
                }}>+ Add Book</button>
            </div>

            {/* ── Search ── */}
            <input type="text" placeholder="Search title or author on this page..."
                   value={search} onChange={e => setSearch(e.target.value)}
                   style={{
                       width: '100%', padding: '10px 14px', borderRadius: '6px',
                       border: '1px solid #2a2a4e', backgroundColor: '#1a1a2e',
                       color: '#fff', fontSize: '13px', marginBottom: '16px', outline: 'none',
                   }}
            />

            {/* ── Genre filter ── */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                {GENRES.map(genre => (
                    <button key={genre} onClick={() => setActiveGenre(genre)} style={{
                        padding: '6px 14px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer',
                        border: activeGenre === genre ? '1px solid #4f46e5' : '1px solid #2a2a4e',
                        backgroundColor: activeGenre === genre ? '#4f46e5' : 'transparent',
                        color: activeGenre === genre ? '#fff' : '#9ca3af',
                    }}>{genre}</button>
                ))}
            </div>

            {/* ── Table ── */}
            <div style={{ backgroundColor: '#1a1a2e', borderRadius: '8px', border: '1px solid #2a2a4e', overflow: 'hidden' }}>
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

                {filteredByGenre.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280', fontSize: '13px' }}>
                        No books found
                    </div>
                ) : (
                    filteredByGenre.map((book, index) => (
                        <div key={book.id} style={{
                            display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 200px',
                            padding: '14px 16px',
                            borderBottom: index < filteredByGenre.length - 1 ? '1px solid #2a2a4e' : 'none',
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

            <Pagination
                page={page} totalPages={totalPages} totalElements={totalElements}
                size={size} onPageChange={setPage}
                onSizeChange={(s) => { setSize(s); setPage(0) }}
            />

            {/* ══════════════════════════════════════════
                ADD / EDIT BOOK MODAL
            ══════════════════════════════════════════ */}
            <Modal isOpen={isModalOpen} onClose={handleCloseBook}
                   title={editingId ? 'Edit Book' : 'Add Book'}>
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
                            <input type="text" name={field.name} value={formData[field.name]}
                                   onChange={handleChange} placeholder={field.placeholder}
                                   style={{
                                       width: '100%', padding: '10px 12px', borderRadius: '6px',
                                       border: errors[field.name] ? '1px solid #ef4444' : '1px solid #2a2a4e',
                                       backgroundColor: '#0f0f23', color: '#fff', fontSize: '13px', outline: 'none',
                                   }}
                            />
                            {errors[field.name] && (
                                <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>
                                    {errors[field.name]}
                                </p>
                            )}
                        </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                        <button onClick={handleCloseBook} style={{
                            backgroundColor: 'transparent', border: '1px solid #2a2a4e',
                            color: '#9ca3af', borderRadius: '6px', padding: '8px 16px',
                            fontSize: '13px', cursor: 'pointer',
                        }}>Cancel</button>
                        <button onClick={handleSave}
                                disabled={createBook.isPending || updateBook.isPending}
                                style={{
                                    backgroundColor: '#4f46e5', border: 'none', color: '#fff',
                                    borderRadius: '6px', padding: '8px 16px', fontSize: '13px',
                                    cursor: 'pointer',
                                    opacity: (createBook.isPending || updateBook.isPending) ? 0.7 : 1,
                                }}>
                            {(createBook.isPending || updateBook.isPending) ? 'Saving...' : editingId ? 'Update' : 'Save'}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* ══════════════════════════════════════════
                ASSIGN BOOK MODAL
                - Search calls backend → searches ALL 3000+ students
                - Browse uses pagination
            ══════════════════════════════════════════ */}
            <Modal isOpen={isAssignOpen} onClose={handleCloseAssign}
                   title={`Assign "${selectedBook?.title}"`}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

                    {/* Search input */}
                    <div style={{ position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="Search by name, email or department..."
                            value={studentSearch}
                            onChange={handleStudentSearchChange}
                            autoFocus
                            style={{
                                width: '100%', padding: '10px 36px 10px 12px',
                                borderRadius: '6px', border: '1px solid #2a2a4e',
                                backgroundColor: '#0f0f23', color: '#fff',
                                fontSize: '13px', outline: 'none',
                            }}
                        />
                        {/* Clear button */}
                        {studentSearch && (
                            <button onClick={() => { setStudentSearch(''); setStudentPage(0); setSelectedStudent(null) }}
                                    style={{
                                        position: 'absolute', right: '10px', top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none', border: 'none',
                                        color: '#6b7280', cursor: 'pointer', fontSize: '16px',
                                    }}>×</button>
                        )}
                    </div>

                    {/* Search mode indicator */}
                    {isSearching && (
                        <div style={{ fontSize: '11px', color: '#818cf8' }}>
                            🔍 Searching all {studentTotal > 0 ? studentTotal + ' matches across' : 'students in'} your database...
                        </div>
                    )}

                    {/* Student list */}
                    <div style={{
                        border: '1px solid #2a2a4e', borderRadius: '6px',
                        maxHeight: '280px', overflowY: 'auto', backgroundColor: '#0f0f23',
                    }}>
                        {isFetchingStudents ? (
                            <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280', fontSize: '12px' }}>
                                Searching...
                            </div>
                        ) : studentList.length === 0 ? (
                            <div style={{ padding: '24px', textAlign: 'center', color: '#6b7280', fontSize: '13px' }}>
                                {isSearching
                                    ? `No students found for "${studentSearch}"`
                                    : 'No students available'}
                            </div>
                        ) : (
                            studentList.map(student => {
                                const isSelected = selectedStudent?.id === student.id
                                return (
                                    <div key={student.id} onClick={() => setSelectedStudent(isSelected ? null : student)}
                                         style={{
                                             padding: '10px 14px', cursor: 'pointer',
                                             borderBottom: '1px solid #1a1a2e',
                                             backgroundColor: isSelected ? '#2a2a4e' : 'transparent',
                                             display: 'flex', justifyContent: 'space-between',
                                             alignItems: 'center',
                                             transition: 'background-color 0.1s',
                                         }}>
                                        <div>
                                            <div style={{
                                                fontSize: '13px', color: '#fff',
                                                fontWeight: isSelected ? '600' : '400',
                                            }}>
                                                {student.name}
                                            </div>
                                            <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
                                                {student.department} · {student.email}
                                            </div>
                                        </div>
                                        {isSelected && (
                                            <span style={{
                                                color: '#4ade80', fontSize: '18px',
                                                flexShrink: 0, marginLeft: '8px',
                                            }}>✓</span>
                                        )}
                                    </div>
                                )
                            })
                        )}
                    </div>

                    {/* Pagination — shown in both search and browse modes */}
                    {studentTotalPages > 1 && (
                        <div style={{
                            display: 'flex', alignItems: 'center',
                            justifyContent: 'space-between', fontSize: '12px', color: '#6b7280',
                        }}>
                            <span>
                                Page {studentPage + 1} of {studentTotalPages}
                                {' '}({studentTotal} {isSearching ? 'results' : 'students'})
                            </span>
                            <div style={{ display: 'flex', gap: '6px' }}>
                                <button
                                    onClick={() => setStudentPage(p => Math.max(0, p - 1))}
                                    disabled={studentPage === 0}
                                    style={{
                                        padding: '4px 12px', borderRadius: '4px',
                                        border: '1px solid #2a2a4e', backgroundColor: 'transparent',
                                        color: studentPage === 0 ? '#374151' : '#9ca3af',
                                        cursor: studentPage === 0 ? 'not-allowed' : 'pointer',
                                        fontSize: '12px',
                                    }}>‹ Prev</button>
                                <button
                                    onClick={() => setStudentPage(p => Math.min(studentTotalPages - 1, p + 1))}
                                    disabled={studentPage >= studentTotalPages - 1}
                                    style={{
                                        padding: '4px 12px', borderRadius: '4px',
                                        border: '1px solid #2a2a4e', backgroundColor: 'transparent',
                                        color: studentPage >= studentTotalPages - 1 ? '#374151' : '#9ca3af',
                                        cursor: studentPage >= studentTotalPages - 1 ? 'not-allowed' : 'pointer',
                                        fontSize: '12px',
                                    }}>Next ›</button>
                            </div>
                        </div>
                    )}

                    {/* Selected student confirmation bar */}
                    {selectedStudent && (
                        <div style={{
                            padding: '10px 14px', backgroundColor: '#14532d',
                            borderRadius: '6px', fontSize: '12px', color: '#4ade80',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        }}>
                            <span>✓ Selected: <strong>{selectedStudent.name}</strong> — {selectedStudent.department}</span>
                            <button onClick={() => setSelectedStudent(null)}
                                    style={{ background: 'none', border: 'none', color: '#4ade80', cursor: 'pointer', fontSize: '14px' }}>
                                ×
                            </button>
                        </div>
                    )}

                    {/* Action buttons */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                        <button onClick={handleCloseAssign} style={{
                            backgroundColor: 'transparent', border: '1px solid #2a2a4e',
                            color: '#9ca3af', borderRadius: '6px', padding: '8px 16px',
                            fontSize: '13px', cursor: 'pointer',
                        }}>Cancel</button>
                        <button onClick={handleAssignSave}
                                disabled={!selectedStudent || assignBook.isPending}
                                style={{
                                    backgroundColor: selectedStudent ? '#059669' : '#1a2e25',
                                    border: 'none',
                                    color: selectedStudent ? '#fff' : '#4b5563',
                                    borderRadius: '6px', padding: '8px 20px', fontSize: '13px',
                                    cursor: !selectedStudent || assignBook.isPending ? 'not-allowed' : 'pointer',
                                    opacity: assignBook.isPending ? 0.7 : 1,
                                    fontWeight: '500',
                                }}>
                            {assignBook.isPending ? 'Assigning...' : 'Assign'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}