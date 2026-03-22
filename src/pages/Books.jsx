import { useState } from 'react'
import Modal from '../components/Modal'
import {
    useBooks,
    useCreateBook,
    useUpdateBook,
    useDeleteBook,
    useAssignBook,
    useRemoveBook,
} from '../hooks/useBooks'
import { useStudents } from '../hooks/useStudents'

const emptyForm = {
    title: '',
    author: '',
    genre: '',
    isbn: '',
}

const GENRES = ['All', 'Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Science']

export default function Books() {
    const [search, setSearch]               = useState('')
    const [activeGenre, setActiveGenre]     = useState('All')
    const [isModalOpen, setIsModalOpen]     = useState(false)
    const [isAssignOpen, setIsAssignOpen]   = useState(false)
    const [formData, setFormData]           = useState(emptyForm)
    const [editingId, setEditingId]         = useState(null)
    const [selectedBook, setSelectedBook]   = useState(null)
    const [selectedStudent, setSelectedStudent] = useState('')
    const [errors, setErrors]               = useState({})

    const { books, isLoading, isError, error } = useBooks()
    const { students } = useStudents()
    const createBook = useCreateBook()
    const updateBook = useUpdateBook()
    const deleteBook = useDeleteBook()
    const assignBook = useAssignBook()
    const removeBook = useRemoveBook()

    const filtered = books
        .filter(b => activeGenre === 'All' || b.genre === activeGenre)
        .filter(b =>
            b.title.toLowerCase().includes(search.toLowerCase()) ||
            b.author.toLowerCase().includes(search.toLowerCase())
        )

    const handleOpenAdd = () => {
        setFormData(emptyForm)
        setEditingId(null)
        setErrors({})
        setIsModalOpen(true)
    }

    const handleOpenEdit = (book) => {
        setFormData({
            title:  book.title,
            author: book.author,
            genre:  book.genre,
            isbn:   book.isbn,
        })
        setEditingId(book.id)
        setErrors({})
        setIsModalOpen(true)
    }

    const handleOpenAssign = (book) => {
        setSelectedBook(book)
        setSelectedStudent('')
        setIsAssignOpen(true)
    }

    const handleClose = () => {
        setIsModalOpen(false)
        setFormData(emptyForm)
        setEditingId(null)
        setErrors({})
    }

    const handleCloseAssign = () => {
        setIsAssignOpen(false)
        setSelectedBook(null)
        setSelectedStudent('')
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }))
        }
    }

    const validate = () => {
        const newErrors = {}
        if (!formData.title.trim())
            newErrors.title = 'Title is required'
        else if (formData.title.length < 2)
            newErrors.title = 'Title must be at least 2 characters'
        if (!formData.author.trim())
            newErrors.author = 'Author is required'
        if (!formData.genre.trim())
            newErrors.genre = 'Genre is required'
        if (!formData.isbn.trim())
            newErrors.isbn = 'ISBN is required'
        else if (!/^ISBN-[0-9]{3}$/.test(formData.isbn))
            newErrors.isbn = 'ISBN format must be ISBN-011'
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSave = () => {
        if (!validate()) return
        if (editingId) {
            updateBook.mutate(
                { id: editingId, data: formData },
                { onSuccess: () => handleClose() }
            )
        } else {
            createBook.mutate(formData, {
                onSuccess: () => handleClose(),
            })
        }
    }

    const handleDelete = (id, title) => {
        if (window.confirm(`Delete book "${title}"?`)) {
            deleteBook.mutate(id)
        }
    }

    const handleAssignSave = () => {
        if (!selectedStudent) return
        assignBook.mutate(
            { studentId: selectedStudent, bookId: selectedBook.id },
            { onSuccess: () => handleCloseAssign() }
        )
    }

    const handleUnassign = (book) => {
        if (window.confirm(`Unassign "${book.title}" from ${book.studentName}?`)) {
            removeBook.mutate(
                { studentId: book.studentId, bookId: book.id }
            )
        }
    }

    if (isLoading) return (
        <div style={{ color: '#9ca3af', padding: '40px', textAlign: 'center' }}>
            Loading books...
        </div>
    )

    if (isError) return (
        <div style={{ color: '#f87171', padding: '40px', textAlign: 'center' }}>
            Error: {error.message}
        </div>
    )

    return (
        <div>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px',
            }}>
                <div>
                    <h1 style={{ fontSize: '22px', fontWeight: '600', color: '#fff' }}>
                        Books
                    </h1>
                    <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
                        {books.length} books total
                    </p>
                </div>
                <button
                    onClick={handleOpenAdd}
                    style={{
                        backgroundColor: '#4f46e5',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '8px 16px',
                        fontSize: '13px',
                        cursor: 'pointer',
                        fontWeight: '500',
                    }}
                >
                    + Add Book
                </button>
            </div>

            <input
                type="text"
                placeholder="Search by title or author..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '6px',
                    border: '1px solid #2a2a4e',
                    backgroundColor: '#1a1a2e',
                    color: '#ffffff',
                    fontSize: '13px',
                    marginBottom: '16px',
                    outline: 'none',
                }}
            />

            <div style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '20px',
                flexWrap: 'wrap',
            }}>
                {GENRES.map(genre => (
                    <button
                        key={genre}
                        onClick={() => setActiveGenre(genre)}
                        style={{
                            padding: '6px 14px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            border: activeGenre === genre
                                ? '1px solid #4f46e5'
                                : '1px solid #2a2a4e',
                            backgroundColor: activeGenre === genre
                                ? '#4f46e5' : 'transparent',
                            color: activeGenre === genre ? '#fff' : '#9ca3af',
                            fontWeight: activeGenre === genre ? '500' : '400',
                        }}
                    >
                        {genre}
                    </button>
                ))}
            </div>

            <div style={{
                backgroundColor: '#1a1a2e',
                borderRadius: '8px',
                border: '1px solid #2a2a4e',
                overflow: 'hidden',
            }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 200px',
                    padding: '12px 16px',
                    borderBottom: '1px solid #2a2a4e',
                    fontSize: '11px',
                    color: '#6b7280',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                }}>
                    <span>Title</span>
                    <span>Author</span>
                    <span>Genre</span>
                    <span>ISBN</span>
                    <span>Status</span>
                    <span>Actions</span>
                </div>

                {filtered.length === 0 ? (
                    <div style={{
                        padding: '40px',
                        textAlign: 'center',
                        color: '#6b7280',
                        fontSize: '13px',
                    }}>
                        No books found
                    </div>
                ) : (
                    filtered.map((book, index) => (
                        <div
                            key={book.id}
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 200px',
                                padding: '14px 16px',
                                borderBottom: index < filtered.length - 1
                                    ? '1px solid #2a2a4e' : 'none',
                                fontSize: '13px',
                                alignItems: 'center',
                            }}
                        >
                            <div>
                                <div style={{ fontWeight: '500', color: '#fff' }}>
                                    {book.title}
                                </div>
                                {book.studentName && (
                                    <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
                                        {book.studentName}
                                    </div>
                                )}
                            </div>
                            <span style={{ color: '#9ca3af' }}>{book.author}</span>
                            <span style={{
                                display: 'inline-block',
                                padding: '2px 8px',
                                backgroundColor: '#2a2a4e',
                                borderRadius: '20px',
                                fontSize: '11px',
                                color: '#a5b4fc',
                                width: 'fit-content',
                            }}>
                {book.genre}
              </span>
                            <span style={{
                                fontFamily: 'monospace',
                                fontSize: '12px',
                                color: '#9ca3af',
                            }}>
                {book.isbn}
              </span>
                            <span style={{
                                display: 'inline-block',
                                padding: '2px 8px',
                                borderRadius: '20px',
                                fontSize: '11px',
                                fontWeight: '500',
                                width: 'fit-content',
                                backgroundColor: book.studentId ? '#1e3a5f' : '#14532d',
                                color: book.studentId ? '#60a5fa' : '#4ade80',
                            }}>
                {book.studentId ? 'Assigned' : 'Free'}
              </span>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                {!book.studentId && (
                                    <button
                                        onClick={() => handleOpenAssign(book)}
                                        style={{
                                            backgroundColor: 'transparent',
                                            border: '1px solid #059669',
                                            color: '#34d399',
                                            borderRadius: '4px',
                                            padding: '4px 10px',
                                            fontSize: '11px',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        Assign
                                    </button>
                                )}
                                {book.studentId && (
                                    <button
                                        onClick={() => handleUnassign(book)}
                                        style={{
                                            backgroundColor: 'transparent',
                                            border: '1px solid #d97706',
                                            color: '#fbbf24',
                                            borderRadius: '4px',
                                            padding: '4px 10px',
                                            fontSize: '11px',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        Unassign
                                    </button>
                                )}
                                <button
                                    onClick={() => handleOpenEdit(book)}
                                    style={{
                                        backgroundColor: 'transparent',
                                        border: '1px solid #4f46e5',
                                        color: '#818cf8',
                                        borderRadius: '4px',
                                        padding: '4px 10px',
                                        fontSize: '11px',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(book.id, book.title)}
                                    style={{
                                        backgroundColor: 'transparent',
                                        border: '1px solid #ef4444',
                                        color: '#ef4444',
                                        borderRadius: '4px',
                                        padding: '4px 10px',
                                        fontSize: '11px',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={handleClose}
                title={editingId ? 'Edit Book' : 'Add Book'}
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {[
                        { label: 'Title',  name: 'title',  type: 'text', placeholder: 'eg. Clean Code' },
                        { label: 'Author', name: 'author', type: 'text', placeholder: 'eg. Robert C. Martin' },
                        { label: 'Genre',  name: 'genre',  type: 'text', placeholder: 'eg. Computer Science' },
                        { label: 'ISBN',   name: 'isbn',   type: 'text', placeholder: 'eg. ISBN-011' },
                    ].map(field => (
                        <div key={field.name}>
                            <label style={{
                                display: 'block',
                                fontSize: '12px',
                                color: '#9ca3af',
                                marginBottom: '6px',
                                fontWeight: '500',
                            }}>
                                {field.label}
                                <span style={{ color: '#ef4444' }}> *</span>
                            </label>
                            <input
                                type={field.type}
                                name={field.name}
                                value={formData[field.name]}
                                onChange={handleChange}
                                placeholder={field.placeholder}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    borderRadius: '6px',
                                    border: errors[field.name]
                                        ? '1px solid #ef4444'
                                        : '1px solid #2a2a4e',
                                    backgroundColor: '#0f0f23',
                                    color: '#ffffff',
                                    fontSize: '13px',
                                    outline: 'none',
                                }}
                            />
                            {errors[field.name] && (
                                <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>
                                    {errors[field.name]}
                                </p>
                            )}
                        </div>
                    ))}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '10px',
                        marginTop: '8px',
                    }}>
                        <button
                            onClick={handleClose}
                            style={{
                                backgroundColor: 'transparent',
                                border: '1px solid #2a2a4e',
                                color: '#9ca3af',
                                borderRadius: '6px',
                                padding: '8px 16px',
                                fontSize: '13px',
                                cursor: 'pointer',
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={createBook.isPending || updateBook.isPending}
                            style={{
                                backgroundColor: '#4f46e5',
                                border: 'none',
                                color: '#fff',
                                borderRadius: '6px',
                                padding: '8px 16px',
                                fontSize: '13px',
                                cursor: createBook.isPending || updateBook.isPending
                                    ? 'not-allowed' : 'pointer',
                                opacity: createBook.isPending || updateBook.isPending
                                    ? 0.7 : 1,
                            }}
                        >
                            {createBook.isPending || updateBook.isPending
                                ? 'Saving...' : editingId ? 'Update' : 'Save'
                            }
                        </button>
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={isAssignOpen}
                onClose={handleCloseAssign}
                title={`Assign "${selectedBook?.title}"`}
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={{
                            display: 'block',
                            fontSize: '12px',
                            color: '#9ca3af',
                            marginBottom: '6px',
                            fontWeight: '500',
                        }}>
                            Select Student <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <select
                            value={selectedStudent}
                            onChange={(e) => setSelectedStudent(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                borderRadius: '6px',
                                border: '1px solid #2a2a4e',
                                backgroundColor: '#0f0f23',
                                color: selectedStudent ? '#ffffff' : '#6b7280',
                                fontSize: '13px',
                                outline: 'none',
                                cursor: 'pointer',
                            }}
                        >
                            <option value="">-- Choose a student --</option>
                            {students.map(student => (
                                <option key={student.id} value={student.id}>
                                    {student.name} — {student.department}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '10px',
                    }}>
                        <button
                            onClick={handleCloseAssign}
                            style={{
                                backgroundColor: 'transparent',
                                border: '1px solid #2a2a4e',
                                color: '#9ca3af',
                                borderRadius: '6px',
                                padding: '8px 16px',
                                fontSize: '13px',
                                cursor: 'pointer',
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleAssignSave}
                            disabled={!selectedStudent || assignBook.isPending}
                            style={{
                                backgroundColor: '#059669',
                                border: 'none',
                                color: '#fff',
                                borderRadius: '6px',
                                padding: '8px 16px',
                                fontSize: '13px',
                                cursor: !selectedStudent || assignBook.isPending
                                    ? 'not-allowed' : 'pointer',
                                opacity: !selectedStudent || assignBook.isPending
                                    ? 0.7 : 1,
                            }}
                        >
                            {assignBook.isPending ? 'Assigning...' : 'Assign'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}