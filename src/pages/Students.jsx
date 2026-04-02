import { useState,useEffect } from 'react'
import Modal from '../components/Modal'
import {
    useStudents,
    useCreateStudent,
    useUpdateStudent,
    useDeleteStudent,
} from '../hooks/useStudents'
import Pagination from "../components/Pagination.jsx";

const emptyForm = {
    name: '',
    email: '',
    phone: '',
    department: '',
}

export default function Students() {
    const [search, setSearch]         = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [formData, setFormData]     = useState(emptyForm)
    const [editingId, setEditingId]   = useState(null)
    const [errors, setErrors]         = useState({})
    // Pagination + sort state
    const [page,    setPage]    = useState(0)
    const [size,    setSize]    = useState(20)
    const [sortBy,  setSortBy]  = useState('id')
    const [sortDir, setSortDir] = useState('asc')
    //
    // const { students, totalElements, totalPages, isLoading, isError, error }
    //     = useStudents({ page, size, sortBy, sortDir })

    const { students, totalElements, totalPages, isLoading, isError, error }
        = useStudents({ search: debouncedSearch, page, size, sortBy, sortDir })
    const createStudent = useCreateStudent()
    const updateStudent = useUpdateStudent()
    const deleteStudent = useDeleteStudent()


    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(0); // Always reset to page 1 when starting a new search
        }, 500); // Waits 500ms after user stops typing

        return () => clearTimeout(timer); // Cleanup
    }, [search]);



    // Sort column click handler
    const handleSort = (column) => {
        if (sortBy === column) {
            setSortDir(prev => prev === 'asc' ? 'desc' : 'asc')
        } else {
            setSortBy(column)
            setSortDir('asc')
        }
        setPage(0)
        // reset to first page when sorting changes
    }

    // Sort indicator arrow
    const sortArrow = (col) => {
        if (sortBy !== col) return ' ↕'
        return sortDir === 'asc' ? ' ↑' : ' ↓'
    }

        // const filtered = students.filter(s =>
        //     s.name.toLowerCase().includes(search.toLowerCase()) ||
        //     s.department.toLowerCase().includes(search.toLowerCase())
        // )

    const handleOpenAdd = () => {
        setFormData(emptyForm)
        setEditingId(null)
        setErrors({})
        setIsModalOpen(true)
    }

    const handleOpenEdit = (student) => {
        setFormData({
            name:       student.name,
            email:      student.email,
            phone:      student.phone || '',
            department: student.department,
        })
        setEditingId(student.id)
        setErrors({})
        setIsModalOpen(true)
    }

    const handleClose = () => {
        setIsModalOpen(false)
        setFormData(emptyForm)
        setEditingId(null)
        setErrors({})
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
        if (!formData.name.trim())
            newErrors.name = 'Name is required'
        else if (formData.name.length < 2)
            newErrors.name = 'Name must be at least 2 characters'
        if (!formData.email.trim())
            newErrors.email = 'Email is required'
        else if (!/\S+@\S+\.\S+/.test(formData.email))
            newErrors.email = 'Email must be valid'
        if (formData.phone && !/^[0-9]{10}$/.test(formData.phone))
            newErrors.phone = 'Phone must be exactly 10 digits'
        if (!formData.department.trim())
            newErrors.department = 'Department is required'
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSave = () => {
        if (!validate()) return
        if (editingId) {
            updateStudent.mutate(
                { id: editingId, data: formData },
                { onSuccess: () => handleClose() }
            )
        } else {
            createStudent.mutate(formData, {
                onSuccess: () => handleClose(),
            })
        }
    }

    const handleDelete = (id, name) => {
        if (window.confirm(`Delete student "${name}"?`)) {
            deleteStudent.mutate(id)
        }
    }

    if (isLoading) return (
        <div style={{ color: '#9ca3af', padding: '40px', textAlign: 'center' }}>
            Loading students...
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
                {/*<div>*/}
                {/*    <h1 style={{ fontSize: '22px', fontWeight: '600', color: '#fff' }}>*/}
                {/*        Students*/}
                {/*    </h1>*/}
                {/*    <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>*/}
                {/*        {students.length} students total*/}
                {/*    </p>*/}
                {/*</div>*/}

                <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
                    {totalElements} students total
                </p>


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
                    + Add Student
                </button>
            </div>

            <input
                type="text"
                placeholder="Search by name or department..."
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
                    marginBottom: '20px',
                    outline: 'none',
                }}
            />

            <div style={{
                backgroundColor: '#1a1a2e',
                borderRadius: '8px',
                border: '1px solid #2a2a4e',
                overflow: 'hidden',
            }}>
                {/*<div style={{*/}
                {/*    display: 'grid',*/}
                {/*    gridTemplateColumns: '2fr 2fr 1fr 1fr 150px',*/}
                {/*    padding: '12px 16px',*/}
                {/*    borderBottom: '1px solid #2a2a4e',*/}
                {/*    fontSize: '11px',*/}
                {/*    color: '#6b7280',*/}
                {/*    fontWeight: '600',*/}
                {/*    textTransform: 'uppercase',*/}
                {/*    letterSpacing: '0.5px',*/}
                {/*}}>*/}
                {/*    <span>Name</span>*/}
                {/*    <span>Email</span>*/}
                {/*    <span>Phone</span>*/}
                {/*    <span>Department</span>*/}
                {/*    <span>Actions</span>*/}
                {/*</div>*/}

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 2fr 1fr 1fr 150px',
                    padding: '12px 16px',
                    borderBottom: '1px solid #2a2a4e',
                    fontSize: '11px',
                    color: '#6b7280',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                }}>
                    {[
                        { label: 'Name',       col: 'name'       },
                        { label: 'Email',      col: 'email'      },
                        { label: 'Phone',      col: 'phone'      },
                        { label: 'Department', col: 'department' },
                    ].map(h => (
                        <span
                            key={h.col}
                            onClick={() => handleSort(h.col)}
                            style={{ cursor: 'pointer', userSelect: 'none' }}
                        >
      {h.label}{sortArrow(h.col)}
    </span>
                    ))}
                    <span>Actions</span>
                </div>


                {students.length === 0 ? (
                    <div style={{
                        padding: '40px',
                        textAlign: 'center',
                        color: '#6b7280',
                        fontSize: '13px',
                    }}>
                        No students found
                    </div>
                ) : (
                    students.map((student, index) => (
                        <div
                            key={student.id}
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '2fr 2fr 1fr 1fr 150px',
                                padding: '14px 16px',
                                borderBottom: index < students.length - 1
                                    ? '1px solid #2a2a4e' : 'none',
                                fontSize: '13px',
                                alignItems: 'center',
                            }}
                        >
              <span style={{ fontWeight: '500', color: '#fff' }}>
                {student.name}
              </span>
                            <span style={{ color: '#9ca3af' }}>{student.email}</span>
                            <span style={{ color: '#9ca3af' }}>{student.phone || '—'}</span>
                            <span style={{
                                display: 'inline-block',
                                padding: '2px 8px',
                                backgroundColor: '#2a2a4e',
                                borderRadius: '20px',
                                fontSize: '11px',
                                color: '#a5b4fc',
                                width: 'fit-content',
                            }}>
                {student.department}
              </span>
                            <div style={{ display: 'flex', gap: '6px' }}>
                                <button
                                    onClick={() => handleOpenEdit(student)}
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
                                    onClick={() => handleDelete(student.id, student.name)}
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

            <Pagination
                page={page}
                totalPages={totalPages}
                totalElements={totalElements}
                size={size}
                onPageChange={setPage}
                onSizeChange={setSize}
            />

            <Modal
                isOpen={isModalOpen}
                onClose={handleClose}
                title={editingId ? 'Edit Student' : 'Add Student'}
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {[
                        { label: 'Name',       name: 'name',       type: 'text',  placeholder: 'eg. John Smith' },
                        { label: 'Email',      name: 'email',      type: 'email', placeholder: 'eg. john@example.com' },
                        { label: 'Phone',      name: 'phone',      type: 'text',  placeholder: '10 digits (optional)' },
                        { label: 'Department', name: 'department', type: 'text',  placeholder: 'eg. Computer Science' },
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
                                {field.name !== 'phone' &&
                                    <span style={{ color: '#ef4444' }}> *</span>
                                }
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
                            disabled={createStudent.isPending || updateStudent.isPending}
                            style={{
                                backgroundColor: '#4f46e5',
                                border: 'none',
                                color: '#fff',
                                borderRadius: '6px',
                                padding: '8px 16px',
                                fontSize: '13px',
                                cursor: createStudent.isPending || updateStudent.isPending
                                    ? 'not-allowed' : 'pointer',
                                opacity: createStudent.isPending || updateStudent.isPending
                                    ? 0.7 : 1,
                            }}
                        >
                            {createStudent.isPending || updateStudent.isPending
                                ? 'Saving...'
                                : editingId ? 'Update' : 'Save'
                            }
                        </button>
                    </div>
                </div>
            </Modal>

        </div>
    )
}